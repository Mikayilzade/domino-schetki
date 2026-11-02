'use strict';
const assert = require('node:assert/strict');
const { summarizeStates } = require('./pass-history-cohort-strata-audit');

function state(focalPlayer, handSizes, jointWorlds, passCount, commonActions, gap, remainder, globalRegret, currentRegret) {
  return {
    focalPlayer, handSizes, jointWorlds, passCount, rootActions: { common: commonActions },
    modelDeltaByProfile: { 'closed-branch-control': { firstFinishChance: gap, meanRemainder: remainder } },
    regretByProfile: { 'closed-branch-control': {
      global: { averageCandidateRegret: { firstFinishChance: globalRegret, meanRemainder: 1.1 } },
      currentOnly: { averageCandidateRegret: { firstFinishChance: currentRegret, meanRemainder: 1.7 } }
    } }
  };
}

const result = summarizeStates([
  state(0, [3, 3, 3], 4, 1, 2, 0.4, -5, 0.1, 0.05),
  state(1, [2, 2, 3], 3, 2, 3, 0.2, -4, 0.08, 0.04),
  state(2, [2, 3, 3], 2, 3, 5, 0.0, -3, 0.06, 0.02)
]);

assert.equal(result.stateCount, 3);
assert.equal(result.byOpponentHandSizes['3-3'].n, 1);
assert.equal(result.byOpponentHandSizes['2-3'].n, 2);
assert.equal(result.byCommonActionCount['2'].n, 1);
assert.equal(result.byCommonActionCount['3-4'].n, 1);
assert.equal(result.byCommonActionCount['5+'].n, 1);
assert.equal(result.byPassCount['1'].n, 1);
assert.equal(result.byPassCount['2'].n, 1);
assert.equal(result.byPassCount['3+'].n, 1);
assert.ok(Math.abs(result.contrast3v3Minus2v3.differencePp - 30) < 1e-12);
console.log(JSON.stringify({ passed: true, assertions: 10 }, null, 2));
