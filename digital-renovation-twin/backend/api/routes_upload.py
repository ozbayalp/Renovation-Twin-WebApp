import logging
import uuid
from pathlib import Path
from typing import List

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from backend.core.config import UPLOADS_DIR, ensure_data_directories
from backend.database import create_job_record
from backend.services import job_metadata

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/jobs", status_code=201)
async def create_job(label: str | None = Form(None), files: List[UploadFile] = File(...)):
    """
    Create a new job by uploading facade images.
    
    - Saves images to data/uploads/{job_id}/
    - Creates job metadata file
    - Creates database record for dashboard
    """
    if not files:
        raise HTTPException(status_code=400, detail="At least one image must be provided")

    ensure_data_directories()
    job_id = str(uuid.uuid4())
    job_dir = UPLOADS_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    saved_filenames = []
    for upload in files:
        filename = Path(upload.filename).name
        file_path = job_dir / filename
        content = await upload.read()
        with file_path.open("wb") as f:
            f.write(content)
        saved_filenames.append(filename)

    # Create file-based metadata
    metadata = job_metadata.create_job_metadata(job_id, saved_filenames, label=label)
    
    # Create database record
    try:
        create_job_record(job_id, label=label, file_count=len(saved_filenames))
    except Exception as exc:
        logger.warning("Failed to create DB record for job %s: %s", job_id, exc)
    
    logger.info("Created job %s with %d files", job_id, len(saved_filenames))
    
    return {"job_id": job_id, "status": metadata["status"], "label": metadata.get("label")}
