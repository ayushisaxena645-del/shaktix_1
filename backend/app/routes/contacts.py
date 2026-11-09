"""
RAAHI Trusted Circle Routes
"""

from typing import List
import uuid
from fastapi import APIRouter, HTTPException
from ..database import db
from ..models import TrustedContact

router = APIRouter(prefix="/api/contacts", tags=["Trusted Circle"])


@router.get("", response_model=List[TrustedContact])
def get_contacts():
    return db.get_contacts()


@router.post("", response_model=TrustedContact)
def add_contact(contact_data: dict):
    contact = TrustedContact(
        id=f"TC-{uuid.uuid4().hex[:6].upper()}",
        user_id="USR-SHAKTIX-AYUSHI",
        name=contact_data.get("name", "New Contact"),
        phone=contact_data.get("phone", ""),
        relationship=contact_data.get("relationship", "Trusted Contact"),
        notify_sms=contact_data.get("notify_sms", True),
        notify_push=contact_data.get("notify_push", True),
        is_opted_in=True,
        ack_status="idle"
    )
    return db.add_contact(contact)


@router.delete("/{contact_id}")
def delete_contact(contact_id: str):
    success = db.remove_contact(contact_id)
    if not success:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"status": "deleted", "id": contact_id}
