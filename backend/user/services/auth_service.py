from firebase_admin import auth
from fastapi import HTTPException, Depends, Header
from typing import Optional, Dict

class AuthService:
    """Service for authentication-related operations"""
    
    @staticmethod
    def get_current_user(authorization: Optional[str] = Header(None)) -> Dict:
        """Verify Firebase token and return user info"""
        if not authorization:
            raise HTTPException(
                status_code=401, 
                detail="Authorization header missing"
            )
            
        try:
            # Extract token from Bearer format
            token = authorization.replace("Bearer ", "")
            
            # Verify the token with Firebase
            decoded_token = auth.verify_id_token(token)
            
            # Return user information from the token
            return {
                "uid": decoded_token["uid"],
                "email": decoded_token.get("email", ""),
            }
        except Exception as e:
            raise HTTPException(
                status_code=401, 
                detail=f"Invalid authentication token: {str(e)}"
            )