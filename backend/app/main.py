"""
ClaimShield AI - FastAPI Application Entry Point
Pre-Submission Healthcare RCM Denial Prevention Engine
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
from datetime import datetime
import json
import pandas as pd

from app.config import settings
from app.database import engine, SessionLocal, Base
from app.models.schema import PayerDB, ClaimDB, DenialPredictionDB
from app.services.data_generator import PAYER_PROFILES, save_synthetic_dataset
from app.services.model_service import model_service
from app.routers import predict, claims, payers, outcomes, metrics

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("claimshield")

def seed_database_and_model():
    """Initializes database tables, seeds payers, ensures model is trained, and seeds sample queue."""
    logger.info("Initializing ClaimShield AI database schema...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed Payers
        existing_payers = db.query(PayerDB).count()
        if existing_payers == 0:
            logger.info("Seeding simulated payer reference directory...")
            for pid, pdata in PAYER_PROFILES.items():
                payer = PayerDB(
                    payer_id=pid,
                    name=pdata["name"],
                    avg_denial_rate=pdata["avg_denial_rate"],
                    timely_filing_days=pdata["timely_filing_days"],
                    requires_prior_auth=pdata["strict_prior_auth_cpts"]
                )
                db.add(payer)
            db.commit()

        # 2. Check / Generate Synthetic Dataset
        if not settings.SYNTHETIC_DATA_PATH.exists():
            logger.info("Generating 4,000 synthetic healthcare claims with seed 42...")
            df = save_synthetic_dataset(num_records=4000)
        else:
            logger.info("Loading existing synthetic claims dataset...")
            df = pd.read_csv(settings.SYNTHETIC_DATA_PATH)

        # 3. Check / Train Machine Learning Model
        if not model_service.load_model():
            logger.info("Training dual-stage RandomForest denial prevention model...")
            model_service.train_and_save(df)
            logger.info(f"Model successfully trained and persisted to {settings.MODEL_FILE_PATH}")
        else:
            logger.info("Loaded pre-trained model and metadata from disk.")

        # 4. Seed initial claims queue (100 representative claims)
        claim_count = db.query(ClaimDB).count()
        if claim_count == 0:
            logger.info("Populating claims queue with initial 100 simulated claims...")
            sample_df = df.head(100)
            for _, row in sample_df.iterrows():
                cid = row["claim_id"]
                cpt_codes = json.loads(row["cpt_codes"]) if isinstance(row["cpt_codes"], str) else row["cpt_codes"]
                icd_codes = json.loads(row["icd_codes"]) if isinstance(row["icd_codes"], str) else row["icd_codes"]
                amount = float(row["claim_amount"])
                payer_id = row["payer_id"]

                claim_record = ClaimDB(
                    claim_id=cid,
                    patient_id=row["patient_id"],
                    payer_id=payer_id,
                    cpt_codes=cpt_codes,
                    icd_codes=icd_codes,
                    claim_amount=amount,
                    service_date=row["service_date"],
                    submission_date=row["submission_date"],
                    prior_auth_flag=bool(row["prior_auth_flag"]),
                    eligibility_verified=bool(row["eligibility_verified"]),
                    days_since_eligibility_check=int(row["days_since_eligibility_check"]),
                    provider_specialty=row["provider_specialty"],
                    documentation_complete=bool(row["documentation_complete"]),
                    duplicate_candidate=bool(row["duplicate_candidate"]),
                    timely_filing_risk=bool(row["timely_filing_risk"]),
                    coverage_indicator=bool(row["coverage_indicator"]),
                    medical_necessity_indicator=bool(row["medical_necessity_indicator"]),
                    bundling_indicator=bool(row["bundling_indicator"]),
                    status="PENDING_SUBMISSION"
                )
                db.add(claim_record)
                db.flush()

                # Predict initial disposition
                pred = model_service.predict_claim(row.to_dict())
                decision_val = pred["routing_decision"].value if hasattr(pred["routing_decision"], "value") else str(pred["routing_decision"])
                tier_val = pred["risk_tier"].value if hasattr(pred["risk_tier"], "value") else str(pred["risk_tier"])

                claim_record.status = decision_val

                pred_record = DenialPredictionDB(
                    prediction_id=f"PRED_INIT_{cid}",
                    claim_id=cid,
                    risk_score=pred["risk_score"],
                    risk_tier=tier_val,
                    predicted_reason_code=pred["predicted_reason_code"],
                    reason_confidence=pred["reason_confidence"],
                    top_features=pred["top_3_risk_factors"],
                    recommended_action=pred["recommended_action"],
                    routing_decision=decision_val,
                    model_version=settings.MODEL_VERSION
                )
                db.add(pred_record)

            db.commit()
            logger.info("Database seeding complete.")

    finally:
        db.close()

# Ensure database schema is initialized and model is loaded on module import
seed_database_and_model()

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_database_and_model()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Pre-submission intelligence preventing healthcare claim denials through ML risk scoring, CARC prediction, and automated routing.",
    lifespan=lifespan
)

# CORS configuration for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global privacy-safe exception handler: no stack trace leaks
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Internal Server Error on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "message": "An internal error occurred during claim processing. Check system logs.",
            "data_disclaimer": settings.DATA_DISCLAIMER
        }
    )

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "ok",
        "model_loaded": model_service.is_loaded(),
        "model_version": settings.MODEL_VERSION,
        "policy_version": settings.POLICY_VERSION,
        "synthetic_claims_count": 4000,
        "data_disclaimer": settings.DATA_DISCLAIMER
    }

# Mount Routers
app.include_router(predict.router)
app.include_router(claims.router)
app.include_router(payers.router)
app.include_router(outcomes.router)
app.include_router(metrics.router)
