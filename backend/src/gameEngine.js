/**
 * Raja Rani - Core Game Engine
 * Implements the authentic character-prediction and role-swap mechanics.
 */

const DEFAULT_ROLES = [
  { id: 'raja', name: 'Raja', title: 'King', emoji: '👑', points: 100, order: 0 },
  { id: 'rani', name: 'Rani', title: 'Queen', emoji: '👸', points: 80, order: 1 },
  { id: 'manthiri', name: 'Manthiri', title: 'Minister', emoji: '🧙', points: 60, order: 2 },
  { id: 'police', name: 'Police', title: 'Police', emoji: '👮', points: 40, order: 3 },
  { id: 'sippai', name: 'Sippai', title: 'Soldier', emoji: '⚔️', points: 20, order: 4 },
  { id: 'thirudan', name: 'Thirudan', title: 'Thief', emoji: '🕵️', points: 0, order: 5 }
];

class GameEngine {
  constructor(roles = DEFAULT_ROLES) {
    this.roles = roles;
    this.rolesMap = roles.reduce((acc, r) => {
      acc[r.id] = r;
      return acc;
    }, {});
    this.roleSequence = roles.map(r => r.id);
  }

  /**
   * Shuffles an array in place using Fisher-Yates
   */
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Initializes a new round for the given players.
   * players: Array of { id, name, score: optional }
   * customAllocation: Optional mapping for deterministic testing { [playerId]: roleId }
   */
  initializeRound(players, customAllocation = null) {
    if (players.length !== this.roles.length) {
      throw new Error(`Expected exactly ${this.roles.length} players, got ${players.length}`);
    }

    let roleAssignment = {};
    if (customAllocation) {
      roleAssignment = { ...customAllocation };
    } else {
      const shuffledRoles = this.shuffle(this.roleSequence);
      players.forEach((p, idx) => {
        roleAssignment[p.id] = shuffledRoles[idx];
      });
    }

    // Verify all roles are unique and present
    const assignedRoles = Object.values(roleAssignment);
    if (new Set(assignedRoles).size !== this.roles.length) {
      throw new Error('Invalid role distribution: duplicate or missing roles.');
    }

    // Find the player holding Raja
    const rajaPlayerId = Object.keys(roleAssignment).find(pId => roleAssignment[pId] === 'raja');

    const state = {
      status: 'REVEAL_PHASE', // 'REVEAL_PHASE', 'PLAYING', 'ROUND_END', 'GAME_OVER'
      round: 1,
      players: players.map(p => ({
        id: p.id,
        name: p.name,
        score: p.score || 0,
        character: roleAssignment[p.id],
        isRevealed: false,
        revealedRole: null,
        completed: false,
        finalRole: false
      })),
      currentRole: 'raja',
      targetRole: 'rani',
      activePlayerId: rajaPlayerId,
      rajaRevealed: false,
      history: [
        {
          timestamp: Date.now(),
          type: 'INFO',
          message: 'Cards dealt! The secret characters have been assigned to all players.'
        }
      ],
      stats: {
        totalPredictions: 0,
        correctPredictions: 0,
        wrongPredictions: 0,
        characterTransfers: 0
      },
      lastAction: null
    };

    return state;
  }

  /**
   * Player holding Raja reveals themselves publicly
   */
  revealRaja(state, playerId) {
    const player = state.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }
    if (player.character !== 'raja') {
      return { success: false, error: 'Only the player holding Raja can perform this reveal' };
    }
    if (state.rajaRevealed) {
      return { success: false, error: 'Raja has already revealed' };
    }

    player.isRevealed = true;
    player.revealedRole = 'raja';
    state.rajaRevealed = true;
    state.status = 'PLAYING';
    state.activePlayerId = player.id;
    state.currentRole = 'raja';
    state.targetRole = 'rani';

    const event = {
      timestamp: Date.now(),
      type: 'RAJA_REVEAL',
      playerId: player.id,
      playerName: player.name,
      message: `👑 ${player.name} revealed as Raja! Turn begins: Find Rani.`
    };

    state.history.push(event);
    state.lastAction = event;

    return { success: true, state };
  }

  /**
   * Active player makes a guess for the targetRole
   * guessingPlayerId: ID of active player
   * targetPlayerId: ID of chosen player
   */
  makePrediction(state, guessingPlayerId, targetPlayerId) {
    if (state.status !== 'PLAYING') {
      return { success: false, error: 'Game is not in PLAYING state' };
    }

    const activePlayer = state.players.find(p => p.id === state.activePlayerId);
    if (!activePlayer || activePlayer.id !== guessingPlayerId) {
      return { success: false, error: 'Not your turn to make a prediction' };
    }

    if (guessingPlayerId === targetPlayerId) {
      return { success: false, error: 'You cannot select yourself' };
    }

    const targetPlayer = state.players.find(p => p.id === targetPlayerId);
    if (!targetPlayer) {
      return { success: false, error: 'Target player not found' };
    }

    if (targetPlayer.completed) {
      return { success: false, error: 'This player has already completed their role and cannot be selected' };
    }

    state.stats.totalPredictions += 1;
    const currentRoleObj = this.rolesMap[state.currentRole];
    const targetRoleObj = this.rolesMap[state.targetRole];

    const isCorrect = targetPlayer.character === state.targetRole;

    if (isCorrect) {
      // ----------------------------------------------------
      // CORRECT GUESS:
      // Active player gets target role points.
      // Active player becomes COMPLETED (Locked).
      // Target player is revealed.
      // Target player becomes the new active player.
      // currentRole becomes targetRole.
      // targetRole advances to the next role in sequence.
      // ----------------------------------------------------
      state.stats.correctPredictions += 1;
      const pointsAwarded = targetRoleObj.points;
      activePlayer.score += pointsAwarded;
      activePlayer.completed = true; // Rule 2: Winner cannot be selected again

      targetPlayer.isRevealed = true;
      targetPlayer.revealedRole = targetRoleObj.id;

      const previousCurrent = state.currentRole;
      const guessedRole = state.targetRole;

      // Find next role in sequence
      const currentIndex = this.roleSequence.indexOf(state.targetRole);
      const nextRoleIndex = currentIndex + 1;
      const isRoundFinished = nextRoleIndex >= this.roleSequence.length || targetRoleObj.id === 'thirudan';

      const event = {
        timestamp: Date.now(),
        type: 'PREDICTION_CORRECT',
        predictorId: activePlayer.id,
        predictorName: activePlayer.name,
        targetPlayerId: targetPlayer.id,
        targetPlayerName: targetPlayer.name,
        targetRole: targetRoleObj.id,
        targetRoleName: targetRoleObj.name,
        targetRoleEmoji: targetRoleObj.emoji,
        pointsAwarded,
        completedPlayerId: activePlayer.id,
        isRoundFinished,
        message: `✅ CORRECT! ${activePlayer.name} guessed ${targetPlayer.name} is ${targetRoleObj.emoji} ${targetRoleObj.name}! ${activePlayer.name} has COMPLETED 🔒 (+${pointsAwarded} points).`
      };

      state.history.push(event);
      state.lastAction = event;

      if (isRoundFinished || targetRoleObj.id === 'thirudan') {
        // Thief was found, round is complete!
        targetPlayer.finalRole = true;
        state.status = 'ROUND_END';
        state.history.push({
          timestamp: Date.now(),
          type: 'ROUND_COMPLETE',
          message: `🏆 Thirudan (Thief) found! Round is complete!`
        });
      } else {
        // Move to next in sequence
        state.currentRole = guessedRole;
        state.targetRole = this.roleSequence[nextRoleIndex];
        state.activePlayerId = targetPlayer.id;

        const nextTargetObj = this.rolesMap[state.targetRole];
        state.history.push({
          timestamp: Date.now(),
          type: 'TURN_CHANGE',
          activePlayerId: targetPlayer.id,
          activePlayerName: targetPlayer.name,
          currentRole: state.currentRole,
          targetRole: state.targetRole,
          message: `👉 Next Turn: ${targetPlayer.name} (${targetRoleObj.emoji} ${targetRoleObj.name}) must find ${nextTargetObj.emoji} ${nextTargetObj.name}.`
        });
      }

      return {
        success: true,
        isCorrect: true,
        state,
        event
      };
    } else {
      // ----------------------------------------------------
      // WRONG GUESS:
      // SWAP characters between activePlayer and targetPlayer!
      // targetPlayer receives currentRole.
      // activePlayer receives targetPlayer's previous role.
      // targetPlayer becomes the new active player!
      // targetRole remains UNCHANGED.
      // VISIBILITY: Only the two involved players see new roles!
      // Other players see ONLY: "🔄 Card Swapping..."
      // ----------------------------------------------------
      state.stats.wrongPredictions += 1;
      state.stats.characterTransfers += 1;

      const oldActiveCharacter = activePlayer.character; // e.g. 'raja'
      const targetOldCharacter = targetPlayer.character; // e.g. 'police'

      // Perform character swap
      activePlayer.character = targetOldCharacter;
      targetPlayer.character = oldActiveCharacter;

      const oldActivePlayerId = activePlayer.id;
      const oldActivePlayerName = activePlayer.name;
      const newActivePlayerId = targetPlayer.id;
      const newActivePlayerName = targetPlayer.name;

      // The selected player becomes the new current role holder
      state.activePlayerId = targetPlayer.id;

      // Reset revealed state so roles remain private
      activePlayer.isRevealed = false;
      activePlayer.revealedRole = null;
      targetPlayer.isRevealed = false;
      targetPlayer.revealedRole = null;

      // Public event: Generic information only (Anti-cheating)
      const event = {
        timestamp: Date.now(),
        type: 'PREDICTION_WRONG',
        oldActivePlayerId: oldActivePlayerId,
        oldActivePlayerName: oldActivePlayerName,
        targetPlayerId: newActivePlayerId,
        targetPlayerName: newActivePlayerName,
        message: '🔄 Card Swapping...'
      };

      state.history.push(event);
      state.lastAction = event;

      // Private swap details for the two involved players only
      const swapDetails = {
        guesser: {
          playerId: oldActivePlayerId,
          playerName: oldActivePlayerName,
          isGuesser: true,
          title: '❌ Wrong Guess',
          subtitle: '🔄 Your card has been swapped',
          message: '🔄 Your card has been swapped',
          roleId: targetOldCharacter,
          roleName: this.rolesMap[targetOldCharacter].name,
          roleEmoji: this.rolesMap[targetOldCharacter].emoji,
          roleDisplay: `${this.rolesMap[targetOldCharacter].emoji} Your new role: ${this.rolesMap[targetOldCharacter].name}`
        },
        target: {
          playerId: newActivePlayerId,
          playerName: newActivePlayerName,
          isGuesser: false,
          title: '🔄 Your card has been swapped',
          subtitle: '🔄 Your card has been swapped',
          message: '🔄 Your card has been swapped',
          roleId: oldActiveCharacter,
          roleName: this.rolesMap[oldActiveCharacter].name,
          roleEmoji: this.rolesMap[oldActiveCharacter].emoji,
          roleDisplay: `${this.rolesMap[oldActiveCharacter].emoji} Your new role: ${this.rolesMap[oldActiveCharacter].name}`
        }
      };

      return {
        success: true,
        isCorrect: false,
        state,
        event,
        swapDetails
      };
    }
  }

  /**
   * Filters the game state for public broadcast (Anti-cheating).
   * Hidden characters are replaced with null unless revealed.
   */
  getPublicState(state) {
    return {
      status: state.status,
      round: state.round,
      currentRole: state.currentRole,
      targetRole: state.targetRole,
      activePlayerId: state.activePlayerId,
      rajaRevealed: state.rajaRevealed,
      stats: state.stats,
      lastAction: state.lastAction,
      history: state.history,
      players: state.players.map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        isRevealed: p.isRevealed,
        revealedRole: p.isRevealed ? p.revealedRole : null,
        completed: !!p.completed,
        finalRole: !!p.finalRole
      }))
    };
  }

  /**
   * Returns private info for a specific player
   */
  getPlayerPrivateState(state, playerId) {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return null;
    return {
      character: player.character,
      roleDetails: this.rolesMap[player.character],
      completed: !!player.completed,
      finalRole: !!player.finalRole
    };
  }

  /**
   * Ranks players for final game podium
   */
  getRankings(state) {
    return [...state.players].sort((a, b) => b.score - a.score).map(p => ({
      ...p,
      completed: !!p.completed,
      finalRole: !!p.finalRole
    }));
  }
}

module.exports = {
  GameEngine,
  DEFAULT_ROLES
};
