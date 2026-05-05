@echo off
REM Comprehensive Setup and Test Script
REM Installs all dependencies and runs tests

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  COMPREHENSIVE SETUP AND FIX - ALL SERVICES                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set "FAILED=0"

REM ============================================================================
REM 1. SETUP API GATEWAY
REM ============================================================================
echo.
echo [1/8] Setting up API Gateway (port 5000)...
cd /d "backend\api-gateway"

if not exist ".venv" (
    echo   Creating virtual environment...
    python -m venv .venv
    call .venv\Scripts\activate.bat
    pip install --upgrade pip -q
    echo   Installing dependencies...
    pip install -r requirements.txt -q
    call .venv\Scripts\deactivate.bat
    echo   ✓ API Gateway ready
) else (
    echo   ✓ API Gateway already setup
)

cd /d ..\..\

REM ============================================================================
REM 2. SETUP ADAPTIVE LEARNING
REM ============================================================================
echo.
echo [2/8] Setting up Adaptive Learning (port 5001)...
cd /d "backend\adaptive-learning"

if not exist ".venv" (
    echo   Creating virtual environment...
    python -m venv .venv
    call .venv\Scripts\activate.bat
    pip install --upgrade pip -q
    echo   Installing dependencies...
    pip install -r requirements.txt -q
    call .venv\Scripts\deactivate.bat
    echo   ✓ Adaptive Learning ready
) else (
    echo   ✓ Adaptive Learning already setup
)

cd /d ..\..\

REM ============================================================================
REM 3. SETUP RISK PREDICTOR
REM ============================================================================
echo.
echo [3/8] Setting up Risk Predictor (port 5002)...
cd /d "backend\risk-predictor"

if not exist ".venv" (
    echo   Creating virtual environment...
    python -m venv .venv
    call .venv\Scripts\activate.bat
    pip install --upgrade pip -q
    echo   Installing dependencies...
    pip install -r requirements.txt -q
    call .venv\Scripts\deactivate.bat
    echo   ✓ Risk Predictor ready
) else (
    echo   ✓ Risk Predictor already setup
)

cd /d ..\..\

REM ============================================================================
REM 4. SETUP STRESS PREDICTION
REM ============================================================================
echo.
echo [4/8] Setting up Stress Prediction (port 5003)...
cd /d "backend\stress-prediction"

if not exist ".venv" (
    echo   Creating virtual environment...
    python -m venv .venv
    call .venv\Scripts\activate.bat
    pip install --upgrade pip -q
    echo   Installing dependencies...
    pip install -r requirements.txt -q
    call .venv\Scripts\deactivate.bat
    echo   ✓ Stress Prediction ready
) else (
    echo   ✓ Stress Prediction already setup
)

cd /d ..\..\

REM ============================================================================
REM 5. SETUP ATTENDANCE TRENDS BACKEND
REM ============================================================================
echo.
echo [5/8] Setting up Attendance Trends Backend (port 5004)...
cd /d "attendance-trends"

if not exist "node_modules" (
    echo   Installing npm dependencies...
    call npm install -q
    echo   ✓ Attendance Trends Backend ready
) else (
    echo   ✓ Attendance Trends Backend already setup
)

cd /d ..

REM ============================================================================
REM 6. SETUP ATTENDANCE TRENDS ML SERVICE
REM ============================================================================
echo.
echo [6/8] Setting up Attendance Trends ML Service (port 8000)...
cd /d "attendance-trends\ml_service"

if not exist ".venv" (
    echo   Creating virtual environment...
    python -m venv .venv
    call .venv\Scripts\activate.bat
    pip install --upgrade pip -q
    echo   Installing dependencies...
    pip install -r requirements.txt -q
    call .venv\Scripts\deactivate.bat
    echo   ✓ Attendance Trends ML Service ready
) else (
    echo   ✓ Attendance Trends ML Service already setup
)

cd /d ..\..\

REM ============================================================================
REM 7. SETUP FRONTEND
REM ============================================================================
echo.
echo [7/8] Checking Frontend setup...
cd /d "frontend"

if not exist "node_modules" (
    echo   Installing npm dependencies...
    call npm install -q
    echo   ✓ Frontend ready
) else (
    echo   ✓ Frontend already setup
)

cd /d ..\

REM ============================================================================
REM 8. SETUP ATTENDANCE TRENDS FRONTEND
REM ============================================================================
echo.
echo [8/8] Checking Attendance Trends Frontend setup...
cd /d "attendance-trends\frontend"

if not exist "node_modules" (
    echo   Installing npm dependencies...
    call npm install -q
    echo   ✓ Attendance Trends Frontend ready
) else (
    echo   ✓ Attendance Trends Frontend already setup
)

cd /d ..\..\

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  SETUP COMPLETE!                                              ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Next: Run "start-all-services.bat" to start all services
echo Then open: http://localhost:5173
echo Attendance UI: http://localhost:5174
echo.
pause
