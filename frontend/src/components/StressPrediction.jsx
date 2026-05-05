// import React, { useState } from 'react';
// import axios from 'axios';
// import { Activity, AlertCircle, CheckCircle, Heart } from 'lucide-react';
// import client from '../api/client';
// import Layout from './Layout';

// const STRESS_API_URL = import.meta.env.VITE_STRESS_API_URL || 'http://localhost:5003';

// const inputFields = [
//   { name: 'term_mark_avg', label: 'Term Mark Avg', min: 0, max: 100, step: 1 },
//   { name: 'prev_term_mark_avg', label: 'Prev Term Mark Avg', min: 0, max: 100, step: 1 },
//   { name: 'daily_study', label: 'Daily Study (hours)', min: 0, max: 12, step: 0.5 },
//   { name: 'prefer_study', label: 'Preferred Study (hours)', min: 0, max: 12, step: 0.5 },
//   { name: 'travel_time', label: 'Travel Time (hours)', min: 0, max: 10, step: 1 },
//   { name: 'financial_status', label: 'Financial Status (0-10)', min: 0, max: 10, step: 1 },
//   { name: 'social_media', label: 'Social Media (hours/day)', min: 0, max: 12, step: 0.5 },
//   { name: 'sleep_hours', label: 'Sleep Hours', min: 0, max: 12, step: 0.5 },
//   { name: 'attendance', label: 'Attendance (%)', min: 0, max: 100, step: 1 },
//   { name: 'tuition_hours_per_week', label: 'Tuition Hours / Week', min: 0, max: 40, step: 1 },
// ];

// const StressPrediction = () => {
//   const [formData, setFormData] = useState(
//     Object.fromEntries(inputFields.map((field) => [field.name, '']))
//   );

//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value === '' ? '' : Number(value),
//     }));
//   };

//   const handlePredict = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     const missingFields = [];
//     const invalidFields = [];

//     inputFields.forEach((field) => {
//       const value = formData[field.name];
//       if (value === '') {
//         missingFields.push(field.label);
//       } else if (Number.isNaN(Number(value)) || value < field.min || value > field.max) {
//         invalidFields.push(field.label);
//       }
//     });

//     if (missingFields.length > 0 || invalidFields.length > 0) {
//       const parts = [];
//       if (missingFields.length > 0) {
//         parts.push(`Please fill in: ${missingFields.join(', ')}`);
//       }
//       if (invalidFields.length > 0) {
//         parts.push(`Out of range: ${invalidFields.join(', ')}`);
//       }
//       setError(parts.join('. '));
//       setLoading(false);
//       return;
//     }

//     const payload = Object.fromEntries(
//       Object.entries(formData).map(([key, value]) => [key, Number(value)])
//     );

//     try {
//       const direct = await axios.post(`${STRESS_API_URL}/api/predict`, payload, {
//         headers: { 'Content-Type': 'application/json' },
//       });
//       setResult(direct.data);
//       setError(null);
//     } catch (err) {
//       try {
//         const response = await client.post('/api/stress/api/predict', payload);
//         setResult(response.data);
//         setError(null);
//       } catch (fallbackErr) {
//         setError(
//           fallbackErr.response?.data?.error ||
//           fallbackErr.response?.data?.detail ||
//           err.response?.data?.error ||
//           err.response?.data?.detail ||
//           'Failed to predict stress level'
//         );
//         console.error('Error:', fallbackErr);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStressColor = (stressLevel) => {
//     if (!stressLevel) return 'bg-slate-50 text-slate-700 border border-slate-200';
//     const level = stressLevel.toLowerCase();
//     if (level.includes('high')) return 'bg-red-50 text-red-700 border border-red-200';
//     if (level.includes('medium')) return 'bg-amber-50 text-amber-700 border border-amber-200';
//     if (level.includes('low')) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
//     return 'bg-sky-50 text-sky-700 border border-sky-200';
//   };

//   return (
//     <Layout title="Stress Prediction">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center gap-3 mb-2">
//             <Activity size={32} className="text-emerald-500" />
//             <h1 className="text-4xl font-bold text-slate-900">Stress Prediction & Wellness</h1>
//           </div>
//           <p className="text-slate-500">Predict stress levels and get personalized wellness recommendations</p>
//         </div>

//         {/* Form */}
//         <div className="p-8 mb-8 bg-white border shadow-sm border-slate-200 rounded-2xl">
//           <form onSubmit={handlePredict} className="space-y-6">
//             <div className="grid grid-cols-2 gap-6">
//               {inputFields.map(field => (
//                 <div key={field.name}>
//                   <label className="block mb-2 text-sm font-medium text-slate-700">
//                     {field.label}
//                   </label>
//                   <input
//                     type="number"
//                     name={field.name}
//                     value={formData[field.name]}
//                     onChange={handleInputChange}
//                     min={field.min}
//                     max={field.max}
//                     step={field.step}
//                     placeholder=""
//                     className="w-full px-4 py-2 bg-white border rounded-lg border-slate-200 text-slate-800 focus:border-emerald-500 focus:outline-none"
//                   />
//                 </div>
//               ))}
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 font-bold text-white transition-colors rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200"
//             >
//               {loading ? 'Analyzing...' : 'Predict Stress Level'}
//             </button>
//           </form>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="flex items-center gap-3 p-4 mb-8 border border-red-200 rounded-lg bg-red-50">
//             <AlertCircle size={20} className="text-red-600" />
//             <span className="text-red-700">{error}</span>
//           </div>
//         )}

//         {/* Results */}
//         {result && (
//           <div className="space-y-6">
//             {/* Stress Level Card */}
//             <div className={`${getStressColor(result.stress_level)} rounded-2xl p-8`}>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm opacity-70">Stress Level</p>
//                   <h2 className="text-4xl font-bold">{result.stress_level}</h2>
//                 </div>
//                 <Heart size={48} className="opacity-30" />
//               </div>
//             </div>

//             {/* Confidence Score */}
//             {result.confidence && (
//               <div className="p-6 bg-white border border-slate-200 rounded-2xl">
//                 <p className="mb-2 text-slate-600">Prediction Confidence</p>
//                 <div className="flex items-center gap-4">
//                   <div className="flex-1 h-3 overflow-hidden rounded-full bg-slate-100">
//                     <div
//                       className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
//                       style={{ width: `${result.confidence * 100}%` }}
//                     />
//                   </div>
//                   <span className="text-2xl font-bold text-emerald-600">{(result.confidence * 100).toFixed(1)}%</span>
//                 </div>
//               </div>
//             )}

//             {/* Wellness Recommendations */}
//             {result.recommendations && result.recommendations.length > 0 && (
//               <div className="p-6 bg-white border border-slate-200 rounded-2xl">
//                 <h3 className="mb-4 text-lg font-bold text-slate-900">Wellness Recommendations</h3>
//                 <ul className="space-y-3">
//                   {result.recommendations.map((rec, idx) => (
//                     <li key={idx} className="flex items-start gap-3 p-4 border rounded-lg bg-slate-50 border-slate-200">
//                       <CheckCircle size={20} className="flex-shrink-0 mt-1 text-emerald-500" />
//                       <span className="text-slate-700">{rec}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {/* Input Summary */}
//             {result.input_summary && (
//               <div className="p-6 bg-white border border-slate-200 rounded-2xl">
//                 <h3 className="mb-4 text-lg font-bold text-slate-900">Your Input Summary</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   {Object.entries(result.input_summary).map(([key, value]) => (
//                     <div key={key} className="p-3 border rounded-lg bg-slate-50 border-slate-200">
//                       <p className="text-sm capitalize text-slate-500">{key.replace(/_/g, ' ')}</p>
//                       <p className="text-xl font-bold text-slate-800">{typeof value === 'number' ? value.toFixed(1) : value}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default StressPrediction;


// import React, { useState } from 'react';
// import axios from 'axios';
// import {
//   Brain, AlertCircle, CheckCircle, Heart, ChevronRight,
//   BookOpen, Clock, Wallet, Smartphone, Moon, Users,
//   Activity, Sparkles, TrendingUp, TrendingDown,
// } from 'lucide-react';
// import client from '../api/client';
// import Layout from './Layout';

// const STRESS_API_URL = import.meta.env.VITE_STRESS_API_URL || 'http://localhost:5003';

// const C = {
//   green:     '#1E9E72',
//   greenDark: '#0F7A55',
//   greenDeep: '#085c3f',
//   accent:    '#2ECC9A',
//   mint:      '#EAF7F2',
//   mintMid:   '#C6EEE0',
//   white:     '#FFFFFF',
//   text:      '#0F2920',
//   muted:     '#4a7a65',
//   border:    '#C6EEE0',
// };

// const inputFields = [
//   { name: 'term_mark_avg',          label: 'Term Mark Average',        min: 0,  max: 100, step: 1,   unit: '%',   icon: TrendingUp,      group: 'academic' },
//   { name: 'prev_term_mark_avg',     label: 'Previous Term Average',    min: 0,  max: 100, step: 1,   unit: '%',   icon: TrendingDown,    group: 'academic' },
//   { name: 'attendance',             label: 'Attendance Rate',          min: 0,  max: 100, step: 1,   unit: '%',   icon: CheckCircle,     group: 'academic' },
//   { name: 'daily_study',            label: 'Daily Study Hours',        min: 0,  max: 12,  step: 0.5, unit: 'hrs', icon: BookOpen,        group: 'time' },
//   { name: 'prefer_study',           label: 'Preferred Study Hours',    min: 0,  max: 12,  step: 0.5, unit: 'hrs', icon: BookOpen,        group: 'time' },
//   { name: 'tuition_hours_per_week', label: 'Tuition Hours / Week',     min: 0,  max: 40,  step: 1,   unit: 'hrs', icon: Users,           group: 'time' },
//   { name: 'travel_time',            label: 'Travel Time',              min: 0,  max: 10,  step: 1,   unit: 'hrs', icon: Clock,           group: 'time' },
//   { name: 'sleep_hours',            label: 'Sleep Hours',              min: 0,  max: 12,  step: 0.5, unit: 'hrs', icon: Moon,            group: 'lifestyle' },
//   { name: 'social_media',           label: 'Social Media Usage',       min: 0,  max: 12,  step: 0.5, unit: 'hrs', icon: Smartphone,      group: 'lifestyle' },
//   { name: 'financial_status',       label: 'Financial Stability',      min: 0,  max: 10,  step: 1,   unit: '/10', icon: Wallet,          group: 'lifestyle' },
// ];

// const GROUPS = [
//   { key: 'academic',  label: 'Academic Performance' },
//   { key: 'time',      label: 'Time & Schedule' },
//   { key: 'lifestyle', label: 'Lifestyle Factors' },
// ];

// const getStressMeta = (level) => {
//   if (!level) return { color: '#94a3b8', bg: '#f8fafc', label: '—', emoji: '❓', pct: 0, ring: '#e2e8f0' };
//   const l = level.toLowerCase();
//   if (l.includes('high'))   return { color: '#dc2626', bg: '#fef2f2', label: 'High Stress',   emoji: '🔴', pct: 88, ring: '#fca5a5' };
//   if (l.includes('medium')) return { color: '#d97706', bg: '#fffbeb', label: 'Moderate Stress', emoji: '🟡', pct: 52, ring: '#fcd34d' };
//   if (l.includes('low'))    return { color: C.green,   bg: C.mint,    label: 'Low Stress',    emoji: '🟢', pct: 18, ring: C.accent };
//   return                           { color: C.green,   bg: C.mint,    label: level,           emoji: '✅', pct: 30, ring: C.accent };
// };

// const SliderCard = ({ field, value, onChange }) => {
//   const Icon = field.icon;
//   const pct = field.max > field.min ? ((value - field.min) / (field.max - field.min)) * 100 : 0;

//   return (
//     <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: '14px 18px' }}>
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//           <div style={{ width: 28, height: 28, borderRadius: 8, background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//             <Icon size={14} style={{ color: C.green }} />
//           </div>
//           <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{field.label}</span>
//         </div>
//         <span style={{ fontSize: 13, fontWeight: 700, color: C.greenDark, background: C.mint, padding: '2px 10px', borderRadius: 8 }}>
//           {value}{field.unit}
//         </span>
//       </div>
//       <div style={{ height: 5, background: C.mintMid, borderRadius: 99, marginBottom: 4, position: 'relative' }}>
//         <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: `linear-gradient(to right, ${C.accent}, ${C.green})`, borderRadius: 99 }} />
//       </div>
//       <input
//         type="range"
//         name={field.name}
//         value={value}
//         min={field.min} max={field.max} step={field.step}
//         onChange={onChange}
//         style={{ width: '100%', appearance: 'none', WebkitAppearance: 'none', background: 'transparent', height: 16, cursor: 'pointer', marginTop: -2 }}
//       />
//       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//         <span style={{ fontSize: 10, color: C.muted }}>{field.min}{field.unit}</span>
//         <span style={{ fontSize: 10, color: C.muted }}>{field.max}{field.unit}</span>
//       </div>
//     </div>
//   );
// };

// const StressMeter = ({ level, confidence }) => {
//   const meta = getStressMeta(level);
//   const confPct = confidence ? Math.round(confidence * 100) : null;
//   const r = 54;
//   const circ = 2 * Math.PI * r;
//   const dash = (meta.pct / 100) * circ;

//   return (
//     <div style={{ background: meta.bg, border: `2px solid ${meta.ring}`, borderRadius: 24, padding: 28, textAlign: 'center' }}>
//       <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 18 }}>Stress Analysis</p>
//       <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 16 }}>
//         <svg width={130} height={130} style={{ transform: 'rotate(-90deg)' }}>
//           <circle cx={65} cy={65} r={r} fill="none" stroke={C.mintMid} strokeWidth={10} />
//           <circle cx={65} cy={65} r={r} fill="none" stroke={meta.color} strokeWidth={10}
//             strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
//             style={{ transition: 'stroke-dasharray 0.8s ease' }}
//           />
//         </svg>
//         <div style={{ position: 'absolute', textAlign: 'center' }}>
//           <div style={{ fontSize: 24 }}>{meta.emoji}</div>
//           <div style={{ fontSize: 20, fontWeight: 800, color: meta.color }}>{meta.pct}%</div>
//         </div>
//       </div>
//       <h2 style={{ fontSize: 24, fontWeight: 800, color: meta.color, margin: '0 0 4px' }}>{meta.label}</h2>
//       <p style={{ fontSize: 12, color: C.muted, margin: '0 0 16px' }}>AI-predicted classification</p>
//       {confPct && (
//         <>
//           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted, marginBottom: 6 }}>
//             <span>Model Confidence</span>
//             <span style={{ fontWeight: 700, color: C.green }}>{confPct}%</span>
//           </div>
//           <div style={{ height: 6, background: C.mintMid, borderRadius: 99 }}>
//             <div style={{ height: '100%', width: `${confPct}%`, background: `linear-gradient(to right,${C.accent},${C.green})`, borderRadius: 99, transition: 'width 1s ease' }} />
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default function StressPrediction() {
//   const [formData, setFormData] = useState(
//     Object.fromEntries(inputFields.map(f => [f.name, f.min]))
//   );
//   const [result, setResult]   = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError]     = useState(null);
//   const [tab, setTab]         = useState('academic');

//   const onChange = e => {
//     const { name, value } = e.target;
//     setFormData(p => ({ ...p, [name]: Number(value) }));
//   };

//   const onSubmit = async e => {
//     e.preventDefault();
//     setLoading(true); setError(null);
//     const payload = Object.fromEntries(Object.entries(formData).map(([k,v]) => [k, Number(v)]));
//     try {
//       const r = await axios.post(`${STRESS_API_URL}/api/predict`, payload, { headers: { 'Content-Type': 'application/json' } });
//       setResult(r.data);
//     } catch {
//       try {
//         const r = await client.post('/api/stress/api/predict', payload);
//         setResult(r.data);
//       } catch (err) {
//         setError(err.response?.data?.error || err.response?.data?.detail || 'Prediction failed. Please try again.');
//       }
//     } finally { setLoading(false); }
//   };

//   const tabIdx   = GROUPS.findIndex(g => g.key === tab);
//   const isLast   = tabIdx === GROUPS.length - 1;
//   const progress = Math.round((Object.values(formData).filter(v => v !== '').length / inputFields.length) * 100);

//   return (
//     <Layout title="Stress Prediction">
//       {/* Range slider thumb styles */}
//       <style>{`
//         .sp-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:${C.green};border:3px solid ${C.white};box-shadow:0 0 0 2px ${C.green};cursor:pointer}
//         .sp-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:${C.green};border:3px solid ${C.white};box-shadow:0 0 0 2px ${C.green};cursor:pointer;border:none}
//         @keyframes sp-spin{to{transform:rotate(360deg)}}
//         @media(max-width:768px){.sp-grid{grid-template-columns:1fr!important}.sp-right{position:static!important}}
//       `}</style>

//       <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 4px' }}>

//         {/* ── Header Banner ── */}
//         <div style={{
//           background: `linear-gradient(135deg, ${C.greenDeep} 0%, ${C.greenDark} 55%, ${C.green} 100%)`,
//           borderRadius: 24, padding: '28px 32px', marginBottom: 24,
//           display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
//         }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
//             <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//               <Brain size={26} color="#fff" />
//             </div>
//             <div>
//               <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>Stress Prediction</h1>
//               <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0 }}>AI-powered student wellness analysis · O/L Sri Lanka</p>
//             </div>
//           </div>
//           <div style={{ textAlign: 'right' }}>
//             <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>Completion</div>
//             <div style={{ fontSize: 30, fontWeight: 800, color: C.accent, lineHeight: 1 }}>{progress}%</div>
//             <div style={{ width: 110, height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 99, marginTop: 6 }}>
//               <div style={{ height: '100%', width: `${progress}%`, background: C.accent, borderRadius: 99, transition: 'width 0.3s' }} />
//             </div>
//           </div>
//         </div>

//         {/* ── Two-column layout ── */}
//         <div className="sp-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

//           {/* LEFT */}
//           <div>
//             {/* Tabs */}
//             <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
//               {GROUPS.map((g, i) => {
//                 const done = inputFields.filter(f => f.group === g.key && formData[f.name] !== '').length;
//                 const total = inputFields.filter(f => f.group === g.key).length;
//                 const active = tab === g.key;
//                 return (
//                   <button key={g.key} onClick={() => setTab(g.key)} style={{
//                     padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600,
//                     border: `2px solid ${active ? C.green : C.border}`,
//                     background: active ? C.green : C.white,
//                     color: active ? '#fff' : C.muted,
//                     cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
//                   }}>
//                     <span style={{ width: 6, height: 6, borderRadius: 99, background: active ? '#fff' : C.green, display: 'inline-block' }} />
//                     {g.label}
//                     <span style={{
//                       fontSize: 10, fontWeight: 700,
//                       background: active ? 'rgba(255,255,255,0.25)' : C.mint,
//                       color: active ? '#fff' : C.greenDark,
//                       borderRadius: 99, padding: '1px 7px',
//                     }}>{done}/{total}</span>
//                   </button>
//                 );
//               })}
//             </div>

//             {/* Field Cards */}
//             {GROUPS.map(g => (
//               <div key={g.key} style={{ display: tab === g.key ? 'block' : 'none' }}>
//                 <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: 22, marginBottom: 16 }}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
//                     <div style={{ width: 4, height: 20, background: C.green, borderRadius: 99 }} />
//                     <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>{g.label}</h2>
//                   </div>
//                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 10 }}>
//                     {inputFields.filter(f => f.group === g.key).map(field => (
//                       <SliderCard key={field.name} field={field} value={formData[field.name]} onChange={onChange} />
//                     ))}
//                   </div>
//                 </div>

//                 {/* Prev / Next / Submit */}
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
//                   {tabIdx > 0 ? (
//                     <button onClick={() => setTab(GROUPS[tabIdx - 1].key)} style={{ padding: '10px 20px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, color: C.muted, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
//                       ← Back
//                     </button>
//                   ) : <span />}

//                   {!isLast ? (
//                     <button onClick={() => setTab(GROUPS[tabIdx + 1].key)} style={{ padding: '10px 22px', borderRadius: 12, border: 'none', background: C.green, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
//                       Next <ChevronRight size={15} />
//                     </button>
//                   ) : (
//                     <button onClick={onSubmit} disabled={loading} style={{
//                       padding: '11px 28px', borderRadius: 12, border: 'none',
//                       background: loading ? C.mintMid : `linear-gradient(135deg,${C.accent},${C.green})`,
//                       color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
//                       display: 'flex', alignItems: 'center', gap: 8,
//                       boxShadow: loading ? 'none' : `0 8px 22px ${C.green}44`,
//                     }}>
//                       {loading
//                         ? <><Activity size={16} style={{ animation: 'sp-spin 1s linear infinite' }} /> Analysing...</>
//                         : <><Sparkles size={16} /> Predict Stress Level</>}
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}

//             {/* Error */}
//             {error && (
//               <div style={{ display: 'flex', gap: 10, padding: 14, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, marginBottom: 18 }}>
//                 <AlertCircle size={17} style={{ color: '#dc2626', flexShrink: 0 }} />
//                 <span style={{ fontSize: 13, color: '#b91c1c' }}>{error}</span>
//               </div>
//             )}

//             {/* Recommendations */}
//             {result?.recommendations?.length > 0 && (
//               <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: 22 }}>
//                 <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
//                   <Heart size={17} style={{ color: C.green }} /> Wellness Recommendations
//                 </h3>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                   {result.recommendations.map((rec, i) => (
//                     <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 14px', background: C.mint, borderRadius: 12, borderLeft: `3px solid ${C.green}` }}>
//                       <CheckCircle size={15} style={{ color: C.green, flexShrink: 0, marginTop: 2 }} />
//                       <span style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{rec}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* RIGHT — sticky panel */}
//           <div className="sp-right" style={{ position: 'sticky', top: 24 }}>

//             {result ? (
//               <StressMeter level={result.stress_level} confidence={result.confidence} />
//             ) : (
//               <div style={{ background: C.mint, border: `2px dashed ${C.border}`, borderRadius: 24, padding: 32, textAlign: 'center' }}>
//                 <Brain size={38} style={{ color: C.greenDark, opacity: 0.4, marginBottom: 10 }} />
//                 <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
//                   Adjust the sliders and click <strong>Predict Stress Level</strong> to see your wellness analysis.
//                 </p>
//               </div>
//             )}

//             {/* Input Summary */}
//             {result?.input_summary && (
//               <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18, marginTop: 14 }}>
//                 <h4 style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Your Input Summary</h4>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//                   {Object.entries(result.input_summary).map(([k, v]) => (
//                     <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${C.mint}` }}>
//                       <span style={{ fontSize: 12, color: C.muted, textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
//                       <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{typeof v === 'number' ? v.toFixed(1) : v}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Stress Scale Legend */}
//             <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18, marginTop: 14 }}>
//               <h4 style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Stress Scale</h4>
//               {[
//                 { label: 'Low Stress',      color: C.green,   pct: '20%' },
//                 { label: 'Moderate Stress', color: '#d97706', pct: '55%' },
//                 { label: 'High Stress',     color: '#dc2626', pct: '90%' },
//               ].map(s => (
//                 <div key={s.label} style={{ marginBottom: 10 }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
//                     <span style={{ fontSize: 11, color: C.muted }}>{s.label}</span>
//                     <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.pct}</span>
//                   </div>
//                   <div style={{ height: 5, background: C.mintMid, borderRadius: 99 }}>
//                     <div style={{ height: '100%', width: s.pct, background: s.color, borderRadius: 99 }} />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }









import React, { useState } from 'react';
import axios from 'axios';
import {
  Brain, AlertCircle, CheckCircle, Heart, ChevronRight,
  BookOpen, Clock, Wallet, Smartphone, Moon, Users,
  Activity, Sparkles, TrendingUp, TrendingDown,
} from 'lucide-react';
import client from '../api/client';
import Layout from './Layout';

const STRESS_API_URL = import.meta.env.VITE_STRESS_API_URL || 'http://localhost:5003';

// Neutral-first palette — green is accent only
const C = {
  green:    '#1E9E72',   // accent only — buttons, active states, highlights
  greenBg:  '#EAF7F2',  // very light, used sparingly
  white:    '#FFFFFF',
  bg:       '#F8F9FA',  // page / card backgrounds
  cardBg:   '#FFFFFF',
  border:   '#E5E7EB',  // neutral gray border
  borderSoft: '#F3F4F6',
  text:     '#111827',  // near-black
  textSub:  '#6B7280',  // gray muted
  textHint: '#9CA3AF',  // lighter hint
  track:    '#E5E7EB',  // slider track
};

const inputFields = [
  { name: 'term_mark_avg',          label: 'Term Mark Average',        min: 0,  max: 100, step: 1,   unit: '%',   icon: TrendingUp,     group: 'academic' },
  { name: 'prev_term_mark_avg',     label: 'Previous Term Average',    min: 0,  max: 100, step: 1,   unit: '%',   icon: TrendingDown,   group: 'academic' },
  { name: 'attendance',             label: 'Attendance Rate',          min: 0,  max: 100, step: 1,   unit: '%',   icon: CheckCircle,    group: 'academic' },
  { name: 'daily_study',            label: 'Daily Study Hours',        min: 0,  max: 12,  step: 0.5, unit: 'hrs', icon: BookOpen,       group: 'time' },
  { name: 'prefer_study',           label: 'Preferred Study Hours',    min: 0,  max: 12,  step: 0.5, unit: 'hrs', icon: BookOpen,       group: 'time' },
  { name: 'tuition_hours_per_week', label: 'Tuition Hours / Week',     min: 0,  max: 40,  step: 1,   unit: 'hrs', icon: Users,          group: 'time' },
  { name: 'travel_time',            label: 'Travel Time',              min: 0,  max: 10,  step: 1,   unit: 'hrs', icon: Clock,          group: 'time' },
  { name: 'sleep_hours',            label: 'Sleep Hours',              min: 0,  max: 12,  step: 0.5, unit: 'hrs', icon: Moon,           group: 'lifestyle' },
  { name: 'social_media',           label: 'Social Media Usage',       min: 0,  max: 12,  step: 0.5, unit: 'hrs', icon: Smartphone,     group: 'lifestyle' },
  { name: 'financial_status',       label: 'Financial Stability',      min: 0,  max: 10,  step: 1,   unit: '/10', icon: Wallet,         group: 'lifestyle' },
];

const GROUPS = [
  { key: 'academic',  label: 'Academic Performance' },
  { key: 'time',      label: 'Time & Schedule' },
  { key: 'lifestyle', label: 'Lifestyle Factors' },
];

const getStressMeta = (level) => {
  if (!level) return { color: '#9CA3AF', bg: '#F9FAFB', label: '—', emoji: '❓', pct: 0, ring: '#E5E7EB' };
  const l = level.toLowerCase();
  if (l.includes('high'))   return { color: '#DC2626', bg: '#FEF2F2', label: 'High Stress',     emoji: '🔴', pct: 88, ring: '#FECACA' };
  if (l.includes('medium')) return { color: '#D97706', bg: '#FFFBEB', label: 'Moderate Stress', emoji: '🟡', pct: 52, ring: '#FDE68A' };
  if (l.includes('low'))    return { color: C.green,   bg: C.greenBg, label: 'Low Stress',      emoji: '🟢', pct: 18, ring: '#6EE7B7' };
  return                           { color: C.green,   bg: C.greenBg, label: level,             emoji: '✅', pct: 30, ring: '#6EE7B7' };
};

const formatApiError = (err) => {
  const data = err?.response?.data;
  if (!data) return 'Prediction failed. Please try again.';
  if (Array.isArray(data.missing) && data.missing.length > 0) {
    return `Missing fields: ${data.missing.join(', ')}`;
  }
  return data.error || data.detail || 'Prediction failed. Please try again.';
};

const SliderCard = ({ field, value, onChange }) => {
  const Icon = field.icon;
  const pct = field.max > field.min ? ((value - field.min) / (field.max - field.min)) * 100 : 0;

  return (
    <div style={{
      background: C.cardBg,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: C.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={14} style={{ color: C.textSub }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{field.label}</span>
        </div>
        <span style={{
          fontSize: 13, fontWeight: 700, color: C.green,
          background: C.greenBg,
          padding: '2px 10px', borderRadius: 6,
          minWidth: 48, textAlign: 'center',
        }}>
          {value}{field.unit}
        </span>
      </div>

      {/* Track */}
      <div style={{ height: 4, background: C.track, borderRadius: 99, marginBottom: 2, position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${pct}%`,
          background: C.green,
          borderRadius: 99,
        }} />
      </div>

      <input
        type="range"
        name={field.name}
        value={value}
        min={field.min} max={field.max} step={field.step}
        onChange={onChange}
        className="sp-range"
        style={{ width: '100%', appearance: 'none', WebkitAppearance: 'none', background: 'transparent', height: 16, cursor: 'pointer', marginTop: -2 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: C.textHint }}>{field.min}{field.unit}</span>
        <span style={{ fontSize: 10, color: C.textHint }}>{field.max}{field.unit}</span>
      </div>
    </div>
  );
};

const StressMeter = ({ level, confidence }) => {
  const meta = getStressMeta(level);
  const confPct = confidence ? Math.round(confidence * 100) : null;
  const r = 54, circ = 2 * Math.PI * r;
  const dash = (meta.pct / 100) * circ;

  return (
    <div style={{
      background: meta.bg,
      border: `1.5px solid ${meta.ring}`,
      borderRadius: 20, padding: 24, textAlign: 'center',
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>
        Stress Result
      </p>

      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 14 }}>
        <svg width={130} height={130} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={65} cy={65} r={r} fill="none" stroke={C.track} strokeWidth={9} />
          <circle cx={65} cy={65} r={r} fill="none" stroke={meta.color} strokeWidth={9}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <div style={{ fontSize: 24 }}>{meta.emoji}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: meta.color }}>{meta.pct}%</div>
        </div>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: meta.color, margin: '0 0 4px' }}>{meta.label}</h2>
      <p style={{ fontSize: 12, color: C.textSub, margin: '0 0 14px' }}>AI-predicted classification</p>

      {confPct && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.textSub, marginBottom: 5 }}>
            <span>Confidence</span>
            <span style={{ fontWeight: 700, color: C.text }}>{confPct}%</span>
          </div>
          <div style={{ height: 5, background: C.track, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${confPct}%`, background: meta.color, borderRadius: 99, transition: 'width 1s ease' }} />
          </div>
        </>
      )}
    </div>
  );
};

export default function StressPrediction() {
  const [formData, setFormData] = useState(
    Object.fromEntries(inputFields.map(f => [f.name, f.min]))
  );
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [tab, setTab]         = useState('academic');

  const onChange = e => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: Number(value) }));
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError(null);
    const invalidFields = inputFields.filter(f => Number.isNaN(Number(formData[f.name])));
    if (invalidFields.length > 0) {
      setError(`Invalid values for: ${invalidFields.map(f => f.label).join(', ')}`);
      setLoading(false);
      return;
    }
    const payload = Object.fromEntries(Object.entries(formData).map(([k, v]) => [k, Number(v)]));
    try {
      const r = await axios.post(`${STRESS_API_URL}/api/predict`, payload, { headers: { 'Content-Type': 'application/json' } });
      setResult(r.data);
    } catch {
      try {
        const r = await client.post('/api/stress/api/predict', payload);
        setResult(r.data);
      } catch (err) {
        setError(formatApiError(err));
      }
    } finally { setLoading(false); }
  };

  const tabIdx = GROUPS.findIndex(g => g.key === tab);
  const isLast = tabIdx === GROUPS.length - 1;
  const totalFilled = Object.values(formData).filter(v => v !== '' && v !== undefined).length;
  const progress = Math.round((totalFilled / inputFields.length) * 100);

  return (
    <Layout title="Stress Prediction">
      <style>{`
        .sp-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px; height: 16px; border-radius: 50%;
          background: ${C.green}; border: 2.5px solid ${C.white};
          box-shadow: 0 0 0 2px ${C.green}44; cursor: pointer;
        }
        .sp-range::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 50%;
          background: ${C.green}; border: 2.5px solid ${C.white};
          box-shadow: 0 0 0 2px ${C.green}44; cursor: pointer;
        }
        @keyframes sp-spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .sp-layout { grid-template-columns: 1fr !important; }
          .sp-sticky  { position: static !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 8px' }}>

        {/* ── Page Header — white card, green accent line ── */}
        <div style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: '24px 28px',
          marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          borderTop: `3px solid ${C.green}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: C.greenBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Brain size={22} style={{ color: C.green }} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Stress Prediction</h1>
              <p style={{ fontSize: 13, color: C.textSub, margin: 0 }}>AI-powered student wellness analysis · GCE O/L</p>
            </div>
          </div>

          {/* Progress pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 100, height: 5, background: C.track, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: C.green, borderRadius: 99, transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.textSub }}>{progress}% filled</span>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="sp-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

          {/* ── LEFT: form ── */}
          <div>

            {/* Tab bar */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {GROUPS.map((g) => {
                const filled  = inputFields.filter(f => f.group === g.key && formData[f.name] !== '' && formData[f.name] !== undefined).length;
                const total   = inputFields.filter(f => f.group === g.key).length;
                const active  = tab === g.key;
                return (
                  <button key={g.key} onClick={() => setTab(g.key)} style={{
                    padding: '7px 16px',
                    borderRadius: 99,
                    fontSize: 13,
                    fontWeight: 500,
                    border: `1.5px solid ${active ? C.green : C.border}`,
                    background: active ? C.green : C.white,
                    color: active ? C.white : C.textSub,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 7,
                    transition: 'all 0.15s',
                  }}>
                    {g.label}
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      background: active ? 'rgba(255,255,255,0.25)' : C.bg,
                      color: active ? C.white : C.textSub,
                      borderRadius: 99, padding: '1px 7px',
                    }}>{filled}/{total}</span>
                  </button>
                );
              })}
            </div>

            {/* Field groups */}
            {GROUPS.map(g => (
              <div key={g.key} style={{ display: tab === g.key ? 'block' : 'none' }}>
                <div style={{
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16, padding: 20, marginBottom: 14,
                }}>
                  <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 3, height: 16, background: C.green, borderRadius: 99, display: 'inline-block' }} />
                    {g.label}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                    {inputFields.filter(f => f.group === g.key).map(field => (
                      <SliderCard key={field.name} field={field} value={formData[field.name]} onChange={onChange} />
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  {tabIdx > 0 ? (
                    <button onClick={() => setTab(GROUPS[tabIdx - 1].key)} style={{
                      padding: '9px 18px', borderRadius: 10,
                      border: `1px solid ${C.border}`, background: C.white,
                      color: C.textSub, fontWeight: 500, cursor: 'pointer', fontSize: 13,
                    }}>← Back</button>
                  ) : <span />}

                  {!isLast ? (
                    <button onClick={() => setTab(GROUPS[tabIdx + 1].key)} style={{
                      padding: '9px 20px', borderRadius: 10, border: 'none',
                      background: C.green, color: C.white, fontWeight: 600,
                      cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      Next <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button onClick={onSubmit} disabled={loading} style={{
                      padding: '10px 26px', borderRadius: 10, border: 'none',
                      background: loading ? C.track : C.green,
                      color: C.white, fontWeight: 700, fontSize: 14,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8,
                      boxShadow: loading ? 'none' : `0 4px 16px ${C.green}33`,
                    }}>
                      {loading
                        ? <><Activity size={15} style={{ animation: 'sp-spin 1s linear infinite' }} /> Analysing...</>
                        : <><Sparkles size={15} /> Predict Stress Level</>}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Error */}
            {error && (
              <div style={{ display: 'flex', gap: 10, padding: 14, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, marginBottom: 16 }}>
                <AlertCircle size={16} style={{ color: '#DC2626', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: '#B91C1C' }}>{error}</span>
              </div>
            )}

            {/* Recommendations */}
            {result?.recommendations?.length > 0 && (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Heart size={16} style={{ color: C.green }} /> Wellness Recommendations
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.recommendations.map((rec, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '10px 14px',
                      background: C.bg,
                      borderRadius: 10,
                      borderLeft: `3px solid ${C.green}`,
                    }}>
                      <CheckCircle size={14} style={{ color: C.green, flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 13, color: C.textSub, lineHeight: 1.6 }}>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: sticky result panel ── */}
          <div className="sp-sticky" style={{ position: 'sticky', top: 24 }}>

            {result ? (
              <StressMeter level={result.stress_level} confidence={result.confidence} />
            ) : (
              <div style={{
                background: C.white,
                border: `1px dashed ${C.border}`,
                borderRadius: 20, padding: 32, textAlign: 'center',
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Brain size={24} style={{ color: C.textHint }} />
                </div>
                <p style={{ fontSize: 13, color: C.textSub, lineHeight: 1.6, margin: 0 }}>
                  Adjust the sliders and tap <strong style={{ color: C.text }}>Predict</strong> to see your wellness result here.
                </p>
              </div>
            )}

            {/* Input Summary */}
            {result?.input_summary && (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginTop: 14 }}>
                <h4 style={{ fontSize: 11, fontWeight: 600, color: C.textHint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Input Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {Object.entries(result.input_summary).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${C.borderSoft}` }}>
                      <span style={{ fontSize: 12, color: C.textSub, textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{typeof v === 'number' ? v.toFixed(1) : v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stress scale */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginTop: 14 }}>
              <h4 style={{ fontSize: 11, fontWeight: 600, color: C.textHint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Stress Scale</h4>
              {[
                { label: 'Low Stress',      color: C.green,   pct: '20%' },
                { label: 'Moderate Stress', color: '#D97706', pct: '55%' },
                { label: 'High Stress',     color: '#DC2626', pct: '90%' },
              ].map(s => (
                <div key={s.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: C.textSub }}>{s.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.pct}</span>
                  </div>
                  <div style={{ height: 4, background: C.track, borderRadius: 99 }}>
                    <div style={{ height: '100%', width: s.pct, background: s.color, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}