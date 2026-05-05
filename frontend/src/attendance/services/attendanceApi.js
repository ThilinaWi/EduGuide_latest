import axios from 'axios';
import { API_GATEWAY_URL } from '../../api/client';

const attendancePrefix = API_GATEWAY_URL.includes('5004')
    ? '/api'
    : '/api/attendance/api';

const withApiPrefix = (path) => `${attendancePrefix}${path}`;

const api = axios.create({
    baseURL: API_GATEWAY_URL,
    timeout: 30000,
});

const mlApi = axios.create({
    baseURL: API_GATEWAY_URL,
    timeout: 180000,
});

// Analytics
export const fetchSummary = () => api.get(withApiPrefix('/analytics/summary')).then(r => r.data);
export const fetchGradeBreakdown = () => api.get(withApiPrefix('/analytics/grade-breakdown')).then(r => r.data);
export const fetchRateDistribution = () => api.get(withApiPrefix('/analytics/rate-distribution')).then(r => r.data);

// Students
export const fetchStudents = (params) => api.get(withApiPrefix('/students'), { params }).then(r => r.data);
export const fetchStudent = (id) => api.get(withApiPrefix(`/students/${id}`)).then(r => r.data);
export const fetchRiskSummary = () => api.get(withApiPrefix('/students/stats/risk-summary')).then(r => r.data);

// Attendance
export const fetchMonthlySummary = () => api.get(withApiPrefix('/attendance/monthly-summary')).then(r => r.data);
export const fetchStudentAttendance = (id, params) => api.get(withApiPrefix(`/attendance/student/${id}`), { params }).then(r => r.data);
export const fetchDayOfWeek = () => api.get(withApiPrefix('/attendance/day-of-week')).then(r => r.data);
export const fetchWeatherCorrelation = () => api.get(withApiPrefix('/attendance/weather-correlation')).then(r => r.data);
export const fetchStudentFilteredAttendance = (params) => api.get(withApiPrefix('/attendance/student-filter'), { params }).then(r => r.data);

// Anomalies
export const fetchAnomalies = (params) => api.get(withApiPrefix('/anomalies'), { params }).then(r => r.data);
export const fetchAnomalyTypeSummary = () => api.get(withApiPrefix('/anomalies/type-summary')).then(r => r.data);

// Forecasting
export const fetchGlobalLSTM = (steps = 30) =>
    mlApi.get(withApiPrefix('/forecast/global/lstm'), { params: { steps } }).then(r => r.data);
export const fetchGlobalARIMA = (steps = 12) =>
    mlApi.get(withApiPrefix('/forecast/global/arima'), { params: { steps } }).then(r => r.data);
export const fetchStudentForecast = (studentId, steps = 6) =>
    mlApi.get(withApiPrefix(`/forecast/student/${studentId}`), { params: { steps } }).then(r => r.data);
export const refreshForecasts = () =>
    mlApi.post(withApiPrefix('/forecast/refresh')).then(r => r.data);
export const fetchForecastHealth = () =>
    api.get(withApiPrefix('/forecast/health')).then(r => r.data);
export const fetchModelInfo = () =>
    api.get(withApiPrefix('/forecast/model/info')).then(r => r.data);

// Contextual Impact Analysis
export const fetchContextualImpact = () =>
    mlApi.get(withApiPrefix('/contextual/impact')).then(r => r.data);
export const fetchStudentImpact = (studentId) =>
    mlApi.post(withApiPrefix('/contextual/student-impact'), { student_id: studentId }).then(r => r.data);
export const predictContextual = (payload) =>
    mlApi.post(withApiPrefix('/contextual/predict'), payload).then(r => r.data);
export const predictStudentContextual = (payload) =>
    mlApi.post(withApiPrefix('/contextual/predict-student'), payload).then(r => r.data);

// Guest Trend Analyzer — ARIMA + Context-Aware Explanations (no DB required)
export const predictGuestTrend = (payload) =>
    mlApi.post(withApiPrefix('/contextual/guest-trend'), payload).then(r => r.data);

export default api;
