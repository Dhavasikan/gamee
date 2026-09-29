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

  return (
    <div className="swap-overlay" onClick={onComplete}>
      <div style={{ textAlign: 'center', maxWidth: '440px', width: '100%', animation: 'fadeIn 0.3s ease' }}>
        <div style={{
          fontSize: '4.5rem',
          filter: 'drop-shadow(0 0 25px rgba(16, 185, 129, 0.8))',
          lineHeight: 1,
          marginBottom: '1rem'
        }}>
          ✅
        </div>

        <div style={{
          background: 'rgba(16, 185, 129, 0.25)',
          border: '1.5px solid #10b981',
          borderRadius: '999px',
          padding: '0.6rem 2rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#6ee7b7',
          fontWeight: 'bold',
          fontSize: '1.4rem',
          marginBottom: '1.25rem',
          boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)'
        }}>
          ✅ Correct Guess!
        </div>

        {event.isRoundFinished && (
          <div style={{
            background: 'rgba(26, 17, 49, 0.85)',
            border: '1px solid var(--border-gold)',
            borderRadius: '1rem',
            padding: '1rem',
            marginTop: '0.5rem',
            color: 'var(--gold-primary)',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}>
            🏆 Round Complete!
          </div>
        )}

        <div>
          <button
            onClick={onComplete}
            className="btn btn-gold btn-sm"
            style={{ marginTop: '1.5rem', padding: '0.55rem 2rem' }}
          >
            {event.isRoundFinished ? 'View Final Results ➔' : 'Continue Game ➔'}
          </button>
        </div>
      </div>
    </div>
  );
}
