#!/usr/bin/env node
'use strict';
// Exact hand-composition oracle, NOT a gameplay simulator.
// Condition: 3x9, starter owns and plays 1-1, draws the stock tile,
// and has no ordinary 1-x connector among the nine remaining tiles.
// Under a uniform shuffle, the nine remaining tiles are a uniform
// 9-subset of the 21 tiles excluding 1-1 and six ordinary 1-x connectors.
// Six of those 21 tiles are doubles (0-0, 2-2, ..., 6-6).
const assert=require('node:assert/strict');
function choose(n,k) {
  if(k<0||k>n)return 0;
  let v=1;
  for(let i=1;i<=k;i++)v=v*(n-i+1)/i;
  return Math.round(v);
}
const denominator=choose(21,9);
const counts=Array.from({length:7},(_,k)=>choose(6,k)*choose(15,9-k));
assert.equal(denominator,293930);
assert.deepEqual(counts,[5005,38610,96525,100100,45045,8190,455]);
assert.equal(counts.reduce((a,b)=>a+b,0),denominator);
const atLeastThree=counts.slice(3).reduce((a,b)=>a+b,0);
const report={
  schema:'qosha-opening-forced-pass-doubles/v1',
  rules:'qosa-1.0.0',
  mode:'3x9+1',
  conditioning:'starter owns/plays 1-1, draws stock, and holds zero ordinary 1-x connectors afterward',
  remainingHandSize:9,eligiblePool:21,eligibleDoubles:6,
  denominator,countsByDoubles:counts,
  probabilityAtLeastThree:atLeastThree/denominator,
  meanDoubles:counts.reduce((s,n,k)=>s+k*n,0)/denominator,
  limitation:'uniform-shuffle exact hand support only; no branch/turn/finish or strategy inference'
};
process.stdout.write(JSON.stringify(report,null,2)+'\n');
