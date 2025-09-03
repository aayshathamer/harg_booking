@echo off
echo Starting Hargeisa Vibes Development Environment...
echo.

echo [1/3] Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm run dev"

echo [2/3] Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo [3/3] Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Development servers are starting...
echo.
echo Backend API: http://localhost:3001
echo Frontend: http://localhost:8080
echo.
echo Press any key to close this window...
pause > nul
