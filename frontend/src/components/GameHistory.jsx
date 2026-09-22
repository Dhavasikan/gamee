import React, { useState, useRef, useEffect } from 'react';

export default function GameHistory({ history = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history.length, isOpen]);

  const recentLogs = [...history].reverse();

  return (
    <div className="royal-panel" style={{ padding: '0.85rem 1.25rem', marginTop: '1rem' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📜</span>
          <h4 className="font-serif" style={{ color: 'var(--gold-primary)', margin: 0, fontSize: '0.95rem' }}>
            Royal Chronicle & History ({history.length})
          </h4>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--gold-light)' }}>
          {isOpen ? '▲ Collapse' : '▼ View Full Log'}
        </div>
      </div>

      {isOpen && (
        <div style={{
          marginTop: '0.75rem',
          maxHeight: '220px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid rgba(255,215,0,0.15)'
        }}>
          {recentLogs.map((h, idx) => (
            <div
              key={idx}
              style={{
                fontSize: '0.82rem',
                color: h.type === 'PREDICTION_CORRECT'
                  ? '#86efac'
                  : h.type === 'PREDICTION_WRONG'
                  ? '#fca5a5'
                  : h.type === 'RAJA_REVEAL'
                  ? '#fde047'
                  : '#cbd5e1',
                padding: '0.4rem 0.6rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '0.4rem',
                borderLeft: h.type === 'PREDICTION_CORRECT'
                  ? '3px solid #10b981'
                  : h.type === 'PREDICTION_WRONG'
                  ? '3px solid #ef4444'
                  : '3px solid var(--gold-primary)'
              }}
            >
              {h.message}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  );
}
