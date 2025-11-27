from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List

from backend.core.config import RECONSTRUCTIONS_DIR, REPORTS_DIR


def _load_json(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(f"Expected file missing: {path}")
    with path.open("r", encoding="utf-8") as fp:
        return json.load(fp)


def _escape_pdf_text(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _build_content_lines(lines: List[str]) -> str:
    y = 760
    parts = []
    for line in lines:
        escaped = _escape_pdf_text(line)
        parts.append(f"BT /F1 12 Tf 50 {y} Td ({escaped}) Tj ET")
        y -= 16
    return "\n".join(parts) + "\n"


def _write_simple_pdf(path: Path, lines: List[str]) -> None:
    content = _build_content_lines(lines)
    content_bytes = content.encode("utf-8")
    objects = [
        "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        "2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n",
        (
            "3 0 obj\n"
            "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
            "/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\n"
            "endobj\n"
        ),
        f"4 0 obj\n<< /Length {len(content_bytes)} >>\nstream\n{content}\nendstream\nendobj\n",
        "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    ]

    pdf_bytes = bytearray(b"%PDF-1.4\n")
    offsets = []
    for obj in objects:
        offsets.append(len(pdf_bytes))
        pdf_bytes.extend(obj.encode("utf-8"))

    xref_start = len(pdf_bytes)
    pdf_bytes.extend(f"xref\n0 {len(objects)+1}\n".encode("ascii"))
    pdf_bytes.extend(b"0000000000 65535 f \n")
    for offset in offsets:
        pdf_bytes.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    pdf_bytes.extend(
        (
            "trailer\n"
            f"<< /Size {len(objects)+1} /Root 1 0 R >>\n"
            "startxref\n"
            f"{xref_start}\n"
            "%%EOF"
        ).encode("ascii")
    )

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(pdf_bytes)


def generate_pdf_report(job_id: str) -> Path:
    recon_dir = RECONSTRUCTIONS_DIR / job_id
    report_path = REPORTS_DIR / f"{job_id}.pdf"

    damages = _load_json(recon_dir / "damages.json").get("damages", [])
    cost_data = _load_json(recon_dir / "cost_estimate.json")
    risk_data = None
    risk_path = recon_dir / "risk_summary.json"
    if risk_path.exists():
        try:
            risk_data = _load_json(risk_path)
        except Exception:
            risk_data = None

    lines = [
        "AI Property Condition Assessment Report",
        f"Job ID: {job_id}",
        f"Generated: {datetime.now(timezone.utc).isoformat()}",
        "",
        f"Detected damages: {len(damages)}",
        f"Total estimated cost: {cost_data.get('total_cost', 0)} {cost_data.get('currency', 'USD')}",
        "",
        "Breakdown:",
    ]
    for item in cost_data.get("items", []):
        lines.append(
            f"- {item['type']}: {item['count']} findings, "
            f"{item['total_quantity']} {item['unit']} => {item['cost']} {cost_data.get('currency', 'USD')}"
        )

    if risk_data:
        lines.extend(
            [
                "",
                "Risk & Building Health",
                f"Overall risk score: {risk_data.get('overall_risk_score', 'N/A')}",
                f"Severity index (0-10): {risk_data.get('overall_severity_index', 'N/A')}",
                f"Building health grade: {risk_data.get('building_health_grade', 'N/A')}",
            ]
        )
        by_type = risk_data.get("by_type") or {}
        if by_type:
            lines.append("Risk by damage type:")
            for damage_type, stats in by_type.items():
                lines.append(
                    f"- {damage_type}: {stats.get('count', 0)} findings, "
                    f"risk points {stats.get('risk_points', 0)}"
                )

    _write_simple_pdf(report_path, lines)
    return report_path
