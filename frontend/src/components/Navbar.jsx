import React, { useState } from 'react';
import { sound } from '../audio/soundEffects';

export default function Navbar({ roomCode, connected, onOpenRules, onLeaveRoom }) {
  const [isMuted, setIsMuted] = useState(sound.muted);
  const [copied, setCopied] = useState(false);

  const toggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  const copyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    sound.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header style={{
      width: '100%',
      padding: '0.85rem 1.5rem',
      background: 'rgba(12, 8, 26, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-gold)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.75rem', filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.5))' }}>👑</span>
        <div>
          <h1 className="font-serif gold-gradient-text" style={{ fontSize: '1.25rem', lineHeight: '1', margin: 0, fontWeight: 700 }}>
            RAJA RANI
          </h1>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
            ROYAL MULTIPLAYER
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {roomCode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={copyCode}
              className="btn btn-royal-outline btn-sm"
              title="Click to copy room code"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              <span>{roomCode}</span>
              <span style={{ fontSize: '0.9rem' }}>{copied ? '✓' : '📋'}</span>
            </button>
            {onLeaveRoom && (
              <button
                onClick={onLeaveRoom}
                className="btn btn-secondary btn-sm"
                title="Leave Room"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
              >
                Exit
              </button>
            )}
          </div>
        )}

        <button
          onClick={toggleMute}
          className="btn btn-secondary btn-sm"
          style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}
          title={isMuted ? 'Unmute Sounds' : 'Mute Sounds'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenRules();
          }}
          className="btn btn-royal-outline btn-sm"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
        >
          📖 Rules
        </button>

        <div
          title={connected ? 'Connected to Royal Server' : 'Connecting to Server...'}
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: connected ? '#10b981' : '#ef4444',
            boxShadow: connected ? '0 0 8px #10b981' : '0 0 8px #ef4444'
          }}
        />
      </div>
    </header>
  );
}
