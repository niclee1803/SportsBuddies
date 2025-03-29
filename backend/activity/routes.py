"""
FastAPI routes for managing activities. Includes creation,
deletion, update, joining, and searching of activities.
"""

from typing import Optional, List, Dict
from fastapi import APIRouter, HTTPException, Depends, Body, Path, Query
from datetime import datetime

# Change relative imports to absolute imports
from activity.controllers.activity_controller import ActivityController
from activity.schemas import ActivityCreate, ActivityUpdate
from activity.models.activity import ActivityStatus, ActivityType, SkillLevel, Location
from user.services.auth_service import AuthService

router = APIRouter()
activity_controller = ActivityController()

# ============== Basic CRUD Operations ==============

@router.post("/", summary="Create a new activity", response_model=Dict)
async def create_activity(
    data: ActivityCreate, 
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Creates a new activity with the given data.
    The current user's ID will be used as the creator_id.
    """
    return activity_controller.create_activity(current_user["uid"], data.dict())

@router.get("/{activity_id}", summary="Get activity details", response_model=Dict)
async def get_activity(
    activity_id: str = Path(..., description="The ID of the activity"),
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Retrieves details of a specific activity.
    """
    activity = activity_controller.repo.get_by_id(activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity.to_dict()

@router.put("/{activity_id}", summary="Update an activity", response_model=Dict)
async def update_activity(
    activity_id: str = Path(..., description="The ID of the activity to update"),
    data: ActivityUpdate = Body(...),
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Updates the specified activity if the current user is the creator.
    """
    return activity_controller.update_activity(
        activity_id, 
        data.dict(exclude_unset=True), 
        current_user["uid"]
    )

@router.delete("/{activity_id}", summary="Delete an activity", response_model=Dict)
async def delete_activity(
    activity_id: str = Path(..., description="The ID of the activity to delete"),
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Deletes the specified activity if the current user is the creator.
    """
    return activity_controller.delete_activity(activity_id, current_user["uid"])

@router.post("/{activity_id}/cancel", summary="Cancel an activity", response_model=Dict)
async def cancel_activity(
    activity_id: str = Path(..., description="The ID of the activity to cancel"),
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Cancels the specified activity if the current user is the creator.
    """
    return activity_controller.cancel_activity(activity_id, current_user["uid"])

# ============== Participant Management ==============

@router.post("/{activity_id}/join", summary="Send join request", response_model=Dict)
async def join_activity(
    activity_id: str = Path(..., description="The ID of the activity to join"),
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Sends a join request to an activity.
    """
    return activity_controller.join_activity(activity_id, current_user["uid"])

@router.post("/{activity_id}/cancel-request", summary="Cancel a join request", response_model=Dict)
async def cancel_join_request(
    activity_id: str = Path(..., description="The ID of the activity"),
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Cancels a pending join request made by the current user.
    """
    return activity_controller.cancel_join_request(activity_id, current_user["uid"])

@router.post("/{activity_id}/approve/{user_id}", summary="Approve a join request", response_model=Dict)
async def approve_join(
    activity_id: str = Path(..., description="The ID of the activity"),
    user_id: str = Path(..., description="The ID of the user to approve"),
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Approves a pending join request.
    """
    return activity_controller.approve_join(activity_id, user_id, current_user["uid"])

@router.post("/{activity_id}/reject/{user_id}", summary="Reject a join request", response_model=Dict)
async def reject_join(
    activity_id: str = Path(..., description="The ID of the activity"),
    user_id: str = Path(..., description="The ID of the user to reject"),
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Rejects a pending join request.
    """
    return activity_controller.reject_join(activity_id, user_id, current_user["uid"])

@router.post("/{activity_id}/remove/{user_id}", summary="Remove a participant", response_model=Dict)
async def remove_participant(
    activity_id: str = Path(..., description="The ID of the activity"),
    user_id: str = Path(..., description="The ID of the user to remove"),
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Removes a participant from an activity.
    """
    return activity_controller.remove_participant(activity_id, user_id, current_user["uid"])

@router.post("/{activity_id}/leave", summary="Leave an activity", response_model=Dict)
async def leave_activity(
    activity_id: str = Path(..., description="The ID of the activity to leave"),
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Allows the current user to leave an activity.
    """
    return activity_controller.leave_activity(activity_id, current_user["uid"])

# ============== Activity Listings & Search ==============

@router.get("/my/created", summary="Get creator's activities", response_model=List[Dict])
async def get_my_activities(
    limit: int = Query(50, description="Maximum number of activities to return"),
    start_after: Optional[str] = Query(None, description="Activity ID to start after for pagination"),
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Returns all activities created by the current user.
    """
    return activity_controller.get_my_activities(current_user["uid"])

@router.get("/my/participating", summary="Get activities I'm participating in", response_model=List[Dict])
async def get_my_participations(
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Returns all activities in which the current user is a participant.
    """
    return activity_controller.get_my_participations(current_user["uid"])

@router.get("/my/requests", summary="Get my pending join requests", response_model=List[Dict])
async def get_my_requests(
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Returns all activities for which the current user has pending join requests.
    """
    return activity_controller.get_my_pending_requests(current_user["uid"])

@router.get("/my/pending-approvals", summary="Get activities with pending approval requests", response_model=List[Dict])
async def get_my_pending_approvals(
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Returns all activities created by the user that have pending join requests.
    """
    return activity_controller.get_creator_pending_requests(current_user["uid"])

@router.get("/search", summary="Search and filter activities", response_model=List[Dict])
async def search_activities(
    sport: Optional[str] = Query(None, description="Filter by sport name"),
    skillLevel: Optional[str] = Query(None, description="Filter by skill level"),
    activityType: Optional[str] = Query(None, description="Filter by activity type"),
    status: Optional[str] = Query(ActivityStatus.AVAILABLE.value, description="Filter by activity status"),
    dateFrom: Optional[datetime] = Query(None, description="Filter activities after this date"),
    dateTo: Optional[datetime] = Query(None, description="Filter activities before this date"),
    latitude: Optional[float] = Query(None, description="Latitude for location-based search"),
    longitude: Optional[float] = Query(None, description="Longitude for location-based search"),
    maxDistance: Optional[float] = Query(None, description="Maximum distance in kilometers for location search"),
    limit: int = Query(50, description="Maximum number of activities to return"),
    start_after: Optional[str] = Query(None, description="Activity ID to start after for pagination"),
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Searches for activities with various filtering options.
    """
    filters = {}
    
    if sport:
        filters["sport"] = sport
    if skillLevel:
        filters["skillLevel"] = skillLevel
    if activityType:
        filters["type"] = activityType
    if status:
        filters["status"] = status
    
    if dateFrom:
        filters["dateFrom"] = dateFrom
    if dateTo:
        filters["dateTo"] = dateTo
    
    if latitude is not None and longitude is not None and maxDistance is not None:
        filters["location"] = {"latitude": latitude, "longitude": longitude}
        filters["maxDistance"] = maxDistance
        
    filters["limit"] = limit
    if start_after:
        filters["start_after"] = start_after
    
    return activity_controller.search_and_filter(filters)

# ============== Admin Operations ==============

# @router.post("/admin/expire", summary="Run activity expiration job", response_model=Dict)
# async def expire_activities(
#     current_user: dict = Depends(AuthService.get_admin_user)  # Assumes admin middleware
# ):
#     """
#     Administrative endpoint to expire activities with dates in the past.
#     """
#     return activity_controller.run_expire_job()