const io = (() => {
  try { return require('socket.io-client').io; }
  catch { return require('../frontend/node_modules/socket.io-client').io; }
})();
const assert = require('assert');

console.log('=== RUNNING MULTIPLAYER REAL-TIME SOCKET.IO INTEGRATION TEST ===');

const SERVER_URL = 'http://localhost:5000';

async function runTest() {
  // 1. Host creates room
  const hostSocket = io(SERVER_URL, { transports: ['websocket'] });

  await new Promise((resolve, reject) => {
    hostSocket.on('connect', () => {
      console.log('✓ Host connected to server');
      hostSocket.emit('room:create', { hostName: 'Arun' }, (res) => {
        if (!res.success) return reject(new Error(res.error));
        console.log(`✓ Room created with code: ${res.roomCode}`);
        resolve(res);
      });
    });
  }).then(async (createRes) => {
    const roomCode = createRes.roomCode;
    const hostPlayer = createRes.player;

    // 2. Add 5 bots to reach 6 players
    await new Promise((resolve, reject) => {
      hostSocket.emit('room:add_bots', { roomCode }, (res) => {
        if (!res.success) return reject(new Error(res.error));
        console.log('✓ 5 Royal Bots added to reach 6 court members');
        resolve(res);
      });
    });

    // 3. Start Game
    const roomStatePromise = new Promise((resolve) => {
      hostSocket.on('room:state', (state) => {
        if (state.status === 'PLAYING') {
          resolve(state);
        }
      });
    });

    const secretRolePromise = new Promise((resolve) => {
      hostSocket.on('player:secret', (secret) => {
        resolve(secret);
      });
    });

    hostSocket.emit('game:start', { roomCode }, (res) => {
      assert.strictEqual(res.success, true);
      console.log('✓ Game started and cards distributed');
    });

    const [roomState, hostSecret] = await Promise.all([roomStatePromise, secretRolePromise]);
    console.log(`✓ Host received secret card privately: ${hostSecret.character.toUpperCase()} (Others see locked)`);
    assert.strictEqual(roomState.players.length, 6);

    // Verify absolutely NO game history in public room state (Anti-cheating)
    assert.strictEqual(roomState.gameState.history, undefined, 'Public gameState must NOT contain history or logs');

    // Anti-cheating check: check that other players' characters are hidden in public state
    const otherPlayers = roomState.players.filter(p => p.id !== hostPlayer.id);
    otherPlayers.forEach(p => {
      assert.strictEqual(p.revealedRole, null, `Player ${p.name}'s secret card must not be leaked publicly!`);
    });
    console.log('✓ Anti-cheating verified: No secret characters or history leaked in public socket payload!');

    // Clean up
    hostSocket.disconnect();
    console.log('=== MULTIPLAYER SOCKET INTEGRATION TEST PASSED! ===');
    process.exit(0);
  });
}

runTest().catch((err) => {
  console.error('Integration test failed:', err);
  process.exit(1);
});
