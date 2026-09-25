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
        {/* CASE 1: GUESSER'S SCREEN (e.g. Arun)                                      */}
        {/* ========================================================================= */}
        {isGuesser && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Header: ❌ Wrong Guess */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.22)',
              border: '1.5px solid #ef4444',
              borderRadius: '999px',
              padding: '0.5rem 1.6rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.85rem',
              color: '#fca5a5',
              fontWeight: 'bold',
              fontSize: '1.15rem',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
            }}>
              <span>❌ Wrong Guess</span>
            </div>

            {/* Subtitle: 🔄 Your card has been swapped */}
            <h2 className="font-serif gold-gradient-text" style={{ fontSize: '1.75rem', margin: '0.35rem 0' }}>
              🔄 Your card has been swapped
            </h2>

            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Your prediction was incorrect. Your role has been privately exchanged.
            </p>

            {/* Secret Swapped Card Reveal */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(42, 23, 76, 0.95) 0%, rgba(18, 10, 36, 0.95) 100%)',
              border: '2px solid var(--gold-primary)',
              borderRadius: '1.25rem',
              padding: '1.75rem 1.25rem',
              boxShadow: 'var(--shadow-gold), 0 10px 30px rgba(0,0,0,0.6)',
              maxWidth: '340px',
              margin: '0 auto',
              transition: 'transform 0.4s ease'
            }}>
              <div style={{
                fontSize: '4.5rem',
                lineHeight: 1,
                marginBottom: '0.65rem',
                filter: 'drop-shadow(0 0 16px rgba(255, 215, 0, 0.5))'
              }}>
                {privateSwapInfo.roleEmoji || '🃏'}
              </div>

              {/* Requirement: 👮 Your new role: Police */}
              <div style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--gold-primary)',
                fontFamily: 'var(--font-serif)',
                letterSpacing: '0.5px',
                margin: '0.5rem 0 0.25rem'
              }}>
                {privateSwapInfo.roleEmoji} Your new role: {privateSwapInfo.roleName}
              </div>

              <div style={{
                fontSize: '0.8rem',
                color: 'var(--gold-light)',
                background: 'rgba(255, 215, 0, 0.1)',
                padding: '0.3rem 0.8rem',
                borderRadius: '999px',
                display: 'inline-block',
                marginTop: '0.5rem'
              }}>
                🔒 Private to you and the target player
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE 2: SELECTED / TARGET PLAYER'S SCREEN (e.g. Karthik)                  */}
        {/* ========================================================================= */}
        {isTarget && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Header: 🔄 Your card has been swapped */}
            <div style={{
              background: 'rgba(255, 215, 0, 0.2)',
              border: '1.5px solid var(--gold-primary)',
              borderRadius: '999px',
              padding: '0.5rem 1.6rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.85rem',
              color: 'var(--gold-light)',
              fontWeight: 'bold',
              fontSize: '1.15rem',
              boxShadow: 'var(--shadow-gold)'
            }}>
              <span>🔄 Your card has been swapped</span>
            </div>

            <h2 className="font-serif gold-gradient-text" style={{ fontSize: '1.75rem', margin: '0.35rem 0' }}>
              The Seeker Made an Incorrect Guess!
            </h2>

            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              You were guessed incorrectly. You have received the active role!
            </p>

            {/* Secret Swapped Card Reveal */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(42, 23, 76, 0.95) 0%, rgba(18, 10, 36, 0.95) 100%)',
              border: '2px solid var(--gold-primary)',
              borderRadius: '1.25rem',
              padding: '1.75rem 1.25rem',
              boxShadow: 'var(--shadow-gold), 0 10px 30px rgba(0,0,0,0.6)',
              maxWidth: '340px',
              margin: '0 auto'
            }}>
              <div style={{
                fontSize: '4.5rem',
                lineHeight: 1,
                marginBottom: '0.65rem',
                filter: 'drop-shadow(0 0 16px rgba(255, 215, 0, 0.6))'
              }}>
                {privateSwapInfo.roleEmoji || '👑'}
              </div>

              {/* Requirement: 👑 Your new role: Raja */}
              <div style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--gold-primary)',
                fontFamily: 'var(--font-serif)',
                letterSpacing: '0.5px',
                margin: '0.5rem 0 0.25rem'
              }}>
                {privateSwapInfo.roleEmoji} Your new role: {privateSwapInfo.roleName}
              </div>

              <div style={{
                fontSize: '0.8rem',
                color: '#86efac',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '0.3rem 0.8rem',
                borderRadius: '999px',
                display: 'inline-block',
                marginTop: '0.5rem'
              }}>
                👉 Turn transfers to you to find the target!
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE 3: OTHER PLAYERS' SCREENS (Generic only, ZERO role leakage)          */}
        {/* ========================================================================= */}
        {isSpectator && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Header: 🔄 Card Swapping... */}
            <div style={{
              background: 'rgba(59, 23, 100, 0.7)',
              border: '1.5px solid var(--border-gold)',
              borderRadius: '999px',
              padding: '0.5rem 1.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '1rem',
              color: 'var(--gold-primary)',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              boxShadow: 'var(--shadow-gold)'
            }}>
              <span>🔄 Card Swapping...</span>
            </div>

            <h2 className="font-serif gold-gradient-text" style={{ fontSize: '1.8rem', margin: '0.35rem 0' }}>
              Secret Roles Swapping
            </h2>

            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
              A player made an incorrect guess. The two cards are exchanging hands.
            </p>

            {/* Shimmering Mystery Cards (No roles revealed!) */}
            <div className="swap-animation-box" style={{ margin: '1.25rem auto', maxWidth: '380px' }}>
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

            <div style={{
              background: 'rgba(26, 17, 49, 0.85)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              borderRadius: '0.85rem',
              padding: '0.85rem 1.25rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              maxWidth: '380px',
              margin: '0 auto'
            }}>
              🔒 Role details are strictly private to the two players involved.
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
