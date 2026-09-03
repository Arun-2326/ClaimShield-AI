"""
ClaimShield AI - Predict and What-If Simulation Routers
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime
import json
from app.database import get_db
from app.models.schema import ClaimDB, DenialPredictionDB, PayerDB
from app.schemas.claim import ClaimCreate
from app.schemas.prediction import (
    PredictionResponse, WhatIfRequest, WhatIfResponse,
    WhatIfResult, ValidationWarning
)
from app.schemas.common import RoutingDecision, RiskTier
from app.services.validator import validate_claim_deterministic, VALID_PAYERS
from app.services.model_service import model_service
from app.config import settings

router = APIRouter(tags=["Pre-Submission Intelligence"])

@router.post("/predict", response_model=PredictionResponse)
def predict_claim_endpoint(claim: ClaimCreate, db: Session = Depends(get_db)):
    """
    Analyzes a synthetic claim prior to submission.
    Executes deterministic checks first; if valid, executes dual-stage ML inference.
    """
    # Check if payer is known
    if claim.payer_id not in VALID_PAYERS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payer '{claim.payer_id}' not found in clearinghouse directory."
        )

    # Check for confirmed duplicate claim in DB
    existing_claim = db.query(ClaimDB).filter(ClaimDB.claim_id == claim.claim_id).first()
    existing_ids = {existing_claim.claim_id} if existing_claim else set()

    # Deterministic validation
    val_result = validate_claim_deterministic(claim, existing_claim_ids=None)

    # If deterministic hard error: block claim
    if not val_result.is_valid:
        # If it's a confirmed duplicate attempt
        if "duplicate" in (val_result.hard_error or "").lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=val_result.hard_error
            )
        # Block until valid response
        return PredictionResponse(
            claim_id=claim.claim_id,
            risk_score=1.0,
            risk_tier=RiskTier.CRITICAL_ERROR,
            predicted_reason_code="CO-16",
            reason_description="Deterministic validation failure.",
            reason_confidence=1.0,
            top_3_risk_factors=[],
            recommended_action=f"Resolve validation blocker: {val_result.hard_error}",
            routing_decision=RoutingDecision.BLOCK_UNTIL_VALID,
            routing_reason=val_result.hard_error or "Claim failed pre-submission validation rules.",
            validation_warnings=val_result.warnings,
            model_version=settings.MODEL_VERSION,
            policy_version=settings.POLICY_VERSION,
            created_at=datetime.utcnow().isoformat() + "Z",
            data_disclaimer=settings.DATA_DISCLAIMER
        )

    # Execute ML prediction pipeline
    claim_dict = claim.model_dump()
    prediction_result = model_service.predict_claim(claim_dict, warnings=val_result.warnings)

    # Persist or update claim in DB
    if not existing_claim:
        existing_claim = ClaimDB(
            claim_id=claim.claim_id,
            patient_id=claim.patient_id,
            payer_id=claim.payer_id,
            cpt_codes=claim.cpt_codes,
            icd_codes=claim.icd_codes,
            claim_amount=claim.claim_amount,
            service_date=claim.service_date,
            submission_date=claim.submission_date or datetime.utcnow().strftime("%Y-%m-%d"),
            prior_auth_flag=claim.prior_auth_flag,
            eligibility_verified=claim.eligibility_verified,
            days_since_eligibility_check=claim.days_since_eligibility_check,
            provider_specialty=claim.provider_specialty,
            documentation_complete=claim.documentation_complete,
            duplicate_candidate=claim.duplicate_candidate or False,
            timely_filing_risk=claim.timely_filing_risk or False,
            coverage_indicator=claim.coverage_indicator if claim.coverage_indicator is not None else True,
            medical_necessity_indicator=claim.medical_necessity_indicator if claim.medical_necessity_indicator is not None else True,
            bundling_indicator=claim.bundling_indicator or False,
            status=prediction_result["routing_decision"].value if hasattr(prediction_result["routing_decision"], "value") else str(prediction_result["routing_decision"])
        )
        db.add(existing_claim)
    else:
        # Update existing record
        existing_claim.prior_auth_flag = claim.prior_auth_flag
        existing_claim.eligibility_verified = claim.eligibility_verified
        existing_claim.days_since_eligibility_check = claim.days_since_eligibility_check
        existing_claim.documentation_complete = claim.documentation_complete
        existing_claim.status = prediction_result["routing_decision"].value if hasattr(prediction_result["routing_decision"], "value") else str(prediction_result["routing_decision"])

    # Persist prediction
    pred_record = DenialPredictionDB(
        prediction_id=f"PRED_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{claim.claim_id}",
        claim_id=claim.claim_id,
        risk_score=prediction_result["risk_score"],
        risk_tier=prediction_result["risk_tier"].value if hasattr(prediction_result["risk_tier"], "value") else str(prediction_result["risk_tier"]),
        predicted_reason_code=prediction_result["predicted_reason_code"],
        reason_confidence=prediction_result["reason_confidence"],
        top_features=prediction_result["top_3_risk_factors"],
        recommended_action=prediction_result["recommended_action"],
        routing_decision=prediction_result["routing_decision"].value if hasattr(prediction_result["routing_decision"], "value") else str(prediction_result["routing_decision"]),
        model_version=settings.MODEL_VERSION
    )
    db.add(pred_record)
    db.commit()

    return PredictionResponse(**prediction_result)

@router.post("/simulate/what-if", response_model=WhatIfResponse)
def simulate_what_if_endpoint(request: WhatIfRequest):
    """
    Interactively compares original vs modified claim parameters in real time.
    Calculates exact risk probability drop and protected revenue.
    """
    orig_pred = model_service.predict_claim(request.original_claim.model_dump())
    mod_pred = model_service.predict_claim(request.modified_claim.model_dump())

    diff = round(mod_pred["risk_score"] - orig_pred["risk_score"], 2)

    if diff < -0.25:
        verdict = "SIGNIFICANT_DENIAL_RISK_AVOIDED"
    elif diff < 0:
        verdict = "MODERATE_DENIAL_RISK_REDUCTION"
    elif diff == 0:
        verdict = "NO_CHANGE_IN_RISK"
    else:
        verdict = "DENIAL_RISK_INCREASED"

    # Simulated revenue protected (if risk lowered from high/medium to low)
    dollars = request.original_claim.claim_amount if diff < -0.15 else 0.0

    return WhatIfResponse(
        claim_id=request.original_claim.claim_id,
        original=WhatIfResult(
            risk_score=orig_pred["risk_score"],
            risk_tier=orig_pred["risk_tier"],
            routing_decision=orig_pred["routing_decision"],
            predicted_reason_code=orig_pred["predicted_reason_code"],
            recommended_action=orig_pred["recommended_action"]
        ),
        modified=WhatIfResult(
            risk_score=mod_pred["risk_score"],
            risk_tier=mod_pred["risk_tier"],
            routing_decision=mod_pred["routing_decision"],
            predicted_reason_code=mod_pred["predicted_reason_code"],
            recommended_action=mod_pred["recommended_action"]
        ),
        risk_score_diff=diff,
        verdict=verdict,
        dollars_protected=round(dollars, 2),
        data_disclaimer=settings.DATA_DISCLAIMER
    )
