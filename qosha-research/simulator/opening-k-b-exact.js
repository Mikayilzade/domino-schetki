'use strict';
// Exact opening oracle; run: node qosha-research/simulator/opening-k-b-exact.js
// 2026-11-09 15:51 Asia/Baku checkpoint. Recovered qosa-1.0.0 opening only.
// 0 gameplay deals; seed none; strategies none. Branch/block/loneZero not assumed.
// Result: P(K>=2,B>=1)=0.4140670923279619; P(B>=1|K>=2)=0.611818263499955.
// K = held 1-x connectors after compulsory 1-1 opening and stock consumption.
// B = connectors whose matching x-x double is also in starter hand.
// Confidence: exact for uniformly shuffled double-six, 9-subset of 27 remaining.
// No first-place, pips, block, minus, or regret measurements; engine gate still 0/17.
// Historical 180,000 strategy rounds remain separate.
// Next: execute 17-suite gate on runnable checkout; then matched-world K/B-stratified
// opening policy rollouts with explicit branch assumptions and regret metrics.
const assert = require('node:assert/strict');
function choose(n,k) {
  if(k<0||k>n)return 0;
  let r=1;
  for(let i=1;i<=Math.min(k,n-k);i++)r=r*(n-i+1)/i;
  return Math.round(r);
}
const denominator=choose(27,9), cells=[];
let total=0, multi=0, supported=0;
for(let k=0;k<=6;k++){
  const row=[];
  for(let b=0;b<=k;b++){
    const count=choose(6,k)*choose(k,b)*choose(21-k,9-k-b);
    row.push(count);total+=count;
    if(k>=2){multi+=count;if(b>=1)supported+=count;}
  }
  cells.push(row);
}
assert.equal(total,denominator,'all 9-subsets must be partitioned');
assert.equal(cells[0][0],choose(21,9));
const row2=cells[2].reduce((a,b)=>a+b,0);
assert.equal(cells[2][0]/row2,13/30);
assert.equal(cells[2][1]/row2,14/30);
assert.equal(cells[2][2]/row2,3/30);
console.log(JSON.stringify({
  schema:'qosha-opening-k-b-exact/v1',timestampBaku:'2026-11-09 15:51 +04',
  engine:'exact-combinatorial-oracle/v1',rules:'qosa-1.0.0 opening only',
  dealsSimulated:0,seedSet:null,strategies:[],denominator,
  countsByKAndB:cells,probKAtLeast2:multi/denominator,
  probKAtLeast2AndBAtLeast1:supported/denominator,
  probBAtLeast1GivenKAtLeast2:supported/multi,
  validation:'exact integer conservation and K=2 references passed',
  assumptions:'uniform shuffle; post-opening 9-subset of 27; no informative opponent actions',
  limitations:'No full-round engine validation or strategy advantage established; gate 0/17'
},null,2));
