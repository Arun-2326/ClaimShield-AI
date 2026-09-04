from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.schemas import ClaimInput, PredictionResult
from backend.services.edi_service import generate_x12_837p_edi
from backend.services.validator import scrub_claim_rules_engine
from backend.ml.predictor import ModelService
from backend.services.claim_service import save_claim_and_prediction

router = APIRouter(prefix="/scrubber", tags=["Enterprise Scrubbing & EDI"])

class RemediationRequest(BaseModel):
    claim: ClaimInput
    action: str  # "ATTACH_AUTH" | "REFRESH_ELIGIBILITY" | "ATTACH_DOCUMENTATION" | "CLEAR_DUPLICATE"
    auth_number: Optional[str] = None

class RemediationResponse(BaseModel):
    original_risk_score: float
    remediated_risk_score: float
    net_risk_reduction: float
    action_applied: str
    remediated_claim: ClaimInput
    new_prediction: PredictionResult
    updated_edi_stream: str

@router.post("/edi-837")
def get_claim_edi_837(claim: ClaimInput):
    """
    Generates an authentic ANSI ASC X12N 837P electronic claim file stream
    with interactive segment breakdown, loop annotations, and warning flags.
    """
    return generate_x12_837p_edi(claim)

@router.post("/rules-audit")
def audit_claim_rules(claim: ClaimInput):
    """
    Executes the clearinghouse scrubbing edit rules matrix (NCCI, LCD, Auth, Timely Filing).
    """
    return scrub_claim_rules_engine(claim)

@router.post("/remediate", response_model=RemediationResponse)
def apply_1click_remediation(req: RemediationRequest, db: Session = Depends(get_db)):
    """
    Executes 1-Click Auto-Remediation on a held claim:
    1. Applies clinical/billing fix to claim payload
    2. Recalculates dual-stage ML denial risk
    3. Regenerates X12 837P EDI with injected segments (e.g. Loop 2300 REF*G1)
    4. Updates database state
    """
    claim_copy = req.claim.model_copy()
    model_service = ModelService.get_instance()

    # Initial baseline risk
    initial_res = model_service.predict_single(claim_copy)

    # Apply remediation logic
    if req.action == "ATTACH_AUTH":
        claim_copy.prior_auth_flag = True
    elif req.action == "REFRESH_ELIGIBILITY":
        claim_copy.eligibility_verified = True
        claim_copy.days_since_eligibility_check = 0
    elif req.action == "ATTACH_DOCUMENTATION":
        claim_copy.documentation_complete = True
    elif req.action == "CLEAR_DUPLICATE":
        claim_copy.duplicate_candidate = False

    # Re-predict
    new_res = model_service.predict_single(claim_copy)

    # Persist updated claim to database
    save_claim_and_prediction(db, claim_copy, new_res)

    # Generate updated EDI stream
    edi_res = generate_x12_837p_edi(claim_copy, prior_auth_number=req.auth_number)

    delta = initial_res.risk_score - new_res.risk_score

    return RemediationResponse(
        original_risk_score=initial_res.risk_score,
        remediated_risk_score=new_res.risk_score,
        net_risk_reduction=round(delta, 3),
        action_applied=req.action,
        remediated_claim=claim_copy,
        new_prediction=new_res,
        updated_edi_stream=edi_res["full_edi_stream"]
    )
