from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.database import get_db
from backend.models.db_models import Claim, DenialPrediction, Outcome
from backend.models.schemas import ClaimInput, ClaimSummary, ClaimDetailResponse, PredictionResult
from backend.services.claim_service import get_claims_queue, save_claim_and_prediction
from backend.ml.predictor import ModelService

router = APIRouter(prefix="/claims", tags=["Claims Queue"])

@router.get("", response_model=Dict[str, Any])
def list_claims(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    tier: Optional[str] = Query(None, description="Filter by risk tier: low, medium, high, error"),
    routing_decision: Optional[str] = Query(None, description="Filter by routing decision: RELEASE, REVIEW, HOLD_FOR_CORRECTION, BLOCK_UNTIL_VALID"),
    payer_id: Optional[str] = Query(None, description="Filter by payer ID"),
    db: Session = Depends(get_db)
):
    claims, total = get_claims_queue(
        db, page=page, limit=limit, tier=tier, routing_decision=routing_decision, payer_id=payer_id
    )
    return {
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1,
        "claims": claims
    }


@router.get("/{claim_id}", response_model=ClaimDetailResponse)
def get_claim_detail(claim_id: str, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.claim_id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Claim '{claim_id}' not found.")

    latest_pred = (
        db.query(DenialPrediction)
        .filter(DenialPrediction.claim_id == claim_id)
        .order_by(desc(DenialPrediction.created_at))
        .first()
    )

    pred_res = None
    if latest_pred:
        pred_res = PredictionResult(
            claim_id=claim.claim_id,
            risk_score=latest_pred.risk_score,
            risk_tier=latest_pred.risk_tier,
            predicted_reason_code=latest_pred.predicted_reason_code,
            reason_confidence=latest_pred.reason_confidence,
            top_3_risk_factors=latest_pred.top_features or [],
            recommended_action=latest_pred.recommended_action,
            routing_decision=latest_pred.routing_decision,
            routing_reason="Retrieved from prediction record",
            validation_warnings=[],
            model_version=latest_pred.model_version,
            policy_version=latest_pred.policy_version,
            created_at=latest_pred.created_at.isoformat() if latest_pred.created_at else ""
        )

    latest_outcome = (
        db.query(Outcome)
        .filter(Outcome.claim_id == claim_id)
        .order_by(desc(Outcome.logged_at))
        .first()
    )

    summary = ClaimSummary(
        claim_id=claim.claim_id,
        patient_id=claim.patient_id,
        payer_id=claim.payer_id,
        payer_name=claim.payer.name if claim.payer else claim.payer_id,
        cpt_codes=claim.cpt_codes,
        claim_amount=claim.claim_amount,
        service_date=claim.service_date,
        risk_score=latest_pred.risk_score if latest_pred else None,
        risk_tier=latest_pred.risk_tier if latest_pred else None,
        predicted_reason_code=latest_pred.predicted_reason_code if latest_pred else None,
        routing_decision=latest_pred.routing_decision if latest_pred else claim.status,
        status=claim.status,
        created_at=claim.created_at.isoformat() if claim.created_at else ""
    )

    outcome_data = None
    if latest_outcome:
        outcome_data = {
            "actual_status": latest_outcome.actual_status,
            "actual_reason_code": latest_outcome.actual_reason_code,
            "remittance_amount": latest_outcome.remittance_amount,
            "logged_at": latest_outcome.logged_at.isoformat() if latest_outcome.logged_at else ""
        }

    return ClaimDetailResponse(
        claim=summary,
        latest_prediction=pred_res,
        actual_outcome=outcome_data
    )
