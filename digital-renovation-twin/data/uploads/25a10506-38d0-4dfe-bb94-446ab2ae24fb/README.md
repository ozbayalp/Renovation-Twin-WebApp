# Digital Renovation Twin MVP

## Overview
This MVP webapp allows users to upload building photos, reconstructs a 3D model using COLMAP, detects damages with AI vision, visualizes damages on the model, estimates renovation costs, and generates a PDF report.

## Folder Structure

```
digital-renovation-twin/
├── frontend/                      # Next.js app
│   ├── app/                       # (App Router) pages & routes
│   │   ├── upload/                # /upload page
│   │   ├── results/               # /results/[jobId] page
│   │   └── layout.tsx
│   ├── components/
│   │   ├── UploadForm.tsx
│   │   ├── DamageList.tsx
│   │   ├── CostBreakdown.tsx
│   │   └── ThreeDViewer.tsx
│   ├── lib/
│   │   └── api.ts
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                       # FastAPI backend
│   ├── main.py
│   ├── api/
│   │   ├── routes_upload.py
│   │   ├── routes_results.py
│   │   └── routes_report.py
│   ├── services/
│   │   ├── colmap_pipeline.py
│   │   ├── ai_damage_detection.py
│   │   ├── cost_estimation.py
│   │   └── pdf_generator.py
│   ├── models/
│   │   ├── job_models.py
│   ├── core/
│   │   ├── config.py
│   │   └── logging_config.py
│   ├── requirements.txt
│   └── README.md
│
├── data/                          # Local storage (MVP)
│   ├── uploads/
│   │   └── {job_id}/
│   ├── reconstructions/
│   │   └── {job_id}/
│   ├── reports/
│   │   └── {job_id}.pdf
│   └── tmp/
│
├── scripts/
│   ├── run_colmap_example.sh
│   └── dev_setup.sh
│
├── .env.example
├── docker-compose.yml
└── README.md

## Stack
- **Frontend:** Next.js (React + TypeScript)
- **Backend:** Python + FastAPI
- **3D/AI:** COLMAP pipeline, AI damage detection, PDF generation (all backend)
- **Storage:** Local filesystem under `/data` (uploads, reconstructions, reports)

---
See subfolders for implementation details.
