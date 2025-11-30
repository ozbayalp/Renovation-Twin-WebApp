"""Pytest configuration and shared fixtures."""

import json
import os
import shutil
import tempfile
import uuid
from pathlib import Path

import pytest

# Set test environment before importing backend modules
os.environ["DAMAGE_ANALYZER"] = "mock"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"


@pytest.fixture
def temp_data_dir(monkeypatch):
    """Create a temporary data directory for tests."""
    temp_dir = tempfile.mkdtemp()
    temp_path = Path(temp_dir)
    
    # Create subdirectories
    uploads_dir = temp_path / "uploads"
    recon_dir = temp_path / "reconstructions"
    reports_dir = temp_path / "reports"
    fixtures_dir = temp_path / "fixtures"
    
    uploads_dir.mkdir()
    recon_dir.mkdir()
    reports_dir.mkdir()
    fixtures_dir.mkdir()
    
    # Patch the config module
    monkeypatch.setattr("backend.core.config.DATA_DIR", temp_path)
    monkeypatch.setattr("backend.core.config.UPLOADS_DIR", uploads_dir)
    monkeypatch.setattr("backend.core.config.RECONSTRUCTIONS_DIR", recon_dir)
    monkeypatch.setattr("backend.core.config.REPORTS_DIR", reports_dir)
    monkeypatch.setattr("backend.core.config.FIXTURES_DIR", fixtures_dir)
    
    # Also patch the services that import these at module level
    monkeypatch.setattr("backend.services.risk_scoring.RECONSTRUCTIONS_DIR", recon_dir)
    monkeypatch.setattr("backend.services.cost_estimation.RECONSTRUCTIONS_DIR", recon_dir)
    monkeypatch.setattr("backend.services.pdf_generator.RECONSTRUCTIONS_DIR", recon_dir)
    monkeypatch.setattr("backend.services.pdf_generator.REPORTS_DIR", reports_dir)
    
    yield temp_path
    
    # Cleanup
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
def sample_job_id():
    """Generate a sample job ID."""
    return str(uuid.uuid4())


@pytest.fixture
def sample_damages():
    """Sample damages data for testing."""
    return {
        "job_id": "test-job-123",
        "generated_at": "2024-01-15T10:00:00Z",
        "analyzer": "mock",
        "damages": [
            {
                "type": "crack",
                "severity": "medium",
                "description": "Diagonal crack near window",
                "approx_length_m": 1.5,
                "confidence": 0.85,
                "image": "facade1.jpg",
            },
            {
                "type": "spalling",
                "severity": "high",
                "description": "Concrete spalling at corner",
                "approx_area_m2": 0.5,
                "confidence": 0.9,
                "image": "facade1.jpg",
            },
            {
                "type": "water_damage",
                "severity": "low",
                "description": "Water staining below window",
                "approx_area_m2": 0.3,
                "confidence": 0.75,
                "image": "facade2.jpg",
            },
        ],
    }


@pytest.fixture
def sample_job_with_damages(temp_data_dir, sample_damages):
    """Create a sample job with damages file."""
    # Import after patching
    from backend.core.config import RECONSTRUCTIONS_DIR, UPLOADS_DIR
    
    # Use fixed job ID for predictable testing
    job_id = "test-job-" + str(uuid.uuid4())[:8]
    
    # Create upload directory with a dummy image
    job_upload_dir = UPLOADS_DIR / job_id
    job_upload_dir.mkdir(parents=True)
    
    # Create dummy image files
    (job_upload_dir / "facade1.jpg").write_bytes(b"fake image data 1")
    (job_upload_dir / "facade2.jpg").write_bytes(b"fake image data 2")
    
    # Create job metadata
    meta_path = job_upload_dir / "job_meta.json"
    meta_path.write_text(json.dumps({
        "job_id": job_id,
        "status": "processing",
        "uploaded_files": ["facade1.jpg", "facade2.jpg"],
        "created_at": "2024-01-15T09:00:00Z",
        "label": "Test Building",
    }))
    
    # Create damages file
    recon_dir = RECONSTRUCTIONS_DIR / job_id
    recon_dir.mkdir(parents=True)
    
    damages_data = sample_damages.copy()
    damages_data["job_id"] = job_id
    
    damages_path = recon_dir / "damages.json"
    damages_path.write_text(json.dumps(damages_data))
    
    return {
        "job_id": job_id,
        "damages_path": damages_path,
        "damages": damages_data,
        "recon_dir": recon_dir,
    }
