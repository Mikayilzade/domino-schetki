'use strict';
// Regression for equal-pip connector vs unrelated comparisons.
// Run: node qosha-research/simulator/connector-other-matches-test.js
const assert=require('assert');
const e=require('./engine'),d=require('./turn-dispatcher');
const init=require('./initializer'),r=require('./round-driver');
const {chooseBy}=require('./strategy-runner');
const {actionKey}=require('./decision-regret');
const {matches}=require('./connector-other-matches');
let positions=0,pairs=0;
for(let seed=0;seed<20000&&positions<10;seed++){
 let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
 if(s.kind!=='ready')continue;
 while(!s.outcome&&s.turns<100){
  const found=matches(s);
  if(found.length){
   const before=JSON.stringify(s);
   const options=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
   const actions=new Map(options.actions.map(a=>[actionKey(a),a]));
   for(const {x,pairs:items} of found){
    assert(s.hands[s.currentPlayer].some(t=>t[0]===x&&t[1]===x));
    for(const {connector,other,pips} of items){
     const a=actions.get(connector),b=actions.get(other);
     assert(a&&b&&a.type==='single'&&b.type==='single');
     assert(a.tile.includes(x)&&!b.tile.includes(x));
     assert.strictEqual(e.pipSum([a.tile]),pips);
     assert.strictEqual(e.pipSum([b.tile]),pips);
     pairs++;
    }
   }
   assert.strictEqual(JSON.stringify(s),before,'matcher mutated state');
   positions++;
   break;
  }
  s=r.stepRound(s,(opts,state)=>chooseBy('closed-branch-control',opts,{seed,turns:state.turns,player:state.currentPlayer}));
 }
}
// Distinct equal-pip tiles cannot both fit the same endpoint: the other pip is forced.
for(let endpoint=0;endpoint<=6;endpoint++){
 const candidates=e.createDoubleSixDeck().filter(t=>t.includes(endpoint));
 for(let i=0;i<candidates.length;i++)for(let j=i+1;j<candidates.length;j++)
  assert(e.pipSum([candidates[i]])!==e.pipSum([candidates[j]]),'same-side equal-pip distinct tile impossible');
}
assert(positions>0,'no reachable eligible fixture in seed range');
console.log(JSON.stringify({passed:true,positions,pairs,seedRange:'0..19999'}));
