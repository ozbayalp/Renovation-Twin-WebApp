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

PROMPT = """You are an expert facade inspector. Analyze the provided building exterior photo
and identify cracks, spalling or concrete delamination, water damage/streaks,
discoloration or missing plaster, and any other significant defects visible from
the street. Provide concise measurements (length in meters for cracks, affected
area in square meters for surface damage) using the photo context for an
approximation. Include a severity (low/medium/high) based on likely repair cost
and urgency. Respond strictly using the provided JSON schema."""


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
    output = getattr(response, "output", None) or []
    for item in output:
        contents = getattr(item, "content", []) or []
        for chunk in contents:
            if getattr(chunk, "type", None) == "output_text":
                return chunk.text
    # Fallback to legacy API response format
    text = getattr(response, "output_text", None)
    if text:
        return text
    raise DamageDetectionError("Vision API response did not contain output text.")


def _analyze_image(client, image_path: Path) -> List[Dict]:
    image_data_url = _encode_image(image_path)
    try:
        response = client.responses.create(
            model=VISION_MODEL,
            temperature=0.2,
            max_output_tokens=800,
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": PROMPT},
                        {"type": "input_image", "image_url": image_data_url},
                    ],
                }
            ],
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
