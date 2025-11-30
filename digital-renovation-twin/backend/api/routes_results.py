from __future__ import annotations

import json
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from ..core.config import PIPELINE_VERSION, REPORTS_DIR
from ..database import (
    delete_all_job_records,
    delete_job_record,
    list_job_records,
    update_job_record,
)
from ..services import job_metadata
from ..services.analyzers import get_damage_analyzer
from ..services.cost_estimation import generate_cost_estimate
from ..services.image_validation import ImageValidationError, validate_job_images
from ..services.pdf_generator import generate_pdf_report
from ..services.reconstruction_service import submit_reconstruction_job
from ..services.risk_scoring import compute_risk_summary

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/jobs")
def list_jobs():
    """
    List all jobs with their status and metrics.
    
    Returns jobs from both file-based metadata and database,
    preferring database records when available.
    """
    # Try database first for richer data
    try:
        db_jobs = list_job_records()
        if db_jobs:
            # Enrich with file-based data for uploaded_files
            for job in db_jobs:
                try:
                    meta = job_metadata.load_metadata(job["job_id"])
                    job["uploaded_files"] = meta.get("uploaded_files", [])
                except FileNotFoundError:
                    job["uploaded_files"] = []
            return db_jobs
    except Exception as exc:
        logger.warning("Database unavailable, falling back to file metadata: %s", exc)
    
    # Fall back to file-based metadata
    jobs = job_metadata.list_jobs()
    response = []
    for meta in jobs:
        outputs = meta.get("outputs", {}) or {}
        cost_path = outputs.get("cost")
        estimated_cost = None
        if cost_path:
            try:
                cost_file = Path(cost_path)
                if cost_file.exists():
                    with cost_file.open("r", encoding="utf-8") as fp:
                        estimated_cost = json.load(fp).get("total_cost")
            except (json.JSONDecodeError, OSError):
                estimated_cost = None
        response.append(
            {
                "job_id": meta.get("job_id"),
                "label": meta.get("label"),
                "created_at": meta.get("created_at"),
                "status": meta.get("status"),
                "building_health_grade": meta.get("building_health_grade"),
                "overall_risk_score": meta.get("overall_risk_score"),
                "total_estimated_cost": estimated_cost,
                "uploaded_files": meta.get("uploaded_files", []),
                "pipeline_version": meta.get("pipeline_version", PIPELINE_VERSION),
            }
        )
    return response


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
    """
    Process a job through the full analysis pipeline.
    
    Pipeline steps:
    1. Image validation
    2. Reconstruction (mock by default)
    3. AI damage detection (mock/openai/replay based on DAMAGE_ANALYZER)
    4. Cost estimation
    5. Risk scoring
    6. PDF report generation
    """
    if not job_metadata.job_exists(job_id):
        raise HTTPException(status_code=404, detail="Job not found")

    logger.info("Starting processing for job %s", job_id)

    try:
        results = validate_job_images(job_id)
        if any(entry["status"] != "ok" for entry in results):
            raise ImageValidationError("One or more uploaded images failed validation.")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Job images not found")
    except ImageValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # Update status to processing
    job_metadata.update_status(job_id, "processing", pipeline_version=PIPELINE_VERSION)
    try:
        update_job_record(job_id, status="processing")
    except Exception as exc:
        logger.warning("Failed to update DB status for job %s: %s", job_id, exc)

    try:
        # Step 1: Reconstruction (mock by default)
        reconstruction_data = submit_reconstruction_job(job_id)
        job_metadata.update_status(
            job_id,
            "processing",
            reconstruction_engine=reconstruction_data.get("engine"),
            mesh_workspace_path=reconstruction_data.get("mesh_workspace_path"),
            reconstruction_error=reconstruction_data.get("error"),
        )
        mesh_reference = (
            reconstruction_data.get("asset_local_path")
            or reconstruction_data.get("asset_url")
            or reconstruction_data.get("viewer_url")
            or reconstruction_data.get("mesh_workspace_path")
        )
        
        # Step 2: Damage detection using configured analyzer
        analyzer = get_damage_analyzer()
        logger.info("Using damage analyzer: %s", type(analyzer).__name__)
        damages_path = analyzer.analyze(job_id)
        
        # Step 3: Cost estimation
        cost_path = generate_cost_estimate(job_id)
        
        # Load cost for database update
        total_cost = None
        try:
            with open(cost_path, "r", encoding="utf-8") as f:
                cost_data = json.load(f)
                total_cost = cost_data.get("total_cost")
        except Exception:
            pass
        
        # Step 4: Risk scoring
        risk_path = None
        risk_data = None
        try:
            risk_path = compute_risk_summary(job_id)
            with open(risk_path, "r", encoding="utf-8") as risk_file:
                risk_data = json.load(risk_file)
        except Exception as risk_exc:
            logger.warning("Risk scoring failed for job %s: %s", job_id, risk_exc)
            risk_path = None
            risk_data = None

        # Step 5: PDF report generation
        report_path = generate_pdf_report(job_id)
        
        # Update file-based metadata with outputs
        job_metadata.update_outputs(
            job_id,
            mesh=str(mesh_reference) if mesh_reference else None,
            damages=str(damages_path),
            cost=str(cost_path),
            risk=str(risk_path) if risk_path else None,
            report=str(report_path),
            viewer_url=reconstruction_data.get("viewer_url"),
            reconstruction_job=reconstruction_data.get("job_reference"),
            reconstruction_engine=reconstruction_data.get("engine"),
            reconstruction_workspace=reconstruction_data.get("mesh_workspace_path"),
            asset_url=reconstruction_data.get("asset_url"),
            asset_local_path=reconstruction_data.get("asset_local_path"),
            reconstruction_error=reconstruction_data.get("error"),
        )
        
        # Update file-based metadata with final status
        status_kwargs = {"pipeline_version": PIPELINE_VERSION}
        if risk_data:
            status_kwargs.update(
                {
                    "overall_risk_score": risk_data.get("overall_risk_score"),
                    "overall_severity_index": risk_data.get("overall_severity_index"),
                    "building_health_grade": risk_data.get("building_health_grade"),
                }
            )
        metadata = job_metadata.update_status(job_id, "completed", **status_kwargs)
        
        # Update database record
        try:
            update_job_record(
                job_id,
                status="completed",
                building_health_grade=risk_data.get("building_health_grade") if risk_data else None,
                overall_risk_score=risk_data.get("overall_risk_score") if risk_data else None,
                overall_severity_index=risk_data.get("overall_severity_index") if risk_data else None,
                total_estimated_cost=total_cost,
            )
        except Exception as exc:
            logger.warning("Failed to update DB record for job %s: %s", job_id, exc)
        
        logger.info("Successfully completed processing for job %s", job_id)
        
    except Exception as exc:
        error_msg = str(exc)
        job_metadata.update_status(job_id, "failed", error=error_msg)
        try:
            update_job_record(job_id, status="failed", error=error_msg)
        except Exception:
            pass
        logger.error("Processing failed for job %s: %s", job_id, exc)
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


@router.post("/jobs/{job_id}/verify-images")
def verify_images(job_id: str):
    if not job_metadata.job_exists(job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    try:
        results = validate_job_images(job_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Job images not found")
    except ImageValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"job_id": job_id, "results": results}


@router.patch("/jobs/{job_id}")
def rename_job(job_id: str, label: str):
    """Rename a job by updating its label."""
    if not job_metadata.job_exists(job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    try:
        metadata = job_metadata.rename_job(job_id, label)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Job metadata not found")
    return metadata


@router.delete("/jobs/{job_id}")
def delete_job(job_id: str):
    """Delete a job and all its associated files."""
    if not job_metadata.job_exists(job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Delete from file system
    success = job_metadata.delete_job(job_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete job")
    
    # Delete from database
    try:
        delete_job_record(job_id)
    except Exception as exc:
        logger.warning("Failed to delete DB record for job %s: %s", job_id, exc)
    
    logger.info("Deleted job %s", job_id)
    return {"message": "Job deleted successfully", "job_id": job_id}


@router.delete("/jobs")
def delete_all_jobs():
    """Delete all jobs from both file system and database."""
    # Delete from file system
    count = job_metadata.delete_all_jobs()
    
    # Delete from database
    try:
        delete_all_job_records()
    except Exception as exc:
        logger.warning("Failed to delete all DB records: %s", exc)
    
    logger.info("Deleted %d jobs", count)
    return {"message": f"Deleted {count} job(s)", "deleted_count": count}
