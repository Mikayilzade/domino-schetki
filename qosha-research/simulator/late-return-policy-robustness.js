'use strict';
// Policy sensitivity of a *single reachable* late-round 3x9 witness.
// All branch interpretations and opponent policies are provisional.
// node qosha-research/simulator/late-return-policy-robustness.js
const assert=require('node:assert/strict');
const {run:baseline,replay,evaluate,choices}=require('./late-return-rule-sensitivity');
const MODELS=['global-ever-open','all-current-only'];
const POLICIES=['low','high','double-first','double-last'];
const LABELS=['0-2@down','0-3@left','3-4@left','2-4@down','2-3@left','2-3@down'];
function run(){
 const prior=baseline();
 assert.deepEqual(prior.passStatusReversals,['0-2@down','0-3@left','2-3@left']);
 const rows=[],byPolicy={};
 for(const style of POLICIES){
  const pair={};
  for(const model of MODELS){
   const start=replay(model);
   const outcomes=choices.map(a=>evaluate(start,a,style));
   assert.deepEqual(outcomes.map(x=>x.candidate),LABELS);
   assert(outcomes.every(x=>x.returnLegalStones>=0&&x.returnLegalStones<=5));
   assert(outcomes.every(x=>x.returnPass===(x.returnLegalStones===0)));
   // Determinism, no cross-candidate mutation, and replayed chronology.
   assert.deepEqual(choices.map(a=>evaluate(start,a,style)),outcomes);
   assert.deepEqual(choices.map(a=>evaluate(replay(model),a,style)),outcomes);
   pair[model]=outcomes;
   rows.push({policy:style,model,legalStones:outcomes.map(x=>x.returnLegalStones),
    forcedPasses:outcomes.filter(x=>x.returnPass).length,
    meanLegalStones:outcomes.reduce((n,x)=>n+x.returnLegalStones,0)/6});
  }
  const g=pair['global-ever-open'],c=pair['all-current-only'];
  byPolicy[style]={
   reversalCandidates:g.filter((x,i)=>x.returnPass!==c[i].returnPass).map(x=>x.candidate),
   passSafeBothModels:LABELS.filter((_,i)=>!g[i].returnPass&&!c[i].returnPass)
  };
 }
 assert.deepEqual(rows.map(r=>r.legalStones),[
  [0,3,0,2,2,4],[3,0,0,2,0,3],
  [4,4,3,3,2,2],[3,3,3,3,2,2],
  [4,4,4,2,2,4],[3,3,4,2,2,3],
  [0,3,0,2,2,4],[3,0,0,2,0,3]
 ]);
 assert.deepEqual(byPolicy.low.reversalCandidates,['0-2@down','0-3@left','2-3@left']);
 assert.deepEqual(byPolicy['double-last'].reversalCandidates,byPolicy.low.reversalCandidates);
 assert.deepEqual(byPolicy.high.reversalCandidates,[]);
 assert.deepEqual(byPolicy['double-first'].reversalCandidates,[]);
 const passSafeAll=LABELS.filter(label=>rows.every(r=>{
  const i=LABELS.indexOf(label);return r.legalStones[i]>0;
 }));
 assert.deepEqual(passSafeAll,['2-4@down','2-3@down']);
 assert.deepEqual(rows.map(r=>r.forcedPasses),[2,3,0,0,0,0,2,3]);
 return {schema:'qosha-late-return-policy-robustness/v1',
  rules:'qosa-1.0.0 3x9; both branch models PROVISIONAL',
  policies:POLICIES,models:MODELS,
  fixture:'one fixed chronological reachable 28-stone deal; no random seeds',
  newSeededDeals:0,newSeededWorlds:0,newCompleteRounds:0,
  candidateActions:6,deterministicTwoOpponentContinuations:48,
  rows,byPolicy,passSafeAll,
  finding:'3 branch-model forced-pass reversals under low/double-last, 0 under high/double-first',
  limitation:'selected full-information fixture; single-stone opponent policies, no human likelihood, no win-rate or regret evidence'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
