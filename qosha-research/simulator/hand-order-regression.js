'use strict';
// Research-only metamorphic test: permuting hand order must not alter legal
// tile/branch choices or the resulting state, except hand ordering.
// Run: node qosha-research/simulator/hand-order-regression.js
const assert=require('node:assert/strict');
const e=require('./engine');
const d=require('./turn-dispatcher');
const key=e.tileKey;
function signature(a){
 if(a.type==='single'||a.type==='mixed-finish')
  return [a.type,key(a.tile),a.side,a.from,a.to,(a.numbers||[]).join(',')].join('|');
 return [a.type,a.numbers.join(',')].join('|');
}
function canonicalHand(hand){return hand.map(key).sort();}
function check(branch,opening,hand){
 const base=d.actionsForHand(branch,opening,hand);
 assert.ok(base.length,'nonvacuous fixture');
 const expected=base.map(signature).sort();
 let comparisons=0,transitions=0;
 // Cyclic rotations and reversal; avoids factorial explosion.
 const variants=hand.map((_,i)=>hand.slice(i).concat(hand.slice(0,i)));
 variants.push([...hand].reverse());
 for(const permuted of variants){
  const actions=d.actionsForHand(branch,opening,permuted);
  assert.deepEqual(actions.map(signature).sort(),expected,'legal moves independent of hand ordering');
  for(const action of base){
   const candidate=actions.find(x=>signature(x)===signature(action));
   assert.ok(candidate);
   const a=d.applyTurn(branch,opening,hand,[],action);
   const b=d.applyTurn(branch,opening,permuted,[],candidate);
   assert.deepEqual(b.branchState,a.branchState);
   assert.deepEqual([...b.openingState.openedNumbers].sort(),[...a.openingState.openedNumbers].sort());
   assert.deepEqual(canonicalHand(b.hand),canonicalHand(a.hand));
   assert.deepEqual(b.playedTiles.map(key).sort(),a.playedTiles.map(key).sort());
   assert.equal(b.passed,a.passed);
   transitions++;
  }
  comparisons++;
 }
 return {comparisons,transitions,legalActions:base.length};
}
function run(){
 const a=e.createBranchState([1,1]);
 a.branches.up.end=1;a.branches.left.end=2;a.branches.right.end=5;a.branches.down.end=2;
 const opening=e.createOpeningState([1]);
 const fixtures=[
  check(a,opening,[[1,6],[2,4],[5,5],[2,2],[0,0]]),
  check(a,opening,[[1,5],[5,5],[2,2]]),
  check(a,opening,[[2,2],[5,5],[1,6],[3,3]])
 ];
 return {passed:true,engine:'qosha-research-0.5.3',deals:0,fixtures:fixtures.length,
  comparisons:fixtures.reduce((s,x)=>s+x.comparisons,0),
  transitions:fixtures.reduce((s,x)=>s+x.transitions,0),results:fixtures,
  limitation:'constructed states; provisional branch semantics; no strategy inference'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
