'use strict';
const assert=require('node:assert/strict');
const audit=require('./pass-history-joint-support-choice-audit');
const profiles=['closed-branch-control','min-hand-pips','fast-doubles'];
const r=audit.runAudit({startSeed:3455101,deals:2500,targetPositions:300,maxWorlds:20000,continuationProfiles:profiles});
assert.deepEqual(r.continuationProfiles,profiles);
assert.equal(r.discovery.dealsGenerated,2306);
assert.equal(r.discovery.uniqueDealAllocations,2306);
assert.equal(r.discovery.duplicateDealAllocations,0);
assert.equal(r.discovery.jointPositivePositions,50);
assert.equal(r.statesWith2plusCommonActions,50);
assert.equal(r.jointStateWorldAssignments,249);
assert.equal(r.exactAllocationsChecked,617);
assert.equal(r.duplicateWithinStateAllocations,0);
assert.equal(r.candidateActionWorldPairsPerProfile,698);
assert.equal(r.rolloutsPerProfile,1396);
assert.equal(r.candidateActionWorldPairs,2094);
assert.equal(r.rollouts,4188);
for(const profile of profiles){
 assert.equal(r.aggregateRolloutMetricsByProfile[profile].global.n,698);
 assert.equal(r.aggregateRolloutMetricsByProfile[profile].currentOnly.n,698);
 assert.equal(r.outcomeRolloutsByProfile[profile].global.unresolved,0);
 assert.equal(r.outcomeRolloutsByProfile[profile].currentOnly.unresolved,0);
}
const closed=r.aggregateRolloutMetricsByProfile['closed-branch-control'];
const min=r.aggregateRolloutMetricsByProfile['min-hand-pips'];
const fast=r.aggregateRolloutMetricsByProfile['fast-doubles'];
assert.deepEqual(min,closed,'min-hand-pips is identical on this fixed cohort');
assert.ok(Math.abs((fast.global.focalFirstFinishChance-closed.global.focalFirstFinishChance)-(-0.008595988538681931))<1e-12);
assert.ok(Math.abs(fast.currentOnly.focalFirstFinishChance-closed.currentOnly.focalFirstFinishChance)<1e-12);
assert.ok(Math.abs((r.modelDeltaClusterByStateByProfile['fast-doubles'].firstFinishChance.mean-
 r.modelDeltaClusterByStateByProfile['closed-branch-control'].firstFinishChance.mean)-(-0.006))<1e-12);
console.log(JSON.stringify({passed:true,assertions:29,seedWindow:r.seedWindow,states:r.states,
 jointStateWorldAssignments:r.jointStateWorldAssignments,candidateActionWorldPairsPerProfile:r.candidateActionWorldPairsPerProfile,
 rolloutsPerProfile:r.rolloutsPerProfile,profiles:r.continuationProfiles},null,2));
