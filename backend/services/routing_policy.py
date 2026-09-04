from typing import Tuple
from backend.config import settings

def determine_routing_decision(
    risk_score: float,
    confidence: float,
    is_duplicate: bool = False,
    validation_failed: bool = False
) -> Tuple[str, str, str]:
    """
    Applies configurable RCM policy to determine claim routing tier and action.

    Returns:
    (risk_tier, routing_decision, routing_reason)
    """
    if validation_failed:
        return (
            "error",
            "BLOCK_UNTIL_VALID",
            "Deterministic pre-submission validation failed. Claim transmission blocked until corrected."
        )

    if is_duplicate:
        return (
            "high",
            "BLOCK_UNTIL_VALID",
            "Confirmed duplicate submission candidate detected. Transmission blocked to avoid CARC CO-18 rejection."
        )

    # Risk Tier assignment
    if risk_score < settings.LOW_RISK_MAX:
        tier = "low"
    elif risk_score <= settings.MEDIUM_RISK_MAX:
        tier = "medium"
    else:
        tier = "high"

    # Routing decision logic
    if risk_score < settings.LOW_RISK_MAX:
        if confidence < settings.MINIMUM_CONFIDENCE:
            decision = "REVIEW"
            reason = f"Predicted denial risk is low ({risk_score:.1%}), but model confidence ({confidence:.1%}) is below threshold ({settings.MINIMUM_CONFIDENCE:.0%}). Routed for manual supervisor spot-check."
        else:
            decision = "RELEASE"
            reason = f"Predicted denial risk ({risk_score:.1%}) is below clean claim threshold ({settings.LOW_RISK_MAX:.0%}). Cleared for automated 837 batch release."
    elif risk_score <= settings.MEDIUM_RISK_MAX:
        decision = "REVIEW"
        reason = f"Predicted denial risk ({risk_score:.1%}) falls within medium review band ({settings.LOW_RISK_MAX:.0%}–{settings.MEDIUM_RISK_MAX:.0%}). Requires billing specialist review before release."
    else:
        decision = "HOLD_FOR_CORRECTION"
        reason = f"Predicted denial risk ({risk_score:.1%}) exceeds high-risk threshold ({settings.MEDIUM_RISK_MAX:.0%}). Held for pre-submission clinical/coding correction."

    return tier, decision, reason
