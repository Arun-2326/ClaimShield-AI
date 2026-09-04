import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.db_models import Claim, Outcome
from backend.models.schemas import OutcomeCreate, OutcomeResponse

router = APIRouter(prefix="/outcomes", tags=["Outcomes Logging"])

@router.post("", response_model=OutcomeResponse, status_code=status.HTTP_201_CREATED)
def record_claim_outcome(outcome_in: OutcomeCreate, db: Session = Depends(get_db)):
    """
    Logs simulated payer adjudication outcome (ERA 835) for post-submission closed-loop auditing.
    """
    claim = db.query(Claim).filter(Claim.claim_id == outcome_in.claim_id).first()
    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Claim '{outcome_in.claim_id}' does not exist in the database."
        )

    outcome_id = f"OUT_{uuid.uuid4().hex[:8].upper()}"
    logged_time = datetime.datetime.now(datetime.timezone.utc)

    outcome = Outcome(
        outcome_id=outcome_id,
        claim_id=outcome_in.claim_id,
        actual_status=outcome_in.actual_status.upper(),
        actual_reason_code=outcome_in.actual_reason_code.upper() if outcome_in.actual_reason_code else None,
        remittance_amount=outcome_in.remittance_amount or 0.0,
        logged_at=logged_time
    )

    # Update claim status in ledger
    claim.status = f"ADJUDICATED_{outcome_in.actual_status.upper()}"

    db.add(outcome)
    db.commit()
    db.refresh(outcome)

    return OutcomeResponse(
        outcome_id=outcome.outcome_id,
        claim_id=outcome.claim_id,
        actual_status=outcome.actual_status,
        actual_reason_code=outcome.actual_reason_code,
        remittance_amount=outcome.remittance_amount,
        logged_at=outcome.logged_at.isoformat(),
        message="Simulated payer outcome successfully recorded for model performance monitoring."
    )
