from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path
from typing import Dict, List

from backend.core.config import RECONSTRUCTIONS_DIR

RATE_TABLE = {
    "crack": {"unit": "meter", "rate": 20.0},
    "spalling": {"unit": "m2", "rate": 50.0},
    "water_damage": {"unit": "m2", "rate": 15.0},
    "discoloration": {"unit": "m2", "rate": 4.0},
    "default": {"unit": "m2", "rate": 10.0},
}


def _load_damages(job_id: str) -> List[Dict]:
    path = RECONSTRUCTIONS_DIR / job_id / "damages.json"
    if not path.exists():
        raise FileNotFoundError(f"Damage summary missing for job {job_id}")
    with path.open("r", encoding="utf-8") as fp:
        return json.load(fp)["damages"]


def _calc_quantity(entry: Dict) -> float:
    if entry.get("approx_length_m"):
        return float(entry["approx_length_m"])
    if entry.get("approx_area_m2"):
        return float(entry["approx_area_m2"])
    return 1.0


def generate_cost_estimate(job_id: str, currency: str = "USD") -> Path:
    damages = _load_damages(job_id)
    output_dir = RECONSTRUCTIONS_DIR / job_id
    output_dir.mkdir(parents=True, exist_ok=True)
    estimate_path = output_dir / "cost_estimate.json"

    summary: Dict[str, Dict[str, float]] = defaultdict(lambda: {"count": 0.0, "quantity": 0.0, "cost": 0.0})
    total_cost = 0.0

    for damage in damages:
        damage_type = damage.get("type", "default")
        rate_info = RATE_TABLE.get(damage_type, RATE_TABLE["default"])
        quantity = _calc_quantity(damage)
        cost = quantity * rate_info["rate"]

        info = summary[damage_type]
        info["count"] += 1
        info["quantity"] += quantity
        info["cost"] += cost
        total_cost += cost

    items = []
    for damage_type, info in summary.items():
        rate_info = RATE_TABLE.get(damage_type, RATE_TABLE["default"])
        items.append(
            {
                "type": damage_type,
                "unit": rate_info["unit"],
                "count": int(info["count"]),
                "total_quantity": round(info["quantity"], 2),
                "cost": round(info["cost"], 2),
            }
        )

    result = {
        "job_id": job_id,
        "currency": currency,
        "total_cost": round(total_cost, 2),
        "items": items,
    }

    with estimate_path.open("w", encoding="utf-8") as fp:
        json.dump(result, fp, indent=2)

    return estimate_path
