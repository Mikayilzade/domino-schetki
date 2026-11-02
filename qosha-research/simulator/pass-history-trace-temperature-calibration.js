'use strict';
// Empirical opponent-choice calibration from real action traces.
// Calibration is conditional on each row's reconstructed legal-action set.
// Keep groups at round-seat granularity so one latent style cannot leak across splits.
const softmax = require('./pass-history-opponent-choice-softmax');
const regret = require('./decision-regret');
const POLICIES = ['random-legal', 'min-hand-pips', 'fast-doubles'];
const MODES = ['per-decision-mixture', 'stable-style-mixture'];
const DEFAULT_PRIOR = [1 / 3, 1 / 3, 1 / 3];

function check(ok, message) {
  if (!ok) throw new Error('trace-temperature-calibration: ' + message);
}
function validatePrior(prior) {
  check(Array.isArray(prior) && prior.length === POLICIES.length, 'prior length');
  check(prior.every(x => Number.isFinite(x) && x >= 0), 'prior must be finite and nonnegative');
  check(Math.abs(prior.reduce((a, b) => a + b, 0) - 1) < 1e-12, 'prior must sum to one');
  return prior.slice();
}
function validateRows(rows) {
  check(Array.isArray(rows) && rows.length > 0, 'trace rows must be nonempty');
  const out = rows.map(row => ({ ...row, actions: Array.isArray(row.actions) ? row.actions.slice() : row.actions }));
  const seen = new Set();
  for (const row of out) {
    check(typeof row.groupId === 'string' && row.groupId.length > 0, 'groupId must identify one round-seat');
    check(Number.isFinite(row.order), 'order must be a finite turn/order value');
    check(Array.isArray(row.actions) && row.actions.length > 0, 'actions must be a nonempty legal-action list');
    check(typeof row.chosenActionKey === 'string', 'chosenActionKey must be a string');
    const keys = row.actions.map(regret.actionKey);
    check(new Set(keys).size === keys.length, 'legal-action keys must be unique');
    check(keys.includes(row.chosenActionKey), 'observed action is absent from legal actions');
    const identity = row.groupId + '\u0000' + row.order;
    check(!seen.has(identity), 'duplicate order within a round-seat group');
    seen.add(identity);
  }
  return out.sort((a, b) => a.groupId < b.groupId ? -1 : a.groupId > b.groupId ? 1 : a.order - b.order);
}
function groupRows(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row.groupId)) groups.set(row.groupId, []);
    groups.get(row.groupId).push(row);
  }
  return [...groups.values()];
}
function assertDisjointGroups(trainRows, holdoutRows) {
  const trainIds = new Set(trainRows.map(row => row.groupId));
  const overlap = [...new Set(holdoutRows.map(row => row.groupId).filter(id => trainIds.has(id)))];
  check(overlap.length === 0, 'train/holdout group leakage: ' + overlap.slice(0, 5).join(','));
  return { trainGroups: trainIds.size, holdoutGroups: new Set(holdoutRows.map(row => row.groupId)).size };
}

// CR1 cluster-robust SE for a decision-weighted mean, with round-seat as the
// independent cluster. groupScores entries contain { n, total }; returns null
// when fewer than two independent groups are present.
function clusterRobustSE(groupScores, totalN, mean) {
  const groups = groupScores.length;
  if (groups < 2 || totalN <= 0) return null;
  const sumSquares = groupScores.reduce((sum, group) => {
    const residual = group.total - mean * group.n;
    return sum + residual * residual;
  }, 0);
  return Math.sqrt((groups / (groups - 1)) * sumSquares / (totalN * totalN));
}

function predictiveDistribution(actions, temperature, weights = DEFAULT_PRIOR) {
  check(Number.isFinite(temperature) && temperature > 0, 'temperature must be positive');
  validatePrior(weights);
  check(Array.isArray(actions) && actions.length > 0, 'actions must be nonempty');
  const actionKeys = actions.map(regret.actionKey);
  check(new Set(actionKeys).size === actionKeys.length, 'duplicate legal action keys');
  const perPolicy = POLICIES.map(policy => {
    const probabilities = actionKeys.map(key => softmax.policyProbability(actions, key, policy, temperature));
    check(Math.abs(probabilities.reduce((a, b) => a + b, 0) - 1) < 1e-9,
      'policy distribution does not sum to one: ' + policy);
    return probabilities;
  });
  const probabilities = actionKeys.map((_, i) =>
    perPolicy.reduce((sum, policyProbabilities, policyIndex) =>
      sum + weights[policyIndex] * policyProbabilities[i], 0));
  check(Math.abs(probabilities.reduce((a, b) => a + b, 0) - 1) < 1e-9, 'mixture distribution does not sum to one');
  return { actionKeys, perPolicy, probabilities };
}
function scoreRows(rows, temperature, mode, prior = DEFAULT_PRIOR) {
  check(MODES.includes(mode), 'unknown mixture mode: ' + mode);
  const valid = validateRows(rows), groups = groupRows(valid), weights = validatePrior(prior);
  let logLoss = 0, brier = 0, topOneAccuracy = 0, decisions = 0;
  const groupScores = [];
  for (const group of groups) {
    group.sort((a, b) => a.order - b.order);
    let posterior = weights.slice();
    let groupLogLoss = 0, groupBrier = 0, groupTopOne = 0;
    for (const row of group) {
      const decisionWeights = mode === 'stable-style-mixture' ? posterior : weights;
      const prediction = predictiveDistribution(row.actions, temperature, decisionWeights);
      const chosenIndex = prediction.actionKeys.indexOf(row.chosenActionKey);
      check(chosenIndex >= 0, 'chosen action missing after validation');
      const chosenProbability = prediction.probabilities[chosenIndex];
      check(chosenProbability > 0 && Number.isFinite(chosenProbability), 'chosen action has zero predictive probability');
      const rowLogLoss = -Math.log(chosenProbability);
      const rowBrier = prediction.probabilities.reduce((sum, probability, i) =>
        sum + (probability - (i === chosenIndex ? 1 : 0)) ** 2, 0);
      const maximum = Math.max(...prediction.probabilities);
      const ties = prediction.probabilities.filter(p => Math.abs(p - maximum) < 1e-12).length;
      const rowTopOne = Math.abs(chosenProbability - maximum) < 1e-12 ? 1 / ties : 0;
      logLoss += rowLogLoss;
      brier += rowBrier;
      topOneAccuracy += rowTopOne;
      groupLogLoss += rowLogLoss;
      groupBrier += rowBrier;
      groupTopOne += rowTopOne;
      decisions++;
      if (mode === 'stable-style-mixture') {
        posterior = posterior.map((weight, policyIndex) =>
          weight * prediction.perPolicy[policyIndex][chosenIndex]);
        const total = posterior.reduce((a, b) => a + b, 0);
        check(total > 0 && Number.isFinite(total), 'stable-style posterior collapsed to zero');
        posterior = posterior.map(weight => weight / total);
      }
    }
    groupScores.push({
      n: group.length,
      logLoss: groupLogLoss,
      brier: groupBrier,
      topOneAccuracy: groupTopOne
    });
  }
  check(decisions > 0, 'no decisions scored');
  const meanLogLoss = logLoss / decisions;
  const meanMulticlassBrier = brier / decisions;
  const meanTopOneAccuracy = topOneAccuracy / decisions;
  return {
    decisions,
    groups: groups.length,
    meanLogLoss,
    meanMulticlassBrier,
    topOneAccuracy: meanTopOneAccuracy,
    clusterSE: {
      unit: 'round-seat group',
      meanLogLoss: clusterRobustSE(groupScores.map(g => ({ n: g.n, total: g.logLoss })), decisions, meanLogLoss),
      meanMulticlassBrier: clusterRobustSE(groupScores.map(g => ({ n: g.n, total: g.brier })), decisions, meanMulticlassBrier),
      topOneAccuracy: clusterRobustSE(groupScores.map(g => ({ n: g.n, total: g.topOneAccuracy })), decisions, meanTopOneAccuracy)
    }
  };
}
function scoreRandomLegal(rows) {
  const valid = validateRows(rows);
  let logLoss = 0, brier = 0, topOneAccuracy = 0;
  for (const row of valid) {
    const probability = 1 / row.actions.length;
    const chosenIndex = row.actions.findIndex(action => regret.actionKey(action) === row.chosenActionKey);
    check(chosenIndex >= 0, 'random-legal chosen action missing');
    logLoss -= Math.log(probability);
    brier += row.actions.reduce((sum, _, i) =>
      sum + (probability - (i === chosenIndex ? 1 : 0)) ** 2, 0);
    topOneAccuracy += 1 / row.actions.length;
  }
  return {
    decisions: valid.length,
    meanLogLoss: logLoss / valid.length,
    meanMulticlassBrier: brier / valid.length,
    topOneAccuracy: topOneAccuracy / valid.length
  };
}
function runCalibration(trainRows, holdoutRows, options = {}) {
  const train = validateRows(trainRows), holdout = validateRows(holdoutRows);
  check(train.length > 0 && holdout.length > 0, 'train and holdout must both be nonempty');
  const split = assertDisjointGroups(train, holdout);
  const prior = validatePrior(options.prior || DEFAULT_PRIOR);
  const temperatures = (options.temperatures || [0.1, 0.2, 0.3, 0.5, 0.8, 1.0, 1.5])
    .slice().sort((a, b) => a - b);
  check(temperatures.length > 0 && temperatures.every(t => Number.isFinite(t) && t > 0),
    'temperature grid must contain positive finite values');
  check(new Set(temperatures).size === temperatures.length, 'temperature grid must be unique');
  const modes = options.modes || MODES;
  check(modes.length > 0 && modes.every(mode => MODES.includes(mode)), 'invalid calibration mode');
  const byMode = {};
  for (const mode of modes) {
    const trainingGrid = temperatures.map(temperature => ({
      temperature, metrics: scoreRows(train, temperature, mode, prior)
    }));
    const selected = trainingGrid.reduce((best, item) =>
      item.metrics.meanLogLoss < best.metrics.meanLogLoss ? item : best, trainingGrid[0]);
    const holdoutGrid = temperatures.map(temperature => ({
      temperature, metrics: scoreRows(holdout, temperature, mode, prior)
    }));
    const selectedHoldout = holdoutGrid.find(item => item.temperature === selected.temperature);
    byMode[mode] = {
      selectedTemperature: selected.temperature,
      trainingAtSelected: selected.metrics,
      holdoutAtSelected: selectedHoldout.metrics,
      trainingGrid,
      holdoutGrid
    };
  }
  return {
    schema: 'qosha-opponent-choice-trace-calibration/v1',
    policies: POLICIES,
    prior,
    temperatures,
    split: {
      unit: 'round-seat group; all decisions from one opponent in one round stay together',
      trainDecisions: train.length,
      holdoutDecisions: holdout.length,
      ...split
    },
    fitCriterion: 'minimum training mean log loss; selected temperature is evaluated on disjoint holdout groups',
    brierDefinition: 'multiclass sum of squared probability errors, averaged over decisions',
    uncertainty: 'cluster-robust CR1 standard errors use round-seat groups as independent units; do not treat decisions within a group as independent',
    randomLegalHoldoutBaseline: scoreRandomLegal(holdout),
    byMode
  };
}
module.exports = {
  POLICIES, MODES, DEFAULT_PRIOR, validatePrior, validateRows, assertDisjointGroups,
  predictiveDistribution, scoreRows, scoreRandomLegal, runCalibration, clusterRobustSE
};
