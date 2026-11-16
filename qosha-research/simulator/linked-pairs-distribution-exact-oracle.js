'use strict';
// Exact inventory-only linked-double distribution after mandatory 1-1 opening draw.
// No gameplay engine assumptions. Conditional on starter owning 1-1.
// Nine tiles uniformly sampled from 27, six disjoint candidate pairs:
// (1-x,x-x) for x=0,2,3,4,5,6.
const assert=require('node:assert/strict');
const choose=(n,k)=>{if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-k+i)/i;return v;};
const falling=(n,k)=>{let v=1;for(let i=0;i<k;i++)v*=n-i;return v;};
const maxPairs=4;
const binomialMoments=Array.from({length:maxPairs+1},(_,k)=>choose(6,k)*falling(9,2*k)/falling(27,2*k));
const probability=Array.from({length:maxPairs+1},(_,j)=>
  Array.from({length:maxPairs-j+1},(_,k)=>(k%2?-1:1)*choose(j+k,j)*binomialMoments[j+k])
  .reduce((a,b)=>a+b,0));
const mean=probability.reduce((s,p,j)=>s+j*p,0);
const atLeastTwo=probability.slice(2).reduce((a,b)=>a+b,0);
assert.ok(Math.abs(probability.reduce((a,b)=>a+b,0)-1)<1e-12);
assert.ok(probability.every(p=>p>=0&&p<=1));
assert.ok(Math.abs(mean-6*9*8/(27*26))<1e-12);
assert.ok(Math.abs(1-probability[0]-0.5133069828722003)<1e-12);

// Independent exhaustive weighted enumeration of the 12 pair-candidate tiles.
// Remaining 15 tiles are exchangeable; weight each 12-bit selection by C(15,9-bits).
// This checks all C(27,9)=4,686,825 hands without enumerating each one.
const counts=Array(5).fill(0); let total=0;
for(let mask=0;mask<(1<<12);mask++){
  let bits=0,pairs=0;
  for(let i=0;i<12;i++) bits+=(mask>>i)&1;
  for(let i=0;i<6;i++) if(((mask>>(2*i))&3)===3) pairs++;
  const weight=choose(15,9-bits);
  counts[pairs]+=weight; total+=weight;
}
assert.equal(total,choose(27,9));
const enumerated=counts.map(c=>c/total);
for(let i=0;i<=4;i++) assert.ok(Math.abs(enumerated[i]-probability[i])<1e-12,`count ${i}`);

console.log(JSON.stringify({schema:'qosha-linked-pairs-exact/v1',passed:true,engine:'independent-combinatorics',rules:'qosa-1.0.0 opening inventory',deals:0,seeds:null,strategies:[],probability,enumerated,enumeratedHands:total,atLeastOne:1-probability[0],atLeastTwo,mean,limitation:'Inventory, not legal sequences or winning chance; no gameplay suites validated'},null,2));
