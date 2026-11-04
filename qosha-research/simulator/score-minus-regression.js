'use strict';
// Independent arithmetic/terminal scoring contract regression.
// node qosha-research/simulator/score-minus-regression.js
const assert=require('node:assert/strict');
const e=require('./engine');
const d=require('./turn-dispatcher');
function run(){
 const cases=[
  {tiles:[],minus:0},
  {tiles:[[1,1]],minus:-10},
  {tiles:[[0,0],[6,6]],minus:-20},
  {tiles:[[0,0],[2,2],[6,6]],minus:-30},
  {tiles:[[0,0],[2,2],[4,4],[6,6]],minus:-40},
  {tiles:[[1,2]],minus:0},
  {tiles:[[1,1],[2,3]],minus:0},
  {tiles:[[0,0],[1,1],[2,2],[3,3],[4,4]],minus:0}
 ];
 for(const c of cases)assert.equal(e.finishMinus(c.tiles),c.minus,JSON.stringify(c));
 const floorCases=[{score:0,delta:-40,want:0},{score:15,delta:-20,want:0},
  {score:35,delta:-20,want:15},{score:100,delta:1,want:101}];
 for(const c of floorCases)assert.equal(e.applyScoreDelta(c.score,c.delta),c.want,JSON.stringify(c));
 // Verify terminal minus comes from the actual final action, never from
 // doubles merely held earlier or from an unrelated player's hand.
 const branch=e.createBranchState([1,1]);
 const opened=e.createOpeningState([1]);
 const hand=[[1,5],[5,5],[2,2]];
 const actions=d.actionsForHand(branch,opened,hand);
 const mixed=actions.filter(a=>a.type==='mixed-finish');
 // 2-2 cannot be opened in this state (no branch ending in 2).
 assert.equal(mixed.length,0,'unreachable finish doubles cannot earn minus');
 const nonFinish=d.roundOutcome({hands:[[[1,1]],[[2,2]],[[3,3]]],stock:[],consecutivePasses:0,
  lastPlayerIndex:0,lastTurnResult:{passed:false,finishDoubles:[[1,1]]},players:3});
 assert.equal(nonFinish,null,'holding a double does not award a finish');
 const finish=d.roundOutcome({hands:[[],[[2,2]],[[3,3]]],stock:[],consecutivePasses:0,
  lastPlayerIndex:0,lastTurnResult:{passed:false,finishDoubles:[[1,1],[2,2]]},players:3});
 assert.deepEqual(finish,{kind:'finish',playerIndex:0,minus:-20,remainders:[0,4,6]});
 const block=d.roundOutcome({hands:[[[0,0]],[[2,2]],[[3,3]]],stock:[],consecutivePasses:3,
  lastPlayerIndex:2,lastTurnResult:{passed:true,finishDoubles:[]},players:3});
 assert.equal(block.kind,'block');
 assert.equal(block.playerIndex,null,'block winner remains unresolved');
 assert.deepEqual(block.remainders,[0,4,6]);
 return {passed:true,engine:'qosha-research-0.5.3',deals:0,
  minusCases:cases.length,floorCases:floorCases.length,terminalCases:3,
  minusValues:[-10,-20,-30,-40],blockWinner:'unassigned/provisional'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
