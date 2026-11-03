'use strict';

const { runAudit } = require('./finish-score-event-order-proximity-six-permutation-holdout');

function test() {
  let assertions = 0;
  const check = (condition, message) => {
    if (!condition) throw new Error(message);
    assertions++;
  };
  const equal = (actual, expected, message) =>
    check(actual === expected, `${message}: expected ${expected}, got ${actual}`);
  const near = (actual, expected, epsilon, message) =>
    check(Math.abs(actual - expected) <= epsilon, `${message}: expected ${expected}, got ${actual}`);

  const full = runAudit({ startSeed: 19000000, acceptedRounds: 1000 });
  const replay = runAudit({ startSeed: 19000000, acceptedRounds: 1000 });
  check(JSON.stringify(full) === JSON.stringify(replay), 'exact full 1,000-round deterministic replay');
  equal(full.seed.attempts, 1041, 'attempt count');
  equal(full.seed.redealSignals, 41, 'redeal count');
  equal(full.seed.acceptedRounds, 1000, 'accepted rounds');
  equal(full.seed.uniqueAcceptedAllocations, 1000, 'unique allocations');
  equal(full.seed.duplicateAcceptedAllocations, 0, 'duplicate allocations');
  equal(full.roundOutcomes.finishes, 942, 'finish count');
  equal(full.roundOutcomes.blocks, 58, 'block count');
  equal(full.roundOutcomes.unresolved, 0, 'unresolved rounds');
  equal(full.roundOutcomes.finishMinus['0'], 900, 'zero finish-minus');
  equal(full.roundOutcomes.finishMinus['-10'], 42, 'minus ten');
  equal(full.roundOutcomes.finishMinus['-20'], 0, 'minus twenty');
  equal(full.roundOutcomes.finishMinus['-30'], 0, 'minus thirty');
  equal(full.roundOutcomes.finishMinus['-40'], 0, 'minus forty');
  equal(full.arms.length, 6, 'six seat-order arms');

  const expectedEvents = [
    ['0-1-2', 1881, 45], ['0-2-1', 1886, 40], ['1-0-2', 1889, 37],
    ['1-2-0', 1886, 40], ['2-0-1', 1883, 43], ['2-1-0', 1890, 36]
  ];
  for (let i = 0; i < full.arms.length; i++) {
    const arm = full.arms[i];
    const [name, applied, pending] = expectedEvents[i];
    equal(arm.order, name, `${name} order`);
    equal(arm.completedMatches, 73, `${name} completed matches`);
    near(arm.meanMatchRounds, 13.58904109589041, 1e-12, `${name} mean match rounds`);
    equal(arm.medianMatchRounds, 13, `${name} median match rounds`);
    equal(arm.unfinishedTailRounds, 8, `${name} unfinished tail`);
    equal(arm.appliedNonzeroEvents, applied, `${name} applied events`);
    equal(arm.zeroInputsSkipped, 900, `${name} zero inputs skipped`);
    equal(arm.pendingNonzeroEvents, pending, `${name} pending events`);
    equal(arm.appliedNonzeroEvents + arm.zeroInputsSkipped + arm.pendingNonzeroEvents, 2826,
      `${name} event accounting`);
    equal(arm.scoreFloorHits, 12, `${name} score floor hits`);
    equal(arm.bustEvents, 73, `${name} bust events`);
    equal(arm.maxScoreObserved, 133, `${name} max score`);
  }

  equal(full.pairwise.length, 15, '15 pairwise contrasts');
  for (const pair of full.pairwise) {
    equal(pair.commonFinishBoundaries, 73, `common boundaries ${pair.orders.join('/')}`);
    for (const [bin, stratum] of Object.entries(pair.stratifiedByMinimumPreRoundGap)) {
      check(Number.isInteger(stratum.boundaries), `integer stratum denominator ${bin}`);
      check(stratum.differentExplodedSeats <= stratum.boundaries, `exploded changes <= denominator ${bin}`);
      check(stratum.differentSurvivorPlaces <= stratum.boundaries, `place changes <= denominator ${bin}`);
      check(stratum.differentFirstPlaces <= stratum.boundaries, `first-place changes <= denominator ${bin}`);
    }
    equal(Object.values(pair.stratifiedByMinimumPreRoundGap).reduce((sum, x) => sum + x.boundaries, 0), 73,
      `strata cover all matched boundaries ${pair.orders.join('/')}`);
  }

  const totals = full.stratifiedTotalsAcross15DependentContrasts;
  equal(totals['01-10'].boundaries, 825, '1-10 gap denominator');
  equal(totals['11-20'].boundaries, 225, '11-20 gap denominator');
  equal(totals['21-40'].boundaries, 45, '21-40 gap denominator');
  equal(totals['41+'].boundaries, 0, '41+ gap denominator');
  equal(totals['21-40'].differentExplodedSeats, 0, 'no exploded-seat changes at gap 21-40');
  equal(totals['21-40'].differentSurvivorPlaces, 0, 'no place changes at gap 21-40');
  equal(totals['21-40'].differentFirstPlaces, 0, 'no first-place changes at gap 21-40');

  const smokeA = runAudit({ startSeed: 19002000, acceptedRounds: 40 });
  const smokeB = runAudit({ startSeed: 19002000, acceptedRounds: 40 });
  check(JSON.stringify(smokeA) === JSON.stringify(smokeB), '40-round exact smoke replay');
  equal(smokeA.roundOutcomes.finishes + smokeA.roundOutcomes.blocks, 40, 'smoke resolution');
  equal(smokeA.roundOutcomes.unresolved, 0, 'smoke unresolved');

  return {
    passed: true,
    assertions,
    holdoutRounds: 1000,
    permutations: 6,
    pairwiseContrasts: 15,
    deterministicSmokeRounds: 40
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(test(), null, 2) + '\n');
module.exports = { test };
