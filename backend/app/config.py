"""
ClaimShield AI - Application Configuration & Thresholds
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"

DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

class Settings:
    PROJECT_NAME: str = "ClaimShield AI — Pre-Submission Denial Prevention Engine"
    VERSION: str = "demo-v1.0"
    POLICY_VERSION: str = "routing-v1.0"
    MODEL_VERSION: str = "rf-calibrated-v1.0"
    RANDOM_SEED: int = 42

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR}/claimshield.db")

    # Routing Risk Thresholds
    RISK_THRESHOLD_LOW_MAX: float = 0.30
    RISK_THRESHOLD_MEDIUM_MAX: float = 0.70
    MINIMUM_CONFIDENCE_THRESHOLD: float = 0.55

    # File paths
    SYNTHETIC_DATA_PATH: Path = DATA_DIR / "synthetic_claims.csv"
    MODEL_FILE_PATH: Path = MODELS_DIR / "denial_model.joblib"
    MODEL_METADATA_PATH: Path = MODELS_DIR / "model_metadata.json"

    # Simulated Data Disclaimer (must be present everywhere)
    DATA_DISCLAIMER: str = (
        "SIMULATED / DEMO DATA - Generated for hackathon demonstration. "
        "No real patient (PHI) or real payer data is used. "
        "Not clinically validated or payer-certified."
    )

settings = Settings()
