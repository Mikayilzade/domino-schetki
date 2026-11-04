'use strict';
// Research-only negative legality gate: malformed/forged actions must not mutate state.
// Run: node qosha-research/simulator/illegal-action-regression.js
const assert=require('node:assert/strict');
const e=require('./engine');
const d=require('./turn-dispatcher');
function run(){
 const b=e.createBranchState([1,1],['up','left','right']);
 b.branches.up.end=1;b.branches.left.end=2;b.branches.right.end=5;
 const o=e.createOpeningState([1]);
 const hand=[[1,6],[2,4],[5,5],[0,0]];
 const stock=[];
 const snapshot=JSON.stringify({b,opened:[...o.openedNumbers],hand,stock});
 const legal=d.actionsForHand(b,o,hand);
 assert.ok(legal.some(a=>a.type==='single'),'positive single control');
 let rejected=0;
 const invalid=[
  {type:'single',handIndex:1,side:'down',tile:[2,4],from:2,to:4}, // inactive
  {type:'single',handIndex:1,side:'left',tile:[2,4],from:2,to:6}, // forged end
  {type:'single',handIndex:0,side:'left',tile:[1,6],from:2,to:6}, // wrong side
  {type:'double-sequence',numbers:[0],sequence:[],tiles:[[0,0]]}, // 0 not on ends
  {type:'double-sequence',numbers:[5,5],sequence:[],tiles:[[5,5],[5,5]]}, // duplicate
  {type:'mixed-finish',handIndex:0,side:'up',tile:[1,6],from:1,to:6,numbers:[0]} // not terminal
 ];
 for(const choice of invalid){
  assert.throws(()=>d.applyTurn(b,o,hand,stock,choice),/illegal turn action/);
  rejected++;
 }
 assert.throws(()=>d.applyTurn(b,o,hand,stock,null),/turn action required/);
 rejected++;
 const passBranch=e.createBranchState([1,1]);
 const passOpening=e.createOpeningState([1]);
 const dead=[[2,3]];
 assert.equal(d.turnOptions(passBranch,passOpening,dead,[]).phase,'pass');
 assert.throws(()=>d.applyTurn(passBranch,passOpening,dead,[],{type:'single'}),/cannot choose action on pass/);
 rejected++;
 assert.equal(JSON.stringify({b,opened:[...o.openedNumbers],hand,stock}),snapshot,'inputs unchanged after rejection');
 const positive=d.applyTurn(b,o,hand,stock,legal.find(a=>a.type==='single'));
 assert.equal(positive.playedTiles.length,1);
 assert.equal(positive.hand.length,hand.length-1);
 return {passed:true,engine:'qosha-research-0.5.3',deals:0,negativeCases:rejected,positiveControls:1,
  limitation:'constructed states; provisional branch-opening rules; no stochastic strategy result'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
