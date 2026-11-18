import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import router
from backend.auth_routes import router as auth_router
from backend.github_routes import router as github_router
from backend.database import init_db, engine
from sqlalchemy import text

app = FastAPI(title="RepoSense AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(router, prefix="/api")
app.include_router(github_router, prefix="/api")


@app.on_event("startup")
def startup():
    init_db()
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ PostgreSQL connected successfully")
    except Exception as e:
        print(f"❌ PostgreSQL connection failed: {e}")


@app.get("/")
def root():
    return {"status": "RepoSense AI backend running"}
