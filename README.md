# Unified Microservices Architecture

A consolidated educational platform combining four components: Adaptive Learning Path Generator, Risk Predictor, Stress Prediction, and Attendance Trends.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Port 5173)                     │
│                      React + Vite Application                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway (Port 5000)                       │
│                      Request Router/Proxy                        │
└─┬─────────────────────────┬──────────────────────┬──────────────┘
  │                         │                      │
  ▼                         ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Adaptive Learning │  │ Risk Predictor   │  │ Stress Prediction│
│ Backend          │  │ Backend          │  │ Backend          │
│ (FastAPI)        │  │ (Flask)          │  │ (Flask)          │
│ Port: 5001       │  │ Port: 5002       │  │ Port: 5003       │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 Attendance Analyzer (Port 5004)                  │
│                         Flask + MongoDB                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Auth Service (Port 5050)                      │
│                         FastAPI + JWT                            │
└─────────────────────────────────────────────────────────────────┘

Attendance Trends (separate stack)
  - Backend API: http://localhost:5004
  - ML Service:  http://localhost:8000
  - Frontend:    http://localhost:5174
```

## Services

### 1. API Gateway (Port 5000)
- Central entry point for all requests
- Routes requests to appropriate microservices
- Handles CORS, error handling, and load balancing
- **Tech**: FastAPI + Uvicorn

### 2. Adaptive Learning Backend (Port 5001)
- Student monitoring and learning path generation
- MongoDB integration for student profiles
- Cluster-based student classification
- **Tech**: FastAPI + Uvicorn

### 3. Risk Predictor Backend (Port 5002)
- Academic risk prediction using ML models
- 95.2% accuracy Random Forest model
- Dynamic recommendation generation
- **Tech**: Flask

### 4. Stress Prediction Backend (Port 5003)
- Student stress level prediction
- MongoDB for prediction history
- Personalized wellness recommendations
- **Tech**: Flask

### 5. Frontend (Port 5173)
- Unified React + Vite dashboard
- Real-time data visualization
- Adaptive UI based on student profiles
- **Tech**: React + Vite + Tailwind CSS

### 6. Attendance Analyzer (Port 5004)
- Attendance analytics and anomaly detection
- Uses MongoDB for storage
- **Tech**: Flask + PyMongo

### 7. Auth Service (Port 5050)
- Email/password + Google OAuth
- JWT-based auth and role enforcement
- **Tech**: FastAPI + PyJWT

## Quick Start

### Windows (Recommended)
```batch
cd EduGuide_latest
setup-all.bat
start-all-services.bat
```

Open the UI at http://localhost:5173
Auth API: http://localhost:5050

### Run Individual Services (Windows)

#### API Gateway
```bash
cd backend/api-gateway
pip install -r requirements.txt
python main.py
# Runs on http://localhost:5000
```

#### Adaptive Learning Backend
```bash
cd backend/adaptive-learning
pip install -r requirements.txt
python main.py
# Runs on http://localhost:5001
```

#### Risk Predictor Backend
```bash
cd backend/risk-predictor
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5002
```

#### Stress Prediction Backend
```bash
cd backend/stress-prediction
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5003
```

#### Attendance Analyzer
```bash
cd backend/attendance-analyzer
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5004
```

#### Auth Service
```bash
cd backend/auth-service
pip install -r requirements.txt
python main.py
# Runs on http://localhost:5050
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## API Endpoints

All endpoints are accessible through the API Gateway at `http://localhost:5000`

### Adaptive Learning API
- `GET /api/adaptive/students` - Get all students
- `POST /api/adaptive/students/add` - Add new student
- `GET /api/adaptive/students/{student_id}` - Get student details
- `GET /api/adaptive/clusters` - Get cluster distribution

### Risk Predictor API
- `POST /api/risk/predict` - Predict academic risk
- `POST /api/risk/recommend` - Get recommendations
- `GET /api/risk/history` - Get prediction history

### Stress Prediction API
- `POST /api/stress/predict` - Predict stress level
- `GET /api/stress/history` - Get prediction history
- `POST /api/stress/recommend` - Get wellness recommendations

## Environment Variables

### API Gateway (.env)
```
ADAPTIVE_LEARNING_URL=http://localhost:5001
RISK_PREDICTOR_URL=http://localhost:5002
STRESS_PREDICTION_URL=http://localhost:5003
ATTENDANCE_ANALYZER_URL=http://localhost:5004
```

### Adaptive Learning (.env)
```
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/
PORT=5001
```

### Risk Predictor (.env)
```
PORT=5002
```

### Stress Prediction (.env)
```
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/
MONGODB_COLLECTION=predictions
PORT=5003
```

### Frontend (.env)
```
VITE_API_GATEWAY_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Attendance Analyzer (.env)
```
PORT=5004
MONGO_URI=mongodb://127.0.0.1:27017/student_attendance
DB_NAME=student_attendance
```

### Auth Service (.env)
```
GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=change-me
JWT_EXP_MINUTES=120
TEACHER_EMAILS=teacher1@example.com,teacher2@example.com
MONGODB_URI=
```

## Database Configuration

All services support MongoDB for persistence:

1. Create a MongoDB Atlas cluster: https://www.mongodb.com/cloud/atlas
2. Get your connection string
3. Update `.env` files in each backend with your MongoDB URI

Example connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

## Health Check

Check the status of all services:
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "adaptive": {
    "status": "UP",
    "url": "http://localhost:5001"
  },
  "risk": {
    "status": "UP",
    "url": "http://localhost:5002"
  },
  "stress": {
    "status": "UP",
    "url": "http://localhost:5003"
  },
  "attendance": {
    "status": "UP",
    "url": "http://localhost:5004"
  }
}
```

## File Structure

```
EduGuide_latest/
├── backend/
│   ├── api-gateway/          # Main entry point (port 5000)
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   ├── .env
│   │   └── Dockerfile
│   ├── adaptive-learning/    # Student monitoring (port 5001)
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   ├── core/
│   │   ├── models/
│   │   ├── .env
│   │   └── Dockerfile
│   ├── attendance-analyzer/  # Attendance analytics (port 5004)
│   │   ├── app.py
│   │   ├── requirements.txt
│   │   ├── data/
│   │   ├── .env
│   │   └── seed.py
│   ├── auth-service/         # Auth API (port 5050)
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   ├── users.json
│   │   └── .env
│   ├── risk-predictor/       # Risk prediction (port 5002)
│   │   ├── app.py
│   │   ├── requirements.txt
│   │   ├── *.pkl             # ML models
│   │   ├── .env
│   │   └── Dockerfile
│   └── stress-prediction/    # Stress prediction (port 5003)
│       ├── app.py
│       ├── requirements.txt
│       ├── *.pkl             # ML models
│       ├── .env
│       └── Dockerfile
├── frontend/                 # React + Vite (port 5173)
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env
│   └── Dockerfile
├── data/                     # Consolidated data
│   ├── *.csv
│   └── *.pkl
├── start-all-services.bat    # Windows startup script
└── README.md                 # This file
```

## Microservices Communication

### Frontend → API Gateway
```javascript
// src/api/client.js
baseURL: 'http://localhost:5000'
```

### API Gateway → Individual Services
```python
# backend/api-gateway/main.py
ADAPTIVE_LEARNING_URL = 'http://localhost:5001'
RISK_PREDICTOR_URL = 'http://localhost:5002'
STRESS_PREDICTION_URL = 'http://localhost:5003'
ATTENDANCE_ANALYZER_URL = 'http://localhost:5004'
```

### Frontend → Auth Service
```javascript
// src/api/authApi.js
baseURL: 'http://localhost:5050'
```

## Scaling & Deployment

### Local Development
Use `start-all-services.bat`

## Troubleshooting

### Service Not Responding
```bash
# Check if service is running
curl http://localhost:5000/health

# Check logs
docker logs <container_name>
```

### Port Already in Use
```bash
# Find and kill process using port
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Unix
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Error
- Verify MongoDB connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure credentials are correct

## Development Notes

- Each backend runs independently and can be scaled separately
- API Gateway handles request routing and CORS
- All services share the same data folder
- Frontend uses environment variables for API configuration

## Support & Documentation

For detailed service documentation, see:
- `backend/adaptive-learning/README.md`
- `backend/risk-predictor/README.md`
- `backend/stress-prediction/README.md`
- `frontend/README.md`
