'use strict';
// Exact conditional forced-pass risk after mandatory 1-1 opening and stock draw.
// Reference: recovered qosa-1.0.0, 3 players x 9 stones + 1 stock.
// Assumptions: uniformly shuffled double-six deck; starter owns 1-1;
// after playing it and drawing stock, nine other stones are a uniform
// 9-subset of the remaining 27 stones. A follow-up needs an ordinary 1-x
// connector; no branch or opponent policy is modelled.
const assert = require('node:assert/strict');
function choose(n,k) {
  if(k<0 || k>n) return 0;
  k=Math.min(k,n-k);
  let r=1;
  for(let i=1;i<=k;i++) r=r*(n-k+i)/i;
  return Math.round(r);
}
const rows=[];
for(let k=0;k<=6;k++){
  // Remaining 27 = 6 ordinary 1-x + 6 other doubles + 15 others.
  const denominator=choose(6,k)*choose(21,9-k);
  const forcedPass=choose(6,k)*choose(15,9-k);
  rows.push({otherDoubles:k,conditionalHands:denominator,forcedPassHands:forcedPass,forcedPassPct:100*forcedPass/denominator});
}
assert.equal(rows.reduce((s,r)=>s+r.conditionalHands,0),choose(27,9));
assert.equal(rows.reduce((s,r)=>s+r.forcedPassHands,0),choose(21,9));
assert.equal(rows[0].forcedPassHands,5005);
assert.equal(rows[6].forcedPassHands,455);
for(let i=1;i<rows.length;i++) assert(rows[i].forcedPassPct>rows[i-1].forcedPassPct);
console.log(JSON.stringify({
 schema:'qosha-opening-pass-by-double-count/v1',
 engineReference:'qosha-research-0.5.3',
 rulesReference:'qosa-1.0.0',
 method:'exact conditional enumeration; no game rounds',
 totalHands:choose(27,9),
 totalForcedPassHands:choose(21,9),
 unconditionalForcedPassPct:100*choose(21,9)/choose(27,9),
 rows,
 caveat:'Descriptive conditional association, not a strategy effect or legal-move simulation.'
},null,2));
