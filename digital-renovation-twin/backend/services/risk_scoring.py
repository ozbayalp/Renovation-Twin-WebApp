from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path
from typing import Dict, Any

from backend.core.config import RECONSTRUCTIONS_DIR

RISK_OUTPUT_FILENAME = "risk_summary.json"

TYPE_WEIGHTS = {
    "crack": 3.0,
    "spalling": 4.0,
    "water_damage": 2.5,
    "moisture": 2.5,
    "discoloration": 1.5,
    "corrosion": 4.5,
    "default": 2.0,
    "unknown": 2.0,
}

SEVERITY_MULTIPLIER = {"low": 0.8, "medium": 1.0, "high": 1.4}

SEVERITY_SCALE = 5.0  # Higher -> lower severity index for same risk points


def _load_damages(job_id: str) -> Dict[str, Any]:
    path = RECONSTRUCTIONS_DIR / job_id / "damages.json"
    if not path.exists():
        raise FileNotFoundError(f"Damage summary missing for job {job_id}")
    with path.open("r", encoding="utf-8") as fp:
        return json.load(fp)


def _grade_from_score(score: float) -> str:
    if score < 20:
        return "A"
    if score < 40:
        return "B"
    if score < 70:
        return "C"
    return "D"


def _safe_float(value: Any, default: float = 1.0) -> float:
    try:
        number = float(value)
        if number <= 0:
            return default
        return number
    except (TypeError, ValueError):
        return default


def compute_risk_summary(job_id: str) -> Path:
    """
    Analyze detected damages and compute aggregate risk/health scores.
    Returns the path to risk_summary.json.
    """
    payload = _load_damages(job_id)
    damages = payload.get("damages", [])
    output_dir = RECONSTRUCTIONS_DIR / job_id
    output_dir.mkdir(parents=True, exist_ok=True)
    risk_path = output_dir / RISK_OUTPUT_FILENAME

    totals: Dict[str, Dict[str, float]] = defaultdict(lambda: {"count": 0, "risk_points": 0.0})
    total_risk_points = 0.0

    for damage in damages:
        damage_type = damage.get("type", "unknown")
        normalized_type = damage_type if damage_type in TYPE_WEIGHTS else "unknown"
        base_weight = TYPE_WEIGHTS.get(normalized_type, TYPE_WEIGHTS["unknown"])
        severity_label = str(damage.get("severity", "medium")).lower()
        severity_factor = SEVERITY_MULTIPLIER.get(severity_label, 1.0)

        magnitude = damage.get("approx_length_m")
        if magnitude is None:
            magnitude = damage.get("approx_area_m2")
        magnitude_value = _safe_float(magnitude, default=1.0)

        risk_points = base_weight * severity_factor * magnitude_value

        totals[normalized_type]["count"] += 1
        totals[normalized_type]["risk_points"] += risk_points
        total_risk_points += risk_points

    total_damage_count = len(damages)
    overall_severity_index = round(min(10.0, total_risk_points / SEVERITY_SCALE), 2)
    overall_risk_score = round(min(100.0, overall_severity_index * 10.0), 1)
    health_grade = _grade_from_score(overall_risk_score)

    summary = {
        "job_id": job_id,
        "total_damage_count": total_damage_count,
        "overall_severity_index": overall_severity_index,
        "overall_risk_score": overall_risk_score,
        "building_health_grade": health_grade,
        "by_type": {
            damage_type: {
                "count": stats["count"],
                "risk_points": round(stats["risk_points"], 2),
            }
            for damage_type, stats in totals.items()
        },
    }

    with risk_path.open("w", encoding="utf-8") as fp:
        json.dump(summary, fp, indent=2)

    return risk_path
