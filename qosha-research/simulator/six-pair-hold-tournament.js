'use strict';
// Independent matched-seat 3x9 policy tournament; block winners unassigned.
// Run: node qosha-research/simulator/six-pair-hold-tournament.js 1555340 800
const e=require('./engine'),r=require('./round-driver'),init=require('./initializer');
const hold=require('./connector-six-late-policy-enrichment');
const strategies=['min-hand-pips','closed-branch-control','six-pair-hold'];
function stats(xs){const n=xs.length,m=xs.reduce((a,b)=>a+b,0)/n;
 const v=n>1?xs.reduce((a,x)=>a+(x-m)**2,0)/(n-1):0;
 return{n,mean:m,halfWidth95:n>1?1.96*Math.sqrt(v/n):null};}
function median(xs){const a=[...xs].sort((x,y)=>x-y),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;}
function run(start=1555340,count=800){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<1)throw Error('seed/count');
 const by=Object.fromEntries(strategies.map(k=>[k,{appearances:0,finishFirst:0,pips:[],minus:{'-10':0,'-20':0,'-30':0,'-40':0}}]));
 const perSeed=[];let rounds=0,finishes=0,blocks=0,unresolved=0,turns=0;
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('init '+seed);
  const one=Object.fromEntries(strategies.map(k=>[k,{wins:0,pips:0}]));
  for(let rotation=0;rotation<3;rotation++){
   const seatPolicy=[0,1,2].map(seat=>strategies[(seat+rotation)%3]);
   const out=r.runRound(base,(opts,state)=>hold.chooseDiscovery(seatPolicy[state.currentPlayer],opts,
    {seed,rotation,turns:state.turns,player:state.currentPlayer}),{maxTurns:200});
   rounds++;turns+=out.turns;
   if(out.outcome.kind==='finish'){
    finishes++;const k=seatPolicy[out.outcome.playerIndex];by[k].finishFirst++;one[k].wins++;
    if(out.outcome.minus<0)by[k].minus[String(out.outcome.minus)]++;
   }else if(out.outcome.kind==='block')blocks++;else unresolved++;
   for(let seat=0;seat<3;seat++){
    const k=seatPolicy[seat],p=e.pipSum(out.hands[seat]);
    by[k].appearances++;by[k].pips.push(p);one[k].pips+=p;
   }
  }
  perSeed.push(one);
 }
 const out=Object.fromEntries(strategies.map(k=>[k,{appearances:by[k].appearances,
  finishFirst:by[k].finishFirst,finishFirstRate:by[k].finishFirst/by[k].appearances,
  meanFinalPips:by[k].pips.reduce((a,b)=>a+b,0)/by[k].pips.length,
  medianFinalPips:median(by[k].pips),minusFinishes:by[k].minus}]));
 const paired={};
 for(const opponent of strategies.filter(x=>x!=='six-pair-hold')){
  paired['six-pair-hold_minus_'+opponent]={
   finishFirstDeltaPP:stats(perSeed.map(s=>100*(s['six-pair-hold'].wins-s[opponent].wins)/3)),
   finalPipsDelta:stats(perSeed.map(s=>(s['six-pair-hold'].pips-s[opponent].pips)/3))};
 }
 return{engine:'qosa-research-0.5.3',seedStart:start,seedEnd:start+count-1,uniqueDeals:count,
  strategies,rounds,finishes,blocks,unresolved,meanTurns:turns/rounds,
  byStrategy:out,pairedByDeal:paired,
  limitations:'Same 3x9 deals and three seat rotations. All three policies face each other, not all opponent mixes. Finish-first excludes block winner; branch geometry provisional. No match/101 scoring. This tests complete-policy outcome, not the causal benefit of retaining 6-6.'};
}
function test(){const a=run(1555340,12),b=run(1555340,12);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.rounds!==36||a.unresolved||
  strategies.some(k=>a.byStrategy[k].appearances!==36))throw Error('matched tournament replay');
 return{passed:true,rounds:a.rounds,unresolved:a.unresolved};}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1555340),+(a[1]||800)),null,2));}
module.exports={run,test,strategies};
