from typing import Dict, List, Optional
from datetime import datetime

class User:
    """Domain model representing a user in the system"""
    
    def __init__(self, uid: str, email: str, first_name: str = "", 
                 last_name: str = "", username: str = "", phone: str = "", 
                 profile_pic_url: str = "", preferences_set: bool = False,
                 created_at: datetime = None):
        self.uid = uid
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.username = username
        self.phone = phone
        self.profile_pic_url = profile_pic_url
        self.preferences_set = preferences_set
        self.preferences = {}
        self.created_at = created_at
        
    @classmethod
    def from_dict(cls, uid: str, data: dict):
        """Create a User object from a Firestore document"""
        return cls(
            uid=uid,
            email=data.get("email", ""),
            first_name=data.get("firstName", ""),
            last_name=data.get("lastName", ""),
            username=data.get("username", ""),
            phone=data.get("phone", ""),
            profile_pic_url=data.get("profilePicUrl", "https://placehold.co/150"),
            preferences_set=data.get("preferences_set", False),
            created_at=data.get("createdAt")
        )
    
    def to_dict(self):
        """Convert User object to dictionary for Firestore"""
        return {
            "email": self.email,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "username": self.username,
            "phone": self.phone,
            "profilePicUrl": self.profile_pic_url,
            "preferences_set": self.preferences_set
        }
        
    def to_response_dict(self):
        """Convert User object to API response dictionary"""
        return {
            "firstName": self.first_name,
            "lastName": self.last_name,
            "username": self.username,
            "email": self.email,
            "phone": self.phone,
            "profilePicUrl": self.profile_pic_url,
            "preferences_set": self.preferences_set
        }


class SportSkillModel:
    """Domain model representing a sport skill"""
    
    def __init__(self, sport: str, skill_level: str):
        self.sport = sport
        self.skill_level = skill_level
        
    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            sport=data.get("sport", ""),
            skill_level=data.get("skill_level", "")
        )
        
    def to_dict(self):
        return {
            "sport": self.sport,
            "skill_level": self.skill_level
        }