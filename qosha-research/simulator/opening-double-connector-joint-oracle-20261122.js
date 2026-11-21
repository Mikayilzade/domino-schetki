#!/usr/bin/env node
'use strict';
// Exact opening combinatorics for qosa-1.0.0 3x9+1, conditional on starter holding 1-1.
// After placing 1-1 and drawing the single stock stone, the starter holds
// a uniformly random 9-subset of the other 27 tiles.
// Six are 1-x connectors (x != 1), six are other doubles, fifteen are neither.
// This oracle does not model branch legality, multi-double play, or opponents.
const assert = require('node:assert/strict');
function choose(n,k) {
  if (k<0 || k>n) return 0;
  let v=1;
  for(let i=1;i<=k;i++) v=v*(n-i+1)/i;
  return Math.round(v);
}
const denominator=choose(27,9);
const joint=Array.from({length:7},(_,d)=>
  Array.from({length:7},(_,c)=>choose(6,d)*choose(6,c)*choose(15,9-d-c)));
const sum=(predicate)=>joint.reduce((a,row,d)=>a+row.reduce((b,count,c)=>b+(predicate(d,c)?count:0),0),0);
assert.equal(joint.flat().reduce((a,b)=>a+b,0),denominator);
assert.equal(sum((d,c)=>c===0),choose(21,9));
assert.equal(sum((d,c)=>d>=2&&c>=1),2921640);
const output={
  schema:'qosha-opening-joint-exact/v1',
  engineReference:'qosha-research-0.5.3',
  rulesReference:'qosa-1.0.0',
  condition:'starter owns 1-1, places it, draws one stock tile',
  totalEquallyLikelyHands:denominator,
  categories:{otherDoubles:6,ordinaryOneConnectors:6,otherTiles:15,drawnHandSize:9},
  events:{
    atLeastTwoOtherDoublesAndAtLeastOneConnector:{count:sum((d,c)=>d>=2&&c>=1),probability:sum((d,c)=>d>=2&&c>=1)/denominator},
    atLeastTwoOtherDoubles:{count:sum((d,c)=>d>=2),probability:sum((d,c)=>d>=2)/denominator},
    noOrdinaryOneConnector:{count:sum((d,c)=>c===0),probability:sum((d,c)=>c===0)/denominator}
  },
  jointCountsByDoubleCountThenConnectorCount:joint,
  limitations:'Exact opening hand counts only; connectors do not guarantee branch legality under unresolved branch-unlock rules; not a strategy win-rate.'
};
process.stdout.write(JSON.stringify(output,null,2)+'\n');
