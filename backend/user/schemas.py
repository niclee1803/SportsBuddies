from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional

class SportSkill(BaseModel):
    """
    Represents a sport and the user's skill level in that sport.
    """
    sport: str
    skill_level: str
    
    class Config:
        schema_extra = {
            "example": {
                "sport": "Basketball",
                "skill_level": "Intermediate"
            }
        }

class UserCreate(BaseModel):
    """
    Represents the data required to create a new user.
    """
    firstName: str
    lastName: str
    username: str
    phone: str
    
    class Config:
        schema_extra = {
            "example": {
                "firstName": "John",
                "lastName": "Doe",
                "username": "johndoe",
                "phone": "+1234567890"
            }
        }

class UserPreferences(BaseModel):
    """
    Represents the user's preferences, including their sports and skill levels.
    """
    sports_skills: List[SportSkill]
    
    class Config:
        schema_extra = {
            "example": {
                "sports_skills": [
                    {"sport": "Basketball", "skill_level": "Intermediate"},
                    {"sport": "Tennis", "skill_level": "Beginner"}
                ]
            }
        }

class UpdateProfileRequest(BaseModel):
    """
    Represents the data required to update a user's profile.
    """
    first_name: str
    last_name: str
    username: str
    phone: str
    email: str
    
    class Config:
        schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "username": "johndoe",
                "phone": "+1234567890",
                "email": "john.doe@example.com"
            }
        }

class UserResponse(BaseModel):
    """
    Represents the user data sent in API responses.
    """
    firstName: str
    lastName: str
    username: str
    email: str
    phone: str
    profilePicUrl: str
    preferences_set: bool