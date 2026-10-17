'use strict';
// Reproducible, paired, full-information retained-link x opponent-stage experiment.
// node qosha-research/simulator/link-stage-interaction.js test
// node qosha-research/simulator/link-stage-interaction.js run 828000 2000
const e=require('./engine'),init=require('./initializer'),round=require('./round-driver'),dispatch=require('./turn-dispatcher');
const first=require('./first-tile-disagreement'),links=require('./first-tile-link-strata');
const prior=require('./tiebreak-priority-holdout'),canonical=require('./canonical-multiset-holdout');
function blank(){return{n:0,wh:0,wl:0,ph:0,pl:0,mh:0,ml:0,bh:0,bl:0,th:0,tl:0,rh:0,rl:0,dh:0,dl:0,seeds:{}};}
function threat(s){
 if(s.outcome)return{actions:0,finish:false,minus:false};
 const o=dispatch.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
 if(o.phase!=='play')return{actions:0,finish:false,minus:false};
 let finish=false,minus=false;
 for(const a of o.actions){const x=round.stepRound(s,()=>a);
  if(x.outcome&&x.outcome.kind==='finish'&&x.outcome.playerIndex===s.currentPlayer){
   finish=true;if(x.outcome.minus<0)minus=true;
  }
 }
 return{actions:o.actions.length,finish,minus};
}
function add(z,h,l,seed,nh,nl){
 z.n++;z.wh+=Number(h.finishFirst);z.wl+=Number(l.finishFirst);
 z.ph+=h.remainder;z.pl+=l.remainder;z.mh+=Number(h.minus<0);z.ml+=Number(l.minus<0);
 z.bh+=Number(h.outcome==='block');z.bl+=Number(l.outcome==='block');
 z.th+=h.turns;z.tl+=l.turns;z.rh+=Number(nh.finish);z.rl+=Number(nl.finish);
 z.dh+=Number(h.finishFirst&&!l.finishFirst);z.dl+=Number(l.finishFirst&&!h.finishFirst);
 const g=z.seeds[seed]||(z.seeds[seed]={n:0,d:0});g.n++;g.d+=Number(h.finishFirst)-Number(l.finishFirst);
}
function done(z){
 if(!z.n)return{n:0};
 const n=z.n,d=(z.wh-z.wl)/n,rows=Object.values(z.seeds),N=rows.length;
 const se=N>1?Math.sqrt(N/(N-1)*rows.reduce((a,g)=>a+(g.d-d*g.n)**2,0)/(n*n)):null;
 return{n,seeds:N,finishHigh:z.wh/n,finishLow:z.wl/n,finishDelta:d,
 cluster95:se===null?null:[d-1.96*se,d+1.96*se],
 meanPipsHigh:z.ph/n,meanPipsLow:z.pl/n,minusHigh:z.mh/n,minusLow:z.ml/n,
 blocksHigh:z.bh/n,blocksLow:z.bl/n,meanTurnsHigh:z.th/n,meanTurnsLow:z.tl/n,
 nextImmediateFinishOptionHigh:z.rh/n,nextImmediateFinishOptionLow:z.rl/n,
 discordHigh:z.dh,discordLow:z.dl};
}
function run({startSeed=828000,count=2000,withBaseline=true}={}){
 const keys=['all','opp1to2','opp3to5','opp6plus','own1to3','own4to6','own7plus',
 'opp3to5_own4to6','opp3to5_own7plus','opp6plus_own4to6','opp6plus_own7plus',
 'nextActionsEqual','nextActionsHighMore','nextActionsHighLess',
 'nextThreatEqual','nextThreatHighOnly','nextThreatLowOnly'];
 const g=Object.fromEntries(keys.map(k=>[k,blank()]));
 const meta={scanned:0,firstDisagreements:0,linked:0,primaryScoreMismatch:0,mutations:0,
 nextThreatDiff:0,threatHighOnly:0,threatLowOnly:0,examples:[]};
 for(let seed=startSeed;seed<startSeed+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('init '+seed);
  for(let rotation=0;rotation<3;rotation++){
   meta.scanned++;const f=first.firstDisagreement(base,seed,rotation);if(!f)continue;
   meta.firstDisagreements++;
   if(prior.cmpPrimary(f.policy,f.legacy,f.tileFirst)!==0)meta.primaryScoreMismatch++;
   const la=links.linkCount(links.afterHand(f.state,f.legacy)),lb=links.linkCount(links.afterHand(f.state,f.tileFirst));
   if(la===lb)continue;meta.linked++;
   const original=JSON.stringify(f.state);
   const a=first.forced(f,f.legacy),b=first.forced(f,f.tileFirst);
   const sa=round.stepRound(f.state,()=>f.legacy),sb=round.stepRound(f.state,()=>f.tileFirst);
   const na=threat(sa),nb=threat(sb);
   if(JSON.stringify(f.state)!==original)meta.mutations++;
   const high=la>lb?a:b,low=la>lb?b:a,nh=la>lb?na:nb,nl=la>lb?nb:na;
   const opp=f.state.hands[(f.state.currentPlayer+1)%3].length,own=f.state.hands[f.state.currentPlayer].length;
   const oc=own<=3?'own1to3':own<=6?'own4to6':'own7plus';
   const pc=opp<=2?'opp1to2':opp<=5?'opp3to5':'opp6plus';
   const record=k=>add(g[k],high,low,seed,nh,nl);
   record('all');record(oc);record(pc);
   if(g[pc+'_'+oc])record(pc+'_'+oc);
   record(nh.actions===nl.actions?'nextActionsEqual':nh.actions>nl.actions?'nextActionsHighMore':'nextActionsHighLess');
   record(nh.finish===nl.finish?'nextThreatEqual':nh.finish?'nextThreatHighOnly':'nextThreatLowOnly');
   if(nh.finish!==nl.finish){meta.nextThreatDiff++;if(nh.finish)meta.threatHighOnly++;else meta.threatLowOnly++;}
   if(meta.examples.length<8&&high.finishFirst!==low.finishFirst)
    meta.examples.push({seed,rotation,turn:f.turn,policy:f.policy,opp,own,
     highTile:e.tileKey(la>lb?f.legacy.tile:f.tileFirst.tile),
     lowTile:e.tileKey(la>lb?f.tileFirst.tile:f.legacy.tile),
     highWon:high.finishFirst,lowWon:low.finishFirst,
     highNextActions:nh.actions,lowNextActions:nl.actions,
     highNextFinish:nh.finish,lowNextFinish:nl.finish});
  }
 }
 if(meta.primaryScoreMismatch||meta.mutations)throw Error('invariants '+JSON.stringify(meta));
 if(meta.linked!==g.all.n||g.opp1to2.n+g.opp3to5.n+g.opp6plus.n!==meta.linked)throw Error('accounting');
 const out={schema:'qosa-link-stage-interaction/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
 mode:'3x9',seedRange:startSeed+'..'+(startSeed+count-1),deals:count,rotations:3,
 strategies:prior.POLICIES,forcedContinuations:meta.linked*2,meta,
 groups:Object.fromEntries(Object.entries(g).map(([k,v])=>[k,done(v)])),
 limitations:'First distinct-tile equal-primary-score disagreement, fully observed forced deterministic continuation. Link count is observational and covaries with tile/end geometry. Next immediate finish is legal availability, not bot selection. Assumed branch rules, unassigned block winner, exploratory seed-cluster CIs; no hidden-world posterior.'};
 if(withBaseline){
  const x=canonical.run({startSeed,count}).byMode['canonical-multiset'];
  if(x.rounds!==count*3||x.unresolved)throw Error('baseline');
  out.baseline={rounds:x.rounds,finishes:x.finishes,blocks:x.blocks,meanTurns:x.meanTurns,byStrategy:x.byStrategy};
 }
 return out;
}
function test(){
 const a=run({startSeed:859000,count:16,withBaseline:false});
 const b=run({startSeed:859000,count:16,withBaseline:false});
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('nondeterministic');
 if(a.meta.scanned!==48||a.meta.linked!==4||a.forcedContinuations!==8)throw Error('regression');
 return{passed:true,seeds:a.seedRange,positions:a.meta.linked,immediateThreatChecks:a.meta.linked*2};
}
if(require.main===module){
 const mode=process.argv[2]||'test';
 console.log(JSON.stringify(mode==='test'?test():run({startSeed:Number(process.argv[3]||828000),count:Number(process.argv[4]||2000)}),null,2));
}
module.exports={run,test,threat};
