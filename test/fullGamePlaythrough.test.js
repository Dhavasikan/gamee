const { io } = require('socket.io-client');
const assert = require('assert');

const SERVER_URL = 'http://localhost:5000';

console.log('--- STARTING FULL E2E PLAYTHROUGH TEST (6 SOCKET CLIENTS) ---');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runFullPlaythrough() {
  const playerNames = ['Arun', 'Karthik', 'Vijay', 'Surya', 'Dhavas', 'Vikram'];
  const sockets = [];
  const playersData = [];
  let roomCode = null;

  // 1. Connect all 6 players
  for (let i = 0; i < playerNames.length; i++) {
    const s = io(SERVER_URL, { transports: ['websocket'], forceNew: true });
    await new Promise((resolve) => s.on('connect', resolve));
    sockets.push(s);
  }
  console.log('✓ All 6 client sockets connected to server');

  // 2. Player 0 creates room
  await new Promise((resolve, reject) => {
    sockets[0].emit('room:create', { hostName: playerNames[0] }, (res) => {
      if (!res.success) return reject(new Error(res.error));
      roomCode = res.roomCode;
      playersData.push(res.player);
      console.log(`✓ Host ${playerNames[0]} created chamber: ${roomCode}`);
      resolve();
    });
  });

  // 3. Players 1..5 join room
  for (let i = 1; i < playerNames.length; i++) {
    await new Promise((resolve, reject) => {
      sockets[i].emit('room:join', { roomCode, playerName: playerNames[i] }, (res) => {
        if (!res.success) return reject(new Error(res.error));
        playersData.push(res.player);
        resolve();
      });
    });
  }
  console.log('✓ All 5 other players joined chamber successfully');

  // 4. Setup listeners for secret roles and public room states
  const secretRoles = {};
  const privateSwaps = {};
  let lastPredictionResultEvent = null;
  let currentRoomState = null;

  sockets.forEach((s, idx) => {
    s.on('player:secret', (sec) => {
      secretRoles[playersData[idx].id] = sec;
    });
    s.on('player:swap_private', (swap) => {
      privateSwaps[playersData[idx].id] = swap;
    });
    s.on('game:prediction_result', (res) => {
      lastPredictionResultEvent = res;
    });
    s.on('room:state', (st) => {
      currentRoomState = st;
    });
  });

  // 5. Host starts game
  await new Promise((resolve, reject) => {
    sockets[0].emit('game:start', { roomCode }, (res) => {
      if (!res.success) return reject(new Error(res.error));
      console.log('✓ Host started game - cards dealt');
      resolve();
    });
  });

  await sleep(600);

  assert.strictEqual(Object.keys(secretRoles).length, 6, 'All 6 players must receive their secret cards');
  console.log('✓ All 6 players received their secret roles privately');

  // Find who holds Raja
  const rajaPlayerId = Object.keys(secretRoles).find(pId => secretRoles[pId].character === 'raja');
  const rajaSocketIdx = playersData.findIndex(p => p.id === rajaPlayerId);
  console.log(`✓ Identified initial Raja holder: ${playersData[rajaSocketIdx].name}`);

  // 6. Raja reveals
  await new Promise((resolve, reject) => {
    sockets[rajaSocketIdx].emit('game:reveal_raja', { roomCode, playerId: rajaPlayerId }, (res) => {
      if (!res.success) return reject(new Error(res.error));
      console.log(`✓ ${playersData[rajaSocketIdx].name} revealed publicly as Raja!`);
      resolve();
    });
  });

  await sleep(400);

  // 7. Make a deliberately WRONG guess to test character swapping
  // Target should be anyone who is NOT Rani
  let activeId = currentRoomState.gameState.activePlayerId;
  let activeIdx = playersData.findIndex(p => p.id === activeId);
  let raniPlayerId = Object.keys(secretRoles).find(pId => secretRoles[pId].character === 'rani');

  // Pick a candidate who is not active and not Rani
  let wrongCandidateId = playersData.find(p => p.id !== activeId && p.id !== raniPlayerId).id;
  let wrongCandidateIdx = playersData.findIndex(p => p.id === wrongCandidateId);

  console.log(`Testing Role Swap: ${playersData[activeIdx].name} (Raja) guesses ${playersData[wrongCandidateIdx].name} as Rani...`);

  await new Promise((resolve, reject) => {
    sockets[activeIdx].emit('game:predict', {
      roomCode,
      guessingPlayerId: activeId,
      targetPlayerId: wrongCandidateId
    }, (res) => {
      if (!res.success) return reject(new Error(res.error));
      assert.strictEqual(res.isCorrect, false, 'Prediction should be wrong');
      console.log('✓ Confirmed WRONG prediction result event');
      resolve();
    });
  });

  await sleep(600);

  // Verify swap happened: wrongCandidateId should now be active player and hold Raja!
  assert.strictEqual(currentRoomState.gameState.activePlayerId, wrongCandidateId, 'Guessed player must become active player!');
  assert.strictEqual(currentRoomState.gameState.currentRole, 'raja', 'Current role must still be Raja!');
  assert.strictEqual(currentRoomState.gameState.targetRole, 'rani', 'Target role must remain Rani!');
  console.log(`✓ Character Swap Verified: ${playersData[wrongCandidateIdx].name} is now Raja and active turn holder!`);

  // Verify Privacy of Card Swap (Rule 1 & Rule 6)
  assert.strictEqual(lastPredictionResultEvent?.event?.message, '🔄 Card Swapping...', 'Public event message must be generic');
  assert.strictEqual(lastPredictionResultEvent?.event?.currentRole, undefined, 'Public event must NOT leak current role');
  assert.strictEqual(lastPredictionResultEvent?.event?.targetPlayerOldRole, undefined, 'Public event must NOT leak target player old role');

  // Verify private swap delivered strictly to the two affected players
  assert.ok(privateSwaps[activeId], 'Guesser must receive private swap event');
  assert.strictEqual(privateSwaps[activeId].isGuesser, true);
  assert.strictEqual(privateSwaps[activeId].title, '❌ Wrong Guess');

  assert.ok(privateSwaps[wrongCandidateId], 'Target player must receive private swap event');
  assert.strictEqual(privateSwaps[wrongCandidateId].isGuesser, false);
  assert.strictEqual(privateSwaps[wrongCandidateId].title, '🔄 Your card has been swapped');

  // Verify other 4 players did NOT receive private swap info
  playersData.forEach(p => {
    if (p.id !== activeId && p.id !== wrongCandidateId) {
      assert.strictEqual(privateSwaps[p.id], undefined, `Spectator ${p.name} must NOT receive private swap details!`);
    }
  });
  console.log('✓ Secrecy Verified: Only guesser & target received private roles; public message is generic "🔄 Card Swapping..."');

  // 8. Now new Raja guesses the correct Rani
  const guesserPlayerId = currentRoomState.gameState.activePlayerId;
  activeId = currentRoomState.gameState.activePlayerId;
  activeIdx = playersData.findIndex(p => p.id === activeId);

  console.log(`Testing Correct Guess: ${playersData[activeIdx].name} guesses correct Rani (${playersData.find(p => p.id === raniPlayerId).name})...`);

  await new Promise((resolve, reject) => {
    sockets[activeIdx].emit('game:predict', {
      roomCode,
      guessingPlayerId: activeId,
      targetPlayerId: raniPlayerId
    }, (res) => {
      if (!res.success) return reject(new Error(res.error));
      assert.strictEqual(res.isCorrect, true, 'Prediction should be correct');
      assert.strictEqual(res.event.pointsAwarded, 80, 'Must award 80 points for finding Rani');
      console.log(`✓ Confirmed CORRECT prediction! Awarded +80 points to ${playersData[activeIdx].name}`);
      resolve();
    });
  });

  await sleep(600);

  // Verify turn advanced to Rani seeking Manthiri
  assert.strictEqual(currentRoomState.gameState.activePlayerId, raniPlayerId, 'Rani player must become active turn holder');
  assert.strictEqual(currentRoomState.gameState.currentRole, 'rani');
  assert.strictEqual(currentRoomState.gameState.targetRole, 'manthiri');
  console.log('✓ Progression verified: Turn advanced to Rani searching for Manthiri!');

  // Verify Rule 2 & 7: Winner player is locked / completed and CANNOT be selected again
  const completedWinner = currentRoomState.players.find(p => p.id === guesserPlayerId);
  assert.strictEqual(completedWinner.completed, true, 'Winner must be marked completed 🔒');
  console.log(`✓ Completed Player Verified: ${completedWinner.name} is marked as COMPLETED 🔒`);

  // Attempt to select the completed winner -> Backend MUST reject
  const raniIdx = playersData.findIndex(p => p.id === raniPlayerId);
  await new Promise((resolve, reject) => {
    sockets[raniIdx].emit('game:predict', {
      roomCode,
      guessingPlayerId: raniPlayerId,
      targetPlayerId: guesserPlayerId
    }, (res) => {
      assert.strictEqual(res.success, false, 'Selecting completed winner must fail');
      assert.ok(res.error.includes('completed'), `Error should mention completed player: ${res.error}`);
      console.log(`✓ Backend Security Verified: Selection of completed player (${completedWinner.name}) rejected!`);
      resolve();
    });
  });

  // Clean up
  sockets.forEach(s => s.disconnect());
  console.log('\n=== FULL E2E MULTIPLAYER PLAYTHROUGH TEST COMPLETED WITH 100% SUCCESS! ===');
  process.exit(0);
}

runFullPlaythrough().catch(err => {
  console.error('Playthrough error:', err);
  process.exit(1);
});
