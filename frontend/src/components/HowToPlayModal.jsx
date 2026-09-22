import React from 'react';

export default function HowToPlayModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="font-serif gold-gradient-text" style={{ fontSize: '1.5rem', margin: 0 }}>
            📖 How to Play Raja Rani
          </h2>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}>
            ✕
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
          
          <div style={{ background: 'rgba(255, 215, 0, 0.08)', padding: '1rem', borderRadius: '0.75rem', borderLeft: '4px solid var(--gold-primary)' }}>
            <h4 className="font-serif" style={{ color: 'var(--gold-primary)', marginBottom: '0.35rem' }}>
              🎯 The Core Objective
            </h4>
            <p style={{ color: '#cbd5e1' }}>
              6 players receive secret character cards. You must predict who holds each role in sequential royal order.
            </p>
          </div>

          <div>
            <h4 className="font-serif" style={{ color: 'var(--gold-light)', marginBottom: '0.5rem' }}>
              👑 The 6 Characters & Sequential Chain
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
              {[
                { role: 'Raja', emoji: '👑', pts: 100, color: '#ffd700' },
                { role: 'Rani', emoji: '👸', pts: 80, color: '#f472b6' },
                { role: 'Manthiri', emoji: '🧙', pts: 60, color: '#c084fc' },
                { role: 'Police', emoji: '👮', pts: 40, color: '#60a5fa' },
                { role: 'Sippai', emoji: '⚔️', pts: 20, color: '#4ade80' },
                { role: 'Thirudan', emoji: '🕵️', pts: 0, color: '#94a3b8' }
              ].map(c => (
                <div key={c.role} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '0.5rem', padding: '0.6rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem' }}>{c.emoji}</div>
                  <div style={{ fontWeight: 'bold', color: c.color }}>{c.role}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.pts} Pts</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '0.6rem', color: 'var(--gold-primary)', fontWeight: 'bold', fontSize: '0.85rem' }}>
              Raja ➔ Rani ➔ Manthiri ➔ Police ➔ Sippai ➔ Thirudan (Thief)
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <h4 className="font-serif" style={{ color: '#4ade80', marginBottom: '0.35rem' }}>
              ✅ When a Prediction is CORRECT
            </h4>
            <ul style={{ paddingLeft: '1.25rem', color: '#cbd5e1' }}>
              <li>The target character is publicly revealed!</li>
              <li>The active predictor is awarded the <strong>target character’s points</strong> (e.g. Raja receives 80 pts for finding Rani).</li>
              <li>The found player becomes the new active turn, advancing to the next target role!</li>
            </ul>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <h4 className="font-serif" style={{ color: '#f87171', marginBottom: '0.35rem' }}>
              🔄 The Most Important Rule: WRONG GUESS = ROLE SWAP!
            </h4>
            <p style={{ color: '#cbd5e1', marginBottom: '0.5rem' }}>
              If your guess is wrong, you do NOT simply pass turn:
            </p>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.75rem', padding: '0.85rem' }}>
              <p style={{ fontWeight: '600', color: '#fca5a5', margin: 0 }}>
                The active character and the wrongly selected player’s character are SWAPPED!
              </p>
              <p style={{ color: '#e2e8f0', fontSize: '0.88rem', marginTop: '0.4rem', margin: 0 }}>
                Example: Raja guesses Karthik is Rani, but Karthik was Police.
                <br />➔ Karthik becomes the NEW RAJA!
                <br />➔ Old Raja receives Police!
                <br />➔ Karthik now tries to find Rani again!
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <h4 className="font-serif" style={{ color: 'var(--gold-light)', marginBottom: '0.35rem' }}>
              🏆 Ending & Winning
            </h4>
            <p style={{ color: '#cbd5e1' }}>
              When Sippai correctly identifies Thirudan (0 pts), the round concludes. The player with the highest total score wins the Royal Crown!
            </p>
          </div>

        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-gold)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-gold btn-sm">
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
}
