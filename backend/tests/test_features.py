"""
Unit Tests for Feature Engineering & Strict Leakage Auditing
"""
import pytest
import pandas as pd
from app.services.feature_pipeline import (
    FEATURE_COLUMNS, extract_features_from_claim_dict,
    assert_no_data_leakage, LEAKAGE_COLUMNS
)

def test_extract_features_shape_and_columns():
    sample_claim = {
        "claim_id": "CLM_000001",
        "patient_id": "PAT_000001",
        "payer_id": "PAYER_001",
        "cpt_codes": ["99214"],
        "icd_codes": ["I10"],
        "claim_amount": 175.0,
        "service_date": "2026-08-20",
        "prior_auth_flag": False,
        "eligibility_verified": True,
        "days_since_eligibility_check": 10,
        "provider_specialty": "Cardiology",
        "documentation_complete": True
    }
    df = extract_features_from_claim_dict(sample_claim)
    assert df.shape == (1, len(FEATURE_COLUMNS))
    assert list(df.columns) == FEATURE_COLUMNS
    assert df.iloc[0]["payer_PAYER_001"] == 1
    assert df.iloc[0]["spec_Cardiology"] == 1
    assert df.iloc[0]["prior_auth_flag"] == 0

def test_leakage_assertion_catches_target_columns():
    for leaked_col in LEAKAGE_COLUMNS:
        bad_df = pd.DataFrame({"claim_amount": [100.0], leaked_col: [1]})
        with pytest.raises(ValueError, match="CRITICAL DATA LEAKAGE DETECTED"):
            assert_no_data_leakage(bad_df)

def test_feature_columns_have_zero_leakage():
    # Verify the official list of model features contains zero leakage columns
    assert assert_no_data_leakage(FEATURE_COLUMNS) is True
