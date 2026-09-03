@echo off
title ClaimShield AI - Pre-Submission Denial Prevention Engine
echo =================================================================
echo   ClaimShield AI - Pre-Submission Denial Prevention Engine
echo   Microsoft Innovation Club, VIT Chennai Hackathon Demo
echo   [SIMULATED / DEMO DATA ONLY]
echo =================================================================
echo.

set ROOT=%~dp0
set BACKEND=%ROOT%backend
set FRONTEND=%ROOT%frontend

echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000...
start "ClaimShield AI Backend" cmd /k "cd /d "%BACKEND%" && python -m uvicorn app.main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo [2/3] Starting React Vite Frontend on http://localhost:5173...
start "ClaimShield AI Frontend" cmd /k "cd /d "%FRONTEND%" && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Launching Web Browser at http://localhost:5173...
start http://localhost:5173

echo.
echo =================================================================
echo   System Online!
echo   - Web Console: http://localhost:5173
echo   - Backend API Docs: http://127.0.0.1:8000/docs
echo =================================================================
echo.
pause
