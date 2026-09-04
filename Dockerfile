# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend with Unified Static Serving
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend application source code
COPY backend/ ./backend/

# Copy built React static assets from Stage 1 into expected path
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Ensure PORT is read dynamically from cloud hosting environments
ENV PORT=8000
EXPOSE 8000

WORKDIR /app/backend
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
