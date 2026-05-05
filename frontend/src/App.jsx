import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import StudentProfile from './components/StudentProfile';
import AddStudent from './components/AddStudent';
import AdaptivePath from './components/AdaptivePath';
import AttendanceAnalyze from './components/AttendanceAnalyze';
import IQScoreTest from './components/IQScoreTest';
import StudentLookup from './components/StudentLookup';
import RiskPredictorPage from './pages/RiskPredictorPage';
import StressPrediction from './components/StressPrediction';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import TeacherDashboard from './pages/TeacherDashboard';
import UserManagement from './components/UserManagement';

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Adaptive Learning Component */}
        <Route path="/add-student" element={<AddStudent />} />
        <Route path="/students/:id" element={<StudentProfile />} />
        <Route path="/adaptive-path" element={<AdaptivePath />} />
        <Route path="/attendance-analyze" element={<AttendanceAnalyze />} />
        <Route path="/iq-test" element={<IQScoreTest />} />
        <Route path="/student-records" element={<StudentLookup />} />

        {/* Teacher */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/users" element={<UserManagement />} />

        {/* Risk Predictor Component */}
        <Route path="/risk-predictor" element={<RiskPredictorPage />} />

        {/* Stress Prediction Component */}
        <Route path="/stress" element={<StressPrediction />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <Router>
        <AppRoutes />
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
