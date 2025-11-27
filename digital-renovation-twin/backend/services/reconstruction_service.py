from __future__ import annotations

import json
import logging
import mimetypes
import os
import subprocess
from io import BytesIO
from pathlib import Path
from typing import Dict, List, Optional

from backend.core.config import DATA_DIR, RECONSTRUCTIONS_DIR, UPLOADS_DIR

try:
    import requests
except ImportError:  # pragma: no cover - runtime dependency
    requests = None  # type: ignore

PHOTOGRAMMETRY_API_URL = os.getenv("PHOTOGRAMMETRY_API_URL")
PHOTOGRAMMETRY_API_KEY = os.getenv("PHOTOGRAMMETRY_API_KEY")
PHOTOGRAMMETRY_PROVIDER = os.getenv("PHOTOGRAMMETRY_PROVIDER", "polycam")
# Force mock engine locally to avoid accidental COLMAP/external invocations.
RECONSTRUCTION_ENGINE = "mock"

META_FILENAME = "reconstruction_meta.json"

logger = logging.getLogger(__name__)


class PhotogrammetryAPIError(RuntimeError):
    """Raised when the hosted reconstruction API fails."""


class ReconstructionError(RuntimeError):
    """Raised when the reconstruction engine fails."""


def _collect_images(job_id: str) -> List[Path]:
    upload_dir = UPLOADS_DIR / job_id
    if not upload_dir.exists():
        raise FileNotFoundError(f"No uploads found for job {job_id}")
    images = sorted(p for p in upload_dir.iterdir() if p.is_file())
    if not images:
        raise FileNotFoundError(f"No images to process for job {job_id}")
    return images


def _placeholder_mesh(output_dir: Path) -> Path:
    mesh_path = output_dir / "placeholder_mesh.obj"
    if not mesh_path.exists():
        mesh_path.write_text(
            "# Placeholder mesh\n"
            "v 0.0 0.0 0.0\n"
            "v 1.0 0.0 0.0\n"
            "v 0.0 1.0 0.0\n"
            "f 1 2 3\n",
            encoding="utf-8",
        )
    return mesh_path


def _save_metadata(job_id: str, metadata: Dict) -> Path:
    output_dir = RECONSTRUCTIONS_DIR / job_id
    output_dir.mkdir(parents=True, exist_ok=True)
    meta_path = output_dir / META_FILENAME
    with meta_path.open("w", encoding="utf-8") as fp:
        json.dump(metadata, fp, indent=2)
    return meta_path


def _call_external_api(job_id: str, images: List[Path]) -> Dict[str, Optional[str]]:
    if not PHOTOGRAMMETRY_API_URL or not PHOTOGRAMMETRY_API_KEY:
        raise PhotogrammetryAPIError(
            "Photogrammetry API credentials not configured. "
            "Set PHOTOGRAMMETRY_API_URL and PHOTOGRAMMETRY_API_KEY."
        )
    if requests is None:
        raise PhotogrammetryAPIError("The 'requests' package is required. Install it in the backend environment.")

    files = []
    for image in images:
        mime, _ = mimetypes.guess_type(image.name)
        buffer = BytesIO(image.read_bytes())
        files.append(("files", (image.name, buffer, mime or "application/octet-stream")))

    headers = {"Authorization": f"Bearer {PHOTOGRAMMETRY_API_KEY}"}
    data = {"job_id": job_id, "provider": PHOTOGRAMMETRY_PROVIDER}
    url = PHOTOGRAMMETRY_API_URL.rstrip("/") + "/reconstructions"

    response = requests.post(url, headers=headers, data=data, files=files, timeout=300)
    try:
        response.raise_for_status()
    except requests.HTTPError as exc:  # type: ignore[attr-defined]
        raise PhotogrammetryAPIError(f"Photogrammetry API rejected the request: {exc}") from exc

    payload = response.json()
    return {
        "engine": "external_api",
        "provider": PHOTOGRAMMETRY_PROVIDER,
        "viewer_url": payload.get("viewer_url") or payload.get("viewerUrl"),
        "asset_url": payload.get("asset_url") or payload.get("assetUrl"),
        "job_reference": payload.get("id") or payload.get("job_id"),
        "raw_response": payload,
        "mesh_workspace_path": str(RECONSTRUCTIONS_DIR / job_id),
    }


def _mock_metadata(job_id: str, reason: Optional[str] = None) -> Dict[str, Optional[str]]:
    output_dir = RECONSTRUCTIONS_DIR / job_id
    output_dir.mkdir(parents=True, exist_ok=True)
    placeholder_mesh = _placeholder_mesh(output_dir)
    metadata: Dict[str, Optional[str]] = {
        "engine": "mock",
        "provider": PHOTOGRAMMETRY_PROVIDER,
        "viewer_url": None,
        "asset_url": None,
        "asset_local_path": str(placeholder_mesh),
        "job_reference": None,
        "mesh_workspace_path": str(output_dir),
        "error": reason,
    }
    return metadata


def run_colmap_reconstruction_in_docker(job_id: str) -> Dict[str, Optional[str]]:
    """Run COLMAP sparse reconstruction (CPU only) inside the official Docker image."""
    _collect_images(job_id)
    output_dir = RECONSTRUCTIONS_DIR / job_id
    output_dir.mkdir(parents=True, exist_ok=True)

    data_dir = DATA_DIR.resolve()
    image_path = f"/data/uploads/{job_id}"
    workspace_path = f"/data/reconstructions/{job_id}"
    database_path = f"/data/reconstructions/{job_id}/database.db"
    sparse_path = f"/data/reconstructions/{job_id}/sparse"

    docker_base = [
        "docker", "run", "--rm", "-v", f"{data_dir}:/data", "graffitytech/colmap:3.8-cpu-ubuntu22.04"
    ]
    commands = [
        docker_base + [
            "colmap", "feature_extractor",
            "--database_path", database_path,
            "--image_path", image_path,
        ],
        docker_base + [
            "colmap", "exhaustive_matcher",
            "--database_path", database_path,
        ],
        docker_base + [
            "colmap", "mapper",
            "--database_path", database_path,
            "--image_path", image_path,
            "--output_path", sparse_path
        ]
    ]

    logs = []
    log_path = output_dir / "colmap_docker.log"
    with log_path.open("w", encoding="utf-8") as log_file:
        for cmd in commands:
            logger.info("Running COLMAP Docker command: %s", " ".join(cmd))
            log_file.write(f"$ {' '.join(cmd)}\n")
            try:
                process = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    check=True,
                )
                logs.append({"cmd": " ".join(cmd), "stdout": process.stdout, "stderr": process.stderr})
                log_file.write(f"--- STDOUT ---\n{process.stdout}\n")
                log_file.write(f"--- STDERR ---\n{process.stderr}\n")
            except FileNotFoundError as exc:
                log_file.write(f"[ERROR] Docker not found: {exc}\n")
                raise ReconstructionError("Docker executable not found. Please install Docker Desktop.") from exc
            except subprocess.CalledProcessError as exc:
                stderr = exc.stderr or exc.stdout or "Unknown COLMAP error."
                log_file.write(f"[ERROR] COLMAP Docker failed: {stderr}\n")
                logger.error("COLMAP Docker failed for job %s: %s", job_id, stderr.strip())
                raise ReconstructionError(f"COLMAP reconstruction failed: {stderr}") from exc

    metadata: Dict[str, Optional[str]] = {
        "engine": "colmap_docker",
        "provider": "colmap",
        "viewer_url": None,
        "asset_url": None,
        "asset_local_path": None,
        "mesh_workspace_path": str(output_dir / "sparse"),
        "job_reference": None,
        "docker_logs": logs,
        "docker_log_file": str(log_path),
    }
    return metadata


def submit_reconstruction_job(job_id: str) -> Dict[str, Optional[str]]:
    """
    Run the (forced) mock reconstruction engine and persist the metadata.
    """
    output_dir = RECONSTRUCTIONS_DIR / job_id
    output_dir.mkdir(parents=True, exist_ok=True)

    metadata = _mock_metadata(job_id, reason="Mock engine forced for local development.")
    metadata["engine"] = "mock"
    metadata["provider"] = "mock"
    metadata["mesh_workspace_path"] = metadata.get("mesh_workspace_path") or str(output_dir)

    _save_metadata(job_id, metadata)
    return metadata
