/**
 * Room Manager for Raja Rani
 * Handles room creation, player lobby, bots, lifecycle, and disconnects.
 */

const { GameEngine } = require('./gameEngine');
const { saveGameSession } = require('./db');

const BOT_NAMES = ['Vikram', 'Ananya', 'Rajesh', 'Priya', 'Devendra', 'Meera', 'Aditya', 'Kavya'];

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomCode -> roomData
    this.socketToPlayer = new Map(); // socketId -> { roomCode, playerId }
    this.engine = new GameEngine();
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const fullCode = `RR-${code}`;
    if (this.rooms.has(fullCode)) {
      return this.generateRoomCode();
    }
    return fullCode;
  }

  createRoom(hostName, socketId) {
    const roomCode = this.generateRoomCode();
    const hostPlayer = {
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: hostName.trim(),
      socketId: socketId,
      isHost: true,
      isBot: false,
      score: 0,
      connected: true
    };

    const room = {
      code: roomCode,
      createdAt: Date.now(),
      status: 'LOBBY', // 'LOBBY', 'PLAYING', 'PAUSED', 'ROUND_END'
      hostId: hostPlayer.id,
      players: [hostPlayer],
      gameState: null,
      roundsPlayed: 0,
      requiredPlayers: 6
    };

    this.rooms.set(roomCode, room);
    this.socketToPlayer.set(socketId, { roomCode, playerId: hostPlayer.id });

    return { roomCode, player: hostPlayer };
  }

  joinRoom(roomCode, playerName, socketId) {
    const normalizedCode = (roomCode || '').trim().toUpperCase();
    const room = this.rooms.get(normalizedCode);
    if (!room) {
      return { success: false, error: 'Room not found. Check the room code.' };
    }

    if (room.status !== 'LOBBY') {
      // Check if this is a reconnecting player
      const existing = room.players.find(p => p.name.toLowerCase() === playerName.trim().toLowerCase());
      if (existing && !existing.connected) {
        existing.connected = true;
        existing.socketId = socketId;
        this.socketToPlayer.set(socketId, { roomCode: normalizedCode, playerId: existing.id });
        return { success: true, roomCode: normalizedCode, player: existing, reconnected: true };
      }
      return { success: false, error: 'Game is already in progress in this room.' };
    }

    if (room.players.length >= room.requiredPlayers) {
      return { success: false, error: `Room is full (max ${room.requiredPlayers} players).` };
    }

    const trimmedName = playerName.trim();
    if (!trimmedName) {
      return { success: false, error: 'Please enter a valid player name.' };
    }

    const nameExists = room.players.some(p => p.name.toLowerCase() === trimmedName.toLowerCase());
    if (nameExists) {
      return { success: false, error: 'A player with this name is already in the room.' };
    }

    const newPlayer = {
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: trimmedName,
      socketId: socketId,
      isHost: false,
      isBot: false,
      score: 0,
      connected: true
    };

    room.players.push(newPlayer);
    this.socketToPlayer.set(socketId, { roomCode: normalizedCode, playerId: newPlayer.id });

    return { success: true, roomCode: normalizedCode, player: newPlayer };
  }

  /**
   * Helper: Fill remaining lobby slots with royal Bots for instant play & testing
   */
  fillWithBots(roomCode, requesterSocketId) {
    const room = this.rooms.get(roomCode);
    if (!room) return { success: false, error: 'Room not found' };
    if (room.status !== 'LOBBY') return { success: false, error: 'Game already active' };

    const host = room.players.find(p => p.isHost);
    if (!host || host.socketId !== requesterSocketId) {
      return { success: false, error: 'Only the host can add bots' };
    }

    const needed = room.requiredPlayers - room.players.length;
    if (needed <= 0) return { success: false, error: 'Room is already full' };

    const availableBotNames = BOT_NAMES.filter(
      b => !room.players.some(p => p.name.toLowerCase() === b.toLowerCase())
    );

    for (let i = 0; i < needed; i++) {
      const botName = availableBotNames[i] || `Royal Guard ${i + 1}`;
      const botPlayer = {
        id: `bot_${Date.now()}_${i}`,
        name: botName,
        socketId: null,
        isHost: false,
        isBot: true,
        score: 0,
        connected: true
      };
      room.players.push(botPlayer);
    }

    return { success: true, room };
  }

  /**
   * Remove a bot from the lobby
   */
  removeBot(roomCode, botId, requesterSocketId) {
    const room = this.rooms.get(roomCode);
    if (!room) return { success: false, error: 'Room not found' };
    const host = room.players.find(p => p.isHost);
    if (!host || host.socketId !== requesterSocketId) {
      return { success: false, error: 'Only host can remove bots' };
    }

    const idx = room.players.findIndex(p => p.id === botId && p.isBot);
    if (idx !== -1) {
      room.players.splice(idx, 1);
      return { success: true, room };
    }
    return { success: false, error: 'Bot not found' };
  }

  /**
   * Start Game
   */
  startGame(roomCode, requesterSocketId) {
    const room = this.rooms.get(roomCode);
    if (!room) return { success: false, error: 'Room not found' };

    const host = room.players.find(p => p.isHost);
    if (!host || host.socketId !== requesterSocketId) {
      return { success: false, error: 'Only the host can start the game.' };
    }

    if (room.players.length !== room.requiredPlayers) {
      return { success: false, error: `Need exactly ${room.requiredPlayers} players to start. Currently have ${room.players.length}.` };
    }

    // Initialize Game Engine state
    room.gameState = this.engine.initializeRound(room.players);
    room.status = 'PLAYING';
    room.roundsPlayed += 1;

    return { success: true, room };
  }

  /**
   * Raja reveal
   */
  revealRaja(roomCode, playerId) {
    const room = this.rooms.get(roomCode);
    if (!room || !room.gameState) return { success: false, error: 'Game not active' };

    const res = this.engine.revealRaja(room.gameState, playerId);
    return res;
  }

  /**
   * Make prediction
   */
  makePrediction(roomCode, guessingPlayerId, targetPlayerId) {
    const room = this.rooms.get(roomCode);
    if (!room || !room.gameState) return { success: false, error: 'Game not active' };

    const res = this.engine.makePrediction(room.gameState, guessingPlayerId, targetPlayerId);

    if (res.success && room.gameState.status === 'ROUND_END') {
      // Sync scores and status back to room players
      room.gameState.players.forEach(gp => {
        const rp = room.players.find(p => p.id === gp.id);
        if (rp) {
          rp.score = gp.score;
          rp.completed = gp.completed;
          rp.finalRole = gp.finalRole;
        }
      });

      // Save to database
      const rankings = this.engine.getRankings(room.gameState);
      saveGameSession({
        sessionId: `${room.code}_R${room.roundsPlayed}_${Date.now()}`,
        roomCode: room.code,
        rounds: room.roundsPlayed,
        winnerName: rankings[0]?.name || 'None',
        winnerScore: rankings[0]?.score || 0,
        stats: room.gameState.stats,
        history: room.gameState.history
      });
    }

    return res;
  }

  /**
   * Rematch / Play Again
   */
  rematch(roomCode, requesterSocketId, resetScores = false) {
    const room = this.rooms.get(roomCode);
    if (!room) return { success: false, error: 'Room not found' };

    const host = room.players.find(p => p.isHost);
    if (!host || host.socketId !== requesterSocketId) {
      return { success: false, error: 'Only the host can start a rematch.' };
    }

    if (resetScores) {
      room.players.forEach(p => p.score = 0);
    }
    room.players.forEach(p => {
      p.completed = false;
      p.finalRole = false;
    });

    room.gameState = this.engine.initializeRound(room.players);
    room.status = 'PLAYING';
    room.roundsPlayed += 1;

    return { success: true, room };
  }

  /**
   * Pause/Resume game by host
   */
  togglePause(roomCode, requesterSocketId) {
    const room = this.rooms.get(roomCode);
    if (!room) return { success: false, error: 'Room not found' };
    const host = room.players.find(p => p.isHost);
    if (!host || host.socketId !== requesterSocketId) {
      return { success: false, error: 'Only the host can pause/resume.' };
    }

    if (room.status === 'PLAYING') {
      room.status = 'PAUSED';
    } else if (room.status === 'PAUSED') {
      room.status = 'PLAYING';
    }

    return { success: true, status: room.status };
  }

  /**
   * Handle socket disconnect
   */
  handleDisconnect(socketId) {
    const playerInfo = this.socketToPlayer.get(socketId);
    if (!playerInfo) return null;

    const { roomCode, playerId } = playerInfo;
    this.socketToPlayer.delete(socketId);

    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return null;

    if (room.status === 'LOBBY') {
      // In lobby: remove player completely
      room.players = room.players.filter(p => p.id !== playerId);
      if (player.isHost && room.players.length > 0) {
        // Reassign host to next non-bot player or first player
        const nextHuman = room.players.find(p => !p.isBot) || room.players[0];
        nextHuman.isHost = true;
        room.hostId = nextHuman.id;
      }
      if (room.players.length === 0) {
        this.rooms.delete(roomCode);
        return { roomCode, roomDeleted: true };
      }
      return { roomCode, playerLeft: player, room };
    } else {
      // In active game: mark disconnected so game state is not corrupted
      player.connected = false;
      return { roomCode, playerDisconnected: player, room };
    }
  }

  getRoom(roomCode) {
    return this.rooms.get(roomCode);
  }

  getPlayerRoom(socketId) {
    return this.socketToPlayer.get(socketId);
  }
}

module.exports = {
  RoomManager
};
