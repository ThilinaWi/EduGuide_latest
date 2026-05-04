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
echo [1/5] Setting up API Gateway (port 3000)...
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
echo [2/5] Setting up Adaptive Learning (port 5001)...
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
echo [3/5] Setting up Risk Predictor (port 5002)...
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
echo [4/5] Setting up Stress Prediction (port 5003)...
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
REM 5. SETUP FRONTEND
REM ============================================================================
echo.
echo [5/5] Checking Frontend setup...
cd /d "frontend"

if not exist "node_modules" (
    echo   Installing npm dependencies...
    call npm install -q
    echo   ✓ Frontend ready
) else (
    echo   ✓ Frontend already setup
)

cd /d ..\

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  SETUP COMPLETE!                                              ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Next: Run "start-all-services.bat" to start all services
echo Then open: http://localhost:5173
echo.
pause
