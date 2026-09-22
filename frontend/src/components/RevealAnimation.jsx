import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../audio/soundEffects';

export default function RevealAnimation({ event, onComplete }) {
  useEffect(() => {
    if (!event) return;

    if (event.targetRole === 'thirudan' || event.isRoundFinished) {
      sound.playThiefFound();
    } else {
      sound.playCorrect();
    }

    // Launch royal confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#f59e0b', '#c084fc', '#60a5fa', '#ffffff']
      });
    } catch {
      // ignore
    }

    const timer = setTimeout(() => {
      onComplete?.();
    }, 3800);

    return () => clearTimeout(timer);
  }, [event]);

  if (!event) return null;

  const {
    predictorName,
    targetPlayerName,
    targetRoleName,
    targetRoleEmoji,
    pointsAwarded,
    isRoundFinished
  } = event;

  return (
    <div className="swap-overlay" onClick={onComplete}>
      <div style={{ textAlign: 'center', maxWidth: '480px', width: '100%', animation: 'fadeIn 0.3s ease' }}>
        <div style={{
          fontSize: '4.5rem',
          filter: 'drop-shadow(0 0 25px rgba(255, 215, 0, 0.8))',
          lineHeight: 1,
          marginBottom: '0.5rem'
        }}>
          {targetRoleEmoji}
        </div>

        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1.5px solid #10b981',
          borderRadius: '999px',
          padding: '0.4rem 1.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#6ee7b7',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          marginBottom: '0.75rem'
        }}>
          🎉 CORRECT PREDICTION!
        </div>

        <h2 className="font-serif gold-gradient-text" style={{ fontSize: '2rem', margin: '0.25rem 0' }}>
          {targetPlayerName} is {targetRoleName}!
        </h2>

        {pointsAwarded > 0 ? (
          <div style={{
            background: 'var(--gold-gradient)',
            color: '#1a0f00',
            fontWeight: 800,
            fontSize: '1.4rem',
            padding: '0.6rem 1.5rem',
            borderRadius: '999px',
            display: 'inline-block',
            margin: '1rem 0',
            boxShadow: '0 0 25px rgba(255, 215, 0, 0.6)'
          }}>
            +{pointsAwarded} Points to {predictorName}!
          </div>
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '1.1rem',
            padding: '0.5rem 1.25rem',
            borderRadius: '999px',
            display: 'inline-block',
            margin: '1rem 0'
          }}>
            Thirudan yields 0 Points
          </div>
        )}

        <div style={{
          background: 'rgba(26, 17, 49, 0.85)',
          border: '1px solid var(--border-gold)',
          borderRadius: '1rem',
          padding: '1rem',
          marginTop: '0.5rem'
        }}>
          {isRoundFinished ? (
            <div style={{ color: 'var(--gold-primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>
              🕵️ THIEF FOUND! Round is Complete!
            </div>
          ) : (
            <div style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>
              👉 Next Turn passes to <strong>{targetPlayerName} ({targetRoleName})</strong>!
            </div>
          )}
        </div>

        <button
          onClick={onComplete}
          className="btn btn-gold btn-sm"
          style={{ marginTop: '1.5rem' }}
        >
          {isRoundFinished ? 'View Final Results ➔' : 'Next Turn ➔'}
        </button>
      </div>
    </div>
  );
}
