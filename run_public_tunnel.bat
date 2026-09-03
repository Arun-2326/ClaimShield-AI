@echo off
title ClaimShield AI - Public URL Generator
echo =================================================================
echo   ClaimShield AI - Instant Public HTTPS Tunnel
echo   Generating live public URL for port 8000...
echo =================================================================
echo.

ssh -o StrictHostKeyChecking=no -R 80:127.0.0.1:8000 nokey@localhost.run
pause
