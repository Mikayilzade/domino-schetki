'use strict';
const calibration = require('./pass-history-trace-temperature-calibration');
const regret = require('./decision-regret');
function check(ok, message) {
  if (!ok) throw new Error('trace-temperature-calibration-test: ' + message);
}
function expectThrow(fn, message) {
  let threw = false;
  try { fn(); } catch (_) { threw = true; }
  check(threw, message);
}
function fixtureActions() {
  return [
    { type: 'single', side: 'up', to: 1, tile: [0, 1], from: 0 },
    { type: 'single', side: 'left', to: 2, tile: [0, 2], from: 0 },
    { type: 'single', side: 'down', to: 3, tile: [0, 3], from: 0 }
  ];
}
function makeGroup(groupId, actions, chosenIndex = 2, decisions = 4) {
  return Array.from({ length: decisions }, (_, order) => ({
    groupId, order, actions, chosenActionKey: regret.actionKey(actions[chosenIndex])
  }));
}
function test() {
  let assertions = 0;
  const ok = (condition, message) => { assertions++; check(condition, message); };
  const throws = (fn, message) => { assertions++; expectThrow(fn, message); };
  const actions = fixtureActions(), prior = [1 / 3, 1 / 3, 1 / 3];
  const train = ['train-1', 'train-2', 'train-3', 'train-4', 'train-5', 'train-6']
    .flatMap(id => makeGroup(id, actions));
  const holdout = ['hold-1', 'hold-2'].flatMap(id => makeGroup(id, actions));
  const temperatures = [0.1, 0.3, 1.5];
  const result = calibration.runCalibration(train, holdout, { prior, temperatures });
  const prediction = calibration.predictiveDistribution(actions, 0.3, prior);
  ok(Math.abs(prediction.probabilities.reduce((a, b) => a + b, 0) - 1) < 1e-12,
    'mixture probabilities normalize');
  for (let i = 0; i < calibration.POLICIES.length; i++) {
    ok(Math.abs(prediction.perPolicy[i].reduce((a, b) => a + b, 0) - 1) < 1e-12,
      'policy probabilities normalize: ' + calibration.POLICIES[i]);
  }
  ok(result.byMode['per-decision-mixture'].selectedTemperature === 0.1,
    'per-decision fixture selects cold temperature');
  ok(result.byMode['stable-style-mixture'].selectedTemperature === 0.1,
    'stable-style fixture selects cold temperature');
  ok(result.byMode['per-decision-mixture'].holdoutGrid[0].metrics.meanLogLoss <
    result.byMode['per-decision-mixture'].holdoutGrid[2].metrics.meanLogLoss,
    'per-decision cold temperature scores better on synthetic holdout');
  ok(result.byMode['stable-style-mixture'].holdoutGrid[0].metrics.meanLogLoss <
    result.byMode['stable-style-mixture'].holdoutGrid[2].metrics.meanLogLoss,
    'stable-style cold temperature scores better on synthetic holdout');
  ok(result.byMode['stable-style-mixture'].holdoutAtSelected.meanLogLoss <
    result.byMode['per-decision-mixture'].holdoutAtSelected.meanLogLoss,
    'stable-style posterior updates on repeated same-group choices');
  ok(result.byMode['stable-style-mixture'].holdoutAtSelected.meanLogLoss <
    result.randomLegalHoldoutBaseline.meanLogLoss,
    'mixture beats random-legal on the synthetic fixture');
  ok(result.split.trainDecisions === 24 && result.split.holdoutDecisions === 8 &&
    result.split.trainGroups === 6 && result.split.holdoutGroups === 2,
    'decision and group counts are exact');
  ok(result.byMode['per-decision-mixture'].holdoutAtSelected.clusterSE.unit === 'round-seat group' &&
    Number.isFinite(result.byMode['per-decision-mixture'].holdoutAtSelected.clusterSE.meanLogLoss),
    'cluster SE reported with independent round-seat unit');
  const mixed = [
    ...makeGroup('heterogeneous-1', actions, 2),
    ...makeGroup('heterogeneous-2', actions, 0)
  ];
  const mixedScore = calibration.scoreRows(mixed, 0.3, 'per-decision-mixture', prior);
  ok(mixedScore.groups === 2 && mixedScore.clusterSE.meanLogLoss > 0,
    'cluster SE responds to between-group score variation');
  ok(calibration.clusterRobustSE([{ n: 2, total: 2 }, { n: 2, total: 6 }], 4, 2) === 1,
    'CR1 cluster SE matches hand-calculated fixture');
  ok(calibration.clusterRobustSE([{ n: 4, total: 4 }], 4, 1) === null,
    'cluster SE unavailable for a single independent group');
  throws(() => calibration.runCalibration(train, train, { temperatures }),
    'overlapping train/holdout round-seat groups rejected');
  throws(() => calibration.validateRows([{ ...train[0], chosenActionKey: 'not-legal' }]),
    'illegal observed action rejected');
  throws(() => calibration.validateRows([{ ...train[0], actions: [actions[0], actions[0]] }]),
    'duplicate legal-action key rejected');
  throws(() => calibration.validateRows([train[0], { ...train[0] }]),
    'duplicate order in one group rejected');
  throws(() => calibration.runCalibration(train, holdout, { prior: [0.2, 0.2, 0.2], temperatures }),
    'unnormalized prior rejected');
  throws(() => calibration.runCalibration(train, holdout, { temperatures: [0.1, 0.1] }),
    'duplicate temperature rejected');
  ok(result.randomLegalHoldoutBaseline.decisions === 8, 'random-legal baseline covers holdout rows');
  return {
    passed: true, assertions,
    fixtureOnly: true,
    trainGroups: result.split.trainGroups, trainDecisions: result.split.trainDecisions,
    holdoutGroups: result.split.holdoutGroups, holdoutDecisions: result.split.holdoutDecisions,
    selectedTemperature: {
      perDecision: result.byMode['per-decision-mixture'].selectedTemperature,
      stableStyle: result.byMode['stable-style-mixture'].selectedTemperature
    },
    holdoutLogLoss: {
      perDecision: result.byMode['per-decision-mixture'].holdoutAtSelected.meanLogLoss,
      stableStyle: result.byMode['stable-style-mixture'].holdoutAtSelected.meanLogLoss,
      randomLegal: result.randomLegalHoldoutBaseline.meanLogLoss
    },
    clusterSE: result.byMode['per-decision-mixture'].holdoutAtSelected.clusterSE
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(test()) + '\n');
module.exports = { test };
