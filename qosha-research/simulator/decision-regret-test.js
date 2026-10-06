'use strict';
const assert=require('assert');
const e=require('./engine');
const d=require('./turn-dispatcher');
const {actionKey,evaluateDecisionInWorld,aggregateWorlds}=require('./decision-regret');

function snapshot(s){
  return JSON.stringify({
    branchState:s.branchState,
    opened:[...s.openingState.openedNumbers].sort((a,b)=>a-b),
    hands:s.hands,stock:s.stock,currentPlayer:s.currentPlayer,
    consecutivePasses:s.consecutivePasses,turns:s.turns,outcome:s.outcome
  });
}

// Construct a deterministic mid-round choice with two legal ordinary moves.
// This is an evaluator regression fixture, not a claim about how this state arose.
const state={
  branchState:e.createBranchState([1,1]),
  openingState:e.createOpeningState([1]),
  hands:[
    [[1,2],[1,3]],
    [[0,0],[0,1]],
    [[2,2],[2,3]]
  ],
  stock:[],
  currentPlayer:0,
  consecutivePasses:0,
  turns:7,
  outcome:null
};
const before=snapshot(state);
const opts=d.turnOptions(state.branchState,state.openingState,state.hands[0],state.stock);
assert.strictEqual(opts.phase,'play');
assert.ok(opts.actions.length>=2,'fixture must expose a real choice');
const keys=opts.actions.map(actionKey);
assert.strictEqual(new Set(keys).size,keys.length,'candidate keys must be unique');

const a=evaluateDecisionInWorld(state,{focalPlayer:0,continuationStrategy:'closed-branch-control',seed:424242,maxTurns:50});
const b=evaluateDecisionInWorld(state,{focalPlayer:0,continuationStrategy:'closed-branch-control',seed:424242,maxTurns:50});
assert.strictEqual(a.kind,'paired-world');
assert.deepStrictEqual(a,b,'paired evaluator must be deterministic');
assert.strictEqual(a.candidates.length,opts.actions.length,'every legal candidate must be evaluated exactly once');
assert.deepStrictEqual(a.candidates.map(x=>x.actionKey).sort(),keys.sort(),'candidate set must match legal actions');
assert.strictEqual(snapshot(state),before,'evaluation must not mutate source world');

// Aggregation regression: repeat the exact same hidden world twice.
// Each candidate must therefore have n=2 and its aggregate metrics must
// exactly equal the deterministic single-world observation.
const agg=aggregateWorlds([a,b]);
assert.strictEqual(agg.worlds,2);
assert.deepStrictEqual(Object.keys(agg.byAction).sort(),keys.sort());
for(const row of a.candidates){
  const m=agg.byAction[row.actionKey];
  assert.strictEqual(m.n,2);
  assert.strictEqual(m.finishFirstRate,row.focalFinishedFirst?1:0);
  assert.strictEqual(m.meanRemainder,row.focalRemainder);
  assert.strictEqual(m.minusFinishRate,row.focalMinus<0?1:0);
  assert.strictEqual(m.meanMinusWhenMinus,row.focalMinus<0?row.focalMinus:null);
}
for(const key of keys){
  const g=agg.regret[key];
  assert(g,'every candidate must receive regret metrics');
  assert(g.finishRateRegret>=0);
  assert(g.remainderRegret>=0);
  assert(g.minusFinishRegret>=0);
}
assert(Math.min(...Object.values(agg.regret).map(x=>x.finishRateRegret))===0,'best finish-rate candidate must have zero regret');
assert(Math.min(...Object.values(agg.regret).map(x=>x.remainderRegret))===0,'best remainder candidate must have zero regret');
assert(Math.min(...Object.values(agg.regret).map(x=>x.minusFinishRegret))===0,'best minus-finish candidate must have zero regret');
assert.strictEqual(snapshot(state),before,'aggregation must not mutate source world');

console.log('decision-regret evaluator+aggregation regression: ok; candidates='+a.candidates.length);
