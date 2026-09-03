"""
ClaimShield AI - Billing Explanation Layer
Translates machine-learning feature attributions and risk factors into
plain-language clinical and billing-team explanations.
"""
from typing import List, Dict, Any, Tuple
from app.schemas.prediction import RiskFactor

def explain_claim_risk(
    claim_data: Dict[str, Any],
    feature_row: Dict[str, Any],
    feature_importances: Dict[str, float],
    risk_score: float
) -> List[RiskFactor]:
    """
    Computes top-3 risk factors in billing-specialist language.
    Combines feature value with model importance weight to gauge contribution magnitude.
    """
    factors: List[Tuple[float, RiskFactor]] = []

    payer_id = claim_data.get("payer_id", "PAYER_001")
    claim_amount = float(claim_data.get("claim_amount", 0.0))
    days_since_elig = int(claim_data.get("days_since_eligibility_check") or 0)
    prior_auth_flag = bool(claim_data.get("prior_auth_flag", False))
    eligibility_verified = bool(claim_data.get("eligibility_verified", True))
    doc_complete = bool(claim_data.get("documentation_complete", True))
    duplicate_cand = bool(claim_data.get("duplicate_candidate", False))
    timely_risk = bool(claim_data.get("timely_filing_risk", False))
    cov_ind = bool(claim_data.get("coverage_indicator", True))
    med_nec = bool(claim_data.get("medical_necessity_indicator", True))
    bundling = bool(claim_data.get("bundling_indicator", False))
    payer_requires_pa = bool(feature_row.get("payer_requires_prior_auth", 0))

    if risk_score >= 0.30:
        # Evaluate risk drivers
        if payer_requires_pa and not prior_auth_flag:
            weight = feature_importances.get("prior_auth_mismatch", 0.35) * 1.5
            factors.append((
                weight,
                RiskFactor(
                    feature="prior_auth_flag",
                    display_name="Prior Authorization Missing",
                    impact="increases_risk",
                    contribution=round(min(0.45, weight), 2),
                    explanation=f"Payer {payer_id} mandates prior authorization for this procedure, but prior_auth_flag is absent."
                )
            ))

        if duplicate_cand:
            weight = feature_importances.get("duplicate_candidate", 0.30) * 1.6
            factors.append((
                weight,
                RiskFactor(
                    feature="duplicate_candidate",
                    display_name="Potential Duplicate Submission",
                    impact="increases_risk",
                    contribution=round(min(0.50, weight), 2),
                    explanation="An active or recently submitted claim with matching patient and service date was identified in the clearinghouse cache."
                )
            ))

        if timely_risk:
            weight = feature_importances.get("timely_filing_risk", 0.28) * 1.4
            factors.append((
                weight,
                RiskFactor(
                    feature="timely_filing_risk",
                    display_name="Timely Filing Window Expiry",
                    impact="increases_risk",
                    contribution=round(min(0.40, weight), 2),
                    explanation=f"Elapsed time since date of service exceeds or approaches {payer_id}'s strict filing deadline."
                )
            ))

        if not eligibility_verified or days_since_elig > 30:
            weight = feature_importances.get("stale_eligibility_flag", 0.25) * 1.3
            explanation_text = "Member eligibility has never been verified via 270/271 inquiry." if not eligibility_verified else f"Eligibility check is {days_since_elig} days old (>30 day threshold), exposing coverage termination risk."
            factors.append((
                weight,
                RiskFactor(
                    feature="eligibility_verified",
                    display_name="Eligibility Stale / Unverified",
                    impact="increases_risk",
                    contribution=round(min(0.35, weight), 2),
                    explanation=explanation_text
                )
            ))

        if not med_nec:
            weight = feature_importances.get("medical_necessity_indicator", 0.22) * 1.2
            factors.append((
                weight,
                RiskFactor(
                    feature="medical_necessity_indicator",
                    display_name="Diagnosis-to-Procedure Mismatch",
                    impact="increases_risk",
                    contribution=round(min(0.30, weight), 2),
                    explanation="Submitted ICD-10 diagnosis code fails to meet Local Coverage Determination (LCD) medical necessity requirements."
                )
            ))

        if not cov_ind:
            weight = feature_importances.get("coverage_indicator", 0.20) * 1.2
            factors.append((
                weight,
                RiskFactor(
                    feature="coverage_indicator",
                    display_name="Plan Benefit Non-Coverage",
                    impact="increases_risk",
                    contribution=round(min(0.28, weight), 2),
                    explanation=f"The requested CPT code is excluded from standard reimbursement schedules under {payer_id}'s commercial formulary."
                )
            ))

        if bundling:
            weight = feature_importances.get("bundling_indicator", 0.18) * 1.1
            factors.append((
                weight,
                RiskFactor(
                    feature="bundling_indicator",
                    display_name="NCCI Edit Bundling Risk",
                    impact="increases_risk",
                    contribution=round(min(0.25, weight), 2),
                    explanation="Procedure is flagged as an incidental component of a primary service without an overriding modifier (-59, -25)."
                )
            ))

        if not doc_complete:
            weight = feature_importances.get("documentation_complete", 0.16) * 1.1
            factors.append((
                weight,
                RiskFactor(
                    feature="documentation_complete",
                    display_name="Incomplete Chart Documentation",
                    impact="increases_risk",
                    contribution=round(min(0.22, weight), 2),
                    explanation="Mandatory clinical chart notes, provider signatures, or operative reports are not attached."
                )
            ))

        if claim_amount > 2000.0:
            weight = feature_importances.get("claim_amount", 0.12)
            factors.append((
                weight,
                RiskFactor(
                    feature="claim_amount",
                    display_name="High Billed Charge Amount",
                    impact="increases_risk",
                    contribution=round(min(0.18, weight), 2),
                    explanation=f"High billed charge (${claim_amount:,.2f}) triggers secondary clinical prepayment audit by payer."
                )
            ))

        # Sort descending by calculated contribution weight
        factors.sort(key=lambda x: x[0], reverse=True)
        top_factors = [item[1] for item in factors[:3]]

        # Ensure we always return at least one factor if risk is elevated
        if not top_factors:
            top_factors.append(RiskFactor(
                feature="payer_denial_rate",
                display_name="Baseline Payer Friction",
                impact="increases_risk",
                contribution=0.20,
                explanation=f"Historical denial rate for {payer_id} in this specialty creates baseline claim vulnerability."
            ))

        return top_factors

    else:
        # Clean claim / low risk mitigations
        clean_factors = [
            RiskFactor(
                feature="eligibility_verified",
                display_name="Active Verified Eligibility",
                impact="decreases_risk",
                contribution=0.35,
                explanation="270/271 eligibility transaction successfully verified active subscriber coverage within valid window."
            ),
            RiskFactor(
                feature="prior_auth_flag",
                display_name="Prior Authorization Compliant",
                impact="decreases_risk",
                contribution=0.30,
                explanation="All procedure codes comply with payer precertification requirements or have valid authorization."
            ),
            RiskFactor(
                feature="documentation_complete",
                display_name="Complete Clinical Documentation",
                impact="decreases_risk",
                contribution=0.25,
                explanation="Comprehensive electronic medical chart notes and physician signatures are properly attached."
            )
        ]
        return clean_factors
