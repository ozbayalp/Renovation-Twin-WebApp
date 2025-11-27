from pathlib import Path

# Paths resolve relative to backend/ directory regardless of where the app runs.
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
RECONSTRUCTIONS_DIR = DATA_DIR / "reconstructions"
REPORTS_DIR = DATA_DIR / "reports"
TMP_DIR = DATA_DIR / "tmp"


def ensure_data_directories() -> None:
    """Make sure required data directories exist."""
    for path in [UPLOADS_DIR, RECONSTRUCTIONS_DIR, REPORTS_DIR, TMP_DIR]:
        path.mkdir(parents=True, exist_ok=True)
