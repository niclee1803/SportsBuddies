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

# ================= Search & Filter =================
@router.get("/search", summary="Search and filter activities", response_model=List[Dict])
async def search_activities(
    # Text search parameters
    query: Optional[str] = Query(None, description="Search in activity name and description"),
    sport: Optional[str] = Query(None, description="Filter by sport name"),
    skillLevel: Optional[str] = Query(None, description="Filter by skill level"),
    activityType: Optional[str] = Query(None, description="Filter by activity type (event/coaching session)"),
    status: Optional[str] = Query(None, description="Filter by activity status"),
    placeName: Optional[str] = Query(None, description="Search by place name"),
    
    # Date range parameters
    dateFrom: Optional[datetime] = Query(None, description="Filter activities after this date"),
    dateTo: Optional[datetime] = Query(None, description="Filter activities before this date"),
    
    # Location parameters
    latitude: Optional[float] = Query(None, description="Latitude for location-based search"),
    longitude: Optional[float] = Query(None, description="Longitude for location-based search"),
    maxDistance: Optional[float] = Query(None, description="Maximum distance in kilometers for location search"),
    
    # Pagination parameters
    limit: int = Query(50, description="Maximum number of activities to return"),
    start_after: Optional[str] = Query(None, description="Activity ID to start after for pagination"),
    
    # User authentication
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Search for activities with various filtering options.
    - Can search by name/description using the `query` parameter
    - Can filter by sport, skill level, activity type, and status
    - Can filter by date range
    - Can search by location proximity
    - Can search by place name
    
    If no parameters are provided, returns all available activities.
    """
    print(f"Search request received with filters: {query}, {sport}, {skillLevel}")
    # Build filters dictionary
    filters = {}
    
    # Text search filters
    if query:
        filters["query"] = query
    if sport:
        filters["sport"] = sport
    if skillLevel:
        filters["skillLevel"] = skillLevel
    if activityType:
        filters["type"] = activityType
    if status:
        filters["status"] = status
    if placeName:
        filters["placeName"] = placeName
    
    # Date range filters
    if dateFrom:
        filters["dateFrom"] = dateFrom
    if dateTo:
        filters["dateTo"] = dateTo
    
    # Location-based search filters
    if latitude is not None and longitude is not None:
        filters["location"] = {"latitude": latitude, "longitude": longitude}
        # If maxDistance is not specified, use a reasonable default
        filters["maxDistance"] = maxDistance if maxDistance is not None else 50.0
    
    # Pagination parameters
    filters["limit"] = limit
    if start_after:
        filters["start_after"] = start_after
    
    # Call the controller method to handle the search
    return activity_controller.search_and_filter(filters)

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

@router.get("/{user_id}/created", summary="Get user's created activities", response_model=List[Dict])
async def get_my_activities(
    user_id: str = Path(..., description="The user ID of the creator"),
    current_user: dict = Depends(AuthService.get_current_user)
):
    """
    Returns all activities created by the specified user.
    This endpoint is useful for displaying activities on a user's public profile.
    
    The activities are sorted with active ones first, then past/expired activities.
    """
    return activity_controller.get_activities_by_creator(user_id)

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

# ============== Admin Operations ==============

# @router.post("/admin/expire", summary="Run activity expiration job", response_model=Dict)
# async def expire_activities(
#     current_user: dict = Depends(AuthService.get_admin_user)  # Assumes admin middleware
# ):
#     """
#     Administrative endpoint to expire activities with dates in the past.
#     """
#     return activity_controller.run_expire_job()