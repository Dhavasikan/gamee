import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import LobbyPage from './components/LobbyPage';
import GameBoard from './components/GameBoard';
import FinalResults from './components/FinalResults';
import HowToPlayModal from './components/HowToPlayModal';
import SwapAnimation from './components/SwapAnimation';
import RevealAnimation from './components/RevealAnimation';

// Dynamic socket URL pointing to backend
const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : window.location.origin;

export default function App() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [secretRole, setSecretRole] = useState(null);
  const [disconnectedPlayer, setDisconnectedPlayer] = useState(null);
  const [activeAnimation, setActiveAnimation] = useState(null);
  const [privateSwapInfo, setPrivateSwapInfo] = useState(null);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Initialize Socket.IO connection
  useEffect(() => {
    const s = io(BACKEND_URL, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      setConnected(true);
      setError('');
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    // Public room state sync
    s.on('room:state', (roomData) => {
      setRoom(roomData);
      setLoading(false);

      if (roomData?.status === 'ROUND_END') {
        // Round ended; let animations finish, then show final results
      } else if (roomData?.status === 'PLAYING') {
        setShowFinalResults(false);
      }
    });

    // Private character allocation / swap update
    s.on('player:secret', (privateInfo) => {
      setSecretRole(privateInfo);
    });

    // Private swap event strictly for the 2 involved players
    s.on('player:swap_private', (swapData) => {
      setPrivateSwapInfo(swapData);
    });

    // Real-time animation trigger on prediction result
    s.on('game:prediction_result', (result) => {
      if (result.event) {
        setActiveAnimation(result.event);
      }
    });

    // Disconnect notifications
    s.on('player:disconnected', ({ player }) => {
      setDisconnectedPlayer(player);
    });

    s.on('player:left', ({ player }) => {
      setDisconnectedPlayer(player);
      setTimeout(() => setDisconnectedPlayer(null), 4000);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // 2. Create Room
  const handleCreateRoom = (hostName) => {
    if (!socket || !connected) {
      setError('Cannot connect to royal server. Please try again.');
      return;
    }
    setLoading(true);
    setError('');

    socket.emit('room:create', { hostName }, (res) => {
      setLoading(false);
      if (res?.success) {
        setCurrentPlayer(res.player);
      } else {
        setError(res?.error || 'Failed to create room');
      }
    });
  };

  // 3. Join Room
  const handleJoinRoom = (roomCode, playerName) => {
    if (!socket || !connected) {
      setError('Cannot connect to royal server. Please try again.');
      return;
    }
    setLoading(true);
    setError('');

    socket.emit('room:join', { roomCode, playerName }, (res) => {
      setLoading(false);
      if (res?.success) {
        setCurrentPlayer(res.player);
      } else {
        setError(res?.error || 'Failed to join room');
      }
    });
  };

  // 4. Fill Lobby with Bots
  const handleAddBots = () => {
    if (!socket || !room) return;
    setLoading(true);
    socket.emit('room:add_bots', { roomCode: room.code }, (res) => {
      setLoading(false);
      if (!res?.success) {
        setError(res?.error || 'Failed to add bots');
      }
    });
  };

  // 5. Remove a Bot
  const handleRemoveBot = (botId) => {
    if (!socket || !room) return;
    socket.emit('room:remove_bot', { roomCode: room.code, botId }, (res) => {
      if (!res?.success) {
        setError(res?.error || 'Failed to remove bot');
      }
    });
  };

  // 6. Start Game
  const handleStartGame = () => {
    if (!socket || !room) return;
    setLoading(true);
    socket.emit('game:start', { roomCode: room.code }, (res) => {
      setLoading(false);
      if (!res?.success) {
        setError(res?.error || 'Failed to start game');
      }
    });
  };

  // 7. Raja Reveal
  const handleRevealRaja = () => {
    if (!socket || !room || !currentPlayer) return;
    setLoading(true);
    socket.emit('game:reveal_raja', { roomCode: room.code, playerId: currentPlayer.id }, (res) => {
      setLoading(false);
      if (!res?.success) {
        setError(res?.error || 'Failed to reveal Raja');
      }
    });
  };

  // 8. Make Prediction
  const handleMakePrediction = (targetPlayerId) => {
    if (!socket || !room || !currentPlayer) return;
    setLoading(true);
    socket.emit(
      'game:predict',
      {
        roomCode: room.code,
        guessingPlayerId: currentPlayer.id,
        targetPlayerId
      },
      (res) => {
        setLoading(false);
        if (res?.swapDetails) {
          setPrivateSwapInfo(res.swapDetails);
        }
        if (!res?.success) {
          setError(res?.error || 'Prediction failed');
        }
      }
    );
  };

  // 9. Rematch / Next Game
  const handleRematch = (resetScores) => {
    if (!socket || !room) return;
    setLoading(true);
    setShowFinalResults(false);
    socket.emit('game:rematch', { roomCode: room.code, resetScores }, (res) => {
      setLoading(false);
      if (!res?.success) {
        setError(res?.error || 'Failed to start rematch');
      }
    });
  };

  // 10. Pause / Resume
  const handleTogglePause = () => {
    if (!socket || !room) return;
    socket.emit('game:toggle_pause', { roomCode: room.code });
  };

  // 11. Leave Room
  const handleLeaveRoom = () => {
    setRoom(null);
    setCurrentPlayer(null);
    setSecretRole(null);
    setPrivateSwapInfo(null);
    setActiveAnimation(null);
    setShowFinalResults(false);
    setError('');
    window.location.reload();
  };

  // Handle animation completion
  const handleAnimationComplete = () => {
    const wasRoundEnd = activeAnimation?.isRoundFinished || activeAnimation?.targetRole === 'thirudan';
    setActiveAnimation(null);
    setPrivateSwapInfo(null);
    if (wasRoundEnd || room?.status === 'ROUND_END') {
      setShowFinalResults(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        roomCode={room?.code}
        connected={connected}
        onOpenRules={() => setRulesOpen(true)}
        onLeaveRoom={room ? handleLeaveRoom : null}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Error notification banner */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.25)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '0.65rem 1.25rem',
            textAlign: 'center',
            fontSize: '0.9rem'
          }}>
            ⚠️ {error}
            <button
              onClick={() => setError('')}
              style={{ background: 'transparent', border: 'none', color: 'white', marginLeft: '1rem', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* SCREEN 1: Home Landing Page */}
        {!room && (
          <HomePage
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onOpenRules={() => setRulesOpen(true)}
            loading={loading}
            error={error}
          />
        )}

        {/* SCREEN 2: Chamber Lobby */}
        {room && room.status === 'LOBBY' && (
          <LobbyPage
            room={room}
            currentPlayer={currentPlayer}
            onStartGame={handleStartGame}
            onAddBots={handleAddBots}
            onRemoveBot={handleRemoveBot}
            onLeaveRoom={handleLeaveRoom}
            loading={loading}
          />
        )}

        {/* SCREEN 3: Active Royal Game Arena */}
        {room && (room.status === 'PLAYING' || room.status === 'PAUSED' || (room.status === 'ROUND_END' && !showFinalResults)) && (
          <GameBoard
            room={room}
            currentPlayer={currentPlayer}
            secretRole={secretRole}
            onRevealRaja={handleRevealRaja}
            onMakePrediction={handleMakePrediction}
            onTogglePause={handleTogglePause}
            disconnectedPlayer={disconnectedPlayer}
            loading={loading}
          />
        )}

        {/* SCREEN 4: Game Over / Final Results */}
        {room && (room.status === 'ROUND_END' && showFinalResults) && (
          <FinalResults
            room={room}
            currentPlayer={currentPlayer}
            onRematch={handleRematch}
            onLeaveRoom={handleLeaveRoom}
            loading={loading}
          />
        )}
      </main>

      {/* OVERLAY: Wrong Guess Role Transfer Animation */}
      {activeAnimation?.type === 'PREDICTION_WRONG' && (
        <SwapAnimation
          event={activeAnimation}
          privateSwapInfo={privateSwapInfo}
          currentPlayer={currentPlayer}
          onComplete={handleAnimationComplete}
        />
      )}

      {/* OVERLAY: Correct Guess Celebration Animation */}
      {activeAnimation?.type === 'PREDICTION_CORRECT' && (
        <RevealAnimation
          event={activeAnimation}
          onComplete={handleAnimationComplete}
        />
      )}

      {/* OVERLAY: How to Play Rules Modal */}
      <HowToPlayModal
        isOpen={rulesOpen}
        onClose={() => setRulesOpen(false)}
      />
    </div>
  );
}
