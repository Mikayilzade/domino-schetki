'use strict';
// Empirical regression for the real-position Monte Carlo sampler against the
// independent exact C(18,9) two-double allocation oracle.
// This test checks allocation only: no branch, block, or finish assumptions.
const assert=require('node:assert/strict');
const e=require('./engine');
const {sampleWorld,hiddenPool}=require('./hidden-world');
const {cloneRoundState}=require('./round-driver');

const focalHand=[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,2],[1,3]];
const knownTiles=[[1,1]];
const unseen=hiddenPool({focalHand,knownTiles});
assert.equal(unseen.length,18);
const doubles=[[2,2],[3,3]];
for(const tile of doubles)assert(unseen.some(t=>e.tileKey(t)===e.tileKey(tile)));
const visibleState={
  branchState:e.createBranchState([1,1]),
  openingState:e.createOpeningState([1]),
  hands:[focalHand.map(t=>t.slice()),[],[]],
  stock:[],currentPlayer:0,consecutivePasses:0,turns:1,outcome:null
};
const spec={focalPlayer:0,focalHand,knownTiles,hiddenHandSizes:[9,9,9],stockSize:0,visibleState};
const before=JSON.stringify(spec);
const counts=[0,0,0],n=12000,seedStart=24000000;
for(let seed=seedStart;seed<seedStart+n;seed++){
  const world=sampleWorld(spec,seed);
  const keys=new Set(world.hands[1].map(e.tileKey));
  const held=doubles.filter(t=>keys.has(e.tileKey(t))).length;
  counts[held]++;
  if(seed===seedStart){
    const all=[...knownTiles,...world.hands.flat(),...world.stock].map(e.tileKey);
    assert.equal(all.length,28);
    assert.equal(new Set(all).size,28);
    assert.deepEqual(sampleWorld(spec,seed),world);
  }
}
assert.equal(JSON.stringify(spec),before,'sampler mutated visible inputs');
const expected=[4/17,9/17,4/17];
const observed=counts.map(x=>x/n);
const maxAbsoluteDeviation=Math.max(...observed.map((x,i)=>Math.abs(x-expected[i])));
// Broad deterministic regression band, not a statistical proof of RNG quality.
assert(maxAbsoluteDeviation<0.02,'hidden-world sampler deviates from exact allocation oracle');
console.log(JSON.stringify({schema:'qosha-hidden-world-empirical-oracle/v1',passed:true,
  rules:'recovered qosa-1.0.0 opening allocation only',engine:'qosha-research-0.5.3',
  seedStart,seedEnd:seedStart+n-1,worlds:n,strategies:[],
  nextSeatCounts:{zero:counts[0],one:counts[1],two:counts[2]},
  observed,expected,maxAbsoluteDeviation,
  limitation:'Synthetic visible hand; unconditional uniform hidden worlds, no pass history or opponent choice likelihood; no gameplay rounds.'},null,2));
