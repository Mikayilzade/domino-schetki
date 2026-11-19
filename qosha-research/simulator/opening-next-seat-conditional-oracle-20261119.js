'use strict';
// Exact conditional distribution: starter holds 1-1, has no other 1 after mandatory stock draw.
// All six remaining 1-x connectors are therefore in the 18 opponent tiles.
// Next player holds 9 uniformly sampled tiles from those 18.
const assert=require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x=x*(n-i+1)/i;return Math.round(x);}
const denominator=choose(18,9);
const counts=Array.from({length:7},(_,k)=>choose(6,k)*choose(12,9-k));
assert.equal(counts.reduce((a,b)=>a+b,0),denominator);
assert.equal(counts[0],220);
assert.equal(denominator,48620);
const probabilities=counts.map(n=>n/denominator);
const report={schema:'qosha-opening-next-seat/v1',assumptions:['uniform 3x9+1 deal','starter owns 1-1','starter has no other 1-x after mandatory stock draw','six other 1-x tiles distributed among two opponents'],population:18,nextSeatHand:9,connectors:6,counts,denominator,probabilities,probabilityNextPass:probabilities[0],probabilityNextHasAtLeastTwo:1-probabilities[0]-probabilities[1]};
if(require.main===module)console.log(JSON.stringify(report,null,2));
module.exports={report};
