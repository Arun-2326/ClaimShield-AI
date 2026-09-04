import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseModel):
    PROJECT_NAME: str = "ClaimShield AI"
    VERSION: str = "1.0.0"
    MODEL_VERSION: str = "demo-v1"
    POLICY_VERSION: str = "routing-v1"
    ENV: str = os.getenv("ENV", "development")
    
    # Storage
    DATA_DIR: Path = BASE_DIR / "data"
    MODEL_DIR: Path = BASE_DIR / "backend" / "ml" / "artifacts"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/data/claimshield.db")
    
    # ML & Simulation
    RANDOM_SEED: int = 42
    SYNTHETIC_CLAIM_COUNT: int = 4000
    LABEL_NOISE_RATE: float = 0.05
    
    # Routing Policy Thresholds
    LOW_RISK_MAX: float = 0.30
    MEDIUM_RISK_MAX: float = 0.70
    MINIMUM_CONFIDENCE: float = 0.55
    
    # Financial Impact Projections (Illustrative assumptions)
    REWORK_COST_PER_DENIAL: float = 25.00  # Average industry rework administrative cost
    DAYS_DEFERRED_CASH_FLOW: int = 32     # Average adjudication cycle delay

settings = Settings()
