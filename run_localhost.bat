@echo off
title ClaimShield AI 2050 - Localhost Runner
echo ==========================================================
echo   ClaimShield AI 2050 - Starting Localhost Server
echo ==========================================================
echo.
echo 1. Clearing any previous process on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo 2. Launching ClaimShield AI Unified Server on port 8000...
echo    (FastAPI Backend + Futuristic 2050 React Cockpit)
echo.
start "" http://127.0.0.1:8000
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
pause
