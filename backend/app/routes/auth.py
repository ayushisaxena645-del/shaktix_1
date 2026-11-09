"""
RAAHI Auth & Profile Routes
"""

from fastapi import APIRouter, HTTPException
from ..database import db
from ..models import UserProfile, ConsentRecord

router = APIRouter(prefix="/api/auth", tags=["Auth & Profile"])


@router.get("/profile", response_model=UserProfile)
def get_user_profile():
    return db.get_user()


@router.post("/consent", response_model=ConsentRecord)
def update_consent(consent: ConsentRecord):
    db.update_consent(consent)
    return consent


@router.post("/login-demo")
def demo_login():
    """Returns quick session for demo presentation."""
    user = db.get_user()
    return {
        "status": "success",
        "user_id": user.id,
        "name": user.name,
        "team": user.team,
        "token": "raahi_demo_token_shaktix"
    }
