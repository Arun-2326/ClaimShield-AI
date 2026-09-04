import pytest
import pandas as pd
import numpy as np
from backend.ml.preprocessor import PreSubmissionPreprocessor, extract_pre_submission_features

def test_preprocessor_fit_transform():
    preprocessor = PreSubmissionPreprocessor()
    df = pd.DataFrame([
        {
            "claim_id": "CLM_001",
            "patient_id": "PAT_001",
            "payer_id": "PAYER_001",
            "cpt_codes": ["99213"],
            "icd_codes": ["J06.9"],
            "claim_amount": 150.0,
            "service_date": "2026-08-20",
            "submission_date": "2026-09-01",
            "prior_auth_flag": True,
            "eligibility_verified": True,
            "days_since_eligibility_check": 10,
            "provider_specialty": "Family Medicine",
            "documentation_complete": True,
            "duplicate_candidate": False
        },
        {
            "claim_id": "CLM_002",
            "patient_id": "PAT_002",
            "payer_id": "PAYER_002",
            "cpt_codes": ["70450"],
            "icd_codes": ["R07.9"],
            "claim_amount": 1200.0,
            "service_date": "2026-08-15",
            "submission_date": "2026-09-01",
            "prior_auth_flag": False,
            "eligibility_verified": False,
            "days_since_eligibility_check": 70,
            "provider_specialty": "Radiology",
            "documentation_complete": False,
            "duplicate_candidate": True
        }
    ])

    X = preprocessor.fit_transform(df)
    assert isinstance(X, np.ndarray)
    assert X.shape[0] == 2
    assert X.shape[1] > 10

def test_feature_extraction_derived_interactions():
    df = pd.DataFrame([{
        "claim_id": "CLM_003",
        "patient_id": "PAT_003",
        "payer_id": "PAYER_001",  # Requires auth for 70450
        "cpt_codes": ["70450"],
        "icd_codes": ["R07.9"],
        "claim_amount": 800.0,
        "service_date": "2026-08-20",
        "submission_date": "2026-09-01",
        "prior_auth_flag": False,
        "eligibility_verified": True,
        "days_since_eligibility_check": 80,
        "provider_specialty": "Radiology",
        "documentation_complete": True,
        "duplicate_candidate": False
    }])

    feats = extract_pre_submission_features(df)
    assert feats.iloc[0]["auth_needed_and_missing"] == 1
    assert feats.iloc[0]["stale_eligibility_risk"] == 1
