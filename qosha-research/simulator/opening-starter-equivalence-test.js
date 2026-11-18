'use strict';
// Qoşa açdı exact opening regression; Asia/Baku 2026-11-18 05:51.
// Engine reference qosha-research-0.5.3; rules recovered qosa-1.0.0.
// 0 sampled deals; exact enumeration of 4,686,825 possible 9-subsets.
// No strategy policy or seeds; this is NOT a full-engine validation.
// Assumptions: independent uniform shuffle, prior winner independent of new deal.
// First-round 1-1 owner + one stock draw and later-round prior winner who
// retrieves stock 1-1 both hold uniform 9-subsets of the 27 non-1-1 tiles.
// Of these 27 tiles, six touch 1 and 21 do not.
const assert = require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-k+i)/i;return Math.round(v);}
const denominator=choose(27,9);
const counts=Array.from({length:7},(_,k)=>choose(6,k)*choose(21,9-k));
assert.equal(denominator,4686825);
assert.equal(counts.reduce((a,b)=>a+b,0),denominator);
const noFollow=counts[0]/denominator;
assert.ok(Math.abs(noFollow-0.06271409749670619)<1e-14);
const mean=counts.reduce((s,n,k)=>s+n*k,0)/denominator;
assert.equal(mean,2);
console.log(JSON.stringify({
 timestampAsiaBaku:'2026-11-18T05:51:51+04:00',
 engine:'qosha-research-0.5.3 (reference only; not executed)',
 rules:'recovered qosa-1.0.0; branch/block/loneZero provisional',
 oracle:'opening-starter-equivalence/v1',
 deals:0, seeds:null, strategies:[],
 exactNineSubsets:denominator, oneTileCounts:counts,
 noFollowProbability:noFollow, meanPlayableOneTiles:mean,
 finding:'Opening follow-up 1-tile count distribution is identical in the two starter paths under independent uniform shuffling.',
 confidence:'exact combinatorial conditional on stated assumptions; no gameplay strategy claim',
 limitations:'does not validate legal branches, full simulator, winner dependence across rounds, or outcomes',
 next:'reconstruct executable research-only checkout; run 17 gameplay and 4 hidden-world suites, then paired strategy tests'
},null,2));
