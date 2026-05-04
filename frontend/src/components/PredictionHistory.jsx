import React from 'react';
import { History, Clock, TrendingUp, Shield } from 'lucide-react';

const riskBadge = {
  Low: { bg: '#ecfdf5', color: '#059669' },
  Medium: { bg: '#fffbeb', color: '#d97706' },
  High: { bg: '#fef2f2', color: '#dc2626' },
};

export default function PredictionHistory({ history, loading }) {
  if (loading) {
    return (
      <div className="card" style={{ padding: 48, textAlign: 'center' }}>
        <div className="skeleton" style={{ width: 200, height: 20, margin: '0 auto 12px' }} />
        <div className="skeleton" style={{ width: 280, height: 14, margin: '0 auto' }} />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="card" style={{ padding: 48, textAlign: 'center' }}>
        <History size={40} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>No Predictions Yet</h3>
        <p style={{ fontSize: 13, color: '#94a3b8', maxWidth: 300, margin: '0 auto' }}>
          Your prediction history will appear here after you make your first risk assessment.
        </p>
      </div>
    );
  }

  const riskCounts = { Low: 0, Medium: 0, High: 0 };
  history.forEach(h => { if (riskCounts[h.risk_level] !== undefined) riskCounts[h.risk_level]++; });
  const total = history.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fade-in-up">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Total</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{total}</p>
        </div>
        {Object.entries(riskCounts).map(([level, count]) => (
          <div key={level} className={`stat-card stat-card-${level === 'Low' ? 'emerald' : level === 'High' ? 'red' : 'amber'}`} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{level} Risk</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: riskBadge[level].color }}>{count}</p>
            <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{total > 0 ? ((count / total) * 100).toFixed(0) : 0}%</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h4 style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={16} color="#3b82f6" />
          Prediction Trend (Recent {Math.min(total, 10)})
        </h4>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
          {history.slice(0, 10).reverse().map((h, i) => {
            const color = h.risk_level === 'Low' ? '#10b981' : h.risk_level === 'High' ? '#ef4444' : '#f59e0b';
            const height = h.risk_level === 'Low' ? '33%' : h.risk_level === 'High' ? '100%' : '66%';
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                <div className="tooltip-container" style={{ width: '100%', height, borderRadius: '4px 4px 0 0', background: color, opacity: 0.7, cursor: 'pointer', transition: 'opacity 0.2s', position: 'relative' }}
                  onMouseEnter={e => e.target.style.opacity = 1}
                  onMouseLeave={e => e.target.style.opacity = 0.7}
                >
                  <div className="tooltip" style={{ minWidth: 100 }}>
                    <p style={{ fontSize: 10 }}>{new Date(h.timestamp).toLocaleTimeString()}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color }}>{h.risk_level} Risk</p>
                    <p style={{ fontSize: 10 }}>{(h.confidence * 100).toFixed(0)}% conf.</p>
                  </div>
                </div>
                <span style={{ fontSize: 9, color: '#94a3b8' }}>#{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h4 style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={16} color="#3b82f6" />
          Recent Predictions
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 380, overflowY: 'auto' }}>
          {history.map((entry, idx) => {
            const badge = riskBadge[entry.risk_level] || riskBadge.Medium;
            return (
              <div key={idx} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 12, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={16} color={badge.color} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{entry.risk_level} Risk</p>
                    <p style={{ fontSize: 10, color: '#94a3b8' }}>{new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 11, color: '#64748b' }}>Att: {entry.inputs?.attendance}% | Marks: {entry.inputs?.avg_marks}%</p>
                  <p style={{ fontSize: 10, color: '#94a3b8' }}>Confidence: {(entry.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
