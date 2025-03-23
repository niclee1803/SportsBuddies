from fastapi import APIRouter, HTTPException, Depends, Body, UploadFile, File
from .auth import get_current_user  # Import the get_current_user function
from firebase_admin import firestore, auth
from .models import UserCreate, UserPreferences, UpdateProfileRequest
import requests
import os

# Enable routing
router = APIRouter(
    tags=["User Management"],
    responses={404: {"description": "Not found"}},
)

# Initialize Firestore DB
db = firestore.client()

# Load IMGUR_CLIENT_ID from environment variables
IMGUR_CLIENT_ID = os.getenv("IMGUR_CLIENT_ID")


@router.get("/check-username/{username}", summary="Check username availability")
async def check_username(username: str):
    """
    Check if a username already exists in the database.

    - **username**: The username to check.

    Returns:
    - **available**: Boolean indicating if the username is available.
    - **message**: A message about the availability of the username.
    """
    try:
        users_ref = db.collection('users')
        query = users_ref.where('username', '==', username).limit(1)
        results = query.get()

        if len(results) > 0:
            return {"available": False, "message": "Username is already taken"}

        return {"available": True, "message": "Username is available"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking username: {str(e)}")


@router.get("/check-email/{email}", summary="Check email availability")
async def check_email(email: str):
    """
    Check if an email already exists in the database.

    - **email**: The email address to check.

    Returns:
    - **available**: Boolean indicating if the email is available.
    - **message**: A message about the availability of the email.
    """
    try:
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', email).limit(1)
        results = query.get()

        if len(results) > 0:
            return {"available": False, "message": "Email is already registered"}

        return {"available": True, "message": "Email is available"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking email: {str(e)}")


@router.get("/check-phone/{phone}", summary="Check phone number availability")
async def check_phone(phone: str):
    """
    Check if a phone number already exists in the database.

    - **phone**: The phone number to check.

    Returns:
    - **available**: Boolean indicating if the phone number is available.
    - **message**: A message about the availability of the phone number.
    """
    try:
        users_ref = db.collection('users')
        query = users_ref.where('phone', '==', phone).limit(1)
        results = query.get()

        if len(results) > 0:
            return {"available": False, "message": "Phone number is already registered"}

        return {"available": True, "message": "Phone number is available"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking phone: {str(e)}")


@router.get("/current_user", summary="Get current user data")
async def get_current_user_data(current_user: dict = Depends(get_current_user)):
    """
    Fetch the current user's data from Firebase and Firestore.

    Returns:
    - **uid**: The user's unique ID.
    - **email**: The user's email address.
    - **preferences_set**: Boolean indicating if preferences are set.
    - **firstName**: The user's first name.
    - **lastName**: The user's last name.
    - **username**: The user's username.
    - **profilePicUrl**: The user's profile picture URL.
    """
    try:
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
                "phone": user_data.get("phone"),
                "profilePicUrl": user_data.get("profilePicUrl", "https://placehold.co/150"),
            }
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/create_user", summary="Create a new user")
async def create_user(user_data: UserCreate, current_user: dict = Depends(get_current_user)):
    """
    Create a new user in Firestore.

    - **user_data**: The user data to create the user.
    - **current_user**: The current authenticated user.

    Returns:
    - **message**: Success message.
    - **uid**: The user's unique ID.
    """
    try:
        user_doc = {
            'firstName': user_data.firstName,
            'lastName': user_data.lastName,
            'email': current_user['email'],
            'phone': user_data.phone,
            'username': user_data.username,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'preferences_set': False,
            'profilePicUrl': 'https://placehold.co/150'
        }

        db.collection('users').document(current_user['uid']).set(user_doc)

        return {"message": "User created successfully", "uid": current_user['uid']}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/set_preferences", summary="Set user preferences")
async def set_preferences(preferences: UserPreferences, current_user: dict = Depends(get_current_user)):
    """
    Set the user's preferences.

    - **preferences**: The user's preferences.
    - **current_user**: The current authenticated user.

    Returns:
    - **message**: Success message.
    """
    try:
        user_ref = db.collection('users').document(current_user["uid"])
        user_doc = user_ref.get()

        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")

        sports_skills_dict = {sport_skill.sport: sport_skill.skill_level for sport_skill in preferences.sports_skills}

        user_ref.update({
            'preferences': {
                'sports_skills': sports_skills_dict
            },
            'preferences_set': True
        })

        return {"message": "Preferences set successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/update_profile", summary="Update user profile")
async def update_profile(profile_data: UpdateProfileRequest, current_user: dict = Depends(get_current_user)):
    """
    Update the user's profile details (excluding profile picture).

    - **profile_data**: The updated profile data.
    - **current_user**: The current authenticated user.

    Returns:
    - **message**: Success message.
    """
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


@router.delete("/delete_account", summary="Delete user account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """
    Delete the user's account from Firebase and Firestore.

    - **current_user**: The current authenticated user.

    Returns:
    - **message**: Success message.
    """
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


@router.post("/upload_profile_picture", summary="Upload profile picture")
async def upload_profile_picture(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """
    Change the user's profile picture by uploading to Imgur and updating Firestore.

    - **file**: The image file to upload.
    - **current_user**: The current authenticated user.

    Returns:
    - **message**: Success message.
    - **profilePicUrl**: The URL of the uploaded profile picture.
    """
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