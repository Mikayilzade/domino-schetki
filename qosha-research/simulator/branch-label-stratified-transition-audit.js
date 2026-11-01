'use strict';
// Stratified metamorphic audit of reachable branch-label states.
// This checks the current research kernel under all 24 side relabelings;
// it does not authenticate physical branch or block rules.
// node qosha-research/simulator/branch-label-stratified-transition-audit.js test
// node qosha-research/simulator/branch-label-stratified-transition-audit.js [start=3407220] [count=500] [quota=60]
const assert = require('node:assert/strict');
const e = require('./engine');
const d = require('./turn-dispatcher');
const init = require('./initializer');
const rd = require('./round-driver');

const CATEGORIES = ['pass', 'single', 'double', 'mixed', 'multi', 'late'];
const IDENTITY = [0, 1, 2, 3];
function permutations(a = [0, 1, 2, 3], i = 0, out = []) {
  if (i === a.length) { out.push(a.slice()); return out; }
  for (let j = i; j < a.length; j++) {
    [a[i], a[j]] = [a[j], a[i]];
    permutations(a, i + 1, out);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return out;
}
function mapSide(side, p) {
  if (side == null) return null;
  const i = e.SIDES.indexOf(side);
  if (i < 0) throw new Error('unknown side ' + side);
  return e.SIDES[p[i]];
}
function relabelBranchState(s, p) {
  const branches = {};
  e.SIDES.forEach((old, i) => { branches[e.SIDES[p[i]]] = { ...s.branches[old] }; });
  return { center: s.center.slice(), branches };
}
function branchSig(s) {
  return e.SIDES.map(side => [side, +s.branches[side].active, s.branches[side].end]);
}
function actionSig(a, p = null) {
  return JSON.stringify({
    type: a.type,
    handIndex: a.handIndex ?? null,
    side: p ? mapSide(a.side, p) : (a.side ?? null),
    from: a.from ?? null,
    to: a.to ?? null,
    tile: a.tile ? e.tileKey(a.tile) : null,
    tiles: a.tiles ? a.tiles.map(e.tileKey) : null,
    numbers: a.numbers || [],
    finishDoubles: a.finishDoubles ? a.finishDoubles.map(e.tileKey) : null
  });
}
function optionsStateSig(o) {
  return {
    phase: o.phase,
    drawn: o.drawn,
    drawnTile: o.drawnTile ? e.tileKey(o.drawnTile) : null,
    hand: o.hand.map(e.tileKey).sort(),
    stock: o.stock.map(e.tileKey)
  };
}
function resultSig(x, p) {
  return {
    branch: branchSig(relabelBranchState(x.branchState, p)),
    opened: [...x.openingState.openedNumbers].sort((a, b) => a - b),
    hand: x.hand.map(e.tileKey).sort(),
    stock: x.stock.map(e.tileKey),
    passed: x.passed,
    drawn: x.drawn,
    drawnTile: x.drawnTile ? e.tileKey(x.drawnTile) : null,
    played: x.playedTiles.map(e.tileKey),
    finish: x.finishDoubles.map(e.tileKey)
  };
}
function stateKey(s) {
  return JSON.stringify({
    hands: s.hands.map(h => h.map(e.tileKey).sort()),
    stock: s.stock.map(e.tileKey),
    branch: branchSig(s.branchState),
    opened: [...s.openingState.openedNumbers].sort((a, b) => a - b),
    current: s.currentPlayer,
    passes: s.consecutivePasses
  });
}
function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function dealKey(deal, previousWinner) {
  return deal.hands.map(h => h.map(e.tileKey).sort().join(',')).join('|') +
    '|stock=' + deal.stock.map(e.tileKey).join(',') + '|previousWinner=' + previousWinner;
}
function drawFixtures() {
  const branchState = e.createBranchState([1, 1]);
  const openingState = e.createOpeningState([1]);
  const cases = [
    { name: 'draw-then-play', hand: [[6, 6]], stock: [[1, 4]], phase: 'play' },
    { name: 'draw-then-pass', hand: [[6, 6]], stock: [[0, 0]], phase: 'pass' }
  ];
  const ps = permutations();
  let optionChecks = 0, actionTransitions = 0, passTransitions = 0;
  for (const fixture of cases) {
    const original = d.turnOptions(branchState, openingState, fixture.hand, fixture.stock);
    assert.equal(original.drawn, true, fixture.name + ' must draw');
    assert.equal(original.phase, fixture.phase, fixture.name + ' phase');
    for (const p of ps) {
      const relabeled = relabelBranchState(branchState, p);
      const other = d.turnOptions(relabeled, openingState, fixture.hand, fixture.stock);
      assert.deepStrictEqual(optionsStateSig(original), optionsStateSig(other), fixture.name + ' draw state');
      assert.deepStrictEqual(
        original.actions.map(a => actionSig(a, p)).sort(),
        other.actions.map(a => actionSig(a)).sort(),
        fixture.name + ' legal actions'
      );
      optionChecks++;
      if (original.phase === 'pass') {
        const x = d.applyTurn(branchState, openingState, fixture.hand, fixture.stock, null);
        const y = d.applyTurn(relabeled, openingState, fixture.hand, fixture.stock, null);
        assert.deepStrictEqual(resultSig(x, p), resultSig(y, IDENTITY), fixture.name + ' pass transition');
        passTransitions++;
      } else {
        const mapped = new Map(other.actions.map(a => [actionSig(a), a]));
        for (const a of original.actions) {
          const hit = mapped.get(actionSig(a, p));
          assert.ok(hit, fixture.name + ' mapped action missing');
          const x = d.applyTurn(branchState, openingState, fixture.hand, fixture.stock, a);
          const y = d.applyTurn(relabeled, openingState, fixture.hand, fixture.stock, hit);
          assert.deepStrictEqual(resultSig(x, p), resultSig(y, IDENTITY), fixture.name + ' action transition');
          actionTransitions++;
        }
      }
    }
  }
  return {
    scenarios: cases.map(x => x.name),
    optionPermutationChecks: optionChecks,
    drawThenPlayActionTransitions: actionTransitions,
    drawThenPassTransitions: passTransitions
  };
}
function auditSelectedState(rec, ps, stats) {
  const state = rec.state;
  const seat = state.currentPlayer;
  const original = d.turnOptions(state.branchState, state.openingState, state.hands[seat], state.stock);
  for (const p of ps) {
    const relabeledState = relabelBranchState(state.branchState, p);
    const other = d.turnOptions(relabeledState, state.openingState, state.hands[seat], state.stock);
    assert.deepStrictEqual(optionsStateSig(original), optionsStateSig(other), 'draw/pass state mismatch seed ' + rec.seed);
    assert.deepStrictEqual(
      original.actions.map(a => actionSig(a, p)).sort(),
      other.actions.map(a => actionSig(a)).sort(),
      'legal action set mismatch seed ' + rec.seed
    );
    stats.actionSetChecks++;
    if (original.phase === 'pass') {
      const x = d.applyTurn(state.branchState, state.openingState, state.hands[seat], state.stock, null);
      const y = d.applyTurn(relabeledState, state.openingState, state.hands[seat], state.stock, null);
      assert.deepStrictEqual(resultSig(x, p), resultSig(y, IDENTITY), 'pass transition mismatch seed ' + rec.seed);
      stats.passTransitionChecks++;
    } else {
      const mapped = new Map(other.actions.map(a => [actionSig(a), a]));
      for (const a of original.actions) {
        const hit = mapped.get(actionSig(a, p));
        assert.ok(hit, 'mapped action absent seed ' + rec.seed);
        const x = d.applyTurn(state.branchState, state.openingState, state.hands[seat], state.stock, a);
        const y = d.applyTurn(relabeledState, state.openingState, state.hands[seat], state.stock, hit);
        assert.deepStrictEqual(resultSig(x, p), resultSig(y, IDENTITY), 'action transition mismatch seed ' + rec.seed);
        stats.actionTransitionChecks++;
        stats.byType[a.type]++;
      }
    }
  }
}
function run(startSeed = 3407220, count = 500, quota = 60, maxTurns = 200) {
  assert.ok(Number.isSafeInteger(startSeed) && startSeed >= 0, 'invalid start seed');
  assert.ok(Number.isInteger(count) && count > 0 && count <= 500, 'invalid count');
  assert.ok(Number.isInteger(quota) && quota > 0 && quota <= 200, 'invalid quota');
  assert.ok(Number.isInteger(maxTurns) && maxTurns > 0 && maxTurns <= 200, 'invalid maxTurns');

  const ps = permutations();
  assert.equal(ps.length, 24);
  const buckets = Object.fromEntries(CATEGORIES.map(name => [name, []]));
  const records = new Map(), seenDeals = new Map(), duplicateDealPairs = [];
  let reachablePositions = 0, finishRounds = 0, blockRounds = 0, turnTotal = 0;

  for (let seed = startSeed; seed < startSeed + count; seed++) {
    const deal = e.dealThreeByNine(seed);
    const previousWinner = seed % 3;
    const fingerprint = dealKey(deal, previousWinner);
    if (seenDeals.has(fingerprint)) {
      duplicateDealPairs.push({ seed, duplicateOfSeed: seenDeals.get(fingerprint) });
      continue;
    }
    seenDeals.set(fingerprint, seed);
    const initial = init.initializeThreePlayerRound({
      seed, isFirstRound: false, previousWinnerIndex: previousWinner
    });
    assert.equal(initial.kind, 'ready', 'initializer did not resolve seed ' + seed);
    let state = rd.cloneRoundState(initial);
    while (!state.outcome && state.turns < maxTurns) {
      const key = stateKey(state);
      if (!records.has(key)) records.set(key, { key, state: rd.cloneRoundState(state), seed });
      const options = d.turnOptions(
        state.branchState, state.openingState, state.hands[state.currentPlayer], state.stock
      );
      const tags = [];
      if (options.phase === 'pass') tags.push('pass');
      if (options.actions.some(a => a.type === 'single')) tags.push('single');
      if (options.actions.some(a => a.type === 'double-sequence')) tags.push('double');
      if (options.actions.some(a => a.type === 'mixed-finish')) tags.push('mixed');
      if (options.actions.length >= 4) tags.push('multi');
      if (state.openingState.openedNumbers.size >= 4) tags.push('late');
      for (const tag of tags) buckets[tag].push(key);

      reachablePositions++;
      state = rd.stepRound(state, (opts, current) => {
        const h = e.mixSeed32((
          seed ^
          Math.imul(current.turns + 1, 0x9e3779b9) ^
          Math.imul(current.currentPlayer + 1, 0x85ebca6b)
        ) >>> 0);
        return opts.actions[h % opts.actions.length];
      });
    }
    assert.ok(state.outcome, 'turn cap reached for seed ' + seed);
    turnTotal += state.turns;
    if (state.outcome.kind === 'finish') finishRounds++;
    else if (state.outcome.kind === 'block') blockRounds++;
    else throw new Error('unexpected outcome kind ' + state.outcome.kind);
  }

  const strata = {};
  const selected = new Map();
  for (const name of CATEGORIES) {
    const unique = [...new Set(buckets[name])];
    unique.sort((a, b) => hashString(a) - hashString(b) || a.localeCompare(b));
    const chosen = unique.slice(0, quota);
    strata[name] = { eligibleUniqueStates: unique.length, selected: chosen.length };
    for (const key of chosen) selected.set(key, records.get(key));
  }
  const stats = {
    actionSetChecks: 0,
    actionTransitionChecks: 0,
    passTransitionChecks: 0,
    byType: { single: 0, 'double-sequence': 0, 'mixed-finish': 0 }
  };
  for (const rec of selected.values()) auditSelectedState(rec, ps, stats);
  const draw = drawFixtures();

  return {
    schema: 'qosha-branch-label-stratified-transition-audit/v1',
    engine: 'qosa-research-0.5.3 + branch-label-stratified-transition-audit/v1',
    rules: 'recovered qosa-1.0.0 3x9+stock; branch labels treated as interchangeable for metamorphic checks; physical branch reopening and block/tie scoring remain PROVISIONAL',
    seedStart: startSeed,
    seedEnd: startSeed + count - 1,
    seedDraws: count,
    uniqueFullAllocations: seenDeals.size,
    duplicateDealPairs,
    trajectoryPolicy: 'deterministic seeded legal-action index; validation trajectories only',
    reachablePositions,
    finishRounds,
    blockRounds,
    meanTurnsIncludingOpeningSetup: turnTotal / seenDeals.size,
    strata,
    selectedUniqueStates: selected.size,
    branchLabelPermutations: ps.length,
    legalActionSetChecks: stats.actionSetChecks,
    legalActionTransitionChecks: stats.actionTransitionChecks,
    passTransitionChecks: stats.passTransitionChecks,
    actionTransitionsByType: stats.byType,
    explicitDrawFixtures: draw,
    mismatches: { legalActionSet: 0, actionTransition: 0, passTransition: 0, drawFixture: 0 },
    strategyComparisonRounds: 0,
    hiddenWorldAllocations: 0,
    confidence: 'high for internal model-level equivariance in the tested states; no physical-rule authentication',
    limitations: 'Metamorphic checks compare the current research kernel with itself under all 24 side relabelings. The seeded trajectories generate reachable validation states only; they are not a strategy tournament. The physical branch reopening and blocked-tie rules remain provisional.',
    exactNextAction: 'Obtain an authenticated real-game trace/ruling for late-arrival branch reopening and blocked-tie scoring; keep strategy ranking paused until those rules are resolved.'
  };
}
function test() {
  const draw = drawFixtures();
  const a = run(3407220, 8, 20, 80);
  const b = run(3407220, 8, 20, 80);
  assert.deepStrictEqual(a, b, 'seeded audit replay differs');
  assert.equal(a.branchLabelPermutations, 24);
  assert.ok(a.legalActionSetChecks > 0);
  assert.ok(a.legalActionTransitionChecks > 0);
  assert.equal(draw.optionPermutationChecks, 48);
  assert.equal(draw.drawThenPlayActionTransitions, 96);
  assert.equal(draw.drawThenPassTransitions, 24);
  return {
    passed: true,
    replaySeedDraws: 8,
    sampledUniqueStates: a.selectedUniqueStates,
    actionSetChecks: a.legalActionSetChecks,
    actionTransitions: a.legalActionTransitionChecks,
    drawFixtures: draw
  };
}
if (require.main === module) {
  const args = process.argv.slice(2);
  const out = args[0] === 'test'
    ? test()
    : run(Number(args[0] || 3407220), Number(args[1] || 500), Number(args[2] || 60));
  console.log(JSON.stringify(out, null, 2));
}
module.exports = { run, test, permutations, relabelBranchState, actionSig, drawFixtures };
