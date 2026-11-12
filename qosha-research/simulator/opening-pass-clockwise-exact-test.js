'use strict';
// Exact combinatorial oracle for clockwise opponent after forced 1-1 opening pass.
// No gameplay engine dependency. Uniform 3x9+1 deal, hand-owned 1-1,
// mandatory stock draw, and starter's remaining nine tiles contain no 1.
const assert = require('node:assert/strict');
function choose(n,k) {
  if (!Number.isInteger(n)||!Number.isInteger(k)||k<0||k>n) return 0;
  let v=1;
  for(let i=1;i<=k;i++) v=v*(n-i+1)/i;
  return Math.round(v);
}
const denom=choose(18,9);
const counts=Array.from({length:7},(_,k)=>choose(6,k)*choose(12,9-k));
assert.equal(denom,48620);
assert.deepEqual(counts,[220,2970,11880,18480,11880,2970,220]);
assert.equal(counts.reduce((a,b)=>a+b,0),denom);
assert.equal(counts.reduce((a,c,k)=>a+k*c,0),3*denom);
for(let k=0;k<=6;k++) assert.equal(counts[k],counts[6-k]);
const atLeastOne=1-counts[0]/denom;
const atLeastTwo=counts.slice(2).reduce((a,b)=>a+b,0)/denom;
const bothAtLeastTwo=counts.slice(2,5).reduce((a,b)=>a+b,0)/denom;
const bothHaveOne=1-(counts[0]+counts[6])/denom;
assert.equal(atLeastOne,220/221);
assert.equal(atLeastTwo,1-29/442);
assert.equal(bothAtLeastTwo,192/221);
assert.equal(bothHaveOne,219/221);
console.log(JSON.stringify({schema:'qosha-opening-pass-clockwise-oracle/v1',passed:true,deals:0,engine:'independent-exact-oracle',rules:'qosa-1.0.0-opening',conditioning:'hand-owned 1-1; stock drawn; starter has no other 1',denominator:denom,counts,atLeastOne,atLeastTwo,bothAtLeastTwo,bothHaveOne,mean:3}));
