import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  BarChart2,
  BookOpen,
  Target,
  Activity,
  Settings,
  LogOut,
  LayoutGrid,
  CalendarCheck,
  BrainCircuit,
  Database,
  Users
} from 'lucide-react';
import { clearAuth, getRole } from '../services/authService';

const Sidebar = () => {
  const navigate = useNavigate();
  const role = getRole();
  const navItems = role === 'teacher'
    ? [
        { name: 'Teacher Dashboard', icon: <LayoutGrid size={20} />, path: '/teacher/dashboard' },
        { name: 'Students', icon: <Users size={20} />, path: '/teacher/dashboard#students' },
        { name: 'User Management', icon: <Database size={20} />, path: '/teacher/users' },
      ]
    : [
        { name: 'Learning Path', icon: <Home size={20} />, path: '/add-student' },
        { name: 'Risk Predictor', icon: <Target size={20} />, path: '/risk-predictor' },
        { name: 'Stress Prediction', icon: <Activity size={20} />, path: '/stress' },
        { name: 'IQ Assessment', icon: <BrainCircuit size={20} />, path: '/iq-test' },
      ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-[#0f172a] text-white flex flex-col z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
          <BookOpen size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold leading-none">EduMonitor AI</h2>
          <span className="text-xs text-slate-400">Grade 11 • Sri Lanka</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
            `}
          >
            {item.icon}
            <span className="font-medium text-sm">{item.name}</span>
          </NavLink>
        ))}

        <div className="mt-4">
          <p className="px-4 text-xs font-semibold tracking-widest uppercase text-emerald-300/80">Attendance Analyze</p>
          <div className="mt-2 space-y-1">
            {role !== 'teacher' && (
              <>
                <NavLink
                  to="/attendance/anomalies"
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200
                    ${isActive
                      ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/40'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  Anomaly Report
                </NavLink>
                <NavLink
                  to="/attendance/trends"
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200
                    ${isActive
                      ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/40'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  Trends & Analytics
                </NavLink>
                <NavLink
                  to="/attendance/forecast"
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200
                    ${isActive
                      ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/40'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  AI Forecasting
                </NavLink>
              </>
            )}
            <NavLink
              to="/attendance/context"
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200
                ${isActive
                  ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
              `}
            >
              Contextual Impact
            </NavLink>
          </div>
        </div>
      </nav>

      <div className="px-4 py-6 border-t border-slate-800 space-y-1">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <Settings size={20} />
          <span className="font-medium text-sm">Settings</span>
        </NavLink>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          onClick={() => {
            clearAuth();
            navigate('/login', { replace: true });
          }}
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
