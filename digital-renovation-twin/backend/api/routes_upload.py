import uuid
from pathlib import Path
from typing import List

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from backend.core.config import UPLOADS_DIR, ensure_data_directories
from backend.services import job_metadata

router = APIRouter()


@router.post("/jobs", status_code=201)
async def create_job(label: str | None = Form(None), files: List[UploadFile] = File(...)):
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

    metadata = job_metadata.create_job_metadata(job_id, saved_filenames, label=label)
    return {"job_id": job_id, "status": metadata["status"], "label": metadata.get("label")}
