import pytest
from pydantic import ValidationError
from backend.models.schemas import ClaimInput
from backend.services.validator import validate_claim_deterministically

def test_negative_claim_amount_validation():
    # Pydantic schema validation fails on negative amount
    with pytest.raises(ValidationError):
        ClaimInput(
            claim_id="CLM_ERR_01",
            patient_id="PAT_001",
            payer_id="PAYER_001",
            cpt_codes=["99213"],
            icd_codes=["J06.9"],
            claim_amount=-50.0,
            service_date="2026-08-20"
        )

def test_future_service_date_validation():
    claim = ClaimInput(
        claim_id="CLM_VALID_01",
        patient_id="PAT_001",
        payer_id="PAYER_001",
        cpt_codes=["99213"],
        icd_codes=["J06.9"],
        claim_amount=150.0,
        service_date="2099-01-01"
    )
    is_valid, err_code, err_msg, warnings = validate_claim_deterministically(claim)
    assert not is_valid
    assert err_code == "FUTURE_SERVICE_DATE"

def test_unknown_payer_id_validation():
    claim = ClaimInput(
        claim_id="CLM_VALID_02",
        patient_id="PAT_001",
        payer_id="PAYER_NONEXISTENT_999",
        cpt_codes=["99213"],
        icd_codes=["J06.9"],
        claim_amount=150.0,
        service_date="2026-08-20"
    )
    is_valid, err_code, err_msg, warnings = validate_claim_deterministically(claim)
    assert not is_valid
    assert err_code == "UNKNOWN_PAYER_ID"

def test_unknown_cpt_warning():
    claim = ClaimInput(
        claim_id="CLM_VALID_03",
        patient_id="PAT_001",
        payer_id="PAYER_001",
        cpt_codes=["99999"],  # Unknown code
        icd_codes=["J06.9"],
        claim_amount=200.0,
        service_date="2026-08-20"
    )
    is_valid, err_code, err_msg, warnings = validate_claim_deterministically(claim)
    assert is_valid
    assert len(warnings) >= 1
    assert any(w.code == "UNKNOWN_PROCEDURE_CODE" for w in warnings)
