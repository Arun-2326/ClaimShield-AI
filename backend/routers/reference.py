from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.schemas import PayerInfo, ReferenceCodesResponse, MetricsResponse
from backend.ml.generator import PAYER_REFERENCE, CPT_REFERENCE, ICD_REFERENCE, CARC_DEFINITIONS
from backend.services.metrics_service import get_system_metrics

router = APIRouter(tags=["Reference & Metrics"])

@router.get("/payers", response_model=List[PayerInfo])
def list_payers():
    return [
        PayerInfo(
            payer_id=p["payer_id"],
            name=p["name"],
            avg_denial_rate=p["avg_denial_rate"],
            timely_filing_days=p["timely_filing_days"],
            requires_prior_auth_codes=p["requires_prior_auth"]
        )
        for p in PAYER_REFERENCE
    ]

@router.get("/reference-codes", response_model=ReferenceCodesResponse)
def get_reference_taxonomy():
    payers = [
        PayerInfo(
            payer_id=p["payer_id"],
            name=p["name"],
            avg_denial_rate=p["avg_denial_rate"],
            timely_filing_days=p["timely_filing_days"],
            requires_prior_auth_codes=p["requires_prior_auth"]
        )
        for p in PAYER_REFERENCE
    ]
    return ReferenceCodesResponse(
        cpt_codes=CPT_REFERENCE,
        icd_codes=ICD_REFERENCE,
        carc_codes=CARC_DEFINITIONS,
        payers=payers
    )

@router.get("/metrics", response_model=MetricsResponse)
def get_metrics_endpoint(db: Session = Depends(get_db)):
    return get_system_metrics(db)
