from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Path, Body
from typing import Dict

from user.services.auth_service import AuthService
from user.controllers.user_controller import UserController
from user.schemas import UserCreate, UserPreferences, UpdateProfileRequest
from user.services.alert_service import AlertService
from user.repositories.alert_repository import AlertRepository
from fastapi import APIRouter, HTTPException, Query


# Create router
router = APIRouter()

# Initialize controller
user_controller = UserController()

# Authentication dependency
get_current_user = AuthService.get_current_user


# Alert service initialisation
alert_service = AlertService()
alert_repository = AlertRepository()

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

@router.get("/lookup", summary="Lookup user by username")
async def lookup_user(username: str = Query(..., description="The username to look up")):
    """
    Given a username, return the user's email (and possibly other fields).
    """
    user_data = await user_controller.get_by_username(username) 
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "email": user_data["email"]
    }

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
    user_data = user.to_response_dict()
    user_data["id"] = current_user["uid"]
    return user_data

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

@router.get("/alerts", summary="Get user alerts")
async def get_alerts(
    limit: int = Query(50, description="Maximum number of alerts to return"),
    unread_only: bool = Query(False, description="Only return unread alerts"),
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Get the current user's alerts/notifications.
    """
    alerts = alert_repository.get_by_user(
        user_id=current_user["uid"],
        limit=limit,
        unread_only=unread_only
    )
    return [alert.to_dict() for alert in alerts]

@router.get("/alerts/count", summary="Get unread alert count")
async def get_unread_alert_count(
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Get count of unread alerts for the current user.
    """
    count = alert_repository.get_unread_count(user_id=current_user["uid"])
    return {"unread_count": count}

@router.post("/alerts/{alert_id}/read", summary="Mark alert as read")
async def mark_alert_as_read(
    alert_id: str = Path(..., description="The alert ID to mark as read"),
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Mark an alert as read.
    """
    # First get the alert to verify it belongs to this user
    alert = alert_repository.get_by_id(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    if alert.user_id != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized to modify this alert")
    
    alert_repository.mark_as_read(alert_id)
    return {"message": "Alert marked as read"}

@router.post("/alerts/read-all", summary="Mark all alerts as read")
async def mark_all_alerts_as_read(
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Mark all of the current user's alerts as read.
    """
    count = alert_repository.mark_all_as_read(user_id=current_user["uid"])
    return {"message": f"{count} alerts marked as read"}

@router.delete("/alerts/{alert_id}", summary="Delete an alert")
async def delete_alert(
    alert_id: str = Path(..., description="The alert ID to delete"),
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Delete an alert.
    """
    # First get the alert to verify it belongs to this user
    alert = alert_repository.get_by_id(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    if alert.user_id != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this alert")
    
    alert_repository.delete(alert_id)
    return {"message": "Alert deleted"}

@router.delete("/alerts", summary="Delete all alerts")
async def delete_all_alerts(
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Delete all of the current user's alerts.
    """
    count = alert_repository.delete_all_for_user(user_id=current_user["uid"])
    return {"message": f"{count} alerts deleted"}


@router.post("/alerts/{alert_id}/respond", summary="Set alert response status")
async def set_alert_response_status(
    alert_id: str = Path(..., description="The alert ID to update"),
    status: str = Body(..., embed=True),
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Set the response status for an alert (accepted/rejected).
    """
    # First get the alert to verify it belongs to this user
    alert = alert_repository.get_by_id(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    if alert.user_id != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized to modify this alert")
    
    # Validate status value
    if status not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'accepted' or 'rejected'")
    
    # Update the status
    alert_repository.set_response_status(alert_id, status)
    
    # Also mark as read
    alert_repository.mark_as_read(alert_id)
    
    return {"message": f"Alert response status set to {status}"}