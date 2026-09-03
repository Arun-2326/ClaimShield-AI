"""
ClaimShield AI - Feature Engineering & Leakage Prevention Pipeline
Ensures zero post-submission leakage and transforms raw claim payloads into typed numeric features.
"""
from typing import List, Dict, Any, Tuple, Optional
import pandas as pd
import numpy as np
import json
from app.schemas.claim import ClaimCreate
from app.services.data_generator import PAYER_PROFILES

# Strictly prohibited post-submission leakage columns
LEAKAGE_COLUMNS = {
    "will_be_denied",
    "actual_reason_code",
    "actual_status",
    "payment_amount",
    "remittance_date",
    "appeal_outcome",
    "post_submission_status",
    "status"
}

FEATURE_COLUMNS = [
    "claim_amount",
    "days_since_eligibility_check",
    "prior_auth_flag",
    "eligibility_verified",
    "documentation_complete",
    "duplicate_candidate",
    "timely_filing_risk",
    "payer_denial_rate",
    "payer_requires_prior_auth",
    "coverage_indicator",
    "medical_necessity_indicator",
    "bundling_indicator",
    "cpt_count",
    "icd_count",
    "high_dollar_flag",
    "prior_auth_mismatch",
    "stale_eligibility_flag",
    # One-hot encoded payers
    "payer_PAYER_001",
    "payer_PAYER_002",
    "payer_PAYER_003",
    "payer_PAYER_004",
    "payer_PAYER_005",
    "payer_PAYER_006",
    # One-hot encoded specialties
    "spec_Family_Medicine",
    "spec_Internal_Medicine",
    "spec_Cardiology",
    "spec_Orthopedic_Surgery",
    "spec_Gastroenterology",
    "spec_Physical_Therapy",
    "spec_Radiology"
]

def assert_no_data_leakage(df_or_feature_names: Any):
    """
    Verifies that no post-submission or outcome fields exist in the feature set.
    Raises ValueError if leakage is detected.
    """
    if isinstance(df_or_feature_names, pd.DataFrame):
        cols = set(df_or_feature_names.columns)
    elif isinstance(df_or_feature_names, (list, set, tuple)):
        cols = set(df_or_feature_names)
    else:
        cols = set()

    leaked = cols.intersection(LEAKAGE_COLUMNS)
    if leaked:
        raise ValueError(f"CRITICAL DATA LEAKAGE DETECTED! Found post-submission columns in feature matrix: {leaked}")
    return True

def extract_features_from_claim_dict(claim_data: Dict[str, Any]) -> pd.DataFrame:
    """
    Transforms a single claim dictionary into a 1-row DataFrame aligned with FEATURE_COLUMNS.
    """
    cpt_list = claim_data.get("cpt_codes", [])
    if isinstance(cpt_list, str):
        try:
            cpt_list = json.loads(cpt_list)
        except Exception:
            cpt_list = [cpt_list]

    icd_list = claim_data.get("icd_codes", [])
    if isinstance(icd_list, str):
        try:
            icd_list = json.loads(icd_list)
        except Exception:
            icd_list = [icd_list]

    payer_id = claim_data.get("payer_id", "PAYER_001")
    payer_info = PAYER_PROFILES.get(payer_id, PAYER_PROFILES["PAYER_001"])

    cpt_count = max(1, len(cpt_list))
    icd_count = max(1, len(icd_list))

    payer_requires_pa = any(cpt in payer_info["strict_prior_auth_cpts"] for cpt in cpt_list)
    prior_auth_flag = bool(claim_data.get("prior_auth_flag", False))
    eligibility_verified = bool(claim_data.get("eligibility_verified", True))
    days_since_elig = int(claim_data.get("days_since_eligibility_check") or 0)
    claim_amount = float(claim_data.get("claim_amount", 100.0))
    doc_complete = bool(claim_data.get("documentation_complete", True))
    duplicate_cand = bool(claim_data.get("duplicate_candidate", False))
    timely_risk = bool(claim_data.get("timely_filing_risk", False))
    cov_ind = bool(claim_data.get("coverage_indicator", True))
    med_nec = bool(claim_data.get("medical_necessity_indicator", True))
    bundling = bool(claim_data.get("bundling_indicator", False))
    specialty = claim_data.get("provider_specialty", "Family Medicine")

    row = {
        "claim_amount": claim_amount,
        "days_since_eligibility_check": days_since_elig,
        "prior_auth_flag": 1 if prior_auth_flag else 0,
        "eligibility_verified": 1 if eligibility_verified else 0,
        "documentation_complete": 1 if doc_complete else 0,
        "duplicate_candidate": 1 if duplicate_cand else 0,
        "timely_filing_risk": 1 if timely_risk else 0,
        "payer_denial_rate": payer_info["avg_denial_rate"],
        "payer_requires_prior_auth": 1 if payer_requires_pa else 0,
        "coverage_indicator": 1 if cov_ind else 0,
        "medical_necessity_indicator": 1 if med_nec else 0,
        "bundling_indicator": 1 if bundling else 0,
        "cpt_count": cpt_count,
        "icd_count": icd_count,
        "high_dollar_flag": 1 if claim_amount > 2000.0 else 0,
        "prior_auth_mismatch": 1 if (payer_requires_pa and not prior_auth_flag) else 0,
        "stale_eligibility_flag": 1 if (not eligibility_verified or days_since_elig > 30) else 0
    }

    # Payer one-hot
    for pid in ["PAYER_001", "PAYER_002", "PAYER_003", "PAYER_004", "PAYER_005", "PAYER_006"]:
        row[f"payer_{pid}"] = 1 if payer_id == pid else 0

    # Specialty one-hot
    spec_map = {
        "Family Medicine": "spec_Family_Medicine",
        "Internal Medicine": "spec_Internal_Medicine",
        "Cardiology": "spec_Cardiology",
        "Orthopedic Surgery": "spec_Orthopedic_Surgery",
        "Gastroenterology": "spec_Gastroenterology",
        "Physical Therapy": "spec_Physical_Therapy",
        "Radiology": "spec_Radiology"
    }
    for spec_name, col_name in spec_map.items():
        row[col_name] = 1 if specialty == spec_name else 0

    df_row = pd.DataFrame([row])
    # Reindex to ensure strict column ordering
    df_row = df_row.reindex(columns=FEATURE_COLUMNS, fill_value=0)
    assert_no_data_leakage(df_row)
    return df_row

def build_training_matrix(raw_df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series, pd.Series]:
    """
    Builds the feature matrix X and target vectors y_binary, y_carc from raw synthetic dataset.
    Strictly excludes leakage columns.
    """
    assert_no_data_leakage(FEATURE_COLUMNS)

    X_rows = []
    for _, row_dict in raw_df.iterrows():
        df_row = extract_features_from_claim_dict(row_dict.to_dict())
        X_rows.append(df_row)

    X = pd.concat(X_rows, ignore_index=True)
    y_binary = raw_df["will_be_denied"].astype(int)
    y_carc = raw_df["actual_reason_code"]

    assert_no_data_leakage(X)
    return X, y_binary, y_carc
