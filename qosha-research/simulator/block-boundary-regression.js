'use strict';
// Research-only block threshold and score-neutrality regression.
// Does not assign a block winner or invent a physical block scoring rule.
const assert=require('node:assert/strict');
const e=require('./engine');
const t=require('./turn-kernel');
const d=require('./turn-dispatcher');
function run(){
 let checks=0;
 for(const players of [3,5]){
  const hands=Array.from({length:players},(_,i)=>[[i%7,(i+2)%7]]);
  const expected=hands.map(e.pipSum);
  for(let passes=0;passes<=players+2;passes++){
   for(const stock of [[],[[0,0]]]){
    const state={hands,stock,consecutivePasses:passes,lastPlayerIndex:players-1,
      lastTurnResult:{passed:true,finishDoubles:[]},players};
    const blocked=stock.length===0&&passes>=players;
    assert.equal(t.isBlocked(state),blocked);
    const result=d.roundOutcome(state);
    if(blocked){
     assert.equal(result.kind,'block');
     assert.equal(result.playerIndex,null,'block winner not authenticated');
     assert.equal(result.minus,0,'no finish-minus on block');
     assert.deepEqual(result.remainders,expected);
    }else assert.equal(result,null);
    checks++;
   }
  }
  assert.equal(t.nextPassCount(players-1,{passed:false}),0);
  assert.equal(t.nextPassCount(players-1,{passed:true}),players);
  checks+=2;
 }
 // Empty-hand finish has priority over a stale pass counter, and its
 // penalty is determined only by doubles in the finishing action.
 const finish=d.roundOutcome({hands:[[],[[1,2]],[[2,3]]],stock:[],
  consecutivePasses:3,lastPlayerIndex:0,
  lastTurnResult:{passed:false,finishDoubles:[[2,2]]},players:3});
 assert.deepEqual(finish,{kind:'finish',playerIndex:0,minus:-10,remainders:[0,3,5]});
 checks++;
 return {passed:true,schema:'qosha-block-boundary-regression/v1',engine:'qosha-research-0.5.3',
  deals:0,playersChecked:[3,5],checks,blockWinner:'unassigned',
  limitation:'coded pass threshold and pip remainders only; no physical block winner/tie/scoring authentication'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
