@echo off
title KrishiSetu Backend Server
echo ====================================================
echo Starting KrishiSetu Backend Server (FastAPI)
echo ====================================================
cd /d "%~dp0"
"C:\ProgramData\anaconda3\python.exe" backend\run_server.py
pause
