"""
RAAHI Deterministic Escalation & Explainable Risk Engine
Safe Journey Checkpoints, Escalation Levels, Explainable Risk Factors
HERHACK 2026 - Team ShaktiX
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, List, Tuple, Optional
from .models import Journey, Checkpoint, CheckpointStatus, JourneyStatus, EscalationAssessment


class EscalationEngine:
    def __init__(self):
        pass

    def evaluate_checkpoint_status(
        self,
        checkpoint: Checkpoint,
        current_time: Optional[datetime] = None
    ) -> Tuple[CheckpointStatus, int]:
        """
        Evaluate checkpoint time status:
        Returns (Status, seconds_overdue)
        """
        if current_time is None:
            current_time = datetime.now(timezone.utc)
        
        sched = checkpoint.scheduled_time
        if sched.tzinfo is None:
            sched = sched.replace(tzinfo=timezone.utc)

        diff_seconds = (current_time - sched).total_seconds()

        if checkpoint.status == CheckpointStatus.CONFIRMED_SAFE:
            return CheckpointStatus.CONFIRMED_SAFE, 0

        if checkpoint.status == CheckpointStatus.MISSED:
            return CheckpointStatus.MISSED, 120

        if checkpoint.status == CheckpointStatus.GRACE_PERIOD:
            return CheckpointStatus.GRACE_PERIOD, 30

        if diff_seconds < 0:
            return CheckpointStatus.PENDING, int(abs(diff_seconds))

        if diff_seconds <= checkpoint.grace_period_seconds:
            return CheckpointStatus.GRACE_PERIOD, int(diff_seconds)

        return CheckpointStatus.MISSED, int(diff_seconds)

    def calculate_explainable_risk(
        self,
        journey: Journey,
        missed_checkpoints: int,
        connectivity_lost: bool,
        distress_reported: bool,
        route_deviation: bool
    ) -> EscalationAssessment:
        """
        Deterministic, explainable risk scoring.
        Does NOT claim crime prediction; strictly aggregates safety response metrics.
        """
        score = 0
        reasons: List[str] = []

        if distress_reported:
            score += 50
            reasons.append("Distress trigger explicitly activated by user.")

        if missed_checkpoints > 0:
            impact = min(missed_checkpoints * 30, 40)
            score += impact
            reasons.append(
                f"User did not respond to {missed_checkpoints} scheduled safety check-in prompt(s) "
                f"after grace period."
            )

        if connectivity_lost:
            score += 15
            reasons.append("Network offline: Sender unable to transmit via standard internet cellular connection.")

        if route_deviation:
            score += 15
            reasons.append("Confirmed transit route deviation flagged by user journey profile.")

        # Cap score at 100
        score = min(score, 100)

        # Risk level determination
        if score >= 75:
            risk_level = "CRITICAL"
            recommended_action = "Initiate immediate BLE mesh relay and push priority alert to Trusted Circle."
        elif score >= 45:
            risk_level = "HIGH"
            recommended_action = "Notify Trusted Circle of unconfirmed checkpoint status with consented location."
        elif score >= 20:
            risk_level = "MODERATE"
            recommended_action = "Emit high-visibility on-screen and audible prompt to user to confirm safety."
        else:
            risk_level = "LOW"
            recommended_action = "Normal monitoring. All checkpoints on schedule."

        return EscalationAssessment(
            journey_id=journey.journey_id,
            risk_score=score,
            risk_level=risk_level,
            missed_checkpoints_count=missed_checkpoints,
            connectivity_lost=connectivity_lost,
            distress_signal_received=distress_reported,
            route_deviation_confirmed=route_deviation,
            reasons=reasons,
            recommended_action=recommended_action
        )

    def process_journey_escalation(
        self,
        journey: Journey,
        current_checkpoint: Checkpoint,
        connectivity_lost: bool = False,
        route_deviation: bool = False
    ) -> Tuple[int, EscalationAssessment]:
        """
        Execute deterministic escalation ladder:
        - Level 0: Safe & on track.
        - Level 1: Checkpoint due / In grace period (Prompt user for 60s).
        - Level 2: Missed check-in (Escalate to Trusted Circle).
        - Level 3: Repeated missed check-in or distress (BLE emergency broadcast).
        """
        status, overdue = self.evaluate_checkpoint_status(current_checkpoint)
        
        missed_count = 0
        distress = False

        if status == CheckpointStatus.GRACE_PERIOD:
            journey.escalation_level = 1
            assessment = self.calculate_explainable_risk(
                journey,
                missed_checkpoints=0,
                connectivity_lost=connectivity_lost,
                distress_reported=False,
                route_deviation=route_deviation
            )
            assessment.reasons.append(
                f"Check-in overdue by {overdue}s. 60-second grace countdown active before escalation."
            )
            return 1, assessment

        elif status == CheckpointStatus.MISSED:
            missed_count = 1
            # If multiple checkpoints missed or combined with connectivity loss
            if journey.escalation_level >= 2 or connectivity_lost:
                journey.escalation_level = 3
                journey.status = JourneyStatus.ESCALATED
            else:
                journey.escalation_level = 2
                journey.status = JourneyStatus.ESCALATED

            assessment = self.calculate_explainable_risk(
                journey,
                missed_checkpoints=missed_count,
                connectivity_lost=connectivity_lost,
                distress_reported=distress,
                route_deviation=route_deviation
            )
            return journey.escalation_level, assessment

        else:
            # Confirmed safe or pending
            journey.escalation_level = 0
            assessment = self.calculate_explainable_risk(
                journey,
                missed_checkpoints=0,
                connectivity_lost=connectivity_lost,
                distress_reported=False,
                route_deviation=False
            )
            return 0, assessment


escalation_engine = EscalationEngine()
