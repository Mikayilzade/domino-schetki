'use strict';
const assert = require('node:assert/strict');
const e = require('./engine');
const init = require('./initializer');
const d = require('./turn-dispatcher');
const round = require('./round-driver');
const deckKeys = e.createDoubleSixDeck().map(e.tileKey).sort();
let assertions = 0;
function eq(a,b,m){assert.deepStrictEqual(a,b,m);assertions++;}
function ok(v,m){assert.ok(v,m);assertions++;}
function removedTiles(before,after){
  const counts=new Map();for(const tile of before){const k=e.tileKey(tile);counts.set(k,(counts.get(k)||0)+1);}
  for(const tile of after){const k=e.tileKey(tile),n=counts.get(k)||0;if(n<=0)throw new Error('unexpected tile gain '+k);counts.set(k,n-1);}
  const out=[];for(const [k,n] of counts)for(let i=0;i<n;i++)out.push(k.split('-').map(Number));return out;
}
function conservation(state,played,seed,turn){
  const all=[...state.hands.flat(),...state.stock,...played];
  eq(all.length,28,'seed '+seed+' turn '+turn+': 28 tiles');
  eq(new Set(all.map(e.tileKey)).size,28,'seed '+seed+' turn '+turn+': unique identities');
  eq(all.map(e.tileKey).sort(),deckKeys,'seed '+seed+' turn '+turn+': exact deck');
}
function makeRng(seed){let s=e.mixSeed32(seed);if(s===0)s=0x9e3779b9;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/0x100000000;};}
function test(seedStart=7100000,deals=500,maxTurns=250){
  assertions=0;const totals={finish:0,block:0,unresolved:0,openingFollowup:0,openingPass:0,stockOneOne:0,totalTurns:0,maxTurns:0,finishMinus:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0}};
  const roundLengths=[];const seenAllocations=new Map();const duplicatePairs=[];
  for(let seed=seedStart;seed<seedStart+deals;seed++){
    const deal=e.dealThreeByNine(seed);
    const allocationKey=deal.hands.map(h=>h.map(e.tileKey).sort().join(',')).join('|')+'|stock='+deal.stock.map(e.tileKey).sort().join(',');
    if(seenAllocations.has(allocationKey))duplicatePairs.push({seed,duplicateOfSeed:seenAllocations.get(allocationKey)});else seenAllocations.set(allocationKey,seed);
    const location=init.locateOneOne(deal.hands,deal.stock);
    if(location.where==='stock')totals.stockOneOne++;
    let state=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:false,previousWinnerIndex:seed%3});
    eq(state.kind,'ready','seed '+seed+': continuation initializer ready');
    if(state.openingFollowup)totals.openingFollowup++;else totals.openingPass++;
    let played=[[1,1],...(state.openingFollowup?[state.openingFollowup.tile]:[])];
    conservation(state,played,seed,state.turns);
    const rng=makeRng(seed ^ 0x5a17c3e1);
    let steps=0;
    while(!state.outcome&&steps<maxTurns){
      const p=state.currentPlayer;const before=state.hands[p].map(t=>[...t]);const beforePasses=state.consecutivePasses;
      const opts=d.turnOptions(state.branchState,state.openingState,before,state.stock);
      let selected=null;
      if(opts.phase==='play'){
        ok(opts.actions.length>0,'seed '+seed+' turn '+state.turns+': nonempty legal actions');
        selected=opts.actions[Math.floor(rng()*opts.actions.length)];
        ok(opts.actions.includes(selected),'seed '+seed+' turn '+state.turns+': policy selects legal action');
      } else eq(opts.actions,[],'seed '+seed+' turn '+state.turns+': pass has no action');
      const next=round.stepRound(state,()=>selected);
      const removed=removedTiles(before,next.hands[p]);played.push(...removed);
      eq(next.turns,state.turns+1,'seed '+seed+': turn counter advances');
      eq(next.consecutivePasses,opts.phase==='pass'?beforePasses+1:0,'seed '+seed+': pass counter transition');
      conservation(next,played,seed,next.turns);
      if(!next.outcome)eq(next.currentPlayer,(p+1)%3,'seed '+seed+': clockwise player advance');
      state=next;steps++;
    }
    if(!state.outcome){totals.unresolved++;}
    else {totals[state.outcome.kind]++;if(state.outcome.kind==='finish')totals.finishMinus[String(state.outcome.minus)]++;}
    roundLengths.push(steps);totals.totalTurns+=steps;totals.maxTurns=Math.max(totals.maxTurns,steps);
  }
  ok(totals.unresolved===0,'all smoke rounds resolve before turn cap');
  eq(totals.finish+totals.block,deals,'every round ends by finish or block');
  const sortedLengths=[...roundLengths].sort((a,b)=>a-b);const medianTurns=sortedLengths.length%2?sortedLengths[(sortedLengths.length-1)/2]:(sortedLengths[sortedLengths.length/2-1]+sortedLengths[sortedLengths.length/2])/2;
  return{passed:true,assertions,seedStart,seedEnd:seedStart+deals-1,seedDraws:deals,uniqueSeedValues:deals,uniqueFullAllocations:seenAllocations.size,duplicateAllocationPairs:duplicatePairs.length,duplicatePairs,totals,meanTurns:totals.totalTurns/deals,medianTurns,limitation:'Deterministic random-legal transition smoke under the current coded branch/opening/block assumptions; no strategy comparison or physical-rule authentication.'};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(test(Number(a[0]||7100000),Number(a[1]||500),Number(a[2]||250)),null,2));}
module.exports={test};
