from pydantic import BaseModel
from typing import List, Dict

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