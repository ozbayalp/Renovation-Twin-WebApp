from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from ..core.config import REPORTS_DIR
from ..services import job_metadata
from ..services.ai_damage_detection import run_damage_detection
from ..services.colmap_pipeline import run_colmap_reconstruction
from ..services.cost_estimation import generate_cost_estimate
from ..services.pdf_generator import generate_pdf_report

router = APIRouter()


@router.get("/jobs/{job_id}")
def get_job(job_id: str):
    if not job_metadata.job_exists(job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    try:
        metadata = job_metadata.load_metadata(job_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Job metadata missing")
    return metadata


@router.post("/jobs/{job_id}/process")
def process_job(job_id: str):
    if not job_metadata.job_exists(job_id):
        raise HTTPException(status_code=404, detail="Job not found")

    job_metadata.update_status(job_id, "processing")
    try:
        mesh_path = run_colmap_reconstruction(job_id)
        damages_path = run_damage_detection(job_id)
        cost_path = generate_cost_estimate(job_id)
        report_path = generate_pdf_report(job_id)
        job_metadata.update_outputs(
            job_id,
            mesh=str(mesh_path),
            damages=str(damages_path),
            cost=str(cost_path),
            report=str(report_path),
        )
        metadata = job_metadata.update_status(job_id, "completed")
    except Exception as exc:
        job_metadata.update_status(job_id, "failed", error=str(exc))
        raise HTTPException(status_code=500, detail=f"Job processing failed: {exc}") from exc

    return metadata


@router.get("/jobs/{job_id}/report.pdf")
def download_report(job_id: str):
    try:
        metadata = job_metadata.load_metadata(job_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Job not found")

    report_path_str = metadata.get("outputs", {}).get("report")
    report_path = Path(report_path_str) if report_path_str else REPORTS_DIR / f"{job_id}.pdf"

    if not report_path.exists():
        raise HTTPException(status_code=404, detail="Report not ready")

    return FileResponse(
        path=report_path,
        media_type="application/pdf",
        filename=f"{job_id}.pdf",
    )
