import React, { useState } from 'react';
import { sound } from '../audio/soundEffects';

export default function HomePage({ onCreateRoom, onJoinRoom, onOpenRules, loading, error }) {
  const [mode, setMode] = useState('MAIN'); // 'MAIN', 'CREATE', 'JOIN'
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [localError, setLocalError] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setLocalError('Please enter your name');
      return;
    }
    setLocalError('');
    sound.playClick();
    onCreateRoom(playerName.trim());
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setLocalError('Please enter a room code');
      return;
    }
    if (!playerName.trim()) {
      setLocalError('Please enter your name');
      return;
    }
    setLocalError('');
    sound.playClick();
    onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: '2rem 1rem',
      maxWidth: '560px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Royal Crown & Title Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          fontSize: '4.5rem',
          filter: 'drop-shadow(0 0 25px rgba(255, 215, 0, 0.6))',
          animation: 'float 3s ease-in-out infinite',
          lineHeight: 1
        }}>
          👑
        </div>
        
        <h1 className="font-decorative gold-gradient-text" style={{
          fontSize: '2.8rem',
          margin: '0.5rem 0 0.2rem',
          fontWeight: 900,
          textShadow: '0 4px 20px rgba(0,0,0,0.8)'
        }}>
          RAJA RANI
        </h1>
        
        <p style={{
          fontFamily: 'var(--font-serif)',
          color: 'var(--gold-light)',
          fontSize: '1.15rem',
          letterSpacing: '1px',
          opacity: 0.95
        }}>
          “Predict wisely. Protect your crown.”
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '0.6rem' }}>
          {['👑 Raja', '👸 Rani', '🧙 Manthiri', '👮 Police', '⚔️ Sippai', '🕵️ Thirudan'].map((r, i) => (
            <span key={i} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
              {r.split(' ')[0]}
            </span>
          ))}
        </div>
      </div>

      {/* Main Card Panel */}
      <div className="royal-panel ornate-border" style={{ width: '100%', padding: '2rem 1.5rem' }}>
        {(error || localError) && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            marginBottom: '1.25rem',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            ⚠️ {error || localError}
          </div>
        )}

        {mode === 'MAIN' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={() => {
                sound.playClick();
                setMode('CREATE');
              }}
              className="btn btn-gold btn-lg"
              style={{ width: '100%' }}
            >
              <span style={{ fontSize: '1.3rem' }}>🎮</span> Create Room
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setMode('JOIN');
              }}
              className="btn btn-royal-outline btn-lg"
              style={{ width: '100%' }}
            >
              <span style={{ fontSize: '1.3rem' }}>🚪</span> Join Room
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenRules();
              }}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <span>📖</span> How to Play & Rules
            </button>
          </div>
        )}

        {mode === 'CREATE' && (
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="font-serif" style={{ color: 'var(--gold-primary)', margin: 0 }}>
                👑 Host a Royal Chamber
              </h3>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMode('MAIN');
                }}
                className="btn btn-secondary btn-sm"
              >
                Back
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Your Royal Name
              </label>
              <input
                type="text"
                placeholder="e.g. King Arun"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                maxLength={20}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(15, 10, 30, 0.8)',
                  border: '1.5px solid var(--border-gold)',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-gold btn-lg"
              style={{ width: '100%' }}
            >
              {loading ? 'Creating Chamber...' : '✨ Generate Room Code'}
            </button>
          </form>
        )}

        {mode === 'JOIN' && (
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="font-serif" style={{ color: 'var(--gold-primary)', margin: 0 }}>
                🚪 Enter Royal Chamber
              </h3>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMode('MAIN');
                }}
                className="btn btn-secondary btn-sm"
              >
                Back
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Room Code
              </label>
              <input
                type="text"
                placeholder="e.g. RR-7K29"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                maxLength={8}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(15, 10, 30, 0.8)',
                  border: '1.5px solid var(--border-gold)',
                  color: 'var(--gold-primary)',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  outline: 'none',
                  textAlign: 'center'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Vijay"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                maxLength={20}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(15, 10, 30, 0.8)',
                  border: '1.5px solid var(--border-gold)',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-gold btn-lg"
              style={{ width: '100%' }}
            >
              {loading ? 'Entering Chamber...' : '🏰 Join Chamber'}
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
