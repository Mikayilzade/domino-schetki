#!/usr/bin/env node
'use strict';
// Independent exhaustive 21-choose-9 check for the forced-pass starter oracle.
// Does not depend on simulator rules or the oracle's choose() implementation.
const assert = require('node:assert/strict');
const counts = Array(7).fill(0);
let combinations = 0;
function visit(start, left, doubles) {
  if (left === 0) { counts[doubles]++; combinations++; return; }
  for (let i = start; i <= 21-left; i++) visit(i+1,left-1,doubles+(i<6?1:0));
}
visit(0,9,0);
assert.equal(combinations,293930);
assert.deepEqual(counts,[5005,38610,96525,100100,45045,8190,455]);
assert.equal(counts.reduce((a,b)=>a+b,0),combinations);
const p = counts.slice(3).reduce((a,b)=>a+b,0)/combinations;
assert.ok(Math.abs(p-153790/293930)<1e-14);
console.log(JSON.stringify({schema:'qosha-forced-pass-oracle-independent-check/v1',method:'exhaustive 21 choose 9 subsets',checked:combinations,counts,atLeastThree:p,passed:true}));
