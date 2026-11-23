'use strict';
// Exact, self-contained opening-pass oracle; no gameplay engine dependency.
// Condition: starter holds 1-1, has no other 1 tile among 8 initial stones,
// and the mandatory stock draw also has no 1 tile. Thus the six remaining
// 1-x connectors are all among the opponents' 18 stones (9 each).
const assert=require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x=x*(n-i+1)/i;return Math.round(x);}
const denominator=choose(18,9);
const counts=Array.from({length:7},(_,k)=>choose(6,k)*choose(12,9-k));
assert.equal(denominator,48620);
assert.equal(counts.reduce((a,b)=>a+b,0),denominator);
assert.deepEqual(counts,[220,2970,11880,18480,11880,2970,220]);
for(let k=0;k<=6;k++)assert.equal(counts[k],counts[6-k]);
const bothAtLeastTwo=counts.slice(2,5).reduce((a,b)=>a+b,0)/denominator;
const exactlyThreeEach=counts[3]/denominator;
const oneOpponentAtMostOne=1-bothAtLeastTwo;
assert.equal(bothAtLeastTwo,42240/48620);
assert.equal(exactlyThreeEach,18480/48620);
console.log(JSON.stringify({schema:'qosha-opening-pass-opponent-balance/v1',
 engine:'exact-combinatorics/no-gameplay-engine',rules:'recovered qosa-1.0.0 opening only',
 deals:0,enumeratedSeatAllocations:denominator,seedSet:'none (exact enumeration)',
 strategies:[],countsByNextSeatOneConnectors:counts,
 bothOpponentsAtLeastTwo:bothAtLeastTwo,exactlyThreeEach,
 atLeastOneOpponentAtMostOne:oneOpponentAtMostOne,passed:true,
 limitations:'Uniform random allocations conditioned on starter having no 1 connector after mandatory stock draw; not a gameplay or policy outcome.'},null,2));
