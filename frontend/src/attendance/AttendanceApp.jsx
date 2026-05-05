import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import AnomalyReport from './pages/AnomalyReport';
import AttendanceTrends from './pages/AttendanceTrends';
import Forecasting from './pages/Forecasting';
import ContextualAnalysis from './pages/ContextualAnalysis';
import './attendance.css';

export default function AttendanceApp() {
    return (
        <div className="attendance-analyzer min-h-screen flex bg-slate-900 text-slate-100">
            <Sidebar />
            <main className="flex-1 ml-64 p-6">
                <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="students" element={<StudentList />} />
                    <Route path="anomalies" element={<AnomalyReport />} />
                    <Route path="trends" element={<AttendanceTrends />} />
                    <Route path="forecast" element={<Forecasting />} />
                    <Route path="context" element={<ContextualAnalysis />} />
                </Routes>
            </main>
        </div>
    );
}
