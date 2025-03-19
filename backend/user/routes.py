from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer
from firebase_admin import auth, firestore
from firebase_admin.auth import InvalidIdTokenError
from .models import UserPreferences, UpdateProfileRequest

router = APIRouter()
db = firestore.client()

# HTTPBearer for token authentication
auth_scheme = HTTPBearer()

# Dependency to get the current user
def get_current_user(token: str = Depends(auth_scheme)):
    try:
        # Extract the token from the Authorization header
        decoded_token = auth.verify_id_token(token.credentials)
        uid = decoded_token["uid"]
        email = decoded_token.get("email")
        return {"uid": uid, "email": email}
    except InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

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
            }
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/set_preferences")
async def set_preferences(preferences: UserPreferences, current_user: dict = Depends(get_current_user)):
    try:
        # Use the authenticated user's uid
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


@router.put("/update_profile")
async def update_profile(
    profile_data: UpdateProfileRequest, 
    current_user: dict = Depends(get_current_user)
):
    try:
        # Get the user's Firestore document reference
        user_ref = db.collection("users").document(current_user["uid"])
        user_doc = user_ref.get()

        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")

        # Update the user's profile
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
    

@router.delete("/delete_account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    try:
        # Get the user's Firestore document reference
        user_ref = db.collection("users").document(current_user["uid"])
        user_doc = user_ref.get()

        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")

        # Delete the user's Firestore document
        user_ref.delete()

        # Delete the user's authentication record from Firebase Authentication
        auth.delete_user(current_user["uid"])

        return {"message": "Account deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))