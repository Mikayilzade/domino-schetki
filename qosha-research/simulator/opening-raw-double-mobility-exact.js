'use strict';
// Exact opening follow-up count K by RAW starting double count D.
// Uniform 3x9+1 deals conditional on starter holding 1-1.
// No branch, scoring, or continuation assumptions. Zero gameplay rounds.
const assert=require('node:assert/strict');
const C=(n,k)=>{if(k<0||k>n)return 0;let a=1;for(let i=1;i<=k;i++)a=a*(n-i+1)/i;return Math.round(a)};
const denominator=C(27,8)*19;
let grand=0;const rows=[];
for(let d=0;d<=6;d++){
 const total=C(6,d)*C(21,8-d)*19;
 const counts=Array(7).fill(0);
 for(let r=0;r<=6;r++){
  const hands=C(6,d)*C(6,r)*C(15,8-d-r);
  counts[r]+=hands*(13+r); // stock not 1-touching: 19-(6-r)
  if(r<6)counts[r+1]+=hands*(6-r);
 }
 assert.equal(counts.reduce((a,b)=>a+b,0),total);
 rows.push({rawStartingDoubles:d+1,allocations:total,followupCountProbabilities:counts.map(x=>x/total),
  forcedPassPct:100*counts[0]/total,exactlyOnePct:100*counts[1]/total,atLeastTwoPct:100*counts.slice(2).reduce((a,b)=>a+b,0)/total});
 grand+=total;
}
assert.equal(grand,denominator);
const pass=rows.reduce((s,r)=>s+r.allocations*r.followupCountProbabilities[0],0);
assert.equal(Math.round(pass),9*C(21,9));
console.log(JSON.stringify({schema:'qosha-opening-raw-double-mobility/v1',engine:'combinatorial-only',rules:'qosa-1.0.0 3x9+1 opening',deals:0,seeds:null,strategies:[],denominator,rows},null,2));
