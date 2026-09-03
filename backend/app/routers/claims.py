"""
ClaimShield AI - Claims Management and Queue Routers
"""
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import pandas as pd
import io
from app.database import get_db
from app.models.schema import ClaimDB, DenialPredictionDB, PayerDB, OutcomeDB
from app.schemas.claim import ClaimCreate, ClaimResponse, BatchClaimUpload
from app.services.model_service import model_service
from app.config import settings

router = APIRouter(prefix="/claims", tags=["Claims Queue"])

@router.get("")
def get_claims_queue(
    skip: int = 0,
    limit: int = 50,
    risk_tier: Optional[str] = None,
    routing_decision: Optional[str] = None,
    payer_id: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns paginated claims queue with latest pre-submission predictions and risk levels.
    """
    query = db.query(ClaimDB)

    if payer_id:
        query = query.filter(ClaimDB.payer_id == payer_id)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (ClaimDB.claim_id.ilike(search_fmt)) |
            (ClaimDB.patient_id.ilike(search_fmt)) |
            (ClaimDB.provider_specialty.ilike(search_fmt))
        )

    claims = query.order_by(ClaimDB.created_at.desc()).offset(skip).limit(limit).all()

    results = []
    for c in claims:
        # Get latest prediction
        latest_pred = db.query(DenialPredictionDB).filter(
            DenialPredictionDB.claim_id == c.claim_id
        ).order_by(DenialPredictionDB.created_at.desc()).first()

        tier = latest_pred.risk_tier if latest_pred else "low"
        decision = latest_pred.routing_decision if latest_pred else "RELEASE"
        score = latest_pred.risk_score if latest_pred else 0.15
        reason = latest_pred.predicted_reason_code if latest_pred else None

        # Filter by tier / decision if specified
        if risk_tier and tier.lower() != risk_tier.lower():
            continue
        if routing_decision and decision.upper() != routing_decision.upper():
            continue

        results.append({
            "claim_id": c.claim_id,
            "patient_id": c.patient_id,
            "payer_id": c.payer_id,
            "cpt_codes": c.cpt_codes if isinstance(c.cpt_codes, list) else json.loads(c.cpt_codes or "[]"),
            "icd_codes": c.icd_codes if isinstance(c.icd_codes, list) else json.loads(c.icd_codes or "[]"),
            "claim_amount": c.claim_amount,
            "service_date": c.service_date,
            "submission_date": c.submission_date,
            "prior_auth_flag": c.prior_auth_flag,
            "eligibility_verified": c.eligibility_verified,
            "days_since_eligibility_check": c.days_since_eligibility_check,
            "provider_specialty": c.provider_specialty,
            "status": c.status,
            "risk_score": score,
            "risk_tier": tier,
            "routing_decision": decision,
            "predicted_reason_code": reason,
            "created_at": c.created_at.isoformat() if c.created_at else None
        })

    total_count = db.query(ClaimDB).count()

    return {
        "total": total_count,
        "count": len(results),
        "skip": skip,
        "limit": limit,
        "data_disclaimer": settings.DATA_DISCLAIMER,
        "items": results
    }

@router.get("/{claim_id}")
def get_claim_detail(claim_id: str, db: Session = Depends(get_db)):
    """
    Returns full claim profile, complete prediction history, and outcome feedback.
    """
    claim = db.query(ClaimDB).filter(ClaimDB.claim_id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim '{claim_id}' not found.")

    predictions = db.query(DenialPredictionDB).filter(
        DenialPredictionDB.claim_id == claim_id
    ).order_by(DenialPredictionDB.created_at.desc()).all()

    outcomes = db.query(OutcomeDB).filter(OutcomeDB.claim_id == claim_id).all()

    return {
        "claim": {
            "claim_id": claim.claim_id,
            "patient_id": claim.patient_id,
            "payer_id": claim.payer_id,
            "cpt_codes": claim.cpt_codes if isinstance(claim.cpt_codes, list) else json.loads(claim.cpt_codes or "[]"),
            "icd_codes": claim.icd_codes if isinstance(claim.icd_codes, list) else json.loads(claim.icd_codes or "[]"),
            "claim_amount": claim.claim_amount,
            "service_date": claim.service_date,
            "submission_date": claim.submission_date,
            "prior_auth_flag": claim.prior_auth_flag,
            "eligibility_verified": claim.eligibility_verified,
            "days_since_eligibility_check": claim.days_since_eligibility_check,
            "provider_specialty": claim.provider_specialty,
            "documentation_complete": claim.documentation_complete,
            "status": claim.status,
            "created_at": claim.created_at.isoformat() if claim.created_at else None
        },
        "predictions": [
            {
                "prediction_id": p.prediction_id,
                "risk_score": p.risk_score,
                "risk_tier": p.risk_tier,
                "predicted_reason_code": p.predicted_reason_code,
                "reason_confidence": p.reason_confidence,
                "top_features": p.top_features,
                "recommended_action": p.recommended_action,
                "routing_decision": p.routing_decision,
                "created_at": p.created_at.isoformat() if p.created_at else None
            }
            for p in predictions
        ],
        "outcomes": [
            {
                "outcome_id": o.outcome_id,
                "actual_status": o.actual_status,
                "actual_reason_code": o.actual_reason_code,
                "logged_at": o.logged_at.isoformat() if o.logged_at else None
            }
            for o in outcomes
        ],
        "data_disclaimer": settings.DATA_DISCLAIMER
    }

@router.post("/batch-upload")
async def batch_upload_claims(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Intakes synthetic claims CSV and scores each claim against the pre-submission engine.
    """
    contents = await file.read()
    try:
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    processed = 0
    held = 0
    released = 0

    for _, row in df.iterrows():
        claim_id = str(row.get("claim_id", f"CLM_{datetime.utcnow().strftime('%M%S%f')}"))
        payer_id = str(row.get("payer_id", "PAYER_001"))
        amount = float(row.get("claim_amount", 150.0))

        cpt_raw = row.get("cpt_codes", '["99214"]')
        cpt_codes = json.loads(cpt_raw) if isinstance(cpt_raw, str) and cpt_raw.startswith("[") else [str(cpt_raw)]

        icd_raw = row.get("icd_codes", '["I10"]')
        icd_codes = json.loads(icd_raw) if isinstance(icd_raw, str) and icd_raw.startswith("[") else [str(icd_raw)]

        claim_dict = {
            "claim_id": claim_id,
            "patient_id": str(row.get("patient_id", "PAT_BATCH")),
            "payer_id": payer_id,
            "cpt_codes": cpt_codes,
            "icd_codes": icd_codes,
            "claim_amount": amount,
            "service_date": str(row.get("service_date", datetime.utcnow().strftime("%Y-%m-%d"))),
            "prior_auth_flag": bool(row.get("prior_auth_flag", False)),
            "eligibility_verified": bool(row.get("eligibility_verified", True)),
            "days_since_eligibility_check": int(row.get("days_since_eligibility_check", 5)),
            "provider_specialty": str(row.get("provider_specialty", "Family Medicine")),
            "documentation_complete": bool(row.get("documentation_complete", True))
        }

        # Predict
        pred = model_service.predict_claim(claim_dict)
        decision_str = pred["routing_decision"].value if hasattr(pred["routing_decision"], "value") else str(pred["routing_decision"])

        # Insert into DB if not existing
        existing = db.query(ClaimDB).filter(ClaimDB.claim_id == claim_id).first()
        if not existing:
            new_claim = ClaimDB(
                claim_id=claim_id,
                patient_id=claim_dict["patient_id"],
                payer_id=payer_id,
                cpt_codes=cpt_codes,
                icd_codes=icd_codes,
                claim_amount=amount,
                service_date=claim_dict["service_date"],
                prior_auth_flag=claim_dict["prior_auth_flag"],
                eligibility_verified=claim_dict["eligibility_verified"],
                days_since_eligibility_check=claim_dict["days_since_eligibility_check"],
                provider_specialty=claim_dict["provider_specialty"],
                documentation_complete=claim_dict["documentation_complete"],
                status=decision_str
            )
            db.add(new_claim)
            db.flush()

            pred_record = DenialPredictionDB(
                prediction_id=f"PRED_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{claim_id}",
                claim_id=claim_id,
                risk_score=pred["risk_score"],
                risk_tier=pred["risk_tier"].value if hasattr(pred["risk_tier"], "value") else str(pred["risk_tier"]),
                predicted_reason_code=pred["predicted_reason_code"],
                reason_confidence=pred["reason_confidence"],
                top_features=pred["top_3_risk_factors"],
                recommended_action=pred["recommended_action"],
                routing_decision=decision_str,
                model_version=settings.MODEL_VERSION
            )
            db.add(pred_record)

        processed += 1
        if "HOLD" in decision_str:
            held += 1
        elif "RELEASE" in decision_str:
            released += 1

    db.commit()
    return {
        "status": "success",
        "processed_count": processed,
        "released_count": released,
        "held_for_correction": held,
        "data_disclaimer": settings.DATA_DISCLAIMER
    }
