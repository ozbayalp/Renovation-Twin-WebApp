# Architecture Overview

## Overview

Façade Risk Analyzer is an AI-powered property condition assessment platform focused on exterior building façades. Users upload façade photos, the backend runs AI damage detection, severity/cost analysis, and risk scoring, and the system produces an “AI Property Condition Assessment Report” as a PDF. A Next.js frontend handles uploads and presents job progress, logs, and final outputs.

## High-Level Flow

1. **Upload:** Frontend `/upload` form posts façade photos to `POST /jobs`.
2. **Storage & Metadata:** Backend saves files under `data/uploads/{job_id}` and writes `job_meta.json`.
3. **Processing:** User triggers `POST /jobs/{job_id}/process`, which:
   1. Validates image files.
   2. Runs the configurable reconstruction engine (mock/external API/COLMAP) to produce optional mesh/workspace artifacts.
   3. Executes `run_damage_detection(job_id)` (OpenAI Vision) to produce `damages.json`.
   4. Runs `generate_cost_estimate(job_id)` → `cost_estimate.json`.
   5. Runs `compute_risk_summary(job_id)` → `risk_summary.json`.
   6. Calls `generate_pdf_report(job_id)` → `data/reports/{job_id}.pdf`.
4. **Outputs:** All derived JSON artifacts live under `data/reconstructions/{job_id}`; PDFs under `data/reports/`.
5. **Status & Dashboard:** `GET /jobs/{job_id}` returns status, metadata, and paths. The frontend `/results/[job_id]` polls this endpoint to show uploads, logs, risk/health summary, download links, and the PDF report.

## Backend Architecture

- **Framework:** FastAPI
- **Routers & Services:**
  - `backend/api/routes_upload.py` – `POST /jobs` for uploads.
  - `backend/api/routes_results.py` – `GET /jobs/{job_id}`, `POST /jobs/{job_id}/process`, `GET /jobs/{job_id}/report.pdf`, image verification.
  - `backend/services/reconstruction_service.py` – pluggable reconstruction engine (`mock`, `external_api`, `colmap_docker`). Defaults to `mock` for dev, but can call Polycam-like APIs or Dockerized COLMAP for real 3D context.
  - `backend/services/ai_damage_detection.py` – OpenAI Vision integration for façade damage classification.
  - `backend/services/cost_estimation.py` – rule-based cost calculation.
  - `backend/services/risk_scoring.py` – aggregates damages into severity/risk metrics and health grades.
  - `backend/services/pdf_generator.py` – generates the PDF report with damage, cost, and risk summaries.
  - `backend/services/job_metadata.py` – stores job status, outputs, and summary fields in `job_meta.json`.

## Frontend Architecture

- **Framework:** Next.js (App Router, TypeScript)
- **Key Pages:**
  - `/upload` – multi-file upload form that posts to `POST /jobs` and redirects to `/results/{job_id}`.
  - `/results/[job_id]` – polls job status, displays uploaded files, links to damages/cost/risk JSONs and the PDF, shows logs, and renders a “Risk & Building Health” panel with `building_health_grade`, `overall_risk_score`, `overall_severity_index`, and per-type risk breakdown. Also shows reconstruction engine info and viewer link, if available.

## Data Layout

```
data/
  uploads/{job_id}/          # Raw uploaded images
  reconstructions/{job_id}/  # damages.json, cost_estimate.json, risk_summary.json, reconstruction outputs
  reports/{job_id}.pdf       # Final PDF report
```

All job artifacts live under `data/`, making it easy to inspect and archive per-job results.

## Reconstruction Engines (Optional)

- The system operates fully with `RECONSTRUCTION_ENGINE=mock` (default) to avoid complex dependencies.
- `reconstruction_service.submit_reconstruction_job(job_id)` abstracts the engine:
  - **mock** – placeholder mesh/workspace.
  - **external_api** – pushes images to a photogrammetry provider (e.g., Polycam/Luma) when credentials are configured.
  - **colmap_docker** – runs COLMAP inside Docker (suited for Linux/NVIDIA or properly configured CPU environments).
- On Apple Silicon, mock mode is recommended for local dev; other engines can be enabled via `RECONSTRUCTION_ENGINE` when infrastructure allows.
