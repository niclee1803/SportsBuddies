from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Path
from typing import Dict

from user.services.auth_service import AuthService
from user.controllers.user_controller import UserController
from user.schemas import UserCreate, UserPreferences, UpdateProfileRequest

# Create router
router = APIRouter()

# Initialize controller
user_controller = UserController()

# Authentication dependency
get_current_user = AuthService.get_current_user

@router.get("/check-username/{username}", summary="Check username availability")
async def check_username(username: str):
    """
    Check if a username already exists in the database.
    """
    return user_controller.check_username_availability(username)

@router.get("/check-email/{email}", summary="Check email availability")
async def check_email(email: str):
    """
    Check if an email already exists in the database.
    """
    return user_controller.check_email_availability(email)

@router.get("/check-phone/{phone}", summary="Check phone number availability")
async def check_phone(phone: str):
    """
    Check if a phone number already exists in the database.
    """
    return user_controller.check_phone_availability(phone)

@router.post("/create_user", summary="Create a new user")
async def create_user(user_data: UserCreate, current_user: Dict = Depends(get_current_user)):
    """
    Create a new user in Firestore with data from registration form.
    """
    return user_controller.create_user(current_user["uid"], current_user["email"], user_data.dict())

@router.get("/current_user", summary="Get current user data")
async def get_current_user_data(current_user: Dict = Depends(get_current_user)):
    """
    Get the current user's data from Firestore.
    """
    user = user_controller.get_user(current_user["uid"])
    return user.to_response_dict()

@router.put("/update_profile", summary="Update user profile")
async def update_profile(profile_data: UpdateProfileRequest, current_user: Dict = Depends(get_current_user)):
    """
    Update the user's profile information.
    """
    return user_controller.update_profile(current_user["uid"], profile_data)

@router.delete("/delete_account", summary="Delete user account")
async def delete_account(current_user: Dict = Depends(get_current_user)):
    """
    Delete the user's account from Firebase and Firestore.
    """
    return user_controller.delete_account(current_user["uid"])

@router.post("/upload_profile_picture", summary="Upload profile picture")
async def upload_profile_picture(file: UploadFile = File(...), current_user: Dict = Depends(get_current_user)):
    """
    Change the user's profile picture by uploading to Cloudinary and updating Firestore.
    """
    return await user_controller.upload_profile_picture(current_user["uid"], file)

@router.post("/set_preferences", summary="Set user preferences")
async def set_preferences(preferences: UserPreferences, current_user: Dict = Depends(get_current_user)):
    """
    Set the user's preferences in Firestore.
    """
    return user_controller.save_preferences(current_user["uid"], preferences)

@router.get("/get_preferences", summary="Get user preferences")
async def get_preferences(current_user: Dict = Depends(get_current_user)):
    """
    Retrieve the user's preferences from Firestore.
    """
    return user_controller.get_preferences(current_user["uid"])

@router.get("/public/{user_id}", summary="Get user's public profile", response_model=Dict)
async def get_public_profile(
    user_id: str = Path(..., description="The user ID"),
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Retrieve basic public information about any user.
    Only returns non-sensitive information (name, username, profile pic, etc.)
    """
    return user_controller.get_public_profile(user_id)