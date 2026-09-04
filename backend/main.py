import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.database import engine, Base, SessionLocal
from backend.services.claim_service import seed_payers_and_demo_claims
from backend.ml.predictor import ModelService
from backend.routers import predict, claims, outcomes, reference

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema and seed payers / demo claims
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_payers_and_demo_claims(db)
    finally:
        db.close()

    # Pre-warm ML model service
    model_service = ModelService.get_instance()
    if not model_service.is_loaded:
        model_service.load_models()
    yield
    # Shutdown logic if any
    pass

app = FastAPI(
    title="ClaimShield AI — Pre-Submission Denial Prevention Engine",
    description="Intelligent pre-submission RCM denial risk scoring, CARC categorization, explainability, and routing.",
    version=settings.VERSION,
    lifespan=lifespan
)

# Enable CORS for local React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler (Privacy-Aware: Does not leak internal stack traces)
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Log event type and URL without printing potential PHI payloads
    print(f"[SECURITY_LOG] Internal Error on {request.method} {request.url.path}: {type(exc).__name__}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred processing the pre-submission claim.",
            "error_type": type(exc).__name__
        }
    )

from backend.routers import predict, claims, outcomes, reference, scrubber

# Include Routers at root (for direct API callers and pytest test suite)
app.include_router(predict.router)
app.include_router(claims.router)
app.include_router(outcomes.router)
app.include_router(reference.router)
app.include_router(scrubber.router)

# Also Include Routers with /api prefix for frontend client compatibility
app.include_router(predict.router, prefix="/api")
app.include_router(claims.router, prefix="/api")
app.include_router(outcomes.router, prefix="/api")
app.include_router(reference.router, prefix="/api")
app.include_router(scrubber.router, prefix="/api")

@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    model_service = ModelService.get_instance()
    return {
        "status": "ok",
        "model_loaded": model_service.is_loaded,
        "model_version": settings.MODEL_VERSION,
        "policy_version": settings.POLICY_VERSION,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

# Mount React production build if available (Unified Public Deployment)
from backend.config import BASE_DIR
from fastapi.staticfiles import StaticFiles
frontend_dist = BASE_DIR / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="static")


