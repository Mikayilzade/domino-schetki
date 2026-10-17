'use strict';
// Independent first-distinct-tile matched holdout, grouping by retained double/connector links.
// Observational strata: no causal interpretation without further controls.
const e=require('./engine'),init=require('./initializer'),round=require('./round-driver');
const prior=require('./tiebreak-priority-holdout'),canonical=require('./canonical-multiset-holdout');
const first=require('./first-tile-disagreement');
const POLICIES=prior.POLICIES;
function linkCount(hand){
 const doubles=new Set(hand.filter(t=>t[0]===t[1]).map(t=>t[0]));
 return hand.filter(t=>t[0]!==t[1]).reduce((n,t)=>n+Number(doubles.has(t[0]))+Number(doubles.has(t[1])),0);
}
function afterHand(state,action){
 const hand=state.hands[state.currentPlayer].map(t=>[...t]);
 const key=e.tileKey(action.tile),index=hand.findIndex(t=>e.tileKey(t)===key);
 if(index<0)throw Error('missing chosen tile');
 return hand.filter((_,i)=>i!==index);
}
function accessibleEndDiversity(s){
 const opened=s.openingState.openedNumbers;
 return new Set(e.SIDES.filter(k=>s.branchState.branches[k].active).map(k=>s.branchState.branches[k].end).filter(n=>opened.has(n))).size;
}
function empty(){return{n:0,firstA:0,firstB:0,minusA:0,minusB:0,blockA:0,blockB:0,pipsA:0,pipsB:0,turnsA:0,turnsB:0,discordantFirstA:0,discordantFirstB:0,seedRows:{}};}
function record(z,a,b,seed){
 z.n++;z.firstA+=Number(a.finishFirst);z.firstB+=Number(b.finishFirst);
 z.minusA+=Number(a.minus<0);z.minusB+=Number(b.minus<0);
 z.blockA+=Number(a.outcome==='block');z.blockB+=Number(b.outcome==='block');
 z.pipsA+=a.remainder;z.pipsB+=b.remainder;z.turnsA+=a.turns;z.turnsB+=b.turns;
 z.discordantFirstA+=Number(a.finishFirst&&!b.finishFirst);
 z.discordantFirstB+=Number(b.finishFirst&&!a.finishFirst);
 const g=z.seedRows[seed]||(z.seedRows[seed]={n:0,d:0});
 g.n++;g.d+=Number(a.finishFirst)-Number(b.finishFirst);
}
function finish(z){
 const n=z.n;if(!n)return{n:0};
 const mean=(x)=>x/n,delta=mean(z.firstA-z.firstB);
 const groups=Object.values(z.seedRows),G=groups.length;
 const se=G>1?Math.sqrt(G/(G-1)*groups.reduce((s,g)=>s+Math.pow(g.d-delta*g.n,2),0)/(n*n)):null;
 return{n,seeds:G,firstA:mean(z.firstA),firstB:mean(z.firstB),firstDiffAminusB:delta,
 firstDiffCluster95:se===null?null:[delta-1.96*se,delta+1.96*se],
 discordantFirstA:z.discordantFirstA,discordantFirstB:z.discordantFirstB,
 minusA:mean(z.minusA),minusB:mean(z.minusB),
 blockA:mean(z.blockA),blockB:mean(z.blockB),
 meanPipsA:mean(z.pipsA),meanPipsB:mean(z.pipsB),
 meanTurnsA:mean(z.turnsA),meanTurnsB:mean(z.turnsB)};
}
function run({startSeed=822000,count=2000,withBaseline=true}={}){
 const all=empty(),link=empty(),linkMobilitySame=empty(),linkMobilityFavorsA=empty(),linkMobilityFavorsB=empty();
 const noLink=empty(),cohorts=[empty(),empty()],policies=Object.fromEntries(POLICIES.map(p=>[p,empty()]));
 const meta={scanned:0,eligible:0,linked:0,noLinkDifference:0,moreLinksLegacy:0,moreLinksTileFirst:0,
 accessibleEndDiversityChanged:0,moreDiversityHighLink:0,lessDiversityHighLink:0,
 mobilityChanged:0,immediateUnavailable:0,primaryScoreMismatches:0,sourceMutation:0,examples:[]};
 for(let seed=startSeed;seed<startSeed+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('init '+seed);
  for(let rotation=0;rotation<3;rotation++){
   meta.scanned++;
   const f=first.firstDisagreement(base,seed,rotation);if(!f)continue;
   meta.eligible++;
   if(prior.cmpPrimary(f.policy,f.legacy,f.tileFirst)!==0)meta.primaryScoreMismatches++;
   const before=JSON.stringify({hands:f.state.hands,branches:f.state.branchState,turns:f.state.turns});
   const a=first.forced(f,f.legacy),b=first.forced(f,f.tileFirst);
   if(JSON.stringify({hands:f.state.hands,branches:f.state.branchState,turns:f.state.turns})!==before)meta.sourceMutation++;
   record(all,a,b,seed);
   const la=linkCount(afterHand(f.state,f.legacy)),lb=linkCount(afterHand(f.state,f.tileFirst));
   const sa=round.stepRound(f.state,()=>f.legacy),sb=round.stepRound(f.state,()=>f.tileFirst);
   const da=accessibleEndDiversity(sa),db=accessibleEndDiversity(sb);
   if(da!==db)meta.accessibleEndDiversityChanged++;
   const ma=a.immediate?a.immediate.actions:null,mb=b.immediate?b.immediate.actions:null;
   if(ma===null||mb===null)meta.immediateUnavailable++;else if(ma!==mb)meta.mobilityChanged++;
   if(la===lb){meta.noLinkDifference++;record(noLink,a,b,seed);continue;}
   meta.linked++;
   const high=la>lb?a:b,low=la>lb?b:a;
   if(la>lb)meta.moreLinksLegacy++;else meta.moreLinksTileFirst++;
   record(link,high,low,seed);
   record(cohorts[seed<startSeed+Math.floor(count/2)?0:1],high,low,seed);
   record(policies[f.policy],high,low,seed);
   const highD=la>lb?da:db,lowD=la>lb?db:da;
   if(highD>lowD)meta.moreDiversityHighLink++;if(highD<lowD)meta.lessDiversityHighLink++;
   if(ma!==null&&mb!==null){
    const highM=la>lb?ma:mb,lowM=la>lb?mb:ma;
    if(highM===lowM)record(linkMobilitySame,high,low,seed);
    else if(highM>lowM)record(linkMobilityFavorsA,high,low,seed);
    else record(linkMobilityFavorsB,high,low,seed);
   }
   if(meta.examples.length<10&&high.finishFirst!==low.finishFirst)
    meta.examples.push({seed,rotation,policy:f.policy,turn:f.turn,highTile:e.tileKey(la>lb?f.legacy.tile:f.tileFirst.tile),
      lowTile:e.tileKey(la>lb?f.tileFirst.tile:f.legacy.tile),highLinks:Math.max(la,lb),lowLinks:Math.min(la,lb),
      highFirst:high.finishFirst,lowFirst:low.finishFirst,highPips:high.remainder,lowPips:low.remainder,highNextActions:la>lb?ma:mb,lowNextActions:la>lb?mb:ma});
  }
 }
 if(meta.primaryScoreMismatches||meta.sourceMutation||!meta.eligible)throw Error('invariant failed '+JSON.stringify(meta));
 const result={schema:'qosa-first-tile-link-strata/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
 seedRange:startSeed+'..'+(startSeed+count-1),deals:count,rotations:3,pairedContinuations:meta.eligible*2,
 strategies:POLICIES,meta,legacyVsTileFirst:finish(all),higherRetainedDoubleConnectorLinksVsLower:finish(link),
 equalNextOpponentActionCount:finish(linkMobilitySame),higherLinkAlsoMoreNextOpponentActions:finish(linkMobilityFavorsA),
 higherLinkAlsoFewerNextOpponentActions:finish(linkMobilityFavorsB),equalRetainedLinksLegacyVsTileFirst:finish(noLink),
 independentSeedHalves:cohorts.map(finish),byPolicy:Object.fromEntries(POLICIES.map(p=>[p,finish(policies[p])])),
 note:'Higher link count is an observational structural feature, not a randomized intervention; it can correlate with different tile identity, end diversity, and opponent mobility.'};
 if(withBaseline){
  const baseline=canonical.run({startSeed,count});
  const b=baseline.byMode['canonical-multiset'];
  if(b.rounds!==count*3||b.unresolved!==0)throw Error('baseline invalid');
  result.baseline={mode:'canonical-multiset',rounds:b.rounds,finishes:b.finishes,blocks:b.blocks,meanTurns:b.meanTurns,byStrategy:b.byStrategy};
 }
 return result;
}
function test(){
 const a=run({startSeed:859000,count:16,withBaseline:false}),b=run({startSeed:859000,count:16,withBaseline:false});
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('nondeterministic');
 if(a.meta.scanned!==48||a.pairedContinuations!==2*a.meta.eligible||a.meta.linked+a.meta.noLinkDifference!==a.meta.eligible)throw Error('bad accounting');
 if(a.meta.primaryScoreMismatches||a.meta.sourceMutation)throw Error('invariants');
 return{passed:true,seeds:a.seedRange,eligible:a.meta.eligible,linked:a.meta.linked};
}
if(require.main===module){
 const mode=process.argv[2]||'test';
 console.log(JSON.stringify(mode==='test'?test():run({startSeed:Number(process.argv[3]||822000),count:Number(process.argv[4]||2000)}),null,2));
}
module.exports={linkCount,afterHand,accessibleEndDiversity,run,test};