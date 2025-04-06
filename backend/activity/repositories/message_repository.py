from typing import List, Optional
from activity.models.message import Message
from firebase_admin import firestore

class MessageRepository:
    """Repository for message operations."""
    
    def __init__(self):
        self.db = firestore.client()
        self.collection = self.db.collection('messages')
    
    def create(self, message: Message) -> Message:
        """Create a new message."""
        doc_ref = self.collection.document(message.id)
        doc_ref.set(message.to_dict())
        return message
    
    def get_by_activity(self, activity_id: str, limit: int = 50) -> List[Message]:
        """Get messages for a specific activity, sorted by created_at asc."""
        query = (self.collection
                 .where("activity_id", "==", activity_id)
                 .order_by("created_at")
                 .limit(limit))
        
        messages = []
        for doc in query.stream():
            message = Message.from_dict(doc.id, doc.to_dict())
            messages.append(message)
        
        return messages