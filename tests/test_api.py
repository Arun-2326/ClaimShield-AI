import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True

def test_predict_endpoint_clean_claim():
    payload = {
        "claim_id": "CLM_API_001",
        "patient_id": "PAT_API_001",
        "payer_id": "PAYER_002",
        "cpt_codes": ["99213"],
        "icd_codes": ["I10"],
        "claim_amount": 130.0,
        "service_date": "2026-08-20",
        "prior_auth_flag": False,
        "eligibility_verified": True,
        "days_since_eligibility_check": 3,
        "provider_specialty": "Family Medicine",
        "documentation_complete": True,
        "duplicate_candidate": False
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["claim_id"] == "CLM_API_001"
    assert "risk_score" in data
    assert "routing_decision" in data

def test_predict_endpoint_duplicate_block():
    payload = {
        "claim_id": "CLM_API_DUP",
        "patient_id": "PAT_API_002",
        "payer_id": "PAYER_001",
        "cpt_codes": ["99213"],
        "icd_codes": ["J06.9"],
        "claim_amount": 140.0,
        "service_date": "2026-08-20",
        "duplicate_candidate": True
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["routing_decision"] == "BLOCK_UNTIL_VALID"
    assert data["predicted_reason_code"] == "CO-18"

def test_predict_unknown_payer_404():
    payload = {
        "claim_id": "CLM_API_UNKPAYER",
        "patient_id": "PAT_API_003",
        "payer_id": "PAYER_UNKNOWN_999",
        "cpt_codes": ["99213"],
        "icd_codes": ["J06.9"],
        "claim_amount": 140.0,
        "service_date": "2026-08-20"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 404

def test_claims_queue_list():
    response = client.get("/claims?page=1&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert "claims" in data
    assert len(data["claims"]) > 0

def test_record_outcome():
    payload = {
        "claim_id": "CLM_DEMO_001",
        "actual_status": "DENIED",
        "actual_reason_code": "CO-197",
        "remittance_amount": 0.0
    }
    response = client.post("/outcomes", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["claim_id"] == "CLM_DEMO_001"
    assert data["actual_status"] == "DENIED"

def test_get_metrics():
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "accuracy" in data
    assert "roc_auc" in data
    assert "confusion_matrix" in data
    assert "financial_roi" in data
    assert "SIMULATED" in data["data_disclaimer"]
