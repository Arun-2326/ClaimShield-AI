import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class Payer(Base):
    __tablename__ = "payers"

    payer_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    avg_denial_rate = Column(Float, nullable=False, default=0.15)
    timely_filing_days = Column(Integer, nullable=False, default=90)
    requires_prior_auth = Column(JSON, nullable=False, default=list)  # list of CPT codes requiring auth
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    claims = relationship("Claim", back_populates="payer")


class Claim(Base):
    __tablename__ = "claims"

    claim_id = Column(String(50), primary_key=True, index=True)
    patient_id = Column(String(50), nullable=False, index=True)
    payer_id = Column(String(50), ForeignKey("payers.payer_id"), nullable=False, index=True)
    cpt_codes = Column(JSON, nullable=False)  # e.g. ["99213"]
    icd_codes = Column(JSON, nullable=False)  # e.g. ["J06.9"]
    claim_amount = Column(Float, nullable=False)
    service_date = Column(String(20), nullable=False)
    submission_date = Column(String(20), nullable=True)
    prior_auth_flag = Column(Boolean, nullable=False, default=False)
    eligibility_verified = Column(Boolean, nullable=False, default=True)
    days_since_eligibility_check = Column(Integer, nullable=True, default=0)
    provider_specialty = Column(String(100), nullable=False, default="Family Medicine")
    documentation_complete = Column(Boolean, nullable=False, default=True)
    duplicate_candidate = Column(Boolean, nullable=False, default=False)
    status = Column(String(50), nullable=False, default="PENDING_REVIEW")
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    payer = relationship("Payer", back_populates="claims")
    predictions = relationship("DenialPrediction", back_populates="claim", cascade="all, delete-orphan")
    outcomes = relationship("Outcome", back_populates="claim", cascade="all, delete-orphan")


class DenialPrediction(Base):
    __tablename__ = "denial_predictions"

    prediction_id = Column(String(60), primary_key=True, index=True)
    claim_id = Column(String(50), ForeignKey("claims.claim_id"), nullable=False, index=True)
    risk_score = Column(Float, nullable=False)
    risk_tier = Column(String(30), nullable=False)  # low, medium, high, error
    predicted_reason_code = Column(String(20), nullable=True)
    reason_confidence = Column(Float, nullable=True)
    top_features = Column(JSON, nullable=False)
    recommended_action = Column(Text, nullable=False)
    routing_decision = Column(String(50), nullable=False)  # RELEASE, REVIEW, HOLD_FOR_CORRECTION, BLOCK_UNTIL_VALID
    model_version = Column(String(50), nullable=False)
    policy_version = Column(String(50), nullable=False, default="routing-v1")
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    claim = relationship("Claim", back_populates="predictions")


class Outcome(Base):
    __tablename__ = "outcomes"

    outcome_id = Column(String(60), primary_key=True, index=True)
    claim_id = Column(String(50), ForeignKey("claims.claim_id"), nullable=False, index=True)
    actual_status = Column(String(50), nullable=False)  # PAID, DENIED
    actual_reason_code = Column(String(20), nullable=True)
    remittance_amount = Column(Float, nullable=True, default=0.0)
    logged_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    claim = relationship("Claim", back_populates="outcomes")
