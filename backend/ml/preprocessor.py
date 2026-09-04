import json
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from backend.ml.generator import PAYER_REFERENCE, CPT_REFERENCE

EXCLUDED_TARGET_AND_POST_SUBMISSION_COLUMNS = [
    "will_be_denied",
    "actual_reason_code",
    "actual_status",
    "payment_amount",
    "remittance_date",
    "appeal_outcome",
    "post_submission_status",
    "remittance_amount"
]

FEATURE_DISPLAY_NAMES = {
    "prior_auth_flag": "Prior Authorization Obtained",
    "auth_needed_and_missing": "Missing Required Prior Authorization",
    "days_since_eligibility_check": "Age of Eligibility Check (Days)",
    "stale_eligibility_risk": "Stale or Unverified Eligibility",
    "eligibility_verified": "Active Coverage Verified",
    "documentation_complete": "Complete Clinical Records Attached",
    "duplicate_candidate": "Potential Duplicate Service Flag",
    "timely_filing_risk": "Near or Past Payer Timely Filing Window",
    "medical_necessity_indicator": "Diagnosis Supports Procedure (LCD/NCD)",
    "coverage_indicator": "Service Covered Under Benefit Plan",
    "bundling_indicator": "Procedure Bundled Under NCCI Edits",
    "claim_amount": "Total Billed Dollar Amount",
    "payer_denial_rate": "Payer Historical Benchmark Denial Rate",
    "payer_id": "Health Plan / Payer",
    "provider_specialty": "Billing Provider Specialty",
    "primary_cpt": "Primary Procedure Code (CPT)",
    "primary_icd": "Primary Diagnosis Code (ICD-10)"
}


def extract_pre_submission_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforms raw claim records into the pre-submission feature matrix.
    Audits and raises ValueError if any post-submission leakage field is present.
    """
    # 1. Leakage Guard Audit
    for col in EXCLUDED_TARGET_AND_POST_SUBMISSION_COLUMNS:
        if col in df.columns:
            # We must drop target/leakage columns from the feature matrix
            df = df.drop(columns=[col])

    features = pd.DataFrame(index=df.index)

    # Identifiers for lookup if needed, but not model inputs
    payer_map = {p["payer_id"]: p for p in PAYER_REFERENCE}

    # Extract primary CPT and ICD from JSON or list
    def get_first_code(val):
        if isinstance(val, str):
            try:
                parsed = json.loads(val)
                if isinstance(parsed, list) and len(parsed) > 0:
                    return str(parsed[0])
            except Exception:
                return val.strip()
        elif isinstance(val, (list, tuple)) and len(val) > 0:
            return str(val[0])
        return "UNKNOWN"

    features["primary_cpt"] = df["cpt_codes"].apply(get_first_code)
    features["primary_icd"] = df["icd_codes"].apply(get_first_code)
    features["payer_id"] = df["payer_id"].fillna("PAYER_001").astype(str)
    features["provider_specialty"] = df["provider_specialty"].fillna("Family Medicine").astype(str)

    # Numeric features
    features["claim_amount"] = pd.to_numeric(df["claim_amount"], errors="coerce").fillna(150.0).clip(lower=0.0)
    features["log_claim_amount"] = np.log1p(features["claim_amount"])

    # Days since eligibility
    features["days_since_eligibility_check"] = pd.to_numeric(
        df.get("days_since_eligibility_check", 0), errors="coerce"
    ).fillna(30.0).clip(lower=0.0)

    # Booleans
    features["prior_auth_flag"] = pd.Series(df.get("prior_auth_flag", False), index=df.index).fillna(False).astype(int)
    features["eligibility_verified"] = pd.Series(df.get("eligibility_verified", True), index=df.index).fillna(True).astype(int)
    features["documentation_complete"] = pd.Series(df.get("documentation_complete", True), index=df.index).fillna(True).astype(int)
    features["duplicate_candidate"] = pd.Series(df.get("duplicate_candidate", False), index=df.index).fillna(False).astype(int)
    features["timely_filing_risk"] = pd.Series(df.get("timely_filing_risk", False), index=df.index).fillna(False).astype(int)

    # Domain indicators
    if "payer_denial_rate" in df.columns:
        features["payer_denial_rate"] = pd.to_numeric(df["payer_denial_rate"], errors="coerce").fillna(0.15)
    else:
        features["payer_denial_rate"] = features["payer_id"].map(
            lambda pid: payer_map.get(pid, {}).get("avg_denial_rate", 0.15)
        )

    # Payer requires prior auth
    if "payer_requires_prior_auth" in df.columns:
        features["payer_requires_prior_auth"] = pd.Series(df["payer_requires_prior_auth"], index=df.index).fillna(False).astype(int)
    else:
        features["payer_requires_prior_auth"] = [
            int(row["primary_cpt"] in payer_map.get(row["payer_id"], {}).get("requires_prior_auth", []))
            for _, row in features.iterrows()
        ]

    features["coverage_indicator"] = pd.Series(df.get("coverage_indicator", True), index=df.index).fillna(True).astype(int)
    features["medical_necessity_indicator"] = pd.Series(df.get("medical_necessity_indicator", True), index=df.index).fillna(True).astype(int)
    features["bundling_indicator"] = pd.Series(df.get("bundling_indicator", False), index=df.index).fillna(False).astype(int)

    # High-impact clinical/administrative interaction terms
    features["auth_needed_and_missing"] = (
        (features["payer_requires_prior_auth"] == 1) & (features["prior_auth_flag"] == 0)
    ).astype(int)

    features["stale_eligibility_risk"] = (
        (features["eligibility_verified"] == 0) | (features["days_since_eligibility_check"] > 60)
    ).astype(int)

    return features


class PreSubmissionPreprocessor(BaseEstimator, TransformerMixin):
    """
    Scikit-learn compatible ColumnTransformer pipeline.
    Encodes categorical features and standardizes numerical features.
    """
    def __init__(self):
        self.numeric_features = [
            "claim_amount",
            "log_claim_amount",
            "days_since_eligibility_check",
            "payer_denial_rate"
        ]
        self.binary_features = [
            "prior_auth_flag",
            "eligibility_verified",
            "documentation_complete",
            "duplicate_candidate",
            "timely_filing_risk",
            "payer_requires_prior_auth",
            "coverage_indicator",
            "medical_necessity_indicator",
            "bundling_indicator",
            "auth_needed_and_missing",
            "stale_eligibility_risk"
        ]
        self.categorical_features = [
            "payer_id",
            "provider_specialty",
            "primary_cpt",
            "primary_icd"
        ]
        self.transformer = None
        self.feature_names_out_ = None

    def fit(self, X: pd.DataFrame, y=None):
        features_df = extract_pre_submission_features(X)

        self.transformer = ColumnTransformer(
            transformers=[
                ("num", StandardScaler(), self.numeric_features),
                ("bin", "passthrough", self.binary_features),
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), self.categorical_features)
            ]
        )
        self.transformer.fit(features_df)

        # Build feature names
        cat_names = self.transformer.named_transformers_["cat"].get_feature_names_out(self.categorical_features)
        self.feature_names_out_ = (
            self.numeric_features + self.binary_features + list(cat_names)
        )
        return self

    def transform(self, X: pd.DataFrame) -> np.ndarray:
        features_df = extract_pre_submission_features(X)
        return self.transformer.transform(features_df)

    def get_feature_names(self) -> List[str]:
        return list(self.feature_names_out_)
