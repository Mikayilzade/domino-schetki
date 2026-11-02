'use strict';
const assert=require('node:assert/strict');
const audit=require('./pass-history-joint-support-choice-audit');
const profiles=['closed-branch-control','min-hand-pips','fast-doubles','moderate-double-hold'];
const r=audit.runAudit({startSeed:3455101,deals:2500,targetPositions:300,maxWorlds:20000,continuationProfiles:profiles});
assert.deepEqual(r.conditioning.continuationProfiles,profiles);
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
assert.equal(r.candidateActionWorldPairs,2792);
assert.equal(r.rollouts,5584);
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
const moderate=r.aggregateRolloutMetricsByProfile['moderate-double-hold'];
assert.deepEqual(moderate,closed,'moderate profile is tie-break-only on this fixed cohort');
const model=require('./model-agreement-common-world-regret-node');
const tieActions=[{type:'single',tile:[6,6]},{type:'double-sequence',tiles:[[2,2],[4,4]],numbers:[2,4]}];
assert.equal(model.chooseOrbit({actions:tieActions},{branchState:null},{profile:'moderate-double-hold',seed:1}).type,'single');
assert.equal(model.chooseOrbit({actions:tieActions},{branchState:null},{profile:'fast-doubles',seed:1}).type,'double-sequence');
console.log(JSON.stringify({passed:true,assertions:36,seedWindow:r.seedWindow,states:r.states,
 jointStateWorldAssignments:r.jointStateWorldAssignments,candidateActionWorldPairsPerProfile:r.candidateActionWorldPairsPerProfile,
 rolloutsPerProfile:r.rolloutsPerProfile,profiles:r.continuationProfiles},null,2));
