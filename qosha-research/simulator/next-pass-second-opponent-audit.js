'use strict';
// Reproducible matched holdout: measure whether a same-stone next-pass tie-break
// helps/hurts the SECOND opponent and whether own-mobility loss predicts regret.
// The second opponent's actual hand is used ONLY for post-decision audit, never
// for focal policy selection. Branch opening/locking remains provisional.
// Usage: node qosha-research/simulator/next-pass-second-opponent-audit.js test
//        node qosha-research/simulator/next-pass-second-opponent-audit.js 1373240 600
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner');
const {choose,ownMobility}=require('./next-pass-mobility-guard-holdout');
const profiles=['min-hand-pips','closed-branch-control'];
const modes=['baseline','unrestricted','mobility-guard'];
const key=e.tileKey;
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function halfWidth(a){if(a.length<2)return null;const m=mean(a);
 return 1.96*Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)/a.length);}
function median(a){if(!a.length)return null;const x=[...a].sort((p,q)=>p-q),n=x.length;
 return n%2?x[(n-1)/2]:(x[n/2-1]+x[n/2])/2;}
function playableTiles(branch,opening,hand){
 return new Set(d.actionsForHand(branch,opening,hand).flatMap(a=>
  (a.type==='single'?[a.tile]:(a.tiles||[])).map(key))).size;
}
function event(state,baseline,selected){
 const f=state.currentPlayer,n=(f+1)%3,o=(f+2)%3;
 const a=e.applySinglePlacement(state.branchState,baseline);
 const b=e.applySinglePlacement(state.branchState,selected);
 const count=(br,p)=>playableTiles(br,state.openingState,state.hands[p]);
 return{ownDelta:ownMobility(state,selected)-ownMobility(state,baseline),
  nextDelta:count(b,n)-count(a,n),otherDelta:count(b,o)-count(a,o),
  handSize:state.hands[f].length,otherHandSize:state.hands[o].length,
  nextHandSize:state.hands[n].length,
  changedSide:baseline.side+'>'+selected.side};
}
function play(base,seat,profile,mode){
 let s=r.cloneRoundState(base);
 const known=new Set(['1-1']);
 if(base.openingFollowup)known.add(key(base.openingFollowup.tile));
 const stats={opportunities:0,changes:0,predictedPassGain:0,observedPassGain:0,mobilityDelta:0};
 let firstChange=null,otherWorsened=0,otherImproved=0,nextImproved=0,ownLost=0;
 while(!s.outcome&&s.turns<200){
  const f=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock);
  let action=null;
  if(opts.phase==='play'){
   if(f!==seat)action=chooseBy(profile,opts,{seed:0,turns:s.turns,player:f});
   else if(mode==='baseline')action=chooseBy('min-hand-pips',opts,{seed:0,turns:s.turns,player:f});
   else{
    const baseChoice=chooseBy('min-hand-pips',opts,{seed:0,turns:s.turns,player:f});
    action=choose(opts,s,known,mode,stats);
    if(action!==baseChoice){
     if(action.type!=='single'||baseChoice.type!=='single'||key(action.tile)!==key(baseChoice.tile))
      throw Error('changed stone, not side');
     const ev=event(s,baseChoice,action);
     if(mode==='mobility-guard'&&ev.ownDelta<0)throw Error('guard violated');
     if(!firstChange)firstChange=ev;
     otherWorsened+=+(ev.otherDelta>0);otherImproved+=+(ev.otherDelta<0);
     nextImproved+=+(ev.nextDelta<0);ownLost+=+(ev.ownDelta<0);
    }
   }
  }
  s=r.stepRound(s,()=>action);
  if(action)for(const tile of action.type==='single'?[action.tile]:(action.tiles||[])){
   const k=key(tile);if(known.has(k))throw Error('duplicate tile '+k);known.add(k);
  }
 }
 if(!s.outcome||s.outcome.kind==='unresolved')throw Error('unresolved');
 const o=s.outcome;
 return{win:+(o.kind==='finish'&&o.playerIndex===seat),pips:e.pipSum(s.hands[seat]),
  turns:s.turns,block:+(o.kind==='block'),minus:o.kind==='finish'&&o.playerIndex===seat?o.minus:0,
  endingDoubles:s.hands[seat].filter(t=>t[0]===t[1]).length,
  firstChange,otherWorsened,otherImproved,nextImproved,ownLost,...stats};
}
function stratum(event,feature){
 if(!event)return 'no-change';
 if(feature==='own')return event.ownDelta<0?'own-lost':event.ownDelta>0?'own-gained':'own-same';
 if(feature==='other')return event.otherDelta>0?'other-more':event.otherDelta<0?'other-less':'other-same';
 if(feature==='next')return event.nextDelta>0?'next-more':event.nextDelta<0?'next-less':'next-same';
 if(feature==='phase')return event.handSize<=4?'late-1to4':'early-5plus';
 throw Error('feature');
}
function summarize(rows,mode,feature){
 const labels=feature==='own'?['no-change','own-lost','own-same','own-gained']:
  feature==='other'?['no-change','other-more','other-same','other-less']:
  feature==='next'?['no-change','next-more','next-same','next-less']:
  ['no-change','late-1to4','early-5plus'];
 const out={};
 for(const label of labels){
  const subset=rows.filter(x=>stratum(x.out[mode].firstChange,feature)===label);
  if(!subset.length)continue;
  const deltas=subset.map(x=>x.out[mode].win-x.out.baseline.win);
  const seedGroups=new Map();
  for(const x of subset){if(!seedGroups.has(x.seed))seedGroups.set(x.seed,[]);
   seedGroups.get(x.seed).push(x.out[mode].win-x.out.baseline.win);}
  const seedMeans=[...seedGroups.values()].map(mean);
  out[label]={focalAppearances:subset.length,distinctSeeds:seedMeans.length,
   finishFirstDeltaPP:100*mean(deltas),
   exploratorySeedCluster95HalfWidthPP:100*halfWidth(seedMeans),
   pipsDelta:mean(subset.map(x=>x.out[mode].pips-x.out.baseline.pips))};
 }
 return out;
}
function run(start=1373240,count=600){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<2)throw Error('bad arguments');
 const summaries={};let rounds=0;
 for(const profile of profiles){
  const rows=[],seedDeltas={unrestricted:[],'mobility-guard':[]};
  for(let seed=start;seed<start+count;seed++){
   const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(base.kind!=='ready')throw Error('initializer unresolved');
   const wins={baseline:0,unrestricted:0,'mobility-guard':0};
   for(let seat=0;seat<3;seat++){
    const out={};
    for(const mode of modes){out[mode]=play(base,seat,profile,mode);wins[mode]+=out[mode].win;rounds++;}
    rows.push({seed,seat,startingDoubles:base.hands[seat].filter(t=>t[0]===t[1]).length,out});
   }
   for(const mode of modes.slice(1))seedDeltas[mode].push((wins[mode]-wins.baseline)/3);
  }
  const byMode={},contrasts={},strata={};
  for(const mode of modes){
   const x=rows.map(z=>z.out[mode]),sum=k=>x.reduce((s,z)=>s+z[k],0);
   byMode[mode]={appearances:x.length,finishFirstRate:mean(x.map(z=>z.win)),
    meanFinalPips:mean(x.map(z=>z.pips)),medianFinalPips:median(x.map(z=>z.pips)),
    meanTurns:mean(x.map(z=>z.turns)),blockRate:mean(x.map(z=>z.block)),
    meanStartingDoubles:mean(rows.map(z=>z.startingDoubles)),
    meanEndingDoubles:mean(x.map(z=>z.endingDoubles)),
    minusFinishCounts:Object.fromEntries([0,-10,-20,-30,-40].map(v=>[v,x.filter(z=>z.win&&z.minus===v).length])),
    opportunities:sum('opportunities'),changes:sum('changes'),
    otherWorsened:sum('otherWorsened'),otherImproved:sum('otherImproved'),
    nextImproved:sum('nextImproved'),ownLost:sum('ownLost'),
    predictedNextPassGainPPPerChange:sum('changes')?100*sum('predictedPassGain')/sum('changes'):null};
  }
  for(const mode of modes.slice(1)){
   contrasts[mode]={finishFirstDeltaPP:100*mean(seedDeltas[mode]),
    exploratorySeedCluster95HalfWidthPP:100*halfWidth(seedDeltas[mode]),
    pipsDelta:mean(rows.map(z=>z.out[mode].pips-z.out.baseline.pips))};
   strata[mode]=Object.fromEntries(['own','other','next','phase'].map(feature=>
    [feature,summarize(rows,mode,feature)]));
  }
  summaries[profile]={byMode,contrasts,strata};
 }
 return{schema:'qosa-second-opponent-audit/v1',timestampBaku:'2026-10-24 02:51 (+04)',
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0; provisional branch opening',
  mode:'3x9',seedRange:[start,start+count-1],deals:count,fullContinuations:rounds,
  pairedHiddenWorldContinuations:0,profiles,modes,
  method:'matched initial deals, focal seats and opponent policies; classify FIRST changed same-stone side choice; evaluate actual next and second opponent legal-tile counts post hoc (never used by policy)',
  limitations:'Selected first-change strata; outcome comparisons include later trajectory divergence; seed-cluster CIs exploratory, no multiplicity correction; provisional branch semantics; uniform unseen tile allocation; no block winner; finish-first not match win',
  summaries,next:'Disjoint-seed validation of first-change strata, especially own-loss and second-opponent-more groups; obtain real-game locked/open branch fixture'};
}
function test(){
 const a=run(1373240,3),b=run(1373240,3);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.fullContinuations!==54)throw Error('replay');
 for(const p of profiles){
  const z=a.summaries[p].byMode['mobility-guard'];
  if(z.ownLost!==0)throw Error('own mobility guard failed');
 }
 return{passed:true,continuations:a.fullContinuations};
}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1373240),+(a[1]||600)),null,2));}
module.exports={play,run,test};
