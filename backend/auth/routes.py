### API ENDPOINTS FOR AUTHENTICATION ###
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer
from firebase_admin import auth, firestore
from firebase_admin.auth import InvalidIdTokenError
from .models import UserCreate, LoginRequest, UserPreferences

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

# Endpoint to get the current user
@router.get("/current_user")
async def get_current_user_data(current_user: dict = Depends(get_current_user)):
    try:
        # Fetch additional user data from Firestore
        user_ref = db.collection("users").document(current_user["uid"])
        user_doc = user_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            print("User data from Firestore:", user_data)  # Debug log
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

# Endpoint to sign up a new user
@router.post("/signup")
async def signup(user: UserCreate):
    try:
        # Create user in Firebase Auth
        firebase_user = auth.create_user(
            email=user.email,
            password=user.password,
            display_name=f"{user.firstName} {user.lastName}"
        )
        
        # Create user in Firestore
        user_data = {
            'firstName': user.firstName,
            'lastName': user.lastName,
            'email': user.email,
            'phone': user.phone,
            'username': user.username,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'preferences_set': False
        }
        db.collection('users').document(firebase_user.uid).set(user_data)
        
        return {"message": "User created successfully", "uid": firebase_user.uid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Endpoint to log in a user
@router.post("/login")
async def login(request: LoginRequest):
    try:
        id_token = request.idToken
        
        if not id_token:
            raise HTTPException(status_code=400, detail="ID token is required")
            
        # Verify the ID token with Firebase Admin SDK
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        email = decoded_token.get('email')
        
        # Check if user exists in Firestore
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        
        if user_doc.exists:
            user_data = user_doc.to_dict()
            preferences_set = user_data.get('preferences_set', False)  # Retrieve preferences_set from Firestore
        else:
            # Create a new user document if they don't exist
            db.collection('users').document(uid).set({
                'email': email,
                'preferences_set': False,
                'createdAt': firestore.SERVER_TIMESTAMP
            })
            preferences_set = False  # Default to False for new users
        
        return {
            "message": "Login successful",
            "uid": uid,
            "email": email,
            "preferences_set": preferences_set
        }
        
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid ID token")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Endpoint to set user preferences
@router.post("/set_preferences")
async def set_preferences(preferences: UserPreferences):
    try:
        # Get user by email
        users_ref = db.collection('users').where('email', '==', preferences.email).limit(1)
        users = users_ref.stream()
        
        user_found = False
        for user in users:
            user_ref = db.collection('users').document(user.id)
            
            # Create a dictionary of sports and their skill levels
            sports_skills_dict = {sport_skill.sport: sport_skill.skill_level for sport_skill in preferences.sports_skills}
            
            # Update user preferences
            user_ref.update({
                'preferences': {
                    'sports_skills': sports_skills_dict
                },
                'preferences_set': True
            })
            user_found = True
            break
            
        if not user_found:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {"message": "Preferences set successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))