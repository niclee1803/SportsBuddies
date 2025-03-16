from fastapi import APIRouter
from app.controllers.user_controller import get_all_users, add_user
from app.models.user import UserModel

router = APIRouter()

@router.get("/users")
async def get_users():
    return get_all_users()

@router.post("/users")
async def create_user(user: UserModel):
    return add_user(user)