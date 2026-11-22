#!/usr/bin/env node
'use strict';
// Independent exact posterior check for the confirmed 3x9 opening.
// Standalone: node qosha-research/simulator/opening-pass-double-posterior-20261123.js
// No gameplay kernel is validated by this oracle.
const assert=require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x=x*(n-i+1)/i;return Math.round(x)}
const rows=Array.from({length:7},(_,k)=>{
  const hands=choose(6,k)*choose(21,8-k);
  const forcedPass=choose(6,k)*choose(15,8-k)*13/19;
  return {k,hands,forcedPass};
});
const total=choose(27,8),pass=rows.reduce((s,r)=>s+r.forcedPass,0);
assert.equal(rows.reduce((s,r)=>s+r.hands,0),total);
assert.ok(Math.abs(pass/total-choose(21,9)/choose(27,9))<1e-12);
const result=rows.map(r=>({otherDoublesBeforeDraw:r.k,
 prior:r.hands/total,passGivenK:r.forcedPass/r.hands,
 posteriorKGivenPass:r.forcedPass/pass}));
const prior4=rows.filter(r=>r.k>=4).reduce((s,r)=>s+r.hands,0)/total;
const posterior4=rows.filter(r=>r.k>=4).reduce((s,r)=>s+r.forcedPass,0)/pass;
const posterior23=rows.filter(r=>r.k===2||r.k===3).reduce((s,r)=>s+r.forcedPass,0)/pass;
assert.ok(posterior4>prior4);
assert.ok(Math.abs(posterior23-0.6640866873065016)<1e-12);
console.log(JSON.stringify({oracle:'opening-pass-double-posterior/v1',
 rules:'qosa-1.0.0 confirmed 3x9 1-1 starter and mandatory one-tile draw',
 sampleDeals:0,seedSet:null,strategies:[],aggregatePass:pass/total,
 priorAtLeastFourOtherDoubles:prior4,posteriorAtLeastFourGivenPass:posterior4,
 posteriorTwoOrThreeGivenPass:posterior23,rows:result,
 limitation:'Exact uniform-deal opening only; no branch, block, gameplay, win-rate or regret inference.'},null,2));
