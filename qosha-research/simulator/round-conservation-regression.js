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
  if(opts.phase==='play')assert.ok(opts.actions.length>0,'play phase has legal choices');
  const action=opts.phase==='play'?opts.actions[e.mixSeed32(seed^Math.imul(turns+1,0x9e3779b9))%opts.actions.length]:null;
  const tr=dispatcher.applyTurn(state.branchState,state.openingState,state.hands[p],state.stock,action);
  // Assert the transition's complete tile movement, not a tautological length check.
  const beforeHand=state.hands[p].map(key);
  const afterHand=tr.hand.map(key);
  const removed=beforeHand.filter(k=>!afterHand.includes(k));
  const gained=afterHand.filter(k=>!beforeHand.includes(k));
  const drawnKey=tr.drawnTile?key(tr.drawnTile):null;
  // Independently audit stock identity, not merely its length or draw flag.
  assert.equal(state.stock.length-tr.stock.length,tr.drawn?1:0,'stock delta equals draw');
  assert.deepEqual(tr.stock,tr.drawn?state.stock.slice(1):state.stock,'draw consumes only stock head');
  if(tr.drawn)assert.equal(drawnKey,key(state.stock[0]),'drawn tile is stock head');
  for(const t of tr.playedTiles)assert.ok(beforeHand.includes(key(t))||key(t)===drawnKey,'played tile originated in hand or draw');
  const playedKeys=tr.playedTiles.map(key);
  assert.equal(new Set(playedKeys).size,playedKeys.length,'no tile played twice');
  assert.equal(tr.drawn,Boolean(drawnKey),'draw flag matches drawn tile');
  assert.deepEqual([...removed,...(drawnKey?[drawnKey]:[])].sort(),
                   [...playedKeys,...gained].sort(),'hand delta reconciles with draw and plays');
  if(tr.action?.type==='mixed-finish'){
   assert.equal(tr.playedTiles.length,1+tr.finishDoubles.length,'mixed finish includes ordinary tile');
  }else if(tr.action?.type==='double-sequence'){
   assert.equal(tr.playedTiles.length,tr.finishDoubles.length,'double sequence counts all played doubles');
  }else if(tr.action?.type==='single'){
   assert.equal(tr.playedTiles.length,1,'single action plays exactly one tile');
  }else assert.equal(tr.playedTiles.length,0,'pass plays no tiles');
  const next=driver.stepRound(state,()=>action);
  assert.deepEqual(next.hands[p],tr.hand,'step and dispatcher agree');
  assert.deepEqual(next.stock,tr.stock,'stock agrees');
  assert.deepEqual(next.branchState,tr.branchState,'branch transition agrees');
  assert.equal(next.consecutivePasses,tr.passed?state.consecutivePasses+1:0,'pass counter agrees');
  if(next.outcome?.kind==='block'){
   assert.equal(next.stock.length,0,'block requires empty stock');
   assert.ok(next.consecutivePasses>=3,'block requires full pass cycle');
   assert.deepEqual(next.outcome.remainders,next.hands.map(e.pipSum),'block pip sums agree');
  }
  assert.deepEqual([...next.openingState.openedNumbers].sort(),[...tr.openingState.openedNumbers].sort(),'opening transition agrees');
  assert.equal(next.turns,state.turns+1,'exactly one turn increment');
  assert.equal(next.currentPlayer,next.outcome?p:(p+1)%3,'clockwise turn advance');
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
