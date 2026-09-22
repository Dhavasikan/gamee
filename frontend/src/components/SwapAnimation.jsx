import React, { useEffect, useState } from 'react';
import { sound } from '../audio/soundEffects';

export default function SwapAnimation({ event, onComplete }) {
  const [phase, setPhase] = useState('ANNOUNCE'); // 'ANNOUNCE', 'SWAPPING', 'FINAL'

  useEffect(() => {
    if (!event) return;

    sound.playWrong();

    // Sequence the swap animation
    const t1 = setTimeout(() => {
      setPhase('SWAPPING');
      sound.playCardFlip();
    }, 1200);

    const t2 = setTimeout(() => {
      setPhase('FINAL');
    }, 2400);

    const t3 = setTimeout(() => {
      onComplete?.();
    }, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [event]);

  if (!event) return null;

  const {
    oldActivePlayerName,
    targetPlayerName,
    guessedForRoleName,
    targetPlayerOldRoleName,
    currentRole
  } = event;

  const currentRoleEmoji = currentRole === 'raja' ? '👑' : currentRole === 'rani' ? '👸' : currentRole === 'manthiri' ? '🧙' : '👮';

  return (
    <div className="swap-overlay" onClick={onComplete}>
      <div style={{ textAlign: 'center', maxWidth: '520px', width: '100%' }}>
        {/* Header Alert */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1.5px solid #ef4444',
          borderRadius: '999px',
          padding: '0.5rem 1.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          color: '#fca5a5',
          fontWeight: 'bold',
          fontSize: '1.1rem'
        }}>
          <span>❌ WRONG PREDICTION!</span>
        </div>

        <h2 className="font-serif gold-gradient-text" style={{ fontSize: '1.8rem', margin: '0.2rem 0' }}>
          CHARACTER ROLE SWAP!
        </h2>

        <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          {targetPlayerName} was NOT {guessedForRoleName}! Roles are being transferred.
        </p>

        {/* Dynamic Card Swap Showcase */}
        <div className="swap-animation-box">
          {/* Card A: Old active player */}
          <div
            className="swap-card"
            style={{
              transform: phase === 'SWAPPING'
                ? 'translateX(110%) scale(0.95)'
                : phase === 'FINAL'
                ? 'scale(1)'
                : 'scale(1)',
              borderColor: phase === 'FINAL' ? 'rgba(255,215,0,0.3)' : 'var(--gold-primary)'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.35rem' }}>
              {phase === 'FINAL' ? '🔄' : currentRoleEmoji}
            </div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              {phase === 'FINAL' ? 'New Role' : 'Original Role'}
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--gold-light)' }}>
              {phase === 'FINAL' ? targetPlayerOldRoleName : currentRole.toUpperCase()}
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.95rem', color: 'white' }}>
              👤 {oldActivePlayerName}
            </div>
          </div>

          {/* Swap Indicator Icon */}
          <div className="swap-indicator-icon">
            ⇄
          </div>

          {/* Card B: Guessed player receiving current role */}
          <div
            className="swap-card"
            style={{
              transform: phase === 'SWAPPING'
                ? 'translateX(-110%) scale(0.95)'
                : phase === 'FINAL'
                ? 'scale(1.05)'
                : 'scale(1)',
              borderColor: phase === 'FINAL' ? 'var(--gold-primary)' : 'rgba(255,215,0,0.3)',
              boxShadow: phase === 'FINAL' ? 'var(--shadow-gold)' : 'none'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.35rem' }}>
              {phase === 'FINAL' ? currentRoleEmoji : '🔒'}
            </div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              {phase === 'FINAL' ? 'Promoted To' : 'Original Role'}
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--gold-light)' }}>
              {phase === 'FINAL' ? currentRole.toUpperCase() : targetPlayerOldRoleName || 'Secret'}
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.95rem', color: 'white' }}>
              👤 {targetPlayerName}
            </div>
          </div>
        </div>

        {/* Explanatory Outcome Message */}
        <div style={{
          background: 'rgba(26, 17, 49, 0.9)',
          border: '1.5px solid var(--border-gold)',
          borderRadius: '1rem',
          padding: '1rem',
          marginTop: '1rem'
        }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--gold-primary)' }}>
            👑 {targetPlayerName} is the new {currentRole.toUpperCase()}!
          </div>
          <div style={{ fontSize: '0.9rem', color: '#e2e8f0', marginTop: '0.35rem' }}>
            Turn transfers to {targetPlayerName} to find {guessedForRoleName} again!
          </div>
        </div>

        <button
          onClick={onComplete}
          className="btn btn-royal-outline btn-sm"
          style={{ marginTop: '1.5rem' }}
        >
          Continue Game ➔
        </button>
      </div>
    </div>
  );
}
