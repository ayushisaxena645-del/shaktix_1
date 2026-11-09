"""
RAAHI Emergency SOS Routes
"""

from typing import List, Optional
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from ..database import db
from ..models import (
    EmergencyEvent,
    EventStatus,
    TriggerType,
    LocationModel,
    AcknowledgeRequest
)
from ..packet_engine import packet_engine

router = APIRouter(prefix="/api/emergency", tags=["Emergency SOS"])


@router.post("/trigger", response_model=EmergencyEvent)
def trigger_emergency(payload: dict):
    """
    Initiate emergency event.
    Triggered either directly via SOS button, discreet cadence, or safe journey escalation.
    """
    user = db.get_user()
    event_id = f"RAAHI-EVT-{uuid.uuid4().hex[:8].upper()}"
    now_utc = datetime.now(timezone.utc)

    # Consent-checked location
    location_data = payload.get("location")
    location = None
    if location_data and user.consent and user.consent.consent_location_emergency:
        location = LocationModel(
            latitude=location_data.get("latitude", 28.3845),
            longitude=location_data.get("longitude", 77.3126),
            accuracy_meters=location_data.get("accuracy_meters", 8.5),
            location_name=location_data.get("location_name", "Near Echelon Campus, Faridabad"),
            consent_granted=True,
            captured_at=now_utc
        )

    trigger_type = TriggerType(payload.get("trigger_type", "sos_button"))
    journey = db.get_active_journey()
    journey_context = journey.route_context if journey else "Individual Commute"

    # Create signed packet
    packet = packet_engine.create_packet(
        event_id=event_id,
        sender_user_id=user.id,
        sender_name=user.name,
        location=location,
        journey_context=journey_context,
        ttl_minutes=payload.get("ttl_minutes", 15),
        trigger_type=trigger_type.value
    )

    event = EmergencyEvent(
        event_id=event_id,
        user_id=user.id,
        user_name=user.name,
        status=EventStatus.BROADCASTING,  # Started broadcasting locally via BLE / Network
        trigger_type=trigger_type,
        initial_timestamp=now_utc,
        last_updated=now_utc,
        ttl_minutes=payload.get("ttl_minutes", 15),
        location=location,
        journey_context=journey_context,
        hop_count=0,
        relay_path=[f"{user.name} (Source)"],
        signature=packet.signature,
        is_simulated=payload.get("is_simulated", False)
    )

    db.create_emergency_event(event)
    return event


@router.get("/events", response_model=List[EmergencyEvent])
def list_emergency_events():
    return db.list_events()


@router.get("/event/{event_id}", response_model=EmergencyEvent)
def get_emergency_event(event_id: str):
    event = db.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Emergency event not found")
    return event


@router.post("/acknowledge", response_model=EmergencyEvent)
def acknowledge_emergency(req: AcknowledgeRequest):
    """
    Emergency Contact or Campus Admin marks alert as acknowledged.
    Sends confirmation back to sender and updates live status.
    """
    event = db.get_event(req.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Emergency event not found")

    now_utc = datetime.now(timezone.utc)
    event.status = EventStatus.ACKNOWLEDGED
    event.acknowledged_by = req.contact_name
    event.acknowledged_at = now_utc
    event.acknowledgement_notes = req.notes
    event.last_updated = now_utc

    # Update contact ack status
    for c in db.contacts.values():
        if req.contact_name.lower() in c.name.lower():
            c.ack_status = "acknowledged"

    return event


@router.post("/cancel/{event_id}", response_model=EmergencyEvent)
def cancel_emergency(event_id: str):
    """
    User controlled cancellation (e.g. false alarm or safe arrival).
    """
    event = db.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Emergency event not found")

    now_utc = datetime.now(timezone.utc)
    event.status = EventStatus.CANCELLED
    event.last_updated = now_utc
    return event
