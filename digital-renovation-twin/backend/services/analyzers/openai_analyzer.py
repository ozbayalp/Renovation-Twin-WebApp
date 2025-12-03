"""OpenAI Vision API damage analyzer."""

from __future__ import annotations

import base64
import json
import logging
import mimetypes
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

from backend.core.config import OPENAI_VISION_MODEL, RECONSTRUCTIONS_DIR, UPLOADS_DIR

from .base import DamageAnalysisError

logger = logging.getLogger(__name__)

PROMPT = """You are an expert facade inspector. Analyze the provided building exterior photo and identify all visible damage including:
- Cracks (hairline, structural, settlement)
- Spalling or concrete delamination
- Water damage, moisture stains, or efflorescence
- Discoloration, staining, or missing plaster
- Corrosion or rust staining
- Any other significant facade defects

For each damage found, estimate:
- Approximate length in meters (for linear damage like cracks)
- Approximate affected area in square meters (for surface damage)
- Severity: "low" (cosmetic), "medium" (requires attention), or "high" (urgent repair needed)
- Confidence score from 0.0 to 1.0

Respond with a JSON object containing a "damages" array. Each damage entry must have:
- "type": string (e.g., "crack", "spalling", "water_damage", "discoloration", "corrosion")
- "severity": "low" | "medium" | "high"
- "description": brief description of the damage and location
- "approx_length_m": number (optional, for linear damage)
- "approx_area_m2": number (optional, for surface damage)
- "confidence": number between 0 and 1

If no damage is visible, return {"damages": []}."""


def _encode_image(image_path: Path) -> str:
    """Encode image to base64 data URL."""
    mime_type, _ = mimetypes.guess_type(image_path.name)
    mime_type = mime_type or "image/jpeg"
    data = base64.b64encode(image_path.read_bytes()).decode("utf-8")
    return f"data:{mime_type};base64,{data}"


def _load_openai_client(api_key: Optional[str] = None):
    """
    Load and return OpenAI client.
    
    Args:
        api_key: Optional API key override. If not provided, uses OPENAI_API_KEY env var.
    """
    key = api_key or os.getenv("OPENAI_API_KEY")
    if not key:
        raise DamageAnalysisError(
            "OpenAI API key is required. Please provide your API key in Settings."
        )
    try:
        from openai import OpenAI
    except ImportError as exc:
        raise DamageAnalysisError(
            "openai package is not installed. Run `pip install openai`."
        ) from exc
    return OpenAI(api_key=key)


class OpenAIDamageAnalyzer:
    """
    Analyzes facade images using OpenAI's Vision API (GPT-4o).
    
    This analyzer sends images to OpenAI's Vision API and parses the
    structured JSON response to extract damage information.
    """
    
    def __init__(self, model: Optional[str] = None, api_key: Optional[str] = None):
        """
        Initialize the OpenAI analyzer.
        
        Args:
            model: Optional model override (defaults to config value)
            api_key: Optional API key override (defaults to OPENAI_API_KEY env var)
        """
        self.model = model or OPENAI_VISION_MODEL
        self._api_key = api_key
        self._client = None
    
    @property
    def client(self):
        """Lazy-load the OpenAI client."""
        if self._client is None:
            self._client = _load_openai_client(self._api_key)
        return self._client
    
    def _analyze_image(self, image_path: Path) -> List[Dict]:
        """Analyze a single image using OpenAI Vision API."""
        image_data_url = _encode_image(image_path)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                temperature=0.2,
                max_tokens=800,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": PROMPT},
                            {"type": "image_url", "image_url": {"url": image_data_url}},
                        ],
                    }
                ],
                response_format={"type": "json_object"},
            )
        except Exception as exc:
            raise DamageAnalysisError(f"Vision API call failed: {exc}") from exc
        
        # Extract response text
        try:
            message = response.choices[0].message
            content = message.content
            if not content:
                raise DamageAnalysisError("Vision API response was empty")
        except (AttributeError, IndexError) as exc:
            raise DamageAnalysisError(
                "Vision API response format unexpected"
            ) from exc
        
        # Parse JSON
        try:
            payload = json.loads(content)
        except json.JSONDecodeError as exc:
            raise DamageAnalysisError(
                f"Failed to parse AI response JSON: {content[:100]}..."
            ) from exc
        
        return payload.get("damages", [])
    
    def analyze(self, job_id: str) -> Path:
        """
        Run OpenAI Vision damage analysis for a job.
        
        Args:
            job_id: The unique identifier for the job
            
        Returns:
            Path to the generated damages.json file
        """
        logger.info("OpenAIDamageAnalyzer: Analyzing job %s with model %s", job_id, self.model)
        
        # Find images
        upload_dir = UPLOADS_DIR / job_id
        if not upload_dir.exists():
            raise FileNotFoundError(f"No uploads for job {job_id}")
        
        images = sorted(
            p for p in upload_dir.iterdir()
            if p.is_file() and p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".gif"}
        )
        
        if not images:
            images = sorted(
                p for p in upload_dir.iterdir()
                if p.is_file() and not p.name.endswith('.json')
            )
        
        if not images:
            raise FileNotFoundError(f"Job {job_id} has no image files to analyze")
        
        # Analyze each image
        all_damages: List[Dict] = []
        for image in images:
            try:
                damages = self._analyze_image(image)
                for damage in damages:
                    damage["image"] = image.name
                    all_damages.append(damage)
                logger.debug("Analyzed %s: %d damages found", image.name, len(damages))
            except DamageAnalysisError as exc:
                logger.warning("Failed to analyze %s: %s", image.name, exc)
                # Continue with other images rather than failing completely
        
        # Prepare output
        recon_dir = RECONSTRUCTIONS_DIR / job_id
        recon_dir.mkdir(parents=True, exist_ok=True)
        damages_path = recon_dir / "damages.json"
        
        data = {
            "job_id": job_id,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "analyzer": "openai",
            "model": self.model,
            "damages": all_damages,
        }
        
        with damages_path.open("w", encoding="utf-8") as fp:
            json.dump(data, fp, indent=2)
        
        logger.info(
            "OpenAIDamageAnalyzer: Found %d damages across %d images for job %s",
            len(all_damages), len(images), job_id
        )
        
        return damages_path
