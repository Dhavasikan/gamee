import React, { useState } from 'react';
import { sound } from '../audio/soundEffects';
import PredictionModal from './PredictionModal';
import SecretCardModal from './SecretCardModal';
import GameHistory from './GameHistory';

const ROLES_INFO = {
  raja: { name: 'Raja', emoji: '👑', points: 100 },
  rani: { name: 'Rani', emoji: '👸', points: 80 },
  manthiri: { name: 'Manthiri', emoji: '🧙', points: 60 },
  police: { name: 'Police', emoji: '👮', points: 40 },
  sippai: { name: 'Sippai', emoji: '⚔️', points: 20 },
  thirudan: { name: 'Thirudan', emoji: '🕵️', points: 0 }
};

export default function GameBoard({
  room,
  currentPlayer,
  secretRole,
  onRevealRaja,
  onMakePrediction,
  onTogglePause,
  disconnectedPlayer,
  loading
}) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);

  const gameState = room?.gameState;
  if (!gameState) return null;

  const {
    status,
    currentRole,
    targetRole,
    activePlayerId,
    rajaRevealed,
    players,
    history
  } = gameState;

  const isMyTurn = activePlayerId === currentPlayer?.id;
  const isHost = currentPlayer?.isHost;
  const activePlayerObj = players.find(p => p.id === activePlayerId);
  const iAmRaja = secretRole?.character === 'raja';
  const targetRoleObj = ROLES_INFO[targetRole] || { name: targetRole, emoji: '🎯', points: 0 };
  const currentRoleObj = ROLES_INFO[currentRole] || { name: currentRole, emoji: '👑' };

  // Handle clicking a player card to guess
  const handleSelectPlayer = (player) => {
    if (!isMyTurn) return;
    if (player.id === currentPlayer?.id) return;
    if (player.completed) return; // Requirement 2: Completed player cannot be selected again
    if (player.isRevealed && player.revealedRole !== targetRole) {
      // Player already revealed as something else
      return;
    }

    sound.playClick();
    setSelectedPlayer(player);
    setShowConfirmModal(true);
  };

  const handleConfirmGuess = () => {
    if (!selectedPlayer) return;
    onMakePrediction(selectedPlayer.id);
    setShowConfirmModal(false);
    setSelectedPlayer(null);
  };

  return (
    <div style={{
      maxWidth: '780px',
      margin: '0 auto',
      width: '100%',
      padding: '1.25rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      {/* Disconnect Alert */}
      {disconnectedPlayer && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.25)',
          border: '1.5px solid #ef4444',
          color: '#fca5a5',
          padding: '0.75rem 1rem',
          borderRadius: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.9rem'
        }}>
          <div>⚠️ <strong>{disconnectedPlayer.name}</strong> disconnected from chamber.</div>
          {isHost && (
            <button onClick={onTogglePause} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.6rem' }}>
              {room.status === 'PAUSED' ? 'Resume Game' : 'Pause Game'}
            </button>
          )}
        </div>
      )}

      {/* Paused State Banner */}
      {room.status === 'PAUSED' && (
        <div style={{
          background: 'rgba(234, 179, 8, 0.2)',
          border: '1.5px solid #eab308',
          color: '#fde047',
          padding: '0.75rem 1rem',
          borderRadius: '0.75rem',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          ⏸️ The chamber is currently paused by the Host.
        </div>
      )}

      {/* Top Status & Turn Centerpiece */}
      <div className="royal-panel ornate-border" style={{ padding: '1.5rem 1.25rem', textAlign: 'center' }}>
        {/* Sequence Tracker Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.35rem',
          marginBottom: '1rem',
          flexWrap: 'wrap'
        }}>
          {['raja', 'rani', 'manthiri', 'police', 'sippai', 'thirudan'].map((rId, i) => {
            const rObj = ROLES_INFO[rId];
            const isTarget = targetRole === rId;
            const isCurrent = currentRole === rId;
            const isPast = ['raja', 'rani', 'manthiri', 'police', 'sippai', 'thirudan'].indexOf(targetRole) > i;

            return (
              <React.Fragment key={rId}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: isTarget || isCurrent ? 'bold' : 'normal',
                  background: isTarget
                    ? 'rgba(56, 189, 248, 0.3)'
                    : isCurrent
                    ? 'rgba(255, 215, 0, 0.25)'
                    : isPast
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isTarget
                    ? '1.5px solid #38bdf8'
                    : isCurrent
                    ? '1.5px solid var(--gold-primary)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  color: isTarget ? '#7dd3fc' : isCurrent ? 'var(--gold-light)' : isPast ? '#64748b' : '#94a3b8'
                }}>
                  <span>{rObj.emoji}</span>
                  <span>{rObj.name}</span>
                </div>
                {i < 5 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>➔</span>}
              </React.Fragment>
            );
          })}
        </div>

        {/* Phase 1: Raja Needs to Reveal */}
        {!rajaRevealed ? (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👑</div>
            <h2 className="font-serif gold-gradient-text" style={{ fontSize: '1.75rem', margin: '0.2rem 0' }}>
              REVEAL THE RAJA
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              The royal cards have been dealt. The player holding Raja must step forth!
            </p>

            {iAmRaja ? (
              <div style={{
                background: 'rgba(255, 215, 0, 0.15)',
                border: '2px solid var(--gold-primary)',
                borderRadius: '1rem',
                padding: '1.25rem',
                maxWidth: '420px',
                margin: '0 auto',
                boxShadow: 'var(--shadow-gold)'
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--gold-primary)', marginBottom: '0.5rem' }}>
                  👑 YOU HOLD THE RAJA!
                </div>
                <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '1rem' }}>
                  Reveal your majesty to the court to begin the royal predictions.
                </p>
                <button
                  onClick={() => {
                    sound.playRajaReveal();
                    onRevealRaja();
                  }}
                  disabled={loading}
                  className="btn btn-gold btn-lg"
                  style={{ width: '100%' }}
                >
                  👑 I AM RAJA
                </button>
              </div>
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '0.75rem',
                padding: '1rem',
                color: 'var(--gold-light)',
                maxWidth: '420px',
                margin: '0 auto'
              }}>
                ⏳ Waiting for the secret Raja to reveal themselves to the room...
              </div>
            )}
          </div>
        ) : (
          /* Phase 2: Active Turn & Target Prediction */
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 1rem',
              background: 'rgba(255, 215, 0, 0.12)',
              border: '1px solid var(--border-gold)',
              borderRadius: '999px',
              fontSize: '0.85rem',
              color: 'var(--gold-primary)',
              marginBottom: '0.75rem'
            }}>
              <span>CURRENT TURN</span>
            </div>

            <h2 className="font-serif" style={{ fontSize: '1.8rem', margin: '0.2rem 0', color: 'white' }}>
              {currentRoleObj.emoji} {activePlayerObj?.name} — {currentRoleObj.name.toUpperCase()}
            </h2>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(37, 99, 235, 0.2) 100%)',
              border: '1.5px solid #38bdf8',
              borderRadius: '1rem',
              padding: '0.75rem 1.75rem',
              marginTop: '0.75rem'
            }}>
              <span style={{ fontSize: '1.1rem', color: '#7dd3fc', fontWeight: 'bold' }}>FIND:</span>
              <span style={{ fontSize: '1.5rem' }}>{targetRoleObj.emoji}</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>
                {targetRoleObj.name.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#93c5fd', marginLeft: '0.4rem' }}>
                ({targetRoleObj.points} Pts)
              </span>
            </div>

            <p style={{
              fontSize: '0.9rem',
              color: isMyTurn ? '#86efac' : 'var(--text-muted)',
              marginTop: '1rem',
              fontWeight: isMyTurn ? 'bold' : 'normal'
            }}>
              {isMyTurn
                ? `👉 It's your turn! Select a player below whom you suspect is ${targetRoleObj.name}.`
                : `Waiting for ${activePlayerObj?.name} to select who holds ${targetRoleObj.name}...`}
            </p>
          </div>
        )}
      </div>

      {/* Secret Card Floating Badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(40, 24, 75, 0.6)',
        border: '1.5px solid var(--border-gold)',
        borderRadius: '0.85rem',
        padding: '0.75rem 1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{secretRole?.roleDetails?.emoji || '🔒'}</span>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Your Secret Character
            </div>
            <div style={{ fontWeight: 'bold', color: 'var(--gold-primary)', fontSize: '1.05rem' }}>
              {secretRole?.roleDetails?.name?.toUpperCase() || 'Hidden'}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setShowSecretModal(true);
          }}
          className="btn btn-royal-outline btn-sm"
        >
          👁️ View My Card
        </button>
      </div>

      {/* 6 Players Chamber Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 className="font-serif" style={{ color: 'var(--gold-primary)', margin: 0, fontSize: '1.1rem' }}>
            👑 The Royal Court
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isMyTurn ? 'Tap an unrevealed player to guess' : 'Private roles remain hidden 🔒'}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '0.85rem'
        }}>
          {players.map(p => {
            const isMe = p.id === currentPlayer?.id;
            const isTurnHolder = p.id === activePlayerId;
            const isCompleted = !!p.completed;
            const canSelect = isMyTurn && !isMe && !isCompleted && rajaRevealed && (!p.isRevealed || p.revealedRole === targetRole);
            const revealedRoleInfo = p.isRevealed ? ROLES_INFO[p.revealedRole] : null;

            return (
              <div
                key={p.id}
                onClick={() => canSelect && handleSelectPlayer(p)}
                className={`player-card ${isTurnHolder ? 'active-turn' : ''} ${isCompleted ? 'completed-locked' : ''} ${!canSelect && isMyTurn ? 'disabled' : ''}`}
                style={{
                  cursor: canSelect ? 'pointer' : isCompleted ? 'not-allowed' : 'default',
                  border: isTurnHolder
                    ? '2px solid var(--gold-primary)'
                    : isCompleted
                    ? '1.5px solid rgba(16, 185, 129, 0.6)'
                    : p.isRevealed
                    ? '1.5px solid rgba(16, 185, 129, 0.4)'
                    : '1.5px solid rgba(255, 215, 0, 0.2)',
                  opacity: isCompleted && !isTurnHolder ? 0.85 : 1
                }}
              >
                {/* Active Turn Crown Badge */}
                {isTurnHolder && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    background: 'var(--gold-gradient)',
                    color: '#1a0f00',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    padding: '0.15rem 0.6rem',
                    borderRadius: '999px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    textTransform: 'uppercase'
                  }}>
                    Active Turn
                  </div>
                )}

                {/* Avatar / Role Emoji */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: isCompleted
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.35) 100%)'
                    : p.isRevealed
                    ? 'linear-gradient(135deg, rgba(255,215,0,0.25) 0%, rgba(89,36,150,0.4) 100%)'
                    : 'rgba(255, 255, 255, 0.06)',
                  border: isCompleted
                    ? '2px solid #10b981'
                    : p.isRevealed
                    ? '2px solid var(--gold-primary)'
                    : '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isCompleted ? '2rem' : p.isRevealed ? '2rem' : '1.5rem',
                  filter: isCompleted
                    ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))'
                    : p.isRevealed
                    ? 'drop-shadow(0 0 8px rgba(255,215,0,0.4))'
                    : 'none'
                }}>
                  {isCompleted && p.revealedRole && revealedRoleInfo
                    ? revealedRoleInfo.emoji
                    : isCompleted
                    ? '🛡️'
                    : p.isRevealed && revealedRoleInfo
                    ? revealedRoleInfo.emoji
                    : isMe
                    ? secretRole?.roleDetails?.emoji || '👤'
                    : '👤'}
                </div>

                {/* Name & Badge */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem', color: isMe ? 'var(--gold-primary)' : 'white' }}>
                    {p.name} {isMe && <span style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>(You)</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', fontWeight: 600, marginTop: '0.15rem' }}>
                    ⭐ {p.score || 0} Points
                  </div>
                </div>

                {/* Status: Completed vs Revealed vs Hidden */}
                {isCompleted ? (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.18)',
                    border: '1.5px solid #10b981',
                    borderRadius: '0.65rem',
                    padding: '0.4rem 0.65rem',
                    marginTop: '0.35rem',
                    textAlign: 'center',
                    width: '100%'
                  }}>
                    <div style={{ color: '#6ee7b7', fontWeight: 'bold', fontSize: '0.82rem' }}>
                      🏆 Completed
                    </div>
                    <div style={{ color: '#a7f3d0', fontSize: '0.72rem', marginTop: '0.1rem' }}>
                      🔒 Cannot be selected again
                    </div>
                  </div>
                ) : (
                  <div style={{
                    fontSize: '0.78rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '999px',
                    background: p.isRevealed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    color: p.isRevealed ? '#6ee7b7' : 'var(--text-muted)',
                    border: p.isRevealed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    marginTop: '0.2rem'
                  }}>
                    {p.isRevealed && revealedRoleInfo
                      ? `${revealedRoleInfo.emoji} ${revealedRoleInfo.name}`
                      : isMe
                      ? `Your Card: ${secretRole?.roleDetails?.name || 'Secret'}`
                      : 'Character Hidden 🔒'}
                  </div>
                )}

                {/* Guess Button if active player and candidate (Disabled for completed players) */}
                {canSelect && !isCompleted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlayer(p);
                    }}
                    className="btn btn-gold btn-sm"
                    style={{ width: '100%', marginTop: '0.4rem', fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                  >
                    🎯 Guess as {targetRoleObj.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Game Chronicle Log */}
      <GameHistory history={history} />

      {/* Prediction Confirmation Modal */}
      <PredictionModal
        isOpen={showConfirmModal}
        targetPlayer={selectedPlayer}
        targetRole={targetRoleObj}
        onConfirm={handleConfirmGuess}
        onCancel={() => {
          setShowConfirmModal(false);
          setSelectedPlayer(null);
        }}
        loading={loading}
      />

      {/* Secret Card Inspection Modal */}
      <SecretCardModal
        isOpen={showSecretModal}
        secretRole={secretRole}
        onClose={() => setShowSecretModal(false)}
      />
    </div>
  );
}
