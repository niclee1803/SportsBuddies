from pydantic import BaseModel
from typing import List, Dict

# Model to handle user creation
class UserCreate(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str
    username: str

class SportSkill(BaseModel):
    sport: str
    skill_level: str

class UserPreferences(BaseModel):
    sports_skills: List[SportSkill]

class UpdateProfileRequest(BaseModel):
    first_name: str
    last_name: str
    username: str
    phone: str
    email: str