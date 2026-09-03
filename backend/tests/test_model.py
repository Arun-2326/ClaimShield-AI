"""
Unit Tests for Machine Learning Training & Inference
"""
import pytest
from app.services.data_generator import generate_synthetic_claims
from app.services.model_service import DenialModelService
from app.schemas.common import RiskTier, RoutingDecision

def test_synthetic_data_generation():
    df = generate_synthetic_claims(num_records=200, seed=42)
    assert len(df) == 200
    assert "will_be_denied" in df.columns
    assert "actual_reason_code" in df.columns
    assert df["will_be_denied"].isin([0, 1]).all()
    # Check that both classes exist
    assert df["will_be_denied"].nunique() == 2

def test_model_training_and_prediction():
    df = generate_synthetic_claims(num_records=300, seed=42)
    service = DenialModelService()
    metadata = service.train_and_save(df, save_to_disk=False)

    assert service.is_loaded() is True
    assert "metrics" in metadata
    assert metadata["metrics"]["roc_auc"] > 0.65

    # Predict a sample claim
    test_claim = {
        "claim_id": "CLM_SAMPLE",
        "patient_id": "PAT_001",
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
    pred = service.predict_claim(test_claim)
    assert 0.0 <= pred["risk_score"] <= 1.0
    assert pred["risk_tier"] in [RiskTier.LOW, RiskTier.MEDIUM, RiskTier.HIGH]
    assert pred["routing_decision"] in [
        RoutingDecision.RELEASE, RoutingDecision.REVIEW, RoutingDecision.HOLD_FOR_CORRECTION
    ]
    assert "top_3_risk_factors" in pred
    assert len(pred["top_3_risk_factors"]) <= 3
