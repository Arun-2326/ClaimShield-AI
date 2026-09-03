"""
ClaimShield AI - Risk Routing Policy Engine
Determines operational disposition: RELEASE, REVIEW, HOLD_FOR_CORRECTION, or BLOCK_UNTIL_VALID.
"""
from typing import Tuple
from app.config import settings
from app.schemas.common import RiskTier, RoutingDecision

def evaluate_routing_policy(
    risk_score: float,
    model_confidence: float = 0.85
) -> Tuple[RoutingDecision, RiskTier, str]:
    """
    Applies configurable risk thresholds to classify claim into operational action tiers.
    """
    low_max = settings.RISK_THRESHOLD_LOW_MAX       # 0.30
    medium_max = settings.RISK_THRESHOLD_MEDIUM_MAX # 0.70
    min_confidence = settings.MINIMUM_CONFIDENCE_THRESHOLD # 0.55

    if risk_score < low_max:
        if model_confidence < min_confidence:
            return (
                RoutingDecision.REVIEW,
                RiskTier.MEDIUM,
                f"Low predicted denial risk ({risk_score:.1%}), but model confidence ({model_confidence:.1%}) is below threshold ({min_confidence:.1%}). Routed to manual review."
            )
        return (
            RoutingDecision.RELEASE,
            RiskTier.LOW,
            f"Predicted denial risk ({risk_score:.1%}) is below low-risk threshold ({low_max:.1%}). Cleared for automated batch release."
        )

    elif risk_score <= medium_max:
        return (
            RoutingDecision.REVIEW,
            RiskTier.MEDIUM,
            f"Moderate denial risk ({risk_score:.1%}) falls within review band ({low_max:.1%} - {medium_max:.1%}). Assigned to specialist work queue."
        )

    else:
        return (
            RoutingDecision.HOLD_FOR_CORRECTION,
            RiskTier.HIGH,
            f"High predicted denial risk ({risk_score:.1%}) exceeds hold threshold ({medium_max:.1%}). Claim held until corrective actions are satisfied."
        )
