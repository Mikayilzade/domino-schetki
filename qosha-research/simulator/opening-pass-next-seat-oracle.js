'use strict';
// Exact conditional oracle for the 3x9+1 opening-pass edge.
// Condition: 1-1 starter has no other pip-1 tile after taking stock.
// Therefore six remaining pip-1 tiles are among the two 9-tile opponent hands.
// This is a uniform-allocation mathematical oracle, not a gameplay simulator.
const assert = require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);}
const denominator=choose(18,9);
const counts=Array.from({length:7},(_,k)=>choose(6,k)*choose(12,9-k));
assert.equal(denominator,48620);
assert.deepEqual(counts,[220,2970,11880,18480,11880,2970,220]);
assert.equal(counts.reduce((a,b)=>a+b,0),denominator);
assert.equal(counts.reduce((a,v,k)=>a+k*v,0),3*denominator);
const p=counts.map(n=>n/denominator);
assert.ok(Math.abs(p[0]-1/221)<1e-14);
assert.ok(Math.abs(p[2]+p[3]+p[4]-192/221)<1e-14);
console.log(JSON.stringify({oracle:'opening-pass-next-seat-one-count',rules:'qosa-1.0.0',engine:'exact-hypergeometric-v1',gameplayDeals:0,seedSet:null,assumptions:['uniform 3x9+1 allocation','starter has 1-1, no other pip-1 after drawing stock','next seat holds nine of eighteen remaining tiles'],denominator,counts,probabilities:p,nextSeatAtLeastOne:1-p[0],nextSeatAtLeastTwo:1-p[0]-p[1],bothOpponentsAtLeastTwo:p[2]+p[3]+p[4]}));
