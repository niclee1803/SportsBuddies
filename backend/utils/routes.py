# utils/routes.py
from fastapi import APIRouter, HTTPException
import json
import os

router = APIRouter()

# Option A: Load the file once at startup
#          (Good for static data, faster subsequent responses)
GEOJSON_PATH = os.path.join(
    os.path.dirname(__file__), 
    "SportSGSportFacilitiesGEOJSON.geojson"
)
try:
    with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
        FACILITIES_GEOJSON = json.load(f)
except Exception as e:
    # If there's an error reading/parsing the file at startup
    FACILITIES_GEOJSON = None
    print(f"Error loading GeoJSON file: {e}")

@router.get("/facilities_geojson")
def get_facilities_geojson():
    """
    Return the GeoJSON data for sports facilities.
    """
    if not FACILITIES_GEOJSON:
        # If the file was not loaded successfully, raise an error
        raise HTTPException(status_code=500, detail="GeoJSON data not available.")
    return FACILITIES_GEOJSON
