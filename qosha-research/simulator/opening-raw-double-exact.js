'use strict';
// Exact opening follow-up distribution conditional on PRE-DRAW doubles.
// Starter holds 1-1; eight other hand tiles from 27, then one of 19 stock tiles.
const assert = require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x*(n-i+1)/i;return Math.round(x);}
const denominator=choose(27,8)*19;
const rows=[];let grand=0;
for(let d=0;d<=6;d++){
 const counts=Array(8).fill(0);
 for(let k=0;k<=6;k++){
  const handWays=choose(6,d)*choose(6,k)*choose(15,8-d-k);
  if(!handWays)continue;
  counts[k]+=handWays*(19-(6-k));
  counts[k+1]+=handWays*(6-k);
 }
 const total=counts.reduce((a,b)=>a+b,0);
 assert.equal(total,choose(6,d)*choose(21,8-d)*19);
 assert.equal(counts[0],choose(6,d)*choose(15,8-d)*13);
 grand+=total;
 rows.push({rawStartingDoubles:d+1,allocations:total,passPct:100*counts[0]/total,atLeastTwoPct:100*counts.slice(2).reduce((a,b)=>a+b,0)/total,followupCounts:counts});
}
assert.equal(grand,denominator);
const all=Array(8).fill(0);for(const r of rows)r.followupCounts.forEach((v,i)=>all[i]+=v);
assert.equal(all.reduce((a,b)=>a+b,0),denominator);
assert.equal(all[0],choose(21,9)*9);
console.log(JSON.stringify({model:'uniform 3x9+1, starter owns 1-1; raw pre-draw doubles',denominator,rows,unconditionalPassPct:100*all[0]/denominator},null,2));
