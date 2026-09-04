import pytest
from backend.ml.predictor import ModelService
from backend.models.schemas import ClaimInput

def test_model_service_prediction():
    service = ModelService.get_instance()
    assert service.is_loaded
    assert service.denial_model is not None

    # Clean claim
    clean_claim = ClaimInput(
        claim_id="CLM_TEST_CLEAN",
        patient_id="PAT_001",
        payer_id="PAYER_002",
        cpt_codes=["99213"],
        icd_codes=["I10"],
        claim_amount=120.0,
        service_date="2026-08-28",
        prior_auth_flag=False,
        eligibility_verified=True,
        days_since_eligibility_check=5,
        provider_specialty="Family Medicine",
        documentation_complete=True,
        duplicate_candidate=False
    )

    clean_res = service.predict_single(clean_claim)
    assert 0.0 <= clean_res.risk_score <= 1.0
    assert clean_res.risk_tier in ["low", "medium", "high"]
    assert clean_res.routing_decision in ["RELEASE", "REVIEW", "HOLD_FOR_CORRECTION"]
    assert len(clean_res.top_3_risk_factors) <= 3

def test_high_risk_missing_auth_prediction():
    service = ModelService.get_instance()

    # Knee arthroscopy without prior auth on PAYER_001
    risky_claim = ClaimInput(
        claim_id="CLM_TEST_RISKY",
        patient_id="PAT_002",
        payer_id="PAYER_001",
        cpt_codes=["29881"],
        icd_codes=["M23.22"],
        claim_amount=3200.0,
        service_date="2026-08-10",
        prior_auth_flag=False,
        eligibility_verified=True,
        days_since_eligibility_check=10,
        provider_specialty="Orthopedic Surgery",
        documentation_complete=True,
        duplicate_candidate=False
    )

    res = service.predict_single(risky_claim)
    assert res.risk_score > 0.50
    assert res.predicted_reason_code == "CO-197"
    assert res.routing_decision in ["HOLD_FOR_CORRECTION", "REVIEW"]
    assert any(f.feature == "prior_auth_flag" for f in res.top_3_risk_factors)
