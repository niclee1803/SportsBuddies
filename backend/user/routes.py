from fastapi import APIRouter, HTTPException, Depends, Body, UploadFile, File
from .auth import get_current_user  # Import the get_current_user function
from firebase_admin import firestore, auth
from .models import UserCreate, UserPreferences, UpdateProfileRequest
import requests
import os

# Enable routing
router = APIRouter()

# Initialize Firestore DB
db = firestore.client()

# Load IMGUR_CLIENT_ID from environment variables
IMGUR_CLIENT_ID = os.getenv("IMGUR_CLIENT_ID")

# =================================
# 1. User Authentication Endpoints
# =================================

# Fetch the current user's data from Firebase and Firestore
@router.get("/current_user")
async def get_current_user_data(current_user: dict = Depends(get_current_user)):
    try:
        # Fetch additional user data from Firestore
        user_ref = db.collection("users").document(current_user["uid"])
        user_doc = user_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            return {
                "uid": current_user["uid"],
                "email": current_user["email"],
                "preferences_set": user_data.get("preferences_set", False),
                "firstName": user_data.get("firstName"),
                "lastName": user_data.get("lastName"),
                "username": user_data.get("username"),
                "profilePicUrl": user_data.get("profilePicUrl", "https://placehold.co/150"),
            }
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================
# 2. User Creation Endpoints
# ============================

# Create user in Firestore
@router.post("/create_user")
async def create_user(current_user: dict = Depends(get_current_user), user_data: dict = Body(...)):
    try:
        user_doc = {
            'firstName': user_data.get('firstName'),
            'lastName': user_data.get('lastName'),
            'email': current_user['email'],
            'phone': user_data.get('phone'),
            'username': user_data.get('username'),
            'createdAt': firestore.SERVER_TIMESTAMP,
            'preferences_set': False,
            'profilePicUrl': user_data.get('profilePicUrl', 'https://placehold.co/150')
        }

        db.collection('users').document(current_user['uid']).set(user_doc)

        return {"message": "User created successfully", "uid": current_user['uid']}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ====================================
# 3. User Profile Management Endpoints
# ====================================

# Set user preferences
@router.post("/set_preferences")
async def set_preferences(preferences: UserPreferences, current_user: dict = Depends(get_current_user)):
    try:
        user_ref = db.collection('users').document(current_user["uid"])
        user_doc = user_ref.get()

        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")

        # Create a dictionary of sports and their skill levels
        sports_skills_dict = {sport_skill.sport: sport_skill.skill_level for sport_skill in preferences.sports_skills}

        # Update user preferences
        user_ref.update({
            'preferences': {
                'sports_skills': sports_skills_dict
            },
            'preferences_set': True
        })

        return {"message": "Preferences set successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Update the user's profile details (excluding profile picture)
@router.put("/update_profile")
async def update_profile(
    profile_data: UpdateProfileRequest, 
    current_user: dict = Depends(get_current_user)
):
    try:
        user_ref = db.collection("users").document(current_user["uid"])
        user_doc = user_ref.get()

        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")

        user_ref.update({
            "firstName": profile_data.first_name,
            "lastName": profile_data.last_name,
            "username": profile_data.username,
            "phone": profile_data.phone,
            "email": profile_data.email,
        })

        return {"message": "Profile updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Delete the user account from Firebase and Firestore
@router.delete("/delete_account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    try:
        user_ref = db.collection("users").document(current_user["uid"])
        user_doc = user_ref.get()

        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")

        user_ref.delete()
        auth.delete_user(current_user["uid"])

        return {"message": "Account deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Change the user's profile picture by uploading to Imgur and updating Firestore
@router.post("/upload_profile_picture")
async def upload_profile_picture(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        headers = {"Authorization": f"Client-ID {IMGUR_CLIENT_ID}"}
        files = {"image": file.file}
        response = requests.post("https://api.imgur.com/3/image", headers=headers, files=files)

        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to upload image to Imgur")
            
        data = response.json()
        profile_pic_url = data["data"]["link"]

        user_ref = db.collection("users").document(current_user["uid"])
        user_ref.update({"profilePicUrl": profile_pic_url})

        return {"message": "Profile picture uploaded successfully", "profilePicUrl": profile_pic_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
