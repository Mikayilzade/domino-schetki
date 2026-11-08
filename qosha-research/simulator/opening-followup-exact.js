'use strict';
// Exact, rule-invariant combinatorics for the mandatory 1-1 starter's follow-up.
// The starter holds 1-1; their other eight tiles plus the one mandatory stock
// draw form a uniform 9-subset of the 27 remaining double-six tiles.
// Six of those 27 tiles touch 1; the other 21 do not.
const assert=require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x=x*(n-i+1)/i;return Math.round(x);}
const denominator=choose(27,9);
const counts=Array.from({length:7},(_,k)=>choose(6,k)*choose(21,9-k));
assert.equal(counts.reduce((a,b)=>a+b,0),denominator);
assert.equal(denominator,4686825);
const probabilities=counts.map(x=>x/denominator);
assert.ok(Math.abs(probabilities.reduce((a,b)=>a+b,0)-1)<1e-12);
// Independent dynamic-programming coefficient extraction.
const dp=Array.from({length:10},()=>Array(7).fill(0));dp[0][0]=1;
for(let tile=0;tile<27;tile++)for(let n=Math.min(tile+1,9);n>=1;n--)for(let k=6;k>=0;k--)if(k>=(tile<6?1:0))dp[n][k]+=dp[n-1][k-(tile<6?1:0)];
assert.deepEqual(dp[9],counts);
const result={schema:'qosha-opening-followup-exact/v1',rules:'qosa-1.0.0 confirmed 3x9 opening',method:'exact hypergeometric + independent dynamic-programming verification',deals:0,seedSet:null,strategies:[],population:27,successTiles:6,drawnTiles:9,counts,denominator,probabilities,atLeastTwo:probabilities.slice(2).reduce((a,b)=>a+b,0),zeroOrOne:probabilities[0]+probabilities[1],assumptions:['uniform 3x9+1 deal conditional on 1-1 in starter hand','mandatory single stock draw before follow-up','only count immediate tiles touching 1; no branch or opponent policy modeled'],limitations:['counts candidate tiles, not actual game win rates','no runtime validation of full round engine']};
console.log(JSON.stringify(result,null,2));
