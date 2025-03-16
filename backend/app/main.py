from fastapi import FastAPI
from app.views.user_view import router as user_router
from app.config import init_firestore

app = FastAPI()
init_firestore()

app.include_router(user_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)