"""Replay analyzer that uses pre-recorded fixtures."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

from backend.core.config import FIXTURES_DIR, RECONSTRUCTIONS_DIR, UPLOADS_DIR

from .base import DamageAnalysisError

logger = logging.getLogger(__name__)


class ReplayDamageAnalyzer:
    """
    Replays pre-recorded damage analysis fixtures.
    
    This analyzer is useful for:
    - Testing the full pipeline without OpenAI API costs
    - Demos and presentations with consistent results
    - CI/CD pipelines that need deterministic outputs
    
    Fixtures are loaded from backend/fixtures/damages/ directory.
    """
    
    def __init__(self, fixtures_dir: Optional[Path] = None):
        """
        Initialize the replay analyzer.
        
        Args:
            fixtures_dir: Optional custom fixtures directory
        """
        self.fixtures_dir = fixtures_dir or (FIXTURES_DIR / "damages")
    
    def _find_fixture(self, job_id: str) -> Path:
        """
        Find the appropriate fixture file for a job.
        
        Lookup order:
        1. {job_id}.json - exact match
        2. sample_damages.json - default fixture
        """
        self.fixtures_dir.mkdir(parents=True, exist_ok=True)
        
        # Try exact match first
        exact_match = self.fixtures_dir / f"{job_id}.json"
        if exact_match.exists():
            return exact_match
        
        # Fall back to default fixture
        default_fixture = self.fixtures_dir / "sample_damages.json"
        if default_fixture.exists():
            return default_fixture
        
        raise DamageAnalysisError(
            f"No fixture found for job {job_id}. "
            f"Please create {default_fixture} or {exact_match}"
        )
    
    def _load_fixture(self, fixture_path: Path) -> List[Dict]:
        """Load and validate a fixture file."""
        try:
            with fixture_path.open("r", encoding="utf-8") as fp:
                data = json.load(fp)
        except json.JSONDecodeError as exc:
            raise DamageAnalysisError(
                f"Invalid JSON in fixture {fixture_path}: {exc}"
            ) from exc
        
        # Handle both raw damages array and wrapped format
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            return data.get("damages", [])
        
        raise DamageAnalysisError(
            f"Unexpected fixture format in {fixture_path}"
        )
    
    def analyze(self, job_id: str) -> Path:
        """
        Replay damage analysis from fixtures.
        
        Args:
            job_id: The unique identifier for the job
            
        Returns:
            Path to the generated damages.json file
        """
        logger.info("ReplayDamageAnalyzer: Replaying fixtures for job %s", job_id)
        
        # Verify job exists
        upload_dir = UPLOADS_DIR / job_id
        if not upload_dir.exists():
            raise FileNotFoundError(f"No uploads for job {job_id}")
        
        # Get image names for attribution
        images = sorted(
            p.name for p in upload_dir.iterdir()
            if p.is_file() and not p.name.endswith('.json')
        )
        
        # Load fixture
        fixture_path = self._find_fixture(job_id)
        damages = self._load_fixture(fixture_path)
        
        # Assign images to damages if not already set
        for i, damage in enumerate(damages):
            if "image" not in damage and images:
                damage["image"] = images[i % len(images)]
        
        # Prepare output
        recon_dir = RECONSTRUCTIONS_DIR / job_id
        recon_dir.mkdir(parents=True, exist_ok=True)
        damages_path = recon_dir / "damages.json"
        
        data = {
            "job_id": job_id,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "analyzer": "replay",
            "fixture_source": str(fixture_path.name),
            "damages": damages,
        }
        
        with damages_path.open("w", encoding="utf-8") as fp:
            json.dump(data, fp, indent=2)
        
        logger.info(
            "ReplayDamageAnalyzer: Replayed %d damages from %s for job %s",
            len(damages), fixture_path.name, job_id
        )
        
        return damages_path
