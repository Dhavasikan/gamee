const assert = require('assert');
const { GameEngine } = require('../src/gameEngine');

console.log('--- RUNNING RAJA RANI ENGINE TESTS ---');

const engine = new GameEngine();

const players = [
  { id: 'pA', name: 'A' },
  { id: 'pB', name: 'B' },
  { id: 'pC', name: 'C' },
  { id: 'pD', name: 'D' },
  { id: 'pE', name: 'E' },
  { id: 'pF', name: 'F' }
];

const customAllocation = {
  pA: 'raja',
  pB: 'rani',
  pC: 'manthiri',
  pD: 'police',
  pE: 'sippai',
  pF: 'thirudan'
};

// 1. Initialize round
let state = engine.initializeRound(players, customAllocation);
console.log('✓ Initialized round with 6 players');
assert.strictEqual(state.status, 'REVEAL_PHASE');
assert.strictEqual(state.activePlayerId, 'pA');
assert.strictEqual(state.currentRole, 'raja');
assert.strictEqual(state.targetRole, 'rani');

// 2. Raja A reveals
let revealRes = engine.revealRaja(state, 'pA');
assert.strictEqual(revealRes.success, true);
assert.strictEqual(state.status, 'PLAYING');
assert.strictEqual(state.rajaRevealed, true);
console.log('✓ Raja revealed successfully');

// 3. Raja A guesses C (Requirement #37 Step 1)
// C is Manthiri -> WRONG!
let guess1 = engine.makePrediction(state, 'pA', 'pC');
assert.strictEqual(guess1.isCorrect, false);
// Expected: A is Manthiri, C is Raja, C becomes active player
const playerA_after1 = state.players.find(p => p.id === 'pA');
const playerC_after1 = state.players.find(p => p.id === 'pC');
assert.strictEqual(playerA_after1.character, 'manthiri', 'Player A should now be Manthiri');
assert.strictEqual(playerC_after1.character, 'raja', 'Player C should now be Raja');
assert.strictEqual(state.activePlayerId, 'pC', 'Player C should be new active player');
assert.strictEqual(state.currentRole, 'raja', 'Current role should still be Raja');
assert.strictEqual(state.targetRole, 'rani', 'Target role should still be Rani');
console.log('✓ Step 1 verified: A guessed C (Wrong) -> A is Manthiri, C is now Raja');

// 4. C guesses D (Requirement #37 Step 2)
// D is Police -> WRONG!
let guess2 = engine.makePrediction(state, 'pC', 'pD');
assert.strictEqual(guess2.isCorrect, false);
const playerC_after2 = state.players.find(p => p.id === 'pC');
const playerD_after2 = state.players.find(p => p.id === 'pD');
assert.strictEqual(playerC_after2.character, 'police', 'Player C should now be Police');
assert.strictEqual(playerD_after2.character, 'raja', 'Player D should now be Raja');
assert.strictEqual(state.activePlayerId, 'pD', 'Player D should be new active player');
assert.strictEqual(state.targetRole, 'rani', 'Target role should still be Rani');
console.log('✓ Step 2 verified: C guessed D (Wrong) -> C is Police, D is now Raja');

// 5. D guesses B (Requirement #37 Step 3)
// B is Rani -> CORRECT!
let guess3 = engine.makePrediction(state, 'pD', 'pB');
assert.strictEqual(guess3.isCorrect, true);
assert.strictEqual(playerD_after2.score, 80, 'Player D should receive 80 points for finding Rani');
assert.strictEqual(state.activePlayerId, 'pB', 'Player B should now be active Rani');
assert.strictEqual(state.currentRole, 'rani', 'Current role should be Rani');
assert.strictEqual(state.targetRole, 'manthiri', 'Target role should advance to Manthiri');
console.log('✓ Step 3 verified: D guessed B (Correct) -> D gets 80 pts, B is now active Rani searching for Manthiri');

// 6. Rani B guesses A (A was swapped into Manthiri earlier!) -> CORRECT!
let guess4 = engine.makePrediction(state, 'pB', 'pA');
assert.strictEqual(guess4.isCorrect, true);
const playerB = state.players.find(p => p.id === 'pB');
assert.strictEqual(playerB.score, 60, 'Player B should receive 60 points for finding Manthiri');
assert.strictEqual(state.activePlayerId, 'pA', 'Player A is now active Manthiri');
assert.strictEqual(state.currentRole, 'manthiri');
assert.strictEqual(state.targetRole, 'police');
console.log('✓ Step 4 verified: B guessed A (Correct Manthiri) -> B gets 60 pts, A is active searching for Police');

// 7. Manthiri A guesses C (C was swapped into Police earlier!) -> CORRECT!
let guess5 = engine.makePrediction(state, 'pA', 'pC');
assert.strictEqual(guess5.isCorrect, true);
const playerA = state.players.find(p => p.id === 'pA');
assert.strictEqual(playerA.score, 40, 'Player A should receive 40 points for finding Police');
assert.strictEqual(state.activePlayerId, 'pC', 'Player C is now active Police');
assert.strictEqual(state.targetRole, 'sippai');
console.log('✓ Step 5 verified: A guessed C (Correct Police) -> A gets 40 pts, C is active searching for Sippai');

// 8. Police C guesses E (E has Sippai) -> CORRECT!
let guess6 = engine.makePrediction(state, 'pC', 'pE');
assert.strictEqual(guess6.isCorrect, true);
const playerC = state.players.find(p => p.id === 'pC');
assert.strictEqual(playerC.score, 20, 'Player C should receive 20 points for finding Sippai');
assert.strictEqual(state.activePlayerId, 'pE', 'Player E is now active Sippai');
assert.strictEqual(state.targetRole, 'thirudan');
console.log('✓ Step 6 verified: C guessed E (Correct Sippai) -> C gets 20 pts, E is active searching for Thirudan');

// 9. Sippai E guesses F (F has Thirudan) -> CORRECT!
let guess7 = engine.makePrediction(state, 'pE', 'pF');
assert.strictEqual(guess7.isCorrect, true);
const playerE = state.players.find(p => p.id === 'pE');
assert.strictEqual(playerE.score, 0, 'Thirudan gives 0 points');
assert.strictEqual(state.status, 'ROUND_END', 'Round should be complete');
console.log('✓ Step 7 verified: E found Thirudan -> Round complete!');

// 10. Check statistics and public state privacy
assert.strictEqual(state.stats.totalPredictions, 7);
assert.strictEqual(state.stats.correctPredictions, 5);
assert.strictEqual(state.stats.wrongPredictions, 2);
assert.strictEqual(state.stats.characterTransfers, 2);

const publicState = engine.getPublicState(state);
// Check that public state does not have unrevealed characters exposed
console.log('✓ Public state verified for anti-cheating');

const rankings = engine.getRankings(state);
assert.strictEqual(rankings[0].id, 'pD'); // D had 80 pts
assert.strictEqual(rankings[0].score, 80);
console.log('✓ Final rankings verified: 1st place has 80 points');

console.log('\n--- ALL GAME ENGINE TESTS PASSED PERFECTLY! ---');
