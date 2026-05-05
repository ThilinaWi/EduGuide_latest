import React, { useState } from 'react';
import axios from 'axios';
import { Activity, AlertCircle, CheckCircle, Heart } from 'lucide-react';
import client from '../api/client';
import Layout from './Layout';

const STRESS_API_URL = import.meta.env.VITE_STRESS_API_URL || 'http://localhost:5003';

const inputFields = [
  { name: 'term_mark_avg', label: 'Term Mark Avg', min: 0, max: 100, step: 1 },
  { name: 'prev_term_mark_avg', label: 'Prev Term Mark Avg', min: 0, max: 100, step: 1 },
  { name: 'daily_study', label: 'Daily Study (hours)', min: 0, max: 12, step: 0.5 },
  { name: 'prefer_study', label: 'Preferred Study (hours)', min: 0, max: 12, step: 0.5 },
  { name: 'travel_time', label: 'Travel Time (hours)', min: 0, max: 10, step: 1 },
  { name: 'financial_status', label: 'Financial Status (0-10)', min: 0, max: 10, step: 1 },
  { name: 'social_media', label: 'Social Media (hours/day)', min: 0, max: 12, step: 0.5 },
  { name: 'sleep_hours', label: 'Sleep Hours', min: 0, max: 12, step: 0.5 },
  { name: 'attendance', label: 'Attendance (%)', min: 0, max: 100, step: 1 },
  { name: 'tuition_hours_per_week', label: 'Tuition Hours / Week', min: 0, max: 40, step: 1 },
  { name: 'disaster_impact', label: 'Disaster Impact (0-10)', min: 0, max: 10, step: 1 },
];

const StressPrediction = () => {
  const [formData, setFormData] = useState(
    Object.fromEntries(inputFields.map((field) => [field.name, '']))
  );

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : Number(value),
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const missingFields = [];
    const invalidFields = [];

    inputFields.forEach((field) => {
      const value = formData[field.name];
      if (value === '') {
        missingFields.push(field.label);
      } else if (Number.isNaN(Number(value)) || value < field.min || value > field.max) {
        invalidFields.push(field.label);
      }
    });

    if (missingFields.length > 0 || invalidFields.length > 0) {
      const parts = [];
      if (missingFields.length > 0) {
        parts.push(`Please fill in: ${missingFields.join(', ')}`);
      }
      if (invalidFields.length > 0) {
        parts.push(`Out of range: ${invalidFields.join(', ')}`);
      }
      setError(parts.join('. '));
      setLoading(false);
      return;
    }

    const payload = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, Number(value)])
    );

    try {
      const direct = await axios.post(`${STRESS_API_URL}/api/predict`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      setResult(direct.data);
      setError(null);
    } catch (err) {
      try {
        const response = await client.post('/api/stress/api/predict', payload);
        setResult(response.data);
        setError(null);
      } catch (fallbackErr) {
        setError(
          fallbackErr.response?.data?.error ||
          fallbackErr.response?.data?.detail ||
          err.response?.data?.error ||
          err.response?.data?.detail ||
          'Failed to predict stress level'
        );
        console.error('Error:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStressColor = (stressLevel) => {
    if (!stressLevel) return 'bg-slate-50 text-slate-700 border border-slate-200';
    const level = stressLevel.toLowerCase();
    if (level.includes('high')) return 'bg-red-50 text-red-700 border border-red-200';
    if (level.includes('medium')) return 'bg-amber-50 text-amber-700 border border-amber-200';
    if (level.includes('low')) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    return 'bg-sky-50 text-sky-700 border border-sky-200';
  };

  return (
    <Layout title="Stress Prediction">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity size={32} className="text-emerald-500" />
            <h1 className="text-4xl font-bold text-slate-900">Stress Prediction & Wellness</h1>
          </div>
          <p className="text-slate-500">Predict stress levels and get personalized wellness recommendations</p>
        </div>

        {/* Form */}
        <div className="p-8 mb-8 bg-white border shadow-sm border-slate-200 rounded-2xl">
          <form onSubmit={handlePredict} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {inputFields.map(field => (
                <div key={field.name}>
                  <label className="block mb-2 text-sm font-medium text-slate-700">
                    {field.label}
                  </label>
                  <input
                    type="number"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    placeholder=""
                    className="w-full px-4 py-2 bg-white border rounded-lg border-slate-200 text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-bold text-white transition-colors rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200"
            >
              {loading ? 'Analyzing...' : 'Predict Stress Level'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 mb-8 border border-red-200 rounded-lg bg-red-50">
            <AlertCircle size={20} className="text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Stress Level Card */}
            <div className={`${getStressColor(result.stress_level)} rounded-2xl p-8`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70">Stress Level</p>
                  <h2 className="text-4xl font-bold">{result.stress_level}</h2>
                </div>
                <Heart size={48} className="opacity-30" />
              </div>
            </div>

            {/* Confidence Score */}
            {result.confidence && (
              <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                <p className="mb-2 text-slate-600">Prediction Confidence</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-2xl font-bold text-emerald-600">{(result.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            )}

            {/* Wellness Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                <h3 className="mb-4 text-lg font-bold text-slate-900">Wellness Recommendations</h3>
                <ul className="space-y-3">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-4 border rounded-lg bg-slate-50 border-slate-200">
                      <CheckCircle size={20} className="flex-shrink-0 mt-1 text-emerald-500" />
                      <span className="text-slate-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Input Summary */}
            {result.input_summary && (
              <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                <h3 className="mb-4 text-lg font-bold text-slate-900">Your Input Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(result.input_summary).map(([key, value]) => (
                    <div key={key} className="p-3 border rounded-lg bg-slate-50 border-slate-200">
                      <p className="text-sm capitalize text-slate-500">{key.replace(/_/g, ' ')}</p>
                      <p className="text-xl font-bold text-slate-800">{typeof value === 'number' ? value.toFixed(1) : value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StressPrediction;
