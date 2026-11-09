'use strict';
// Exact joint distribution of legal 1-x followups (K) and matching own x-x doubles (B).
// No gameplay/branch interpretation is assumed.
// Run: node qosha-research/simulator/opening-k-b-joint-regression.js
const assert=require('node:assert/strict');
function C(n,k){if(k<0||k>n)return 0n;k=Math.min(k,n-k);let v=1n;for(let i=1;i<=k;i++)v=v*BigInt(n-k+i)/BigInt(i);return v;}
const D=C(27,9),rows=[];let total=0n,atLeastTwo=0n,oneBackedChoice=0n,atLeastTwoBacked=0n;
for(let k=0;k<=6;k++){
 for(let b=0;b<=k;b++){
  // Select k of six connectors 1-x; among the remaining 21 tiles
  // k are their matching x-x doubles, the other 21-k are not.
  const n=C(6,k)*C(k,b)*C(21-k,9-k-b);
  rows.push({k,b,count:n.toString(),probability:Number(n)/Number(D)});
  total+=n;
  if(k>=2){atLeastTwo+=n;if(b===1)oneBackedChoice+=n;}
  if(b>=2)atLeastTwoBacked+=n;
 }
}
assert.equal(total,D);
assert.equal(atLeastTwo,rows.filter(r=>r.k>=2).reduce((s,r)=>s+BigInt(r.count),0n));
assert.equal(rows.filter(r=>r.k===2&&r.b===2).reduce((s,r)=>s+BigInt(r.count),0n),C(6,2)*C(19,5));
const result={schema:'qosha-opening-k-b-joint/v1',passed:true,engine:'exact-combinatorial-oracle-1',rules:'recovered qosa-1.0.0 opening only; uniform 3x9+1 shuffle',deals:0,seedSet:null,strategies:[],denominator:D.toString(),metrics:{multipleChoices:Number(atLeastTwo)/Number(D),exactlyOneBackedAmongMultiple:Number(oneBackedChoice)/Number(D),twoOrMoreBacked:Number(atLeastTwoBacked)/Number(D),twoOrMoreBackedGivenMultiple:Number(atLeastTwoBacked)/Number(atLeastTwo)},joint:rows,limitations:['Not a game simulation, move-value comparison or full-engine validation.','Previous-winner selection must be independent of deal in stock-owned 1-1 mode.','Double backing does not imply move strength or immediate double play.'],next:'Validate full engine; matched hidden-world continuations stratified by K and B.'};
console.log(JSON.stringify(result,null,2));
