'use strict';
// Deterministic opening stock 1-1 regression, research only.
// node qosha-research/simulator/opening-stock-regression.js
const assert=require('node:assert/strict');
const e=require('./engine');
const init=require('./initializer');
const d=require('./turn-dispatcher');
function inventory(ready){
 const keys=[...ready.hands.flat(),...ready.stock].map(e.tileKey);
 assert.equal(new Set(keys).size,keys.length,'no duplicate tiles');
 const missing=e.createDoubleSixDeck().map(e.tileKey).filter(k=>!keys.includes(k));
 const played=['1-1',...(ready.openingFollowup?[e.tileKey(ready.openingFollowup.tile)]:[])];
 assert.deepEqual(missing.sort(),played.sort(),'only opening tiles absent');
}
function run(){
 let seed=0,deal;
 for(;seed<100000;seed++){
  const x=e.dealThreeByNine(seed);
  if(e.tileKey(x.stock[0])==='1-1'){deal=x;break;}
 }
 assert.ok(deal,'found stock 1-1 deal');
 const first=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:true});
 assert.equal(first.kind,'redeal');
 const noWinner=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:false});
 assert.equal(noWinner.kind,'unresolved');
 const results=[];
 for(let winner=0;winner<3;winner++){
  const ready=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:false,previousWinnerIndex:winner});
  assert.equal(ready.kind,'ready');
  assert.equal(ready.starter,winner);
  assert.equal(ready.currentPlayer,(winner+1)%3);
  assert.equal(ready.stock.length,0);
  assert.equal(ready.openingDraw,null);
  assert.equal(ready.turns,1);
  assert.equal(ready.consecutivePasses,ready.openingPassed?1:0);
  assert.equal(ready.hands.reduce((n,h)=>n+h.length,0),27-(ready.openingFollowup?1:0));
  inventory(ready);
  if(ready.openingFollowup){
   assert.equal(ready.openingFollowup.from,1);
   assert.equal(e.tileKey(ready.openingFollowup.tile).includes('1'),true);
  }else{
   assert.equal(d.openedSinglesForHand(ready.branchState,ready.openingState,ready.hands[winner]).filter(a=>a.from===1&&a.tile[0]!==a.tile[1]).length,0);
  }
  results.push({winner,openingPassed:ready.openingPassed,followup:ready.openingFollowup?e.tileKey(ready.openingFollowup.tile):null});
 }
 return {passed:true,engine:'qosha-research-0.5.3',deals:0,seed,firstRoundRedeal:true,missingWinnerUnresolved:true,previousWinnerCases:results};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
