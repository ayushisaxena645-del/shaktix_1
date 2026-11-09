"""
RAAHI Backend Data Models
HERHACK 2026 - Team ShaktiX
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from enum import Enum


def utc_now():
    return datetime.now(timezone.utc)


class EventStatus(str, Enum):
    CREATED = "created"
    BROADCASTING = "broadcasting"
    RELAYED = "relayed"
    DELIVERED = "delivered"
    ACKNOWLEDGED = "acknowledged"
    CANCELLED = "cancelled"


class TriggerType(str, Enum):
    SOS_BUTTON = "sos_button"
    DISCREET_CADENCE = "discreet_cadence"
    MISSED_CHECKPOINT_ESCALATION = "missed_checkpoint_escalation"
    FALL_OR_IMPACT = "fall_or_impact"


class JourneyStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ESCALATED = "escalated"
    CANCELLED = "cancelled"


class CheckpointStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED_SAFE = "confirmed_safe"
    MISSED = "missed"
    GRACE_PERIOD = "grace_period"
    ESCALATED = "escalated"


class LocationModel(BaseModel):
    latitude: float
    longitude: float
    accuracy_meters: Optional[float] = 10.0
    location_name: Optional[str] = "Current Location"
    consent_granted: bool = True
    captured_at: datetime = Field(default_factory=utc_now)


class ConsentRecord(BaseModel):
    user_id: str
    consent_location_emergency: bool = True
    consent_ble_relay: bool = True
    consent_contacts_notify: bool = True
    no_continuous_audio_ack: bool = True
    no_public_tracking_ack: bool = True
    data_retention_days: int = 7
    signed_at: datetime = Field(default_factory=utc_now)


class TrustedContact(BaseModel):
    id: str
    user_id: str
    name: str
    phone: str
    relationship: str
    notify_sms: bool = True
    notify_push: bool = True
    is_opted_in: bool = True
    ack_status: Optional[str] = "idle"  # idle, delivered, acknowledged


class UserProfile(BaseModel):
    id: str
    name: str
    phone: str
    email: str
    institution: str = "Echelon Institute of Technology, Faridabad"
    team: str = "ShaktiX"
    blood_group: Optional[str] = "O+"
    emergency_notes: Optional[str] = "Student Commute Route"
    consent: Optional[ConsentRecord] = None


class Checkpoint(BaseModel):
    checkpoint_id: str
    journey_id: str
    checkpoint_index: int
    scheduled_time: datetime
    actual_time: Optional[datetime] = None
    status: CheckpointStatus = CheckpointStatus.PENDING
    prompt_sent_at: Optional[datetime] = None
    grace_period_seconds: int = 60
    response_note: Optional[str] = None


class Journey(BaseModel):
    journey_id: str
    user_id: str
    origin_name: str
    destination_name: str
    start_time: datetime = Field(default_factory=utc_now)
    expected_duration_minutes: int = 30
    check_in_interval_minutes: int = 10
    next_check_in_due: datetime
    status: JourneyStatus = JourneyStatus.ACTIVE
    current_checkpoint_index: int = 0
    total_checkpoints: int = 3
    route_context: Optional[str] = "Campus Main Gate to Metro Station"
    escalation_level: int = 0  # 0=Normal, 1=Prompting, 2=Contact Alerted, 3=Emergency Mesh


class RelayDevice(BaseModel):
    device_id: str
    device_name: str
    is_opted_in: bool = True
    battery_level: int = 85
    ble_rssi: int = -65
    internet_connected: bool = False
    last_seen: datetime = Field(default_factory=utc_now)


class RelayPacket(BaseModel):
    packet_id: str
    event_id: str
    sender_user_id: str
    sender_name: str
    timestamp_utc: datetime = Field(default_factory=utc_now)
    ttl_minutes: int = 15
    hop_count: int = 0
    max_hops: int = 3
    location: Optional[LocationModel] = None
    trigger_type: TriggerType = TriggerType.SOS_BUTTON
    journey_context: Optional[str] = None
    payload_hash: str
    signature: str
    relay_nodes: List[str] = Field(default_factory=list)


class EmergencyEvent(BaseModel):
    event_id: str
    user_id: str
    user_name: str
    status: EventStatus = EventStatus.CREATED
    trigger_type: TriggerType = TriggerType.SOS_BUTTON
    initial_timestamp: datetime = Field(default_factory=utc_now)
    last_updated: datetime = Field(default_factory=utc_now)
    ttl_minutes: int = 15
    location: Optional[LocationModel] = None
    journey_context: Optional[str] = None
    hop_count: int = 0
    relay_path: List[str] = Field(default_factory=list)
    signature: Optional[str] = None
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    acknowledgement_notes: Optional[str] = None
    is_simulated: bool = False


class EscalationAssessment(BaseModel):
    event_id: Optional[str] = None
    journey_id: Optional[str] = None
    risk_score: int  # 0 to 100
    risk_level: str  # LOW, MODERATE, HIGH, CRITICAL
    missed_checkpoints_count: int
    connectivity_lost: bool
    distress_signal_received: bool
    route_deviation_confirmed: bool
    reasons: List[str]
    recommended_action: str
    safety_disclaimer: str = (
        "RAAHI uses deterministic escalation. A missed check-in indicates lack of confirmation, "
        "not confirmed danger. We do not claim to predict crimes or guarantee safety."
    )


class AcknowledgeRequest(BaseModel):
    event_id: str
    contact_name: str
    contact_phone: Optional[str] = None
    notes: Optional[str] = "Help is on the way. Keep phone active."
