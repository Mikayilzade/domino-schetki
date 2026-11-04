'use strict';
// Research-only invariant regression: deterministic 3x9 hands, no live PWA changes.
// Run: node qosha-research/simulator/round-conservation-regression.js
const assert=require('node:assert/strict');
const e=require('./engine');
const init=require('./initializer');
const driver=require('./round-driver');
const dispatcher=require('./turn-dispatcher');
const sides=e.SIDES;
const key=e.tileKey;
function inventory(state){
 const tiles=[...state.hands.flat(),...state.stock,...state.played];
 assert.equal(tiles.length,28,'28 tiles conserved');
 assert.equal(new Set(tiles.map(key)).size,28,'no duplicated or lost tile');
}
function play(seed){
 let cursor=seed, setup,redeals=0;
 do{
  const deal=e.dealThreeByNine(cursor++);
  setup=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:true});
  if(setup.kind==='redeal')redeals++;
 }while(setup.kind==='redeal');
 assert.equal(setup.kind,'ready');
 // Opening 1-1 and optional follow-up have already left the hands.
 const all=e.createDoubleSixDeck();
 const inHands=new Set([...setup.hands.flat(),...setup.stock].map(key));
 let played=all.filter(t=>!inHands.has(key(t)));
 let state={...setup,played};
 inventory(state);
 let turns=0;
 while(!state.outcome && turns<200){
  const p=state.currentPlayer;
  const opts=dispatcher.turnOptions(state.branchState,state.openingState,state.hands[p],state.stock);
  const action=opts.phase==='play'?opts.actions[e.mixSeed32(seed^Math.imul(turns+1,0x9e3779b9))%opts.actions.length]:null;
  const tr=dispatcher.applyTurn(state.branchState,state.openingState,state.hands[p],state.stock,action);
  assert.equal(tr.playedTiles.length, tr.action?.type==='mixed-finish'?1+tr.finishDoubles.length:tr.playedTiles.length);
  const next=driver.stepRound(state,()=>action);
  assert.deepEqual(next.hands[p],tr.hand,'step and dispatcher agree');
  assert.deepEqual(next.stock,tr.stock,'stock agrees');
  played.push(...tr.playedTiles);
  state={...next,played};
  inventory(state);
  for(const side of sides){
   const b=state.branchState.branches[side];
   assert.ok(Number.isInteger(b.end)&&b.end>=0&&b.end<=6);
  }
  turns++;
 }
 assert.ok(state.outcome && ['finish','block'].includes(state.outcome.kind),'round terminates');
 if(state.outcome.kind==='finish'){
  assert.equal(state.hands[state.outcome.playerIndex].length,0);
  assert.ok([0,-10,-20,-30,-40].includes(state.outcome.minus));
 }
 return {turns,kind:state.outcome.kind,redeals};
}
function run(){
 const seeds=Array.from({length:1000},(_,i)=>21000000+i);
 const outcomes=seeds.map(play);
 const blocks=outcomes.filter(x=>x.kind==='block').length;
 return {passed:true,engine:'qosha-research-0.5.3',seeds:[seeds[0],seeds.at(-1)],deals:outcomes.length,blocks,meanTurns:outcomes.reduce((n,x)=>n+x.turns,0)/outcomes.length};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
