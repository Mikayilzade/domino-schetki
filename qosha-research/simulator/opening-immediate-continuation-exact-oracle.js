'use strict';
// Exact first-continuation inventory oracle, recovered qosa-1.0.0 3x9+1.
// Conditional on starter holding 1-1, then drawing the single stock tile.
// This measures possession of a 1-x tile, NOT legal branch state or win chance.
const assert = require('node:assert/strict');
function choose(n,k) {
  if (k<0 || k>n) return 0;
  k=Math.min(k,n-k);
  let v=1;
  for(let i=1;i<=k;i++) v=v*(n-k+i)/i;
  return Math.round(v);
}
const total=choose(27,9);
const noOne=choose(21,9);
const atLeastOne=total-noOne;
assert.equal(total,4686825);
assert.equal(noOne,293930);
assert.equal(atLeastOne,4392895);
const distribution=[];
for(let k=0;k<=6;k++) {
  const hands=choose(6,k)*choose(21,9-k);
  distribution.push({oneConnectors:k,hands,probability:hands/total});
}
assert.equal(distribution.reduce((s,r)=>s+r.hands,0),total);
assert.equal(distribution[0].hands,noOne);
const report={schema:'qosha-exact-opening-continuation/v1',rules:'qosa-1.0.0',mode:'3x9+1',assumption:'uniform double-six shuffle; starter owns 1-1 and draws stock before continuation',totalHands:total,noOneConnectorHands:noOne,atLeastOneConnectorHands:atLeastOne,atLeastOneProbability:atLeastOne/total,distribution,scope:'inventory only; no move legality or strategic win inference'};
if(require.main===module) console.log(JSON.stringify(report,null,2));
module.exports={choose,report};
