'use strict';
// Exact post-opening joint distribution of remaining doubles D and 1-touching tiles K.
// 27 other tiles: 6 doubles, 6 1-touching non-doubles, 15 others.
const assert=require('node:assert/strict');
function C(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v)}
const owned=Array.from({length:7},()=>Array(7).fill(0));
const stock=Array.from({length:7},()=>Array(7).fill(0));
for(let d=0;d<=6;d++)for(let k=0;k<=6;k++){
 stock[d][k]=C(6,d)*C(6,k)*C(15,9-d-k);
 for(let rd=0;rd<=6;rd++)for(let rk=0;rk<=6;rk++){
  const hands=C(6,rd)*C(6,rk)*C(15,8-rd-rk);
  if(!hands)continue;
  if(d===rd&&k===rk)owned[d][k]+=hands*(15-(8-rd-rk));
  if(d===rd+1&&k===rk)owned[d][k]+=hands*(6-rd);
  if(d===rd&&k===rk+1)owned[d][k]+=hands*(6-rk);
 }
 assert.equal(owned[d][k],9*stock[d][k],`D=${d}, K=${k}`);
}
const total=C(27,9), ownedTotal=C(27,8)*19;
assert.equal(total,4686825);assert.equal(ownedTotal,9*total);
assert.equal(stock.flat().reduce((a,b)=>a+b,0),total);
assert.equal(owned.flat().reduce((a,b)=>a+b,0),ownedTotal);
const kCounts=Array.from({length:7},(_,k)=>stock.reduce((s,row)=>s+row[k],0));
const dCounts=stock.map(row=>row.reduce((a,b)=>a+b,0));
const conditionalMeanD=kCounts.map((n,k)=>n?stock.reduce((s,row,d)=>s+d*row[k],0)/n:null);
const meanD=dCounts.reduce((s,n,d)=>s+d*n,0)/total;
assert.equal(meanD,2);
console.log(JSON.stringify({schema:'qosha-opening-joint-exact-oracle/v1',passed:true,engine:'exact-combinatorics-only',rules:'qosa-1.0.0 3x9+1; fixed previous winner independent of current deal',gameplayDeals:0,seeds:null,strategies:[],ownedAllocations:ownedTotal,stockAllocations:total,stockJointCounts:stock,postOpeningDoubleCounts:dCounts,followupCounts:kCounts,meanPostOpeningDoubles:meanD,meanPostOpeningDoublesGivenFollowupCount:conditionalMeanD,identity:'owned[D,K] = 9 * stock[D,K] for all D,K',limitations:'Opening-only marginal identity; not equivalent full-round gameplay or causal double value'},null,2));
