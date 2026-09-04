import pytest
from backend.database import engine, Base, SessionLocal
from backend.services.claim_service import seed_payers_and_demo_claims
from backend.ml.predictor import ModelService

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_payers_and_demo_claims(db)
    finally:
        db.close()
    
    # Load ML models for tests
    service = ModelService.get_instance()
    service.load_models()
