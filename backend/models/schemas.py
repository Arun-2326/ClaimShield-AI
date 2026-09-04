from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
import datetime

class RiskFactorItem(BaseModel):
    feature: str
    display_name: str
    impact: str  # "increases_risk" | "decreases_risk" | "neutral"
    contribution: float

class ValidationWarning(BaseModel):
    code: str
    message: str
    severity: str = "warning"

class ClaimInput(BaseModel):
    claim_id: str = Field(..., description="Unique opaque synthetic claim ID e.g. CLM_000001")
    patient_id: str = Field(..., description="Synthetic patient identifier e.g. PAT_000001")
    payer_id: str = Field(..., description="Payer identifier e.g. PAYER_001")
    cpt_codes: List[str] = Field(..., min_length=1, description="List of procedure codes e.g. ['99213']")
    icd_codes: List[str] = Field(..., min_length=1, description="List of diagnosis codes e.g. ['J06.9']")
    claim_amount: float = Field(..., description="Total dollar amount billed")
    service_date: str = Field(..., description="Date of service YYYY-MM-DD")
    submission_date: Optional[str] = Field(default=None, description="Proposed submission date YYYY-MM-DD")
    prior_auth_flag: bool = Field(default=False, description="Whether prior authorization was obtained")
    eligibility_verified: bool = Field(default=True, description="Whether patient insurance was verified")
    days_since_eligibility_check: Optional[int] = Field(default=0, ge=0, description="Age of eligibility verification in days")
    provider_specialty: str = Field(default="Family Medicine", description="Specialty of billing physician")
    documentation_complete: bool = Field(default=True, description="Whether all required clinical records are attached")
    duplicate_candidate: bool = Field(default=False, description="Flag indicating potential duplicate service")

    @field_validator("claim_amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Claim amount cannot be negative.")
        return v

    @field_validator("cpt_codes", "icd_codes")
    @classmethod
    def validate_code_lists(cls, v: List[str]) -> List[str]:
        if not v or any(not code.strip() for code in v):
            raise ValueError("Procedure and diagnosis code lists must not contain empty values.")
        return [c.strip().upper() for c in v]


class PredictionResult(BaseModel):
    claim_id: str
    risk_score: float = Field(..., description="Denial probability between 0.0 and 1.0")
    risk_tier: str = Field(..., description="low | medium | high | error")
    predicted_reason_code: Optional[str] = Field(None, description="CARC code e.g. CO-197")
    reason_description: Optional[str] = Field(None, description="Plain language explanation of CARC")
    reason_confidence: Optional[float] = Field(None, description="Confidence in the reason code")
    top_3_risk_factors: List[RiskFactorItem] = Field(default_factory=list)
    recommended_action: str
    routing_decision: str = Field(..., description="RELEASE | REVIEW | HOLD_FOR_CORRECTION | BLOCK_UNTIL_VALID")
    routing_reason: str
    validation_warnings: List[ValidationWarning] = Field(default_factory=list)
    model_version: str
    policy_version: str
    created_at: str


class ClaimSummary(BaseModel):
    claim_id: str
    patient_id: str
    payer_id: str
    payer_name: Optional[str] = None
    cpt_codes: List[str]
    claim_amount: float
    service_date: str
    risk_score: Optional[float] = None
    risk_tier: Optional[str] = None
    predicted_reason_code: Optional[str] = None
    routing_decision: Optional[str] = None
    status: str
    created_at: str


class ClaimDetailResponse(BaseModel):
    claim: ClaimSummary
    latest_prediction: Optional[PredictionResult] = None
    features_used: Optional[Dict[str, Any]] = None
    actual_outcome: Optional[Dict[str, Any]] = None


class OutcomeCreate(BaseModel):
    claim_id: str
    actual_status: str = Field(..., description="PAID | DENIED")
    actual_reason_code: Optional[str] = Field(None, description="Actual CARC code if denied")
    remittance_amount: Optional[float] = Field(0.0, description="Amount paid by payer in simulated ERA")
    logged_at: Optional[str] = None


class OutcomeResponse(BaseModel):
    outcome_id: str
    claim_id: str
    actual_status: str
    actual_reason_code: Optional[str]
    remittance_amount: Optional[float]
    logged_at: str
    message: str


class MetricsResponse(BaseModel):
    model_name: str
    model_version: str
    policy_version: str
    synthetic_sample_size: int
    train_size: int
    test_size: int
    denial_rate: float
    accuracy: float
    roc_auc: float
    f1_score: float
    precision: float
    recall: float
    confusion_matrix: Dict[str, int]
    carc_distribution: Dict[str, int]
    payer_metrics: List[Dict[str, Any]]
    financial_roi: Dict[str, Any]
    leakage_audit_passed: bool
    data_disclaimer: str


class PayerInfo(BaseModel):
    payer_id: str
    name: str
    avg_denial_rate: float
    timely_filing_days: int
    requires_prior_auth_codes: List[str]


class ReferenceCodesResponse(BaseModel):
    cpt_codes: Dict[str, str]
    icd_codes: Dict[str, str]
    carc_codes: Dict[str, Dict[str, str]]
    payers: List[PayerInfo]


class BatchPredictRequest(BaseModel):
    claims: List[ClaimInput]


class BatchPredictResponse(BaseModel):
    total_claims: int
    total_billed_amount: float
    results: List[PredictionResult]
    summary_by_decision: Dict[str, int]
    summary_by_tier: Dict[str, int]
    at_risk_amount: float
    prevented_rework_savings: float
