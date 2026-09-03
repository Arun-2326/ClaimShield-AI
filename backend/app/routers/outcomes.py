"""
ClaimShield AI - Adjudication Outcomes Feedback Router
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.schema import ClaimDB, OutcomeDB
from app.schemas.prediction import OutcomeRequest, OutcomeResponse
from app.config import settings

router = APIRouter(prefix="/outcomes", tags=["Adjudication Feedback"])

@router.post("", response_model=OutcomeResponse)
def log_outcome_endpoint(request: OutcomeRequest, db: Session = Depends(get_db)):
    """
    Records post-adjudication outcome (e.g. simulated ERA / 835 feedback)
    for closed-loop model auditing and prospective retraining.
    """
    claim = db.query(ClaimDB).filter(ClaimDB.claim_id == request.claim_id).first()
    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Claim '{request.claim_id}' not found in system."
        )

    # Update claim status
    claim.status = request.actual_status.upper()

    outcome_id = f"OUT_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{request.claim_id}"
    record = OutcomeDB(
        outcome_id=outcome_id,
        claim_id=request.claim_id,
        actual_status=request.actual_status.upper(),
        actual_reason_code=request.actual_reason_code
    )
    db.add(record)
    db.commit()

    return OutcomeResponse(
        outcome_id=outcome_id,
        claim_id=request.claim_id,
        actual_status=record.actual_status,
        actual_reason_code=record.actual_reason_code,
        logged_at=record.logged_at.isoformat()
    )
