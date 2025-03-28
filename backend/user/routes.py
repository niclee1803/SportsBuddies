from fastapi import APIRouter, HTTPException, Depends, Body, UploadFile, File
from .auth import get_current_user  # Import the get_current_user function
from firebase_admin import firestore, auth
from .models import UserCreate, UserPreferences, UpdateProfileRequest
import tempfile
import os
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url

# Enable routing
router = APIRouter(
    tags=["User Management"],
    responses={404: {"description": "Not found"}},
)

# Initialize Firestore DB
db = firestore.client()

# Initialise Cloudinary for profile pic storage
load_dotenv()
cloudinary.config( 
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
    secure = True
)


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
    
@router.post("/edit_preferences", summary="Edit user preferences")
async def edit_preferences(preferences: UserPreferences, current_user: dict = Depends(get_current_user)):
    """
    Appends the user's preferences.

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

        # Get existing preferences
        existing_preferences = user_doc.to_dict().get('preferences', {})
        existing_sports_skills = existing_preferences.get('sports_skills', {})

        # Merge new sports skills with existing ones
        new_sports_skills = {sport_skill.sport: sport_skill.skill_level for sport_skill in preferences.sports_skills}
        merged_sports_skills = {**existing_sports_skills, **new_sports_skills}

        # Update the document with merged preferences
        user_ref.update({
            'preferences': {
                'sports_skills': merged_sports_skills
            },
            'preferences_set': True
        })

        return {"message": "Preferences updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    

@router.get("/get_preferences", summary="Get user preferences")
async def get_preferences(current_user: dict = Depends(get_current_user)):
    """
    Retrieve the user's preferences from Firestore.

    - **current_user**: The current authenticated user.

    Returns:
    - **preferences**: The user's preferences.
    """
    try:
        user_ref = db.collection('users').document(current_user["uid"])
        user_doc = user_ref.get()

        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")

        user_data = user_doc.to_dict()
        preferences = user_data.get('preferences', {})
        preferences_set = user_data.get('preferences_set', False)

        if not preferences_set:
            return {"message": "Preferences not set", "preferences": None}

        return {
            "preferences": {
                "sports_skills": preferences.get('sports_skills', {})
            }
        }
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
    Change the user's profile picture by uploading to Cloudinary and updating Firestore.

    - **file**: The image file to upload.
    - **current_user**: The current authenticated user.

    Returns:
    - **message**: Success message.
    - **profilePicUrl**: The URL of the uploaded profile picture.
    """
    try:
        # Read file contents
        contents = await file.read()
        
        # Create a temporary file to pass to Cloudinary
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(contents)
            temp_file_path = temp_file.name
        
        # Upload to Cloudinary with optimizations
        # Use user ID as public_id for easier management
        upload_result = cloudinary.uploader.upload(
            temp_file_path,
            public_id=f"profiles/{current_user['uid']}",  # Organize in profiles folder
            overwrite=True,  # Replace existing image with same ID
            resource_type="image",
            transformation=[
                {"width": 400, "height": 400, "crop": "fill", "gravity": "face"},  # Optimize for profile picture
                {"fetch_format": "auto"},  # Auto-format for best browser compatibility
                {"quality": "auto"}  # Auto-quality optimization
            ]
        )
        
        # Clean up the temporary file
        os.unlink(temp_file_path)
        
        # Get the optimized URL from Cloudinary
        profile_pic_url = upload_result["secure_url"]
        
        # Update user profile in Firestore
        user_ref = db.collection("users").document(current_user["uid"])
        user_ref.update({"profilePicUrl": profile_pic_url})
        
        return {
            "message": "Profile picture uploaded successfully", 
            "profilePicUrl": profile_pic_url
        }
    except Exception as e:
        print(f"Error uploading image: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))