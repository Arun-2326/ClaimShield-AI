"""
Unit Tests for Risk Routing Policy
"""
import pytest
from app.services.router import evaluate_routing_policy
from app.schemas.common import RiskTier, RoutingDecision

def test_low_risk_routes_to_release():
    decision, tier, reason = evaluate_routing_policy(risk_score=0.15, model_confidence=0.85)
    assert decision == RoutingDecision.RELEASE
    assert tier == RiskTier.LOW
    assert "Cleared for automated batch release" in reason

def test_medium_risk_routes_to_review():
    decision, tier, reason = evaluate_routing_policy(risk_score=0.48, model_confidence=0.85)
    assert decision == RoutingDecision.REVIEW
    assert tier == RiskTier.MEDIUM
    assert "Assigned to specialist work queue" in reason

def test_high_risk_routes_to_hold():
    decision, tier, reason = evaluate_routing_policy(risk_score=0.82, model_confidence=0.90)
    assert decision == RoutingDecision.HOLD_FOR_CORRECTION
    assert tier == RiskTier.HIGH
    assert "Claim held until corrective actions" in reason

def test_low_confidence_overrides_to_review():
    # Even if risk score is low (0.20), low confidence (0.45 < 0.55 threshold) must trigger review
    decision, tier, reason = evaluate_routing_policy(risk_score=0.20, model_confidence=0.45)
    assert decision == RoutingDecision.REVIEW
    assert tier == RiskTier.MEDIUM
    assert "below threshold" in reason
