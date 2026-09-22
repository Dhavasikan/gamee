import React, { useState } from 'react';
import { sound } from '../audio/soundEffects';

export default function LobbyPage({
  room,
  currentPlayer,
  onStartGame,
  onAddBots,
  onRemoveBot,
  onLeaveRoom,
  loading
}) {
  const [copied, setCopied] = useState(false);

  if (!room) return null;

  const isHost = currentPlayer?.isHost;
  const players = room.players || [];
  const playerCount = players.length;
  const isReady = playerCount === 6;

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    sound.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      maxWidth: '680px',
      margin: '0 auto',
      width: '100%',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    }}>
      {/* Lobby Header Card */}
      <div className="royal-panel ornate-border" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <span className="royal-badge" style={{ marginBottom: '0.75rem' }}>
          🏰 Royal Chamber Lobby
        </span>

        <h2 className="font-serif gold-gradient-text" style={{ fontSize: '2rem', margin: '0.25rem 0' }}>
          Room {room.code}
        </h2>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Share this chamber code with your friends to assemble the royal court
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={copyCode} className="btn btn-gold btn-sm">
            <span>{copied ? '✓ Copied to Clipboard!' : '📋 Copy Room Code'}</span>
          </button>
          <button onClick={onLeaveRoom} className="btn btn-secondary btn-sm">
            🚪 Leave Chamber
          </button>
        </div>
      </div>

      {/* Players Court Roster */}
      <div className="royal-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 className="font-serif" style={{ color: 'var(--gold-primary)', margin: 0, fontSize: '1.2rem' }}>
              👥 Royal Court ({playerCount}/6)
            </h3>
            <span style={{ fontSize: '0.8rem', color: isReady ? '#4ade80' : 'var(--gold-light)' }}>
              {isReady ? '✨ All 6 court members ready!' : `Waiting for ${6 - playerCount} more player(s)...`}
            </span>
          </div>

          {isHost && !isReady && (
            <button
              onClick={() => {
                sound.playClick();
                onAddBots();
              }}
              className="btn btn-royal-outline btn-sm"
              title="Add Royal AI bots to quickly fill the remaining slots"
            >
              🤖 Fill with Royal Bots
            </button>
          )}
        </div>

        {/* Player Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {players.map((p, idx) => (
            <div
              key={p.id}
              style={{
                background: p.id === currentPlayer?.id ? 'rgba(89, 36, 150, 0.4)' : 'rgba(255, 255, 255, 0.04)',
                border: p.id === currentPlayer?.id ? '1.5px solid var(--gold-primary)' : '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '0.75rem',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: p.isHost ? 'var(--gold-gradient)' : 'rgba(255, 255, 255, 0.1)',
                  color: p.isHost ? '#1a0f00' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}>
                  {p.isHost ? '👑' : p.isBot ? '🤖' : '👤'}
                </div>

                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem', color: p.id === currentPlayer?.id ? 'var(--gold-primary)' : 'white' }}>
                    {p.name} {p.id === currentPlayer?.id && <span style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>(You)</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {p.isHost ? 'Chamber Host' : p.isBot ? 'Royal AI Guard' : 'Player'}
                  </div>
                </div>
              </div>

              {isHost && p.isBot && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onRemoveBot(p.id);
                  }}
                  title="Remove Bot"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0.2rem'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {/* Empty slot placeholders */}
          {Array.from({ length: Math.max(0, 6 - playerCount) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              style={{
                border: '1.5px dashed rgba(255, 215, 0, 0.2)',
                borderRadius: '0.75rem',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: 'rgba(255, 255, 255, 0.3)'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px dashed rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                🔒
              </div>
              <span style={{ fontSize: '0.85rem' }}>Waiting for player...</span>
            </div>
          ))}
        </div>

        {/* Start Game Action */}
        <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
          {isHost ? (
            <div>
              <button
                onClick={() => {
                  sound.playClick();
                  onStartGame();
                }}
                disabled={!isReady || loading}
                className="btn btn-gold btn-lg"
                style={{ width: '100%', maxWidth: '360px' }}
              >
                {loading ? 'Dealing Secret Cards...' : isReady ? '▶ START ROYAL GAME' : `Need 6 Players (${playerCount}/6)`}
              </button>
              {!isReady && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Click "Fill with Royal Bots" above to test or start immediately!
                </p>
              )}
            </div>
          ) : (
            <div style={{
              background: 'rgba(255, 215, 0, 0.08)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              borderRadius: '0.75rem',
              padding: '1rem',
              color: 'var(--gold-light)'
            }}>
              ⏳ Waiting for the Host ({players.find(p => p.isHost)?.name || 'Host'}) to start the game...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
