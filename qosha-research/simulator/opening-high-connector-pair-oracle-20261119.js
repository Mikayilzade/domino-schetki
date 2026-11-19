'use strict';
// Exact conditional opening availability, independent of gameplay engine.
// Given starter holds 1-1, draws the only stock and has no 1-x connector,
// all six 1-x tiles are among 18 opponent tiles; next seat receives 9.
function choose(n,k){if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x=x*(n-k+i)/i;return Math.round(x);}
const denominator=choose(18,9);
const neither=choose(16,9)/denominator;
const both=choose(16,7)/denominator;
const either=1-neither;
const exactlyOne=either-both;
// Independent exhaustive 18-choose-9 subset enumeration, not a second
// rearrangement of the same hypergeometric identity.
const counts=[0,0,0];
let enumerated=0;
function visit(start,left,mask){
  if(left===0){
    const n=Number(Boolean(mask&1))+Number(Boolean(mask&2));
    counts[n]++;enumerated++;return;
  }
  for(let i=start;i<=18-left;i++)visit(i+1,left-1,mask|(i<2?(1<<i):0));
}
visit(0,9,0);
if(enumerated!==denominator ||
   counts[0]!==choose(16,9) ||
   counts[1]!==2*choose(16,8) ||
   counts[2]!==choose(16,7))
  throw new Error('Independent opening connector exhaustive enumeration mismatch');
if(denominator!==48620||Math.abs(either-13/17)>1e-12||
   Math.abs(both-4/17)>1e-12||Math.abs(exactlyOne-9/17)>1e-12)
  throw new Error('Opening connector pair exact identity failed');
console.log(JSON.stringify({schema:'qosha-opening-high-connector-pair/v1',
  conditioning:'starter holds 1-1, draws stock, no ordinary 1-x remains',
  targetTiles:['1-5','1-6'],denominator,exhaustiveSubsetCounts:counts,
  probabilities:{neither,both,exactlyOne,either},
  limitations:'Exact uniform 9-of-18 combinatorics only; not a strategy or engine validation.'},null,2));
