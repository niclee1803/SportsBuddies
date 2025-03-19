### API ENDPOINTS FOR AUTHENTICATION ###
from fastapi import APIRouter, HTTPException
from firebase_admin import auth, firestore
from .models import UserCreate, LoginRequest
from dotenv import load_dotenv
import os
import requests
import json

## Load API Keys
load_dotenv()
firebase_api_key = os.getenv("FIREBASE_API_KEY")

## Enable routing
router = APIRouter()

## Initialize Firestore DB
db = firestore.client()

# API ENDPOINTS
### Sign up: takes a UserCreate object and creates a new user in Firebase Auth and Firestore
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


### Login: takes a LoginRequest object and authenticates the user
@router.post("/login")
async def login(request: LoginRequest):
    try:
        # Step 1: Verify the email exists in Firebase
        try:
            user = auth.get_user_by_email(request.email)
        except:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Step 2: Verify password using Firebase Auth REST API
        auth_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={firebase_api_key}"
        payload = {
            "email": request.email,
            "password": request.password,
            "returnSecureToken": True
        }
        
        # Use proper headers for JSON content
        headers = {"Content-Type": "application/json"}
        response = requests.post(auth_url, headers=headers, data=json.dumps(payload))
        auth_data = response.json()
        
        if response.status_code != 200:
            # Log error details for debugging
            print(f"Firebase auth error: {auth_data.get('error', {}).get('message')}")
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Get the ID token from the response
        id_token = auth_data.get("idToken")
        
        if not id_token:
            raise HTTPException(status_code=500, detail="Failed to obtain authentication token")
        
        # Check if user has preferences set
        user_doc = db.collection('users').document(user.uid).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}
        preferences_set = user_data.get('preferences_set', False)
        
        return {
            "message": "Login successful",
            "uid": user.uid,
            "email": user.email,
            "id_token": id_token,
            "preferences_set": preferences_set
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")
    