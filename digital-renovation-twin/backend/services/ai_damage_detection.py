from __future__ import annotations

import base64
import json
import logging
import mimetypes
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

from backend.core.config import RECONSTRUCTIONS_DIR, UPLOADS_DIR

VISION_MODEL = os.getenv("OPENAI_VISION_MODEL", "gpt-4o-mini")
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


class DamageDetectionError(RuntimeError):
    """Raised when the AI damage detection pipeline fails."""


def _list_images(job_id: str) -> List[Path]:
    upload_dir = UPLOADS_DIR / job_id
    if not upload_dir.exists():
        raise FileNotFoundError(f"No uploads for job {job_id}")
    images = sorted(p for p in upload_dir.iterdir() if p.is_file())
    if not images:
        raise FileNotFoundError(f"Job {job_id} has no image files to analyze")
    return images


def _encode_image(image_path: Path) -> str:
    mime_type, _ = mimetypes.guess_type(image_path.name)
    mime_type = mime_type or "image/jpeg"
    data = base64.b64encode(image_path.read_bytes()).decode("utf-8")
    return f"data:{mime_type};base64,{data}"


def _load_openai_client():
    if not os.getenv("OPENAI_API_KEY"):
        raise DamageDetectionError("OPENAI_API_KEY environment variable is not set.")
    try:
        from openai import OpenAI
    except ImportError as exc:
        raise DamageDetectionError(
            "openai package is not installed. Run `pip install openai` inside the backend venv."
        ) from exc
    return OpenAI()


def _json_schema() -> Dict:
    return {
        "name": "damage_schema",
        "schema": {
            "type": "object",
            "properties": {
                "damages": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "type": {"type": "string"},
                            "severity": {"type": "string", "enum": ["low", "medium", "high"]},
                            "approx_length_m": {"type": "number"},
                            "approx_area_m2": {"type": "number"},
                            "confidence": {"type": "number"},
                            "description": {"type": "string"},
                        },
                        "required": ["type", "severity", "description"],
                        "additionalProperties": False,
                    },
                    "default": [],
                }
            },
            "required": ["damages"],
            "additionalProperties": False,
        },
    }


def _extract_response_text(response) -> str:
    """Extract text content from OpenAI Chat Completions response."""
    try:
        # Standard Chat Completions API response format
        message = response.choices[0].message
        content = message.content
        if content:
            return content
    except (AttributeError, IndexError):
        pass
    raise DamageDetectionError("Vision API response did not contain output text.")


def _analyze_image(client, image_path: Path) -> List[Dict]:
    """Analyze a single image using OpenAI's Vision API."""
    image_data_url = _encode_image(image_path)
    try:
        response = client.chat.completions.create(
            model=VISION_MODEL,
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
    except Exception as exc:  # pragma: no cover - network failure path
        raise DamageDetectionError(f"Vision API call failed: {exc}") from exc
    try:
        payload = json.loads(_extract_response_text(response))
    except json.JSONDecodeError as exc:
        raise DamageDetectionError("Failed to parse AI response JSON.") from exc
    return payload.get("damages", [])


def _mock_damages(image_name: str, reason: str) -> List[Dict]:
    return [
        {
            "type": "mock_anomaly",
            "severity": "medium",
            "description": f"Placeholder assessment for {image_name} ({reason})",
            "approx_length_m": 1.0,
            "confidence": 0.3,
            "image": image_name,
        }
    ]


def run_damage_detection(job_id: str) -> Path:
    """Run the AI damage detection pipeline using OpenAI's vision models."""
    images = _list_images(job_id)
    try:
        client = _load_openai_client()
    except DamageDetectionError as exc:
        logger.warning("OpenAI client unavailable, falling back to mock damages: %s", exc)
        client = None
    recon_dir = RECONSTRUCTIONS_DIR / job_id
    recon_dir.mkdir(parents=True, exist_ok=True)
    damages_path = recon_dir / "damages.json"

    findings: List[Dict] = []
    for image in images:
        if client is None:
            damages = _mock_damages(image.name, "OpenAI client unavailable")
        else:
            try:
                damages = _analyze_image(client, image)
            except DamageDetectionError as exc:
                logger.warning("Vision analysis failed for %s: %s", image.name, exc)
                damages = _mock_damages(image.name, "Vision API error")
        for damage in damages:
            damage["image"] = image.name
            findings.append(damage)

    data = {
        "job_id": job_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "damages": findings,
    }

    with damages_path.open("w", encoding="utf-8") as fp:
        json.dump(data, fp, indent=2)

    return damages_path
