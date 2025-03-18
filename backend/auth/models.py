### USER MODELS ###
from pydantic import BaseModel
from typing import List, Dict

class UserCreate(BaseModel):
    email: str
    password: str
    firstName: str
    lastName: str
    phone: str
    username: str

class LoginRequest(BaseModel):
    idToken: str

class SportSkill(BaseModel):
    sport: str
    skill_level: str

class UserPreferences(BaseModel):
    email: str
    sports_skills: List[SportSkill]