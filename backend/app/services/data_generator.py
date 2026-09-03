"""
ClaimShield AI - Synthetic Healthcare Claim Dataset Generator
Produces realistic pre-submission claims with latent probabilistic denial scores,
controlled 5% label noise, and zero post-submission leakage.
"""
import numpy as np
import pandas as pd
import json
from datetime import datetime, timedelta
from typing import Tuple, List, Dict, Any
from pathlib import Path
from app.config import settings
from app.schemas.common import CARC_TAXONOMY

PAYER_PROFILES = {
    "PAYER_001": {
        "name": "Blue Cross Blue Shield Demo",
        "avg_denial_rate": 0.18,
        "timely_filing_days": 180,
        "strict_prior_auth_cpts": ["29881", "43239", "45380", "93000"]
    },
    "PAYER_002": {
        "name": "Medicare Part B Sim",
        "avg_denial_rate": 0.12,
        "timely_filing_days": 365,
        "strict_prior_auth_cpts": ["29881", "43239"]
    },
    "PAYER_003": {
        "name": "Aetna Health Demo",
        "avg_denial_rate": 0.22,
        "timely_filing_days": 90,
        "strict_prior_auth_cpts": ["29881", "43239", "45380", "71045", "93000"]
    },
    "PAYER_004": {
        "name": "UnitedHealthcare Sim",
        "avg_denial_rate": 0.25,
        "timely_filing_days": 90,
        "strict_prior_auth_cpts": ["29881", "43239", "45380", "97110", "93000"]
    },
    "PAYER_005": {
        "name": "Cigna HealthCare Demo",
        "avg_denial_rate": 0.19,
        "timely_filing_days": 120,
        "strict_prior_auth_cpts": ["29881", "45380", "93000"]
    },
    "PAYER_006": {
        "name": "Humana Advantage Sim",
        "avg_denial_rate": 0.16,
        "timely_filing_days": 180,
        "strict_prior_auth_cpts": ["29881", "43239", "45380"]
    }
}

SPECIALTIES = [
    "Family Medicine", "Internal Medicine", "Cardiology",
    "Orthopedic Surgery", "Gastroenterology", "Physical Therapy", "Radiology"
]

CPT_OPTIONS = [
    ("99213", 110.0), ("99214", 175.0), ("99215", 260.0),
    ("99203", 160.0), ("99204", 240.0), ("71045", 85.0),
    ("71046", 115.0), ("93000", 95.0), ("36415", 25.0),
    ("80053", 65.0), ("85025", 45.0), ("97110", 120.0),
    ("97140", 130.0), ("29881", 3100.0), ("43239", 1850.0), ("45380", 2200.0)
]

ICD_OPTIONS = [
    "J06.9", "I10", "E11.9", "M54.5", "R07.9",
    "J45.909", "K21.9", "Z00.00", "M17.11", "R10.9", "E78.5"
]

def generate_synthetic_claims(num_records: int = 4000, seed: int = settings.RANDOM_SEED) -> pd.DataFrame:
    """
    Generates realistic pre-submission claims using latent denial probability scoring.
    """
    rng = np.random.RandomState(seed)
    records = []

    today = datetime.now()

    payer_ids = list(PAYER_PROFILES.keys())

    for i in range(1, num_records + 1):
        claim_id = f"CLM_{i:06d}"
        patient_id = f"PAT_{rng.randint(1000, 99999):06d}"
        payer_id = rng.choice(payer_ids)
        payer_info = PAYER_PROFILES[payer_id]

        specialty = rng.choice(SPECIALTIES)

        # CPT & ICD codes
        primary_cpt, base_price = CPT_OPTIONS[rng.choice(len(CPT_OPTIONS))]
        cpt_codes = [primary_cpt]
        if rng.rand() < 0.35:
            sec_cpt, sec_price = CPT_OPTIONS[rng.choice(len(CPT_OPTIONS))]
            if sec_cpt not in cpt_codes:
                cpt_codes.append(sec_cpt)
                base_price += sec_price

        # Charge amount with realistic variance
        claim_amount = round(float(base_price * rng.uniform(0.9, 1.35)), 2)

        icd_count = rng.choice([1, 2, 3], p=[0.60, 0.30, 0.10])
        icd_codes = list(rng.choice(ICD_OPTIONS, size=icd_count, replace=False))

        # Dates
        days_ago = rng.randint(2, 220)
        service_date = (today - timedelta(days=days_ago)).strftime("%Y-%m-%d")
        submission_date = (today - timedelta(days=max(0, days_ago - rng.randint(1, 15)))).strftime("%Y-%m-%d")

        # Operational pre-submission variables
        payer_requires_pa = any(cpt in payer_info["strict_prior_auth_cpts"] for cpt in cpt_codes)
        prior_auth_flag = False if (payer_requires_pa and rng.rand() < 0.40) else True

        eligibility_verified = bool(rng.rand() > 0.12)
        days_since_elig_check = rng.randint(0, 75) if eligibility_verified else rng.randint(35, 180)

        documentation_complete = bool(rng.rand() > 0.14)
        duplicate_candidate = bool(rng.rand() < 0.05)

        timely_filing_risk = bool(days_ago > (payer_info["timely_filing_days"] - 15))
        coverage_indicator = bool(rng.rand() > 0.09)
        medical_necessity_indicator = bool(rng.rand() > 0.11)
        bundling_indicator = bool(len(cpt_codes) > 1 and rng.rand() < 0.30)

        payer_denial_rate = payer_info["avg_denial_rate"]

        # Latent score formulation (combining clinical & operational risk weights)
        latent_score = -2.80  # Base negative bias (most claims pass)

        # Add risk factors
        if payer_requires_pa and not prior_auth_flag:
            latent_score += 3.20  # High risk of CO-197
        if not eligibility_verified or days_since_elig_check > 45:
            latent_score += 2.80  # High risk of CO-27
        if timely_filing_risk:
            latent_score += 3.40  # High risk of CO-29
        if duplicate_candidate:
            latent_score += 3.60  # High risk of CO-18
        if not documentation_complete:
            latent_score += 2.20  # High risk of CO-16
        if not coverage_indicator:
            latent_score += 2.50  # High risk of CO-96
        if not medical_necessity_indicator:
            latent_score += 2.40  # High risk of CO-50
        if bundling_indicator:
            latent_score += 2.10  # High risk of CO-97

        # Payer specific benchmark and charge scaling
        latent_score += (payer_denial_rate * 3.5)
        if claim_amount > 2000:
            latent_score += 0.60

        # Convert to probability via logistic sigmoid
        prob_denial = 1.0 / (1.0 + np.exp(-latent_score))

        # Sample denial outcome with controlled 5% label noise
        will_be_denied = 1 if rng.rand() < prob_denial else 0
        if rng.rand() < 0.05:
            will_be_denied = 1 - will_be_denied  # 5% realistic label flip

        # Assign actual CARC reason code for denied claims
        actual_reason_code = None
        if will_be_denied == 1:
            # Determine leading risk cause
            risk_candidates = []
            if payer_requires_pa and not prior_auth_flag:
                risk_candidates.append(("CO-197", 3.5))
            if duplicate_candidate:
                risk_candidates.append(("CO-18", 4.0))
            if timely_filing_risk:
                risk_candidates.append(("CO-29", 3.8))
            if not eligibility_verified or days_since_elig_check > 45:
                risk_candidates.append(("CO-27", 3.2))
            if not medical_necessity_indicator:
                risk_candidates.append(("CO-50", 2.8))
            if not coverage_indicator:
                risk_candidates.append(("CO-96", 2.6))
            if bundling_indicator:
                risk_candidates.append(("CO-97", 2.4))
            if not documentation_complete:
                risk_candidates.append(("CO-16", 2.2))

            if risk_candidates:
                codes, weights = zip(*risk_candidates)
                norm_weights = np.array(weights) / sum(weights)
                actual_reason_code = rng.choice(codes, p=norm_weights)
            else:
                # Default generic denial reason
                actual_reason_code = rng.choice(["CO-16", "CO-96", "CO-50"])

        record = {
            "claim_id": claim_id,
            "patient_id": patient_id,
            "payer_id": payer_id,
            "cpt_codes": json.dumps(cpt_codes),
            "icd_codes": json.dumps(icd_codes),
            "claim_amount": claim_amount,
            "service_date": service_date,
            "submission_date": submission_date,
            "prior_auth_flag": prior_auth_flag,
            "eligibility_verified": eligibility_verified,
            "days_since_eligibility_check": days_since_elig_check,
            "provider_specialty": specialty,
            "documentation_complete": documentation_complete,
            "duplicate_candidate": duplicate_candidate,
            "timely_filing_risk": timely_filing_risk,
            "payer_denial_rate": payer_denial_rate,
            "payer_requires_prior_auth": payer_requires_pa,
            "coverage_indicator": coverage_indicator,
            "medical_necessity_indicator": medical_necessity_indicator,
            "bundling_indicator": bundling_indicator,
            "will_be_denied": will_be_denied,
            "actual_reason_code": actual_reason_code,
            "status": "DENIED" if will_be_denied == 1 else "PAID"
        }
        records.append(record)

    df = pd.DataFrame(records)
    return df

def save_synthetic_dataset(filepath: Path = settings.SYNTHETIC_DATA_PATH, num_records: int = 4000) -> pd.DataFrame:
    """Generates and persists synthetic dataset to CSV."""
    df = generate_synthetic_claims(num_records=num_records)
    filepath.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(filepath, index=False)
    return df
