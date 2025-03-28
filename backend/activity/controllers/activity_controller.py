"""
Business logic layer for Activity operations.
"""
import time
from typing import Dict, List
from fastapi import HTTPException
from firebase_admin import firestore
# Change to absolute imports
from activity.repository.activity_repository import ActivityRepository, FirestoreError
from activity.models.activity import Activity, ActivityStatus, Location

class ActivityController:
    """
    Encapsulates the main business logic for creating, updating,
    joining, and searching activities.
    """
    
    def __init__(self):
        self.repo = ActivityRepository()

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
            return {"message": "Join request sent successfully"}
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
    
    def search_and_filter(self, queries: Dict) -> List[Dict]:
        """
        Searches for activities based on given query parameters (sport, skillLevel, etc.).
        """
        try:
            found = self.repo.search_activities(queries)
            return [a.to_dict() for a in found]
        except FirestoreError as e:
            raise HTTPException(status_code=500, detail=str(e))
            
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