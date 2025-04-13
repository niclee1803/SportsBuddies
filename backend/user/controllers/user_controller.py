from typing import Dict, List, Optional
from fastapi import HTTPException, UploadFile
from user.repositories.user_repository import UserRepository
from user.services.image_service import ImageService
from user.models.user import User
from user.schemas import UserPreferences, UpdateProfileRequest
from firebase_admin import firestore
from fastapi import  HTTPException

class UserController:
    """Controller for user-related operations"""
    
    def __init__(self):
        self.repository = UserRepository()
        self.image_service = ImageService()
        self.db = firestore.client()
        self.users_collection = self.db.collection("users")

    async def get_by_username(self, username: str):
      query = self.users_collection.where("username", "==", username).limit(1).stream()
      docs = list(query)  # Works fine, no need for async
      if not docs:
          return None
      doc = docs[0]
      user_data = doc.to_dict()
      user_data["id"] = doc.id
      return user_data
    
    def get_user(self, user_id: str) -> User:
        """Get user by ID with error handling"""
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    
    def create_user(self, user_id: str, email: str, user_data: Dict) -> Dict:
        """Create new user with proper formatting"""
        # Check if username is already taken
        if self.repository.check_username_exists(user_data['username']):
            raise HTTPException(status_code=400, detail="Username already taken")
            
        # Check if phone is already taken
        if self.repository.check_phone_exists(user_data['phone']):
            raise HTTPException(status_code=400, detail="Phone number already registered")
            
        # Prepare user document
        user_doc = {
            'firstName': user_data['firstName'],
            'lastName': user_data['lastName'],
            'email': email,
            'phone': user_data['phone'],
            'username': user_data['username'],
            'createdAt': firestore.SERVER_TIMESTAMP,
            'preferences_set': False,
            'profilePicUrl': 'https://res.cloudinary.com/dv5hycdyw/image/upload/v1743175966/c9wpqjzvmmspzyeuvxhs.png'
        }
        
        # Create user in repository
        user = self.repository.create(user_id, user_doc)
        
        # Return a serializable response dictionary, not the User object
        return {
            "message": "User created successfully",
            "uid": user_id,
            "username": user_data['username']
        }
    
    def update_profile(self, user_id: str, profile_data: UpdateProfileRequest) -> Dict:
        """Update user profile with validation"""
        # Get current user data
        user = self.get_user(user_id)
        
        # Check if username is already taken (if it's different)
        if user.username != profile_data.username and self.repository.check_username_exists(profile_data.username):
            raise HTTPException(status_code=400, detail="Username already taken")
            
        # Check if phone is already taken (if it's different)
        if user.phone != profile_data.phone and self.repository.check_phone_exists(profile_data.phone):
            raise HTTPException(status_code=400, detail="Phone number already registered")
            
        # Check if email is already taken (if it's different)
        if user.email != profile_data.email and self.repository.check_email_exists(profile_data.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Update user data
        update_data = {
            'firstName': profile_data.first_name,
            'lastName': profile_data.last_name,
            'username': profile_data.username,
            'phone': profile_data.phone,
            'email': profile_data.email,
        }
        
        self.repository.update(user_id, update_data)
        return {"message": "Profile updated successfully"}
    
    def delete_account(self, user_id: str) -> Dict:
        """Delete user account"""
        # First check if user exists
        self.get_user(user_id)
        
        # Delete user
        self.repository.delete(user_id)
        return {"message": "Account deleted successfully"}
    
    def check_username_availability(self, username: str) -> Dict:
        """Check if username is available"""
        exists = self.repository.check_username_exists(username)
        if exists:
            return {"available": False, "message": "Username is already taken"}
        return {"available": True, "message": "Username is available"}
    
    def check_email_availability(self, email: str) -> Dict:
        """Check if email is available"""
        exists = self.repository.check_email_exists(email)
        if exists:
            return {"available": False, "message": "Email is already registered"}
        return {"available": True, "message": "Email is available"}
    
    def check_phone_availability(self, phone: str) -> Dict:
        """Check if phone is available"""
        exists = self.repository.check_phone_exists(phone)
        if exists:
            return {"available": False, "message": "Phone number is already registered"}
        return {"available": True, "message": "Phone number is available"}
    
    def get_preferences(self, user_id: str) -> Dict:
        """Get user preferences"""
        # First check if user exists
        user = self.get_user(user_id)
        
        # Get preferences
        preferences = self.repository.get_preferences(user_id)
        preferences_set = user.preferences_set
        
        if not preferences_set:
            return {"message": "Preferences not set", "preferences": None}
            
        return {
            "preferences": {
                "sports_skills": preferences.get('sports_skills', {})
            }
        }
    
    def save_preferences(self, user_id: str, preferences: UserPreferences) -> Dict:
        """Save user preferences"""
        # First check if user exists
        self.get_user(user_id)
        
        # Format preferences for storage
        preferences_dict = {
            "sports_skills": [skill.dict() for skill in preferences.sports_skills]
        }
        
        # Save preferences
        self.repository.save_preferences(user_id, preferences_dict)
        return {"message": "Preferences saved successfully"}
    
    async def upload_profile_picture(self, user_id: str, file: UploadFile) -> Dict:
        """Upload profile picture and update user profile"""
        # First check if user exists
        self.get_user(user_id)
        
        # Upload image
        profile_pic_url = await self.image_service.upload_profile_picture(file, user_id)
        
        # Update user profile
        self.repository.update(user_id, {"profilePicUrl": profile_pic_url})
        
        return {
            "message": "Profile picture uploaded successfully", 
            "profilePicUrl": profile_pic_url
        }
    

    def get_public_profile(self, user_id: str) -> Dict:
        """Get a user's public profile information."""
        try:
            # Get the user
            user = self.repository.get_by_id(user_id)
            if not user:
                raise HTTPException(status_code=404, detail=f"User {user_id} not found")
            
            # Create response with only required fields - safer approach
            response = {    
                "id": user_id,  
                "username": getattr(user, "username", ""),
                "firstName": getattr(user, "first_name", ""),
                "lastName": getattr(user, "last_name", ""),
                "profilePicUrl": getattr(user, "profile_pic_url", "")
            }
            
            # Get preferences directly from repository
            preferences = self.repository.get_preferences(user_id)
            if preferences:
                # Format preferences correctly - ensure it follows the schema expected by frontend
                response["preferences"] = {
                    "sports_skills": preferences.get("sports_skills", [])
                }
            else:
                # Add empty preferences if none found
                response["preferences"] = {
                    "sports_skills": []
                }
                
            return response
                
        except Exception as e:
            print(f"Error getting public profile: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error retrieving user profile: {str(e)}")