from datetime import datetime, timezone
from typing import Optional, Dict, Any
import uuid

class Message:
    """Model for messages in activity threads."""
    
    def __init__(
        self,
        id: Optional[str] = None,
        activity_id: str = "",
        sender_id: str = "",
        sender_name: str = "",
        sender_profile_pic: Optional[str] = None,
        content: str = "",
        created_at: datetime = None,
    ):
        self.id = id or str(uuid.uuid4())
        self.activity_id = activity_id
        self.sender_id = sender_id
        self.sender_name = sender_name
        self.sender_profile_pic = sender_profile_pic
        self.content = content
        self.created_at = created_at or datetime.now(timezone.utc)

    @classmethod
    def from_dict(cls, id: str, data: Dict) -> 'Message':
        """Create Message object from Firestore document."""
        return cls(
            id=id,
            activity_id=data.get('activity_id', ''),
            sender_id=data.get('sender_id', ''),
            sender_name=data.get('sender_name', ''),
            sender_profile_pic=data.get('sender_profile_pic'),
            content=data.get('content', ''),
            created_at=data.get('created_at'),
        )

    def to_dict(self) -> Dict:
        """Convert Message object to dictionary for Firestore."""
        return {
            'id': self.id,
            'activity_id': self.activity_id,
            'sender_id': self.sender_id,
            'sender_name': self.sender_name,
            'sender_profile_pic': self.sender_profile_pic,
            'content': self.content,
            'created_at': self.created_at
        }