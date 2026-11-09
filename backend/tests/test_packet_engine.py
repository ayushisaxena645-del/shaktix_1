"""
Unit tests for RAAHI Packet Engine
Tests: Packet Expiry, Duplicate Prevention, Hop Count Limits, HMAC Integrity
"""

import pytest
from datetime import datetime, timezone, timedelta
from app.packet_engine import PacketEngine
from app.models import LocationModel


def test_packet_creation_and_signature():
    engine = PacketEngine()
    location = LocationModel(latitude=28.3845, longitude=77.3126, accuracy_meters=5.0)
    
    packet = engine.create_packet(
        event_id="EVT-TEST-001",
        sender_user_id="USR-001",
        sender_name="Ayushi",
        location=location,
        ttl_minutes=15
    )

    assert packet.event_id == "EVT-TEST-001"
    assert packet.sender_name == "Ayushi"
    assert packet.hop_count == 0
    assert packet.ttl_minutes == 15
    assert len(packet.signature) == 64  # SHA256 hex digest length

    # Validate the freshly created packet
    is_valid, reason = engine.validate_packet(packet)
    assert is_valid is True
    assert reason == "Valid"


def test_packet_expiry():
    engine = PacketEngine()
    packet = engine.create_packet(
        event_id="EVT-TEST-EXPIRED",
        sender_user_id="USR-001",
        sender_name="Ayushi",
        ttl_minutes=15
    )

    # Force timestamp into the past (20 minutes ago)
    past_time = datetime.now(timezone.utc) - timedelta(minutes=20)
    packet.timestamp_utc = past_time

    assert engine.is_expired(packet) is True
    is_valid, reason = engine.validate_packet(packet)
    assert is_valid is False
    assert "Packet expired" in reason


def test_duplicate_packet_prevention():
    engine = PacketEngine()
    packet = engine.create_packet(
        event_id="EVT-TEST-DUP",
        sender_user_id="USR-001",
        sender_name="Ayushi",
        ttl_minutes=15
    )

    # First relay hop: should succeed
    success, msg, relayed = engine.process_incoming_relay(packet, "DEV-B", "Phone B (Relay)")
    assert success is True
    assert relayed.hop_count == 1
    assert any("Phone B" in node for node in relayed.relay_nodes)

    # Second arrival of same packet: must be rejected as duplicate
    success2, msg2, relayed2 = engine.process_incoming_relay(packet, "DEV-C", "Phone C (Relay)")
    assert success2 is False
    assert "Duplicate packet rejected" in msg2


def test_hop_count_limit_loop_prevention():
    engine = PacketEngine()
    packet = engine.create_packet(
        event_id="EVT-TEST-HOPS",
        sender_user_id="USR-001",
        sender_name="Ayushi",
        ttl_minutes=15
    )
    
    # Set packet hop_count to max limit (3)
    packet.hop_count = 3
    is_valid, reason = engine.validate_packet(packet)
    assert is_valid is False
    assert "Hop limit exceeded" in reason
