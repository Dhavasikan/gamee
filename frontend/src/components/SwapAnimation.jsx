import React, { useEffect, useState } from 'react';
import { sound } from '../audio/soundEffects';

export default function SwapAnimation({ event, privateSwapInfo, currentPlayer, onComplete }) {
  const [phase, setPhase] = useState('SWAPPING'); // 'SWAPPING', 'REVEAL'

  useEffect(() => {
    if (!event) return;

    sound.playWrong();

    const t1 = setTimeout(() => {
      setPhase('REVEAL');
      sound.playCardFlip();
    }, 1200);

    const t2 = setTimeout(() => {
      onComplete?.();
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [event]);

  if (!event) return null;

  const isGuesser = privateSwapInfo?.isGuesser === true;
  const isTarget = privateSwapInfo && !privateSwapInfo.isGuesser;
  const isSpectator = !privateSwapInfo;

  return (
    <div className="swap-overlay" onClick={onComplete} style={{ cursor: 'pointer' }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          textAlign: 'center',
          maxWidth: '520px',
          width: '100%',
          animation: 'fadeIn 0.3s ease',
          cursor: 'default'
        }}
      >
        {/* ========================================================================= */}
        {/* CASE 1 & 2: AFFECTED PLAYERS (Guesser & Target)                           */}
        {/* Only see their OWN updated private role                                   */}
        {/* ========================================================================= */}
        {(isGuesser || isTarget) && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Header: 🔄 Card Swapped */}
            <div style={{
              background: 'rgba(255, 215, 0, 0.18)',
              border: '1.5px solid var(--gold-primary)',
              borderRadius: '999px',
              padding: '0.5rem 1.6rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              color: 'var(--gold-light)',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              boxShadow: 'var(--shadow-gold)'
            }}>
              <span>🔄 Card Swapped</span>
            </div>

            {/* Secret Swapped Card Reveal */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(42, 23, 76, 0.95) 0%, rgba(18, 10, 36, 0.95) 100%)',
              border: '2px solid var(--gold-primary)',
              borderRadius: '1.25rem',
              padding: '2rem 1.25rem',
              boxShadow: 'var(--shadow-gold), 0 10px 30px rgba(0,0,0,0.6)',
              maxWidth: '340px',
              margin: '0 auto',
              transition: 'transform 0.4s ease'
            }}>
              <div style={{
                fontSize: '4.5rem',
                lineHeight: 1,
                marginBottom: '0.85rem',
                filter: 'drop-shadow(0 0 16px rgba(255, 215, 0, 0.5))'
              }}>
                {privateSwapInfo.roleEmoji || '🃏'}
              </div>

              {/* Requirement: Your new role: 👮 Police / 👑 Raja */}
              <div style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--gold-primary)',
                fontFamily: 'var(--font-serif)',
                letterSpacing: '0.5px'
              }}>
                Your new role: {privateSwapInfo.roleEmoji} {privateSwapInfo.roleName}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE 3: OTHER PLAYERS' SCREENS (Generic only: "🔄 Card Swapping...")      */}
        {/* ========================================================================= */}
        {isSpectator && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Header: 🔄 Card Swapping... */}
            <div style={{
              background: 'rgba(59, 23, 100, 0.7)',
              border: '1.5px solid var(--border-gold)',
              borderRadius: '999px',
              padding: '0.6rem 2rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '1.25rem',
              color: 'var(--gold-primary)',
              fontWeight: 'bold',
              fontSize: '1.35rem',
              boxShadow: 'var(--shadow-gold)'
            }}>
              <span>🔄 Card Swapping...</span>
            </div>

            {/* Shimmering Mystery Cards (No roles or player names revealed!) */}
            <div className="swap-animation-box" style={{ margin: '1.5rem auto', maxWidth: '380px' }}>
              <div
                className="swap-card"
                style={{
                  transform: phase === 'SWAPPING' ? 'translateX(70%) scale(0.95)' : 'translateX(0) scale(1)',
                  borderColor: 'var(--border-gold)'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🛡️</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Secret Card
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--gold-light)', marginTop: '0.25rem' }}>
                  🔒 Hidden
                </div>
              </div>

              <div className="swap-indicator-icon" style={{ fontSize: '2rem' }}>
                ⇄
              </div>

              <div
                className="swap-card"
                style={{
                  transform: phase === 'SWAPPING' ? 'translateX(-70%) scale(0.95)' : 'translateX(0) scale(1)',
                  borderColor: 'var(--border-gold)'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🛡️</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Secret Card
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--gold-light)', marginTop: '0.25rem' }}>
                  🔒 Hidden
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Continue Action Button */}
        <button
          onClick={onComplete}
          className="btn btn-royal-outline btn-sm"
          style={{ marginTop: '1.75rem', padding: '0.55rem 2rem' }}
        >
          Continue Game ➔
        </button>
      </div>
    </div>
  );
}
