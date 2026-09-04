import os
import json
import datetime
import joblib
import numpy as np
import pandas as pd
from typing import Optional, Tuple, Dict, Any, List

from backend.config import settings
from backend.models.schemas import ClaimInput, PredictionResult, ValidationWarning
from backend.ml.preprocessor import PreSubmissionPreprocessor, extract_pre_submission_features
from backend.ml.explainer import explain_prediction
from backend.services.routing_policy import determine_routing_decision
from backend.ml.generator import CARC_DEFINITIONS

class ModelService:
    _instance: Optional["ModelService"] = None

    def __init__(self):
        self.denial_model = None
        self.reason_model = None
        self.preprocessor: Optional[PreSubmissionPreprocessor] = None
        self.metadata: Dict[str, Any] = {}
        self.is_loaded = False
        self.load_models()

    @classmethod
    def get_instance(cls) -> "ModelService":
        if cls._instance is None:
            cls._instance = ModelService()
        return cls._instance

    def load_models(self):
        denial_path = settings.MODEL_DIR / "denial_model.joblib"
        reason_path = settings.MODEL_DIR / "reason_model.joblib"
        preprocessor_path = settings.MODEL_DIR / "preprocessor.joblib"
        metadata_path = settings.MODEL_DIR / "metadata.json"

        if denial_path.exists() and preprocessor_path.exists():
            try:
                self.denial_model = joblib.load(denial_path)
                self.preprocessor = joblib.load(preprocessor_path)
                if reason_path.exists():
                    self.reason_model = joblib.load(reason_path)
                if metadata_path.exists():
                    with open(metadata_path, "r", encoding="utf-8") as f:
                        self.metadata = json.load(f)
                self.is_loaded = True
                print("ClaimShield AI: ML models successfully loaded.")
            except Exception as e:
                print(f"Warning: Failed loading models: {e}")
                self.is_loaded = False
        else:
            print("Notice: ML model artifacts not found yet. Training pipeline should run first.")
            self.is_loaded = False

    def predict_single(
        self,
        claim: ClaimInput,
        validation_warnings: Optional[List[ValidationWarning]] = None
    ) -> PredictionResult:
        if not self.is_loaded or self.denial_model is None or self.preprocessor is None:
            raise RuntimeError("ML models are not loaded. Please ensure training artifacts exist.")

        # Build raw DataFrame for single claim
        claim_dict = {
            "claim_id": claim.claim_id,
            "patient_id": claim.patient_id,
            "payer_id": claim.payer_id,
            "cpt_codes": json.dumps(claim.cpt_codes),
            "icd_codes": json.dumps(claim.icd_codes),
            "claim_amount": claim.claim_amount,
            "service_date": claim.service_date,
            "submission_date": claim.submission_date or datetime.date.today().isoformat(),
            "prior_auth_flag": claim.prior_auth_flag,
            "eligibility_verified": claim.eligibility_verified,
            "days_since_eligibility_check": claim.days_since_eligibility_check or 0,
            "provider_specialty": claim.provider_specialty,
            "documentation_complete": claim.documentation_complete,
            "duplicate_candidate": claim.duplicate_candidate,
            "timely_filing_risk": False,
            "coverage_indicator": True,
            "medical_necessity_indicator": True,
            "bundling_indicator": False
        }
        df_raw = pd.DataFrame([claim_dict])

        # Feature extraction
        features_extracted = extract_pre_submission_features(df_raw)
        X_trans = self.preprocessor.transform(df_raw)

        # Stage 1: Predict Denial Probability
        prob_denial = float(self.denial_model.predict_proba(X_trans)[0, 1])
        model_confidence = float(max(prob_denial, 1.0 - prob_denial))

        # Stage 2: Predict Reason CARC if risk exists
        predicted_carc = None
        carc_desc = None
        reason_confidence = None

        if prob_denial > 0.20 and self.reason_model is not None:
            reason_probs = self.reason_model.predict_proba(X_trans)[0]
            max_idx = int(np.argmax(reason_probs))
            predicted_carc = str(self.reason_model.classes_[max_idx])
            reason_confidence = round(float(reason_probs[max_idx]), 3)
            carc_meta = CARC_DEFINITIONS.get(predicted_carc, {})
            carc_desc = carc_meta.get("description", "Standard adjudication adjustment")
        elif prob_denial <= 0.20:
            predicted_carc = None
            carc_desc = "Clean Claim — No primary denial code indicated"
            reason_confidence = round(model_confidence, 3)

        # Feature Contributions & Explanations
        top_factors, recommended_action = explain_prediction(
            features_row=features_extracted.iloc[0],
            feature_importances={},
            risk_score=prob_denial
        )

        # Policy Routing Decision
        tier, routing_decision, routing_reason = determine_routing_decision(
            risk_score=prob_denial,
            confidence=model_confidence,
            is_duplicate=claim.duplicate_candidate,
            validation_failed=False
        )

        return PredictionResult(
            claim_id=claim.claim_id,
            risk_score=round(prob_denial, 3),
            risk_tier=tier,
            predicted_reason_code=predicted_carc,
            reason_description=carc_desc,
            reason_confidence=reason_confidence,
            top_3_risk_factors=top_factors,
            recommended_action=recommended_action,
            routing_decision=routing_decision,
            routing_reason=routing_reason,
            validation_warnings=validation_warnings or [],
            model_version=settings.MODEL_VERSION,
            policy_version=settings.POLICY_VERSION,
            created_at=datetime.datetime.now(datetime.timezone.utc).isoformat()
        )
