#!/bin/zsh
# Auto-load .env and start Uvicorn with OpenAI key for backend

# Resolve script directory and project root (digital-renovation-twin)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR%/backend}"

cd "$PROJECT_ROOT" || {
  echo "Failed to cd to project root: $PROJECT_ROOT"
  exit 1
}

set -a
source ./.env 2>/dev/null || source ./backend/.env 2>/dev/null
set +a

# Find uvicorn in any venv under backend/
UVICORN_BIN=$(find ./backend -type f -path '*/bin/uvicorn' | head -n 1)
if [ -z "$UVICORN_BIN" ]; then
  echo "Could not find uvicorn binary under backend/. Ensure your venv is set up."
  exit 1
fi

"$UVICORN_BIN" backend.main:app --host 127.0.0.1 --port 8000 > backend_uvicorn.log 2>&1
uvicorn_status=$?
if [ $uvicorn_status -ne 0 ]; then
  echo "[start_backend.sh] Uvicorn failed to start. See backend_uvicorn.log for details."
  tail -20 backend_uvicorn.log
  exit $uvicorn_status
fi
