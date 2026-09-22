import React, { useState } from 'react';
import { sound } from '../audio/soundEffects';

export default function SecretCardModal({ secretRole, isOpen, onClose }) {
  const [isFlipped, setIsFlipped] = useState(true);

  if (!isOpen || !secretRole) return null;

  const roleDetails = secretRole.roleDetails || {
    id: secretRole.character,
    name: secretRole.character,
    emoji: '🃏',
    points: 0
  };

  const handleFlip = () => {
    sound.playCardFlip();
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '380px',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          alignItems: 'center'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span className="royal-badge">
            🔒 Secret Character Inspection
          </span>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Tap the card to flip and hide/reveal
          </p>
        </div>

        {/* 3D Flip Card Container */}
        <div
          className={`flip-card ${isFlipped ? 'flipped' : ''}`}
          onClick={handleFlip}
          style={{ width: '280px', height: '400px' }}
        >
          <div className="flip-card-inner">
            {/* Front: Hidden / Seal */}
            <div className="flip-card-front ornate-border">
              <div style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))' }}>
                🛡️
              </div>
              <h3 className="font-serif gold-gradient-text" style={{ fontSize: '1.4rem', marginTop: '1rem' }}>
                SECRET CARD
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Hidden from other players
              </p>
              <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--gold-primary)', border: '1px solid var(--border-gold)', padding: '0.4rem 0.8rem', borderRadius: '999px' }}>
                👆 Tap to Reveal
              </div>
            </div>

            {/* Back: Revealed Role */}
            <div className="flip-card-back ornate-border">
              <div style={{
                fontSize: '5.5rem',
                filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.8))',
                lineHeight: 1
              }}>
                {roleDetails.emoji}
              </div>

              <h2 className="font-decorative gold-gradient-text" style={{ fontSize: '2.2rem', margin: '0.75rem 0 0.2rem' }}>
                {roleDetails.name.toUpperCase()}
              </h2>

              <div style={{
                background: 'rgba(255, 215, 0, 0.15)',
                border: '1px solid var(--gold-primary)',
                padding: '0.3rem 0.9rem',
                borderRadius: '999px',
                color: 'var(--gold-light)',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                marginBottom: '1rem'
              }}>
                ⭐ {roleDetails.points} Points Value
              </div>

              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', textAlign: 'center', margin: 0 }}>
                {roleDetails.id === 'raja' && '👑 You are the King! Reveal yourself and find Rani.'}
                {roleDetails.id === 'rani' && '👸 You are the Queen! If Raja finds you, you become active and search for Manthiri.'}
                {roleDetails.id === 'manthiri' && '🧙 You are the Minister! If found, you become active and search for Police.'}
                {roleDetails.id === 'police' && '👮 You are the Police! If found, you become active and search for Sippai.'}
                {roleDetails.id === 'sippai' && '⚔️ You are the Soldier! If found, you must locate the Thirudan (Thief).'}
                {roleDetails.id === 'thirudan' && '🕵️ You are the Thief! Try to stay hidden. You carry 0 points.'}
              </p>

              <div style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                👆 Tap to Conceal
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn btn-gold btn-sm"
          style={{ marginTop: '1.5rem', padding: '0.6rem 2rem' }}
        >
          Return to Arena
        </button>
      </div>
    </div>
  );
}
