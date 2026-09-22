import React from 'react';
import { sound } from '../audio/soundEffects';

export default function PredictionModal({
  isOpen,
  targetPlayer,
  targetRole,
  onConfirm,
  onCancel,
  loading
}) {
  if (!isOpen || !targetPlayer || !targetRole) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', padding: '1.75rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
            🎯
          </div>
          <h3 className="font-serif gold-gradient-text" style={{ fontSize: '1.5rem', margin: 0 }}>
            Confirm Royal Prediction
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Think carefully — an incorrect prediction will swap your role!
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 215, 0, 0.08)',
          border: '1.5px solid var(--border-gold)',
          borderRadius: '1rem',
          padding: '1.25rem',
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: 0 }}>
            You are predicting that:
          </p>
          <div style={{
            fontSize: '1.35rem',
            fontWeight: 'bold',
            color: 'white',
            margin: '0.5rem 0'
          }}>
            👤 {targetPlayer.name}
          </div>
          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: 0 }}>
            holds the secret role of:
          </p>
          <div style={{
            fontSize: '1.4rem',
            fontWeight: 'bold',
            color: 'var(--gold-primary)',
            marginTop: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}>
            <span>{targetRole.emoji}</span>
            <span>{targetRole.name.toUpperCase()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => {
              sound.playClick();
              onCancel();
            }}
            disabled={loading}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onConfirm();
            }}
            disabled={loading}
            className="btn btn-gold"
            style={{ flex: 1.5 }}
          >
            {loading ? 'Submitting...' : '🎯 Confirm Guess'}
          </button>
        </div>
      </div>
    </div>
  );
}
