"""
ClaimShield AI - Machine Learning Model Service
Stage 1: Calibrated Binary Denial-Risk Model (Random Forest)
Stage 2: Denial-Reason Classifier / CARC Attribution Mapper
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, Optional, List
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    roc_auc_score, f1_score, precision_score, recall_score,
    brier_score_loss, confusion_matrix
)
from app.config import settings
from app.schemas.common import CARC_TAXONOMY, RiskTier, RoutingDecision
from app.schemas.prediction import RiskFactor, PredictionResponse
from app.schemas.claim import ValidationWarning
from app.services.feature_pipeline import (
    FEATURE_COLUMNS, extract_features_from_claim_dict,
    build_training_matrix, assert_no_data_leakage
)
from app.services.explainer import explain_claim_risk
from app.services.recommender import recommend_corrective_action
from app.services.router import evaluate_routing_policy
from datetime import datetime

class DenialModelService:
    def __init__(self):
        self.model: Optional[RandomForestClassifier] = None
        self.carc_model: Optional[RandomForestClassifier] = None
        self.metadata: Dict[str, Any] = {}
        self.feature_names: List[str] = FEATURE_COLUMNS
        self.carc_classes: List[str] = []

    def is_loaded(self) -> bool:
        return self.model is not None

    def train_and_save(self, df: pd.DataFrame, save_to_disk: bool = True) -> Dict[str, Any]:
        """
        Trains Stage 1 Binary Classifier and Stage 2 CARC Reason Classifier.
        Evaluates on 20% test holdout, serializes artifacts, and stores evaluation metadata.
        """
        X, y_binary, y_carc = build_training_matrix(df)
        assert_no_data_leakage(X)

        X_train, X_test, y_train, y_test, carc_train, carc_test = train_test_split(
            X, y_binary, y_carc, test_size=0.20, random_state=settings.RANDOM_SEED, stratify=y_binary
        )

        # Stage 1: Binary Denial Risk Model
        # RandomForestClassifier provides fast training, native non-linear interactions,
        # and reliable probability calibration via trees.
        rf = RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            min_samples_split=5,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=settings.RANDOM_SEED,
            n_jobs=-1
        )
        rf.fit(X_train, y_train)

        # Test evaluation
        y_pred_proba = rf.predict_proba(X_test)[:, 1]
        y_pred = (y_pred_proba >= 0.50).astype(int)

        roc_auc = float(roc_auc_score(y_test, y_pred_proba))
        f1 = float(f1_score(y_test, y_pred))
        precision = float(precision_score(y_test, y_pred, zero_division=0))
        recall = float(recall_score(y_test, y_pred))
        brier = float(brier_score_loss(y_test, y_pred_proba))

        tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()

        # Stage 2: CARC Reason Model trained on denied claims
        denied_mask_train = (y_train == 1) & (carc_train.notna())
        X_carc_train = X_train[denied_mask_train]
        y_carc_train = carc_train[denied_mask_train]

        carc_rf = RandomForestClassifier(
            n_estimators=60,
            max_depth=6,
            random_state=settings.RANDOM_SEED,
            n_jobs=-1
        )
        carc_rf.fit(X_carc_train, y_carc_train)
        self.carc_classes = list(carc_rf.classes_)

        # Feature importances
        importances = dict(zip(FEATURE_COLUMNS, [float(x) for x in rf.feature_importances_]))

        metadata = {
            "model_name": "RandomForestClassifier (Dual-Stage)",
            "model_version": settings.MODEL_VERSION,
            "policy_version": settings.POLICY_VERSION,
            "trained_at": datetime.utcnow().isoformat(),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "metrics": {
                "roc_auc": round(roc_auc, 4),
                "f1_score": round(f1, 4),
                "precision": round(precision, 4),
                "recall": round(recall, 4),
                "brier_score": round(brier, 4),
                "confusion_matrix": {
                    "true_positive": int(tp),
                    "false_positive": int(fp),
                    "true_negative": int(tn),
                    "false_negative": int(fn)
                }
            },
            "feature_importances": importances,
            "supported_carcs": list(CARC_TAXONOMY.keys()),
            "data_disclaimer": settings.DATA_DISCLAIMER
        }

        # Save artifacts if requested
        if save_to_disk:
            settings.MODEL_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
            joblib.dump({"binary_model": rf, "carc_model": carc_rf, "carc_classes": self.carc_classes}, settings.MODEL_FILE_PATH)

            with open(settings.MODEL_METADATA_PATH, "w") as f:
                json.dump(metadata, f, indent=2)

        self.model = rf
        self.carc_model = carc_rf
        self.metadata = metadata
        return metadata

    def load_model(self) -> bool:
        """Loads serialized model and metadata from disk."""
        if settings.MODEL_FILE_PATH.exists() and settings.MODEL_METADATA_PATH.exists():
            payload = joblib.load(settings.MODEL_FILE_PATH)
            self.model = payload["binary_model"]
            self.carc_model = payload.get("carc_model")
            self.carc_classes = payload.get("carc_classes", list(CARC_TAXONOMY.keys()))
            with open(settings.MODEL_METADATA_PATH, "r") as f:
                self.metadata = json.load(f)
            return True
        return False

    def predict_claim(
        self,
        claim_data: Dict[str, Any],
        warnings: Optional[List[ValidationWarning]] = None
    ) -> Dict[str, Any]:
        """
        Executes pre-submission inference:
        1. Feature extraction
        2. Binary risk scoring
        3. CARC attribution
        4. Billing explanation
        5. Prescriptive recommendation
        6. Operational routing
        """
        if self.model is None:
            raise RuntimeError("Denial model is not loaded. Train or initialize the model first.")

        # 1. Feature extraction
        X_df = extract_features_from_claim_dict(claim_data)
        feature_dict = X_df.iloc[0].to_dict()

        # 2. Binary denial probability
        prob_denial = float(self.model.predict_proba(X_df)[0][1])

        # Model confidence (proximity to certainty: 0.5 + |p - 0.5|)
        model_confidence = float(0.50 + abs(prob_denial - 0.50))

        # 3. Stage 2 CARC attribution
        predicted_carc = None
        carc_desc = None
        reason_conf = None

        if prob_denial >= 0.25 and self.carc_model is not None:
            carc_probs = self.carc_model.predict_proba(X_df)[0]
            best_idx = int(np.argmax(carc_probs))
            predicted_carc = self.carc_classes[best_idx]
            reason_conf = round(float(carc_probs[best_idx]), 2)
            carc_meta = CARC_TAXONOMY.get(predicted_carc, {})
            carc_desc = carc_meta.get("plain_language", "Identified potential claim discrepancy.")
        elif prob_denial < 0.25:
            # Clean claim
            predicted_carc = None
            carc_desc = "Clean claim - No CARC risk identified."
            reason_conf = round(1.0 - prob_denial, 2)

        # 4. Routing Decision & Risk Tier
        routing_decision, risk_tier, routing_reason = evaluate_routing_policy(
            risk_score=prob_denial,
            model_confidence=model_confidence
        )

        # 5. Billing-language explanation (top 3 factors)
        importances = self.metadata.get("feature_importances", {})
        top_factors = explain_claim_risk(
            claim_data=claim_data,
            feature_row=feature_dict,
            feature_importances=importances,
            risk_score=prob_denial
        )

        # 6. Corrective recommendation
        recommended_action = recommend_corrective_action(
            predicted_carc=predicted_carc,
            claim_data=claim_data,
            risk_tier=risk_tier
        )

        return {
            "claim_id": claim_data.get("claim_id", "CLM_UNKNOWN"),
            "risk_score": round(prob_denial, 2),
            "risk_tier": risk_tier,
            "predicted_reason_code": predicted_carc,
            "reason_description": carc_desc,
            "reason_confidence": reason_conf,
            "top_3_risk_factors": [f.model_dump() for f in top_factors],
            "recommended_action": recommended_action,
            "routing_decision": routing_decision,
            "routing_reason": routing_reason,
            "validation_warnings": [w.model_dump() for w in (warnings or [])],
            "model_version": settings.MODEL_VERSION,
            "policy_version": settings.POLICY_VERSION,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "data_disclaimer": settings.DATA_DISCLAIMER
        }

model_service = DenialModelService()
