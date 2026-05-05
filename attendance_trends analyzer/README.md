# AttendanceIQ - Student Attendance Analytics & Prediction

A full-stack **React + Flask + MongoDB** application with simulated LSTM and ARIMA forecasting.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend API | Python, Flask, MongoDB |
| ML Service | embedded in Flask (simulated LSTM/ARIMA) |
| Database | MongoDB (local) |

## Architecture

```
React (port 3000)
     │
     ▼
Flask API + ML (port 5000)
     │
     ▼
MongoDB
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Python](https://www.python.org/) 3.9+
- [MongoDB](https://www.mongodb.com/try/download/community) running on port 27017

## Setup & Running

### Step 1 — Start MongoDB
```bash
mongod
```

### Step 2 — Start the Flask API + ML Service
```bash
cd backend
pip install -r requirements.txt
python app.py
# → http://localhost:5000
```

### Step 3 — Seed the Database (run once)
```bash
cd backend
python seed.py
```
Loads the CSV into MongoDB using the Flask stack.

### Step 4 — Start the Frontend
```bash
cd frontend
npm run dev
# → http://localhost:3000
```

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | KPI cards, monthly trends, risk distribution |
| Students | `/students` | Searchable/filterable paginated student table |
| Anomaly Report | `/anomalies` | AI-flagged irregular attendance patterns |
| Trends | `/trends` | Day-of-week radar, weather correlation, monthly details |
| **AI Forecasting** | `/forecast` | **LSTM 30-day & ARIMA 12-month prediction with CI bands** |

## ML Endpoints (port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict/lstm` | 30-day LSTM attendance forecast |
| POST | `/predict/arima` | 12-month ARIMA forecast with confidence intervals |
| POST | `/predict/student` | Per-student ARIMA forecast |
| GET | `/model/info` | LSTM model architecture info |
| GET | `/health` | ML service health check |
