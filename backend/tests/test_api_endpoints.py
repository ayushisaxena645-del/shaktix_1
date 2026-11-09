"""
Integration & route tests for RAAHI FastAPI Application
Tests: SOS Creation, Packet Relay, Duplicate Rejection, Acknowledgment, Safe Journey
"""

import pytest
from app.main import read_root, health_check
from app.routes.emergency import trigger_emergency, acknowledge_emergency, get_emergency_event
from app.routes.relay import receive_relayed_packet, simulate_multi_hop_step
from app.routes.journey import confirm_safe_check_in, simulate_missed_checkpoint_escalation
from app.models import AcknowledgeRequest, RelayPacket
from app.database import db
from fastapi import HTTPException


@pytest.fixture(autouse=True)
def reset_db():
    db.reset_to_demo_state()
    yield


def test_root_and_health():
    root = read_root()
    assert root["project"] == "RAAHI"
    assert root["team"] == "ShaktiX"
    assert "Ayushi Saxena" in root["members"]

    health = health_check()
    assert health["status"] == "healthy"


def test_emergency_trigger_and_acknowledgement():
    # 1. Trigger SOS
    payload = {
        "trigger_type": "discreet_cadence",
        "ttl_minutes": 15,
        "location": {
            "latitude": 28.3845,
            "longitude": 77.3126,
            "location_name": "Faridabad Bypass"
        }
    }
    event = trigger_emergency(payload)
    assert event.status.value == "broadcasting"
    assert "ShaktiX" in event.user_name
    assert event.location.latitude == 28.3845

    # 2. Acknowledge by Trusted Contact
    ack_req = AcknowledgeRequest(
        event_id=event.event_id,
        contact_name="Priyal",
        notes="Help is on the way. Priyal acknowledged alert."
    )
    ack_event = acknowledge_emergency(ack_req)
    assert ack_event.status.value == "acknowledged"
    assert ack_event.acknowledged_by == "Priyal"


def test_safe_journey_checkin_and_escalation():
    # Safe check-in
    res = confirm_safe_check_in({"note": "Boarded bus"})
    assert res["status"] == "success"
    assert "You are safe" in res["message"]

    # Missed checkpoint escalation simulation
    esc_res = simulate_missed_checkpoint_escalation({
        "escalation_level": 2,
        "connectivity_lost": True
    })
    assert esc_res["escalation_level"] >= 2
    assert esc_res["assessment"].risk_score > 0
    assert len(esc_res["assessment"].reasons) > 0


def test_relay_packet_duplicate_and_delivery():
    # Trigger event
    event = trigger_emergency({"trigger_type": "sos_button"})

    # Prepare packet
    packet = RelayPacket(
        packet_id=f"PKT-{event.event_id}-DEMO",
        event_id=event.event_id,
        sender_user_id="USR-SHAKTIX-01",
        sender_name="ShaktiX Member",
        timestamp_utc=event.initial_timestamp,
        ttl_minutes=15,
        hop_count=0,
        max_hops=3,
        payload_hash="demohash",
        signature=event.signature or "SIM_SIG",
        relay_nodes=["ShaktiX"]
    )

    # 1. First reception
    res = receive_relayed_packet(packet, forwarder_device_id="DEV-C")
    assert res["status"] == "success"
    assert res["hop_count"] == 1
    assert res["delivery_status"].value == "delivered"

    # 2. Duplicate rejection
    with pytest.raises(HTTPException) as exc_info:
        receive_relayed_packet(packet, forwarder_device_id="DEV-C")
    assert exc_info.value.status_code == 400
    assert "Duplicate packet rejected" in exc_info.value.detail
