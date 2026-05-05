import { useState, useEffect } from 'react';
import {
    fetchGlobalLSTM, fetchGlobalARIMA, fetchStudentForecast,
    refreshForecasts, fetchForecastHealth
} from '../services/attendanceApi';
import {
    ComposedChart, Area, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
    Brain, TrendingUp, RefreshCw, Search, Wifi, WifiOff,
    AlertTriangle, CheckCircle, Loader, ChevronDown
} from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl text-xs max-w-xs">
            <p className="font-semibold text-slate-300 mb-2">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color || p.stroke }} className="flex justify-between gap-4 mt-0.5">
                    <span className="text-slate-400">{p.name}:</span>
                    <span className="font-bold text-white">{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}%</span>
                </p>
            ))}
        </div>
    );
};

const ChartSkeleton = () => (
    <div className="h-64 rounded-xl bg-slate-700/40 shimmer flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-slate-500">
            <Loader className="w-6 h-6 animate-spin" />
            <span className="text-xs">Loading forecast from ML service…</span>
        </div>
    </div>
);

function MLStatusBadge({ status }) {
    if (!status) return null;
    const online = status.ml_service === 'online';
    return (
        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${online ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
            {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            ML Service: {online ? 'Online' : 'Offline'}
            {online && status.model_exists && <CheckCircle className="w-3 h-3 ml-1" />}
        </div>
    );
}

function LSTMChart({ data, loading, error }) {
    if (error && !loading) return (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-red-300 font-medium mb-1">ML Service Error</p>
            <p className="text-red-400/80 text-sm">{error}</p>
            <p className="text-slate-500 text-xs mt-3">Make sure the Python ML service is running: <code className="text-blue-400">python backend/app.py</code></p>
        </div>
    );

    const chartData = [];
    let maxVal = null, minVal = null;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    let n = 0;

    const addPoint = (label, actual, predicted) => {
        const val = actual !== null ? actual : predicted;
        if (val !== null) {
            if (!maxVal || val > maxVal.val) maxVal = { label, val };
            if (!minVal || val < minVal.val) minVal = { label, val };
            sumX += n; sumY += val; sumXY += n * val; sumXX += n * n;
            n++;
        }
        chartData.push({ label, actual, predicted, combined: val });
    };

    if (data?.historical) data.historical.forEach(h => addPoint(h.label, h.rate, null));
    if (data?.forecast) data.forecast.forEach(f => addPoint(f.date || f.label, null, f.predicted_rate || f.rate));

    const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) : 0;
    const intercept = n > 1 ? (sumY - slope * sumX) / n : 0;

    chartData.forEach((dp, i) => {
        if (dp.combined !== null) dp.trend = slope * i + intercept;
    });

    return loading ? <ChartSkeleton /> : (
        <div>
            {data?.fromCache && (
                <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-400" /> Served from cache
                    {data.meta?.input_shape && <span className="ml-2 text-slate-600">· LSTM input shape: {data.meta.input_shape}</span>}
                </p>
            )}
            <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={chartData}>
                    <defs>
                        <linearGradient id="lstmGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 9 }} tickLine={false} interval="preserveStartEnd" />
                    <YAxis domain={[60, 100]} ticks={[60, 70, 80, 90, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                    <ReferenceLine x={data?.historical?.[data.historical.length - 1]?.label}
                        stroke="#475569" strokeDasharray="4 2" label={{ value: 'Forecast Start', fill: '#64748b', fontSize: 10 }} />
                    <Line type="linear" dataKey="trend" name="Overall Trend" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} />
                    <Area type="linear" dataKey="actual" name="Historical Rate" stroke="#3b82f6" fill="url(#actualGrad)" strokeWidth={2} dot={false} connectNulls={false} />
                    <Area type="linear" dataKey="predicted" name="LSTM Predicted" stroke="#8b5cf6" fill="url(#lstmGrad)" strokeWidth={2.5} dot={false} strokeDasharray="5 3" connectNulls={false} />
                </ComposedChart>
            </ResponsiveContainer>
            {data?.forecast && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {data.forecast.slice(0, 5).map((f, i) => (
                        <div key={i} className="card py-2 px-3 text-center">
                            <p className="text-xs text-slate-500">{(f.date || f.label || '').slice(5)}</p>
                            <p className={`text-lg font-bold ${f.predicted_rate >= 85 ? 'text-green-400' : f.predicted_rate >= 75 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {f.predicted_rate?.toFixed(1)}%
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ARIMAChart({ data, loading, error }) {
    if (error && !loading) return (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-red-300 font-medium">{error}</p>
        </div>
    );

    const chartData = [];
    let maxVal = null, minVal = null;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    let n = 0;

    const addPoint = (label, actual, mean, ci_lower, ci_upper) => {
        const val = actual !== null ? actual : mean;
        if (val !== null) {
            if (!maxVal || val > maxVal.val) maxVal = { label, val };
            if (!minVal || val < minVal.val) minVal = { label, val };
            sumX += n; sumY += val; sumXY += n * val; sumXX += n * n;
            n++;
        }
        chartData.push({ label, actual, mean, ci_lower, ci_upper, combined: val });
    };

    if (data?.historical) data.historical.forEach(h => addPoint(h.label, h.rate, null, null, null));
    if (data?.forecast) data.forecast.forEach(f => addPoint(f.label, null, f.mean, f.ci_lower, f.ci_upper));

    const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) : 0;
    const intercept = n > 1 ? (sumY - slope * sumX) / n : 0;

    chartData.forEach((dp, i) => {
        if (dp.combined !== null) dp.trend = slope * i + intercept;
    });

    return loading ? <ChartSkeleton /> : (
        <div>
            {data && (
                <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
                    {data.fromCache && <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" />Cached</span>}
                    {data.order && <span>Order: ARIMA({data.order?.join(',')})</span>}
                    {data.converged === false && <span className="text-yellow-400">⚠ Linear fallback used</span>}
                </div>
            )}
            <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={chartData}>
                    <defs>
                        <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 9 }} tickLine={false} interval={2} />
                    <YAxis domain={[60, 100]} ticks={[60, 70, 80, 90, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                    <ReferenceLine x={data?.historical?.[data.historical.length - 1]?.label} stroke="#475569" strokeDasharray="4 2" />

                    <Line type="linear" dataKey="trend" name="Overall Trend" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} />

                    <Area type="linear" dataKey="ci_upper" fill="url(#ciGrad)" stroke="transparent" name="CI Upper (80%)" legendType="none" connectNulls={false} />
                    <Area type="linear" dataKey="ci_lower" fill="#0f172a" stroke="transparent" name="CI Lower (80%)" legendType="none" connectNulls={false} />
                    <Line type="linear" dataKey="actual" name="Historical Rate" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls={false} />
                    <Line type="linear" dataKey="mean" name="ARIMA Forecast" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3, fill: '#06b6d4' }} strokeDasharray="6 3" connectNulls={false} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

function StudentForecast() {
    const [studentId, setStudentId] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!studentId.trim()) return;
        setLoading(true); setError(''); setData(null);
        try {
            const res = await fetchStudentForecast(studentId.trim(), 6);
            setData(res);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const chartData = [
        ...(data?.historical || []).map(h => ({ label: h.label, actual: h.rate, mean: null })),
        ...(data?.forecast || []).map(f => ({ label: f.label, actual: null, mean: f.mean, ci_lower: f.ci_lower, ci_upper: f.ci_upper })),
    ];

    return (
        <div className="card space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" />Per-Student ARIMA Forecast
            </h3>
            <p className="text-slate-500 text-xs">Enter a student ID to forecast their next 6 months of attendance</p>
            <div className="flex gap-2">
                <input
                    type="text" placeholder="e.g. STU_001"
                    value={studentId} onChange={e => setStudentId(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    className="input-field flex-1"
                />
                <button onClick={handleSearch} disabled={loading} className="btn-primary disabled:opacity-50">
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Forecast
                </button>
            </div>

            {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-300">
                    {error}
                </div>
            )}

            {!loading && !error && data && (
                <ResponsiveContainer width="100%" height={240}>
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} interval={1} />
                        <YAxis domain={[60, 100]} ticks={[60, 70, 80, 90, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} unit="%" />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="linear" dataKey="actual" name="Historical" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        <Line type="linear" dataKey="mean" name="Forecast" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} strokeDasharray="5 3" />
                    </ComposedChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default function Forecasting() {
    const [activeTab, setActiveTab] = useState('lstm');
    const [lstm, setLstm] = useState(null);
    const [arima, setArima] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lstmError, setLstmError] = useState('');
    const [arimaError, setArimaError] = useState('');
    const [status, setStatus] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        setLoading(true);
        setLstmError('');
        setArimaError('');
        try {
            const [l, a, s] = await Promise.all([
                fetchGlobalLSTM(30),
                fetchGlobalARIMA(12),
                fetchForecastHealth()
            ]);
            setLstm(l);
            setArima(a);
            setStatus(s);
        } catch (err) {
            setLstmError(err.response?.data?.error || err.message || 'Error fetching LSTM');
            setArimaError(err.response?.data?.error || err.message || 'Error fetching ARIMA');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshForecasts();
            await load();
        } catch (err) {
            setLstmError(err.response?.data?.error || err.message || 'Error refreshing models');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold gradient-text">AI Forecasting</h1>
                    <p className="text-slate-400 text-sm mt-1">LSTM and ARIMA models predicting future attendance</p>
                </div>
                <div className="flex items-center gap-3">
                    <MLStatusBadge status={status} />
                    <button onClick={handleRefresh} disabled={refreshing} className="btn-primary">
                        {refreshing ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Refresh Models
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {[
                    { id: 'lstm', label: 'LSTM (Daily)', icon: Brain },
                    { id: 'arima', label: 'ARIMA (Monthly)', icon: TrendingUp },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                    >
                        <t.icon className="w-4 h-4" /> {t.label}
                        {activeTab === t.id && <ChevronDown className="w-4 h-4" />}
                    </button>
                ))}
            </div>

            <div className="card">
                {activeTab === 'lstm' ? (
                    <LSTMChart data={lstm} loading={loading} error={lstmError} />
                ) : (
                    <ARIMAChart data={arima} loading={loading} error={arimaError} />
                )}
            </div>

            <StudentForecast />
        </div>
    );
}
