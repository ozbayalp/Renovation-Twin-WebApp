#!/bin/bash
# Railway start script

# Create data directories if they don't exist
mkdir -p data/uploads data/reconstructions data/reports data/tmp

# Start the FastAPI server
exec python3 -m uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
