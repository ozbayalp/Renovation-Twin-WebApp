"""Mock damage analyzer that generates realistic synthetic damage data."""

from __future__ import annotations

import hashlib
import json
import logging
import random
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List

from backend.core.config import RECONSTRUCTIONS_DIR, UPLOADS_DIR

logger = logging.getLogger(__name__)

# Realistic damage types with associated parameters
DAMAGE_TEMPLATES = [
    {
        "type": "crack",
        "descriptions": [
            "Hairline crack running vertically near window frame",
            "Diagonal settlement crack at corner junction",
            "Horizontal crack along mortar line",
            "Structural crack extending from foundation",
            "Surface crack in rendered finish",
        ],
        "length_range": (0.3, 2.5),
        "severity_weights": {"low": 0.4, "medium": 0.4, "high": 0.2},
    },
    {
        "type": "spalling",
        "descriptions": [
            "Concrete spalling with exposed aggregate",
            "Delamination of render coat",
            "Brick face spalling due to freeze-thaw",
            "Spalled concrete around reinforcement",
        ],
        "area_range": (0.1, 1.5),
        "severity_weights": {"low": 0.2, "medium": 0.5, "high": 0.3},
    },
    {
        "type": "water_damage",
        "descriptions": [
            "Water staining below window sill",
            "Efflorescence deposits on brickwork",
            "Moisture ingress pattern near parapet",
            "Damp patch indicating rising moisture",
        ],
        "area_range": (0.2, 2.0),
        "severity_weights": {"low": 0.3, "medium": 0.5, "high": 0.2},
    },
    {
        "type": "discoloration",
        "descriptions": [
            "Algae growth on north-facing wall",
            "Weathering discoloration of paint",
            "Staining from metal corrosion runoff",
            "UV degradation of surface coating",
        ],
        "area_range": (0.5, 3.0),
        "severity_weights": {"low": 0.6, "medium": 0.3, "high": 0.1},
    },
    {
        "type": "corrosion",
        "descriptions": [
            "Rust staining from embedded steel",
            "Corroded metal fixings",
            "Oxidation of metal cladding elements",
        ],
        "area_range": (0.05, 0.5),
        "severity_weights": {"low": 0.2, "medium": 0.4, "high": 0.4},
    },
]


class MockDamageAnalyzer:
    """
    Generates realistic-looking synthetic damage data.
    
    Uses a deterministic seed based on job_id for reproducibility,
    while still producing varied and realistic damage patterns.
    """
    
    def __init__(self, seed: int | None = None):
        """
        Initialize the mock analyzer.
        
        Args:
            seed: Optional random seed for reproducibility
        """
        self.base_seed = seed
    
    def _get_seed_for_job(self, job_id: str) -> int:
        """Generate a deterministic seed from job_id."""
        if self.base_seed is not None:
            return self.base_seed
        # Use hash of job_id for deterministic but varied results
        return int(hashlib.md5(job_id.encode()).hexdigest()[:8], 16)
    
    def _weighted_choice(self, weights: Dict[str, float], rng: random.Random) -> str:
        """Make a weighted random choice."""
        items = list(weights.keys())
        probs = list(weights.values())
        return rng.choices(items, weights=probs)[0]
    
    def _generate_damages_for_image(
        self, image_name: str, rng: random.Random
    ) -> List[Dict]:
        """Generate synthetic damages for a single image."""
        # Decide how many damages to generate (0-4 per image)
        num_damages = rng.choices([0, 1, 2, 3, 4], weights=[0.1, 0.3, 0.3, 0.2, 0.1])[0]
        
        damages = []
        used_types = set()
        
        for _ in range(num_damages):
            # Pick a damage type (avoid duplicates within same image)
            available = [t for t in DAMAGE_TEMPLATES if t["type"] not in used_types]
            if not available:
                available = DAMAGE_TEMPLATES
            
            template = rng.choice(available)
            used_types.add(template["type"])
            
            # Generate damage entry
            damage = {
                "type": template["type"],
                "severity": self._weighted_choice(template["severity_weights"], rng),
                "description": rng.choice(template["descriptions"]),
                "confidence": round(rng.uniform(0.7, 0.95), 2),
                "image": image_name,
            }
            
            # Add measurement based on damage type
            if "length_range" in template:
                damage["approx_length_m"] = round(
                    rng.uniform(*template["length_range"]), 2
                )
            if "area_range" in template:
                damage["approx_area_m2"] = round(
                    rng.uniform(*template["area_range"]), 2
                )
            
            damages.append(damage)
        
        return damages
    
    def analyze(self, job_id: str) -> Path:
        """
        Generate mock damage analysis for a job.
        
        Args:
            job_id: The unique identifier for the job
            
        Returns:
            Path to the generated damages.json file
        """
        logger.info("MockDamageAnalyzer: Analyzing job %s", job_id)
        
        # Find images
        upload_dir = UPLOADS_DIR / job_id
        if not upload_dir.exists():
            raise FileNotFoundError(f"No uploads for job {job_id}")
        
        images = sorted(
            p for p in upload_dir.iterdir()
            if p.is_file() and p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".gif"}
        )
        
        if not images:
            # Include any file if no recognized image extensions
            images = sorted(p for p in upload_dir.iterdir() if p.is_file() and not p.name.endswith('.json'))
        
        # Initialize RNG with deterministic seed
        rng = random.Random(self._get_seed_for_job(job_id))
        
        # Generate damages for each image
        all_damages: List[Dict] = []
        for image in images:
            damages = self._generate_damages_for_image(image.name, rng)
            all_damages.extend(damages)
        
        # If no damages generated, add at least one mock entry
        if not all_damages and images:
            all_damages.append({
                "type": "crack",
                "severity": "low",
                "description": "Minor surface crack detected",
                "approx_length_m": 0.5,
                "confidence": 0.75,
                "image": images[0].name,
            })
        
        # Prepare output
        recon_dir = RECONSTRUCTIONS_DIR / job_id
        recon_dir.mkdir(parents=True, exist_ok=True)
        damages_path = recon_dir / "damages.json"
        
        data = {
            "job_id": job_id,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "analyzer": "mock",
            "damages": all_damages,
        }
        
        with damages_path.open("w", encoding="utf-8") as fp:
            json.dump(data, fp, indent=2)
        
        logger.info(
            "MockDamageAnalyzer: Generated %d damages for job %s",
            len(all_damages), job_id
        )
        
        return damages_path
