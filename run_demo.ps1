# ClaimShield AI - One-Click Demo Runner (Windows PowerShell)
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  ClaimShield AI — Pre-Submission Denial Prevention Engine       " -ForegroundColor White
Write-Host "  Microsoft Innovation Club, VIT Chennai Hackathon Demo         " -ForegroundColor Green
Write-Host "  [SIMULATED / DEMO DATA ONLY]                                  " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $Root "backend"
$FrontendDir = Join-Path $Root "frontend"

Write-Host "1. Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "cd '$BackendDir'; python -m uvicorn app.main:app --reload --port 8000"

Start-Sleep -Seconds 3

Write-Host "2. Starting React Vite Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "cd '$FrontendDir'; cmd /c npm run dev"

Start-Sleep -Seconds 2

Write-Host "3. Launching Chrome/Default Browser to Demo Interface..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "System initialized successfully!" -ForegroundColor Green
Write-Host "Backend API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Gray
Write-Host "Frontend Console: http://localhost:5173" -ForegroundColor Gray
