'use strict';
// Independent exact oracle for the confirmed 3x9 forced-opening-pass inventory.
// No branch-unlock, scoring, or opponent-choice assumption is used.
const assert=require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);}
function distribution(){
  const denominator=choose(18,9);
  const rows=Array.from({length:7},(_,x)=>({
    nextConnectors:x,otherConnectors:6-x,
    ways:choose(6,x)*choose(12,9-x)
  }));
  assert.equal(denominator,48620);
  assert.equal(rows.reduce((s,r)=>s+r.ways,0),denominator);
  assert.deepEqual(rows.map(r=>r.ways),[220,2970,11880,18480,11880,2970,220]);
  assert.equal(rows.reduce((s,r)=>s+r.nextConnectors*r.ways,0),3*denominator);
  const bothAtLeast2=rows.filter(r=>Math.min(r.nextConnectors,r.otherConnectors)>=2)
    .reduce((s,r)=>s+r.ways,0);
  const bothAtLeast3=rows.filter(r=>Math.min(r.nextConnectors,r.otherConnectors)>=3)
    .reduce((s,r)=>s+r.ways,0);
  assert.equal(bothAtLeast2,42240);
  assert.equal(bothAtLeast3,18480);
  return {schema:'qosha-forced-pass-support/v1',conditionalOn:'starter played 1-1, drew the sole stock and has no ordinary 1-x',denominator,rows,bothAtLeast2,bothAtLeast3,probabilityBothAtLeast3:bothAtLeast3/denominator,assumptions:['uniform conditional deal','six ordinary 1-x connectors lie in opponent hands','no opponent move-choice model']};
}
if(require.main===module)console.log(JSON.stringify(distribution(),null,2));
module.exports={distribution};
