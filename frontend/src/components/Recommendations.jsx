import React, { useState } from 'react';
import {
  Lightbulb, AlertTriangle, AlertCircle, Info, CheckCircle, Zap, Calendar, Clock, X, BookOpen, Target, Coffee
} from 'lucide-react';

const typeConfig = {
  critical: {
    icon: AlertTriangle,
    bg: '#fef2f2',
    border: '#fecaca',
    iconColor: '#dc2626',
    badge: { bg: '#fee2e2', color: '#dc2626' },
    badgeText: 'Critical',
  },
  warning: {
    icon: AlertCircle,
    bg: '#fffbeb',
    border: '#fde68a',
    iconColor: '#d97706',
    badge: { bg: '#fef3c7', color: '#d97706' },
    badgeText: 'Warning',
  },
  info: {
    icon: Info,
    bg: '#eff6ff',
    border: '#bfdbfe',
    iconColor: '#2563eb',
    badge: { bg: '#dbeafe', color: '#2563eb' },
    badgeText: 'Suggestion',
  },
  success: {
    icon: CheckCircle,
    bg: '#ecfdf5',
    border: '#a7f3d0',
    iconColor: '#059669',
    badge: { bg: '#d1fae5', color: '#059669' },
    badgeText: 'Good',
  },
};

export default function Recommendations({ recommendations, riskLevel }) {
  const [showStudyPlan, setShowStudyPlan] = useState(false);
  const [showPomodoroGuide, setShowPomodoroGuide] = useState(false);
  const [isPomodoroSinhala, setIsPomodoroSinhala] = useState(false);
  const [isStudyPlanSinhala, setIsStudyPlanSinhala] = useState(false);

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <Lightbulb size={40} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>No Recommendations</h3>
        <p style={{ fontSize: 13, color: '#94a3b8' }}>Run a prediction to get personalized AI recommendations.</p>
      </div>
    );
  }

  const riskColor = riskLevel === 'High' ? '#dc2626' : riskLevel === 'Medium' ? '#d97706' : '#059669';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fade-in-up">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Lightbulb size={20} color="#d97706" />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>AI Recommendations</h3>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>
              Personalized suggestions from the backend model based on{' '}
              <span style={{ fontWeight: 600, color: riskColor }}>{riskLevel} Risk</span> assessment
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {recommendations.map((rec, idx) => {
          const config = typeConfig[rec.type] || typeConfig.info;
          const Icon = config.icon;
          const isCriticalStudyHours = rec.area === 'Study Hours' && rec.type === 'critical';
          const isConsistencyIssue = rec.area === 'Consistency' && (rec.type === 'warning' || rec.type === 'critical');

          return (
            <div
              key={idx}
              className={`card animate-fade-in-up stagger-${Math.min(idx + 1, 6)}`}
              style={{ borderColor: config.border }}
            >
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={20} color={config.iconColor} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{rec.area}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 12,
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                      background: config.badge.bg, color: config.badge.color,
                    }}>
                      {config.badgeText}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 10, lineHeight: 1.5 }}>{rec.message}</p>

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                    padding: '8px 12px', borderRadius: 8,
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                  }}>
                    <Zap size={14} color="#3b82f6" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6' }}>Action:</span>
                    <span style={{ fontSize: 12, color: '#64748b', flex: 1 }}>{rec.action}</span>

                    {isCriticalStudyHours && (
                      <button
                        onClick={() => setShowStudyPlan(true)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 6,
                          background: '#3b82f6', color: 'white',
                          fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                          transition: 'all 0.2s', marginLeft: 'auto'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
                      >
                        <Calendar size={14} />
                        View New Study Plan
                      </button>
                    )}
                    {isConsistencyIssue && (
                      <button
                        onClick={() => setShowPomodoroGuide(true)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 6,
                          background: '#f59e0b', color: 'white',
                          fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)',
                          transition: 'all 0.2s', marginLeft: 'auto'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#d97706'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#f59e0b'}
                      >
                        <Clock size={14} />
                        Follow Pomodoro Technique
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showStudyPlan && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 20
        }}>
          <div style={{
            background: 'white', borderRadius: 16, width: '100%', maxWidth: 600,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden', animation: 'fadeInUp 0.3s ease-out'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 10 }}>
                  <Calendar size={24} color="white" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                    {isStudyPlanSinhala ? 'දෛනික අධ්‍යයන කාලසටහන' : 'Optimized Daily Study Plan'}
                  </h2>
                  <p style={{ margin: 0, fontSize: 13, color: '#bfdbfe', marginTop: 2 }}>
                    {isStudyPlanSinhala ? 'ඔබේ අවධානය සහ ප්‍රතිඵල වැඩි කරගන්න' : 'Boost your focus and academic performance'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => setIsStudyPlanSinhala(!isStudyPlanSinhala)}
                  style={{
                    background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 20,
                    padding: '4px 10px', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                >
                  {isStudyPlanSinhala ? 'English' : 'සිංහල'}
                </button>
                <button
                  onClick={() => setShowStudyPlan(false)}
                  style={{
                    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 50,
                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'white', transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ padding: 24, maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    background: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: 13,
                    padding: '6px 12px', borderRadius: 20, width: 90, textAlign: 'center', flexShrink: 0
                  }}>
                    {isStudyPlanSinhala ? 'ප.ව. 4:00' : '4:00 PM'}
                  </div>
                  <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <BookOpen size={16} color="#3b82f6" />
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a' }}>
                        {isStudyPlanSinhala ? 'ගෙදර වැඩ සහ පුනරීක්ෂණ' : 'Homework & Review'}
                      </h4>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                      {isStudyPlanSinhala ? 'අද දවසේ පාසලෙන් දුන් ගෙදර වැඩ අවසන් කරන්න. අද උගන්වපු පාඩම් කෙටියෙන් නැවත බලන්න.' : 'Complete daily assignments and quickly review school notes from today.'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 90, textAlign: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                      {isStudyPlanSinhala ? 'ප.ව. 5:30' : '5:30 PM'}
                    </span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ height: 1, background: '#e2e8f0', flex: 1 }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', background: '#ecfdf5', padding: '4px 10px', borderRadius: 12 }}>
                      <Coffee size={14} />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>
                        {isStudyPlanSinhala ? 'විනාඩි 30ක විවේකයක්' : '30 Min Break'}
                      </span>
                    </div>
                    <div style={{ height: 1, background: '#e2e8f0', flex: 1 }}></div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    background: '#fef2f2', color: '#dc2626', fontWeight: 700, fontSize: 13,
                    padding: '6px 12px', borderRadius: 20, width: 90, textAlign: 'center', flexShrink: 0
                  }}>
                    {isStudyPlanSinhala ? 'ප.ව. 6:00' : '6:00 PM'}
                  </div>
                  <div style={{ flex: 1, background: '#fcf8ff', border: '1px solid #f3e8ff', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Target size={16} color="#9333ea" />
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a' }}>
                        {isStudyPlanSinhala ? 'ගැඹුරු අධ්‍යයනය (දුර්වල විෂයන්)' : 'Deep Study (Weak Subjects)'}
                      </h4>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                      {isStudyPlanSinhala ? 'කිසිම බාධාවකින් තොරව ඔබේ දුර්වලම විෂයන්ට අවධානය යොමු කරන්න. Active recall ක්‍රම භාවිතා කරන්න.' : 'Focus entirely on your weakest subjects without distractions. Use active recall techniques.'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 90, textAlign: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                      {isStudyPlanSinhala ? 'රාත්‍රී ආහාරය සහ විවේකය' : 'Dinner & Rest'}
                    </span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ height: 1, background: '#e2e8f0', flex: 1 }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{isStudyPlanSinhala ? 'රාත්‍රී ආහාරය සහ විවේකය' : 'Dinner & Rest'}</span>
                    </div>
                    <div style={{ height: 1, background: '#e2e8f0', flex: 1 }}></div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    background: '#fffbeb', color: '#d97706', fontWeight: 700, fontSize: 13,
                    padding: '6px 12px', borderRadius: 20, width: 90, textAlign: 'center', flexShrink: 0
                  }}>
                    {isStudyPlanSinhala ? 'ප.ව. 8:30' : '8:30 PM'}
                  </div>
                  <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Clock size={16} color="#d97706" />
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a' }}>
                        {isStudyPlanSinhala ? 'සිහිකිරීම සහ මක්කල් පරීක්ෂණ' : 'Revision & Practice'}
                      </h4>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                      {isStudyPlanSinhala ? 'අද ඉගෙනගත් දේවල් සිහිපත් කරලා short practice test එකක් කරන්න.' : 'Recall today’s learning and do a short practice test.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPomodoroGuide && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 20
        }}>
          <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 540, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Clock size={20} color="#f59e0b" />
              <h3 style={{ margin: 0 }}>Pomodoro Technique</h3>
            </div>
            <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
              Study for 25 minutes, then take a 5 minute break. Repeat four times, then take a longer break.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn-primary" onClick={() => setShowPomodoroGuide(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
