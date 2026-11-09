"""
Unit tests for RAAHI Deterministic Escalation & Explainable Risk Scoring
"""

import pytest
from datetime import datetime, timezone, timedelta
from app.escalation import EscalationEngine
from app.models import Journey, Checkpoint, CheckpointStatus, JourneyStatus


def test_checkpoint_grace_period_and_missed():
    engine = EscalationEngine()
    now = datetime.now(timezone.utc)

    # Checkpoint 30 seconds overdue (Within 60s grace period)
    chk_grace = Checkpoint(
        checkpoint_id="CHK-TEST-1",
        journey_id="JRN-TEST",
        checkpoint_index=0,
        scheduled_time=now - timedelta(seconds=30),
        grace_period_seconds=60
    )
    status, overdue = engine.evaluate_checkpoint_status(chk_grace, current_time=now)
    assert status == CheckpointStatus.GRACE_PERIOD
    assert overdue == 30

    # Checkpoint 90 seconds overdue (Grace period elapsed -> MISSED)
    chk_missed = Checkpoint(
        checkpoint_id="CHK-TEST-2",
        journey_id="JRN-TEST",
        checkpoint_index=0,
        scheduled_time=now - timedelta(seconds=90),
        grace_period_seconds=60
    )
    status2, overdue2 = engine.evaluate_checkpoint_status(chk_missed, current_time=now)
    assert status2 == CheckpointStatus.MISSED
    assert overdue2 == 90


def test_deterministic_escalation_ladder():
    engine = EscalationEngine()
    now = datetime.now(timezone.utc)

    journey = Journey(
        journey_id="JRN-TEST-ESCALATE",
        user_id="USR-AYUSHI",
        origin_name="Campus",
        destination_name="Metro",
        next_check_in_due=now,
        escalation_level=0
    )

    # 1. Missed checkpoint with offline connectivity
    chk_missed = Checkpoint(
        checkpoint_id="CHK-TEST",
        journey_id=journey.journey_id,
        checkpoint_index=1,
        scheduled_time=now - timedelta(minutes=2),
        grace_period_seconds=60
    )

    level, assessment = engine.process_journey_escalation(
        journey,
        chk_missed,
        connectivity_lost=True,
        route_deviation=False
    )

    assert level == 3  # Escalates to level 3 (Mesh Relay) due to offline + missed check-in
    assert journey.status == JourneyStatus.ESCALATED
    assert assessment.risk_level in ["HIGH", "CRITICAL"]
    assert assessment.connectivity_lost is True
    assert len(assessment.reasons) > 0
    # Must include ethical disclaimer
    assert "deterministic" in assessment.safety_disclaimer.lower()


def test_explainable_risk_score():
    engine = EscalationEngine()
    journey = Journey(
        journey_id="JRN-SCORE",
        user_id="USR-1",
        origin_name="A",
        destination_name="B",
        next_check_in_due=datetime.now(timezone.utc)
    )

    # Distress (50) + Missed Checkpoints (30) + Connectivity lost (15) = 95
    assessment = engine.calculate_explainable_risk(
        journey=journey,
        missed_checkpoints=1,
        connectivity_lost=True,
        distress_reported=True,
        route_deviation=False
    )

    assert assessment.risk_score == 95
    assert assessment.risk_level == "CRITICAL"
    assert any("Distress trigger explicitly activated" in r for r in assessment.reasons)
    assert any("Network offline" in r for r in assessment.reasons)
