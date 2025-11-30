"""
Façade Risk Analyzer - FastAPI Backend

AI-powered building facade assessment platform.
"""

import logging
import sys
import traceback

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse

from backend.api.routes_results import router as results_router
from backend.api.routes_upload import router as upload_router
from backend.core.config import DAMAGE_ANALYZER, PIPELINE_VERSION

# =============================================================================
# Logging Configuration
# =============================================================================
# Configure logging to output to both console and file
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("backend.log", mode="a"),
    ],
)

# Also maintain error-only log
error_handler = logging.FileHandler("backend_error.log", mode="a")
error_handler.setLevel(logging.ERROR)
error_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
logging.getLogger().addHandler(error_handler)

logger = logging.getLogger(__name__)

# =============================================================================
# FastAPI Application
# =============================================================================
app = FastAPI(
    title="Façade Risk Analyzer",
    description="AI-powered building facade assessment platform",
    version=PIPELINE_VERSION,
)


@app.on_event("startup")
async def startup_event():
    """Initialize database and log startup info."""
    logger.info("=" * 60)
    logger.info("Façade Risk Analyzer starting up")
    logger.info("Pipeline version: %s", PIPELINE_VERSION)
    logger.info("Damage analyzer mode: %s", DAMAGE_ANALYZER)
    logger.info("=" * 60)
    
    # Initialize database
    try:
        from backend.database import _get_engine
        _get_engine()
        logger.info("Database initialized successfully")
    except Exception as exc:
        logger.warning("Database initialization failed: %s", exc)


@app.exception_handler(Exception)
async def log_unhandled_exception(request: Request, exc: Exception):
    """Log unhandled exceptions with full traceback."""
    tb = traceback.format_exc()
    logger.error("Unhandled exception: %s\nTraceback:\n%s", exc, tb)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {exc}"},
    )


# =============================================================================
# CORS Configuration
# =============================================================================
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# Routes
# =============================================================================
app.include_router(upload_router)
app.include_router(results_router)


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/metrics")
def metrics():
    """
    Metrics endpoint for monitoring.
    
    Returns pipeline version and job statistics.
    """
    try:
        from backend.database import get_job_stats
        stats = get_job_stats()
    except Exception as exc:
        logger.warning("Failed to get job stats: %s", exc)
        stats = {
            "jobs_total": 0,
            "jobs_completed": 0,
            "jobs_failed": 0,
            "jobs_processing": 0,
        }
    
    return {
        "status": "ok",
        "pipeline_version": PIPELINE_VERSION,
        "damage_analyzer": DAMAGE_ANALYZER,
        **stats,
    }
