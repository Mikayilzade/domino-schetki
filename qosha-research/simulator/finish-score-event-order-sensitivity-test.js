'use strict';
const { runAudit } = require('./finish-score-event-order-sensitivity');

function test() {
  let assertions = 0;
  const check = (condition, message) => { if (!condition) throw new Error(message); assertions++; };
  const equal = (actual, expected, message) => check(actual === expected, message + ': expected ' + expected + ', got ' + actual);

  const full = runAudit({ startSeed: 17000000, acceptedRounds: 1000 });
  equal(full.seed.attempts, 1029, 'attempt count');
  equal(full.seed.redealSignals, 29, 'redeal count');
  equal(full.seed.acceptedRounds, 1000, 'accepted rounds');
  equal(full.seed.uniqueAcceptedAllocations, 1000, 'unique accepted allocations');
  equal(full.roundOutcomes.finishes, 955, 'finish count');
  equal(full.roundOutcomes.blocks, 45, 'block count');
  equal(full.roundOutcomes.unresolved, 0, 'unresolved count');

  const baseline = full.arms[0];
  equal(baseline.completedMatches, 75, 'baseline completed matches');
  equal(baseline.appliedNonzeroEvents, 1902, 'baseline applied nonzero events');
  equal(baseline.zeroInputsSkipped, 913, 'baseline skipped zero inputs');
  equal(baseline.pendingNonzeroEvents, 50, 'baseline pending nonzero events');
  equal(baseline.scoreFloorHits, 9, 'baseline score-floor hits');
  equal(baseline.bustEvents, 75, 'baseline bust events');
  equal(baseline.maxScoreObserved, 137, 'baseline maximum score');

  for (const arm of full.arms) {
    equal(arm.completedMatches, 75, arm.order + ' completed matches');
    equal(arm.unfinishedTailRounds, 3, arm.order + ' tail rounds');
    equal(arm.medianMatchRounds, 14, arm.order + ' median match length');
  }
  const expectedSeatChanges = [7, 10, 5];
  for (let i = 0; i < full.pairwiseBoundarySensitivity.length; i++) {
    const pair = full.pairwiseBoundarySensitivity[i];
    equal(pair.commonFinishRoundIndices, 75, pair.orders.join('/') + ' common boundaries');
    equal(pair.uniqueBoundaryIndices[pair.orders[0]], 0, pair.orders.join('/') + ' left unique boundaries');
    equal(pair.uniqueBoundaryIndices[pair.orders[1]], 0, pair.orders.join('/') + ' right unique boundaries');
    equal(pair.sameBoundaryDifferentExplodedSeat, expectedSeatChanges[i], pair.orders.join('/') + ' exploded-seat changes');
  }

  const smallA = runAudit({ startSeed: 17002000, acceptedRounds: 40 });
  const smallB = runAudit({ startSeed: 17002000, acceptedRounds: 40 });
  check(JSON.stringify(smallA) === JSON.stringify(smallB), '40-round exact deterministic replay');
  equal(smallA.roundOutcomes.finishes + smallA.roundOutcomes.blocks, 40, '40-round resolution');
  return { passed: true, assertions, fullRun: 1000, deterministicSmoke: 40 };
}
if (require.main === module) process.stdout.write(JSON.stringify(test(), null, 2) + '\n');
module.exports = { test };
