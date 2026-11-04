'use strict';
// Research-only end-to-end terminal minus fixtures, through legal action -> applyTurn -> roundOutcome.
// Run: node qosha-research/simulator/terminal-minus-integration-test.js
const assert=require('node:assert/strict');
const e=require('./engine');
const d=require('./turn-dispatcher');
function state(ends,opened=[1]){
 const branch=e.createBranchState([1,1]);
 e.SIDES.forEach((side,i)=>{branch.branches[side].end=ends[i];});
 return {branch,opening:e.createOpeningState(opened)};
}
function finish(ends,hand,expected,type='double-sequence'){
 const {branch,opening}=state(ends);
 const legal=d.actionsForHand(branch,opening,hand);
 const candidates=legal.filter(a=>a.type===type);
 assert.ok(candidates.length>0,'terminal action must be genuinely legal');
 let observed=0;
 for(const action of candidates){
  const tr=d.applyTurn(branch,opening,hand,[],action);
  if(tr.hand.length!==0)continue;
  const outcome=d.roundOutcome({hands:[tr.hand,[[1,2]],[[3,4]]],stock:tr.stock,
    consecutivePasses:0,lastPlayerIndex:0,lastTurnResult:tr,players:3});
  assert.equal(outcome.kind,'finish');
  assert.equal(outcome.minus,expected);
  assert.equal(tr.finishDoubles.length,-expected/10);
  assert.deepEqual(outcome.remainders,[0,3,7]);
  observed++;
 }
 assert.ok(observed>0,'at least one legal candidate empties hand');
 return observed;
}
function run(){
 const checks=[
  {ends:[2,1,1,1],hand:[[2,2]],minus:-10},
  {ends:[2,4,1,1],hand:[[2,2],[4,4]],minus:-20},
  {ends:[0,2,4,1],hand:[[0,0],[2,2],[4,4]],minus:-30},
  {ends:[0,2,4,6],hand:[[0,0],[2,2],[4,4],[6,6]],minus:-40},
  {ends:[1,5,2,2],hand:[[1,5],[5,5],[2,2]],minus:-20,type:'mixed-finish'}
 ];
 let verified=0;
 for(const c of checks)verified+=finish(c.ends,c.hand,c.minus,c.type);
 // Partial multi-double is legal when no complete terminal sequence exists,
 // but must not accidentally trigger a minus while a tile remains.
 const {branch,opening}=state([2,1,1,1]);
 const hand=[[2,2],[4,4]];
 const partial=d.actionsForHand(branch,opening,hand).find(a=>a.type==='double-sequence'&&a.numbers.length===1);
 assert.ok(partial,'non-terminal double prefix exists');
 const tr=d.applyTurn(branch,opening,hand,[],partial);
 assert.equal(tr.hand.length,1);
 assert.equal(d.roundOutcome({hands:[tr.hand,[[1,2]],[[3,4]]],stock:[],
  consecutivePasses:0,lastPlayerIndex:0,lastTurnResult:tr,players:3}),null);
 return {passed:true,engine:'qosha-research-0.5.3',deals:0,
  terminalFixtures:checks.length,verifiedTerminalActions:verified,
  nonTerminalPrefixFixtures:1,minusValues:[-10,-20,-30,-40],
  limitation:'constructed states; branch-opening interpretation provisional'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
