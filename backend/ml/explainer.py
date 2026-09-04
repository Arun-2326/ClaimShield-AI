from typing import List, Dict, Any, Tuple
import pandas as pd
from backend.models.schemas import RiskFactorItem
from backend.ml.preprocessor import FEATURE_DISPLAY_NAMES
from backend.ml.generator import CARC_DEFINITIONS

def explain_prediction(
    features_row: pd.Series,
    feature_importances: Dict[str, float],
    risk_score: float
) -> Tuple[List[RiskFactorItem], str]:
    """
    Computes top-3 risk factor contributions with directionality and provides
    plain-English billing-specialist preventive recommendations.
    """
    contributions = []

    # 1. Missing Prior Authorization
    if features_row.get("auth_needed_and_missing", 0) == 1:
        contributions.append({
            "feature": "prior_auth_flag",
            "display_name": "Required Prior Authorization Absent",
            "impact": "increases_risk",
            "contribution": 0.34,
            "weight": 0.95
        })
    elif features_row.get("prior_auth_flag", 0) == 1:
        contributions.append({
            "feature": "prior_auth_flag",
            "display_name": "Valid Prior Authorization Attached",
            "impact": "decreases_risk",
            "contribution": -0.22,
            "weight": 0.85
        })

    # 2. Duplicate Submission
    if features_row.get("duplicate_candidate", 0) == 1:
        contributions.append({
            "feature": "duplicate_candidate",
            "display_name": "Suspected Duplicate Claim Line",
            "impact": "increases_risk",
            "contribution": 0.38,
            "weight": 0.98
        })

    # 3. Timely Filing
    if features_row.get("timely_filing_risk", 0) == 1:
        contributions.append({
            "feature": "timely_filing_risk",
            "display_name": "Exceeds Payer Timely-Filing Window",
            "impact": "increases_risk",
            "contribution": 0.32,
            "weight": 0.92
        })

    # 4. Eligibility Status
    if features_row.get("eligibility_verified", 1) == 0:
        contributions.append({
            "feature": "eligibility_verified",
            "display_name": "Patient Eligibility Unverified / Inactive",
            "impact": "increases_risk",
            "contribution": 0.28,
            "weight": 0.88
        })
    elif features_row.get("days_since_eligibility_check", 0) > 60:
        contributions.append({
            "feature": "days_since_eligibility_check",
            "display_name": f"Stale Eligibility Check ({int(features_row.get('days_since_eligibility_check', 0))} days old)",
            "impact": "increases_risk",
            "contribution": 0.18,
            "weight": 0.70
        })
    else:
        contributions.append({
            "feature": "eligibility_verified",
            "display_name": "Active Coverage Verified Recently",
            "impact": "decreases_risk",
            "contribution": -0.15,
            "weight": 0.75
        })

    # 5. Medical Necessity
    if features_row.get("medical_necessity_indicator", 1) == 0:
        contributions.append({
            "feature": "medical_necessity_indicator",
            "display_name": "Diagnosis Does Not Meet Medical Necessity (LCD/NCD)",
            "impact": "increases_risk",
            "contribution": 0.29,
            "weight": 0.89
        })

    # 6. Documentation
    if features_row.get("documentation_complete", 1) == 0:
        contributions.append({
            "feature": "documentation_complete",
            "display_name": "Incomplete Clinical Records / Attachments",
            "impact": "increases_risk",
            "contribution": 0.24,
            "weight": 0.82
        })

    # 7. Coverage
    if features_row.get("coverage_indicator", 1) == 0:
        contributions.append({
            "feature": "coverage_indicator",
            "display_name": "Non-Covered Benefit for Subscriber Plan",
            "impact": "increases_risk",
            "contribution": 0.26,
            "weight": 0.84
        })

    # 8. Bundling
    if features_row.get("bundling_indicator", 0) == 1:
        contributions.append({
            "feature": "bundling_indicator",
            "display_name": "NCCI Procedure Bundling Conflict",
            "impact": "increases_risk",
            "contribution": 0.21,
            "weight": 0.78
        })

    # 9. Payer Benchmark
    payer_rate = features_row.get("payer_denial_rate", 0.15)
    if payer_rate > 0.16:
        contributions.append({
            "feature": "payer_denial_rate",
            "display_name": f"High Payer Benchmark Denial Rate ({payer_rate:.0%})",
            "impact": "increases_risk",
            "contribution": 0.12,
            "weight": 0.60
        })
    else:
        contributions.append({
            "feature": "payer_denial_rate",
            "display_name": f"Favorable Payer Denial Rate ({payer_rate:.0%})",
            "impact": "decreases_risk",
            "contribution": -0.08,
            "weight": 0.55
        })

    # Sort by absolute contribution and take top 3
    contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
    top_3_raw = contributions[:3]

    top_3 = [
        RiskFactorItem(
            feature=item["feature"],
            display_name=item["display_name"],
            impact=item["impact"],
            contribution=round(item["contribution"], 3)
        )
        for item in top_3_raw
    ]

    # Generate Actionable Billing Recommendation
    recommended_action = generate_remedial_recommendation(top_3_raw, risk_score)

    return top_3, recommended_action


def generate_remedial_recommendation(top_factors: List[Dict[str, Any]], risk_score: float) -> str:
    """
    Synthesizes the specific preventive action step required by the billing specialist.
    """
    if risk_score < 0.30:
        return "Claim meets pre-submission clean claim benchmarks. Cleared for immediate electronic 837 batch transmission."

    actions = []
    for item in top_factors:
        feat = item["feature"]
        if feat == "prior_auth_flag" and item["impact"] == "increases_risk":
            actions.append("Obtain prior authorization certification number from payer and populate Box 23 / 837P Loop 2300 REF*G1.")
        elif feat == "duplicate_candidate":
            actions.append("Verify billing ledger against clearinghouse submission history to prevent duplicate ICN rejection.")
        elif feat == "timely_filing_risk":
            actions.append("Verify service date against timely-filing limits; expedite submission or attach proof of prior timely attempt.")
        elif feat in ["eligibility_verified", "days_since_eligibility_check"] and item["impact"] == "increases_risk":
            actions.append("Execute real-time 270/271 eligibility transaction to re-verify active coverage on the date of service.")
        elif feat == "medical_necessity_indicator":
            actions.append("Review clinical documentation and verify secondary diagnosis code justifies procedural medical necessity per LCD guidelines.")
        elif feat == "documentation_complete":
            actions.append("Attach mandatory clinical encounter notes and operative summary (PWK segment) before submission.")
        elif feat == "bundling_indicator":
            actions.append("Review NCCI edits; verify if distinct procedural service warrants modifier -59 or -25 with clinical rationale.")
        elif feat == "coverage_indicator":
            actions.append("Verify patient plan benefit riders or confirm executed Advance Beneficiary Notice (ABN) on file.")

    if not actions:
        return "Review claim coding and payer-specific guidelines before submitting."

    return " | ".join(actions)
