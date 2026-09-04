import pytest
import pandas as pd
from backend.ml.preprocessor import (
    extract_pre_submission_features,
    EXCLUDED_TARGET_AND_POST_SUBMISSION_COLUMNS
)

def test_leakage_columns_are_dropped():
    # Construct a raw dataframe containing post-submission fields
    df_raw = pd.DataFrame([{
        "claim_id": "CLM_TEST_001",
        "patient_id": "PAT_0001",
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
        "duplicate_candidate": False,
        "timely_filing_risk": False,
        # Potentially leaking fields:
        "will_be_denied": 1,
        "actual_reason_code": "CO-197",
        "actual_status": "DENIED",
        "payment_amount": 0.0,
        "remittance_date": "2026-09-15",
        "appeal_outcome": "REJECTED",
        "post_submission_status": "FINAL_DENIAL"
    }])

    features = extract_pre_submission_features(df_raw)

    for col in EXCLUDED_TARGET_AND_POST_SUBMISSION_COLUMNS:
        assert col not in features.columns, f"Target or post-submission column '{col}' leaked into feature matrix!"

def test_no_target_names_in_feature_names():
    from backend.ml.preprocessor import PreSubmissionPreprocessor
    preprocessor = PreSubmissionPreprocessor()
    df_raw = pd.DataFrame([{
        "claim_id": "CLM_TEST_002",
        "patient_id": "PAT_0002",
        "payer_id": "PAYER_002",
        "cpt_codes": ["70450"],
        "icd_codes": ["R07.9"],
        "claim_amount": 950.0,
        "service_date": "2026-08-25",
        "submission_date": "2026-09-01",
        "prior_auth_flag": False,
        "eligibility_verified": True,
        "days_since_eligibility_check": 5,
        "provider_specialty": "Radiology",
        "documentation_complete": True,
        "duplicate_candidate": False,
        "timely_filing_risk": False
    }])
    preprocessor.fit(df_raw)
    feature_names = preprocessor.get_feature_names()

    for col in EXCLUDED_TARGET_AND_POST_SUBMISSION_COLUMNS:
        assert col not in feature_names
