@echo off
echo ======================================================================
echo Launching RAAHI (Team ShaktiX - HERHACK 2026)
echo When the network fails, your safety network doesn't.
echo ======================================================================
echo.
echo Starting FastAPI Backend on http://localhost:8000 ...
start "RAAHI Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Starting Vite Frontend on http://localhost:5173 ...
start "RAAHI Frontend (React + TS)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers are launching!
echo App URL: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
timeout /t 3 >nul
start http://localhost:5173
