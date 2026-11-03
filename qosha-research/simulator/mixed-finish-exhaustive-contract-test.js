'use strict';
// Exhaustive coded-model fixtures for mixed finish after an ordinary prefix.
// This is an implementation regression test, not physical-rule authentication.
const assert = require('node:assert/strict');
const e = require('./engine');
const d = require('./turn-dispatcher');

function fixture(doubleCount) {
  const branchState = {
    center: [6, 6],
    branches: {
      up: { active: true, end: 5 },
      left: { active: true, end: 1 },
      right: { active: true, end: 2 },
      down: { active: true, end: 3 }
    }
  };
  const openingState = e.createOpeningState([5]);
  const available = [6, 1, 2, 3].slice(0, doubleCount).map(n => [n, n]);
  return { branchState, openingState, hand: [[5, 6], ...available] };
}

function sortedKeys(tiles) { return tiles.map(e.tileKey).sort(); }

function test() {
  let assertions = 0;
  const check = (condition, message) => { assertions++; assert.ok(condition, message); };
  let legalMixedSequences = 0;

  for (let n = 1; n <= 4; n++) {
    const f = fixture(n);
    const opts = d.turnOptions(f.branchState, f.openingState, f.hand, []);
    const mixed = opts.actions.filter(a => a.type === 'mixed-finish');
    const expectedSequences = [1, 1, 2, 6, 24][n];
    check(mixed.length === expectedSequences,
      `${n} closing doubles: expected ${expectedSequences} orderings, got ${mixed.length}`);
    check(mixed.every(a => a.finishDoubles.length === n && a.tiles.length === n + 1),
      `${n} closing doubles: every mixed action must cover the entire hand`);

    const seen = new Set();
    for (const action of mixed) {
      const sequenceKey = action.numbers.join(',');
      check(!seen.has(sequenceKey), `${n} closing doubles: duplicate sequence ${sequenceKey}`);
      seen.add(sequenceKey);
      const transition = d.applyTurn(f.branchState, f.openingState, f.hand, [], action);
      check(transition.hand.length === 0, `${n} closing doubles: hand emptied`);
      check(sortedKeys(transition.playedTiles).join('|') === sortedKeys(f.hand).join('|'),
        `${n} closing doubles: all hand tiles played exactly once`);
      check(transition.finishDoubles.length === n && e.finishMinus(transition.finishDoubles) === -10 * n,
        `${n} closing doubles: minus marker count`);
      check(transition.branchState.branches.up.end === 6,
        `${n} closing doubles: ordinary prefix updates up end before finish sequence`);
      check(['left', 'right', 'down'].every((side, i) =>
        transition.branchState.branches[side].end === [1, 2, 3][i]),
        `${n} closing doubles: double sequence preserves branch geometry`);
      const expectedOpened = [5, ...[6, 1, 2, 3].slice(0, n)].sort((a, b) => a - b).join(',');
      check([...transition.openingState.openedNumbers].sort((a, b) => a - b).join(',') === expectedOpened,
        `${n} closing doubles: exact opened-number set`);
      const outcome = d.roundOutcome({
        hands: [transition.hand, [[0, 0]], [[4, 5]]], stock: [],
        consecutivePasses: 0, lastPlayerIndex: 0, lastTurnResult: transition, players: 3
      });
      check(outcome.kind === 'finish' && outcome.playerIndex === 0 && outcome.minus === -10 * n,
        `${n} closing doubles: finish outcome classification`);
      legalMixedSequences++;
    }
    check(seen.size === expectedSequences, `${n} closing doubles: all sequence permutations covered`);
  }

  const noPrefixOpen = fixture(4);
  noPrefixOpen.openingState = e.createOpeningState([]);
  check(d.mixedFinishActions(noPrefixOpen.branchState, noPrefixOpen.openingState, noPrefixOpen.hand).length === 0,
    'closed prefix source must suppress mixed finish');

  const locked = fixture(4);
  locked.branchState.branches.down.active = false;
  check(d.mixedFinishActions(locked.branchState, locked.openingState, locked.hand).length === 0,
    'missing fourth active end must suppress four-double mixed finish');

  const alreadyOpen = fixture(4);
  alreadyOpen.openingState = e.createOpeningState([5, 1]);
  check(d.mixedFinishActions(alreadyOpen.branchState, alreadyOpen.openingState, alreadyOpen.hand).length === 0,
    'already-open double number must suppress full mixed finish');

  let scoreDeltaCases = 0;
  for (let score = 0; score <= 101; score++) {
    for (let n = 1; n <= 4; n++) {
      const delta = -10 * n;
      check(e.applyScoreDelta(score, delta) === Math.max(0, score + delta),
        `score floor at score=${score}, finish=-${10 * n}`);
      check(e.applyScoreDelta(score, delta) >= 0,
        `nonnegative score at score=${score}, finish=-${10 * n}`);
      scoreDeltaCases++;
    }
  }

  return {
    passed: true,
    assertions,
    mixedFinishPermutations: legalMixedSequences,
    doubleCounts: [1, 2, 3, 4],
    scoreFloorPairs: scoreDeltaCases,
    negativeFixtures: 3,
    scope: 'qosa-1.0.0 coded-model implementation contract only; physical branch and scoring semantics remain unauthenticated'
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(test(), null, 2) + '\n');
module.exports = { test };
