import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import StudentProfile from './components/StudentProfile';
import AddStudent from './components/AddStudent';
import AdaptivePath from './components/AdaptivePath';
import AttendanceAnalyze from './components/AttendanceAnalyze';
import IQScoreTest from './components/IQScoreTest';
import StudentLookup from './components/StudentLookup';
import RiskPredictorPage from './pages/RiskPredictorPage';
import StressPrediction from './components/StressPrediction';

function App() {
  return (
    <Router>
      <Sidebar />
      <Routes>
        {/* Adaptive Learning Component */}
        <Route path="/" element={<AddStudent />} />
        <Route path="/add-student" element={<AddStudent />} />
        <Route path="/students/:id" element={<StudentProfile />} />
        <Route path="/adaptive-path" element={<AdaptivePath />} />
        <Route path="/attendance-analyze" element={<AttendanceAnalyze />} />
        <Route path="/iq-test" element={<IQScoreTest />} />
        <Route path="/student-records" element={<StudentLookup />} />
        
        {/* Risk Predictor Component */}
        <Route path="/risk-predictor" element={<RiskPredictorPage />} />
        
        {/* Stress Prediction Component */}
        <Route path="/stress" element={<StressPrediction />} />
      </Routes>
    </Router>
  );
}

export default App;
