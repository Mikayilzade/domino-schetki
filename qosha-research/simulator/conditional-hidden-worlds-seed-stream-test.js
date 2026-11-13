'use strict';
// Seed-stream marginal regression for the standalone 3x9+1 hidden-world sampler.
// Tests stock tile (last Fisher-Yates slot) across two deterministic seed families.
// Statistical sanity check only: not a proof of independent or uniform hidden worlds.
const assert=require('node:assert/strict');
const {sample}=require('./conditional-hidden-worlds');
const N=100000, families={
 sequential:i=>i,
 spread:i=>Math.imul(i,0x9e3779b1)>>>0
};
const report={test:'conditional-hidden-worlds-seed-stream',allocationsPerFamily:N,results:{}};
for(const [name,seedAt] of Object.entries(families)){
 const counts=Object.create(null);
 for(let i=0;i<N;i++){
  const w=sample({seed:seedAt(i)});
  assert.equal(w.stock.length,1);
  const tile=w.stock[0];
  counts[tile]=(counts[tile]||0)+1;
 }
 const values=Object.values(counts),expected=N/28;
 assert.equal(values.length,28,'every stock tile must appear');
 const chiSquare=values.reduce((s,n)=>s+(n-expected)**2/expected,0);
 // Fixed deterministic seed families: broad guard against the known direct-seed
 // xorshift defect (historical sequential chi-square 202.06672).
 assert.ok(chiSquare<65, name+' marginal chi-square regression: '+chiSquare);
 report.results[name]={min:Math.min(...values),max:Math.max(...values),chiSquare};
}
console.log(JSON.stringify(report));
