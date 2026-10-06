'use strict';
const assert=require('assert');
const e=require('./engine');
const {sampleWorld,candidateKeys,runHiddenWorlds}=require('./hidden-world');

// Synthetic mid-round fixture. knownTiles is the COMPLETE played/known history,
// not merely branch ends. Counts: focal 2 + known 10 + opponents 8+7 + stock 1 = 28.
const focalHand=[[1,2],[1,3]];
const knownTiles=[[1,1],[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[2,2],[2,3]];
const visibleState={
  branchState:e.createBranchState([1,1]),
  openingState:e.createOpeningState([1]),
  hands:[focalHand,[],[]],stock:[],currentPlayer:0,consecutivePasses:0,turns:10,outcome:null
};
const spec={focalPlayer:0,focalHand,knownTiles,hiddenHandSizes:[2,8,7],stockSize:1,visibleState};
const snap=JSON.stringify(visibleState);
const a=sampleWorld(spec,700),b=sampleWorld(spec,700),c=sampleWorld(spec,701);
assert.deepStrictEqual(a,b,'same seed must reproduce hidden allocation');
assert.notDeepStrictEqual(a.hands.slice(1),c.hands.slice(1),'different seed should change hidden allocation');
assert.strictEqual(JSON.stringify(visibleState),snap,'sampling must not mutate visible source state');
const all=[...knownTiles,...a.hands.flat(),...a.stock].map(e.tileKey);
assert.strictEqual(all.length,28);
assert.strictEqual(new Set(all).size,28,'world must contain every tile exactly once');
const before=candidateKeys(a);
const run=runHiddenWorlds(spec,{count:25,startSeed:700,maxTurns:100});
assert.strictEqual(run.worldCount,25);
assert.deepStrictEqual(run.candidateKeys,before);
assert.strictEqual(run.aggregate.worlds,25);
for(const m of Object.values(run.aggregate.byAction))assert.strictEqual(m.n,25,'each candidate must use all identical hidden worlds');
assert.strictEqual(JSON.stringify(visibleState),snap,'25-world run must not mutate visible state');
console.log('fixed-visible hidden-world regression: ok; worlds=25 candidates='+before.length);
