'use strict';
// Edge fixtures for mixed finish after an ordinary prefix and blocked rounds.
// These test the coded qosa-1.0.0 model; they do not authenticate table rules.
const assert = require('node:assert/strict');
const e = require('./engine');
const d = require('./turn-dispatcher');

function test() {
  let assertions = 0;
  const check = (value, message) => { assertions++; assert.ok(value, message); };

  // The ordinary 5-6 extends the up branch from 5 to 6. Only then can 6-6
  // open 6; 2-2 can subsequently open the left branch's 2.
  const branchState = {
    center: [1, 1],
    branches: {
      up: { active: true, end: 5 },
      left: { active: true, end: 2 },
      right: { active: true, end: 3 },
      down: { active: true, end: 4 }
    }
  };
  const openingState = e.createOpeningState([1, 5]);
  const hand = [[5, 6], [6, 6], [2, 2]];
  const options = d.turnOptions(branchState, openingState, hand, []);
  const mixed = options.actions.filter(a => a.type === 'mixed-finish' && a.handIndex === 0);
  check(mixed.length > 0, 'ordinary prefix must expose the finish-double sequence');
  const transition = d.applyTurn(branchState, openingState, hand, [], mixed[0]);
  check(transition.hand.length === 0, 'mixed finish must empty the hand');
  check(transition.branchState.branches.up.end === 6, 'ordinary prefix must update branch geometry');
  check(transition.openingState.openedNumbers.has(6) && transition.openingState.openedNumbers.has(2),
    'finish doubles must open both numbers');
  check(transition.finishDoubles.length === 2, 'mixed finish must record two finish doubles');
  const finish = d.roundOutcome({
    hands: [transition.hand, [[0, 0]], [[3, 4]]], stock: [],
    consecutivePasses: 0, lastPlayerIndex: 0, lastTurnResult: transition, players: 3
  });
  check(finish.kind === 'finish' && finish.minus === -20, 'mixed finish must score -20');

  // A zero-pip hand is not itself a finish. Three passes with empty stock
  // produce a block, without inventing a winner or minus score.
  const blockHands = [[[0, 0]], [[0, 1]], [[2, 2]]];
  const block = d.roundOutcome({
    hands: blockHands, stock: [], consecutivePasses: 3,
    lastPlayerIndex: 2, lastTurnResult: { passed: true }, players: 3
  });
  check(block.kind === 'block' && block.playerIndex === null && block.minus === 0,
    'block must not assign a winner or minus');
  check(JSON.stringify(block.remainders) === '[0,1,4]', 'block must preserve per-seat pip remainders');
  check(d.roundOutcome({
    hands: blockHands, stock: [[6, 6]], consecutivePasses: 3,
    lastPlayerIndex: 2, lastTurnResult: { passed: true }, players: 3
  }) === null, 'nonempty stock must prevent block');

  // Four distinct double openings remain the configured -40 finish case.
  const fourBranchState = {
    center: [6, 6],
    branches: {
      up: { active: true, end: 0 },
      left: { active: true, end: 1 },
      right: { active: true, end: 2 },
      down: { active: true, end: 3 }
    }
  };
  const fourHand = [[0, 0], [1, 1], [2, 2], [3, 3]];
  const fourOptions = d.turnOptions(fourBranchState, e.createOpeningState([]), fourHand, []);
  const four = fourOptions.actions.find(a => a.type === 'double-sequence' && a.tiles.length === 4);
  check(!!four, 'four-double finish sequence must be legal in the fixture');
  const fourTransition = d.applyTurn(fourBranchState, e.createOpeningState([]), fourHand, [], four);
  const fourFinish = d.roundOutcome({
    hands: [fourTransition.hand, [[6, 6]], [[5, 6]]], stock: [],
    consecutivePasses: 0, lastPlayerIndex: 0, lastTurnResult: fourTransition, players: 3
  });
  check(fourFinish.kind === 'finish' && fourFinish.minus === -40, 'four-double finish must score -40');

  return {
    passed: true, assertions,
    fixtures: ['mixed-prefix-exposes-finish-doubles', 'block-no-winner-or-minus',
      'block-stock-gate', 'four-double-minus-40'],
    limitation: 'Coded-model fixtures only; physical branch and block rules remain unauthenticated.'
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(test(), null, 2) + '\n');
module.exports = { test };
