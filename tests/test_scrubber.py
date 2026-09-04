import pytest
from backend.models.schemas import ClaimInput
from backend.services.edi_service import generate_x12_837p_edi
from backend.services.validator import scrub_claim_rules_engine

def test_generate_x12_837p_edi():
    claim = ClaimInput(
        claim_id="CLM_EDI_TEST",
        patient_id="PAT_001",
        payer_id="PAYER_001",
        cpt_codes=["29881"],
        icd_codes=["M23.22"],
        claim_amount=3200.0,
        service_date="2026-08-20",
        prior_auth_flag=False,
        eligibility_verified=True,
        days_since_eligibility_check=10,
        provider_specialty="Orthopedic Surgery"
    )
    edi_res = generate_x12_837p_edi(claim)
    assert edi_res["segment_count"] > 10
    assert "ISA*" in edi_res["full_edi_stream"]
    assert "CLM*CLM_EDI_TEST*3200.00*" in edi_res["full_edi_stream"]
    assert edi_res["has_validation_warning"] is True

def test_scrub_claim_rules_engine():
    claim = ClaimInput(
        claim_id="CLM_SCRUB_TEST",
        patient_id="PAT_002",
        payer_id="PAYER_001",
        cpt_codes=["29881"],
        icd_codes=["M23.22"],
        claim_amount=3200.0,
        service_date="2026-08-20",
        prior_auth_flag=False,
        eligibility_verified=True
    )
    scrub_res = scrub_claim_rules_engine(claim)
    assert scrub_res["total_rules"] == 7
    assert scrub_res["failed"] >= 1  # Fails auth mandate
    assert any(r["rule_id"] == "RULE_AUTH_01" and r["status"] == "FAIL" for r in scrub_res["rules"])
