// Standalone exact opening-pass conditional distribution; no engine imports.
// qosa-1.0.0 3x9+1, uniform unordered deal, mandatory 1-1 opener.
// Condition: starter's eight other tiles and the one stock tile have no 1.
// Remaining 18 tiles: six 1-x tiles and twelve non-1 tiles; next seat gets nine.
// This is availability, NOT legal-turn, opponent-choice, or winning probability.
'use strict';
const assert = require('node:assert/strict');
function choose(n,k) {
  if (k<0 || k>n) return 0;
  k=Math.min(k,n-k);
  let v=1;
  for(let i=1;i<=k;i++) v=v*(n-k+i)/i;
  return Math.round(v);
}
const denominator=choose(18,9);
const counts=Array.from({length:7},(_,k)=>choose(6,k)*choose(12,9-k));
assert.equal(counts.reduce((a,b)=>a+b,0),denominator);
assert.equal(denominator,48620);
assert.equal(counts[0],220);
assert.equal(counts[1],2970);
const probabilityAtLeast=(k)=>counts.slice(k).reduce((a,b)=>a+b,0)/denominator;
assert.ok(Math.abs(probabilityAtLeast(1)-0.995475113122172)<1e-12);
assert.ok(Math.abs(probabilityAtLeast(2)-0.9343891402714932)<1e-12);
console.log(JSON.stringify({rules:'qosa-1.0.0',engine:'standalone-exact-hypergeometric-v1',condition:'starter passed after 1-1 and stock draw; stock non-1',denominator,counts,probabilityAtLeast3:probabilityAtLeast(3),probabilityAtLeast4:probabilityAtLeast(4)},null,2));
