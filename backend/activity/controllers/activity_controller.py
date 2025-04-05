"""
Business logic layer for Activity operations.
"""
import time
from datetime import datetime
from typing import Dict, List
from fastapi import HTTPException, UploadFile
from datetime import datetime

from activity.repository.activity_repository import ActivityRepository, FirestoreError
from activity.models.activity import Activity, ActivityStatus, Location
from user.services.image_service import ImageService

from user.services.alert_service import AlertService

class ActivityController:
    """
    Encapsulates the main business logic for creating, updating,
    joining, and searching activities.
    """
    
    def __init__(self):
        self.repo = ActivityRepository()
        self.image_service = ImageService()  
        self.alert_service = AlertService()

    def create_activity(self, creator_id: str, data: Dict) -> Dict:
        """
        Creates a new activity for the given creator user ID.
        Assigns a unique doc_id based on user ID and timestamp.
        """
        doc_id = f'{creator_id}_{int(time.time())}'
        data["creator_id"] = creator_id
        data["status"] = ActivityStatus.AVAILABLE.value
        data["participants"] = []  # Initialize empty participants list
        data["joinRequests"] = []  # Initialize empty join requests list
        
        try:
            self.repo.create(doc_id, data)
            return {"activityId": doc_id, "message": "Activity created successfully"}
        except FirestoreError as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def delete_activity(self, activity_id: str, current_user: str) -> Dict:
        """
        Deletes an existing activity if the current user is the creator.
        """
        activity = self.repo.get_by_id(activity_id)
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
        if activity.creator_id != current_user:
            raise HTTPException(status_code=403, detail="Not authorized to delete this activity")
        
        try:
            self.repo.delete(activity_id)
            return {"message": "Activity deleted successfully"}
        except FirestoreError as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def update_activity(self, activity_id: str, data: Dict, current_user: str) -> Dict:
        """
        Updates an existing activity if the current user is the creator.
        """
        activity = self.repo.get_by_id(activity_id)
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
        if activity.creator_id != current_user:
            raise HTTPException(status_code=403, detail="Not authorized to update this activity")
        
        # Don't allow updating critical fields
        protected_fields = ["creator_id", "participants", "joinRequests", "status"]
        for field in protected_fields:
            if field in data:
                del data[field]
        
        try:
            self.repo.update(activity_id, data)
            return {"message": "Activity updated successfully"}
        except FirestoreError as e:
            raise HTTPException(status_code=500, detail=str(e))    
    
    def join_activity(self, activity_id: str, user_id: str) -> Dict:
        """
        Sends a join request for an activity, pending approval by the creator.
        """
        activity = self.repo.get_by_id(activity_id)
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
        
        if user_id in activity.participants:
            raise HTTPException(status_code=400, detail="You are already a participant in this activity")
        
        if user_id in activity.joinRequests:
            raise HTTPException(status_code=400, detail="You already have a pending request for this activity")
            
        if user_id == activity.creator_id:
            raise HTTPException(status_code=400, detail="You cannot join your own activity as a participant")
            
        if activity.status != ActivityStatus.AVAILABLE:
            raise HTTPException(status_code=400, detail=f"Activity is not available (status: {activity.status.value})")
            
        if activity.is_full():
            raise HTTPException(status_code=400, detail="Activity is already full")
        
        try:
            # Update using transaction for safety
            def update_func(activity):
                if activity.add_join_request(user_id):
                    return {"joinRequests": activity.joinRequests}
                return None
                
            self.repo.update_activity_with_transaction(activity_id, update_func)

            # Create alert for the creator
            self.alert_service.create_join_request_alert(
                creator_id=activity.creator_id,
                requester_id=user_id,
                activity_id=activity_id,
                activity_name=activity.activityName
            )

            return {"message": "Join request sent successfully"}
        except FirestoreError as e:
            raise HTTPException(status_code=500, detail=str(e))
        
    def cancel_join_request(self, activity_id: str, user_id: str) -> Dict:
        """
        Cancels a pending join request made by the user.
        """
        activity = self.repo.get_by_id(activity_id)
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
        
        if user_id not in activity.joinRequests:
            raise HTTPException(status_code=400, detail="You don't have a pending request for this activity")
        
        try:
            # Update using transaction for safety
            def update_func(activity):
                if activity.cancel_join_request(user_id):
                    return {"joinRequests": activity.joinRequests}
                return None
                
            self.repo.update_activity_with_transaction(activity_id, update_func)

            # Delete the join request alert sent to the creator
            self.alert_service.delete_join_request_alert(
                creator_id=activity.creator_id,
                requester_id=user_id,
                activity_id=activity_id
            )

            return {"message": "Join request cancelled successfully"}
        except FirestoreError as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def approve_join(self, activity_id: str, new_user_id: str, current_user: str) -> Dict:
        """
        Approves a join request if called by the activity creator.
        """
        activity = self.repo.get_by_id(activity_id)
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
            
        if activity.creator_id != current_user:
            raise HTTPException(status_code=403, detail="Only the creator can approve join requests")
            
        if new_user_id not in activity.joinRequests:
            raise HTTPException(status_code=400, detail="User does not have a pending join request")
            
        if len(activity.participants) >= activity.maxParticipants:
            raise HTTPException(status_code=400, detail="Activity is already full")
        
        try:
            # Update using transaction for safety
            def update_func(activity):
                if activity.approve_join_request(new_user_id):
                    return {
                        "joinRequests": activity.joinRequests,
                        "participants": activity.participants
                    }
                return None
                
            self.repo.update_activity_with_transaction(activity_id, update_func)

            # Find and update the join request alert
            # Get alerts for the current user that match this activity and sender
            alerts_query = self.alert_service.repository.collection.where("user_id", "==", current_user)\
                                            .where("sender_id", "==", new_user_id)\
                                            .where("activity_id", "==", activity_id)\
                                            .where("type", "==", "join_request")\
                                            .limit(1)
            
            alerts = list(alerts_query.stream())
            if alerts:
                alert_id = alerts[0].id
                # Update the alert status
                self.alert_service.repository.set_response_status(alert_id, "accepted")

            # Create alert for requester
            self.alert_service.create_request_response_alert(
                user_id=new_user_id,
                creator_id=current_user,
                activity_id=activity_id,
                activity_name=activity.activityName,
                approved=True
            )


            return {"message": "Join request approved successfully"}
        except FirestoreError as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def reject_join(self, activity_id: str, user_id: str, current_user: str) -> Dict:
        """
        Rejects a join request if called by the activity creator.
        """
        activity = self.repo.get_by_id(activity_id)
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
            
        if activity.creator_id != current_user:
            raise HTTPException(status_code=403, detail="Only the creator can reject join requests")
            
        if user_id not in activity.joinRequests:
            raise HTTPException(status_code=400, detail="User does not have a pending join request")
        
        try:
            # Update using transaction for safety
            def update_func(activity):
                if activity.reject_join_request(user_id):
                    return {"joinRequests": activity.joinRequests}
                return None
                
            self.repo.update_activity_with_transaction(activity_id, update_func)

            # Find and update the join request alert
            # Get alerts for the current user that match this activity and sender
            alerts_query = self.alert_service.repository.collection.where("user_id", "==", current_user)\
                                            .where("sender_id", "==", new_user_id)\
                                            .where("activity_id", "==", activity_id)\
                                            .where("type", "==", "join_request")\
                                            .limit(1)
            
            alerts = list(alerts_query.stream())
            if alerts:
                alert_id = alerts[0].id
                # Update the alert status
                self.alert_service.repository.set_response_status(alert_id, "accepted")

            # Create alert for requester
            self.alert_service.create_request_response_alert(
                user_id=user_id,
                creator_id=current_user, 
                activity_id=activity_id,
                activity_name=activity.activityName,
                approved=False
            )

            return {"message": "Join request rejected successfully"}
        except FirestoreError as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def remove_participant(self, activity_id: str, user_id: str, current_user: str) -> Dict:
        """
        Removes a participant from an activity if called by the creator.
        """
        activity = self.repo.get_by_id(activity_id)
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
            
        if activity.creator_id != current_user:
            raise HTTPException(status_code=403, detail="Only the creator can remove participants")
            
        if user_id not in activity.participants:
            raise HTTPException(status_code=400, detail="User is not a participant in this activity")
        
        try:
            # Update using transaction for safety
            def update_func(activity):
                if activity.remove_participant(user_id):
                    return {"participants": activity.participants}
                return None
                
            self.repo.update_activity_with_transaction(activity_id, update_func)

            self.alert_service.create_user_removed_alert(
                participant_id=user_id,
                creator_id=current_user,
                activity_id=activity_id,
                activity_name=activity.activityName
            )

            return {"message": "Participant removed successfully"}
        except FirestoreError as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def leave_activity(self, activity_id: str, user_id: str) -> Dict:
        """
        Allows a participant to leave an activity.
        """
        activity = self.repo.get_by_id(activity_id)
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
            
        if user_id == activity.creator_id:
            raise HTTPException(status_code=400, detail="Creator cannot leave their own activity")
            
        if user_id not in activity.participants:
            raise HTTPException(status_code=400, detail="You are not a participant in this activity")
        
        try:
            # Update using transaction for safety
            def update_func(activity):
                if activity.remove_participant(user_id):
                    return {"participants": activity.participants}
                return None
                
            self.repo.update_activity_with_transaction(activity_id, update_func)

            self.alert_service.create_user_left_alert(
                creator_id=activity.creator_id,
                user_id=user_id,
                activity_id=activity_id,
                activity_name=activity.activityName
            )

            return {"message": "Left activity successfully"}
        except FirestoreError as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def cancel_activity(self, activity_id: str, current_user: str) -> Dict:
        """
        Cancels an activity if the current user is the creator.
        """
        activity = self.repo.get_by_id(activity_id)
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
            
        if activity.creator_id != current_user:
            raise HTTPException(status_code=403, detail="Only the creator can cancel this activity")
            
        if activity.status != ActivityStatus.AVAILABLE:
            raise HTTPException(status_code=400, detail=f"Activity is already {activity.status.value}")
        
        try:
            self.repo.update(activity_id, {"status": ActivityStatus.CANCELLED.value})

            # Notify all participants about the cancellation
            for participant_id in activity.participants:
                if participant_id != current_user:
                    self.alert_service.create_activity_cancelled_alert(
                        participant_id=participant_id,
                        creator_id=current_user,
                        activity_id=activity_id,
                        activity_name=activity.activityName
                    )

            return {"message": "Activity cancelled successfully"}
        except FirestoreError as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def get_my_activities(self, user_id: str) -> List[Dict]:
        """
        Retrieves all activities created by the current user.
        """
        try:
            activities = self.repo.list_by_creator(user_id)
            return [a.to_dict() for a in activities]
        except FirestoreError as e:
            raise HTTPException(status_code=500, detail=str(e))
        
    def get_activities_by_creator(self, creator_id: str) -> List[Dict]:
        """
        Gets all activities created by a specific user.
        
        Args:
            creator_id: The user ID of the creator
            
        Returns:
            List of activities as dictionaries
        """
        try:
            # Get activities from repository - we already have list_by_creator
            activities = self.repo.list_by_creator(creator_id)
            
            # Convert to dict before sorting
            activity_dicts = [a.to_dict() for a in activities]
            
            # Sort activities: active first, then expired
            current_time = datetime.now()
            
            # Make sure we handle datetime properly
            def activity_date(activity):
                if not activity["dateTime"]:
                    return current_time  # Default to current time if missing
                
                # Try to parse the date string safely
                try:
                    # If the datetime string has timezone info, convert to naive datetime
                    dt = datetime.fromisoformat(activity["dateTime"].replace('Z', '+00:00'))
                    if dt.tzinfo is not None:
                        dt = dt.replace(tzinfo=None)
                    return dt
                except Exception:
                    # Fall back to current time if parsing fails
                    return current_time
            
            # Sort with active first, expired last
            sorted_activities = sorted(
                activity_dicts,
                key=lambda a: (
                    # Primary sort: active (True) before expired (False)
                    activity_date(a) < current_time,
                    # Secondary sort: 
                    # - For active: newest first
                    # - For expired: oldest first
                    -activity_date(a).timestamp() if activity_date(a) >= current_time else activity_date(a).timestamp()
                )
            )
            
            return sorted_activities
        except Exception as e:
            print(f"Error getting activities by creator: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error retrieving activities: {str(e)}")
    
    def get_my_participations(self, user_id: str) -> List[Dict]:
        """
        Retrieves all activities in which the current user is a participant.
        """
        try:
            activities = self.repo.get_activities_by_participants(user_id)
            return [a.to_dict() for a in activities]
        except FirestoreError as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def get_my_pending_requests(self, user_id: str) -> List[Dict]:
        """
        Retrieves all activities for which the user has pending join requests.
        """
        try:
            activities = self.repo.get_pending_join_requests(user_id)
            return [a.to_dict() for a in activities]
        except FirestoreError as e:
            raise HTTPException(status_code=500, detail=str(e))
        
    def get_creator_pending_requests(self, creator_id: str) -> List[Dict]:
        """
        Gets all pending join requests for activities created by this user.
        Returns activities with the requests and requesters' information.
        """
        try:
            activities = self.repo.get_activities_with_pending_requests(creator_id)
            return [a.to_dict() for a in activities]
        except FirestoreError as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def search_and_filter(self, filters: Dict) -> List[Dict]:
        """
        Searches for activities based on given query parameters.
        
        Args:
            filters: Dictionary containing the filter criteria
                - query: Text to search in name and description
                - sport: Sport to filter by
                - skillLevel: Skill level to filter by
                - type: Activity type to filter by
                - status: Activity status to filter by
                - dateFrom: Filter activities after this date
                - dateTo: Filter activities before this date
                - location: Dict with latitude and longitude
                - maxDistance: Maximum distance in kilometers for location search
                - placeName: Filter by place name
                - limit: Max number of results to return
                - start_after: Activity ID to start after (pagination)
                
        Returns:
            List of activity dictionaries that match the criteria
        """
        try:
            # If no filters provided, return all activities (with limit)
            if not any(k != 'limit' and k != 'start_after' for k in filters.keys()):
                # Default to showing only available activities when no filters are specified
                filters["status"] = ActivityStatus.AVAILABLE.value
                
            found = self.repo.search_activities(filters)
            return [a.to_dict() for a in found]
        except FirestoreError as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error searching activities: {str(e)}")
            
    def run_expire_job(self) -> Dict:
        """
        Administrative method to run the expiration job for activities.
        """
        try:
            processed, expired = self.repo.expire_activities()
            return {
                "message": "Activity expiration job completed",
                "processed": processed,
                "expired": expired
            }
        except FirestoreError as e:
            raise HTTPException(status_code=500, detail=str(e))
        
    #def upload image
    async def upload_banner(self, user_id: str, file: UploadFile):
        try:
            banner_url = await self.image_service.upload_banner_image(file, user_id)
            return {"url": banner_url}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload banner: {str(e)}")   