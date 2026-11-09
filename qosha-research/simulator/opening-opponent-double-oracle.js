'use strict';
// Exact hidden-world ownership oracle after mandatory 1-1 opening and stock draw.
// The starter holds 9 tiles; each opponent holds 9 of the remaining 18.
// No branch/score rules or simulated games are used.
// Run: node qosha-research/simulator/opening-opponent-double-oracle.js
const assert=require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0n;let v=1n;k=Math.min(k,n-k);for(let i=1;i<=k;i++)v=v*BigInt(n-k+i)/BigInt(i);return v;}
const denominator=choose(18,9);
function countNextOwns(j,r){return choose(r,j)*choose(18-r,9-j);}
const one=[countNextOwns(0,1),countNextOwns(1,1)];
const two=[countNextOwns(0,2),countNextOwns(1,2),countNextOwns(2,2)];
assert.equal(one.reduce((a,b)=>a+b,0n),denominator);
assert.equal(two.reduce((a,b)=>a+b,0n),denominator);
assert.equal(one[0],one[1]);
assert.equal(two[0],two[2]);
assert.equal(two[0]*17n,denominator*4n);
assert.equal(two[1]*17n,denominator*9n);
const report={
 schema:'qosha-opening-opponent-double-oracle/v1',passed:true,
 engine:'exact-combinatorial-oracle-1',rules:'recovered qosa-1.0.0 opening only; uniform hidden allocation',
 deals:0,seedSet:null,strategies:[],
 conditioning:'After 1-1 is placed and stock is drawn, starter holds 9 and opponents hold 9 each; one or two specified matching doubles are absent from starter hand.',
 hiddenWorldCount:denominator.toString(),
 metrics:{
  oneExternalDoubleNextSeatProbability:Number(one[1])/Number(denominator),
  twoExternalDoublesNextSeatCountProbabilities:two.map(n=>Number(n)/Number(denominator)),
  twoExternalDoublesTogetherProbability:Number(two[0]+two[2])/Number(denominator),
  twoExternalDoublesSplitProbability:Number(two[1])/Number(denominator)
 },
 exactNumerators:{one:one.map(String),two:two.map(String),denominator:String(denominator)},
 limitations:['Unconditional uniform allocation of opponent hands; observed pass/play history changes the posterior.','Ownership does not imply immediate legal play, strategic value, or physical branch-rule validation.','Not a gameplay simulation or one of the 17 full-engine validation suites.'],
 next:'Use this exact oracle to unit-test the hidden-world sampler, then validate full engine and compare backed vs unbacked K=2/B=1 opening choices on matched worlds.'
};
console.log(JSON.stringify(report,null,2));
