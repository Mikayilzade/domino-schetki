'use strict';
// Qoşa açdı: exact starter follow-up support after mandatory 1-1.
// Reproducible: node qosha-research/simulator/opening-starter-followup-exact-20261119.js
// Scope: uniform 3x9+1 deal conditional on 1-1 in starter's nine tiles.
// After laying 1-1 and taking the stock tile, starter holds 9 of the
// remaining 27 tiles, of which exactly six have a 1.
const assert = require('node:assert/strict');
function choose(n,k) {
  if(k<0||k>n)return 0n;
  k=Math.min(k,n-k);
  let v=1n;
  for(let i=1;i<=k;i++)v=v*BigInt(n-k+i)/BigInt(i);
  return v;
}
const denominator=choose(27,9);
const cells=Array.from({length:7},(_,k)=>({
  playableOneTiles:k,
  allocations:choose(6,k)*choose(21,9-k)
}));
assert.equal(cells.reduce((s,x)=>s+x.allocations,0n),denominator);
const pass=cells[0].allocations;
assert.equal(pass,293930n);
assert.equal(cells[2].allocations,1744200n);
const output={
  schema:'qosha-opening-starter-followup-exact/v1',
  engine:'standalone exact combinatorial oracle; no gameplay engine executed',
  rules:'recovered qosa-1.0.0, 3 players x 9 stones + 1 stock',
  checkpointBaku:'2026-11-19 07:50 +04:00',
  dealsSimulated:0,
  seedSet:'none; exhaustive combinatorial counts (not sampled)',
  strategies:[],
  denominator:String(denominator),
  distribution:cells.map(x=>({
    playableOneTiles:x.playableOneTiles,
    allocations:String(x.allocations),
    probability:Number(x.allocations)/Number(denominator)
  })),
  starterForcedPassProbability:Number(pass)/Number(denominator),
  starterHasAtLeastOneProbability:1-Number(pass)/Number(denominator),
  newFinding:'Starter has exactly two follow-up 1-tiles in 37.21496% of conditional opening deals; forced pass in 6.27141%.',
  confidence:'exact under uniform shuffle and conditional starter possession of 1-1; no branch/block assumptions required',
  limitations:'Not a strategy comparison. Stock 1-1 first-round redeals are excluded by conditioning. Historical numeric seeds are not reproduced.',
  validation:'self-contained Node assertions only; 0/17 full-engine and 0/4 hidden-world suites executed',
  historicalBaseline:'180000 matched-seat rounds separately; not included here',
  nextAction:'Restore full research-only checkout and run preflight + both validation gates before matched-seed policy experiments.'
};
console.log(JSON.stringify(output,null,2));
