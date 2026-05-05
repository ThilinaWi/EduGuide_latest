import { useState, useEffect } from 'react';
import { fetchMonthlySummary, fetchDayOfWeek, fetchWeatherCorrelation } from '../services/attendanceApi';
import {
    LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { Cloud, Calendar, Sun, TrendingUp } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEATHER_COLORS = { Sunny: '#f59e0b', Cloudy: '#94a3b8', Rainy: '#3b82f6', Stormy: '#6366f1', Foggy: '#64748b', Snowy: '#e2e8f0', Windy: '#06b6d4' };

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl text-xs">
            <p className="font-semibold text-slate-300 mb-2">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="flex justify-between gap-4">
                    <span>{p.name}:</span>
                    <span className="font-bold">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}{p.name?.includes('Rate') || p.name?.includes('rate') ? '%' : ''}</span>
                </p>
            ))}
        </div>
    );
};

export default function AttendanceTrends() {
    const [monthly, setMonthly] = useState([]);
    const [dayOfWeek, setDayOfWeek] = useState([]);
    const [weather, setWeather] = useState([]);
    const [yearFilter, setYearFilter] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetchMonthlySummary(), fetchDayOfWeek(), fetchWeatherCorrelation()])
            .then(([m, d, w]) => {
                setMonthly(m.map(r => ({
                    name: `${MONTHS[(r._id.month || 1) - 1]} '${String(r._id.year).slice(2)}`,
                    rate: parseFloat(r.attendance_rate?.toFixed(1) || 0),
                    present: r.present,
                    absent: r.absent,
                    total: r.total,
                    year: r._id.year,
                    month: r._id.month,
                })));
                const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                setDayOfWeek(DAY_ORDER.map(day => {
                    const found = d.find(x => x._id === day);
                    return { day: day.slice(0, 3), rate: parseFloat(found?.attendance_rate?.toFixed(1) || 0), total: found?.total || 0 };
                }));
                setWeather(w.slice(0, 8).map(r => ({
                    condition: r._id || 'Unknown',
                    rate: parseFloat(r.attendance_rate?.toFixed(1) || 0),
                    total: r.total,
                    avg_temp: parseFloat(r.avg_temp?.toFixed(1) || 0),
                })));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const years = [...new Set(monthly.map(m => m.year))].sort();
    const filteredMonthly = yearFilter ? monthly.filter(m => m.year === parseInt(yearFilter)) : monthly;

    let maxM = null, minM = null;
    if (filteredMonthly.length > 0) {
        maxM = filteredMonthly[0];
        minM = filteredMonthly[0];
    }

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const n = filteredMonthly.length;

    const chartData = filteredMonthly.map((m, i) => {
        if (m.rate > maxM.rate) maxM = m;
        if (m.rate < minM.rate) minM = m;

        sumX += i; sumY += m.rate; sumXY += i * m.rate; sumXX += i * i;

        const dp = { ...m, name: `${MONTHS[m.month - 1]} '${String(m.year).slice(2)}` };
        dp[`rate_${m.year}`] = m.rate;

        if (i > 0 && filteredMonthly[i - 1].year !== m.year) {
            dp[`rate_${filteredMonthly[i - 1].year}`] = m.rate;
        }
        return dp;
    });

    const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) : 0;
    const intercept = n > 1 ? (sumY - slope * sumX) / n : (n === 1 ? sumY : 0);

    chartData.forEach((dp, i) => {
        dp.trend = slope * i + intercept;
    });

    const YEAR_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold gradient-text">Trends & Analytics</h1>
                <p className="text-slate-400 text-sm mt-1">Deep dive into attendance patterns, weather impacts, and weekly trends</p>
            </div>

            <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-blue-400" />
                <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="input-field w-40">
                    <option value="">All Years</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <span className="text-slate-500 text-sm">{filteredMonthly.length} months of data</span>
            </div>

            <div className="card">
                <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />Monthly Attendance Details
                </h3>
                <p className="text-slate-500 text-xs mb-4">Present vs absent counts and overall rate</p>
                {loading ? (
                    <div className="h-64 rounded-xl bg-slate-700/40 shimmer" />
                ) : filteredMonthly.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-slate-500 text-sm">No monthly data. Run the seed script first.</div>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} interval="preserveStartEnd" />
                            <YAxis
                                domain={[60, 100]}
                                ticks={[60, 70, 80, 90, 100]}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                tickLine={false}
                                unit="%"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />

                            <Line type="linear" dataKey="trend" name="Overall Trend" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} />

                            {years.map((year, i) => {
                                if (yearFilter && parseInt(yearFilter) !== year) return null;
                                return (
                                    <Line
                                        key={year}
                                        type="linear"
                                        dataKey={`rate_${year}`}
                                        name={`Attendance ${year}`}
                                        stroke={YEAR_COLORS[i % YEAR_COLORS.length]}
                                        strokeWidth={3}
                                        dot={{ r: 3, fill: YEAR_COLORS[i % YEAR_COLORS.length], strokeWidth: 0 }}
                                        activeDot={{ r: 5 }}
                                        connectNulls={false}
                                    />
                                );
                            })}

                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400" />Attendance by Day of Week
                    </h3>
                    <p className="text-slate-500 text-xs mb-4">Which days have the best attendance?</p>
                    {loading ? (
                        <div className="h-52 rounded-xl bg-slate-700/40 shimmer" />
                    ) : dayOfWeek.every(d => d.rate === 0) ? (
                        <div className="h-52 flex items-center justify-center text-slate-500 text-sm">No data available.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <RadarChart data={dayOfWeek}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <PolarRadiusAxis domain={[80, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                                <Radar name="Attendance Rate" dataKey="rate" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                                <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="card">
                    <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-cyan-400" />Weather vs Attendance
                    </h3>
                    <p className="text-slate-500 text-xs mb-4">How weather conditions affect student presence</p>
                    {loading ? (
                        <div className="h-52 rounded-xl bg-slate-700/40 shimmer" />
                    ) : weather.length === 0 ? (
                        <div className="h-52 flex items-center justify-center text-slate-500 text-sm">No weather data available.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={weather}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="condition" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} />
                                <YAxis domain={[70, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} unit="%" />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="rate" name="Attendance Rate" radius={[6, 6, 0, 0]}>
                                    {weather.map((d, i) => (
                                        <Cell key={i} fill={WEATHER_COLORS[d.condition] || '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                    {!loading && weather.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {weather.map(w => (
                                <span key={w.condition} className="flex items-center gap-1.5 text-xs text-slate-400">
                                    <Sun className="w-3 h-3" style={{ color: WEATHER_COLORS[w.condition] || '#3b82f6' }} />
                                    {w.condition} ({w.rate}%)
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
