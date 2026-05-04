import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Sparkles, GraduationCap, Clock, BookOpen, Monitor, Target,
  Loader2, AlertCircle, Award, Calculator, ArrowRight, History,
  Brain, Shield, ChevronRight, Lightbulb, BarChart3, RefreshCw
} from 'lucide-react';
import RiskGauge from '../components/RiskGauge';
import HighRiskAlert from '../components/HighRiskAlert';
import Recommendations from '../components/Recommendations';
import PredictionHistory from '../components/PredictionHistory';

const API_URL = import.meta.env.VITE_RISK_API_URL || 'http://localhost:5002';

const sliderFields = [
  {
    key: 'attendance', label: 'Attendance Rate', unit: '%',
    icon: GraduationCap, min: 0, max: 100, step: 1, default: 0,
    desc: 'Percentage of classes attended',
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
  },
  {
    key: 'study_hours', label: 'Study Hours / Week', unit: 'hrs',
    icon: Clock, min: 0, max: 40, step: 0.5, default: 0,
    desc: 'Total weekly study hours outside class',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
  },
  {
    key: 'homework_rate', label: 'Homework Completion', unit: '%',
    icon: BookOpen, min: 0, max: 100, step: 1, default: 0,
    desc: 'Percentage of homework completed on time',
    gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
  },
  {
    key: 'screen_time', label: 'Screen Time / Day', unit: 'hrs',
    icon: Monitor, min: 0, max: 12, step: 0.5, default: 0,
    desc: 'Daily recreational screen time',
    gradient: 'linear-gradient(135deg, #ef4444, #f43f5e)',
  },
  {
    key: 'study_consistency', label: 'Study Consistency', unit: '%',
    icon: Target, min: 0, max: 100, step: 1, default: 0,
    desc: 'How regularly the student studies',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
  },
];

const tabs = [
  { id: 'overview', label: 'Overview', icon: Shield },
  { id: 'recommend', label: 'Recommendations', icon: Lightbulb },
  { id: 'history', label: 'History', icon: History },
];

export default function RiskPredictorPage() {
  const [grade8, setGrade8] = useState(0);
  const [grade9, setGrade9] = useState(0);
  const [grade10, setGrade10] = useState(0);
  const [values, setValues] = useState(
    Object.fromEntries(sliderFields.map(f => [f.key, f.default]))
  );

  const [result, setResult] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const overallAverage = useMemo(() => {
    return Math.round(((grade8 + grade9 + grade10) / 3) * 10) / 10;
  }, [grade8, grade9, grade10]);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (result) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [result]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_URL}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: Number(val) }));
  };

  const handlePredict = useCallback(async () => {
    setLoading(true);
    setError(null);

    const formData = {
      ...values,
      avg_marks: overallAverage,
      grade8_marks: grade8,
      grade9_marks: grade9,
      grade10_marks: grade10,
    };

    try {
      const predictRes = await fetch(`${API_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!predictRes.ok) {
        const errData = await predictRes.json();
        throw new Error(errData.error || 'Prediction failed');
      }

      const predictionData = await predictRes.json();
      setResult(predictionData);
      setActiveTab('overview');

      const recRes = await fetch(`${API_URL}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          risk_level: predictionData.risk_level,
        }),
      });

      if (recRes.ok) {
        const recData = await recRes.json();
        setRecommendations(recData.recommendations || []);
      }

      fetchHistory();
    } catch (err) {
      setError(err.message || 'Failed to connect to the prediction server.');
    } finally {
      setLoading(false);
    }
  }, [values, overallAverage, grade8, grade9, grade10]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handlePredict();
  };

  const handleNewPrediction = () => {
    setResult(null);
    setRecommendations([]);
    setError(null);
  };

  const handleReset = () => {
    setGrade8(0);
    setGrade9(0);
    setGrade10(0);
    setValues(Object.fromEntries(sliderFields.map(f => [f.key, f.default])));
  };

  const avgColor = overallAverage >= 70 ? '#10b981' : overallAverage >= 50 ? '#f59e0b' : '#ef4444';
  const gradeColor = (val) => val >= 70 ? '#10b981' : val >= 50 ? '#f59e0b' : '#ef4444';
  const gradeSliderBg = (val) => `linear-gradient(to right, ${gradeColor(val)} ${val}%, #e2e8f0 ${val}%)`;

  if (result) {
    const risk = result.risk_level;
    const recs = recommendations.length > 0 ? recommendations : (result.recommendations || []);

    return (
      <div className="min-h-screen pt-8 ml-64 page-container animate-fade-in">
        <div className="w-full max-w-6xl px-8 mx-auto">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <span className="badge badge-green" style={{ width: 'fit-content' }}>
              <Sparkles size={12} />
              AI-Powered
            </span>
            <div>
              <h2 style={{ marginBottom: 4 }}>Risk Assessment Results</h2>
              <p style={{ margin: 0 }}>AI-powered analysis complete. Review insights below.</p>
            </div>
          </div>
          <button onClick={handleNewPrediction} className="btn-primary">
            <RefreshCw size={16} />
            New Prediction
          </button>
        </div>

        {risk === 'High' && <HighRiskAlert result={result} recommendations={recs} />}

        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div key={activeTab} className="animate-fade-in">
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
                <RiskGauge result={result} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[
                      { label: 'Low Risk', prob: result.probabilities.low, color: '#10b981', bg: '#ecfdf5' },
                      { label: 'Medium Risk', prob: result.probabilities.medium, color: '#f59e0b', bg: '#fffbeb' },
                      { label: 'High Risk', prob: result.probabilities.high, color: '#ef4444', bg: '#fef2f2' },
                    ].map(p => (
                      <div key={p.label} className="card card-sm" style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{p.label}</p>
                        <p style={{ fontSize: 28, fontWeight: 800, color: p.color }}>
                          {(p.prob * 100).toFixed(1)}%
                        </p>
                        <div className="progress-bar" style={{ marginTop: 8 }}>
                          <div className="progress-fill" style={{ width: `${p.prob * 100}%`, background: p.color }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="card card-sm">
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BarChart3 size={16} color="#3b82f6" />
                      Academic Summary
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
                      {[
                        { label: 'Grade 8', val: result.input_summary.grade8_marks, color: '#3b82f6' },
                        { label: 'Grade 9', val: result.input_summary.grade9_marks, color: '#8b5cf6' },
                        { label: 'Grade 10', val: result.input_summary.grade10_marks, color: '#f43f5e' },
                        { label: 'Overall Avg', val: result.input_summary.avg_marks, color: gradeColor(result.input_summary.avg_marks), highlight: true },
                      ].map(g => (
                        <div key={g.label} style={{
                          padding: 10, borderRadius: 10, textAlign: 'center',
                          background: g.highlight ? `${g.color}08` : '#f8fafc',
                          border: `1px solid ${g.highlight ? `${g.color}20` : '#e2e8f0'}`,
                        }}>
                          <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>{g.label}</p>
                          <p style={{ fontSize: 22, fontWeight: 800, color: g.color }}>{g.val}%</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {[
                        { label: 'Attendance', val: `${result.input_summary.attendance}%`, good: result.input_summary.attendance >= 75 },
                        { label: 'Study Hours', val: `${result.input_summary.study_hours}h/wk`, good: result.input_summary.study_hours >= 10 },
                        { label: 'Homework', val: `${result.input_summary.homework_rate}%`, good: result.input_summary.homework_rate >= 70 },
                        { label: 'Screen Time', val: `${result.input_summary.screen_time}h/day`, good: result.input_summary.screen_time <= 4 },
                        { label: 'Consistency', val: `${result.input_summary.study_consistency}%`, good: result.input_summary.study_consistency >= 50 },
                      ].map(item => (
                        <div key={item.label} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0',
                        }}>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>{item.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: item.good ? '#10b981' : '#ef4444' }}>
                            {item.val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card card-sm animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Target size={16} color="#f59e0b" />
                      Target Goals to Reduce Risk
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(() => {
                        const targets = [];
                        const summary = result.input_summary;
                        if (summary.attendance < 80) targets.push({ label: 'Attendance', cur: summary.attendance, tar: 80, unit: '%', color: '#10b981' });
                        if (summary.homework_rate < 80) targets.push({ label: 'Homework Rate', cur: summary.homework_rate, tar: 80, unit: '%', color: '#3b82f6' });
                        if (summary.study_hours < 12) targets.push({ label: 'Study Hours', cur: summary.study_hours, tar: 12, unit: 'h/wk', color: '#8b5cf6' });
                        if (summary.screen_time > 4) targets.push({ label: 'Screen Time', cur: summary.screen_time, tar: 3, unit: 'h/day', color: '#ef4444', isReverse: true });
                        if (summary.avg_marks < 65) targets.push({ label: 'Average Marks', cur: summary.avg_marks, tar: 65, unit: '%', color: '#f59e0b' });

                        if (targets.length === 0) {
                          return (
                            <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 8, textAlign: 'center', color: '#166534', fontSize: 13 }}>
                              <p style={{ fontWeight: 600 }}>Great job!</p>
                              <p>All metrics are at healthy levels.</p>
                            </div>
                          );
                        }

                        return targets.slice(0, 4).map((t, i) => (
                          <div key={i} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{t.label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 12, color: '#64748b' }}>{t.cur}{t.unit}</span>
                              <ArrowRight size={14} color="#94a3b8" />
                              <span style={{ fontSize: 13, fontWeight: 700, color: t.color }}>{t.tar}{t.unit}</span>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recommend' && (
            <Recommendations recommendations={recs} riskLevel={risk} />
          )}

          {activeTab === 'history' && (
            <PredictionHistory history={history} loading={historyLoading} />
          )}
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 ml-64 page-container animate-fade-in-up">
      <div className="w-full max-w-6xl px-8 mx-auto">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span className="badge badge-green">
            <Sparkles size={12} />
            AI-Powered
          </span>
        </div>
        <h2>Risk Predictor</h2>
        <p>Enter student data below our ML model analyzes </p>
      </div>

      {error && (
        <div className="alert-banner alert-banner-red" style={{ marginBottom: 20 }}>
          <AlertCircle size={20} color="#dc2626" />
          <div>
            <p style={{ fontWeight: 600, color: '#dc2626', fontSize: 14 }}>Connection Error</p>
            <p style={{ color: '#9b1c1c', fontSize: 13, marginTop: 2 }}>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
            }}>
              <Award className="text-white" size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Academic Performance by Grade</h3>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Enter average marks for each grade overall average is auto-calculated</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
            {[
              { label: 'Grade 8', value: grade8, setter: setGrade8, color: '#3b82f6', num: '8' },
              { label: 'Grade 9', value: grade9, setter: setGrade9, color: '#8b5cf6', num: '9' },
              { label: 'Grade 10', value: grade10, setter: setGrade10, color: '#f43f5e', num: '10' },
            ].map(g => (
              <div key={g.label} className="hover-lift" style={{
                padding: 16, borderRadius: 12, background: '#f8fafc',
                border: `1px solid ${g.value >= 70 ? '#d1fae5' : g.value >= 50 ? '#fef3c7' : '#fecaca'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: `${g.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: g.color,
                    }}>{g.num}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{g.label}</span>
                  </div>
                </div>
                <input
                  type="number"
                  min={0} max={100} step={1}
                  value={g.value}
                  onChange={(e) => g.setter(Math.min(100, Math.max(0, Number(e.target.value))))}
                  style={{
                    width: '100%', fontSize: 32, fontWeight: 800, background: 'transparent',
                    border: 'none', outline: 'none', color: gradeColor(g.value),
                    fontFamily: 'inherit',
                  }}
                />
                <input
                  type="range" min={0} max={100} step={1}
                  value={g.value}
                  onChange={(e) => g.setter(Number(e.target.value))}
                  style={{ width: '100%', marginTop: 8, cursor: 'pointer', background: gradeSliderBg(g.value) }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>0%</span>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>100%</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            padding: 16, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: `${avgColor}08`, border: `1px solid ${avgColor}20`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: '#f8fafc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Calculator size={20} color="#475569" />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Overall Average</p>
                <p style={{ fontSize: 11, color: '#94a3b8' }}>Auto-calculated from Grade 8 + 9 + 10</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 32, fontWeight: 900, color: avgColor }}>{overallAverage}%</p>
              <p style={{ fontSize: 10, color: '#94a3b8' }}>({grade8} + {grade9} + {grade10}) ÷ 3</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
          {sliderFields.map((field, idx) => {
            const Icon = field.icon;
            const val = values[field.key];
            const pct = ((val - field.min) / (field.max - field.min)) * 100;
            const sliderColor = field.key === 'screen_time'
              ? (pct > 50 ? '#ef4444' : '#10b981')
              : (pct < 30 ? '#ef4444' : pct < 60 ? '#f59e0b' : '#10b981');

            return (
              <div key={field.key} className={`card hover-lift animate-fade-in-up stagger-${idx + 1}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: field.gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                    }}>
                      <Icon className="text-white" size={18} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'block' }}>
                        {field.label}
                      </label>
                      <p style={{ fontSize: 11, color: '#94a3b8' }}>{field.desc}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <input
                      type="number"
                      min={field.min} max={field.max} step={field.step}
                      value={val}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      style={{
                        width: 56, textAlign: 'right', fontSize: 18, fontWeight: 700,
                        background: 'transparent', border: 'none', outline: 'none',
                        color: '#0f172a', fontFamily: 'inherit',
                      }}
                    />
                    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{field.unit}</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={field.min} max={field.max} step={field.step}
                  value={val}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  style={{
                    width: '100%', cursor: 'pointer',
                    background: `linear-gradient(to right, ${sliderColor} ${pct}%, #e2e8f0 ${pct}%)`,
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>{field.min}{field.unit}</span>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>{field.max}{field.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-blue"
            style={{ fontSize: 15, padding: '14px 32px' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Loader2 size={18} className="animate-spin" />
                Analyzing with ML Model...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} />
                Predict Risk Level
                <ArrowRight size={16} />
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary"
          >
            Reset to Defaults
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
