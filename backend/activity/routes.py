from fastapi import APIRouter, HTTPException, Depends, Body
from user.auth import get_current_user  # Import the get_current_user function
from firebase_admin import firestore
import time



router = APIRouter()
db = firestore.client()

@router.post("/upload")
async def upload_activity(
    activity: dict = Body(...), 
    current_user: dict = Depends(get_current_user)
):
    try:
        # Validate required fields
        required_fields = [
            "activityName", "date", "time", "location", 
            "sport", "skillLevel", "visibility", 
            "activityDescription", "tags", "maxParticipants"
        ]
        for field in required_fields:
            if field not in activity:
                raise HTTPException(status_code=400, detail=f"Missing field: {field}")

        # Create activity data
        activity_data = {
            "activityName": activity["activityName"],
            "date": activity["date"],
            "time": activity["time"],
            "location": activity["location"],
            "sport": activity["sport"],
            "skillLevel": activity["skillLevel"],
            "visibility": activity["visibility"],
            "activityDescription": activity["activityDescription"],
            "tags": activity["tags"],
            "maxParticipants": activity["maxParticipants"],
            "createdBy": current_user["uid"],
            "createdAt": firestore.SERVER_TIMESTAMP,
        }

        # Add document to Firestore with the userid and time
        doc_id = f'{current_user["uid"]}_{int(time.time())}'
        db.collection("activities").document(doc_id).set(activity_data)

        #new_activity_ref = db.collection("activities").document()
        #new_activity_ref.set(activity_data)

        return {
            "success": True,
            "message": "Activity uploaded successfully",
            "activityId": doc_id.id,
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
