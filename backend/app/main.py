import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.config import settings

app = FastAPI(
    title="RepoRescue AI Backend API",
    description="AI-Powered GitHub Repository Understanding & Change Impact Analysis",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Next.js frontend or local dev clients
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)

@app.get("/")
def root():
    return {
        "name": "RepoRescue AI API",
        "status": "online",
        "docs": "/docs",
        "health": "/health"
    }
