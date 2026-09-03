"""
ClaimShield AI - Prediction and Evaluation Schemas
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from .common import RiskTier, RoutingDecision
from .claim import ValidationWarning, ClaimCreate

class RiskFactor(BaseModel):
    feature: str
    display_name: str
    impact: str = Field(..., description="'increases_risk' or 'decreases_risk'")
    contribution: float = Field(..., description="Estimated contribution magnitude [0.0 - 1.0]")
    explanation: str = Field(..., description="Actionable billing specialist explanation")

class PredictionResponse(BaseModel):
    claim_id: str
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Predicted denial probability")
    risk_tier: RiskTier
    predicted_reason_code: Optional[str] = None
    reason_description: Optional[str] = None
    reason_confidence: Optional[float] = None
    top_3_risk_factors: List[RiskFactor] = []
    recommended_action: str
    routing_decision: RoutingDecision
    routing_reason: str
    validation_warnings: List[ValidationWarning] = []
    model_version: str
    policy_version: str
    created_at: str
    data_disclaimer: str

class WhatIfRequest(BaseModel):
    original_claim: ClaimCreate
    modified_claim: ClaimCreate

class WhatIfResult(BaseModel):
    risk_score: float
    risk_tier: RiskTier
    routing_decision: RoutingDecision
    predicted_reason_code: Optional[str] = None
    recommended_action: str

class WhatIfResponse(BaseModel):
    claim_id: str
    original: WhatIfResult
    modified: WhatIfResult
    risk_score_diff: float = Field(..., description="Negative means risk reduced")
    verdict: str
    dollars_protected: float
    data_disclaimer: str

class OutcomeRequest(BaseModel):
    claim_id: str
    actual_status: str = Field(..., description="'PAID', 'DENIED'")
    actual_reason_code: Optional[str] = Field(None, description="Actual CARC code if denied")

class OutcomeResponse(BaseModel):
    outcome_id: str
    claim_id: str
    actual_status: str
    actual_reason_code: Optional[str]
    logged_at: str

class ConfusionMatrixData(BaseModel):
    true_positive: int
    false_positive: int
    true_negative: int
    false_negative: int

class MetricsResponse(BaseModel):
    model_name: str
    model_version: str
    roc_auc: float
    f1_score: float
    precision: float
    recall: float
    brier_score: float
    total_test_claims: int
    confusion_matrix: ConfusionMatrixData
    total_claims_in_db: int
    released_count: int
    review_count: int
    held_count: int
    blocked_count: int
    simulated_dollars_protected: float
    data_disclaimer: str
