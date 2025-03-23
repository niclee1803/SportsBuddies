from fastapi.security import HTTPBearer
from firebase_admin import auth
from fastapi import HTTPException, Depends

# HTTPBearer for token authentication
auth_scheme = HTTPBearer()

# Dependency to get the current user
def get_current_user(token: str = Depends(auth_scheme)):
    """
    Extract and verify the current user's authentication token.

    This function is used as a dependency in FastAPI routes to:
    - Verify the Firebase ID token provided in the Authorization header.
    - Decode the token to extract the user's unique ID (uid) and email.

    Parameters:
    - **token**: The Bearer token extracted from the Authorization header.

    Returns:
    - A dictionary containing the user's `uid` and `email`.

    Raises:
    - **HTTPException (401)**: If the token is invalid or expired.
    - **HTTPException (400)**: For any other errors during token verification.
    """
    try:
        # Extract the token from the Authorization header
        decoded_token = auth.verify_id_token(token.credentials)
        uid = decoded_token["uid"]
        email = decoded_token.get("email")
        return {"uid": uid, "email": email}
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))