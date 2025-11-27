from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from backend.core.config import UPLOADS_DIR, ensure_data_directories

META_FILENAME = "job_meta.json"


def _job_upload_dir(job_id: str) -> Path:
    return UPLOADS_DIR / job_id


def get_metadata_path(job_id: str) -> Path:
    return _job_upload_dir(job_id) / META_FILENAME


def job_exists(job_id: str) -> bool:
    return _job_upload_dir(job_id).exists()


def load_metadata(job_id: str) -> Dict[str, Any]:
    meta_path = get_metadata_path(job_id)
    if not meta_path.exists():
        raise FileNotFoundError(f"Metadata for job {job_id} not found")
    with meta_path.open("r", encoding="utf-8") as fp:
        return json.load(fp)


def save_metadata(job_id: str, metadata: Dict[str, Any]) -> None:
    ensure_data_directories()
    meta_path = get_metadata_path(job_id)
    meta_path.parent.mkdir(parents=True, exist_ok=True)
    with meta_path.open("w", encoding="utf-8") as fp:
        json.dump(metadata, fp, indent=2)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_job_metadata(job_id: str, filenames: List[str]) -> Dict[str, Any]:
    metadata = {
        "job_id": job_id,
        "status": "uploaded",
        "uploaded_files": filenames,
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
        "outputs": {},
        "error": None,
    }
    save_metadata(job_id, metadata)
    return metadata


def update_status(job_id: str, status: str, *, error: Optional[str] = None, **fields: Any) -> Dict[str, Any]:
    metadata = load_metadata(job_id)
    metadata["status"] = status
    metadata["updated_at"] = _now_iso()
    if error:
        metadata["error"] = error
    elif "error" in metadata:
        metadata["error"] = None
    if fields:
        metadata.setdefault("outputs", {})
        for key, value in fields.items():
            metadata[key] = value
    save_metadata(job_id, metadata)
    return metadata


def update_outputs(job_id: str, **outputs: Any) -> Dict[str, Any]:
    metadata = load_metadata(job_id)
    metadata.setdefault("outputs", {})
    metadata["outputs"].update(outputs)
    metadata["updated_at"] = _now_iso()
    save_metadata(job_id, metadata)
    return metadata
