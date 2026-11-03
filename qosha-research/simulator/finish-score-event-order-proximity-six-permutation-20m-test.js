'use strict';
const assert = require('node:assert/strict');
const { run20M } = require('./finish-score-event-order-proximity-six-permutation-20m');
const { runAudit } = require('./finish-score-event-order-proximity-six-permutation-holdout');

function test() {
  let assertions = 0;
  const eq = (actual, expected, label) => { assert.equal(actual, expected, label); assertions++; };
  const check = (condition, label) => { assert.ok(condition, label); assertions++; };
  const near = (actual, expected, epsilon, label) => { assert.ok(Math.abs(actual - expected) <= epsilon, label); assertions++; };

  const full = run20M();
  const replay = run20M();
  check(JSON.stringify(full) === JSON.stringify(replay), 'exact deterministic 1,000-outcome replay');
  eq(full.seed.start, 20000000, 'start seed');
  eq(full.seed.attemptEnd, 20001034, 'attempt end');
  eq(full.seed.attempts, 1035, 'attempt count');
  eq(full.seed.redealSignals, 35, 'redeal count');
  eq(full.seed.acceptedRounds, 1000, 'accepted rounds');
  eq(full.seed.uniqueAcceptedAllocations, 1000, 'unique allocations');
  eq(full.seed.duplicateAcceptedAllocations, 0, 'duplicate allocations');
  eq(full.roundOutcomes.finishes, 942, 'finish count');
  eq(full.roundOutcomes.blocks, 58, 'block count');
  eq(full.roundOutcomes.unresolved, 0, 'unresolved count');
  eq(full.roundOutcomes.finishMinus['0'], 908, 'zero finish-minus');
  eq(full.roundOutcomes.finishMinus['-10'], 34, 'minus ten');
  eq(full.roundOutcomes.finishMinus['-20'], 0, 'minus twenty');
  eq(full.roundOutcomes.finishMinus['-30'], 0, 'minus thirty');
  eq(full.roundOutcomes.finishMinus['-40'], 0, 'minus forty');
  eq(full.arms.length, 6, 'six seat-order arms');

  const expected = [
    ['0-1-2', 1877, 41], ['0-2-1', 1873, 45], ['1-0-2', 1882, 36],
    ['1-2-0', 1878, 40], ['2-0-1', 1869, 49], ['2-1-0', 1873, 45]
  ];
  for (let i = 0; i < full.arms.length; i++) {
    const arm = full.arms[i], row = expected[i], name = row[0], applied = row[1], pending = row[2];
    eq(arm.order, name, name + ' order');
    eq(arm.completedMatches, 76, name + ' completed matches');
    near(arm.meanMatchRounds, 13.157894736842104, 1e-12, name + ' mean match rounds');
    eq(arm.medianMatchRounds, 14, name + ' median match rounds');
    eq(arm.unfinishedTailRounds, 0, name + ' unfinished tail');
    eq(arm.appliedNonzeroEvents, applied, name + ' applied events');
    eq(arm.zeroInputsSkipped, 908, name + ' zero inputs skipped');
    eq(arm.pendingNonzeroEvents, pending, name + ' pending events');
    eq(arm.appliedNonzeroEvents + arm.zeroInputsSkipped + arm.pendingNonzeroEvents, 2826, name + ' event accounting');
    eq(arm.scoreFloorHits, 8, name + ' score floor hits');
    eq(arm.bustEvents, 76, name + ' bust events');
    eq(arm.maxScoreObserved, 124, name + ' maximum score');
  }

  const pairs = full.pairwiseBoundarySensitivity;
  eq(pairs.length, 15, '15 pairwise contrasts');
  for (const pair of pairs) {
    const label = pair.orders.join('/');
    eq(pair.commonFinishRoundIndices, 76, label + ' common boundaries');
    check(Object.values(pair.uniqueBoundaryIndices).every(n => n === 0), label + ' no unique boundaries');
    eq(Object.values(pair.stratifiedByMinimumPreRoundGap).reduce((sum, x) => sum + x.boundaries, 0), 76, label + ' strata coverage');
    for (const [bin, stratum] of Object.entries(pair.stratifiedByMinimumPreRoundGap)) {
      check(stratum.differentExploded <= stratum.boundaries, label + ' exploded bounded ' + bin);
      check(stratum.differentPlaces <= stratum.boundaries, label + ' places bounded ' + bin);
      check(stratum.differentFirstPlace <= stratum.boundaries, label + ' first-place bounded ' + bin);
    }
  }

  const totals = full.stratifiedTotalsAcross15DependentContrasts;
  eq(totals['01-10'].boundaries, 885, '1-10 denominator');
  eq(totals['11-20'].boundaries, 195, '11-20 denominator');
  eq(totals['21-40'].boundaries, 60, '21-40 denominator');
  eq(totals['41+'].boundaries, 0, '41+ denominator');
  eq(totals['no-positive-delta'].boundaries, 0, 'no-positive-delta denominator');
  eq(totals['01-10'].differentExplodedSeats, 27, '1-10 exploded changes');
  eq(totals['11-20'].differentExplodedSeats, 0, '11-20 exploded changes');
  eq(totals['21-40'].differentExplodedSeats, 0, '21-40 exploded changes');
  eq(totals['01-10'].differentSurvivorPlaces, 128, '1-10 place changes');
  eq(totals['11-20'].differentSurvivorPlaces, 26, '11-20 place changes');
  eq(totals['21-40'].differentSurvivorPlaces, 0, '21-40 place changes');
  eq(totals['01-10'].differentFirstPlaces, 107, '1-10 first-place changes');
  eq(totals['11-20'].differentFirstPlaces, 26, '11-20 first-place changes');
  eq(totals['21-40'].differentFirstPlaces, 0, '21-40 first-place changes');

  const smokeA = runAudit({ startSeed: 20002000, acceptedRounds: 40 });
  const smokeB = runAudit({ startSeed: 20002000, acceptedRounds: 40 });
  check(JSON.stringify(smokeA) === JSON.stringify(smokeB), 'exact 40-round smoke replay');
  eq(smokeA.seed.acceptedRounds, 40, 'smoke accepted rounds');
  eq(smokeA.roundOutcomes.finishes + smokeA.roundOutcomes.blocks, 40, 'smoke resolved rounds');
  eq(smokeA.roundOutcomes.unresolved, 0, 'smoke unresolved rounds');

  return { passed: true, assertions, acceptedRounds: 1000, permutations: 6, pairwiseContrasts: 15, smokeRounds: 40 };
}
if (require.main === module) process.stdout.write(JSON.stringify(test(), null, 2) + '\n');
module.exports = { test };
