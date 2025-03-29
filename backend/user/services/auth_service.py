from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth

security = HTTPBearer()

class AuthService:
    @staticmethod
    async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
        try:
            token = credentials.credentials
            # Firebase verification code here...
            decoded_token = auth.verify_id_token(token)
            return {"uid": decoded_token["uid"], "email": decoded_token.get("email", "")}
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Invalid authentication token: {str(e)}")