'use strict';
// Four-branch label symmetry audit for late-return policy tie-breaks.
// Run: node qosha-research/simulator/side-label-invariance-audit.js [start=3402312] [count=2048]
// or:  node qosha-research/simulator/side-label-invariance-audit.js test
// Structural/metamorphic audit only; not physical-rule authentication.
const assert = globalThis.__qoshaAssert;
const MODELS = ['global-ever-open', 'all-current-only'];
const STYLES = ['low', 'high', 'double-first', 'double-last'];
const STOPS = ['single', 'greedy'];
const IDENTITY = [0, 1, 2, 3];
const TRACE = [
  [1, [0, 1], 0], [2, null, null], [0, [1, 3], 2],
  [1, [0, 0], null], [2, [0, 5], 0], [0, [1, 4], 1],
  [1, [1, 2], 3], [2, [3, 3], null], [0, [2, 2], null]
];
const USED = ['1-1', '0-1', '1-3', '0-0', '0-5', '1-4', '1-2', '3-3', '2-2', '2-3'];
const DECK = [];
for (let a = 0; a <= 6; a++) for (let b = a; b <= 6; b++) DECK.push([a, b]);
const key = t => [...t].sort((a, b) => a - b).join('-');

function mixSeed32(seed) {
  let z = (seed >>> 0) + 0x9e3779b9;
  z = Math.imul(z ^ (z >>> 16), 0x21f0aaad);
  z = Math.imul(z ^ (z >>> 15), 0x735a2d97);
  return (z ^ (z >>> 15)) >>> 0;
}
function rng(seed) {
  let s = mixSeed32(seed) || 0x9e3779b9;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 0x100000000;
  };
}
function shuffle(items, random) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
const FREE = DECK.filter(t => !USED.includes(key(t)));
function sample(seed) {
  const random = rng(seed);
  const eligible = FREE.filter(t => !t.includes(1));
  assert.equal(eligible.length, 16);
  const seat2 = shuffle(eligible, random).slice(0, 7);
  const used = new Set(seat2.map(key));
  const rest = shuffle(FREE.filter(t => !used.has(key(t))), random);
  const hands = [rest.slice(0, 6), [[2, 3], ...rest.slice(6)], seat2];
  assert.deepEqual(hands.map(h => h.length), [6, 6, 7]);
  return hands;
}
function actions(state, player) {
  const out = [];
  for (const tile of state.hands[player]) {
    const [a, b] = tile;
    if (a === b) {
      if (!state.opened.has(a) && state.ends.includes(a)) out.push({ tile, side: null, to: a });
    } else {
      for (let side = 0; side < 4; side++) {
        if (state.unlocked[side] && (state.ends[side] === a || state.ends[side] === b)) {
          out.push({ tile, side, to: state.ends[side] === a ? b : a });
        }
      }
    }
  }
  return out;
}
function applyOne(state, player, action) {
  assert(action && actions(state, player).some(x => key(x.tile) === key(action.tile) && x.side === action.side),
    'illegal action');
  const index = state.hands[player].findIndex(t => key(t) === key(action.tile));
  assert(index >= 0);
  state.hands[player].splice(index, 1);
  state.played.push(key(action.tile));
  if (action.side === null) {
    const number = action.tile[0];
    state.opened.add(number);
    for (let side = 0; side < 4; side++) if (state.ends[side] === number) state.unlocked[side] = true;
  } else {
    state.ends[action.side] = action.to;
    state.unlocked[action.side] = state.model === 'global-ever-open' && state.opened.has(action.to);
  }
  state.turn = (player + 1) % 3;
}
function replay(model, hands, permutation) {
  const initial = [
    [[1, 3], [1, 4], [2, 2], ...hands[0]],
    [[1, 1], [0, 1], [0, 0], [1, 2], ...hands[1].filter(t => key(t) !== '2-3')],
    [[0, 5], [3, 3], ...hands[2]]
  ];
  assert.deepEqual(initial.map(h => h.length), [9, 9, 9]);
  const state = {
    model, hands: initial.map(h => h.map(t => t.slice())),
    ends: [1, 1, 1, 1], unlocked: [true, true, true, true],
    opened: new Set([1]), played: ['1-1'], turn: 1, stock: []
  };
  state.hands[1].splice(state.hands[1].findIndex(t => key(t) === '1-1'), 1);
  state.hands[1].push([2, 3]); // known opening draw from the one-tile stock
  for (const [seat, tile, side] of TRACE.map(([p, t, s]) => [p, t, s === null ? null : permutation[s]])) {
    assert.equal(state.turn, seat, 'clockwise trace');
    if (tile === null) {
      assert.equal(actions(state, seat).length, 0, 'prefix pass must be forced');
      state.turn = (seat + 1) % 3;
    } else {
      const action = actions(state, seat).find(a => key(a.tile) === key(tile) && a.side === side);
      assert(action, 'chronological move legal');
      applyOne(state, seat, action);
    }
  }
  assert.equal(state.played.length + state.hands.flat().length, 28, '28-tile conservation');
  assert.equal(new Set([...state.played, ...state.hands.flat().map(key)]).size, 28, 'unique tiles');
  return state;
}
function clone(state) {
  return {
    ...state, hands: state.hands.map(h => h.map(t => t.slice())),
    ends: state.ends.slice(), unlocked: state.unlocked.slice(),
    opened: new Set(state.opened), played: state.played.slice()
  };
}
const actionId = a => key(a.tile) + '@' + (a.side === null ? 'D' : a.side);
function sideTie(side, permutation, mode) {
  if (side === null) return -1;
  return mode === 'numeric' ? side : permutation.indexOf(side);
}
function policy(available, style, permutation, mode) {
  return available.slice().sort((a, b) => {
    const da = a.tile[0] === a.tile[1], db = b.tile[0] === b.tile[1];
    const doubleBias = style === 'double-first' ? Number(db) - Number(da)
      : style === 'double-last' ? Number(da) - Number(db) : 0;
    const pipBias = style === 'high' ? (b.tile[0] + b.tile[1]) - (a.tile[0] + a.tile[1])
      : (a.tile[0] + a.tile[1]) - (b.tile[0] + b.tile[1]);
    return doubleBias || pipBias || key(a.tile).localeCompare(key(b.tile))
      || sideTie(a.side, permutation, mode) - sideTie(b.side, permutation, mode);
  })[0] || null;
}
function advance(hands, style, permutation, mode) {
  const states = MODELS.map(model => replay(model, hands, permutation));
  for (const seat of [1, 2, 0]) {
    const a = actions(states[0], seat), b = actions(states[1], seat);
    const bIds = new Set(b.map(actionId));
    const common = a.filter(x => bIds.has(actionId(x)));
    if (!common.length && (a.length || b.length)) return { accepted: false };
    const choice = policy(common, style, permutation, mode);
    for (const state of states) {
      if (choice) {
        const actual = actions(state, seat).find(x => actionId(x) === actionId(choice));
        assert(actual, 'selected common action legal in both models');
        applyOne(state, seat, actual);
      } else {
        assert.equal(actions(state, seat).length, 0, 'no voluntary pass');
        state.turn = (seat + 1) % 3;
      }
    }
  }
  assert.deepEqual(states[0].hands.map(h => h.map(key).sort()), states[1].hands.map(h => h.map(key).sort()));
  return { accepted: true, states };
}
function commonCandidates(low, high) {
  const sets = [actions(low.states[0], 1), actions(low.states[1], 1),
    actions(high.states[0], 1), actions(high.states[1], 1)]
    .map(xs => new Set(xs.filter(a => a.side !== null).map(actionId)));
  return actions(low.states[0], 1).filter((a, i, xs) => a.side !== null
    && sets.every(s => s.has(actionId(a))) && xs.findIndex(b => actionId(b) === actionId(a)) === i);
}
function evaluate(state, candidate, style, stop, permutation, mode) {
  const next = clone(state);
  const action = actions(next, 1).find(a => actionId(a) === actionId(candidate));
  assert(action, 'candidate legal');
  applyOne(next, 1, action);
  for (const seat of [2, 0]) {
    const first = policy(actions(next, seat), style, permutation, mode);
    let n = 0;
    if (first) {
      applyOne(next, seat, first); n++;
      if (stop === 'greedy' && first.side === null) {
        for (;;) {
          const doubles = actions(next, seat).filter(a => a.side === null);
          if (!doubles.length) break;
          applyOne(next, seat, policy(doubles, style, permutation, mode));
          n++;
          assert(n <= 4, 'maximum four doubles');
        }
      }
    } else next.turn = (seat + 1) % 3;
    assert(next.hands[seat].length > 0, 'no early finish in short horizon');
  }
  return new Set(actions(next, 1).map(a => key(a.tile))).size === 0;
}
function robustSafe(extension, candidate, permutation, mode) {
  let passes = 0;
  for (let model = 0; model < 2; model++)
    for (const style of STYLES)
      for (const stop of STOPS)
        passes += Number(evaluate(extension.states[model], candidate, style, stop, permutation, mode));
  return passes === 0;
}
function normalizedCandidate(candidate, permutation) {
  return key(candidate.tile) + '@' + (candidate.side === null ? 'D' : permutation.indexOf(candidate.side));
}
function signature(result) {
  return JSON.stringify([result.low, result.high, result.both, result.neither,
    Object.entries(result.map).sort(([a], [b]) => a.localeCompare(b))]);
}
function one(hands, permutation, mode) {
  const low = advance(hands, 'low', permutation, mode);
  const high = advance(hands, 'high', permutation, mode);
  if (!low.accepted || !high.accepted) return { eligible: false, reason: 'extension' };
  const candidates = commonCandidates(low, high);
  if (candidates.length < 2) return { eligible: false, reason: 'candidate-count' };
  const out = { eligible: true, candidates: candidates.length, low: 0, high: 0, both: 0, neither: 0, map: {} };
  for (const candidate of candidates) {
    const a = robustSafe(low, candidate, permutation, mode);
    const b = robustSafe(high, candidate, permutation, mode);
    const classification = a && b ? 'both' : a ? 'low' : b ? 'high' : 'neither';
    out[classification]++;
    out.map[normalizedCandidate(candidate, permutation)] = classification;
  }
  return out;
}
function permutations(a = [0, 1, 2, 3], i = 0, out = []) {
  if (i === a.length) { out.push(a.slice()); return out; }
  for (let j = i; j < a.length; j++) {
    [a[i], a[j]] = [a[j], a[i]];
    permutations(a, i + 1, out);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return out;
}
function run(start = 3402312, count = 2048) {
  assert(Number.isSafeInteger(start) && start >= 0 && Number.isInteger(count) && count > 1 && count <= 4096);
  const perms = permutations(), unique = new Map(), duplicateAllocationPairs = [], split = Math.floor(count / 2);
  const cohorts = [
    { name: 'development', seedStart: start, seedCount: split, uniqueAllocations: 0, duplicateAllocations: 0, eligibleWorlds: 0,
      candidateComparisons: 0, safetyFlips: 0, numericPermutationIneligible: 0,
      numericEligibilityChangesVsIdentity: 0, numericClassificationMismatchesAmongBothEligible: 0 },
    { name: 'holdout', seedStart: start + split, seedCount: count - split, uniqueAllocations: 0, duplicateAllocations: 0, eligibleWorlds: 0,
      candidateComparisons: 0, safetyFlips: 0, numericPermutationIneligible: 0,
      numericEligibilityChangesVsIdentity: 0, numericClassificationMismatchesAmongBothEligible: 0 }
  ];
  let eligibleWorlds = 0, candidateComparisons = 0, safetyFlips = 0;
  let canonicalPermutationMismatches = 0, numericBaselineIneligibleWorlds = 0;
  let numericPermutationIneligible = 0, numericEligibilityChangesVsIdentity = 0;
  let numericBothEligibleComparisons = 0, numericClassificationMismatchesAmongBothEligible = 0;
  let worldsWithAnyNumericChange = 0, worldsWithNumericEligibilityChange = 0, worldsWithNumericClassificationChange = 0, worldsWithBothChangeTypes = 0;
  for (let i = 0; i < count; i++) {
    const seed = start + i, hands = sample(seed);
    const cohort = seed < start + split ? cohorts[0] : cohorts[1];
    const allocationKey = hands.map(h => h.map(key).sort().join(',')).join('|');
    if (unique.has(allocationKey)) { duplicateAllocationPairs.push({ seed, duplicateOfSeed: unique.get(allocationKey) }); cohort.duplicateAllocations++; continue; }
    unique.set(allocationKey, seed); cohort.uniqueAllocations++;
    if (i < 16) assert.deepEqual(sample(seed), hands, 'same-seed hidden allocation replay');
    const canonicalBase = one(hands, IDENTITY, 'canonical');
    const numericBase = one(hands, IDENTITY, 'numeric');
    if (!canonicalBase.eligible) continue;
    eligibleWorlds++;
    candidateComparisons += canonicalBase.candidates;
    safetyFlips += canonicalBase.low + canonicalBase.high;
    cohort.eligibleWorlds++;
    cohort.candidateComparisons += canonicalBase.candidates;
    cohort.safetyFlips += canonicalBase.low + canonicalBase.high;
    if (!numericBase.eligible) numericBaselineIneligibleWorlds++;
    let worldNumericChanged = false, worldEligibilityChanged = false, worldClassificationChanged = false;
    for (const permutation of perms) {
      const canonical = one(hands, permutation, 'canonical');
      if (!canonical.eligible || signature(canonical) !== signature(canonicalBase))
        canonicalPermutationMismatches++;
      const numeric = one(hands, permutation, 'numeric');
      if (!numeric.eligible) {
        numericPermutationIneligible++;
        cohort.numericPermutationIneligible++;
        if (numericBase.eligible) {
          numericEligibilityChangesVsIdentity++;
          cohort.numericEligibilityChangesVsIdentity++;
          worldNumericChanged = true; worldEligibilityChanged = true;
        }
        continue;
      }
      if (!numericBase.eligible) {
        numericEligibilityChangesVsIdentity++;
        cohort.numericEligibilityChangesVsIdentity++;
        worldNumericChanged = true; worldEligibilityChanged = true;
        continue;
      }
      numericBothEligibleComparisons++;
      if (signature(numeric) !== signature(numericBase)) {
        numericClassificationMismatchesAmongBothEligible++;
        cohort.numericClassificationMismatchesAmongBothEligible++;
        worldNumericChanged = true; worldClassificationChanged = true;
      }
    }
    if (worldNumericChanged) worldsWithAnyNumericChange++;
    if (worldEligibilityChanged) worldsWithNumericEligibilityChange++;
    if (worldClassificationChanged) worldsWithNumericClassificationChange++;
    if (worldEligibilityChanged && worldClassificationChanged) worldsWithBothChangeTypes++;
  }
  assert.equal(unique.size + duplicateAllocationPairs.length, count, 'every seed accounted as unique or duplicate');
  assert.equal(canonicalPermutationMismatches, 0, 'canonical tie-break must be side-label invariant');
  const permutationComparisons = eligibleWorlds * perms.length;
  return {
    schema: 'qosha-side-label-invariance-audit/v2',
    engine: 'qosa-research-0.5.3 + side-label-invariance-audit/v2',
    rules: 'recovered qosa-1.0.0 3x9; both branch models PROVISIONAL; four branch labels treated as symmetric',
    seedStart: start, seedEnd: start + count - 1,
    seededConditionalAllocations: count, uniqueAllocations: unique.size, duplicateAllocationPairs,
    branchLabelPermutations: perms.length,
    eligibleWorlds, candidateComparisons, safetyFlips,
    safetyFlipRate: candidateComparisons ? safetyFlips / candidateComparisons : null,
    canonicalPermutationMismatches,
    numericBaselineIneligibleWorlds,
    numericPermutationComparisons: permutationComparisons,
    numericPermutationIneligible,
    numericEligibilityChangesVsIdentity,
    numericBothEligibleComparisons,
    numericClassificationMismatchesAmongBothEligible,
    numericClassificationMismatchRate: numericBothEligibleComparisons
      ? numericClassificationMismatchesAmongBothEligible / numericBothEligibleComparisons : null,
    worldsWithAnyNumericChange, worldsWithNumericEligibilityChange, worldsWithNumericClassificationChange, worldsWithBothChangeTypes,
    cohorts,
    newOpeningDeals: 0, newCompleteRounds: 0, newFullGameContinuations: 0,
    nextSeed: start + count,
    limitations: 'One fixed synthetic reachable prefix; selected common ordinary candidates and conditional hidden allocations; candidate rows correlated; no human action likelihood. Branch reopening and blocked ties remain provisional. Structural policy tie-break audit only, not a win/minus/block/regret experiment.'
  };
}
function test() {
  const result = run(3402312, 64);
  assert.equal(result.canonicalPermutationMismatches, 0);
  assert.equal(result.seededConditionalAllocations, 64);
  assert.equal(result.uniqueAllocations + result.duplicateAllocationPairs.length, result.seededConditionalAllocations);
  const signature = hands => hands.map(h => h.map(key).sort().join(',')).join('|');
  assert.equal(signature(sample(3400549)), signature(sample(3401407)), 'known duplicate allocation regression');
  assert.equal(signature(sample(3400594)), signature(sample(3401867)), 'known duplicate allocation regression');
  return { passed: true, allocations: result.seededConditionalAllocations, unique: result.uniqueAllocations,
    duplicateAccounting: true, permutations: result.branchLabelPermutations, eligible: result.eligibleWorlds };
}
if (require.main === module) {
  const args = process.argv.slice(2);
  console.log(JSON.stringify(args[0] === 'test'
    ? test() : run(Number(args[0] || 3402312), Number(args[1] || 2048)), null, 2));
}
module.exports = { run, test, one };
