'use strict';
// 2026-11-23 09:52 Asia/Baku | qosa-1.0.0 opening-only exact oracle
// Engine reference qosha-research-0.5.3; no full-game validation.
// Deterministic exhaustive 3-category hand/draw count, no random seeds.
// Node v22.16.0 executed: PASS; 42,181,425 hand/draw pairs,
// 2,645,370 forced-pass pairs; probability 0.06271409749670619.
// Strategy rounds=0, hidden worlds=0, rollouts=0; strategies=none.
// 17 gameplay suites and 4 hidden-world suites NOT executed.
// Historical 180,000 matched-seat rounds remain separate.
// Finding: conditional on forced pass, 2 or 3 other initial doubles
// account for 66.4087% of events. Descriptive, not causal or strategic.
// Limitations: opening-only; assumes uniformly shuffled 28 tiles,
// starter holds 1-1, mandatory one-tile draw, no initial connector.
// Next: SHA-verified full research checkout; run 17+4 suites,
// then matched-seed strategy comparisons and regret.
const assert=require('node:assert/strict');
const choose=(n,k)=>{if(k<0||k>n)return 0;let z=1;for(let j=1;j<=k;j++)z=z*(n-j+1)/j;return Math.round(z)};
const N=choose(27,8)*19;
let pass=0;const byK=[];
for(let k=0;k<=6;k++){
 let all=0,passes=0;
 for(let c=0;c<=6;c++){
  const other=8-k-c;
  const hands=choose(6,k)*choose(6,c)*choose(15,other);
  all+=hands*19;
  if(c===0)passes+=hands*13;
 }
 byK.push({k,hands:all/19,passes,passRate:passes/all});
 pass+=passes;
}
assert.equal(byK.reduce((a,x)=>a+x.hands,0),choose(27,8));
assert.equal(pass,choose(21,9)*9);
assert.ok(Math.abs(pass/N-choose(21,9)/choose(27,9))<1e-12);
console.log(JSON.stringify({test:'opening-pass-independent-3-category-enumeration/v1',passed:true,handDrawPairs:N,passPairs:pass,passProbability:pass/N,conditionalK:byK.map(x=>({k:x.k,shareOfPasses:x.passes/pass}))},null,2));
