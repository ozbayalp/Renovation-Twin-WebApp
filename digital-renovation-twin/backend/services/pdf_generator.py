from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Tuple, Optional

from backend.core.config import RECONSTRUCTIONS_DIR, REPORTS_DIR, UPLOADS_DIR


def _load_json(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(f"Expected file missing: {path}")
    with path.open("r", encoding="utf-8") as fp:
        return json.load(fp)


def _escape_pdf_text(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


class PDFBuilder:
    """Professional PDF builder with multi-page support and formatting."""
    
    def __init__(self, width: int = 612, height: int = 792):
        self.width = width
        self.height = height
        self.pages: List[str] = []
        self.current_page: List[str] = []
        self.y = height - 72  # Start with 1-inch top margin
        self.left_margin = 60
        self.line_height = 16
        
    def _add_text(self, text: str, x: int, y: int, font: str = "F1", size: int = 11, color: Tuple[float, float, float] = (0, 0, 0)) -> None:
        escaped = _escape_pdf_text(text)
        r, g, b = color
        self.current_page.append(f"{r} {g} {b} rg")
        self.current_page.append(f"BT /{font} {size} Tf {x} {y} Td ({escaped}) Tj ET")
        
    def _draw_line(self, x1: int, y1: int, x2: int, y2: int, width: float = 0.5, color: Tuple[float, float, float] = (0.8, 0.8, 0.8)) -> None:
        r, g, b = color
        self.current_page.append(f"{r} {g} {b} RG")
        self.current_page.append(f"{width} w")
        self.current_page.append(f"{x1} {y1} m {x2} {y2} l S")
        
    def _draw_rect(self, x: int, y: int, w: int, h: int, fill_color: Tuple[float, float, float], stroke: bool = False) -> None:
        r, g, b = fill_color
        self.current_page.append(f"{r} {g} {b} rg")
        if stroke:
            self.current_page.append(f"{x} {y} {w} {h} re B")
        else:
            self.current_page.append(f"{x} {y} {w} {h} re f")
    
    def _check_page_break(self, needed_space: int = 100) -> None:
        if self.y < needed_space:
            self._new_page()
    
    def _new_page(self) -> None:
        if self.current_page:
            self.pages.append("\n".join(self.current_page) + "\n")
        self.current_page = []
        self.y = self.height - 72
        
    def add_header(self, title: str, subtitle: str = "") -> None:
        # Header background
        self._draw_rect(0, self.height - 120, self.width, 120, (0.11, 0.11, 0.11))
        
        # Title
        self._add_text(title, self.left_margin, self.height - 55, "F2", 24, (1, 1, 1))
        
        # Subtitle
        if subtitle:
            self._add_text(subtitle, self.left_margin, self.height - 80, "F1", 11, (0.7, 0.7, 0.7))
        
        self.y = self.height - 150
        
    def add_section_title(self, title: str) -> None:
        self._check_page_break(80)
        self.y -= 20
        
        # Section title with underline
        self._add_text(title, self.left_margin, self.y, "F2", 14, (0.11, 0.11, 0.11))
        self.y -= 8
        self._draw_line(self.left_margin, self.y, self.width - self.left_margin, self.y, 1.5, (0.18, 0.55, 0.34))
        self.y -= 20
        
    def add_paragraph(self, text: str) -> None:
        self._check_page_break(40)
        self._add_text(text, self.left_margin, self.y, "F1", 11, (0.32, 0.32, 0.32))
        self.y -= self.line_height
        
    def add_key_value(self, key: str, value: str, indent: int = 0) -> None:
        self._check_page_break(30)
        x = self.left_margin + indent
        self._add_text(f"{key}:", x, self.y, "F2", 11, (0.11, 0.11, 0.11))
        self._add_text(value, x + 150, self.y, "F1", 11, (0.32, 0.32, 0.32))
        self.y -= self.line_height + 4
        
    def add_metric_box(self, label: str, value: str, x: int, y: int, width: int = 120, color: Tuple[float, float, float] = (0.95, 0.95, 0.95)) -> None:
        # Box background
        self._draw_rect(x, y - 50, width, 60, color)
        # Label
        self._add_text(label, x + 10, y - 15, "F1", 9, (0.5, 0.5, 0.5))
        # Value
        self._add_text(value, x + 10, y - 38, "F2", 18, (0.11, 0.11, 0.11))
        
    def add_metrics_row(self, metrics: List[Tuple[str, str, Tuple[float, float, float]]]) -> None:
        self._check_page_break(100)
        self.y -= 20
        box_width = (self.width - 2 * self.left_margin - 30) // len(metrics)
        x = self.left_margin
        for label, value, color in metrics:
            self.add_metric_box(label, value, x, self.y, box_width, color)
            x += box_width + 10
        self.y -= 80
        
    def add_table_row(self, cols: List[str], widths: List[int], is_header: bool = False, bg_color: Optional[Tuple[float, float, float]] = None) -> None:
        self._check_page_break(30)
        
        if bg_color:
            self._draw_rect(self.left_margin, self.y - 5, self.width - 2 * self.left_margin, 20, bg_color)
        
        x = self.left_margin
        font = "F2" if is_header else "F1"
        color = (1, 1, 1) if is_header else (0.32, 0.32, 0.32)
        
        for i, col in enumerate(cols):
            self._add_text(col[:30], x + 5, self.y, font, 10, color)
            x += widths[i]
        
        self.y -= 22
        
    def add_bullet_point(self, text: str, indent: int = 0) -> None:
        self._check_page_break(30)
        x = self.left_margin + indent
        # Use dash as bullet - more compatible with PDF Type1 fonts
        self._add_text("-", x, self.y, "F2", 11, (0.18, 0.55, 0.34))
        self._add_text(text, x + 12, self.y, "F1", 11, (0.32, 0.32, 0.32))
        self.y -= self.line_height + 4
        
    def add_spacer(self, height: int = 20) -> None:
        self.y -= height
        
    def add_footer(self, text: str) -> None:
        self._add_text(text, self.left_margin, 40, "F1", 9, (0.6, 0.6, 0.6))
        self._add_text(f"Page {len(self.pages) + 1}", self.width - 100, 40, "F1", 9, (0.6, 0.6, 0.6))
        
    def build(self, path: Path) -> None:
        # Finalize current page
        if self.current_page:
            self.pages.append("\n".join(self.current_page) + "\n")
        
        # Build PDF with multiple pages
        objects = [
            "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        ]
        
        # Pages object
        page_refs = " ".join([f"{i + 3} 0 R" for i in range(len(self.pages))])
        objects.append(f"2 0 obj\n<< /Type /Pages /Count {len(self.pages)} /Kids [{page_refs}] >>\nendobj\n")
        
        # Page objects and content streams
        content_start = 3 + len(self.pages)
        font_obj = content_start + len(self.pages)
        font_bold_obj = font_obj + 1
        
        for i, _ in enumerate(self.pages):
            content_ref = content_start + i
            objects.append(
                f"{3 + i} 0 obj\n"
                f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {self.width} {self.height}] "
                f"/Contents {content_ref} 0 R /Resources << /Font << /F1 {font_obj} 0 R /F2 {font_bold_obj} 0 R >> >> >>\n"
                "endobj\n"
            )
        
        # Content streams
        for page_content in self.pages:
            content_bytes = page_content.encode("utf-8")
            objects.append(f"<< /Length {len(content_bytes)} >>\nstream\n{page_content}endstream\nendobj\n")
        
        # Fonts
        objects.append("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")
        objects.append("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n")
        
        # Assign object numbers
        numbered_objects = []
        for i, obj in enumerate(objects):
            if not obj.startswith(f"{i + 1} 0 obj"):
                numbered_objects.append(f"{i + 1} 0 obj\n{obj}")
            else:
                numbered_objects.append(obj)
        
        # Build final PDF
        pdf_bytes = bytearray(b"%PDF-1.4\n")
        offsets = []
        for obj in numbered_objects:
            offsets.append(len(pdf_bytes))
            pdf_bytes.extend(obj.encode("utf-8"))
        
        xref_start = len(pdf_bytes)
        pdf_bytes.extend(f"xref\n0 {len(numbered_objects) + 1}\n".encode("ascii"))
        pdf_bytes.extend(b"0000000000 65535 f \n")
        for offset in offsets:
            pdf_bytes.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
        pdf_bytes.extend(
            (
                "trailer\n"
                f"<< /Size {len(numbered_objects) + 1} /Root 1 0 R >>\n"
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
    
    # Load data
    damages = _load_json(recon_dir / "damages.json").get("damages", [])
    cost_data = _load_json(recon_dir / "cost_estimate.json")
    
    risk_data = None
    risk_path = recon_dir / "risk_summary.json"
    if risk_path.exists():
        try:
            risk_data = _load_json(risk_path)
        except Exception:
            risk_data = None
    
    # Load job metadata for file count
    job_meta_path = UPLOADS_DIR / job_id / "job_meta.json"
    file_count = 0
    job_label = f"Assessment {job_id[:8]}"
    if job_meta_path.exists():
        try:
            meta = _load_json(job_meta_path)
            file_count = len(meta.get("uploaded_files", []))
            job_label = meta.get("label") or job_label
        except Exception:
            pass
    
    # Build professional PDF
    pdf = PDFBuilder()
    
    # Header
    generated_date = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")
    pdf.add_header(
        "Building Facade Assessment Report",
        f"Generated: {generated_date}  |  Reference: {job_id[:8].upper()}"
    )
    
    # Executive Summary
    pdf.add_section_title("Executive Summary")
    pdf.add_paragraph(f"This report presents the findings of an AI-powered analysis of building facade images")
    pdf.add_paragraph(f"for the assessment labeled \"{job_label}\". The analysis detected {len(damages)} damage instances")
    pdf.add_paragraph(f"across {file_count} uploaded images, with an estimated total repair cost of")
    pdf.add_paragraph(f"${cost_data.get('total_cost', 0):,.2f} {cost_data.get('currency', 'USD')}.")
    pdf.add_spacer(10)
    
    # Key Metrics
    if risk_data:
        grade = risk_data.get("building_health_grade", "N/A")
        risk_score = risk_data.get("overall_risk_score", "N/A")
        severity = risk_data.get("overall_severity_index", "N/A")
        
        # Color coding for grade
        grade_color = (0.88, 0.95, 0.88) if grade == "A" else (0.88, 0.92, 0.98) if grade == "B" else (1.0, 0.95, 0.88) if grade == "C" else (0.98, 0.88, 0.88)
        
        pdf.add_metrics_row([
            ("HEALTH GRADE", grade, grade_color),
            ("RISK SCORE", f"{risk_score}/100", (0.95, 0.95, 0.95)),
            ("SEVERITY INDEX", f"{severity}/10", (0.95, 0.95, 0.95)),
            ("FILES ANALYZED", str(file_count), (0.95, 0.95, 0.95)),
        ])
    
    # Damage Detection Results
    pdf.add_section_title("Damage Detection Results")
    pdf.add_paragraph(f"The AI analysis identified {len(damages)} instances of damage across the facade images.")
    pdf.add_spacer(10)
    
    if damages:
        # Summary by type
        severity_map = {"low": 3, "medium": 5, "high": 8}
        damage_types = {}
        for d in damages:
            dtype = d.get("type", "Unknown")
            if dtype not in damage_types:
                damage_types[dtype] = {"count": 0, "severities": []}
            damage_types[dtype]["count"] += 1
            sev = d.get("severity", "medium")
            sev_value = severity_map.get(str(sev).lower(), 5) if isinstance(sev, str) else float(sev) if sev else 5
            damage_types[dtype]["severities"].append(sev_value)
        
        for dtype, info in damage_types.items():
            avg_severity = sum(info["severities"]) / len(info["severities"]) if info["severities"] else 0
            pdf.add_bullet_point(f"{dtype}: {info['count']} instance(s) detected, average severity {avg_severity:.1f}/10")
    else:
        pdf.add_paragraph("No significant damage was detected in the analyzed images.")
    
    pdf.add_spacer(20)
    
    # Cost Estimation
    pdf.add_section_title("Cost Estimation Breakdown")
    pdf.add_paragraph(f"Total estimated repair cost: ${cost_data.get('total_cost', 0):,.2f} {cost_data.get('currency', 'USD')}")
    pdf.add_spacer(15)
    
    items = cost_data.get("items", [])
    if items:
        # Table header
        widths = [150, 80, 100, 100]
        pdf.add_table_row(["Damage Type", "Count", "Quantity", "Cost"], widths, is_header=True, bg_color=(0.18, 0.55, 0.34))
        
        for i, item in enumerate(items):
            bg = (0.97, 0.97, 0.97) if i % 2 == 0 else None
            pdf.add_table_row([
                item.get("type", "Unknown"),
                str(item.get("count", 0)),
                f"{item.get('total_quantity', 0)} {item.get('unit', 'units')}",
                f"${item.get('cost', 0):,.2f}"
            ], widths, bg_color=bg)
    
    pdf.add_spacer(20)
    
    # Risk Assessment
    if risk_data:
        pdf.add_section_title("Risk Assessment")
        pdf.add_key_value("Overall Risk Score", f"{risk_data.get('overall_risk_score', 'N/A')} out of 100")
        pdf.add_key_value("Severity Index", f"{risk_data.get('overall_severity_index', 'N/A')} out of 10")
        pdf.add_key_value("Building Health Grade", risk_data.get("building_health_grade", "N/A"))
        pdf.add_spacer(15)
        
        by_type = risk_data.get("by_type") or {}
        if by_type:
            pdf.add_paragraph("Risk contribution by damage type:")
            pdf.add_spacer(5)
            for damage_type, stats in by_type.items():
                pdf.add_bullet_point(
                    f"{damage_type}: {stats.get('count', 0)} findings contributing {stats.get('risk_points', 0)} risk points",
                    indent=10
                )
    
    pdf.add_spacer(30)
    
    # Recommendations
    pdf.add_section_title("Recommendations")
    if risk_data and risk_data.get("building_health_grade") in ["C", "D"]:
        pdf.add_bullet_point("Immediate attention recommended for critical damage areas")
        pdf.add_bullet_point("Schedule professional structural assessment within 30 days")
        pdf.add_bullet_point("Prioritize repairs based on severity index ratings")
    elif risk_data and risk_data.get("building_health_grade") == "B":
        pdf.add_bullet_point("Monitor identified damage areas for progression")
        pdf.add_bullet_point("Schedule preventive maintenance within 90 days")
        pdf.add_bullet_point("Consider waterproofing treatments for affected areas")
    else:
        pdf.add_bullet_point("Continue regular maintenance schedule")
        pdf.add_bullet_point("Re-assess facade condition annually")
        pdf.add_bullet_point("Document any new damage for future reference")
    
    pdf.add_spacer(40)
    
    # Footer
    pdf.add_footer("Facade Risk Analyzer - AI-Powered Building Assessment")
    
    pdf.build(report_path)
    return report_path
