from __future__ import annotations

import imghdr
from pathlib import Path
from typing import Dict, List

from backend.core.config import UPLOADS_DIR


class ImageValidationError(RuntimeError):
    """Raised when uploaded images fail validation."""


def validate_job_images(job_id: str) -> List[Dict[str, str]]:
    job_dir = UPLOADS_DIR / job_id
    if not job_dir.exists():
        raise FileNotFoundError(f"Job {job_id} not found.")

    results: List[Dict[str, str]] = []
    for path in sorted(job_dir.iterdir()):
        if not path.is_file():
            continue
        if path.name.endswith(".json"):
            continue
        entry: Dict[str, str] = {"filename": path.name, "status": "ok"}
        try:
            with path.open("rb") as file_handle:
                header = file_handle.read(1024)
                if not header:
                    raise ImageValidationError("File is empty.")
                image_type = imghdr.what(None, header)
                if not image_type:
                    raise ImageValidationError("Unrecognized image format.")
                entry["image_type"] = image_type
        except Exception as exc:
            entry["status"] = "error"
            entry["error"] = str(exc)
        results.append(entry)

    if not results:
        raise ImageValidationError(f"No image files found for job {job_id}.")

    return results
