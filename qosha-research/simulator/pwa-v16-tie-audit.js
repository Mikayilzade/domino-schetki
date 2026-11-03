'use strict';
/**
 * Six matched manual-entry orders on historical accepted 3x9 deals.
 * Run the old and v16-tie adapters separately, with identical seed streams.
 * Temporary adapter substitution is restored in finally; no live PWA mutation.
 */
const legacy = require('./finish-score-match-integration');
const v16 = require('./finish-score-match-integration-v16');
const prior = require('./finish-score-event-order-proximity-six-permutation-holdout');
function totals(result) {
  return {
    pairwisePlaceChanges: result.pairwiseBoundarySensitivity.reduce((s,p)=>s+p.sameBoundaryDifferentSurvivorPlaces,0),
    pairwiseFirstPlaceChanges: result.pairwiseBoundarySensitivity.reduce((s,p)=>s+p.sameBoundaryDifferentFirstPlace,0),
    completedMatchesPerOrder: result.arms.map(a=>a.completedMatches),
    bin11to20: result.stratifiedTotalsAcross15DependentContrasts['11-20'] || null
  };
}
function auditCohort(startSeed, acceptedRounds = 1000) {
  const opts = { startSeed, acceptedRounds };
  const historical = prior.runAudit(opts);
  const original = legacy.applyFinishOutcomeToMatch;
  let calls = 0, tieArmEvents = 0;
  const tieFinishOrdinals = new Set();
  legacy.applyFinishOutcomeToMatch = (...args) => {
    const result = v16.applyFinishOutcomeToMatch(...args);
    if (result.isDraw) { tieArmEvents++; tieFinishOrdinals.add(Math.floor(calls / 6)); }
    calls++;
    return result;
  };
  let corrected;
  try { corrected = prior.runAudit(opts); }
  finally { legacy.applyFinishOutcomeToMatch = original; }
  if (calls !== corrected.roundOutcomes.finishes * 6) throw new Error('six-arm finish call census mismatch');
  if (JSON.stringify(historical.seed) !== JSON.stringify(corrected.seed) ||
      JSON.stringify(historical.roundOutcomes) !== JSON.stringify(corrected.roundOutcomes)) throw new Error('round cohort drift');
  if (JSON.stringify(historical.arms.map(a=>a.completedMatches)) !== JSON.stringify(corrected.arms.map(a=>a.completedMatches))) throw new Error('match boundary drift');
  return {
    startSeed, seed: corrected.seed, outcomes: corrected.roundOutcomes,
    historical: totals(historical), v16: totals(corrected),
    tieArmEvents, uniqueTieFinishOrdinals: tieFinishOrdinals.size,
    sourceSemantics: 'Active scoreboard-v16: tied surviving scores -> 1.5 points each and no win; legacy adapter used stable-sort 2/1. Physical scoring mapping remains provisional.'
  };
}
function runAudit({ seeds = [17000000,18000000,19000000,20000000], acceptedRounds = 1000 } = {}) {
  return {
    schema: 'qosa-pwa-v16-tie-audit/v1',
    engine: 'qosha-research-0.5.3',
    rules: 'recovered qosa-1.0.0 3x9 coded model; provisional terminal-pip-plus-minus scoring; block unscored',
    cohorts: seeds.map(seed=>auditCohort(seed,acceptedRounds)),
    limitations: 'Same prior accepted deals, zero new independent deals. Fifteen pairwise contrasts are dependent; six arms share deals. Branch model and physical score mapping remain provisional. No strategy inference.'
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(runAudit(),null,2)+'\n');
module.exports = { auditCohort, runAudit };
