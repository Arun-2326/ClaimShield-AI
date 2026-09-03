"""
ClaimShield AI - Common Enums and CARC Reference Taxonomy
"""
from enum import Enum
from typing import Dict, Any

class RiskTier(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL_ERROR = "validation_error"

class RoutingDecision(str, Enum):
    RELEASE = "RELEASE"
    REVIEW = "REVIEW"
    HOLD_FOR_CORRECTION = "HOLD_FOR_CORRECTION"
    BLOCK_UNTIL_VALID = "BLOCK_UNTIL_VALID"

class ClaimStatus(str, Enum):
    PENDING_SUBMISSION = "PENDING_SUBMISSION"
    RELEASED = "RELEASED"
    HELD = "HELD"
    BLOCKED = "BLOCKED"
    PAID = "PAID"
    DENIED = "DENIED"

# Official 8 CARC Categories for pre-submission intelligence prototype
CARC_TAXONOMY: Dict[str, Dict[str, str]] = {
    "CO-16": {
        "code": "CO-16",
        "category": "Missing / Incomplete Info",
        "description": "Claim/service lacks information or has submission/billing error(s) which is needed for adjudication.",
        "plain_language": "Required information is missing or contains a submission/billing error.",
        "preventive_action": "Validate mandatory fields, verify provider NPI, and ensure operative/clinical documentation is attached.",
        "risk_factor_key": "documentation_complete"
    },
    "CO-18": {
        "code": "CO-18",
        "category": "Duplicate Claim",
        "description": "Exact duplicate claim/service.",
        "plain_language": "Exact duplicate claim or service previously submitted.",
        "preventive_action": "Search recent submission archives before re-submitting. Remove duplicate claim line.",
        "risk_factor_key": "duplicate_candidate"
    },
    "CO-27": {
        "code": "CO-27",
        "category": "Coverage Terminated",
        "description": "Expenses incurred after coverage terminated.",
        "plain_language": "Service occurred after patient insurance coverage termination date.",
        "preventive_action": "Run immediate 270/271 real-time eligibility inquiry to verify active member coverage for the date of service.",
        "risk_factor_key": "eligibility_verified"
    },
    "CO-29": {
        "code": "CO-29",
        "category": "Timely Filing Expired",
        "description": "The time limit for filing has expired.",
        "plain_language": "Timely-filing limit has expired or is nearing strict payer deadline.",
        "preventive_action": "Check service age against payer filing window (e.g. 90 or 180 days). Expedite immediate submission with proof of timely attempt.",
        "risk_factor_key": "timely_filing_risk"
    },
    "CO-50": {
        "code": "CO-50",
        "category": "Medical Necessity Mismatch",
        "description": "These are non-covered services because this is not deemed a 'medical necessity' by the payer.",
        "plain_language": "Service is not considered medically necessary based on primary ICD-10 diagnosis.",
        "preventive_action": "Review diagnosis-to-procedure compatibility. Add supporting secondary ICD-10 diagnosis codes and clinical rationale.",
        "risk_factor_key": "medical_necessity_indicator"
    },
    "CO-96": {
        "code": "CO-96",
        "category": "Non-Covered Service",
        "description": "Non-covered charge(s). At least one remark code must be provided.",
        "plain_language": "Charge is non-covered under the patient's specific benefit plan.",
        "preventive_action": "Verify payer benefit schedule and obtain Advance Beneficiary Notice (ABN) or patient financial agreement.",
        "risk_factor_key": "coverage_indicator"
    },
    "CO-97": {
        "code": "CO-97",
        "category": "Bundled Payment",
        "description": "The benefit for this service is included in the payment/allowance for another service/procedure that has already been adjudicated.",
        "plain_language": "Service is bundled into another primary payment under National Correct Coding Initiative (NCCI) edits.",
        "preventive_action": "Evaluate NCCI bundling rules. Check if appropriate modifier (e.g., -59, -25) is documented and warranted.",
        "risk_factor_key": "bundling_indicator"
    },
    "CO-197": {
        "code": "CO-197",
        "category": "Prior Authorization Absent",
        "description": "Precertification/authorization/notification/prior authorization absent.",
        "plain_language": "Required prior authorization or precertification is missing.",
        "preventive_action": "Obtain and record valid prior-authorization number from the payer portal before submission.",
        "risk_factor_key": "prior_auth_flag"
    }
}
