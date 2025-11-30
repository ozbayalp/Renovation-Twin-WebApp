from pathlib import Path
import os

# =============================================================================
# Pipeline Version
# =============================================================================
PIPELINE_VERSION = "v1.0.0"

# =============================================================================
# Paths - resolve relative to backend/ directory regardless of where app runs
# =============================================================================
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
RECONSTRUCTIONS_DIR = DATA_DIR / "reconstructions"
REPORTS_DIR = DATA_DIR / "reports"
TMP_DIR = DATA_DIR / "tmp"
FIXTURES_DIR = BACKEND_DIR / "fixtures"

# =============================================================================
# Database
# =============================================================================
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR / 'facade_risk.db'}")

# =============================================================================
# Analyzer Configuration
# =============================================================================
# Options: "mock" (default), "openai", "replay"
DAMAGE_ANALYZER = os.getenv("DAMAGE_ANALYZER", "mock").lower()

# OpenAI settings
OPENAI_VISION_MODEL = os.getenv("OPENAI_VISION_MODEL", "gpt-4o-mini")


def ensure_data_directories() -> None:
    """Make sure required data directories exist."""
    for path in [UPLOADS_DIR, RECONSTRUCTIONS_DIR, REPORTS_DIR, TMP_DIR, FIXTURES_DIR]:
        path.mkdir(parents=True, exist_ok=True)
