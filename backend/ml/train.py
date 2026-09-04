import json
import os
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score,
    roc_auc_score,
    f1_score,
    precision_score,
    recall_score,
    confusion_matrix,
    classification_report
)

from backend.config import settings
from backend.ml.generator import generate_synthetic_dataset, PAYER_REFERENCE, CARC_DEFINITIONS
from backend.ml.preprocessor import (
    PreSubmissionPreprocessor,
    EXCLUDED_TARGET_AND_POST_SUBMISSION_COLUMNS,
    extract_pre_submission_features
)


def run_training_pipeline() -> dict:
    """
    Executes the end-to-end reproducible synthetic claims training pipeline.
    1. Generates 4,000 synthetic records with seed=42
    2. Performs strict leakage audit
    3. Fits feature pipeline strictly on train split
    4. Trains Stage 1 binary denial-risk model
    5. Trains Stage 2 multiclass CARC reason classifier
    6. Serializes model artifacts & evaluation metrics
    """
    print("=" * 60)
    print("ClaimShield AI: Initiating Pre-Submission Denial Model Training")
    print("=" * 60)

    # Ensure output directories exist
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    settings.MODEL_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Generate Dataset
    print(f"Generating {settings.SYNTHETIC_CLAIM_COUNT} synthetic claims (seed={settings.RANDOM_SEED})...")
    df = generate_synthetic_dataset(num_samples=settings.SYNTHETIC_CLAIM_COUNT, seed=settings.RANDOM_SEED)

    csv_path = settings.DATA_DIR / "synthetic_claims.csv"
    df.to_csv(csv_path, index=False)
    print(f"Saved synthetic dataset to: {csv_path}")

    # 2. Strict Leakage Audit
    print("Executing pre-training Leakage Prevention Audit...")
    X_raw = df.drop(columns=["will_be_denied", "actual_reason_code"])
    y_binary = df["will_be_denied"].values
    y_reasons = df["actual_reason_code"].values

    extracted_features = extract_pre_submission_features(X_raw)
    for forbidden_col in EXCLUDED_TARGET_AND_POST_SUBMISSION_COLUMNS:
        if forbidden_col in extracted_features.columns:
            raise ValueError(f"LEAKAGE VIOLATION: Column '{forbidden_col}' detected in feature matrix!")
    print("Leakage Prevention Audit PASSED: Zero post-submission features present in feature set.")

    # 3. Train/Test Split (80/20 Stratified)
    X_train_raw, X_test_raw, y_train, y_test, reasons_train, reasons_test = train_test_split(
        X_raw,
        y_binary,
        y_reasons,
        test_size=0.20,
        random_state=settings.RANDOM_SEED,
        stratify=y_binary
    )

    print(f"Train samples: {len(X_train_raw)} | Test samples: {len(X_test_raw)}")
    print(f"Training Denial Class Balance: {np.mean(y_train):.2%} denials")

    # 4. Fit Preprocessor strictly on Train Data
    preprocessor = PreSubmissionPreprocessor()
    X_train = preprocessor.fit_transform(X_train_raw)
    X_test = preprocessor.transform(X_test_raw)

    # 5. Train Stage 1: Binary Denial Classifier
    print("Training Stage 1 Binary Denial-Risk Model (RandomForest)...")
    denial_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        min_samples_split=5,
        class_weight="balanced",
        random_state=settings.RANDOM_SEED,
        n_jobs=1
    )
    denial_model.fit(X_train, y_train)

    # 6. Train Stage 2: Multiclass CARC Reason Classifier on Denied subset
    print("Training Stage 2 CARC Reason Predictor on denied claims subset...")
    denied_mask_train = (y_train == 1) & (reasons_train != "")
    X_train_denied = X_train[denied_mask_train]
    y_reasons_train = reasons_train[denied_mask_train]

    reason_model = RandomForestClassifier(
        n_estimators=60,
        max_depth=10,
        random_state=settings.RANDOM_SEED,
        n_jobs=1
    )
    reason_model.fit(X_train_denied, y_reasons_train)

    # 7. Model Evaluation on Held-Out Test Set
    y_pred = denial_model.predict(X_test)
    y_prob = denial_model.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    auc = float(roc_auc_score(y_test, y_prob))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))

    cm = confusion_matrix(y_test, y_pred)
    cm_dict = {
        "true_negative": int(cm[0, 0]),
        "false_positive": int(cm[0, 1]),
        "false_negative": int(cm[1, 0]),
        "true_positive": int(cm[1, 1])
    }

    # CARC distribution in dataset
    carc_counts = df[df["will_be_denied"] == 1]["actual_reason_code"].value_counts().to_dict()

    # Payer breakdown
    payer_metrics = []
    for p in PAYER_REFERENCE:
        p_df = df[df["payer_id"] == p["payer_id"]]
        p_denial_rate = float(p_df["will_be_denied"].mean()) if len(p_df) > 0 else 0.0
        payer_metrics.append({
            "payer_id": p["payer_id"],
            "name": p["name"],
            "benchmark_rate": p["avg_denial_rate"],
            "observed_denial_rate": round(p_denial_rate, 3),
            "total_claims": len(p_df),
            "timely_filing_days": p["timely_filing_days"]
        })

    # Financial Impact Projections
    total_prevented_test = cm_dict["true_positive"]
    total_prevented_dataset = int(df["will_be_denied"].sum() * prec)
    rework_savings = round(total_prevented_dataset * settings.REWORK_COST_PER_DENIAL, 2)
    avg_denied_amount = float(df[df["will_be_denied"] == 1]["claim_amount"].mean())
    protected_cash_flow = round(total_prevented_dataset * avg_denied_amount, 2)

    metadata = {
        "model_name": "RandomForestClassifier (Dual-Stage)",
        "model_version": settings.MODEL_VERSION,
        "policy_version": settings.POLICY_VERSION,
        "synthetic_sample_size": settings.SYNTHETIC_CLAIM_COUNT,
        "train_size": len(X_train_raw),
        "test_size": len(X_test_raw),
        "denial_rate": round(float(np.mean(y_binary)), 3),
        "accuracy": round(acc, 4),
        "roc_auc": round(auc, 4),
        "f1_score": round(f1, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "confusion_matrix": cm_dict,
        "carc_distribution": {k: int(v) for k, v in carc_counts.items() if k},
        "payer_metrics": payer_metrics,
        "financial_roi": {
            "rework_cost_per_claim": settings.REWORK_COST_PER_DENIAL,
            "projected_rework_savings": rework_savings,
            "projected_protected_cash_flow": protected_cash_flow,
            "days_deferred_cash_saved": settings.DAYS_DEFERRED_CASH_FLOW
        },
        "leakage_audit_passed": True,
        "data_disclaimer": "SIMULATED / DEMO DATA ONLY. Model metrics reflect validation on synthetic data. Not validated on real clinical EHR or payer claims."
    }

    # 8. Save Artifacts
    joblib.dump(denial_model, settings.MODEL_DIR / "denial_model.joblib")
    joblib.dump(reason_model, settings.MODEL_DIR / "reason_model.joblib")
    joblib.dump(preprocessor, settings.MODEL_DIR / "preprocessor.joblib")

    with open(settings.MODEL_DIR / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("=" * 60)
    print(f"Training Complete! Accuracy: {acc:.2%}, ROC-AUC: {auc:.4f}, F1: {f1:.4f}")
    print(f"Artifacts successfully written to: {settings.MODEL_DIR}")
    print("=" * 60)

    return metadata


if __name__ == "__main__":
    run_training_pipeline()
