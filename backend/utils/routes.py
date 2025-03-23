from fastapi import APIRouter, HTTPException
import json
import os
from typing import List
from firebase_admin import firestore

# Initialize the FastAPI router
router = APIRouter(
    tags=["Utilities"],  # Use a different tag for utility endpoints
    responses={404: {"description": "Not found"}},
)

# Initialize Firestore DB
db = firestore.client()

# Path to the GeoJSON file
GEOJSON_PATH = os.path.join(
    os.path.dirname(__file__), 
    "SportSGSportFacilitiesGEOJSON.geojson"
)

# Load the GeoJSON file at startup
try:
    with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
        FACILITIES_GEOJSON = json.load(f)
except Exception as e:
    # If there's an error reading/parsing the file at startup
    FACILITIES_GEOJSON = None
    print(f"Error loading GeoJSON file: {e}")


@router.get("/facilities_geojson", summary="Get facilities GeoJSON data")
def get_facilities_geojson():
    """
    Return the GeoJSON data for sports facilities.

    This endpoint provides the GeoJSON data for sports facilities, which can be used
    to display facility locations on a map.

    Returns:
    - The GeoJSON data as a dictionary.

    Raises:
    - **HTTPException (500)**: If the GeoJSON file could not be loaded.
    """
    if not FACILITIES_GEOJSON:
        # If the file was not loaded successfully, raise an error
        raise HTTPException(status_code=500, detail="GeoJSON data not available.")
    return FACILITIES_GEOJSON


@router.get("/sports_list", response_model=List[str], summary="Get list of sports")
async def get_sports_list():
    """
    Return a list of all sports from Firestore.

    This endpoint fetches the list of sports from the Firestore database.

    Returns:
    - A sorted list of sports as strings.

    Raises:
    - **HTTPException (404)**: If the sports document does not exist or the list is empty.
    - **HTTPException (500)**: If there is an error fetching the data from Firestore.
    """
    try:
        # Reference the 'types' document in the 'sports' collection
        sports_doc_ref = db.collection('sports').document('types')
        sports_doc = sports_doc_ref.get()
        
        if not sports_doc.exists:
            print("Sports document 'types' not found")
            raise HTTPException(
                status_code=404, 
                detail="Sports list not found in database"
            )
        
        sports_data = sports_doc.to_dict()
        
        if 'sports' in sports_data and isinstance(sports_data['sports'], list):
            sports_list = sports_data['sports']
        else:
            print("No sports list found in document")
            raise HTTPException(
                status_code=404, 
                detail="Sports list not found in the database document"
            )
        
        if not sports_list:
            raise HTTPException(
                status_code=404, 
                detail="Sports list is empty"
            )
        
        # Sort the list alphabetically
        sports_list.sort()
        return sports_list
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching sports list from Firestore: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to retrieve sports list: {str(e)}"
        )