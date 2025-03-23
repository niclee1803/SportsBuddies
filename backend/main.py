### MAIN ENTRY POINT FOR THE FASTAPI APP ###
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials

# Initialize Firebase if not already done elsewhere
cred = credentials.Certificate("./firebase_credentials.json")
firebase_admin.initialize_app(cred)

# Import routers from other files
from user.routes import router as user_router
from activity.routes import router as activity_router
##from events.routes import router as events_router

app = FastAPI(title="SportsBuddies API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers from different modules
app.include_router(user_router, prefix="/user", tags=["User"])
app.include_router(activity_router, prefix="/activity", tags=["Activity"])
app.include_router(user_router, prefix="/user", tags=["User Management"])
app.include_router(utils_router, prefix="/utils", tags=["Utilities"])
##app.include_router(activities_router, prefix="/activities", tags=["Activities"])
##app.include_router(events_router, prefix="/events", tags=["Events"])

@app.get("/")
async def root():
    return {"message": "Welcome to the SportsBuddies API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)