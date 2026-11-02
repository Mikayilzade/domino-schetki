'use strict';
const assert = require('node:assert/strict');
const e = require('./engine');
const init = require('./initializer');
const d = require('./turn-dispatcher');
const t = require('./turn-kernel');
const round = require('./round-driver');

let assertions = 0;
function eq(actual, expected, message) { assert.deepStrictEqual(actual, expected, message); assertions++; }
function ok(value, message) { assert.ok(value, message); assertions++; }
function tileSet(list) { return list.map(e.tileKey).sort(); }
const deck = e.createDoubleSixDeck();
const deckKeys = tileSet(deck);
function removeKeys(source, used) { return source.filter(tile => !used.has(e.tileKey(tile))); }
function buildFixture(mode) {
  const used = new Set();
  const take = tile => {
    const key = e.tileKey(tile);
    if (used.has(key)) throw new Error('duplicate fixture tile ' + key);
    used.add(key);
    return [...tile];
  };
  const oneTiles = [[0,1],[1,2],[1,3],[1,4],[1,5],[1,6]];
  const nonOne = deck.filter(([a,b]) => a !== 1 && b !== 1);
  let starter, stock, seat1, seat2;
  if (mode === 'forced-pass') {
    starter = [take([1,1]), ...nonOne.slice(0,8).map(take)];
    stock = [take(nonOne[8])];
    // All non-1 tiles of seat 1 are deliberately chosen away from 0-0;
    // seat 2 gets no 1-containing tile and no 0-0.
    const remainingNonOne = removeKeys(nonOne, used);
    seat1 = [...oneTiles.map(take), ...remainingNonOne.slice(0,3).map(take)];
    seat2 = removeKeys(deck, used).map(take);
  } else if (mode === 'followup') {
    starter = [take([1,1]), take([1,2]), ...nonOne.filter(t => e.tileKey(t) !== '0-6').slice(0,7).map(take)];
    stock = [take([0,6])];
    const remaining = removeKeys(deck, used);
    seat1 = [take([0,1]), take([1,3]), ...remaining.filter(t => t[0] !== 1 && t[1] !== 1).slice(0,7).map(take)];
    seat2 = removeKeys(deck, used).map(take);
  } else throw new Error('unknown fixture mode');
  const hands = [starter, seat1, seat2];
  eq(hands.map(h => h.length), [9,9,9], mode + ': each initial hand has nine tiles');
  eq(stock.length, 1, mode + ': one stock tile');
  eq([...hands.flat(), ...stock].length, 28, mode + ': all 28 tiles dealt');
  eq(tileSet([...hands.flat(), ...stock]), deckKeys, mode + ': exact unique deck partition');
  return { hands, stock };
}
function removedTiles(before, after) {
  const counts = new Map();
  for (const tile of before) {
    const k = e.tileKey(tile);
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  for (const tile of after) {
    const k = e.tileKey(tile);
    const n = counts.get(k) || 0;
    if (n <= 0) throw new Error('hand gained an unexpected tile: ' + k);
    counts.set(k, n - 1);
  }
  const removed = [];
  for (const [k,n] of counts) for (let i=0;i<n;i++) removed.push(k.split('-').map(Number));
  return removed;
}
function assertConservation(state, played, label) {
  const all = [...state.hands.flat(), ...state.stock, ...played];
  eq(all.length, 28, label + ': total tile count conserved');
  eq(new Set(all.map(e.tileKey)).size, 28, label + ': no tile duplicated');
  eq(tileSet(all), deckKeys, label + ': exact deck identities conserved');
}
function runReturnCycle(initial, openingPlayed, policy, label) {
  let state = round.cloneRoundState(initial);
  const starter = initial.starter;
  const played = [[1,1], ...(openingPlayed ? [openingPlayed] : [])];
  assertConservation(state, played, label + ' after initializer');
  const startPlayer = state.currentPlayer;
  eq(startPlayer, (starter + 1) % 3, label + ': next player after opening');
  const startTurns = state.turns;
  const startPasses = state.consecutivePasses;
  const stepLog = [];
  for (let i=0;i<2;i++) {
    const p = state.currentPlayer;
    const beforeHand = state.hands[p].map(x => [...x]);
    const opts = d.turnOptions(state.branchState, state.openingState, beforeHand, state.stock);
    if (opts.phase === 'play') {
      const choice = policy ? policy(opts, state, p, i) : opts.actions[0];
      ok(choice && opts.actions.includes(choice), label + ': selected action is in current legal action set');
    } else {
      eq(opts.actions, [], label + ': pass has no legal actions');
    }
    const previousPasses = state.consecutivePasses;
    const next = round.stepRound(state, policy ? (o,s) => policy(o,s,p,i) : o => o.actions[0]);
    const removed = removedTiles(beforeHand, next.hands[p]);
    played.push(...removed);
    eq(next.turns, state.turns + 1, label + ': one round-driver step increments turn count');
    eq(next.consecutivePasses, opts.phase === 'pass' ? previousPasses + 1 : 0,
      label + ': pass counter increments on pass and resets on play');
    eq(next.outcome, null, label + ': no premature finish/block during return cycle');
    assertConservation(next, played, label + ' after seat ' + p + ' step');
    stepLog.push({ player: p, phase: opts.phase, actionType: opts.phase === 'play' ? opts.actions[0].type : null, removed: removed.map(e.tileKey) });
    state = next;
  }
  eq(state.currentPlayer, starter, label + ': clockwise order returns to starter after two opponents');
  eq(state.turns, startTurns + 2, label + ': exact two-turn cycle');
  ok(state.consecutivePasses >= 0 && state.consecutivePasses < 3, label + ': pass count below 3-player block threshold');
  eq(t.isBlocked({ stock: state.stock, consecutivePasses: state.consecutivePasses, players: 3 }), false,
    label + ': stock/pass block gate remains closed');
  eq(d.roundOutcome({ hands: state.hands, stock: state.stock, consecutivePasses: state.consecutivePasses,
    lastPlayerIndex: (starter + 2) % 3, lastTurnResult: { passed: true }, players: 3 }), null,
    label + ': round outcome does not infer block before pass threshold');
  return { state, played, stepLog, startPasses };
}
function test() {
  assertions = 0;
  // Case A: starter holds 1-1, mandatory stock draw, then plays 1-2.
  const dealA = buildFixture('followup');
  const initializedA = init.initializeThreePlayerRoundFromDeal({
    ...dealA, isFirstRound: false, previousWinnerIndex: 2,
    chooseFollowup: choices => choices.find(x => e.tileKey(x.tile) === '1-2')
  });
  eq(initializedA.kind, 'ready', 'follow-up case initializes');
  eq(initializedA.starter, 0, '1-1 owner starts');
  eq(initializedA.openingFollowup && e.tileKey(initializedA.openingFollowup.tile), '1-2', 'mandatory follow-up selected as fixture specifies');
  eq(initializedA.consecutivePasses, 0, 'successful opening follow-up clears passes');
  eq(initializedA.stock, [], 'opening consumes the one stock tile');
  const cycleA = runReturnCycle(initializedA, [1,2], null, 'mandatory-follow-up');
  eq(cycleA.startPasses, 0, 'follow-up cycle starts with zero passes');

  // Case B: starter has no 1 after drawing; the opening is a forced pass.
  // Seat 1 plays 0-1 on up; seat 2 has neither a 1 tile nor 0-0 and must pass.
  const dealB = buildFixture('forced-pass');
  const initializedB = init.initializeThreePlayerRoundFromDeal({ ...dealB, isFirstRound: false, previousWinnerIndex: 2 });
  eq(initializedB.kind, 'ready', 'forced-pass case initializes');
  eq(initializedB.openingFollowup, null, 'no follow-up action exists');
  eq(initializedB.openingPassed, true, 'initializer records forced opening pass');
  eq(initializedB.consecutivePasses, 1, 'opening pass increments pass count');
  const forcedPolicy = (opts, state, player) => {
    if (player === 1) return opts.actions.find(a => a.type === 'single' && e.tileKey(a.tile) === '0-1' && a.side === 'up');
    return opts.actions[0];
  };
  const cycleB = runReturnCycle(initializedB, null, forcedPolicy, 'forced-opening-pass');
  eq(cycleB.stepLog.map(x => x.phase), ['play','pass'], 'next seat plays and following seat passes');
  eq(cycleB.state.consecutivePasses, 1, 'play resets opening pass; next pass increments to one');

  // Explicit boundary fixtures for the coded block gate.
  eq(t.isBlocked({ stock: [], consecutivePasses: 2, players: 3 }), false, 'two passes do not block three-player round');
  eq(t.isBlocked({ stock: [], consecutivePasses: 3, players: 3 }), true, 'three consecutive passes block with empty stock');
  eq(t.isBlocked({ stock: [[6,6]], consecutivePasses: 3, players: 3 }), false, 'nonempty stock prevents block');
  return {
    passed: true,
    assertions,
    engineBlobs: {
      engine: '82e5bd544a57683d5b4f7812b2d4abf80da894',
      initializer: '2fad29e516454580ec9a06115354e9866f3096e6',
      turnKernel: '94657896e1f8e471ceb2e9a65d1842b6102dff18',
      dispatcher: '55b0bcf3f1653c64b4e06bc95d7e917a480562a0',
      roundDriver: 'fbaad78865adbddde1ea6651e6a501dc0bde3203'
    },
    scenarios: {
      mandatoryFollowup: { steps: cycleA.stepLog, passCountAtReturn: cycleA.state.consecutivePasses, turnsAtReturn: cycleA.state.turns },
      forcedOpeningPass: { steps: cycleB.stepLog, passCountAtReturn: cycleB.state.consecutivePasses, turnsAtReturn: cycleB.state.turns }
    },
    limitation: 'Two deterministic constructed 3x9 partitions exercise the initializer-to-round-driver integration. This validates coded transitions only, not physical branch/pass/block rules or strategy outcomes.'
  };
}
if (require.main === module) console.log(JSON.stringify(test(), null, 2));
module.exports = { test };
