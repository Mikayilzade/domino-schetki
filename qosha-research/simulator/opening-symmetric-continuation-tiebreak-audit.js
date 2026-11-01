'use strict';
// Matched-seed continuation tie-break audit with a seeded symmetric 1-1 follow-up.
// Side-order baseline and action-orbit continuation use the same deal, opener, seats, and policy ranks.
// Physical four-branch, late-reopening, and block/tie rules remain provisional.
const e=require('./engine'),init=require('./initializer'),round=require('./round-driver'),basePolicy=require('./strategy-runner'),orbitPolicy=require('./branch-label-symmetric-tiebreak');
const SIDES=e.SIDES;
const MIXES=[['random-legal','min-hand-pips','closed-branch-control'],['fast-doubles','moderate-double-hold','closed-branch-control']];
function check(x,m){if(!x)throw Error('opening-symmetric-continuation-audit: '+m);}
function isDouble(t){return t[0]===t[1];}
function countDoubles(hand){return hand.filter(isDouble).length;}
function selector(seed){return choices=>choices[(seed>>>0)%choices.length];}
function dealKey(d,pw){return d.hands.map(h=>h.map(e.tileKey).sort().join(',')).join('|')+'|stock='+d.stock.map(e.tileKey).sort().join(',')+'|previousWinner='+pw;}
function median(xs){const a=[...xs].sort((x,y)=>x-y),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;}
function mean(xs){return xs.length?xs.reduce((s,x)=>s+x,0)/xs.length:null;}
function rateCI(clusterRates){const xs=clusterRates.filter(Number.isFinite);if(xs.length<2)return{clusters:xs.length,low:null,high:null};const m=mean(xs),v=xs.reduce((s,x)=>s+(x-m)*(x-m),0)/(xs.length-1),se=Math.sqrt(v/xs.length);return{clusters:xs.length,mean:m,low:Math.max(0,m-1.96*se),high:Math.min(1,m+1.96*se)};}
function emptyStrategy(){return{appearances:0,firstFinishes:0,finalPips:[],openingHandDoubles:0,endingDoubles:0,minusFirstFinishes:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0},doubleExposure:{}};}
function emptyArm(mix){const byStrategy={};for(const n of mix)byStrategy[n]=emptyStrategy();return{rounds:0,finishes:0,blocks:0,unresolved:0,turns:[],minus:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0},byStrategy};}
function recordArm(a,out,names,base){
 a.rounds++;a.turns.push(out.turns);
 if(out.outcome.kind==='finish'){a.finishes++;const n=names[out.outcome.playerIndex],m=a.byStrategy[n],k=String(out.outcome.minus||0);m.firstFinishes++;m.minusFirstFinishes[k]=(m.minusFirstFinishes[k]||0)+1;a.minus[k]=(a.minus[k]||0)+1;}
 else if(out.outcome.kind==='block')a.blocks++;else a.unresolved++;
 for(let seat=0;seat<3;seat++){
  const n=names[seat],m=a.byStrategy[n],start=base.hands[seat],end=out.hands[seat];
  m.appearances++;m.finalPips.push(e.pipSum(end));m.openingHandDoubles+=countDoubles(start);m.endingDoubles+=countDoubles(end);
  for(const tile of start.filter(isDouble)){const k=e.tileKey(tile);if(!m.doubleExposure[k])m.doubleExposure[k]={startOwned:0,endRetained:0};m.doubleExposure[k].startOwned++;if(end.some(t=>e.tileKey(t)===k))m.doubleExposure[k].endRetained++;}
 }
}
function finalizeArm(a){
 const byStrategy={};for(const [name,m] of Object.entries(a.byStrategy)){const n=m.appearances;byStrategy[name]={appearances:n,firstFinishes:m.firstFinishes,firstFinishRate:n?m.firstFinishes/n:null,meanFinalPips:mean(m.finalPips),medianFinalPips:median(m.finalPips),meanOpeningHandDoubles:n?m.openingHandDoubles/n:null,meanEndingDoubles:n?m.endingDoubles/n:null,minusFirstFinishes:m.minusFirstFinishes,doubleExposure:Object.fromEntries(Object.entries(m.doubleExposure).map(([k,v])=>[k,{...v,retentionRate:v.startOwned?v.endRetained/v.startOwned:null}]))};}
 return{rounds:a.rounds,finishes:a.finishes,blocks:a.blocks,unresolved:a.unresolved,finishRate:a.rounds?a.finishes/a.rounds:null,blockRate:a.rounds?a.blocks/a.rounds:null,meanTurns:mean(a.turns),medianTurns:median(a.turns),minus:a.minus,byStrategy};
}
function emptyPair(){return{pairs:0,bothFinish:0,bothBlock:0,kindChanged:0,finishSeatChanged:0,finishStrategyChanged:0,minusChanged:0,turnDelta:0,finalPipDelta:0,perSeed:{}};}
function recordPair(z,seed,baseline,orbit){
 z.pairs++;const c=z.perSeed[seed]||(z.perSeed[seed]={pairs:0,kindChanged:0,bothFinish:0,finishChanged:0});c.pairs++;
 if(baseline.outcome.kind!==orbit.outcome.kind){z.kindChanged++;c.kindChanged++;}
 if(baseline.outcome.kind==='finish'&&orbit.outcome.kind==='finish'){
  z.bothFinish++;c.bothFinish++;
  if(baseline.outcome.playerIndex!==orbit.outcome.playerIndex){z.finishSeatChanged++;z.finishStrategyChanged++;c.finishChanged++;}
  if((baseline.outcome.minus||0)!==(orbit.outcome.minus||0))z.minusChanged++;
 }else if(baseline.outcome.kind==='block'&&orbit.outcome.kind==='block')z.bothBlock++;
 z.turnDelta+=orbit.turns-baseline.turns;
 z.finalPipDelta+=orbit.hands.reduce((s,h,i)=>s+e.pipSum(h)-e.pipSum(baseline.hands[i]),0);
}
function finalizePair(z){
 const clusterKind=Object.values(z.perSeed).map(x=>x.kindChanged/x.pairs);
 const clusterFinish=Object.values(z.perSeed).filter(x=>x.bothFinish>0).map(x=>x.finishChanged/x.bothFinish);
 return{pairs:z.pairs,bothFinish:z.bothFinish,bothBlock:z.bothBlock,kindChanged:z.kindChanged,kindChangeRate:z.pairs?z.kindChanged/z.pairs:null,kindChangeDealClustered95CI:rateCI(clusterKind),finishSeatChanged:z.finishSeatChanged,finishStrategyChanged:z.finishStrategyChanged,finishChangeRateAmongBothFinish:z.bothFinish?z.finishSeatChanged/z.bothFinish:null,finishChangeDealClustered95CI:rateCI(clusterFinish),minusChanged:z.minusChanged,minusChangeRateAmongBothFinish:z.bothFinish?z.minusChanged/z.bothFinish:null,meanTurnDeltaOrbitMinusBaseline:z.pairs?z.turnDelta/z.pairs:null,meanFinalPipDeltaPerSeatOrbitMinusBaseline:z.pairs?z.finalPipDelta/(z.pairs*3):null};
}
function chooseOrbit(name,opts,ctx){
 // random-legal is already uniform over the full action set; retain its exact existing seeded selector.
 if(name==='random-legal')return basePolicy.chooseBy(name,opts,ctx);
 return orbitPolicy.chooseSymmetric(name,opts,ctx,'orbit');
}
function run(startSeed=3408720,count=500,maxTurns=200){
 check(Number.isSafeInteger(startSeed)&&startSeed>=0,'start seed');check(Number.isInteger(count)&&count>0&&count<=2000,'count');check(Number.isInteger(maxTurns)&&maxTurns>0&&maxTurns<=200,'turn cap');
 const seen=new Map(),duplicates=[],seeds=[],opening={followupAvailable:0,followupPass:0,sideCounts:Object.fromEntries(SIDES.map(s=>[s,0])),tileChoiceMismatches:0,handStateMismatches:0,conservationChecks:0,conservationFailures:0};
 for(let seed=startSeed;seed<startSeed+count;seed++){const d=e.dealThreeByNine(seed),pw=seed%3,k=dealKey(d,pw);if(seen.has(k)){duplicates.push({seed,duplicateOfSeed:seen.get(k)});continue;}seen.set(k,seed);seeds.push(seed);}
 const paired={};
 for(let mi=0;mi<MIXES.length;mi++){
  const mix=MIXES[mi],a=emptyArm(mix),b=emptyArm(mix),z=emptyPair();
  for(const seed of seeds){
   const deal=e.dealThreeByNine(seed),prev=seed%3;
   const base=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:false,previousWinnerIndex:prev,chooseFollowupSide:selector(seed)});
   check(base.kind==='ready','initializer not ready for seed '+seed);
   if(base.openingPassed)opening.followupPass++;else{opening.followupAvailable++;opening.sideCounts[base.openingFollowup.side]++;}
   // The original deal is conserved by hands + stock + center 1-1 + the follow-up tile (if played).
   const original=[...deal.hands.flat(),...deal.stock].map(e.tileKey).sort();
   const accounted=[...base.hands.flat(),...base.stock,[1,1],...(base.openingFollowup?[base.openingFollowup.tile]:[])].map(e.tileKey).sort();
   opening.conservationChecks++;if(JSON.stringify(original)!==JSON.stringify(accounted))opening.conservationFailures++;
   const canonical=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:false,previousWinnerIndex:prev});
   if(!base.openingPassed&&!canonical.openingPassed){
    if(e.tileKey(base.openingFollowup.tile)!==e.tileKey(canonical.openingFollowup.tile)||base.openingFollowup.handIndex!==canonical.openingFollowup.handIndex||base.openingFollowup.to!==canonical.openingFollowup.to)opening.tileChoiceMismatches++;
    if(JSON.stringify(base.hands)!==JSON.stringify(canonical.hands))opening.handStateMismatches++;
   }
   for(let rotation=0;rotation<3;rotation++){
    const names=[0,1,2].map(seat=>mix[(seat+rotation)%3]),ctx={seed,rotation,salt:mi+1};
    const baseline=round.runRound(base,(opts,state)=>basePolicy.chooseBy(names[state.currentPlayer],opts,{...ctx,turns:state.turns,player:state.currentPlayer}),{maxTurns});
    const orbit=round.runRound(base,(opts,state)=>chooseOrbit(names[state.currentPlayer],opts,{...ctx,turns:state.turns,player:state.currentPlayer,branchState:state.branchState}),{maxTurns});
    recordArm(a,baseline,names,base);recordArm(b,orbit,names,base);recordPair(z,seed,baseline,orbit);
   }
  }
  paired['mix'+(mi+1)]={strategies:mix,sideOrder:finalizeArm(a),actionOrbit:finalizeArm(b),paired:finalizePair(z)};
 }
 return{schema:'qosa-opening-symmetric-continuation-tiebreak/v1',engineVersion:'qosa-research-0.5.3',rulesVersion:'recovered qosa-1.0.0 / 3x9 + stock; branch reopening and block/tie scoring provisional',seedStart:startSeed,seedEnd:startSeed+count-1,seedDraws:count,uniqueFullAllocations:seeds.length,duplicateAllocationPairs:duplicates.length,duplicatePairs:duplicates,previousWinnerRule:'previousWinnerIndex = seed mod 3',openingSelector:'seeded symmetric follow-up side: unsigned seed modulo four legal sides; same selector for both arms',opening,fullRoundDesign:{mixes:MIXES,seatRotations:3,roundPairsPerMix:seeds.length*3,totalPairedRoundComparisons:seeds.length*3*MIXES.length,totalRoundsAcrossBothArms:seeds.length*3*MIXES.length*2,maxTurns,sideOrderTieBreak:'existing strategy-runner stableKey/raw side order',actionOrbitTieBreak:'preserve primary rank; choose top action orbit uniformly, then a member uniformly; random-legal keeps existing full-action selector'},pairedFullRoundComparisons:paired,strategyStrengthComparisons:0,hiddenWorldAllocations:0,decisionRegretEvaluations:0,interpretation:'Matched tie-break sensitivity under a fixed seeded symmetric opener; not strategy superiority, human win-rate, or regret. Branch/block assumptions remain provisional.',confidence:'High for deterministic matched comparison; low external validity until physical branch and blocked-tie rules are authenticated.',exactNextAction:'Authenticate late-arrival branch reopening and blocked-round tie scoring; then run a matched-seed strategy holdout with the symmetric opener and action-orbit policy held fixed.'};
}
function test(){
 const a=run(3408720,8,80),b=run(3408720,8,80);
 check(JSON.stringify(a)===JSON.stringify(b),'deterministic replay');
 check(a.uniqueFullAllocations===8&&a.duplicateAllocationPairs===0,'deal dedup');
 check(a.opening.conservationChecks===16&&a.opening.conservationFailures===0,'opening conservation');
 check(a.opening.tileChoiceMismatches===0&&a.opening.handStateMismatches===0,'same opener tile/hand');
 check(a.fullRoundDesign.totalPairedRoundComparisons===48,'paired count');
 check(Object.values(a.pairedFullRoundComparisons).every(x=>x.sideOrder.unresolved===0&&x.actionOrbit.unresolved===0),'resolved rounds');
 return{passed:true,replayDeals:8,uniqueDeals:8,pairedRoundComparisons:48,openingConservationFailures:0};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(Number(a[0]||3408720),Number(a[1]||500),Number(a[2]||200)),null,2));}
module.exports={run,test,selector,chooseOrbit};
