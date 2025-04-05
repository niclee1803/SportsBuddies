from typing import Dict, Optional
from user.repositories.alert_repository import AlertRepository
from user.repositories.user_repository import UserRepository
from user.models.alert import Alert, AlertType

class AlertService:
    """Service for managing user alerts."""
    
    def __init__(self):
        self.repository = AlertRepository()
        self.user_repository = UserRepository()
    
    def create_join_request_alert(
        self, 
        creator_id: str,
        requester_id: str,
        activity_id: str,
        activity_name: str
    ) -> Alert:
        """
        Create an alert when a user requests to join an activity.
        Sent TO the activity creator FROM the requester.
        """
        requester = self.user_repository.get_by_id(requester_id)
        if not requester:
            raise ValueError(f"User {requester_id} not found")
        
        requester_name = f"{requester.first_name} {requester.last_name}"
        
        # Create alert for activity creator
        alert = Alert(
            user_id=creator_id,
            type=AlertType.JOIN_REQUEST,
            message=f"{requester_name} wants to join your activity: {activity_name}",
            activity_id=activity_id,
            activity_name=activity_name,
            sender_id=requester_id,
            sender_name=requester_name,
            sender_profile_pic=requester.profile_pic_url
        )
        
        return self.repository.create(alert)
    
    def create_request_response_alert(
        self,
        user_id: str,
        creator_id: str,
        activity_id: str,
        activity_name: str,
        approved: bool
    ) -> Alert:
        """
        Create an alert when a join request is approved/rejected.
        Sent TO the requester FROM the activity creator.
        """
        creator = self.user_repository.get_by_id(creator_id)
        if not creator:
            raise ValueError(f"User {creator_id} not found")
        
        creator_name = f"{creator.first_name} {creator.last_name}"
        
        alert_type = AlertType.REQUEST_APPROVED if approved else AlertType.REQUEST_REJECTED
        message = f"Your request to join {activity_name} was {'approved' if approved else 'rejected'}"
        
        # Create alert for the user who requested to join
        alert = Alert(
            user_id=user_id,
            type=alert_type,
            message=message,
            activity_id=activity_id,
            activity_name=activity_name,
            sender_id=creator_id,
            sender_name=creator_name,
            sender_profile_pic=creator.profile_pic_url
        )
        
        return self.repository.create(alert)
    
    def create_user_left_alert(
        self,
        creator_id: str,
        user_id: str,
        activity_id: str,
        activity_name: str
    ) -> Alert:
        """
        Create an alert when a user leaves an activity.
        Sent TO the activity creator FROM the user who left.
        """
        user = self.user_repository.get_by_id(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        user_name = f"{user.first_name} {user.last_name}"
        
        # Create alert for activity creator
        alert = Alert(
            user_id=creator_id,
            type=AlertType.USER_LEFT,
            message=f"{user_name} has left your activity: {activity_name}",
            activity_id=activity_id,
            activity_name=activity_name,
            sender_id=user_id,
            sender_name=user_name,
            sender_profile_pic=user.profile_pic_url
        )
        
        return self.repository.create(alert)
    
    def create_activity_cancelled_alert(
        self,
        participant_id: str,
        creator_id: str,
        activity_id: str,
        activity_name: str
    ) -> Alert:
        """
        Create an alert when an activity is cancelled.
        Sent TO all participants FROM the creator.
        """
        creator = self.user_repository.get_by_id(creator_id)
        if not creator:
            raise ValueError(f"User {creator_id} not found")
        
        creator_name = f"{creator.first_name} {creator.last_name}"
        
        # Create alert for the participant
        alert = Alert(
            user_id=participant_id,
            type=AlertType.ACTIVITY_CANCELLED,
            message=f"Activity '{activity_name}' has been cancelled by the organizer",
            activity_id=activity_id,
            activity_name=activity_name,
            sender_id=creator_id,
            sender_name=creator_name,
            sender_profile_pic=creator.profile_pic_url
        )
        
        return self.repository.create(alert)
    
    def create_activity_updated_alert(
        self,
        participant_id: str,
        creator_id: str,
        activity_id: str,
        activity_name: str,
        update_details: str
    ) -> Alert:
        """
        Create an alert when an activity is updated.
        Sent TO all participants FROM the creator.
        """
        creator = self.user_repository.get_by_id(creator_id)
        if not creator:
            raise ValueError(f"User {creator_id} not found")
        
        creator_name = f"{creator.first_name} {creator.last_name}"
        
        # Create alert for the participant
        alert = Alert(
            user_id=participant_id,
            type=AlertType.ACTIVITY_UPDATED,
            message=f"Activity '{activity_name}' has been updated: {update_details}",
            activity_id=activity_id,
            activity_name=activity_name,
            sender_id=creator_id,
            sender_name=creator_name,
            sender_profile_pic=creator.profile_pic_url,
            data={"update_details": update_details}
        )
        
        return self.repository.create(alert)
    
    def delete_join_request_alert(
        self,
        creator_id: str,
        requester_id: str,
        activity_id: str
    ) -> bool:
        """
        Delete a join request alert when the request is cancelled.
        This finds and removes alerts where a specific user requested to join a specific activity.
        
        Args:
            creator_id: ID of the activity creator who received the alert
            requester_id: ID of the user who sent the join request
            activity_id: ID of the activity the request was for
            
        Returns:
            True if an alert was found and deleted, False otherwise
        """
        # Find alerts matching these criteria
        alerts_query = self.repository.collection.where("user_id", "==", creator_id)\
                                            .where("sender_id", "==", requester_id)\
                                            .where("activity_id", "==", activity_id)\
                                            .where("type", "==", "join_request")\
                                            .limit(1)
        
        alerts = list(alerts_query.stream())
        if not alerts:
            # No matching alert found
            return False
            
        # Delete the found alert
        alert_id = alerts[0].id
        self.repository.delete(alert_id)
        return True