"""
ClaimShield AI - Corrective Action Recommendation Engine
Prescribes clear, actionable billing-team workflows to fix preventable claim flaws.
"""
from typing import Dict, Any, Optional
from app.schemas.common import CARC_TAXONOMY, RiskTier

def recommend_corrective_action(
    predicted_carc: Optional[str],
    claim_data: Dict[str, Any],
    risk_tier: RiskTier
) -> str:
    """
    Returns prioritized prescriptive guidance for hospital billers.
    """
    if risk_tier == RiskTier.LOW:
        return "Claim passes all pre-submission intelligence checks. Verified clean claim ready for electronic 837 batch transmission (RELEASE)."

    payer_id = claim_data.get("payer_id", "the payer")

    if predicted_carc == "CO-197":
        return (
            f"Prior authorization missing. Query {payer_id} portal for existing authorization or submit "
            "urgent precertification request with clinical chart notes. Do not release without valid auth number."
        )
    elif predicted_carc == "CO-27":
        return (
            "Insurance eligibility unverified or terminated. Execute immediate 270/271 electronic inquiry. "
            "Verify active coverage dates, group policy number, and subscriber relationship before submission."
        )
    elif predicted_carc == "CO-29":
        return (
            f"Timely filing limit at imminent risk. Expedite clearinghouse transmission immediately. "
            "If initial filing was rejected, attach historical clearinghouse acceptance receipt as proof of timely attempt."
        )
    elif predicted_carc == "CO-18":
        return (
            "Duplicate claim suspected. Inspect billing ledger for matching CPT codes on same date of service. "
            "If this represents a separate encounter, append modifier -76 (repeat procedure) or -77; otherwise cancel draft."
        )
    elif predicted_carc == "CO-50":
        return (
            "Medical necessity failure predicted. Review Local Coverage Determination (LCD) policy. "
            "Ensure primary ICD-10 diagnosis code establishes clinical necessity, or attach physician documentation."
        )
    elif predicted_carc == "CO-96":
        return (
            f"Non-covered procedure under {payer_id} contract. Check patient benefit schedule. "
            "Obtain signed Advance Beneficiary Notice (ABN) or reroute claim charge to secondary payer / self-pay."
        )
    elif predicted_carc == "CO-97":
        return (
            "NCCI bundling edit risk. Procedure is bundled with primary service. "
            "Verify if service was performed at a distinct anatomic site or session. If warranted, append Modifier -59 or -X{EPSU}."
        )
    elif predicted_carc == "CO-16":
        return (
            "Incomplete claim documentation. Attach signed clinical progress notes, operative report, or lab panels "
            "to substantiate billing units before clearinghouse release."
        )
    else:
        return (
            "Elevated denial probability detected. Review claim fields, verify active payer benefits, "
            "and conduct manual billing audit before dispatch."
        )
