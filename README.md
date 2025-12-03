# Façade Risk Analyzer

<p align="center">
  <strong>AI-Powered Building Facade Assessment Platform</strong>
</p>

<p align="center">
  Upload photos of building exteriors • Detect structural damage with GPT-4o Vision • Get risk scores & health grades • Generate professional PDF reports
</p>

---

## Overview

Façade Risk Analyzer is a full-stack web application that leverages OpenAI's Vision API (GPT-4o-mini) to analyze building facade images for structural damage. The system automatically detects defects, calculates risk scores, estimates repair costs, and generates comprehensive PDF reports.

> **Note:** This application is publicly available. Without an API key, it runs in demo mode with mock data. To use real AI analysis, enter your own OpenAI API key in Settings. Your key is stored locally in your browser and never saved on our servers.

### Key Features

| Feature | Description |
|---------|-------------|
| **AI Damage Detection** | Identifies cracks, spalling, water damage, discoloration, corrosion, and other facade defects |
| **Risk Scoring** | Calculates overall risk score (0-100), severity index (0-10), and building health grade (A-D) |
| **Cost Estimation** | Itemized repair cost breakdown based on damage type and affected area |
| **PDF Reports** | Professional multi-page reports with executive summary, metrics, and recommendations |
| **Dashboard** | Manage all assessments with rename, delete, and bulk clear functionality |
| **Dark Mode** | Full dark/light theme support throughout the application |

---

## Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **AI Integration:** OpenAI GPT-4o-mini Vision API
- **PDF Generation:** Custom PDF builder with multi-page support
- **Storage:** Local filesystem (`data/uploads/`, `data/reconstructions/`, `data/reports/`)

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router DOM

---

## Project Structure

```
digital-renovation-twin/
├── backend/
│   ├── api/
│   │   ├── routes_upload.py      # POST /jobs - Image upload
│   │   └── routes_results.py     # Job management & processing
│   ├── services/
│   │   ├── ai_damage_detection.py  # OpenAI Vision integration
│   │   ├── cost_estimation.py      # Repair cost calculator
│   │   ├── risk_scoring.py         # Risk & health grading
│   │   ├── pdf_generator.py        # Professional PDF reports
│   │   └── job_metadata.py         # Job state management
│   ├── core/
│   │   └── config.py             # Configuration & paths
│   └── main.py                   # FastAPI application
├── builder-frontend/
│   └── client/
│       ├── pages/
│       │   ├── Home.tsx          # Landing page with features
│       │   ├── Upload.tsx        # Image upload interface
│       │   ├── Dashboard.tsx     # Assessment management
│       │   ├── Results.tsx       # Analysis results & reports
│       │   └── About.tsx         # About page
│       ├── components/
│       │   ├── Layout.tsx        # App shell with navigation
│       │   ├── Navigation.tsx    # Header navigation
│       │   └── Footer.tsx        # Footer with links
│       └── lib/
│           └── api.ts            # Backend API client
└── data/                         # Generated at runtime
    ├── uploads/                  # Uploaded images
    ├── reconstructions/          # Analysis outputs (JSON)
    └── reports/                  # Generated PDF reports
```

---

## Getting Started

### Prerequisites

- **Python 3.11+** with pip
- **Node.js 20+** with npm
- **OpenAI API Key** (for Vision API access)

### 1. Clone the Repository

```bash
git clone https://github.com/ozbayalp/Renovation-Twin-WebApp.git
cd Renovation-Twin-WebApp/digital-renovation-twin
```

### 2. Backend Setup

```bash
# Create and activate virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn python-multipart openai

# Set environment variables
export OPENAI_API_KEY="your-openai-api-key"
export OPENAI_VISION_MODEL="gpt-4o-mini"  # Optional, defaults to gpt-4o-mini

# Start the backend server
./start_backend.sh
# Or manually: uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
# In a new terminal
cd builder-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:8080`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/jobs` | Upload images and create new job |
| `GET` | `/jobs` | List all jobs |
| `GET` | `/jobs/{job_id}` | Get job status and metadata |
| `POST` | `/jobs/{job_id}/verify-images` | Validate uploaded images |
| `POST` | `/jobs/{job_id}/process` | Start AI analysis |
| `GET` | `/jobs/{job_id}/report.pdf` | Download PDF report |
| `PATCH` | `/jobs/{job_id}` | Rename job (update label) |
| `DELETE` | `/jobs/{job_id}` | Delete job and files |
| `DELETE` | `/jobs` | Delete all jobs |

---

## Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Upload    │────▶│   Verify    │────▶│   Process   │────▶│   Results   │
│   Images    │     │   Images    │     │   (AI)      │     │   & Report  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
            ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
            │   Damage    │           │    Risk     │           │    Cost     │
            │  Detection  │           │   Scoring   │           │  Estimation │
            │  (GPT-4o)   │           │  (A-D Grade)│           │   (USD)     │
            └─────────────┘           └─────────────┘           └─────────────┘
                    │                         │                         │
                    └─────────────────────────┼─────────────────────────┘
                                              │
                                              ▼
                                      ┌─────────────┐
                                      │     PDF     │
                                      │   Report    │
                                      └─────────────┘
```

### Processing Pipeline

1. **Image Upload**: User uploads 1-10 facade images
2. **Validation**: Images are verified for format and integrity
3. **AI Analysis**: Each image is analyzed by GPT-4o Vision for damage detection
4. **Risk Scoring**: Aggregate risk score, severity index, and health grade calculated
5. **Cost Estimation**: Repair costs computed based on damage type and area
6. **PDF Generation**: Professional report with all findings and recommendations

---

## Damage Detection

The AI analyzes images for the following damage types:

| Damage Type | Rate | Unit | Risk Weight |
|-------------|------|------|-------------|
| Crack | $20 | per meter | 3.0 |
| Spalling | $50 | per m² | 4.0 |
| Water Damage | $15 | per m² | 2.5 |
| Discoloration | $4 | per m² | 1.5 |
| Corrosion | $10 | per m² | 4.5 |

### Health Grading Scale

| Grade | Risk Score | Description |
|-------|------------|-------------|
| **A** | 0-19 | Excellent condition, minimal maintenance needed |
| **B** | 20-39 | Good condition, routine maintenance recommended |
| **C** | 40-69 | Fair condition, repairs should be scheduled |
| **D** | 70-100 | Poor condition, immediate attention required |

---

## PDF Report Contents

The generated PDF report includes:

1. **Header** - Dark banner with title and generation date
2. **Executive Summary** - Overview of findings and total cost
3. **Key Metrics** - Health grade, risk score, severity index, files analyzed
4. **Damage Detection Results** - Breakdown by damage type with severity
5. **Cost Estimation Table** - Itemized repair costs
6. **Risk Assessment** - Detailed risk analysis by damage category
7. **Recommendations** - Action items based on health grade
8. **Footer** - Branding and page numbers

---

## Dark Mode

The application supports both light and dark themes. The theme automatically syncs with your system preferences and can be toggled via the UI.

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | No | - | OpenAI API key for Vision API |
| `OPENAI_VISION_MODEL` | No | `gpt-4o-mini` | Vision model to use |
| `DAMAGE_ANALYZER` | No | `mock` | Analyzer mode: `mock`, `openai`, or `replay` |
| `DATABASE_URL` | No | `sqlite:///./data/facade_risk.db` | Database connection URL |
| `RECONSTRUCTION_ENGINE` | No | `mock` | Reconstruction engine (mock/external_api/colmap_docker) |

### Damage Analyzer Modes

The system supports three damage analyzer modes, configurable via `DAMAGE_ANALYZER`:

| Mode | Description |
|------|-------------|
| `mock` | Generates realistic synthetic damage data (default, no API cost) |
| `openai` | Uses OpenAI Vision API for real analysis (requires API key) |
| `replay` | Replays pre-recorded fixtures from `backend/fixtures/damages/` |

### User-Provided API Keys

For public deployments, users can provide their own OpenAI API key:

1. Navigate to **Settings** in the app
2. Enter your OpenAI API key
3. The app automatically uses real AI analysis when a key is provided

**Without an API key**, the app runs in demo mode with mock data.

### Record & Replay System

For testing and demos, you can use the replay analyzer with pre-recorded fixtures:

1. Place fixture files in `backend/fixtures/damages/`
2. Set `DAMAGE_ANALYZER=replay`
3. The analyzer will load `sample_damages.json` or `{job_id}.json`

This allows full pipeline execution with no OpenAI API costs.

---

## Security

### API Key Handling

User-provided API keys are handled with the following security measures:

| Layer | Security Measure |
|-------|------------------|
| **Storage** | Keys stored in browser `sessionStorage` (cleared when tab closes) |
| **Transmission** | Keys sent via HTTPS headers only, never in URLs or request bodies |
| **Backend** | Keys processed in-memory only, never logged or persisted |
| **Logging** | Only boolean flags logged (e.g., "user_api_key=true"), never actual keys |

### User Responsibility

- Users are responsible for the security of their own API keys
- Users should set usage limits in their OpenAI dashboard
- Keys should not be shared or used on untrusted devices

---

## CLI Tool

The backend includes a CLI for running analysis from the command line:

```bash
# Run analysis on a directory of images
python -m backend.cli run-job ./images --label "Demo Building"

# List all jobs
python -m backend.cli list-jobs

# Check job status
python -m backend.cli job-status <job_id>

# Show statistics
python -m backend.cli stats
```

---

## Metrics & Monitoring

The `/metrics` endpoint provides operational statistics:

```json
{
  "status": "ok",
  "pipeline_version": "v1.0.0",
  "damage_analyzer": "mock",
  "jobs_total": 42,
  "jobs_completed": 36,
  "jobs_failed": 3,
  "jobs_processing": 3
}
```

---

## Testing

Run the test suite:

```bash
cd backend
pip install pytest
python -m pytest tests/ -v
```

Tests cover:
- Risk scoring calculations
- Cost estimation logic
- PDF report generation
- Full pipeline integration
- Analyzer factory and modes

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is for educational and demonstration purposes.

---

## Author

**Alp Ozbay**
- GitHub: [@ozbayalp](https://github.com/ozbayalp)
- LinkedIn: [Alp Ozbay](https://www.linkedin.com/in/alp-ozbay-a13208331/)
- Email: ao2680@nyu.edu

---

## Acknowledgments

- [OpenAI](https://openai.com) for the Vision API
- [shadcn/ui](https://ui.shadcn.com) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com) for the styling framework
- [FastAPI](https://fastapi.tiangolo.com) for the backend framework
