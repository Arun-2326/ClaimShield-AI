"""
ClaimShield AI - Payers Directory Router
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models.schema import PayerDB
from app.services.data_generator import PAYER_PROFILES
from app.config import settings

router = APIRouter(prefix="/payers", tags=["Payers Directory"])

@router.get("")
def list_payers(db: Session = Depends(get_db)):
    """
    Returns list of supported simulated payers with their rules and denial benchmarks.
    """
    payers = db.query(PayerDB).all()
    if not payers:
        # Fallback to in-memory profile if DB table is empty
        items = [
            {
                "payer_id": pid,
                "name": p["name"],
                "avg_denial_rate": p["avg_denial_rate"],
                "timely_filing_days": p["timely_filing_days"],
                "strict_prior_auth_cpts": p["strict_prior_auth_cpts"]
            }
            for pid, p in PAYER_PROFILES.items()
        ]
    else:
        items = [
            {
                "payer_id": p.payer_id,
                "name": p.name,
                "avg_denial_rate": p.avg_denial_rate,
                "timely_filing_days": p.timely_filing_days,
                "strict_prior_auth_cpts": p.requires_prior_auth
            }
            for p in payers
        ]

    return {
        "count": len(items),
        "data_disclaimer": settings.DATA_DISCLAIMER,
        "items": items
    }
