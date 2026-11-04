'use strict';
// Research-only exhaustive 24-label permutation metamorphic regression.
// Run: node qosha-research/simulator/branch-permutation-regression.js
const assert=require('node:assert/strict');
const e=require('./engine');
const d=require('./turn-dispatcher');
const S=e.SIDES;
function permutations(xs){
 if(!xs.length)return [[]];
 return xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>i!==j)).map(rest=>[x,...rest]));
}
function relabel(state,perm){
 const n=e.cloneBranchState(state);
 for(let i=0;i<4;i++)n.branches[perm[i]]={...state.branches[S[i]]};
 return n;
}
function actionKey(a,map=x=>x){
 if(a.type==='single')return ['single',e.tileKey(a.tile),map(a.side),a.from,a.to].join(':');
 if(a.type==='mixed-finish')return ['mixed',e.tileKey(a.tile),map(a.side),a.from,a.to,a.numbers.join(',')].join(':');
 return ['doubles',a.numbers.join(',')].join(':');
}
function check(state,opening,hand,required){
 const inactive=e.SIDES.filter(side=>!state.branches[side].active);
 assert.ok(inactive.every(side=>!d.actionsForHand(state,opening,hand).some(a=>a.side===side)),'inactive sides cannot receive single/mixed placements');
 const base=d.actionsForHand(state,opening,hand);
 const coverage={single:base.filter(a=>a.type==='single').length, doubleSequence:base.filter(a=>a.type==='double-sequence').length, multiDouble:base.filter(a=>a.type==='double-sequence'&&a.numbers.length>=2).length, mixedFinish:base.filter(a=>a.type==='mixed-finish').length};
 for(const kind of required)assert.ok(coverage[kind]>0,`fixture does not cover ${kind}`);
 assert.ok(base.length>0,'vacuous action set');
 let checked=0,placements=0;
 for(const perm of permutations(S)){
  const map=Object.fromEntries(S.map((s,i)=>[s,perm[i]]));
  const translated=relabel(state,perm);
  assert.deepEqual(S.filter(side=>!translated.branches[side].active).sort(),inactive.map(side=>map[side]).sort(),'inactive branch labels relabel exactly');
  assert.deepEqual(d.actionsForHand(translated,opening,hand).map(a=>actionKey(a)).sort(),
   base.map(a=>actionKey(a,s=>map[s])).sort(),'legal-action multiset equivariant');
  for(const a of base){
   const b=d.actionsForHand(translated,opening,hand).find(x=>actionKey(x)===actionKey(a,s=>map[s]));
   assert.ok(b,'translated legal move exists');
   const r=d.applyTurn(state,opening,hand,[],a);
   const t=d.applyTurn(translated,opening,hand,[],b);
   assert.deepEqual(t.branchState,relabel(r.branchState,perm),'post-action branch equivariance');
   // Inactive sides must not become active merely because a placement uses a different label.
   for(const side of inactive){
    const expected=r.branchState.branches[side];
    const actual=t.branchState.branches[map[side]];
    assert.equal(actual.active,expected.active,'inactive-side activation equivariant');
    assert.equal(actual.end,expected.end,'inactive-side end equivariant');
   }
   assert.deepEqual([...t.openingState.openedNumbers].sort(),[...r.openingState.openedNumbers].sort());
   assert.deepEqual(t.hand,r.hand);
   assert.deepEqual(t.playedTiles,r.playedTiles);
   assert.equal(t.passed,r.passed);
   placements++;
  }
  checked++;
 }
 return {permutations:checked,actionTransitions:placements,coverage};
}
function run(){
 const opening=e.createOpeningState([1,2,3]);
 const a=e.createBranchState([1,1]);
 a.branches.up.end=1;a.branches.left.end=2;a.branches.right.end=3;a.branches.down.end=1;
 const x=check(a,opening,[[1,5],[2,4],[3,6],[1,1],[2,2],[3,3]],['single']);
 const b=e.createBranchState([1,1]);
 b.branches.up.end=1;b.branches.left.end=2;b.branches.right.end=5;b.branches.down.end=2;
 const y=check(b,e.createOpeningState([1]),[[1,5],[5,5],[2,2],[2,6],[0,0]],['single','multiDouble']);
 const c=e.createBranchState([1,1]);
 c.branches.up.end=1;c.branches.left.end=5;c.branches.right.end=2;c.branches.down.end=2;
 const z=check(c,e.createOpeningState([1]),[[1,5],[5,5],[2,2]],['mixedFinish']);
 // An inactive side must remain inactive under all 24 label permutations.
 const locked=e.createBranchState([1,1],['up','left','right']);
 locked.branches.up.end=1;locked.branches.left.end=2;locked.branches.right.end=5;
 locked.branches.down.end=1;
 const w=check(locked,e.createOpeningState([1]),[[1,6],[2,2],[5,5]],['single','multiDouble']);
 return {passed:true,engine:'qosha-research-0.5.3',fixtures:4,permutations:x.permutations+y.permutations+z.permutations+w.permutations,actionTransitions:x.actionTransitions+y.actionTransitions+z.actionTransitions+w.actionTransitions,results:[x,y,z,w],coverageVerified:true};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,check};
