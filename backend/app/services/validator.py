"""
ClaimShield AI - Deterministic Pre-Submission Validation Layer
Separates deterministic business & schema rules from probabilistic machine learning.
"""
from typing import List, Tuple, Dict, Any, Optional
from datetime import datetime
import re
from app.schemas.claim import ClaimCreate, ValidationWarning
from app.schemas.common import RoutingDecision

# Standard CPT and ICD-10 reference sets for demo
REFERENCE_CPT_CODES = {
    "99213": "Office/outpatient visit, established, low complexity",
    "99214": "Office/outpatient visit, established, moderate complexity",
    "99215": "Office/outpatient visit, established, high complexity",
    "99203": "Office/outpatient visit, new patient, low complexity",
    "99204": "Office/outpatient visit, new patient, moderate complexity",
    "71045": "Chest X-ray, single view",
    "71046": "Chest X-ray, 2 views",
    "93000": "Electrocardiogram (ECG), complete",
    "36415": "Routine venipuncture for blood specimen",
    "80053": "Comprehensive metabolic panel (CMP)",
    "85025": "Complete blood count (CBC) with automated differential",
    "97110": "Therapeutic exercise, 15 minutes",
    "97140": "Manual therapy techniques, 15 minutes",
    "29881": "Arthroscopy, knee, surgical; with meniscectomy",
    "43239": "Upper GI endoscopy with biopsy",
    "45380": "Colonoscopy with biopsy"
}

REFERENCE_ICD_CODES = {
    "J06.9": "Acute upper respiratory infection, unspecified",
    "I10": "Essential (primary) hypertension",
    "E11.9": "Type 2 diabetes mellitus without complications",
    "M54.5": "Low back pain",
    "R07.9": "Chest pain, unspecified",
    "J45.909": "Unspecified asthma, uncomplicated",
    "K21.9": "Gastro-esophageal reflux disease without esophagitis",
    "Z00.00": "Encounter for general adult medical examination without abnormal findings",
    "M17.11": "Unilateral primary osteoarthritis, right knee",
    "R10.9": "Abdominal pain, unspecified",
    "E78.5": "Hyperlipidemia, unspecified"
}

VALID_PAYERS = {
    "PAYER_001": "Blue Cross Blue Shield Demo",
    "PAYER_002": "Medicare Part B Sim",
    "PAYER_003": "Aetna Health Demo",
    "PAYER_004": "UnitedHealthcare Sim",
    "PAYER_005": "Cigna HealthCare Demo",
    "PAYER_006": "Humana Advantage Sim"
}

class ValidationResult:
    def __init__(self, is_valid: bool, hard_error: Optional[str] = None, warnings: Optional[List[ValidationWarning]] = None):
        self.is_valid = is_valid
        self.hard_error = hard_error
        self.warnings = warnings or []

def validate_claim_deterministic(claim: ClaimCreate, existing_claim_ids: Optional[set] = None) -> ValidationResult:
    """
    Executes hard pre-submission business checks and compiles non-fatal warnings.
    """
    warnings: List[ValidationWarning] = []

    # 1. Hard Check: Claim Amount > 0
    if claim.claim_amount <= 0:
        return ValidationResult(
            is_valid=False,
            hard_error=f"Claim amount must be strictly positive (received: ${claim.claim_amount:.2f})."
        )

    # 2. Hard Check: Service Date Format (YYYY-MM-DD)
    try:
        service_dt = datetime.strptime(claim.service_date, "%Y-%m-%d")
        if service_dt > datetime.now():
            return ValidationResult(
                is_valid=False,
                hard_error=f"Future service date ({claim.service_date}) cannot be submitted."
            )
    except ValueError:
        return ValidationResult(
            is_valid=False,
            hard_error=f"Invalid service date format '{claim.service_date}'. Expected ISO format YYYY-MM-DD."
        )

    # 3. Hard Check: Payer Exists in Reference
    if claim.payer_id not in VALID_PAYERS:
        return ValidationResult(
            is_valid=False,
            hard_error=f"Unknown payer ID '{claim.payer_id}'. Must be a recognized clearinghouse destination."
        )

    # 4. Hard Check: Confirmed Duplicate ID
    if existing_claim_ids and claim.claim_id in existing_claim_ids:
        return ValidationResult(
            is_valid=False,
            hard_error=f"Duplicate Claim ID '{claim.claim_id}' detected. Resubmission blocked under duplicate prevention policy."
        )

    # 5. Hard Check: CPT and ICD code lists not empty
    if not claim.cpt_codes:
        return ValidationResult(
            is_valid=False,
            hard_error="Claim must contain at least one procedure (CPT/HCPCS) code."
        )
    if not claim.icd_codes:
        return ValidationResult(
            is_valid=False,
            hard_error="Claim must contain at least one diagnosis (ICD-10) code."
        )

    # 6. Soft Warnings: Unknown / Non-reference CPT codes
    for cpt in claim.cpt_codes:
        if cpt not in REFERENCE_CPT_CODES:
            warnings.append(ValidationWarning(
                code="NON_REFERENCE_PROCEDURE_CODE",
                message=f"Validation Warning: Non-reference code detected. CPT procedure code '{cpt}' is not present in the demo reference set. Allowed with warning."
            ))

    # 7. Soft Warnings: Unknown / Non-reference ICD codes
    for icd in claim.icd_codes:
        if icd not in REFERENCE_ICD_CODES:
            warnings.append(ValidationWarning(
                code="NON_REFERENCE_DIAGNOSIS_CODE",
                message=f"Validation Warning: Non-reference code detected. ICD-10 diagnosis code '{icd}' is not present in the demo reference set. Allowed with warning."
            ))

    # 8. Soft Warnings: Eligibility verification missing or stale
    if not claim.eligibility_verified:
        warnings.append(ValidationWarning(
            code="UNVERIFIED_ELIGIBILITY",
            message="Patient insurance eligibility has not been verified for this encounter."
        ))
    elif claim.days_since_eligibility_check and claim.days_since_eligibility_check > 30:
        warnings.append(ValidationWarning(
            code="STALE_ELIGIBILITY",
            message=f"Eligibility check is {claim.days_since_eligibility_check} days old (>30 days threshold)."
        ))

    # 9. Soft Warnings: Incomplete Documentation
    if not claim.documentation_complete:
        warnings.append(ValidationWarning(
            code="INCOMPLETE_DOCUMENTATION",
            message="Documentation flag indicates missing clinical chart notes or physician signature."
        ))

    # 10. Soft Warnings: High dollar threshold
    if claim.claim_amount > 2500.0:
        warnings.append(ValidationWarning(
            code="HIGH_DOLLAR_CLAIM",
            message=f"Claim amount (${claim.claim_amount:.2f}) exceeds standard auto-release threshold ($2,500.00)."
        ))

    return ValidationResult(is_valid=True, warnings=warnings)
