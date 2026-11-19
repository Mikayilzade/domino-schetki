'use strict';
// Exact, engine-independent 3x9 opening-hand double count oracle.
// Conditional on a named player holding 1-1 in an otherwise uniformly dealt
// double-six set: 8 other hand tiles from 27, including 6 other doubles.
function choose(n,k) {
  if(!Number.isInteger(n)||!Number.isInteger(k)||k<0||k>n)return 0;
  let v=1;
  for(let i=1;i<=k;i++)v=v*(n-i+1)/i;
  return Math.round(v);
}
const denominator=choose(27,8);
const counts=Array.from({length:7},(_,k)=>choose(6,k)*choose(21,8-k));
if(counts.reduce((a,b)=>a+b,0)!==denominator)throw Error('partition mismatch');
const probabilities=counts.map(n=>n/denominator);
const atLeast3=probabilities.slice(3).reduce((a,b)=>a+b,0);
const atLeast4=probabilities.slice(4).reduce((a,b)=>a+b,0);
if(Math.abs(probabilities.reduce((a,b)=>a+b,0)-1)>1e-12)throw Error('probability mismatch');
console.log(JSON.stringify({schema:'qosha-exact-opening-doubles/v1',passed:true,deals:0,
  mode:'3x9; conditioned on opening player holding 1-1',denominator,
  otherDoubleCounts:counts,probabilities,atLeast3,atLeast4,
  limitation:'Opening hand distribution only; not an optimal double-holding strategy or a gameplay-engine validation.'},null,2));
