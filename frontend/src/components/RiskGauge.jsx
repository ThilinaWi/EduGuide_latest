import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

export default function RiskGauge({ result }) {
  const [animated, setAnimated] = useState(false);
  const risk = result.risk_level;
  const confidence = result.confidence;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const riskValue = risk === 'Low' ? 25 : risk === 'Medium' ? 55 : 85;
  const gaugeAngle = (riskValue / 100) * 180;

  const riskConfig = {
    Low: {
      color: '#10b981', label: 'Low Risk', icon: ShieldCheck,
      message: 'Student is performing well academically',
      bgTint: '#ecfdf5',
    },
    Medium: {
      color: '#f59e0b', label: 'Medium Risk', icon: Shield,
      message: 'Some areas need attention and improvement',
      bgTint: '#fffbeb',
    },
    High: {
      color: '#ef4444', label: 'High Risk', icon: ShieldAlert,
      message: 'Immediate intervention recommended',
      bgTint: '#fef2f2',
    },
  };

  const config = riskConfig[risk] || riskConfig.Medium;
  const Icon = config.icon;

  const cx = 120, cy = 120, r = 90;
  const circumference = Math.PI * r;
  const strokeDashoffset = animated
    ? circumference - (gaugeAngle / 180) * circumference
    : circumference;

  return (
    <div className="card" style={{
      textAlign: 'center', borderColor: `${config.color}20`,
      boxShadow: `0 4px 20px ${config.color}08`,
    }}>
      <div style={{ display: 'inline-block' }}>
        <svg width="240" height="140" viewBox="0 0 240 140">
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke={config.color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="gauge-ring"
            style={{ filter: `drop-shadow(0 0 6px ${config.color}30)` }}
          />
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = (tick / 100) * 180;
            const rad = (angle * Math.PI) / 180;
            const x1 = cx - (r + 10) * Math.cos(rad);
            const y1 = cy - (r + 10) * Math.sin(rad);
            const x2 = cx - (r + 18) * Math.cos(rad);
            const y2 = cy - (r + 18) * Math.sin(rad);
            return (
              <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            );
          })}
          {animated && (() => {
            const needleAngle = (riskValue / 100) * 180;
            const rad = (needleAngle * Math.PI) / 180;
            const nx = cx - 60 * Math.cos(rad);
            const ny = cy - 60 * Math.sin(rad);
            return (
              <g>
                <line x1={cx} y1={cy} x2={nx} y2={ny}
                  stroke={config.color} strokeWidth="3" strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 3px ${config.color})`, transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
                <circle cx={cx} cy={cy} r="6" fill={config.color} style={{ filter: `drop-shadow(0 0 4px ${config.color})` }} />
                <circle cx={cx} cy={cy} r="3" fill="white" />
              </g>
            );
          })()}
          <text x="18" y={cy + 18} fill="#94a3b8" fontSize="10" textAnchor="middle">Low</text>
          <text x={cx} y="22" fill="#94a3b8" fontSize="10" textAnchor="middle">Med</text>
          <text x="222" y={cy + 18} fill="#94a3b8" fontSize="10" textAnchor="middle">High</text>
        </svg>
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 20,
          background: config.bgTint,
        }}>
          <Icon size={20} color={config.color} />
          <span style={{ fontSize: 18, fontWeight: 700, color: config.color }}>
            {config.label}
          </span>
        </div>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>{config.message}</p>
        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
          Model Confidence: <span style={{ fontWeight: 700, color: '#475569' }}>{(confidence * 100).toFixed(1)}%</span>
        </p>
      </div>
    </div>
  );
}