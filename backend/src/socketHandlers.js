/**
 * Socket.IO Handlers for Raja Rani
 * Ensures absolute information privacy (anti-cheating) and manages real-time game flows.
 */

function setupSocketHandlers(io, roomManager) {
  const { engine } = roomManager;

  /**
   * Broadcasts public state to room and private state to each connected player
   */
  function broadcastFullRoomState(room) {
    if (!room) return;

    // Send public state to all sockets in room
    const publicState = room.gameState ? engine.getPublicState(room.gameState) : null;
    io.to(room.code).emit('room:state', {
      code: room.code,
      status: room.status,
      hostId: room.hostId,
      players: room.players.map(p => {
        const gameP = room.gameState?.players.find(gp => gp.id === p.id);
        return {
          id: p.id,
          name: p.name,
          isHost: p.isHost,
          isBot: p.isBot,
          connected: p.connected,
          score: gameP ? gameP.score : p.score,
          isRevealed: gameP ? gameP.isRevealed : false,
          revealedRole: gameP?.isRevealed ? gameP.revealedRole : null
        };
      }),
      gameState: publicState,
      roundsPlayed: room.roundsPlayed
    });

    // Send private character info strictly to each player's individual socket
    if (room.gameState) {
      room.players.forEach(p => {
        if (!p.isBot && p.socketId) {
          const privateInfo = engine.getPlayerPrivateState(room.gameState, p.id);
          io.to(p.socketId).emit('player:secret', privateInfo);
        }
      });
    }

    // Trigger Bot turn if the active player is a bot
    handleBotTurns(room);
  }

  /**
   * Automated turn handler for Bot players
   */
  function handleBotTurns(room) {
    if (!room || !room.gameState || room.status !== 'PLAYING') return;

    const { gameState } = room;

    // If Raja hasn't revealed and Raja is a bot, auto-reveal after delay
    if (!gameState.rajaRevealed) {
      const rajaPlayer = gameState.players.find(p => p.character === 'raja');
      const isBot = room.players.find(p => p.id === rajaPlayer?.id)?.isBot;
      if (rajaPlayer && isBot) {
        setTimeout(() => {
          if (room.gameState && !room.gameState.rajaRevealed) {
            const res = roomManager.revealRaja(room.code, rajaPlayer.id);
            if (res.success) {
              broadcastFullRoomState(room);
            }
          }
        }, 1800);
      }
      return;
    }

    // Active player prediction
    const activePlayerId = gameState.activePlayerId;
    const isBot = room.players.find(p => p.id === activePlayerId)?.isBot;

    if (isBot && gameState.status === 'PLAYING') {
      setTimeout(() => {
        if (!room.gameState || room.gameState.status !== 'PLAYING') return;
        if (room.gameState.activePlayerId !== activePlayerId) return;

        // Pick a valid candidate (not self, and preferably not already revealed as someone else)
        const candidates = room.gameState.players.filter(
          p => p.id !== activePlayerId && (!p.isRevealed || p.character === room.gameState.targetRole)
        );

        if (candidates.length === 0) return;
        const target = candidates[Math.floor(Math.random() * candidates.length)];

        const result = roomManager.makePrediction(room.code, activePlayerId, target.id);
        if (result.success) {
          io.to(room.code).emit('game:prediction_result', result);
          broadcastFullRoomState(room);
        }
      }, 2200);
    }
  }

  io.on('connection', (socket) => {
    // 1. Create Room
    socket.on('room:create', ({ hostName }, callback) => {
      if (!hostName || !hostName.trim()) {
        return callback?.({ success: false, error: 'Name is required' });
      }
      const { roomCode, player } = roomManager.createRoom(hostName, socket.id);
      socket.join(roomCode);
      callback?.({ success: true, roomCode, player });
      const room = roomManager.getRoom(roomCode);
      broadcastFullRoomState(room);
    });

    // 2. Join Room
    socket.on('room:join', ({ roomCode, playerName }, callback) => {
      const res = roomManager.joinRoom(roomCode, playerName, socket.id);
      if (!res.success) {
        return callback?.(res);
      }
      socket.join(res.roomCode);
      callback?.(res);
      const room = roomManager.getRoom(res.roomCode);
      broadcastFullRoomState(room);
    });

    // 3. Fill with Bots
    socket.on('room:add_bots', ({ roomCode }, callback) => {
      const res = roomManager.fillWithBots(roomCode, socket.id);
      if (!res.success) {
        return callback?.(res);
      }
      callback?.({ success: true });
      broadcastFullRoomState(res.room);
    });

    // 4. Remove a Bot
    socket.on('room:remove_bot', ({ roomCode, botId }, callback) => {
      const res = roomManager.removeBot(roomCode, botId, socket.id);
      if (!res.success) {
        return callback?.(res);
      }
      callback?.({ success: true });
      broadcastFullRoomState(res.room);
    });

    // 5. Start Game
    socket.on('game:start', ({ roomCode }, callback) => {
      const res = roomManager.startGame(roomCode, socket.id);
      if (!res.success) {
        return callback?.(res);
      }
      callback?.({ success: true });
      broadcastFullRoomState(res.room);
    });

    // 6. Raja Reveal
    socket.on('game:reveal_raja', ({ roomCode, playerId }, callback) => {
      const res = roomManager.revealRaja(roomCode, playerId);
      if (!res.success) {
        return callback?.(res);
      }
      callback?.({ success: true });
      const room = roomManager.getRoom(roomCode);
      broadcastFullRoomState(room);
    });

    // 7. Make Prediction
    socket.on('game:predict', ({ roomCode, guessingPlayerId, targetPlayerId }, callback) => {
      const res = roomManager.makePrediction(roomCode, guessingPlayerId, targetPlayerId);
      if (!res.success) {
        return callback?.(res);
      }
      callback?.(res);
      const room = roomManager.getRoom(roomCode);

      // Emit prediction result for celebration or swap animation
      io.to(roomCode).emit('game:prediction_result', res);
      broadcastFullRoomState(room);
    });

    // 8. Rematch
    socket.on('game:rematch', ({ roomCode, resetScores }, callback) => {
      const res = roomManager.rematch(roomCode, socket.id, resetScores);
      if (!res.success) {
        return callback?.(res);
      }
      callback?.({ success: true });
      broadcastFullRoomState(res.room);
    });

    // 9. Pause / Resume
    socket.on('game:toggle_pause', ({ roomCode }, callback) => {
      const res = roomManager.togglePause(roomCode, socket.id);
      if (!res.success) {
        return callback?.(res);
      }
      callback?.({ success: true, status: res.status });
      const room = roomManager.getRoom(roomCode);
      broadcastFullRoomState(room);
    });

    // 10. Disconnect
    socket.on('disconnect', () => {
      const result = roomManager.handleDisconnect(socket.id);
      if (result) {
        const { roomCode, room, playerLeft, playerDisconnected } = result;
        if (room) {
          if (playerLeft) {
            io.to(roomCode).emit('player:left', { player: playerLeft });
          }
          if (playerDisconnected) {
            io.to(roomCode).emit('player:disconnected', { player: playerDisconnected });
          }
          broadcastFullRoomState(room);
        }
      }
    });
  });
}

module.exports = {
  setupSocketHandlers
};
