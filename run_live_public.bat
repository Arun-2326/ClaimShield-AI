@echo off
title ClaimShield AI 2050 - Local Public Live Tunnel
echo ===================================================
echo   ClaimShield AI 2050 - Public Live Launcher
echo ===================================================
echo.
echo 1. Launching Unified Server (FastAPI + React 2050 UI) on port 8000...
start cmd /k "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"

echo 2. Waiting for server to initialize...
timeout /t 4 /nobreak >nul

echo 3. Generating Instant Public HTTPS Tunnel...
echo    Anyone on the internet will be able to access your demo through this URL!
echo.
npx -y localtunnel --port 8000
pause
