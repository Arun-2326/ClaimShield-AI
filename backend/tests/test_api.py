"""
Integration Tests for ClaimShield AI FastAPI Endpoints
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "data_disclaimer" in data
    assert "SIMULATED / DEMO DATA" in data["data_disclaimer"]

def test_get_payers():
    response = client.get("/payers")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 6
    assert len(data["items"]) >= 6

def test_predict_clean_claim():
    payload = {
        "claim_id": "CLM_INT_001",
        "patient_id": "PAT_INT_001",
        "payer_id": "PAYER_001",
        "cpt_codes": ["99213"],
        "icd_codes": ["J06.9"],
        "claim_amount": 110.0,
        "service_date": "2026-08-20",
        "prior_auth_flag": True,
        "eligibility_verified": True,
        "days_since_eligibility_check": 3,
        "provider_specialty": "Family Medicine",
        "documentation_complete": True
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["claim_id"] == "CLM_INT_001"
    assert data["risk_score"] < 0.35
    assert data["routing_decision"] == "RELEASE"
    assert "data_disclaimer" in data

def test_predict_high_risk_missing_prior_auth():
    payload = {
        "claim_id": "CLM_INT_002",
        "patient_id": "PAT_INT_002",
        "payer_id": "PAYER_001",
        "cpt_codes": ["29881"],  # Arthroscopy, requires prior auth
        "icd_codes": ["M17.11"],
        "claim_amount": 3100.0,
        "service_date": "2026-08-20",
        "prior_auth_flag": False,  # Missing auth!
        "eligibility_verified": True,
        "days_since_eligibility_check": 10,
        "provider_specialty": "Orthopedic Surgery",
        "documentation_complete": True
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] > 0.55
    assert data["routing_decision"] in ["HOLD_FOR_CORRECTION", "REVIEW"]
    assert data["predicted_reason_code"] == "CO-197"
    assert any("Prior Authorization" in f["display_name"] for f in data["top_3_risk_factors"])

def test_predict_deterministic_block_negative_amount():
    payload = {
        "claim_id": "CLM_INT_003",
        "patient_id": "PAT_INT_003",
        "payer_id": "PAYER_001",
        "cpt_codes": ["99213"],
        "icd_codes": ["J06.9"],
        "claim_amount": -100.0,  # Invalid negative
        "service_date": "2026-08-20",
        "prior_auth_flag": True,
        "eligibility_verified": True
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["routing_decision"] == "BLOCK_UNTIL_VALID"

def test_simulate_what_if():
    original = {
        "claim_id": "CLM_WHATIF_01",
        "patient_id": "PAT_001",
        "payer_id": "PAYER_001",
        "cpt_codes": ["29881"],
        "icd_codes": ["M17.11"],
        "claim_amount": 3100.0,
        "service_date": "2026-08-20",
        "prior_auth_flag": False,
        "eligibility_verified": True,
        "days_since_eligibility_check": 10,
        "provider_specialty": "Orthopedic Surgery",
        "documentation_complete": True
    }
    modified = dict(original)
    modified["prior_auth_flag"] = True  # Fixed!

    response = client.post("/simulate/what-if", json={"original_claim": original, "modified_claim": modified})
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score_diff"] < 0
    assert data["dollars_protected"] == 3100.0

def test_get_claims_queue():
    response = client.get("/claims?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data

def test_get_metrics():
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "roc_auc" in data
    assert "confusion_matrix" in data
    assert "simulated_dollars_protected" in data
