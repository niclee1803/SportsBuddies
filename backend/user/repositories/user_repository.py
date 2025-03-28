from firebase_admin import firestore, auth
from typing import Optional, Dict, List
from user.models.user import User
from fastapi import HTTPException

class UserRepository:
    """Repository for user data access operations"""
    
    def __init__(self):
        self.db = firestore.client()
        self.users_collection = self.db.collection('users')
    
    def get_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID from Firestore"""
        doc = self.users_collection.document(user_id).get()
        if not doc.exists:
            return None
        return User.from_dict(user_id, doc.to_dict())
    
    def create(self, user_id: str, user_data: Dict) -> User:
        """Create new user in Firestore"""
        self.users_collection.document(user_id).set(user_data)
        return User.from_dict(user_id, user_data)
    
    def update(self, user_id: str, data: Dict) -> bool:
        """Update user data in Firestore"""
        self.users_collection.document(user_id).update(data)
        return True
    
    def delete(self, user_id: str) -> bool:
        """Delete user from Firestore and Auth"""
        self.users_collection.document(user_id).delete()
        auth.delete_user(user_id)
        return True
    
    def check_username_exists(self, username: str) -> bool:
        """Check if username exists in database"""
        query = self.users_collection.where('username', '==', username).limit(1)
        results = query.get()
        return len(results) > 0
    
    def check_email_exists(self, email: str) -> bool:
        """Check if email exists in database"""
        query = self.users_collection.where('email', '==', email).limit(1)
        results = query.get()
        return len(results) > 0
    
    def check_phone_exists(self, phone: str) -> bool:
        """Check if phone exists in database"""
        query = self.users_collection.where('phone', '==', phone).limit(1)
        results = query.get()
        return len(results) > 0
        
    def get_preferences(self, user_id: str) -> Dict:
        """Get user preferences from Firestore"""
        doc = self.users_collection.document(user_id).get()
        if not doc.exists:
            return None
            
        user_data = doc.to_dict()
        return user_data.get('preferences', {})
        
    def save_preferences(self, user_id: str, preferences: Dict) -> bool:
        """Save user preferences to Firestore"""
        self.users_collection.document(user_id).update({
            'preferences': preferences,
            'preferences_set': True
        })
        return True