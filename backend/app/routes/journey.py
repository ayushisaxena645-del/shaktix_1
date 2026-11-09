"""
RAAHI Safe Journey Mode Routes
Timed Checkpoints, Check-in Confirmations, Missed Check-in Escalation
"""

from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException
from ..database import db
from ..models import (
    Journey,
    Checkpoint,
    CheckpointStatus,
    JourneyStatus,
    EscalationAssessment
)
from ..escalation import escalation_engine

router = APIRouter(prefix="/api/journey", tags=["Safe Journey Mode"])


@router.get("/active")
def get_active_journey_info():
    journey = db.get_active_journey()
    checkpoints = db.get_checkpoints()
    return {
        "journey": journey,
        "checkpoints": checkpoints
    }


@router.post("/start", response_model=Journey)
def start_journey(payload: dict):
    now = datetime.now(timezone.utc)
    interval = payload.get("check_in_interval_minutes", 10)
    duration = payload.get("expected_duration_minutes", 30)
    total_chk = max(1, duration // interval)

    journey_id = f"JRN-{uuid.uuid4().hex[:6].upper()}"
    new_journey = Journey(
        journey_id=journey_id,
        user_id="USR-SHAKTIX-AYUSHI",
        origin_name=payload.get("origin_name", "Echelon Campus Main Gate"),
        destination_name=payload.get("destination_name", "Bata Chowk Metro"),
        start_time=now,
        expected_duration_minutes=duration,
        check_in_interval_minutes=interval,
        next_check_in_due=now + timedelta(minutes=interval),
        status=JourneyStatus.ACTIVE,
        current_checkpoint_index=0,
        total_checkpoints=total_chk,
        route_context=payload.get("route_context", "Transit along Faridabad Highway"),
        escalation_level=0
    )
    db.active_journey = new_journey

    # Generate checkpoints
    new_checkpoints: List[Checkpoint] = []
    for i in range(total_chk):
        chk_time = now + timedelta(minutes=interval * (i + 1))
        new_checkpoints.append(
            Checkpoint(
                checkpoint_id=f"CHK-{journey_id}-{i+1}",
                journey_id=journey_id,
                checkpoint_index=i,
                scheduled_time=chk_time,
                status=CheckpointStatus.PENDING,
                grace_period_seconds=60
            )
        )
    db.checkpoints = new_checkpoints
    return new_journey


@router.post("/check-in")
def confirm_safe_check_in(payload: dict):
    """
    User clicks 'I Am Safe' check-in button.
    Marks checkpoint confirmed safe, resets grace period & advances to next checkpoint.
    """
    journey = db.get_active_journey()
    if not journey or journey.status != JourneyStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="No active journey in progress")

    checkpoints = db.get_checkpoints()
    curr_idx = journey.current_checkpoint_index
    now = datetime.now(timezone.utc)

    if curr_idx < len(checkpoints):
        chk = checkpoints[curr_idx]
        chk.status = CheckpointStatus.CONFIRMED_SAFE
        chk.actual_time = now
        chk.response_note = payload.get("note", "User confirmed safe via one-touch check-in.")

    # Advance to next
    next_idx = curr_idx + 1
    if next_idx < len(checkpoints):
        journey.current_checkpoint_index = next_idx
        journey.next_check_in_due = checkpoints[next_idx].scheduled_time
    else:
        # All checkpoints complete
        journey.status = JourneyStatus.COMPLETED

    journey.escalation_level = 0
    return {
        "status": "success",
        "message": "Check-in confirmed. You are safe!",
        "journey": journey,
        "checkpoints": checkpoints
    }


@router.post("/escalate-test")
def simulate_missed_checkpoint_escalation(payload: dict):
    """
    Demonstrate Missed Check-in Escalation:
    - Level 1: Prompt user (Grace countdown)
    - Level 2: Escalate to Trusted Contacts
    - Level 3: Broadcast emergency relay
    Returns deterministic escalation assessment and explainable risk score.
    """
    journey = db.get_active_journey()
    if not journey:
        raise HTTPException(status_code=400, detail="No active journey to escalate")

    checkpoints = db.get_checkpoints()
    curr_idx = journey.current_checkpoint_index
    curr_chk = checkpoints[curr_idx] if curr_idx < len(checkpoints) else checkpoints[-1]

    simulated_level = payload.get("escalation_level", 2)
    connectivity_lost = payload.get("connectivity_lost", True)
    route_dev = payload.get("route_deviation", False)

    journey.escalation_level = simulated_level
    if simulated_level == 1:
        curr_chk.status = CheckpointStatus.GRACE_PERIOD
    elif simulated_level >= 2:
        curr_chk.status = CheckpointStatus.MISSED
        journey.status = JourneyStatus.ESCALATED

    level, assessment = escalation_engine.process_journey_escalation(
        journey,
        curr_chk,
        connectivity_lost=connectivity_lost,
        route_deviation=route_dev
    )

    return {
        "escalation_level": level,
        "journey_status": journey.status,
        "assessment": assessment
    }


@router.post("/end")
def end_journey():
    journey = db.get_active_journey()
    if not journey:
        raise HTTPException(status_code=400, detail="No active journey")

    journey.status = JourneyStatus.COMPLETED
    journey.escalation_level = 0
    return {"status": "completed", "journey_id": journey.journey_id}
