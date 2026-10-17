'use strict';
// Number-aware four-branch diagnostic for the recovered 3x9 Qoşa engine.
// Run: node qosha-research/simulator/geometry-number-aware.js
// No rule changes, no Monte Carlo or full-game claims.
const assert = require('node:assert/strict');
const SIDES = ['up', 'left', 'right', 'down'];
const sorted = xs => xs.slice().sort((a,b)=>a-b);
function geometrySignature(ends, opened, active=[true,true,true,true]) {
  assert.equal(ends.length, 4);
  assert.equal(active.length, 4);
  const open = new Set(opened);
  const named = SIDES.map((side,i)=>({side,active:!!active[i],end:ends[i],accessible:!!active[i]&&open.has(ends[i])}));
  const accessible = named.filter(b=>b.accessible);
  return {named, endsMultiset:sorted(named.filter(b=>b.active).map(b=>b.end)),
    accessibleEndValues:sorted(accessible.map(b=>b.end)),
    accessibleEndCount:accessible.length,
    exactNamedSignature:named.map(b=>`${b.side}:${b.active?b.end:'x'}:${b.accessible?1:0}`).join('|')};
}
function ordinaryLegalPlacements(signature, hand) {
  const out=[];
  hand.forEach(([a,b],handIndex)=>{
    if(a===b) return; // unopened/opened doubles handled by the dedicated opening dispatcher
    for(const br of signature.named) if(br.accessible && (a===br.end || b===br.end))
      out.push({handIndex,tile:[a,b],side:br.side,to:a===br.end?b:a});
  });
  return out;
}
function selfTest(){
  const opened=[1,2,4,5,6];
  const a=geometrySignature([3,2,3,0],opened), b=geometrySignature([3,3,3,5],opened);
  assert.equal(a.accessibleEndCount,1); assert.equal(b.accessibleEndCount,1);
  assert.deepEqual(a.accessibleEndValues,[2]); assert.deepEqual(b.accessibleEndValues,[5]);
  assert.notEqual(a.exactNamedSignature,b.exactNamedSignature);
  const hand=[[2,6],[2,4]];
  assert.equal(ordinaryLegalPlacements(a,hand).length,2);
  assert.equal(ordinaryLegalPlacements(b,hand).length,0);
  const sameTileA=geometrySignature([5,2,3,4],opened);
  const sameTileB=geometrySignature([2,5,3,4],opened);
  assert.deepEqual(sameTileA.endsMultiset,sameTileB.endsMultiset);
  assert.notEqual(sameTileA.exactNamedSignature,sameTileB.exactNamedSignature);
  assert.deepEqual(geometrySignature([2,2,3,4],opened,[false,true,true,true]).accessibleEndValues,[2,4]);
  assert.equal(ordinaryLegalPlacements(geometrySignature([2,2,3,4],opened,[false,true,true,true]),[[2,6]]).length,1);
  console.log('PASS number-aware geometry: equal-count/different-number reply divergence, named-vs-multiset, inactive branch');
}
if(require.main===module)selfTest();
module.exports={geometrySignature,ordinaryLegalPlacements,selfTest};
