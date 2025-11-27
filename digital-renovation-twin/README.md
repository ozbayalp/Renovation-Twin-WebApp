# Façade Risk Analyzer

AI-powered property condition assessment platform for building façades. Upload photos of an exterior, let the system detect visible defects, compute severity and risk scores, estimate renovation costs, and automatically generate a professional PDF report.

## What It Does

- Multi-photo upload for exterior façades
- AI damage detection (cracks, moisture streaks, spalling, discoloration, missing plaster, etc.)
- Severity, risk, and health scoring (coming online in subsequent steps)
- Rule-based renovation cost estimation
- Auto-generated PDF summary with findings and costs

## Tech Stack

- **Backend:** FastAPI (Python) with modular services for uploads, AI analysis, cost estimation, PDF generation, and pluggable reconstruction engines
- **Frontend:** Next.js (App Router) TypeScript UI for uploads, job tracking, logs, and report downloads
- **AI:** OpenAI Vision model for damage detection; rule-based cost model for estimates
- **Storage:** Local filesystem under `data/` for uploads, derived artifacts, and generated reports

## Workflow Overview

1. User uploads façade images via the Next.js frontend (`/upload`).
2. FastAPI saves them to `data/uploads/{job_id}` and tracks metadata in `job_meta.json`.
3. When `/jobs/{job_id}/process` is called, the backend:
   - (Optionally) runs a reconstruction engine (mock/external/COLMAP) for 3D context.
   - Runs AI damage detection over the original photos.
   - Computes severity/risk/cost metrics (risk & health grading coming soon).
   - Generates a PDF report at `data/reports/{job_id}.pdf`.
4. The frontend polls `/jobs/{job_id}`, displays status/logs, and links to artifacts (damage JSON, cost estimate, report, hosted viewer if available).

## Reconstruction Engine (Optional)

The system keeps a pluggable reconstruction engine accessed via the `RECONSTRUCTION_ENGINE` environment variable:

- `mock` (default) – provides a placeholder mesh reference so local dev doesn’t require COLMAP or paid APIs.
- `external_api` – packages images and calls a photogrammetry API (e.g., Polycam/Luma) when credentials are configured.
- `colmap_docker` – runs COLMAP inside Docker for teams with proper Linux/NVIDIA/CPU resources.

On Apple Silicon laptops we recommend sticking to `mock` for day-to-day development, since Docker + COLMAP + CUDA/Qt dependencies can be fragile. When optional 3D context is needed (e.g., in CI or specialized workstations), set `RECONSTRUCTION_ENGINE` accordingly and ensure Docker/access credentials are available.

## Running Locally

### Prerequisites

- Python 3.11+
- Node.js 18+ (or the version supported by your Next.js install)
- pip (or poetry) for backend dependencies
- npm (or yarn/pnpm) for frontend dependencies
- Docker (optional) only if you plan to experiment with `RECONSTRUCTION_ENGINE=colmap_docker` or external photogrammetry.

### Backend (mock engine by default)

```bash
cd digital-renovation-twin/backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt

export OPENAI_API_KEY=<your OpenAI key>     # required for damage detection
export RECONSTRUCTION_ENGINE=mock           # default; can switch to external_api or colmap_docker later
uvicorn main:app --reload
```

Mock mode runs AI damage detection, risk scoring, and PDF generation without needing COLMAP or an external photogrammetry provider. When you’re ready to test other engines, set `RECONSTRUCTION_ENGINE` and any required env vars (`PHOTOGRAMMETRY_API_URL`, `PHOTOGRAMMETRY_API_KEY`) before launching the backend.

### Frontend

```bash
cd digital-renovation-twin/frontend
npm install
npm run dev
```

The Next.js app expects the backend at `http://127.0.0.1:8000` (configurable via `NEXT_PUBLIC_BACKEND_URL`).

### Quick Demo Flow

1. Start the backend (`uvicorn main:app --reload`) with `RECONSTRUCTION_ENGINE=mock`.
2. Start the frontend (`npm run dev` → http://localhost:3000).
3. Visit `/upload`, select 3–5 façade photos, and submit.
4. You’ll be redirected to `/results/{job_id}`; wait for processing to complete. The page will show:
   - Uploaded files
   - Damage & cost download links
   - “Risk & Building Health” summary (grade, risk score, severity index, per-type breakdown)
   - PDF download button
5. Download and review the “AI Property Condition Assessment Report”.

That’s enough to demo the full AI analysis without any 3D reconstruction dependencies.

## Roadmap (Pivot Focus)

- Expand severity/risk scoring (damage severity index, risk score, building health grade).
- Enrich PDF output with risk narratives and recommended actions.
- Optional: integrate hosted viewer links when external reconstruction is available.
- Add historical job comparisons and trend reporting.
