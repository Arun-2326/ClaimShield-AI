from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.schemas import (
    ClaimInput,
    PredictionResult,
    BatchPredictRequest,
    BatchPredictResponse
)
from backend.services.validator import validate_claim_deterministically
from backend.ml.predictor import ModelService
from backend.services.claim_service import save_claim_and_prediction
from backend.services.routing_policy import determine_routing_decision
from backend.config import settings

router = APIRouter(tags=["Prediction"])

@router.post("/predict", response_model=PredictionResult)
def predict_claim_denial(
    claim: ClaimInput,
    persist: bool = True,
    db: Session = Depends(get_db)
):
    """
    Evaluates a single claim pre-submission.
    1. Deterministic validation (schema, duplicates, negative amounts, unknown payers)
    2. Feature engineering & model inference
    3. CARC reason categorization & confidence
    4. Top-3 feature explanations & corrective billing recommendation
    5. Policy routing: RELEASE, REVIEW, HOLD_FOR_CORRECTION, or BLOCK_UNTIL_VALID
    """
    is_valid, error_code, error_msg, warnings = validate_claim_deterministically(claim)

    # If deterministic hard error:
    if not is_valid:
        if error_code == "UNKNOWN_PAYER_ID":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error_code": error_code, "message": error_msg}
            )
        elif error_code in ["NEGATIVE_CLAIM_AMOUNT", "INVALID_SERVICE_DATE", "FUTURE_SERVICE_DATE"]:
            tier, decision, reason = determine_routing_decision(
                risk_score=1.0,
                confidence=1.0,
                is_duplicate=False,
                validation_failed=True
            )
            blocked_result = PredictionResult(
                claim_id=claim.claim_id,
                risk_score=1.0,
                risk_tier=tier,
                predicted_reason_code="CO-16",
                reason_description=error_msg,
                reason_confidence=1.0,
                top_3_risk_factors=[],
                recommended_action=f"Resolve validation error before submission: {error_msg}",
                routing_decision=decision,
                routing_reason=reason,
                validation_warnings=warnings,
                model_version=settings.MODEL_VERSION,
                policy_version=settings.POLICY_VERSION,
                created_at="now"
            )
            if persist:
                save_claim_and_prediction(db, claim, blocked_result)
            return blocked_result

    # If duplicate candidate:
    if claim.duplicate_candidate:
        tier, decision, reason = determine_routing_decision(
            risk_score=0.98,
            confidence=0.99,
            is_duplicate=True,
            validation_failed=False
        )
        duplicate_result = PredictionResult(
            claim_id=claim.claim_id,
            risk_score=0.98,
            risk_tier=tier,
            predicted_reason_code="CO-18",
            reason_description="Exact duplicate claim or service candidate",
            reason_confidence=0.95,
            top_3_risk_factors=[],
            recommended_action="Search clearinghouse submission history for duplicate service line or ICN prior to transmission.",
            routing_decision=decision,
            routing_reason=reason,
            validation_warnings=warnings,
            model_version=settings.MODEL_VERSION,
            policy_version=settings.POLICY_VERSION,
            created_at="now"
        )
        if persist:
            save_claim_and_prediction(db, claim, duplicate_result)
        return duplicate_result

    # Standard ML Prediction Pipeline
    model_service = ModelService.get_instance()
    result = model_service.predict_single(claim, validation_warnings=warnings)

    if persist:
        save_claim_and_prediction(db, claim, result)

    return result


@router.post("/batch-predict", response_model=BatchPredictResponse)
def batch_predict_claims(
    batch_req: BatchPredictRequest,
    persist: bool = False,
    db: Session = Depends(get_db)
):
    """
    Evaluates a batch of synthetic claims for aggregate risk analysis and audit.
    """
    results = []
    decision_counts = {"RELEASE": 0, "REVIEW": 0, "HOLD_FOR_CORRECTION": 0, "BLOCK_UNTIL_VALID": 0}
    tier_counts = {"low": 0, "medium": 0, "high": 0, "error": 0}
    total_amount = 0.0
    at_risk_amount = 0.0

    model_service = ModelService.get_instance()

    for claim in batch_req.claims:
        total_amount += claim.claim_amount
        is_valid, err_code, err_msg, warnings = validate_claim_deterministically(claim)
        
        if not is_valid:
            tier, decision, reason = determine_routing_decision(1.0, 1.0, False, True)
            res = PredictionResult(
                claim_id=claim.claim_id,
                risk_score=1.0,
                risk_tier=tier,
                predicted_reason_code="CO-16",
                reason_description=err_msg,
                reason_confidence=1.0,
                top_3_risk_factors=[],
                recommended_action=f"Validation Block: {err_msg}",
                routing_decision=decision,
                routing_reason=reason,
                validation_warnings=warnings,
                model_version=settings.MODEL_VERSION,
                policy_version=settings.POLICY_VERSION,
                created_at="now"
            )
        elif claim.duplicate_candidate:
            tier, decision, reason = determine_routing_decision(0.98, 0.99, True, False)
            res = PredictionResult(
                claim_id=claim.claim_id,
                risk_score=0.98,
                risk_tier=tier,
                predicted_reason_code="CO-18",
                reason_description="Duplicate submission candidate",
                reason_confidence=0.95,
                top_3_risk_factors=[],
                recommended_action="Verify against previous submissions before re-transmitting.",
                routing_decision=decision,
                routing_reason=reason,
                validation_warnings=warnings,
                model_version=settings.MODEL_VERSION,
                policy_version=settings.POLICY_VERSION,
                created_at="now"
            )
        else:
            res = model_service.predict_single(claim, validation_warnings=warnings)

        if persist:
            save_claim_and_prediction(db, claim, res)

        results.append(res)
        decision_counts[res.routing_decision] = decision_counts.get(res.routing_decision, 0) + 1
        tier_counts[res.risk_tier] = tier_counts.get(res.risk_tier, 0) + 1

        if res.risk_tier in ["high", "medium", "error"]:
            at_risk_amount += claim.claim_amount

    prevented_count = decision_counts.get("HOLD_FOR_CORRECTION", 0) + decision_counts.get("REVIEW", 0)
    rework_savings = prevented_count * settings.REWORK_COST_PER_DENIAL

    return BatchPredictResponse(
        total_claims=len(batch_req.claims),
        total_billed_amount=round(total_amount, 2),
        results=results,
        summary_by_decision=decision_counts,
        summary_by_tier=tier_counts,
        at_risk_amount=round(at_risk_amount, 2),
        prevented_rework_savings=round(rework_savings, 2)
    )
