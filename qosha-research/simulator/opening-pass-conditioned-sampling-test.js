'use strict';
// Independent Monte Carlo check of exact clockwise pip-1 support after a forced opening pass.
// This is NOT a gameplay-engine validation or a strategy simulation.
const assert = require('node:assert/strict');
const seedStart = 26000000;
const samples = 100000;
function choose(n,k){if(k<0||k>n)return 0;let a=1;for(let i=1;i<=k;i++)a=a*(n-i+1)/i;return Math.round(a)}
const exact=Array.from({length:7},(_,k)=>choose(6,k)*choose(12,9-k)/choose(18,9));
function random(seed){let s=(seed^0x9e3779b9)>>>0;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296}}
const histogram=Array(7).fill(0);
for(let seed=seedStart;seed<seedStart+samples;seed++){
  const rng=random(seed), a=Array.from({length:18},(_,i)=>i<6?1:0);
  for(let i=17;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  histogram[a.slice(0,9).reduce((x,y)=>x+y,0)]++;
}
const maxDeviation=Math.max(...histogram.map((n,k)=>Math.abs(n/samples-exact[k])));
assert.equal(histogram.reduce((a,b)=>a+b,0),samples);
assert.ok(maxDeviation<0.012,`unexpected conditioned allocation deviation: ${maxDeviation}`);
console.log(JSON.stringify({schema:'qosha-opening-pass-conditioned-sampling/v1',passed:true,engine:'independent-allocation-oracle',rules:'qosa-1.0.0 opening only',samples,seedRange:[seedStart,seedStart+samples-1],histogram,exact,maxDeviation,strategies:[],gameplayDeals:0}));
