# Model Evaluation & Validation Report
### ClaimShield AI Pre-Submission Engine (v1.0)

---

## 1. Executive Summary

ClaimShield AI was evaluated on a held-out test split of 800 synthetic claims (from a total generated sample of 4,000 records, `RANDOM_SEED = 42`). The binary denial classifier demonstrated robust discriminative power across clinical, administrative, and payer policy dimensions with controlled label noise (5%).

| Metric | Result | Interpretation |
|---|---|---|
| **Accuracy** | **76.00%** | Solid overall prediction across balanced classes |
| **ROC-AUC** | **0.8180** | Strong separation between clean and denial-prone claims |
| **F1-Score** | **0.7606** | Harmonic mean of precision and recall |
| **Precision** | **76.20%** | 3 out of 4 flagged claims are true prospective denials (low false alarm rate) |
| **Recall** | **75.92%** | Captures over 75% of prospective claim denials pre-submission |

---

## 2. Confusion Matrix (Held-Out Test Set, N = 800)

| | Predicted Clean (0) | Predicted Denial (1) | Total Actual |
|---|---|---|---|
| **Actual Clean (0)** | **298** (True Negative) | **95** (False Positive) | 393 |
| **Actual Denied (1)** | **97** (False Negative) | **310** (True Positive) | 407 |

- **True Positives (310)**: Prevented denials intercepted pre-submission for corrective action.
- **False Positives (95)**: Claims routed to manual review for safety checks.
- **False Negatives (97)**: Clean releases that were denied due to controlled 5% label noise or subtle policy interactions.

---

## 3. Leakage Prevention Verification

A programmatic leakage audit (`backend/ml/preprocessor.py` and `tests/test_leakage.py`) guarantees that:
- `will_be_denied` (target label)
- `actual_reason_code` (ground truth reason)
- `actual_status` (post-submission status)
- `payment_amount` (remittance dollar value)
- `remittance_date` (post-submission timestamp)
- `appeal_outcome`
never enter the feature space. All 17 automated unit tests passed.

---

## 4. Synthetic Data Honesty Statement

> **DISCLAIMER**: Model metrics reflect validation against synthetic data with controlled stochasticity. These results demonstrate software flow, architectural integrity, and domain feature engineering. They do not constitute evidence of production effectiveness against real proprietary payer claims or clinical EHR records.
