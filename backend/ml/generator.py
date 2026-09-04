import random
import datetime
import json
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
from backend.config import settings

# Core Taxonomy: CARC Definitions
CARC_DEFINITIONS: Dict[str, Dict[str, str]] = {
    "CO-16": {
        "name": "Missing Required Info / Documentation",
        "description": "Claim lacks required billing details, attachments, or complete clinical documentation.",
        "action": "Validate mandatory fields, verify provider NPI, and ensure complete clinical documentation is attached before 837 transmission."
    },
    "CO-18": {
        "name": "Duplicate Claim or Service",
        "description": "Exact duplicate claim or service line previously received and adjudicated.",
        "action": "Search clearinghouse submission history for duplicate service line or ICN prior to transmission."
    },
    "CO-27": {
        "name": "Coverage Terminated / Inactive Eligibility",
        "description": "Patient insurance policy was inactive or terminated on the recorded date of service.",
        "action": "Perform real-time 270/271 eligibility transaction to verify active coverage for the exact date of service."
    },
    "CO-29": {
        "name": "Timely Filing Limit Expired",
        "description": "Claim service date exceeds the contracted payer timely-filing submission window.",
        "action": "Verify date of service against payer timely-filing rule (e.g. 90-180 days) and prioritize same-day transmission."
    },
    "CO-50": {
        "name": "Medical Necessity Mismatch",
        "description": "Procedure is not considered medically necessary for the billed primary diagnosis code.",
        "action": "Review Local/National Coverage Determinations (LCD/NCD) and ensure diagnosis code supports the level of procedure billed."
    },
    "CO-96": {
        "name": "Non-Covered Procedure",
        "description": "The billed service is excluded or not covered under the subscriber's specific benefit plan.",
        "action": "Check subscriber benefit schedule and obtain Advance Beneficiary Notice (ABN) if service is patient-responsibility."
    },
    "CO-97": {
        "name": "Bundled / Mutually Exclusive Procedure",
        "description": "Procedure payment is bundled into another primary service under National Correct Coding Initiative (NCCI) edits.",
        "action": "Review NCCI bundling edits and attach appropriate modifier (e.g., -59, -25) only if clinically distinct and documented."
    },
    "CO-197": {
        "name": "Pre-Authorization Missing / Absent",
        "description": "Pre-certification or prior authorization was required by payer policy but was absent from the claim.",
        "action": "Verify payer prior-auth list, obtain pre-certification number, and populate in Box 23 / 837P Loop 2300 prior to submission."
    }
}

PAYER_REFERENCE = [
    {
        "payer_id": "PAYER_001",
        "name": "Aetna Health (Simulated)",
        "avg_denial_rate": 0.14,
        "timely_filing_days": 180,
        "requires_prior_auth": ["70450", "29881", "43239"]
    },
    {
        "payer_id": "PAYER_002",
        "name": "Blue Cross Blue Shield (Simulated)",
        "avg_denial_rate": 0.11,
        "timely_filing_days": 365,
        "requires_prior_auth": ["70450", "29881"]
    },
    {
        "payer_id": "PAYER_003",
        "name": "UnitedHealthcare (Simulated)",
        "avg_denial_rate": 0.18,
        "timely_filing_days": 90,
        "requires_prior_auth": ["70450", "29881", "43239", "99283"]
    },
    {
        "payer_id": "PAYER_004",
        "name": "Cigna Healthcare (Simulated)",
        "avg_denial_rate": 0.13,
        "timely_filing_days": 180,
        "requires_prior_auth": ["70450", "29881"]
    },
    {
        "payer_id": "PAYER_005",
        "name": "Medicare Advantage (Simulated)",
        "avg_denial_rate": 0.22,
        "timely_filing_days": 120,
        "requires_prior_auth": ["70450", "29881", "43239", "80053"]
    }
]

CPT_REFERENCE: Dict[str, str] = {
    "99213": "Office/outpatient visit, established patient, low MDM (20-29 mins)",
    "99214": "Office/outpatient visit, established patient, moderate MDM (30-39 mins)",
    "70450": "Computed tomography, head or brain; without contrast material",
    "93000": "Electrocardiogram, routine ECG with at least 12 leads; tracing and report",
    "29881": "Arthroscopy, knee, surgical; with meniscectomy (medial OR lateral)",
    "43239": "Esophagogastroduodenoscopy, flexible, transoral; with biopsy, single or multiple",
    "80053": "Comprehensive metabolic panel (14 individual blood tests)",
    "99283": "Emergency department visit for evaluation and management, moderate severity"
}

ICD_REFERENCE: Dict[str, str] = {
    "J06.9": "Acute upper respiratory infection, unspecified",
    "I10": "Essential (primary) hypertension",
    "E11.9": "Type 2 diabetes mellitus without complications",
    "M23.22": "Derangement of meniscus due to old tear or injury, right knee",
    "R07.9": "Chest pain, unspecified",
    "K21.9": "Gastro-esophageal reflux disease without esophagitis",
    "M54.5": "Low back pain",
    "Z00.00": "Encounter for general adult medical examination without abnormal findings"
}

SPECIALTIES = [
    "Family Medicine",
    "Internal Medicine",
    "Orthopedic Surgery",
    "Cardiology",
    "Emergency Medicine",
    "Radiology",
    "Gastroenterology"
]


def generate_synthetic_dataset(num_samples: int = 4000, seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic synthetic healthcare claims dataset for pre-submission denial prevention.
    
    Includes:
    - Covariates available strictly at pre-submission time
    - Latent risk scoring with non-linear clinical and payer policy interactions
    - Controlled label noise (5%) to prevent trivial deterministic memorization
    - Ground truth actual denial reason (CARC) for evaluated denials
    """
    rng = np.random.default_rng(seed)
    random.seed(seed)

    payer_map = {p["payer_id"]: p for p in PAYER_REFERENCE}
    payer_ids = list(payer_map.keys())
    cpt_list = list(CPT_REFERENCE.keys())
    icd_list = list(ICD_REFERENCE.keys())

    records = []
    base_date = datetime.date(2026, 9, 1)

    for i in range(1, num_samples + 1):
        claim_id = f"CLM_{i:06d}"
        patient_id = f"PAT_{rng.integers(1, 1200):05d}"
        payer_id = rng.choice(payer_ids)
        payer_meta = payer_map[payer_id]

        cpt = rng.choice(cpt_list)
        icd = rng.choice(icd_list)
        specialty = rng.choice(SPECIALTIES)

        # Baseline dollar amount by procedure type
        if cpt in ["29881", "43239"]:  # Surgeries / scopes
            claim_amount = float(np.round(rng.uniform(1800.0, 6800.0), 2))
        elif cpt in ["70450"]:          # CT Head
            claim_amount = float(np.round(rng.uniform(650.0, 1600.0), 2))
        elif cpt in ["99283"]:          # Emergency
            claim_amount = float(np.round(rng.uniform(500.0, 1400.0), 2))
        else:                           # E&M / Labs / ECG
            claim_amount = float(np.round(rng.uniform(85.0, 350.0), 2))

        # Service date: between 5 and 400 days prior to submission
        days_ago = int(rng.exponential(scale=45)) + 3
        service_date = base_date - datetime.timedelta(days=days_ago)
        submission_date = base_date

        # Eligibility
        eligibility_verified = bool(rng.random() > 0.12)
        if eligibility_verified:
            days_since_eligibility = int(rng.integers(0, 90))
        else:
            days_since_eligibility = int(rng.integers(30, 240))

        # Prior auth requirements
        payer_requires_prior_auth = cpt in payer_meta["requires_prior_auth"]
        if payer_requires_prior_auth:
            # 65% of the time billers get it, 35% it's accidentally missing
            prior_auth_flag = bool(rng.random() > 0.35)
        else:
            prior_auth_flag = False

        # Documentation completeness
        documentation_complete = bool(rng.random() > 0.10)

        # Duplicate candidate flag
        duplicate_candidate = bool(rng.random() < 0.04)

        # Timely filing risk
        timely_filing_limit = payer_meta["timely_filing_days"]
        service_age_days = (submission_date - service_date).days
        timely_filing_risk = bool(service_age_days > timely_filing_limit)

        # Medical necessity indicator (e.g. knee surgery requires meniscus injury M23.22)
        if cpt == "29881" and icd != "M23.22":
            medical_necessity_indicator = False
        elif cpt == "93000" and icd not in ["R07.9", "I10"]:
            medical_necessity_indicator = bool(rng.random() > 0.40)
        elif cpt == "43239" and icd not in ["K21.9", "R07.9"]:
            medical_necessity_indicator = bool(rng.random() > 0.45)
        else:
            medical_necessity_indicator = bool(rng.random() > 0.06)

        # Coverage indicator (certain procedures restricted by payer)
        if payer_id == "PAYER_005" and cpt == "80053" and icd == "Z00.00":
            coverage_indicator = False  # Medicare routine screening restriction
        else:
            coverage_indicator = bool(rng.random() > 0.08)

        # Bundling indicator (e.g. ECG 93000 or lab with office visit 99214 without modifier)
        bundling_indicator = bool(cpt in ["93000", "80053"] and rng.random() < 0.28)

        # Compute Latent Denial Risk Score
        # Baseline logit from payer historical average
        logit = np.log(payer_meta["avg_denial_rate"] / (1.0 - payer_meta["avg_denial_rate"]))

        # Add heavy domain risk weights
        reasons_triggered = []

        if payer_requires_prior_auth and not prior_auth_flag:
            logit += 2.8
            reasons_triggered.append("CO-197")

        if duplicate_candidate:
            logit += 3.5
            reasons_triggered.append("CO-18")

        if timely_filing_risk:
            logit += 3.2
            reasons_triggered.append("CO-29")

        if not eligibility_verified or days_since_eligibility > 90:
            logit += 2.2
            reasons_triggered.append("CO-27")

        if not medical_necessity_indicator:
            logit += 2.4
            reasons_triggered.append("CO-50")

        if not documentation_complete:
            logit += 2.1
            reasons_triggered.append("CO-16")

        if not coverage_indicator:
            logit += 2.3
            reasons_triggered.append("CO-96")

        if bundling_indicator:
            logit += 1.8
            reasons_triggered.append("CO-97")

        # Claim amount non-linear effect: high dollar claims receive higher scrutiny
        if claim_amount > 4000.0:
            logit += 0.35

        # Convert logit to probability
        raw_prob = 1.0 / (1.0 + np.exp(-logit))

        # Sample binary label with probabilistic generator
        will_be_denied = int(rng.random() < raw_prob)

        # Controlled 5% label noise (simulates payer variance or human adjudicator leniency)
        if rng.random() < settings.LABEL_NOISE_RATE:
            will_be_denied = 1 - will_be_denied

        # Assign ground-truth CARC reason
        actual_reason_code = None
        if will_be_denied == 1:
            if reasons_triggered:
                # Primary triggered reason
                actual_reason_code = reasons_triggered[0]
            else:
                # Generic billing error or documentation
                actual_reason_code = rng.choice(["CO-16", "CO-96", "CO-50"])

        records.append({
            "claim_id": claim_id,
            "patient_id": patient_id,
            "payer_id": payer_id,
            "cpt_codes": json.dumps([cpt]),
            "icd_codes": json.dumps([icd]),
            "claim_amount": claim_amount,
            "service_date": service_date.isoformat(),
            "submission_date": submission_date.isoformat(),
            "prior_auth_flag": prior_auth_flag,
            "eligibility_verified": eligibility_verified,
            "days_since_eligibility_check": days_since_eligibility,
            "provider_specialty": specialty,
            "documentation_complete": documentation_complete,
            "duplicate_candidate": duplicate_candidate,
            "timely_filing_risk": timely_filing_risk,
            "payer_denial_rate": payer_meta["avg_denial_rate"],
            "payer_requires_prior_auth": payer_requires_prior_auth,
            "coverage_indicator": coverage_indicator,
            "medical_necessity_indicator": medical_necessity_indicator,
            "bundling_indicator": bundling_indicator,
            "will_be_denied": will_be_denied,
            "actual_reason_code": actual_reason_code if will_be_denied == 1 else ""
        })

    df = pd.DataFrame(records)
    return df
