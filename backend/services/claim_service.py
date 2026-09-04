import json
import uuid
import datetime
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.models.db_models import Claim, Payer, DenialPrediction, Outcome
from backend.models.schemas import ClaimInput, PredictionResult, ClaimSummary, ClaimDetailResponse
from backend.ml.generator import PAYER_REFERENCE, CPT_REFERENCE, ICD_REFERENCE
from backend.config import settings

def seed_payers_and_demo_claims(db: Session):
    """
    Seeds standard synthetic payers and initial claims into the SQLite database.
    """
    # 1. Seed Payers if empty
    existing_payer_count = db.query(Payer).count()
    if existing_payer_count == 0:
        for p_data in PAYER_REFERENCE:
            payer = Payer(
                payer_id=p_data["payer_id"],
                name=p_data["name"],
                avg_denial_rate=p_data["avg_denial_rate"],
                timely_filing_days=p_data["timely_filing_days"],
                requires_prior_auth=p_data["requires_prior_auth"]
            )
            db.add(payer)
        db.commit()

    # 2. Seed Initial Preset Demo Claims if empty
    existing_claim_count = db.query(Claim).count()
    if existing_claim_count == 0:
        demo_presets = [
            {
                "claim_id": "CLM_DEMO_001",
                "patient_id": "PAT_00101",
                "payer_id": "PAYER_001",
                "cpt_codes": ["29881"],
                "icd_codes": ["M23.22"],
                "claim_amount": 3450.0,
                "service_date": (datetime.date.today() - datetime.timedelta(days=14)).isoformat(),
                "prior_auth_flag": False,
                "eligibility_verified": True,
                "days_since_eligibility_check": 10,
                "provider_specialty": "Orthopedic Surgery",
                "documentation_complete": True,
                "duplicate_candidate": False,
                "status": "HOLD_FOR_CORRECTION",
                "risk_score": 0.88,
                "risk_tier": "high",
                "predicted_reason_code": "CO-197",
                "routing_decision": "HOLD_FOR_CORRECTION",
                "action": "Obtain prior authorization certification number from payer before submission."
            },
            {
                "claim_id": "CLM_DEMO_002",
                "patient_id": "PAT_00102",
                "payer_id": "PAYER_002",
                "cpt_codes": ["99213"],
                "icd_codes": ["I10"],
                "claim_amount": 145.0,
                "service_date": (datetime.date.today() - datetime.timedelta(days=5)).isoformat(),
                "prior_auth_flag": False,
                "eligibility_verified": True,
                "days_since_eligibility_check": 4,
                "provider_specialty": "Family Medicine",
                "documentation_complete": True,
                "duplicate_candidate": False,
                "status": "RELEASE",
                "risk_score": 0.08,
                "risk_tier": "low",
                "predicted_reason_code": None,
                "routing_decision": "RELEASE",
                "action": "Claim cleared for immediate electronic 837 batch transmission."
            },
            {
                "claim_id": "CLM_DEMO_003",
                "patient_id": "PAT_00103",
                "payer_id": "PAYER_003",
                "cpt_codes": ["99283"],
                "icd_codes": ["R07.9"],
                "claim_amount": 890.0,
                "service_date": (datetime.date.today() - datetime.timedelta(days=110)).isoformat(),
                "prior_auth_flag": True,
                "eligibility_verified": True,
                "days_since_eligibility_check": 110,
                "provider_specialty": "Emergency Medicine",
                "documentation_complete": True,
                "duplicate_candidate": False,
                "status": "HOLD_FOR_CORRECTION",
                "risk_score": 0.84,
                "risk_tier": "high",
                "predicted_reason_code": "CO-29",
                "routing_decision": "HOLD_FOR_CORRECTION",
                "action": "Verify service date against timely-filing limits (90 days for PAYER_003)."
            },
            {
                "claim_id": "CLM_DEMO_004",
                "patient_id": "PAT_00104",
                "payer_id": "PAYER_004",
                "cpt_codes": ["70450"],
                "icd_codes": ["R07.9"],
                "claim_amount": 1120.0,
                "service_date": (datetime.date.today() - datetime.timedelta(days=22)).isoformat(),
                "prior_auth_flag": True,
                "eligibility_verified": False,
                "days_since_eligibility_check": 75,
                "provider_specialty": "Radiology",
                "documentation_complete": False,
                "duplicate_candidate": False,
                "status": "REVIEW",
                "risk_score": 0.62,
                "risk_tier": "medium",
                "predicted_reason_code": "CO-27",
                "routing_decision": "REVIEW",
                "action": "Execute real-time 270/271 eligibility check and attach clinical encounter notes."
            }
        ]

        for demo in demo_presets:
            claim = Claim(
                claim_id=demo["claim_id"],
                patient_id=demo["patient_id"],
                payer_id=demo["payer_id"],
                cpt_codes=demo["cpt_codes"],
                icd_codes=demo["icd_codes"],
                claim_amount=demo["claim_amount"],
                service_date=demo["service_date"],
                submission_date=datetime.date.today().isoformat(),
                prior_auth_flag=demo["prior_auth_flag"],
                eligibility_verified=demo["eligibility_verified"],
                days_since_eligibility_check=demo["days_since_eligibility_check"],
                provider_specialty=demo["provider_specialty"],
                documentation_complete=demo["documentation_complete"],
                duplicate_candidate=demo["duplicate_candidate"],
                status=demo["status"]
            )
            db.add(claim)

            prediction = DenialPrediction(
                prediction_id=f"PRED_{uuid.uuid4().hex[:8].upper()}",
                claim_id=demo["claim_id"],
                risk_score=demo["risk_score"],
                risk_tier=demo["risk_tier"],
                predicted_reason_code=demo["predicted_reason_code"],
                reason_confidence=0.82,
                top_features=[],
                recommended_action=demo["action"],
                routing_decision=demo["routing_decision"],
                model_version=settings.MODEL_VERSION,
                policy_version=settings.POLICY_VERSION
            )
            db.add(prediction)

        db.commit()


def save_claim_and_prediction(db: Session, claim_in: ClaimInput, prediction: PredictionResult) -> Claim:
    """
    Persists claim and associated model prediction record.
    """
    existing = db.query(Claim).filter(Claim.claim_id == claim_in.claim_id).first()
    if not existing:
        claim = Claim(
            claim_id=claim_in.claim_id,
            patient_id=claim_in.patient_id,
            payer_id=claim_in.payer_id,
            cpt_codes=claim_in.cpt_codes,
            icd_codes=claim_in.icd_codes,
            claim_amount=claim_in.claim_amount,
            service_date=claim_in.service_date,
            submission_date=claim_in.submission_date or datetime.date.today().isoformat(),
            prior_auth_flag=claim_in.prior_auth_flag,
            eligibility_verified=claim_in.eligibility_verified,
            days_since_eligibility_check=claim_in.days_since_eligibility_check,
            provider_specialty=claim_in.provider_specialty,
            documentation_complete=claim_in.documentation_complete,
            duplicate_candidate=claim_in.duplicate_candidate,
            status=prediction.routing_decision
        )
        db.add(claim)
    else:
        claim = existing
        claim.status = prediction.routing_decision

    # Add prediction record
    pred_record = DenialPrediction(
        prediction_id=f"PRED_{uuid.uuid4().hex[:8].upper()}",
        claim_id=claim_in.claim_id,
        risk_score=prediction.risk_score,
        risk_tier=prediction.risk_tier,
        predicted_reason_code=prediction.predicted_reason_code,
        reason_confidence=prediction.reason_confidence,
        top_features=[item.model_dump() for item in prediction.top_3_risk_factors],
        recommended_action=prediction.recommended_action,
        routing_decision=prediction.routing_decision,
        model_version=prediction.model_version,
        policy_version=prediction.policy_version
    )
    db.add(pred_record)
    db.commit()
    db.refresh(claim)
    return claim


def get_claims_queue(
    db: Session,
    page: int = 1,
    limit: int = 20,
    tier: Optional[str] = None,
    routing_decision: Optional[str] = None,
    payer_id: Optional[str] = None
) -> Tuple[List[ClaimSummary], int]:
    """
    Returns paginated list of claims with their latest risk scores and routing decisions.
    """
    query = db.query(Claim)

    if payer_id:
        query = query.filter(Claim.payer_id == payer_id)

    claims_all = query.order_by(desc(Claim.created_at)).all()

    # Join in latest prediction for each claim
    summaries = []
    for c in claims_all:
        latest_pred = (
            db.query(DenialPrediction)
            .filter(DenialPrediction.claim_id == c.claim_id)
            .order_by(desc(DenialPrediction.created_at))
            .first()
        )

        risk_score = latest_pred.risk_score if latest_pred else None
        risk_tier = latest_pred.risk_tier if latest_pred else None
        pred_reason = latest_pred.predicted_reason_code if latest_pred else None
        decision = latest_pred.routing_decision if latest_pred else c.status

        # Filter by tier or decision if specified
        if tier and risk_tier != tier:
            continue
        if routing_decision and decision != routing_decision:
            continue

        summaries.append(ClaimSummary(
            claim_id=c.claim_id,
            patient_id=c.patient_id,
            payer_id=c.payer_id,
            payer_name=c.payer.name if c.payer else c.payer_id,
            cpt_codes=c.cpt_codes,
            claim_amount=c.claim_amount,
            service_date=c.service_date,
            risk_score=risk_score,
            risk_tier=risk_tier,
            predicted_reason_code=pred_reason,
            routing_decision=decision,
            status=c.status,
            created_at=c.created_at.isoformat() if c.created_at else ""
        ))

    total = len(summaries)
    start = (page - 1) * limit
    end = start + limit
    return summaries[start:end], total
