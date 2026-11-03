'use strict';
const { runAudit } = require('./finish-score-event-order-six-permutation-holdout');
function test() {
  let assertions = 0;
  const check = (condition, message) => { if (!condition) throw new Error(message); assertions++; };
  const equal = (actual, expected, message) => check(actual === expected, message + ': expected ' + expected + ', got ' + actual);
  const near = (actual, expected, epsilon, message) => check(Math.abs(actual - expected) <= epsilon, message + ': expected ' + expected + ', got ' + actual);
  const full = runAudit({ startSeed: 18000000, acceptedRounds: 1000 });
  const replay = runAudit({ startSeed: 18000000, acceptedRounds: 1000 });
  check(JSON.stringify(full) === JSON.stringify(replay), 'full 1,000-round exact deterministic replay');
  equal(full.seed.attempts, 1038, 'attempt count'); equal(full.seed.redealSignals, 38, 'redeal count');
  equal(full.seed.acceptedRounds, 1000, 'accepted rounds'); equal(full.seed.uniqueAcceptedAllocations, 1000, 'unique allocations');
  equal(full.seed.duplicateAcceptedAllocations, 0, 'duplicate allocations');
  equal(full.roundOutcomes.finishes, 952, 'finish count'); equal(full.roundOutcomes.blocks, 48, 'block count');
  equal(full.roundOutcomes.unresolved, 0, 'unresolved count');
  equal(full.roundOutcomes.finishMinus['0'], 915, 'zero finish-minus'); equal(full.roundOutcomes.finishMinus['-10'], 36, 'minus ten');
  equal(full.roundOutcomes.finishMinus['-20'], 1, 'minus twenty'); equal(full.roundOutcomes.finishMinus['-30'], 0, 'minus thirty');
  equal(full.roundOutcomes.finishMinus['-40'], 0, 'minus forty');
  const expected = [
    ['0-1-2',1905,36,[25,21,26]],['0-2-1',1904,37,[25,20,27]],['1-0-2',1903,38,[22,24,26]],
    ['1-2-0',1897,44,[19,24,29]],['2-0-1',1898,43,[22,20,30]],['2-1-0',1896,45,[19,23,30]]
  ];
  equal(full.arms.length, 6, 'six arms');
  for (let i = 0; i < expected.length; i++) {
    const [name, applied, pending, exploded] = expected[i], arm = full.arms[i];
    equal(arm.order, name, name + ' order'); equal(arm.completedMatches, 72, name + ' matches');
    near(arm.meanMatchRounds, 13.777777777777779, 1e-12, name + ' mean rounds');
    equal(arm.medianMatchRounds, 14, name + ' median rounds'); equal(arm.unfinishedTailRounds, 8, name + ' tail');
    equal(arm.appliedNonzeroEvents, applied, name + ' applied'); equal(arm.zeroInputsSkipped, 915, name + ' zero skipped');
    equal(arm.pendingNonzeroEvents, pending, name + ' pending'); equal(arm.scoreFloorHits, 10, name + ' floor hits');
    equal(arm.bustEvents, 72, name + ' busts'); equal(arm.maxScoreObserved, 122, name + ' max score');
    for (let seat = 0; seat < 3; seat++) equal(arm.explodedSeatCounts[seat], exploded[seat], name + ' exploded seat ' + seat);
  }
  const expectedPairs = [
    [1,5,4],[3,6,6],[6,16,13],[4,16,12],[7,21,17],[4,11,10],[7,21,17],[3,11,8],
    [6,16,13],[3,10,7],[7,20,16],[4,15,11],[4,10,9],[1,5,4],[3,5,5]
  ];
  equal(full.pairwiseBoundarySensitivity.length, 15, '15 pairwise contrasts');
  for (let i = 0; i < expectedPairs.length; i++) {
    const p = full.pairwiseBoundarySensitivity[i], [exploded, places, first] = expectedPairs[i];
    equal(p.commonFinishRoundIndices, 72, 'pair ' + i + ' common boundaries');
    equal(p.uniqueBoundaryIndices[p.orders[0]], 0, 'pair ' + i + ' left unique');
    equal(p.uniqueBoundaryIndices[p.orders[1]], 0, 'pair ' + i + ' right unique');
    equal(p.sameBoundaryDifferentExplodedSeat, exploded, 'pair ' + i + ' exploded changes');
    equal(p.sameBoundaryDifferentSurvivorPlaces, places, 'pair ' + i + ' place changes');
    equal(p.sameBoundaryDifferentFirstPlace, first, 'pair ' + i + ' first-place changes');
  }
  const smallA = runAudit({ startSeed: 18002000, acceptedRounds: 40 });
  const smallB = runAudit({ startSeed: 18002000, acceptedRounds: 40 });
  check(JSON.stringify(smallA) === JSON.stringify(smallB), '40-round exact replay');
  equal(smallA.roundOutcomes.finishes + smallA.roundOutcomes.blocks, 40, '40-round resolution');
  equal(smallA.roundOutcomes.unresolved, 0, '40-round unresolved');
  return { passed: true, assertions, fullRun: 1000, permutations: 6, pairwiseContrasts: 15, deterministicSmoke: 40 };
}
if (require.main === module) process.stdout.write(JSON.stringify(test(), null, 2) + '\\n');
module.exports = { test };
