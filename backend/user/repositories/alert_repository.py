from typing import List, Dict, Optional
from firebase_admin import firestore
from user.models.alert import Alert, AlertType
from datetime import datetime

class AlertRepository:
    """Repository for alert operations."""
    
    def __init__(self):
        self.db = firestore.client()
        self.collection = self.db.collection("alerts")
    
    def create(self, alert: Alert) -> Alert:
        """Create a new alert."""
        if not alert.created_at:
            alert.created_at = datetime.now()
            
        doc_ref = self.collection.document()
        alert.id = doc_ref.id
        doc_ref.set(alert.to_dict())
        return alert
    
    def get_by_id(self, alert_id: str) -> Optional[Alert]:
        """Get an alert by ID."""
        doc_ref = self.collection.document(alert_id)
        doc = doc_ref.get()
        if doc.exists:
            return Alert.from_dict(doc.id, doc.to_dict())
        return None
    
    def get_by_user(self, user_id: str, limit: int = 50, 
                    unread_only: bool = False) -> List[Alert]:
        """Get alerts for a specific user, sorted by created_at desc."""
        query = self.collection.where("user_id", "==", user_id)
        
        if unread_only:
            query = query.where("read", "==", False)
            
        query = query.order_by("created_at", direction=firestore.Query.DESCENDING)
        
        if limit:
            query = query.limit(limit)
            
        docs = query.stream()
        return [Alert.from_dict(doc.id, doc.to_dict()) for doc in docs]
    
    def mark_as_read(self, alert_id: str) -> bool:
        """Mark an alert as read."""
        doc_ref = self.collection.document(alert_id)
        doc_ref.update({"read": True})
        return True
    
    def mark_all_as_read(self, user_id: str) -> int:
        """Mark all alerts for a user as read, returns count of updated alerts."""
        batch = self.db.batch()
        unread_alerts = self.collection.where("user_id", "==", user_id).where("read", "==", False).stream()
        
        count = 0
        for doc in unread_alerts:
            batch.update(doc.reference, {"read": True})
            count += 1
            
        if count > 0:
            batch.commit()
        return count
    
    def delete(self, alert_id: str) -> bool:
        """Delete an alert."""
        self.collection.document(alert_id).delete()
        return True
    
    def delete_all_for_user(self, user_id: str) -> int:
        """Delete all alerts for a user, returns count of deleted alerts."""
        batch = self.db.batch()
        alerts = self.collection.where("user_id", "==", user_id).stream()
        
        count = 0
        for doc in alerts:
            batch.delete(doc.reference)
            count += 1
            
        if count > 0:
            batch.commit()
        return count
    
    def get_unread_count(self, user_id: str) -> int:
        """Get count of unread alerts for a user."""
        query = self.collection.where("user_id", "==", user_id).where("read", "==", False)
        return len(list(query.stream()))