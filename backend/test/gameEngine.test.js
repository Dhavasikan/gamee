const assert = require('assert');
const { GameEngine } = require('../src/gameEngine');

console.log('--- RUNNING RAJA RANI ENGINE TESTS WITH NEW RULES ---');

const engine = new GameEngine();

const players = [
  { id: 'pA', name: 'Arun' },
  { id: 'pB', name: 'Bala' },
  { id: 'pC', name: 'Karthik' },
  { id: 'pD', name: 'Kumar' },
  { id: 'pE', name: 'Ravi' },
  { id: 'pF', name: 'Suresh' }
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
state.players.forEach(p => {
  assert.strictEqual(p.completed, false, `Player ${p.id} should initially not be completed`);
});

// 2. Raja Arun (pA) reveals
let revealRes = engine.revealRaja(state, 'pA');
assert.strictEqual(revealRes.success, true);
assert.strictEqual(state.status, 'PLAYING');
assert.strictEqual(state.rajaRevealed, true);
console.log('✓ Raja revealed successfully');

// =========================================================================
// RULE 1 TEST: WRONG GUESS - CARD SWAP PRIVACY
// =========================================================================
// Arun (pA, Raja) guesses Karthik (pC, Manthiri) as Rani -> WRONG!
let guess1 = engine.makePrediction(state, 'pA', 'pC');
assert.strictEqual(guess1.isCorrect, false);

// 1. Backend swap must occur
const arun = state.players.find(p => p.id === 'pA');
const karthik = state.players.find(p => p.id === 'pC');
assert.strictEqual(arun.character, 'manthiri', 'Arun should now be Manthiri');
assert.strictEqual(karthik.character, 'raja', 'Karthik should now be Raja');
assert.strictEqual(state.activePlayerId, 'pC', 'Karthik should be the new active player');
assert.strictEqual(state.currentRole, 'raja', 'Current role remains Raja');
assert.strictEqual(state.targetRole, 'rani', 'Target role remains Rani');

// 2. Public event privacy: Generic info ONLY, NO characters or target roles revealed!
assert.strictEqual(guess1.event.targetPlayerOldRole, undefined, 'Public event must NOT expose old role');
assert.strictEqual(guess1.event.targetPlayerOldRoleName, undefined, 'Public event must NOT expose old role name');
assert.ok(guess1.event.message.includes('Card Swapping'), 'Public message must be generic card swapping');

// 3. Private swap details must be provided for the two affected players
assert.strictEqual(guess1.swapDetails.guesser.playerId, 'pA');
assert.strictEqual(guess1.swapDetails.guesser.title, '❌ Wrong Guess');
assert.strictEqual(guess1.swapDetails.guesser.roleId, 'manthiri');
assert.ok(guess1.swapDetails.guesser.roleDisplay.includes('Manthiri'));

assert.strictEqual(guess1.swapDetails.target.playerId, 'pC');
assert.strictEqual(guess1.swapDetails.target.title, '🔄 Your card has been swapped');
assert.strictEqual(guess1.swapDetails.target.roleId, 'raja');
assert.ok(guess1.swapDetails.target.roleDisplay.includes('Raja'));
console.log('✓ RULE 1 verified: Swap occurred, public event has NO roles, private swapDetails given to Arun and Karthik');

// Karthik (pC, now Raja) guesses Kumar (pD, Police) as Rani -> WRONG!
let guess2 = engine.makePrediction(state, 'pC', 'pD');
assert.strictEqual(guess2.isCorrect, false);
const kumar = state.players.find(p => p.id === 'pD');
assert.strictEqual(karthik.character, 'police', 'Karthik should now be Police');
assert.strictEqual(kumar.character, 'raja', 'Kumar should now be Raja');
assert.strictEqual(state.activePlayerId, 'pD', 'Kumar is new active Raja');
console.log('✓ Karthik guessed Kumar (Wrong) -> Kumar is now Raja');

// =========================================================================
// RULE 2 TEST: CORRECT GUESS - WINNER CANNOT BE SELECTED AGAIN (LOCKED)
// =========================================================================
// Kumar (pD, Raja) guesses Bala (pB, Rani) as Rani -> CORRECT!
let guess3 = engine.makePrediction(state, 'pD', 'pB');
assert.strictEqual(guess3.isCorrect, true);
assert.strictEqual(kumar.score, 80, 'Kumar gets 80 pts for finding Rani');
assert.strictEqual(kumar.completed, true, 'Kumar should now be COMPLETED 🔒');
assert.strictEqual(state.activePlayerId, 'pB', 'Bala (Rani) becomes active player');
assert.strictEqual(state.currentRole, 'rani', 'Current role is Rani');
assert.strictEqual(state.targetRole, 'manthiri', 'Target role advances to Manthiri');
console.log('✓ RULE 2 Part 1: Kumar correctly found Rani -> Kumar is COMPLETED 🔒 and gets 80 pts');

// Verify completed player CANNOT be selected by the next active player (Bala)
let invalidGuessOnCompleted = engine.makePrediction(state, 'pB', 'pD');
assert.strictEqual(invalidGuessOnCompleted.success, false);
assert.strictEqual(
  invalidGuessOnCompleted.error,
  'This player has already completed their role and cannot be selected',
  'Backend MUST reject selection of completed player'
);
console.log('✓ RULE 2 Part 2: Selecting completed Kumar rejected by backend!');

// Bala (pB, Rani) guesses Arun (pA, who has Manthiri) -> CORRECT!
let guess4 = engine.makePrediction(state, 'pB', 'pA');
assert.strictEqual(guess4.isCorrect, true);
const bala = state.players.find(p => p.id === 'pB');
assert.strictEqual(bala.score, 60, 'Bala receives 60 points for finding Manthiri');
assert.strictEqual(bala.completed, true, 'Bala is now COMPLETED 🔒');
assert.strictEqual(state.activePlayerId, 'pA', 'Arun is now active Manthiri');
assert.strictEqual(state.currentRole, 'manthiri');
assert.strictEqual(state.targetRole, 'police');
console.log('✓ Bala correctly found Arun (Manthiri) -> Bala is COMPLETED 🔒 (+60 pts)');

// Arun cannot select Kumar or Bala (both completed!)
assert.strictEqual(engine.makePrediction(state, 'pA', 'pD').success, false);
assert.strictEqual(engine.makePrediction(state, 'pA', 'pB').success, false);
console.log('✓ Arun cannot select either Kumar or Bala as both are completed');

// Arun (pA, Manthiri) guesses Karthik (pC, who has Police) -> CORRECT!
let guess5 = engine.makePrediction(state, 'pA', 'pC');
assert.strictEqual(guess5.isCorrect, true);
assert.strictEqual(arun.score, 40, 'Arun receives 40 points for finding Police');
assert.strictEqual(arun.completed, true, 'Arun is now COMPLETED 🔒');
assert.strictEqual(state.activePlayerId, 'pC', 'Karthik is now active Police');
assert.strictEqual(state.currentRole, 'police');
assert.strictEqual(state.targetRole, 'sippai');
console.log('✓ Arun correctly found Karthik (Police) -> Arun is COMPLETED 🔒 (+40 pts)');

// Karthik (pC, Police) guesses Ravi (pE, Sippai) -> CORRECT!
let guess6 = engine.makePrediction(state, 'pC', 'pE');
assert.strictEqual(guess6.isCorrect, true);
assert.strictEqual(karthik.score, 20, 'Karthik receives 20 points for finding Sippai');
assert.strictEqual(karthik.completed, true, 'Karthik is now COMPLETED 🔒');
assert.strictEqual(state.activePlayerId, 'pE', 'Ravi is now active Sippai');
assert.strictEqual(state.targetRole, 'thirudan');
console.log('✓ Karthik correctly found Ravi (Sippai) -> Karthik is COMPLETED 🔒 (+20 pts)');

// Ravi (pE, Sippai) guesses Suresh (pF, Thirudan) -> CORRECT!
let guess7 = engine.makePrediction(state, 'pE', 'pF');
assert.strictEqual(guess7.isCorrect, true);
const ravi = state.players.find(p => p.id === 'pE');
const suresh = state.players.find(p => p.id === 'pF');
assert.strictEqual(ravi.score, 0, 'Thirudan gives 0 points');
assert.strictEqual(ravi.completed, true, 'Ravi is COMPLETED 🔒');
assert.strictEqual(suresh.finalRole, true, 'Suresh holds the Final Role 🏁');
assert.strictEqual(state.status, 'ROUND_END', 'Round should be complete');
console.log('✓ Ravi found Suresh (Thirudan) -> Round complete!');

// =========================================================================
// FINAL RESULTS TEST (Requirement 8)
// =========================================================================
const rankings = engine.getRankings(state);
console.log('\n--- FINAL COURT RANKINGS ---');
rankings.forEach(p => {
  const statusStr = p.completed ? '✅ Completed' : (p.finalRole ? '🏁 Final Role' : 'Incomplete');
  console.log(`${p.name.padEnd(10)} ${p.score.toString().padEnd(4)} Points   ${statusStr}`);
});

assert.strictEqual(rankings[0].id, 'pD'); // Kumar 80 pts
assert.strictEqual(rankings[0].score, 80);
assert.strictEqual(rankings[0].completed, true);

assert.strictEqual(rankings[1].id, 'pB'); // Bala 60 pts
assert.strictEqual(rankings[1].score, 60);
assert.strictEqual(rankings[1].completed, true);

assert.strictEqual(rankings[2].id, 'pA'); // Arun 40 pts
assert.strictEqual(rankings[2].score, 40);
assert.strictEqual(rankings[2].completed, true);

assert.strictEqual(rankings[3].id, 'pC'); // Karthik 20 pts
assert.strictEqual(rankings[3].score, 20);
assert.strictEqual(rankings[3].completed, true);

assert.strictEqual(rankings[4].id, 'pE'); // Ravi 0 pts, completed
assert.strictEqual(rankings[4].completed, true);

assert.strictEqual(rankings[5].id, 'pF'); // Suresh 0 pts, finalRole
assert.strictEqual(rankings[5].finalRole, true);

// Check public state anti-cheating
const publicState = engine.getPublicState(state);
publicState.players.forEach(p => {
  assert.strictEqual(p.character, undefined, 'Public state players must NEVER contain secret character');
  assert.strictEqual(typeof p.completed, 'boolean', 'Public state must have completed flag');
});
console.log('✓ Public state anti-cheating validated: No characters exposed');

console.log('\n--- ALL GAME ENGINE TESTS PASSED WITH 100% SUCCESS! ---');
