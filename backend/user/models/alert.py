from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from enum import Enum

class AlertType(str, Enum):
    JOIN_REQUEST = "join_request"
    REQUEST_APPROVED = "request_approved"
    REQUEST_REJECTED = "request_rejected"
    USER_LEFT = "user_left"
    ACTIVITY_CANCELLED = "activity_cancelled"
    ACTIVITY_UPDATED = "activity_updated"
    NEW_MESSAGE = "new_message"

class Alert:
    """Model for user notifications/alerts."""
    
    def __init__(
        self,
        id: Optional[str] = None,
        user_id: str = "",
        type: AlertType = AlertType.JOIN_REQUEST,
        message: str = "",
        activity_id: Optional[str] = None,
        activity_name: Optional[str] = None,
        sender_id: Optional[str] = None,
        sender_name: Optional[str] = None,
        sender_profile_pic: Optional[str] = None,
        created_at: datetime = None,
        read: bool = False,
        data: Dict[str, Any] = None
    ):
        self.id = id
        self.user_id = user_id  # ID of user receiving the alert
        self.type = type
        self.message = message
        self.activity_id = activity_id
        self.activity_name = activity_name
        self.sender_id = sender_id  # ID of user who triggered the alert
        self.sender_name = sender_name
        self.sender_profile_pic = sender_profile_pic
        self.created_at = created_at or datetime.now(timezone.utc)
        self.read = read
        self.data = data or {}  # Additional data specific to alert type
    
    @classmethod
    def from_dict(cls, id: str, data: Dict) -> 'Alert':
        """Create Alert object from Firestore document."""
        return cls(
            id=id,
            user_id=data.get('user_id', ''),
            type=data.get('type', AlertType.JOIN_REQUEST),
            message=data.get('message', ''),
            activity_id=data.get('activity_id'),
            activity_name=data.get('activity_name'),
            sender_id=data.get('sender_id'),
            sender_name=data.get('sender_name'),
            sender_profile_pic=data.get('sender_profile_pic'),
            created_at=data.get('created_at'),
            read=data.get('read', False),
            data=data.get('data', {})
        )
    
    def to_dict(self) -> Dict:
        """Convert Alert object to dictionary for Firestore."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'message': self.message,
            'activity_id': self.activity_id,
            'activity_name': self.activity_name,
            'sender_id': self.sender_id,
            'sender_name': self.sender_name,
            'sender_profile_pic': self.sender_profile_pic,
            'created_at': self.created_at,
            'read': self.read,
            'data': self.data
        }