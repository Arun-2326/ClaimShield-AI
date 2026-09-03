"""
ClaimShield AI - SQLAlchemy ORM Models
"""
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class PayerDB(Base):
    __tablename__ = "payers"

    payer_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    avg_denial_rate = Column(Float, nullable=False, default=0.15)
    timely_filing_days = Column(Integer, nullable=False, default=90)
    requires_prior_auth = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    claims = relationship("ClaimDB", back_populates="payer")


class ClaimDB(Base):
    __tablename__ = "claims"

    claim_id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, nullable=False, index=True)
    payer_id = Column(String, ForeignKey("payers.payer_id"), nullable=False)
    cpt_codes = Column(JSON, nullable=False)
    icd_codes = Column(JSON, nullable=False)
    claim_amount = Column(Float, nullable=False)
    service_date = Column(String, nullable=False)
    submission_date = Column(String, nullable=True)
    prior_auth_flag = Column(Boolean, default=False)
    eligibility_verified = Column(Boolean, default=True)
    days_since_eligibility_check = Column(Integer, default=0)
    provider_specialty = Column(String, default="Family Medicine")
    documentation_complete = Column(Boolean, default=True)
    duplicate_candidate = Column(Boolean, default=False)
    timely_filing_risk = Column(Boolean, default=False)
    coverage_indicator = Column(Boolean, default=True)
    medical_necessity_indicator = Column(Boolean, default=True)
    bundling_indicator = Column(Boolean, default=False)
    status = Column(String, default="PENDING_SUBMISSION")
    created_at = Column(DateTime, default=datetime.utcnow)

    payer = relationship("PayerDB", back_populates="claims")
    predictions = relationship("DenialPredictionDB", back_populates="claim", cascade="all, delete-orphan")
    outcomes = relationship("OutcomeDB", back_populates="claim", cascade="all, delete-orphan")


class DenialPredictionDB(Base):
    __tablename__ = "denial_predictions"

    prediction_id = Column(String, primary_key=True, index=True)
    claim_id = Column(String, ForeignKey("claims.claim_id"), nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_tier = Column(String, nullable=False)
    predicted_reason_code = Column(String, nullable=True)
    reason_confidence = Column(Float, nullable=True)
    top_features = Column(JSON, nullable=False, default=list)
    recommended_action = Column(Text, nullable=False)
    routing_decision = Column(String, nullable=False)
    model_version = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    claim = relationship("ClaimDB", back_populates="predictions")


class OutcomeDB(Base):
    __tablename__ = "outcomes"

    outcome_id = Column(String, primary_key=True, index=True)
    claim_id = Column(String, ForeignKey("claims.claim_id"), nullable=False)
    actual_status = Column(String, nullable=False)
    actual_reason_code = Column(String, nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow)

    claim = relationship("ClaimDB", back_populates="outcomes")
