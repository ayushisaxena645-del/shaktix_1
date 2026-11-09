"""
RAAHI - Resilient Assistance and Emergency Handoff Intelligence
HERHACK 2026 - Team ShaktiX
Members: Priyal, Pavani, Ayushi Saxena
Institution: Echelon Institute of Technology, Faridabad
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, contacts, emergency, relay, journey, dashboard

app = FastAPI(
    title="RAAHI - Resilient Assistance and Emergency Handoff Intelligence",
    description=(
        "Offline-first, privacy-focused safety API with BLE mesh packet relay, "
        "Safe Journey timed checkpoints, and deterministic escalation for HERHACK 2026 by Team ShaktiX."
    ),
    version="1.0.0"
)

# Enable CORS for local Vite development & cross-device testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(contacts.router)
app.include_router(emergency.router)
app.include_router(relay.router)
app.include_router(journey.router)
app.include_router(dashboard.router)


@app.get("/")
def read_root():
    return {
        "project": "RAAHI",
        "tagline": "When the network fails, your safety network doesn't.",
        "hackathon": "HERHACK 2026",
        "team": "ShaktiX",
        "members": ["Priyal", "Pavani", "Ayushi Saxena"],
        "institution": "Echelon Institute of Technology, Faridabad",
        "docs_url": "/docs",
        "status": "online"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RAAHI Mesh Safety Backend",
        "version": "1.0.0"
    }
