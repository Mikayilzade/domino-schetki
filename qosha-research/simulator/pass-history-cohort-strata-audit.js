'use strict';
const audit = require('./pass-history-joint-support-choice-audit');
const PROFILES = ['closed-branch-control', 'min-hand-pips', 'fast-doubles', 'moderate-double-hold'];

function stats(values, scale = 1) {
  const xs = values.map(x => x * scale), n = xs.length;
  if (!n) return { n: 0, mean: null, sd: null, ci95: null };
  const mean = xs.reduce((a, b) => a + b, 0) / n;
  const variance = xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (n > 1 ? n - 1 : 1);
  const sd = Math.sqrt(variance);
  return { n, mean, sd, ci95: 1.96 * sd / Math.sqrt(n) };
}

function summarizeStates(states, profile = 'closed-branch-control') {
  function summarizeGroup(group) {
    return {
      n: group.length,
      jointStateWorldAssignments: group.reduce((a, s) => a + s.jointWorlds, 0),
      modelGapFirstFinishPp: stats(group.map(s => s.modelDeltaByProfile[profile].firstFinishChance), 100),
      modelGapMeanRemainderPips: stats(group.map(s => s.modelDeltaByProfile[profile].meanRemainder)),
      globalOracleRegretFirstFinishPp: stats(group.map(s => s.regretByProfile[profile].global.averageCandidateRegret.firstFinishChance), 100),
      currentOnlyOracleRegretFirstFinishPp: stats(group.map(s => s.regretByProfile[profile].currentOnly.averageCandidateRegret.firstFinishChance), 100),
      globalOracleRegretMeanRemainderPips: stats(group.map(s => s.regretByProfile[profile].global.averageCandidateRegret.meanRemainder)),
      currentOnlyOracleRegretMeanRemainderPips: stats(group.map(s => s.regretByProfile[profile].currentOnly.averageCandidateRegret.meanRemainder))
    };
  }
  function groupBy(keyFn) {
    const groups = {};
    for (const state of states) {
      const key = keyFn(state);
      (groups[key] ||= []).push(state);
    }
    return Object.fromEntries(Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, group]) => [key, summarizeGroup(group)]));
  }
  const byOpponentHandSizes = groupBy(s => s.handSizes.filter((_, i) => i !== s.focalPlayer)
    .sort((a, b) => a - b).join('-'));
  const byCommonActionCount = groupBy(s => s.rootActions.common === 2 ? '2' :
    (s.rootActions.common <= 4 ? '3-4' : '5+'));
  const byPassCount = groupBy(s => s.passCount === 1 ? '1' : (s.passCount === 2 ? '2' : '3+'));
  function contrast(a, b) {
    if (!a || !b || !a.n || !b.n) return null;
    const difference = a.mean - b.mean;
    const half = 1.96 * Math.sqrt(a.sd * a.sd / a.n + b.sd * b.sd / b.n);
    return { differencePp: difference, ci95HalfWidthPp: half, intervalPp: [difference - half, difference + half],
      method: 'independent state-cluster normal approximation; descriptive only' };
  }
  return {
    profile,
    stateCount: states.length,
    byOpponentHandSizes,
    byCommonActionCount,
    byPassCount,
    contrast3v3Minus2v3: contrast(byOpponentHandSizes['3-3']?.modelGapFirstFinishPp,
      byOpponentHandSizes['2-3']?.modelGapFirstFinishPp)
  };
}

function summarizeRun(r) {
  const gapByProfile = Object.fromEntries(PROFILES.map(profile => {
    const x = r.modelDeltaClusterByStateByProfile[profile];
    return [profile, {
      firstFinishGapPp: { mean: x.firstFinishChance.mean * 100, ci95: x.firstFinishChance.ci95 * 100 },
      meanRemainderGapPips: { mean: x.meanRemainder.mean, ci95: x.meanRemainder.ci95 }
    }];
  }));
  const gapValues = PROFILES.map(p => gapByProfile[p].firstFinishGapPp.mean);
  return {
    schema: 'qosha-pass-history-strata-audit/v1',
    engine: 'qosha-research-0.5.3 + current-only-pass-support-1.0 + model-agreement-common-world-regret-node',
    rules: 'recovered qosa-1.0.0; 3x9; global-ever-open/current-only branch models provisional',
    seedWindow: r.seedWindow,
    discovery: {
      dealsRequested: r.discovery.dealsRequested,
      dealsGenerated: r.discovery.dealsGenerated,
      uniqueDealAllocations: r.discovery.uniqueDealAllocations,
      duplicateDealAllocations: r.discovery.duplicateDealAllocations,
      selectedLateStates: r.discovery.selectedPositions,
      eligibleLateStates: r.discovery.eligibleLateStates,
      passObservations: r.discovery.passObservations,
      jointSupportMultiActionStates: r.discovery.jointPositivePositions,
      outcomesUnderCurrentOnlyCounterfactual: r.discovery.outcomes
    },
    exactSupport: {
      ...r.supportTotals,
      exactAllocationsChecked: r.exactAllocationsChecked,
      duplicateWithinStateAllocations: r.duplicateWithinStateAllocations,
      stateWorldAssignments: r.jointStateWorldAssignments
    },
    pairedContinuations: {
      profiles: PROFILES,
      candidateActionWorldPairsPerProfile: r.candidateActionWorldPairsPerProfile,
      modelRolloutsPerProfile: r.rolloutsPerProfile,
      totalCandidateActionWorldPairs: r.candidateActionWorldPairs,
      totalModelRollouts: r.rollouts,
      outcomeRolloutsByProfile: r.outcomeRolloutsByProfile
    },
    pooledMetricsByProfile: r.aggregateRolloutMetricsByProfile,
    modelGapByProfile,
    profileGapRangePp: Math.max(...gapValues) - Math.min(...gapValues),
    regretByProfile: r.regretClusterByStateByProfile,
    stratification: summarizeStates(r.statesData)
  };
}

function run(options = {}) {
  const profiles = options.continuationProfiles || PROFILES;
  const r = audit.runAudit({
    startSeed: options.startSeed ?? 3473601,
    deals: options.deals ?? 16000,
    targetPositions: options.targetPositions ?? 1500,
    maxWorlds: options.maxWorlds ?? 20000,
    continuationProfiles: profiles
  });
  return summarizeRun(r);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const result = run({
    startSeed: args[0] === undefined ? 3473601 : Number(args[0]),
    deals: args[1] === undefined ? 16000 : Number(args[1]),
    targetPositions: args[2] === undefined ? 1500 : Number(args[2]),
    maxWorlds: args[3] === undefined ? 20000 : Number(args[3])
  });
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

module.exports = { stats, summarizeStates, summarizeRun, run };
