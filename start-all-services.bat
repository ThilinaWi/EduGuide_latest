@echo off
REM Start all microservices in separate processes
REM This script should be run from the project root directory

echo Starting Unified Microservices Architecture...
echo.

REM Start Auth Service
echo Starting Auth Service on port 5050...
start "Auth Service" cmd /k "cd backend\auth-service && if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) && python -m pip install -r requirements.txt -q && python main.py"
timeout /t 2

REM Start API Gateway
echo Starting API Gateway on port 5000...
start "API Gateway" cmd /k "cd backend\api-gateway && if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) && python -m pip install -r requirements.txt -q && python main.py"
timeout /t 2

REM Start Adaptive Learning Backend
echo Starting Adaptive Learning Backend on port 5004...
start "Adaptive Learning Backend" cmd /k "cd backend\adaptive-learning && if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) && python -m pip install -r requirements.txt -q && python main.py"
timeout /t 2

REM Start Risk Predictor Backend
echo Starting Risk Predictor Backend on port 5002...
start "Risk Predictor Backend" cmd /k "cd backend\risk-predictor && if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) && python -m pip install -r requirements.txt -q && python app.py"
timeout /t 2

REM Start Stress Prediction Backend
echo Starting Stress Prediction Backend on port 5003...
start "Stress Prediction Backend" cmd /k "cd backend\stress-prediction && if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) && python -m pip install -r requirements.txt -q && python app.py"
timeout /t 2

REM Start Attendance Analyzer Backend
echo Starting Attendance Analyzer Backend on port 5004...
start "Attendance Analyzer Backend" cmd /k "cd backend\attendance-analyzer && if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) && python -m pip install -r requirements.txt -q && python app.py"
timeout /t 2

REM Start Frontend
echo Starting Frontend on port 5173...
start "Frontend" cmd /k "cd frontend && npm install -q && npm run dev"

echo.
echo All services started! 
echo.
echo Services available at:
echo   Auth Service:          http://localhost:5050
echo   API Gateway:           http://localhost:5000
echo   Adaptive Learning:     http://localhost:5001
echo   Risk Predictor:        http://localhost:5002
echo   Stress Prediction:     http://localhost:5003
echo   Attendance Analyzer:   http://localhost:5004
echo   Frontend:              http://localhost:5173
echo.
pause
