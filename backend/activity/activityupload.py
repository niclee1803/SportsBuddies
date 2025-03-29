from fastapi import APIRouter, UploadFile, File, Form, Depends
from fastapi.responses import JSONResponse
from user.services.auth_service import AuthService

router = APIRouter()

@router.post("/activity/upload", summary="Upload activity via form data")
async def upload_activity(
    activityName: str = Form(...),
    date: str = Form(...),
    time: str = Form(...),
    sport: str = Form(...),
    skillLevel: str = Form(...),
    role: str = Form(...),
    activityDescription: str = Form(...),
    maxParticipants: str = Form(...),
    location: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    banner: UploadFile = File(None),
    current_user: dict = Depends(AuthService.get_current_user)
):
    print("Received upload:", {
        "activityName": activityName,
        "coords": (latitude, longitude),
        "user": current_user["uid"],
    })

    return JSONResponse(content={"success": True, "message": "Upload successful!"})
