'use strict';
// Exact, engine-independent opening follow-up option distribution.
// Conditional on starter holding 1-1; compulsory stock tile has been drawn.
// Six remaining 1-x connectors among 27 tiles; nine sampled tiles
// (eight initial non-1-1 hand tiles + one stock tile).
function choose(n,k) {
  if (!Number.isInteger(n)||!Number.isInteger(k)||k<0||k>n) return 0;
  let v=1;
  for(let i=1;i<=k;i++) v=v*(n-i+1)/i;
  return Math.round(v);
}
const denominator=choose(27,9);
const counts=Array.from({length:7},(_,k)=>choose(6,k)*choose(21,9-k));
const total=counts.reduce((a,b)=>a+b,0);
if(total!==denominator) throw Error('hypergeometric normalization failed');
const mean=counts.reduce((a,c,k)=>a+k*c,0)/denominator;
const pAtLeastTwo=counts.slice(2).reduce((a,b)=>a+b,0)/denominator;
if(Math.abs(mean-2)>1e-12) throw Error('mean mismatch');
if(Math.abs(counts[0]/denominator-choose(21,9)/choose(27,9))>1e-12) throw Error('pass mismatch');
console.log(JSON.stringify({
  oracle:'opening-followup-option-count/v1',
  rules:'qosa-1.0.0',
  model:'3x9+1, starter holds 1-1, compulsory stock draw, uniform deal',
  denominator, counts,
  probabilities:counts.map(c=>c/denominator),
  meanLegalConnectorTiles:mean,
  probabilityAtLeastTwoDistinctConnectorTiles:pAtLeastTwo,
  limitations:'Counts available 1-x connector tiles after draw, not unique legal board placements or optimal actions. Branch geometry and strategy not modelled.',
},null,2));
