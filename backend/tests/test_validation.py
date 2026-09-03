"""
Unit Tests for Deterministic Pre-Submission Validation Layer
"""
import pytest
from app.schemas.claim import ClaimCreate
from app.services.validator import validate_claim_deterministic

def test_valid_clean_claim():
    claim = ClaimCreate(
        claim_id="CLM_TEST_001",
        patient_id="PAT_001",
        payer_id="PAYER_001",
        cpt_codes=["99213"],
        icd_codes=["J06.9"],
        claim_amount=120.0,
        service_date="2026-08-20",
        prior_auth_flag=True,
        eligibility_verified=True,
        days_since_eligibility_check=5,
        provider_specialty="Family Medicine",
        documentation_complete=True
    )
    result = validate_claim_deterministic(claim)
    assert result.is_valid is True
    assert result.hard_error is None
    assert len(result.warnings) == 0

def test_negative_claim_amount_rejected():
    claim = ClaimCreate(
        claim_id="CLM_TEST_002",
        patient_id="PAT_001",
        payer_id="PAYER_001",
        cpt_codes=["99213"],
        icd_codes=["J06.9"],
        claim_amount=-50.0,
        service_date="2026-08-20",
        prior_auth_flag=True,
        eligibility_verified=True
    )
    result = validate_claim_deterministic(claim)
    assert result.is_valid is False
    assert "strictly positive" in result.hard_error

def test_unknown_payer_rejected():
    claim = ClaimCreate(
        claim_id="CLM_TEST_003",
        patient_id="PAT_001",
        payer_id="PAYER_UNKNOWN_999",
        cpt_codes=["99213"],
        icd_codes=["J06.9"],
        claim_amount=150.0,
        service_date="2026-08-20",
        prior_auth_flag=True,
        eligibility_verified=True
    )
    result = validate_claim_deterministic(claim)
    assert result.is_valid is False
    assert "Unknown payer" in result.hard_error

def test_future_service_date_rejected():
    claim = ClaimCreate(
        claim_id="CLM_TEST_004",
        patient_id="PAT_001",
        payer_id="PAYER_001",
        cpt_codes=["99213"],
        icd_codes=["J06.9"],
        claim_amount=150.0,
        service_date="2099-01-01",
        prior_auth_flag=True,
        eligibility_verified=True
    )
    result = validate_claim_deterministic(claim)
    assert result.is_valid is False
    assert "Future service date" in result.hard_error

def test_soft_warnings_unverified_eligibility_and_incomplete_docs():
    claim = ClaimCreate(
        claim_id="CLM_TEST_005",
        patient_id="PAT_001",
        payer_id="PAYER_001",
        cpt_codes=["99213"],
        icd_codes=["J06.9"],
        claim_amount=120.0,
        service_date="2026-08-20",
        prior_auth_flag=True,
        eligibility_verified=False,
        documentation_complete=False
    )
    result = validate_claim_deterministic(claim)
    assert result.is_valid is True
    warning_codes = [w.code for w in result.warnings]
    assert "UNVERIFIED_ELIGIBILITY" in warning_codes
    assert "INCOMPLETE_DOCUMENTATION" in warning_codes
