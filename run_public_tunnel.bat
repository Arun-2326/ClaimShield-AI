@echo off
title ClaimShield AI - Public Cloudflare Tunnel
echo =================================================================
echo   ClaimShield AI - Instant Public HTTPS Cloudflare Tunnel
echo   Starting secure public tunnel on port 8000...
echo =================================================================
echo.

if not exist "%~dp0cloudflared.exe" (
    echo Downloading cloudflared.exe...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile '%~dp0cloudflared.exe'"
)

echo Generating your public HTTPS link (look for https://*.trycloudflare.com below):
echo.
"%~dp0cloudflared.exe" tunnel --url http://127.0.0.1:8000
pause
