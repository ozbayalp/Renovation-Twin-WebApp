# Multi-stage build for Frontend + Backend (Railway optimized)

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY builder-frontend/package*.json ./
RUN npm ci --production=false
COPY builder-frontend/ ./
RUN npm run build:client

# Stage 2: Python backend with frontend static files
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend to static directory
COPY --from=frontend-builder /app/frontend/dist/spa ./static

# Create data directories with proper permissions
RUN mkdir -p data/uploads data/reconstructions data/reports data/tmp \
    && chmod -R 755 data

# Environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV CORS_ALLOW_ALL=true
ENV DAMAGE_ANALYZER=mock

# Expose port (Railway uses $PORT)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT:-8000}/health')" || exit 1

# Run the application - use shell form to allow $PORT substitution
CMD python -m uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
