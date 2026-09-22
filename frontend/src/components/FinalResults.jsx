import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../audio/soundEffects';

export default function FinalResults({
  room,
  currentPlayer,
  onRematch,
  onLeaveRoom,
  loading
}) {
  const isHost = currentPlayer?.isHost;
  const gameState = room?.gameState;
  const players = gameState?.players || room?.players || [];

  // Sort players by total score
  const rankedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const winner = rankedPlayers[0];
  const stats = gameState?.stats || {};

  useEffect(() => {
    sound.playThiefFound();
    try {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#ffd700', '#f59e0b', '#ec4899', '#3b82f6', '#10b981']
      });
    } catch {
      // ignore
    }
  }, []);

  const getRankBadge = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div style={{
      maxWidth: '680px',
      margin: '0 auto',
      width: '100%',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      animation: 'fadeIn 0.4s ease'
    }}>
      {/* Crown Banner */}
      <div className="royal-panel ornate-border" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 0 25px rgba(255, 215, 0, 0.7))', lineHeight: 1 }}>
          👑
        </div>

        <h1 className="font-decorative gold-gradient-text" style={{ fontSize: '2.5rem', margin: '0.5rem 0 0.2rem' }}>
          GAME OVER
        </h1>

        <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-light)', fontSize: '1.1rem' }}>
          The Thief Has Been Captured! All Roles Revealed.
        </p>

        {winner && (
          <div style={{
            marginTop: '1.25rem',
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(89, 36, 150, 0.3) 100%)',
            border: '2px solid var(--gold-primary)',
            borderRadius: '1rem',
            padding: '1rem',
            display: 'inline-block'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              👑 Grand Royal Champion
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', marginTop: '0.2rem' }}>
              {winner.name}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--gold-primary)' }}>
              ⭐ {winner.score || 0} Total Points
            </div>
          </div>
        )}
      </div>

      {/* Royal Scoreboard Rankings */}
      <div className="royal-panel" style={{ padding: '1.5rem' }}>
        <h3 className="font-serif" style={{ color: 'var(--gold-primary)', marginBottom: '1rem', fontSize: '1.2rem' }}>
          🏆 Court Rankings & Final Scores
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {rankedPlayers.map((p, idx) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '0.75rem',
                background: idx === 0
                  ? 'rgba(255, 215, 0, 0.15)'
                  : p.id === currentPlayer?.id
                  ? 'rgba(89, 36, 150, 0.35)'
                  : 'rgba(255, 255, 255, 0.04)',
                border: idx === 0
                  ? '1.5px solid var(--gold-primary)'
                  : p.id === currentPlayer?.id
                  ? '1px solid rgba(255, 215, 0, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.4rem', width: '32px', textAlign: 'center' }}>
                  {getRankBadge(idx)}
                </span>
                <div>
                  <div style={{ fontWeight: 'bold', color: p.id === currentPlayer?.id ? 'var(--gold-primary)' : 'white' }}>
                    {p.name} {p.id === currentPlayer?.id && <span style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>(You)</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    End Role: {p.character?.toUpperCase() || 'Secret'}
                  </div>
                </div>
              </div>

              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--gold-light)' }}>
                {p.score || 0} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match Statistics Summary */}
      <div className="royal-panel" style={{ padding: '1.5rem' }}>
        <h3 className="font-serif" style={{ color: 'var(--gold-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>
          📊 Game Summary & Statistics
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.85rem', borderRadius: '0.75rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Predictions</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'white' }}>{stats.totalPredictions || 0}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.85rem', borderRadius: '0.75rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Character Swaps</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#fca5a5' }}>{stats.characterTransfers || 0}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.85rem', borderRadius: '0.75rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Correct Guesses</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#86efac' }}>{stats.correctPredictions || 0}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.85rem', borderRadius: '0.75rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rounds Completed</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--gold-light)' }}>{room?.roundsPlayed || 1}</div>
          </div>
        </div>
      </div>

      {/* Rematch Actions */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {isHost ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={() => {
                sound.playClick();
                onRematch(false); // Continue Tournament (cumulative scores)
              }}
              disabled={loading}
              className="btn btn-gold btn-lg"
              style={{ width: '100%', maxWidth: '360px' }}
            >
              🔄 Rematch (Keep Scores)
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onRematch(true); // New Game (reset scores)
              }}
              disabled={loading}
              className="btn btn-royal-outline"
              style={{ width: '100%', maxWidth: '360px' }}
            >
              ✨ Start Fresh Game (Reset Scores)
            </button>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255, 215, 0, 0.08)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            borderRadius: '0.75rem',
            padding: '1rem',
            color: 'var(--gold-light)'
          }}>
            ⏳ Waiting for the Host ({players.find(p => p.isHost)?.name || 'Host'}) to start next round...
          </div>
        )}

        <button
          onClick={onLeaveRoom}
          className="btn btn-secondary btn-sm"
          style={{ alignSelf: 'center', marginTop: '0.5rem' }}
        >
          🚪 Leave Chamber to Home
        </button>
      </div>
    </div>
  );
}
