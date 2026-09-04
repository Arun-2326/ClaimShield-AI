import datetime
from typing import Tuple, List, Optional, Dict, Any
from backend.models.schemas import ClaimInput, ValidationWarning
from backend.ml.generator import PAYER_REFERENCE, CPT_REFERENCE, ICD_REFERENCE

KNOWN_PAYER_IDS = {p["payer_id"] for p in PAYER_REFERENCE}
KNOWN_CPT_CODES = set(CPT_REFERENCE.keys())
KNOWN_ICD_CODES = set(ICD_REFERENCE.keys())
PAYER_MAP = {p["payer_id"]: p for p in PAYER_REFERENCE}

def scrub_claim_rules_engine(claim: ClaimInput) -> Dict[str, Any]:
    """
    Simulates a tier-1 healthcare clearinghouse scrubbing engine (e.g. Inovalon, Waystar).
    Evaluates 7 core clinical and billing edit rules, returning Pass/Warn/Fail telemetry.
    """
    rules = []
    payer_meta = PAYER_MAP.get(claim.payer_id, {})
    auth_cpts = payer_meta.get("requires_prior_auth", [])
    primary_cpt = claim.cpt_codes[0] if claim.cpt_codes else "UNKNOWN"
    primary_icd = claim.icd_codes[0] if claim.icd_codes else "UNKNOWN"

    # Rule 1: Prior Authorization Gate
    auth_needed = primary_cpt in auth_cpts
    if auth_needed and not claim.prior_auth_flag:
        rules.append({
            "rule_id": "RULE_AUTH_01",
            "rule_name": "Payer Prior Authorization Mandate",
            "category": "Authorization",
            "status": "FAIL",
            "severity": "high",
            "message": f"{payer_meta.get('name', claim.payer_id)} mandates pre-certification for CPT {primary_cpt}. Loop 2300 REF*G1 is missing.",
            "remediation": "Obtain approval number from payer web portal and inject into REF*G1."
        })
    elif auth_needed and claim.prior_auth_flag:
        rules.append({
            "rule_id": "RULE_AUTH_01",
            "rule_name": "Payer Prior Authorization Mandate",
            "category": "Authorization",
            "status": "PASS",
            "severity": "info",
            "message": f"Valid prior authorization recorded for CPT {primary_cpt}.",
            "remediation": None
        })
    else:
        rules.append({
            "rule_id": "RULE_AUTH_01",
            "rule_name": "Payer Prior Authorization Mandate",
            "category": "Authorization",
            "status": "PASS",
            "severity": "info",
            "message": f"Procedure {primary_cpt} does not require pre-auth under {claim.payer_id} policy.",
            "remediation": None
        })

    # Rule 2: Eligibility Verification Freshness (270/271)
    if not claim.eligibility_verified:
        rules.append({
            "rule_id": "RULE_ELIG_02",
            "rule_name": "Active 270/271 Eligibility Verification",
            "category": "Eligibility",
            "status": "FAIL",
            "severity": "high",
            "message": "Encounter lacks proof of active subscriber insurance coverage on date of service.",
            "remediation": "Execute real-time 270/271 electronic transaction before 837 transmission."
        })
    elif claim.days_since_eligibility_check and claim.days_since_eligibility_check > 60:
        rules.append({
            "rule_id": "RULE_ELIG_02",
            "rule_name": "Active 270/271 Eligibility Verification",
            "category": "Eligibility",
            "status": "WARN",
            "severity": "medium",
            "message": f"Eligibility verification is stale ({claim.days_since_eligibility_check} days old). Risk of retro-termination.",
            "remediation": "Perform same-day real-time eligibility re-check."
        })
    else:
        rules.append({
            "rule_id": "RULE_ELIG_02",
            "rule_name": "Active 270/271 Eligibility Verification",
            "category": "Eligibility",
            "status": "PASS",
            "severity": "info",
            "message": f"Coverage verified recently ({claim.days_since_eligibility_check or 0} days old).",
            "remediation": None
        })

    # Rule 3: Timely Filing Window
    timely_limit = payer_meta.get("timely_filing_days", 180)
    try:
        service_dt = datetime.date.fromisoformat(claim.service_date)
        service_age = (datetime.date.today() - service_dt).days
        if service_age > timely_limit:
            rules.append({
                "rule_id": "RULE_TIME_03",
                "rule_name": "Payer Timely Filing Deadline Audit",
                "category": "Filing Deadline",
                "status": "FAIL",
                "severity": "high",
                "message": f"Claim service age ({service_age} days) exceeds {claim.payer_id} timely filing limit ({timely_limit} days).",
                "remediation": "Attach documented proof of initial timely submission or appeal justification."
            })
        elif service_age > (timely_limit - 15):
            rules.append({
                "rule_id": "RULE_TIME_03",
                "rule_name": "Payer Timely Filing Deadline Audit",
                "category": "Filing Deadline",
                "status": "WARN",
                "severity": "medium",
                "message": f"Claim is within 15 days of timely filing expiration ({service_age}/{timely_limit} days elapsed).",
                "remediation": "Flag for same-day expedited batch release."
            })
        else:
            rules.append({
                "rule_id": "RULE_TIME_03",
                "rule_name": "Payer Timely Filing Deadline Audit",
                "category": "Filing Deadline",
                "status": "PASS",
                "severity": "info",
                "message": f"Filing window compliant ({service_age}/{timely_limit} days elapsed).",
                "remediation": None
            })
    except Exception:
        rules.append({
            "rule_id": "RULE_TIME_03",
            "rule_name": "Payer Timely Filing Deadline Audit",
            "category": "Filing Deadline",
            "status": "WARN",
            "severity": "medium",
            "message": "Service date could not be parsed for timely filing check.",
            "remediation": None
        })

    # Rule 4: NCCI Procedure-to-Procedure (PTP) Bundling
    if primary_cpt in ["93000", "80053"] and len(claim.cpt_codes) > 1:
        rules.append({
            "rule_id": "RULE_NCCI_04",
            "rule_name": "CMS NCCI Procedure-to-Procedure (PTP) Edit",
            "category": "Coding & Modifiers",
            "status": "WARN",
            "severity": "medium",
            "message": f"CPT {primary_cpt} has NCCI bundling edit when billed alongside secondary services without modifier.",
            "remediation": "Attach modifier -25 or -59 if encounter meets distinct procedural service criteria."
        })
    else:
        rules.append({
            "rule_id": "RULE_NCCI_04",
            "rule_name": "CMS NCCI Procedure-to-Procedure (PTP) Edit",
            "category": "Coding & Modifiers",
            "status": "PASS",
            "severity": "info",
            "message": "No active NCCI PTP mutually exclusive edits triggered.",
            "remediation": None
        })

    # Rule 5: LCD / NCD Medical Necessity Match
    if primary_cpt == "29881" and primary_icd != "M23.22":
        rules.append({
            "rule_id": "RULE_LCD_05",
            "rule_name": "LCD Medical Necessity Diagnostic Match",
            "category": "Medical Necessity",
            "status": "FAIL",
            "severity": "high",
            "message": f"Knee meniscectomy (29881) requires meniscus tear diagnosis (M23.22 per LCD L33942). Billed: {primary_icd}.",
            "remediation": "Review operative report and cross-reference ICD-10 indication."
        })
    elif primary_cpt == "70450" and primary_icd not in ["R07.9", "G44.1", "S09.90"]:
        rules.append({
            "rule_id": "RULE_LCD_05",
            "rule_name": "LCD Medical Necessity Diagnostic Match",
            "category": "Medical Necessity",
            "status": "WARN",
            "severity": "medium",
            "message": f"CT Head (70450) diagnosis {primary_icd} requires clinical documentation support for medical necessity.",
            "remediation": "Attach encounter neurological assessment notes."
        })
    else:
        rules.append({
            "rule_id": "RULE_LCD_05",
            "rule_name": "LCD Medical Necessity Diagnostic Match",
            "category": "Medical Necessity",
            "status": "PASS",
            "severity": "info",
            "message": "Diagnosis code satisfies LCD/NCD baseline clinical coverage criteria.",
            "remediation": None
        })

    # Rule 6: Duplicate Submission Suppression
    if claim.duplicate_candidate:
        rules.append({
            "rule_id": "RULE_DUP_06",
            "rule_name": "Clearinghouse Duplicate Submission Guard",
            "category": "Duplicate Check",
            "status": "FAIL",
            "severity": "high",
            "message": "Suspected duplicate claim line detected against clearinghouse transmission cache.",
            "remediation": "Verify clearinghouse ICN before transmitting to avoid CARC CO-18 rejection."
        })
    else:
        rules.append({
            "rule_id": "RULE_DUP_06",
            "rule_name": "Clearinghouse Duplicate Submission Guard",
            "category": "Duplicate Check",
            "status": "PASS",
            "severity": "info",
            "message": "Unique service line verified. No duplicate transmission on file.",
            "remediation": None
        })

    # Rule 7: Mandatory Data Elements
    if claim.claim_amount <= 0:
        rules.append({
            "rule_id": "RULE_FMT_07",
            "rule_name": "Mandatory Data Formatting & Amounts",
            "category": "Format",
            "status": "FAIL",
            "severity": "high",
            "message": "Claim amount must be greater than $0.00.",
            "remediation": "Populate valid fee schedule charge."
        })
    else:
        rules.append({
            "rule_id": "RULE_FMT_07",
            "rule_name": "Mandatory Data Formatting & Amounts",
            "category": "Format",
            "status": "PASS",
            "severity": "info",
            "message": "Mandatory field syntax and dollar format verified.",
            "remediation": None
        })

    passed_count = sum(1 for r in rules if r["status"] == "PASS")
    warn_count = sum(1 for r in rules if r["status"] == "WARN")
    fail_count = sum(1 for r in rules if r["status"] == "FAIL")

    return {
        "claim_id": claim.claim_id,
        "clean_claim_score": round((passed_count / len(rules)) * 100, 1),
        "total_rules": len(rules),
        "passed": passed_count,
        "warnings": warn_count,
        "failed": fail_count,
        "rules": rules
    }


def validate_claim_deterministically(claim: ClaimInput) -> Tuple[bool, Optional[str], Optional[str], List[ValidationWarning]]:
    """
    Executes pre-submission deterministic validation layer.
    """
    warnings: List[ValidationWarning] = []

    if claim.claim_amount < 0:
        return False, "NEGATIVE_CLAIM_AMOUNT", "Claim dollar amount cannot be negative.", []

    if claim.claim_amount == 0.0:
        return False, "ZERO_CLAIM_AMOUNT", "Claim dollar amount must be greater than $0.00.", []

    try:
        service_dt = datetime.date.fromisoformat(claim.service_date)
        if service_dt > datetime.date.today():
            return False, "FUTURE_SERVICE_DATE", "Date of service cannot be in the future.", []
    except ValueError:
        return False, "INVALID_SERVICE_DATE", f"Invalid service date format '{claim.service_date}'. Must be YYYY-MM-DD.", []

    if claim.payer_id not in KNOWN_PAYER_IDS:
        return False, "UNKNOWN_PAYER_ID", f"Payer ID '{claim.payer_id}' is not registered in the payer clearinghouse directory.", []

    if not claim.cpt_codes:
        return False, "MISSING_CPT_CODES", "At least one procedure code (CPT) is required.", []

    if not claim.icd_codes:
        return False, "MISSING_ICD_CODES", "At least one diagnosis code (ICD-10) is required.", []

    for cpt in claim.cpt_codes:
        if cpt not in KNOWN_CPT_CODES:
            warnings.append(ValidationWarning(
                code="UNKNOWN_PROCEDURE_CODE",
                message=f"CPT code '{cpt}' is not in the demo standard reference set. Inference will use specialty baseline.",
                severity="warning"
            ))

    for icd in claim.icd_codes:
        if icd not in KNOWN_ICD_CODES:
            warnings.append(ValidationWarning(
                code="UNKNOWN_DIAGNOSIS_CODE",
                message=f"ICD-10 code '{icd}' is not in the demo reference set. Inference will use generalized diagnosis baseline.",
                severity="warning"
            ))

    if not claim.eligibility_verified:
        warnings.append(ValidationWarning(
            code="UNVERIFIED_ELIGIBILITY",
            message="Active patient insurance coverage has not been verified for this encounter.",
            severity="warning"
        ))

    if claim.days_since_eligibility_check and claim.days_since_eligibility_check > 45:
        warnings.append(ValidationWarning(
            code="STALE_ELIGIBILITY_CHECK",
            message=f"Last insurance eligibility check was {claim.days_since_eligibility_check} days ago. Recommended threshold is <30 days.",
            severity="warning"
        ))

    if not claim.documentation_complete:
        warnings.append(ValidationWarning(
            code="INCOMPLETE_DOCUMENTATION",
            message="Encounter documentation flags indicate missing clinical progress notes or pathology reports.",
            severity="warning"
        ))

    return True, None, None, warnings
