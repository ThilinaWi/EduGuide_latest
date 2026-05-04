import React from 'react';
import { AlertTriangle, XCircle, Phone, BookOpen } from 'lucide-react';

export default function HighRiskAlert({ result, recommendations = [] }) {
  const recs = recommendations.length > 0 ? recommendations : (result.recommendations || []);
  const criticalAreas = recs
    .filter(r => r.type === 'critical')
    .map(r => r.area);

  return (
    <div className="alert-banner alert-banner-red" style={{ marginBottom: 24, animation: 'alertSlideIn 0.5s ease-out' }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <AlertTriangle size={24} color="#dc2626" />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#dc2626' }}>⚠ High Academic Risk Detected</h3>
          <span className="badge badge-red" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
            Urgent
          </span>
        </div>
        <p style={{ fontSize: 13, color: '#9b2c2c', marginBottom: 12 }}>
          This student has been identified as <strong>high risk</strong> for academic failure.
          Immediate intervention is strongly recommended.
        </p>

        {criticalAreas.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {criticalAreas.map((area, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 8,
                background: '#fee2e2', border: '1px solid #fecaca',
                fontSize: 12, fontWeight: 600, color: '#dc2626',
              }}>
                <XCircle size={14} />
                {area}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: '#9b2c2c' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Phone size={14} />
            Contact parents/guardians immediately
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={14} />
            Schedule counseling session
          </div>
        </div>
      </div>
    </div>
  );
}