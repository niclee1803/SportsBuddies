### USER MODELS ###
from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str
    firstName: str
    lastName: str
    phone: str
    username: str

class LoginRequest(BaseModel):
    email: str
    password: str
