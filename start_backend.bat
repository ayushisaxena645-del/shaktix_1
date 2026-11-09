@echo off
echo Starting RAAHI FastAPI Backend (Team ShaktiX - HERHACK 2026)...
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
