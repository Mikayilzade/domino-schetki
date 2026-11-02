'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'runs');
const a = JSON.parse(fs.readFileSync(path.join(root, '2026-11-02-0554-pass-history-continuation-profile-audit.json'), 'utf8'));
const b = JSON.parse(fs.readFileSync(path.join(root, '2026-11-02-0647-pass-history-moderate-double-hold-audit.json'), 'utf8'));

assert.ok(a.seedWindow.reservedEnd < b.seedWindow.reservedStart, 'seed windows must be disjoint');
assert.equal(a.discovery.uniqueDealAllocations, 2306);
assert.equal(b.discovery.uniqueDealAllocations, 5117);
assert.equal(a.exactSupport.joint, 249);
assert.equal(b.exactSupport.joint, 610);

const profiles = ['closed-branch-control', 'min-hand-pips', 'fast-doubles'];
const comparisons = {};
for (const profile of profiles) {
  const A = a.metricsByProfile[profile].stateClusterGlobalMinusCurrent.firstFinishChance;
  const B = b.metricsByProfile[profile].modelDelta.firstFinishChance;
  const delta = B.mean - A.mean;
  const ci95 = Math.sqrt(A.ci95 * A.ci95 + B.ci95 * B.ci95);
  assert.ok(A.mean - A.ci95 > 0, profile + ': cohort A descriptive interval should remain positive');
  assert.ok(B.mean - B.ci95 > 0, profile + ': cohort B descriptive interval should remain positive');
  assert.ok(Math.abs(delta) < ci95, profile + ': cross-cohort shift should include zero');
  comparisons[profile] = { cohortA: A, cohortB: B, bMinusA: { mean: delta, ci95 } };
}
const sensitivityA = a.metricsByProfile['closed-branch-control'].stateClusterGlobalMinusCurrent.firstFinishChance.mean -
  a.metricsByProfile['fast-doubles'].stateClusterGlobalMinusCurrent.firstFinishChance.mean;
const valuesB = Object.values(b.metricsByProfile).map(x => x.modelDelta.firstFinishChance.mean);
const sensitivityB = Math.max(...valuesB) - Math.min(...valuesB);
assert.ok(Math.abs(sensitivityA - 0.006) < 1e-12);
assert.ok(Math.abs(sensitivityB - 0.0058558558558558516) < 1e-12);
assert.deepEqual(
  b.metricsByProfile['moderate-double-hold'].modelDelta,
  b.metricsByProfile['min-hand-pips'].modelDelta,
  'moderate-double-hold and min-hand-pips match in cohort B aggregate model-gap metrics'
);
console.log(JSON.stringify({ passed: true, assertions: 14, comparisons, sensitivityA, sensitivityB }, null, 2));
