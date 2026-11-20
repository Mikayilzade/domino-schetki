'use strict';
// Independent exact opening-pass oracle. No provisional branch/scoring rules.
const assert=require('node:assert/strict');
function C(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);}
const total=C(27,8)*19;
const rows=[];
for(let k=0;k<=6;k++){
 const handWays=C(6,k)*C(21,8-k);
 const passWays=C(6,k)*C(15,8-k)*13;
 const conditionalPass=passWays/(handWays*19);
 rows.push({extraDoubles:k,handWays,passWays,conditionalPass});
}
const passTotal=rows.reduce((a,r)=>a+r.passWays,0);
assert.equal(rows.reduce((a,r)=>a+r.handWays,0),C(27,8));
assert.equal(passTotal,C(21,8)*13);
const unconditionalPass=passTotal/total;
assert.ok(Math.abs(unconditionalPass-C(21,8)/C(27,8)*13/19)<1e-14);
const posterior=rows.map(r=>({extraDoubles:r.extraDoubles,probability:r.passWays/passTotal}));
assert.ok(Math.abs(posterior.reduce((a,r)=>a+r.probability,0)-1)<1e-14);
const pThreeOrMore=posterior.filter(r=>r.extraDoubles>=3).reduce((a,r)=>a+r.probability,0);
assert.ok(Math.abs(pThreeOrMore-0.4097007223942209)<1e-12);
console.log(JSON.stringify({schema:'qosha-opening-k-pass-oracle/v1',passed:true,engine:'exact-combinatorial-independent',rules:'recovered qosa-1.0.0 confirmed 1-1 mandatory draw/pass only',deals:0,seeds:null,strategies:[],totalAllocations:C(27,8),unconditionalPass,rows,posterior,pThreeOrMore,limitations:'Uniform 3x9+1 deal conditional on starter holding 1-1; no gameplay or strategy claim'},null,2));
