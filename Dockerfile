# Optimized multi-stage build for Railway
# Uses smaller images and fewer dependencies

# Stage 1: Build frontend with node alpine
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy only package files first for better caching
COPY digital-renovation-twin/builder-frontend/package*.json ./

# Install with reduced features for speed
RUN npm install --legacy-peer-deps --no-audit --no-fund --prefer-offline 2>/dev/null || npm install --legacy-peer-deps

# Copy source and build
COPY digital-renovation-twin/builder-frontend/ ./
RUN npm run build:client

# Stage 2: Minimal Python runtime
FROM python:3.12-slim

WORKDIR /app

# Install Python dependencies (no gcc needed for pre-built wheels)
COPY digital-renovation-twin/backend/requirements.txt ./
RUN pip install --no-cache-dir --prefer-binary -r requirements.txt

# Copy backend code
COPY digital-renovation-twin/backend/ ./backend/

# Copy built frontend
COPY --from=frontend-builder /app/dist/spa ./static

# Create data directories
RUN mkdir -p data/uploads data/reconstructions data/reports data/tmp

# Environment
ENV PYTHONPATH=/app \
    PYTHONUNBUFFERED=1 \
    CORS_ALLOW_ALL=true \
    DAMAGE_ANALYZER=mock

# Railway assigns PORT dynamically
EXPOSE 8000

# Start command - use shell form to expand $PORT variable
CMD python -m uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
