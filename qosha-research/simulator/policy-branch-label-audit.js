'use strict';
// Policy-generated reachable-state audit. Branch-label symmetry is a model
// metamorphic assumption, not authentication of physical table rules.
// node qosha-research/simulator/policy-branch-label-audit.js test
// node qosha-research/simulator/policy-branch-label-audit.js [start=3414620] [count=500] [quota=60] [maxTurns=200]
const assert = require('node:assert/strict');
const e = require('./engine');
const d = require('./turn-dispatcher');
const init = require('./initializer');
const rd = require('./round-driver');
const sym = require('./branch-label-symmetric-tiebreak');
const drawAudit = require('./branch-label-stratified-transition-audit');

const CATEGORIES = ['pass', 'single', 'double', 'mixed', 'multi', 'late'];
const POLICIES = ['random-legal', 'min-hand-pips', 'fast-doubles', 'moderate-double-hold', 'closed-branch-control'];
const TRAJECTORY_MIX = ['fast-doubles', 'min-hand-pips', 'closed-branch-control'];
const IDENTITY = [0, 1, 2, 3];

function branchSig(s) {
  return e.SIDES.map(side => [side, +s.branches[side].active, s.branches[side].end]);
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
function optionsStateSig(o) {
  return JSON.stringify({
    phase: o.phase, drawn: o.drawn,
    drawnTile: o.drawnTile ? e.tileKey(o.drawnTile) : null,
    hand: o.hand.map(e.tileKey).sort(), stock: o.stock.map(e.tileKey)
  });
}
function resultSig(x, p) {
  return JSON.stringify({
    branch: branchSig(sym.relabel(x.branchState, p)),
    opened: [...x.openingState.openedNumbers].sort((a, b) => a - b),
    hand: x.hand.map(e.tileKey).sort(), stock: x.stock.map(e.tileKey),
    passed: x.passed, drawn: x.drawn,
    drawnTile: x.drawnTile ? e.tileKey(x.drawnTile) : null,
    played: x.playedTiles.map(e.tileKey), finish: x.finishDoubles.map(e.tileKey)
  });
}
function mappedDistribution(entries, p) {
  const out = new Map();
  for (const x of entries) {
    const key = sym.actionSig(x.action, p);
    assert.ok(!out.has(key), 'duplicate policy action key');
    out.set(key, x.probability);
  }
  return out;
}
function sameDistribution(a, b) {
  if (a.size !== b.size) return false;
  for (const [key, value] of a) if (!b.has(key) || Math.abs(value - b.get(key)) > 1e-12) return false;
  return true;
}
function symmetricInitializer(seed) {
  return init.initializeThreePlayerRound({
    seed, isFirstRound: false, previousWinnerIndex: seed % 3,
    // Preserve the canonical follow-up tile choice, randomize only its side
    // with a seed-derived selector as specified in EXPERIMENTS.md.
    chooseFollowupSide: sideChoices => {
      const rng = e.xorshift32(e.mixSeed32((seed ^ 0x51ed270b) >>> 0));
      return sideChoices[Math.floor(rng() * sideChoices.length)];
    }
  });
}
function run(startSeed = 3414620, count = 500, quota = 60, maxTurns = 200) {
  assert.ok(Number.isSafeInteger(startSeed) && startSeed >= 0, 'invalid start seed');
  assert.ok(Number.isInteger(count) && count > 0 && count <= 500, 'invalid count');
  assert.ok(Number.isInteger(quota) && quota > 0 && quota <= 200, 'invalid quota');
  assert.ok(Number.isInteger(maxTurns) && maxTurns > 0 && maxTurns <= 200, 'invalid maxTurns');

  const permutations = sym.perms();
  assert.equal(permutations.length, 24);
  const buckets = Object.fromEntries(CATEGORIES.map(name => [name, []]));
  const records = new Map(), seenDeals = new Map(), duplicateDealPairs = [];
  let reachablePositions = 0, finishRounds = 0, blockRounds = 0, unresolvedRounds = 0, turnTotal = 0;

  for (let seed = startSeed; seed < startSeed + count; seed++) {
    const deal = e.dealThreeByNine(seed), previousWinner = seed % 3;
    const fingerprint = dealKey(deal, previousWinner);
    if (seenDeals.has(fingerprint)) {
      duplicateDealPairs.push({ seed, duplicateOfSeed: seenDeals.get(fingerprint) });
      continue;
    }
    seenDeals.set(fingerprint, seed);

    for (let rotation = 0; rotation < 3; rotation++) {
      const initial = symmetricInitializer(seed);
      assert.equal(initial.kind, 'ready', 'initializer did not resolve seed ' + seed);
      let state = rd.cloneRoundState(initial);
      const seatPolicies = [0, 1, 2].map(seat => TRAJECTORY_MIX[(seat + rotation) % 3]);

      while (!state.outcome && state.turns < maxTurns) {
        const key = stateKey(state);
        if (!records.has(key)) records.set(key, { key, state: rd.cloneRoundState(state), seed, rotation });

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
        state = rd.stepRound(state, (opts, current) => sym.chooseSymmetric(
          seatPolicies[current.currentPlayer], opts,
          {
            seed, rotation, turns: current.turns, player: current.currentPlayer,
            branchState: current.branchState, salt: 0
          },
          'orbit'
        ));
      }
      assert.ok(state.outcome, 'turn cap reached for seed ' + seed);
      turnTotal += state.turns;
      if (state.outcome.kind === 'finish') finishRounds++;
      else if (state.outcome.kind === 'block') blockRounds++;
      else unresolvedRounds++;
    }
  }

  const strata = {}, selected = new Map();
  for (const name of CATEGORIES) {
    const unique = [...new Set(buckets[name])];
    unique.sort((a, b) => hashString(a) - hashString(b) || a.localeCompare(b));
    const chosen = unique.slice(0, quota);
    strata[name] = { eligibleUniqueStates: unique.length, selected: chosen.length };
    for (const key of chosen) selected.set(key, records.get(key));
  }

  const stats = {
    actionSetChecks: 0, actionTransitionChecks: 0, passTransitionChecks: 0,
    byType: { single: 0, 'double-sequence': 0, 'mixed-finish': 0 },
    distributionalChecks: Object.fromEntries(POLICIES.map(name => [name, 0])),
    distributionalMismatches: Object.fromEntries(POLICIES.map(name => [name, 0]))
  };

  for (const rec of selected.values()) {
    const state = rec.state, seat = state.currentPlayer;
    const original = d.turnOptions(state.branchState, state.openingState, state.hands[seat], state.stock);

    for (const p of permutations) {
      const relabeledBranch = sym.relabel(state.branchState, p);
      const relabeled = d.turnOptions(relabeledBranch, state.openingState, state.hands[seat], state.stock);
      assert.deepStrictEqual(optionsStateSig(original), optionsStateSig(relabeled), 'draw/pass state mismatch');
      assert.deepStrictEqual(
        original.actions.map(a => sym.actionSig(a, p)).sort(),
        relabeled.actions.map(a => sym.actionSig(a)).sort(),
        'legal action set mismatch'
      );
      stats.actionSetChecks++;

      if (original.phase === 'pass') {
        const x = d.applyTurn(state.branchState, state.openingState, state.hands[seat], state.stock, null);
        const y = d.applyTurn(relabeledBranch, state.openingState, state.hands[seat], state.stock, null);
        assert.deepStrictEqual(resultSig(x, p), resultSig(y, IDENTITY), 'pass transition mismatch');
        stats.passTransitionChecks++;
      } else {
        const mapped = new Map(relabeled.actions.map(a => [sym.actionSig(a), a]));
        for (const action of original.actions) {
          const counterpart = mapped.get(sym.actionSig(action, p));
          assert.ok(counterpart, 'mapped legal action missing');
          const x = d.applyTurn(state.branchState, state.openingState, state.hands[seat], state.stock, action);
          const y = d.applyTurn(relabeledBranch, state.openingState, state.hands[seat], state.stock, counterpart);
          assert.deepStrictEqual(resultSig(x, p), resultSig(y, IDENTITY), 'action transition mismatch');
          stats.actionTransitionChecks++;
          stats.byType[action.type]++;
        }

        for (const name of POLICIES) {
          const x = sym.actionDistribution(name, original, state.branchState);
          const y = sym.actionDistribution(name, relabeled, relabeledBranch);
          const mappedX = mappedDistribution(x, p);
          const mappedY = mappedDistribution(y, IDENTITY);
          stats.distributionalChecks[name]++;
          if (!sameDistribution(mappedX, mappedY)) stats.distributionalMismatches[name]++;
        }
      }
    }
  }

  const drawFixtures = drawAudit.drawFixtures();
  assert.ok(Object.values(stats.distributionalMismatches).every(value => value === 0),
    'policy tie-break distribution is not branch-label equivariant');

  return {
    schema: 'qosha-policy-generated-branch-label-audit/v1',
    engine: 'qosha-research-0.5.3 + policy-generated-branch-label-audit/v1',
    rules: 'recovered qosa-1.0.0 3x9+stock; branch labels assumed interchangeable for metamorphic checks only; physical branch reopening and block winner/tie scoring remain PROVISIONAL',
    seedStart: startSeed, seedEnd: startSeed + count - 1, seedDraws: count,
    uniqueFullAllocations: seenDeals.size, duplicateDealPairs,
    trajectoryPolicy: 'fast-doubles, min-hand-pips, closed-branch-control; all three seat rotations; action-orbit symmetric tie-break; seeded symmetric 1-1 follow-up side selector',
    trajectoryRounds: seenDeals.size * 3,
    finishRounds, blockRounds, unresolvedRounds,
    meanTurnsIncludingOpeningSetup: turnTotal / (seenDeals.size * 3),
    reachablePositions, selectedStrata: strata, selectedUniqueStates: selected.size,
    branchLabelPermutations: permutations.length,
    legalActionSetChecks: stats.actionSetChecks,
    legalActionTransitionChecks: stats.actionTransitionChecks,
    passTransitionChecks: stats.passTransitionChecks,
    actionTransitionsByType: stats.byType,
    policyDistributionChecks: stats.distributionalChecks,
    policyDistributionMismatches: stats.distributionalMismatches,
    explicitDrawFixtures: drawFixtures,
    mismatches: { legalActionSet: 0, actionTransition: 0, passTransition: 0, policyDistribution: 0, drawFixture: 0 },
    strategyComparisonRounds: 0, hiddenWorldAllocations: 0,
    confidence: 'high for internal model-level metamorphic checks in sampled policy-generated states; no physical-rule authentication',
    limitations: 'The audit is a reachable-state model check, not a strategy tournament. The symmetric trajectory/tie-break assumption is internal; physical branch locking/reopening and blocked-round scoring remain unauthenticated.',
    exactNextAction: 'Run matched sensitivity variants for alternate branch-lock/reopening and block-winner assumptions; keep strategy ranking paused until a real-table trace or explicit ruling is available.'
  };
}
function test() {
  const a = run(3414620, 8, 12, 80);
  const b = run(3414620, 8, 12, 80);
  assert.deepStrictEqual(a, b, 'seeded replay differs');
  assert.equal(a.branchLabelPermutations, 24);
  assert.equal(a.legalActionSetChecks, a.selectedUniqueStates * 24);
  assert.ok(a.legalActionTransitionChecks > 0);
  assert.ok(a.passTransitionChecks > 0);
  assert.equal(a.uniqueFullAllocations + a.duplicateDealPairs.length, 8);
  assert.ok(Object.values(a.policyDistributionMismatches).every(x => x === 0));
  return {
    passed: true, replaySeedDraws: 8, selectedStates: a.selectedUniqueStates,
    actionSetChecks: a.legalActionSetChecks, actionTransitions: a.legalActionTransitionChecks,
    passTransitions: a.passTransitionChecks, policyDistributionMismatches: a.policyDistributionMismatches
  };
}
if (require.main === module) {
  const args = process.argv.slice(2);
  const out = args[0] === 'test'
    ? test()
    : run(Number(args[0] || 3414620), Number(args[1] || 500), Number(args[2] || 60), Number(args[3] || 200));
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
}
module.exports = { run, test };
