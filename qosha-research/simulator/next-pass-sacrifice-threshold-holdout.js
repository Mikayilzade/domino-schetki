'use strict';
// Reproducible 3x9 matched holdout: conditional sacrifice of own legal mobility.
// Branch opening/locking remains provisional; opponent hands are only read post-choice for audit.
// node qosha-research/simulator/next-pass-sacrifice-threshold-holdout.js test
// node qosha-research/simulator/next-pass-sacrifice-threshold-holdout.js 1374640 600
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner');
const {passProbability}=require('./next-pass-tiebreak-holdout');
const {ownMobility}=require('./next-pass-mobility-guard-holdout');
const deck=e.createDoubleSixDeck(),key=e.tileKey;
const profiles=['min-hand-pips','closed-branch-control'];
const modes=['baseline','unrestricted','mobility-guard','conditional-sacrifice'];
const THRESHOLD={nextPassGain:0.20,otherPassGain:0.15,opponentLegalTileReductionPerOwnLoss:1.5};
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function halfWidth(a){if(a.length<2)return null;const m=mean(a);return 1.96*Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)/a.length);}
function median(a){if(!a.length)return null;const b=[...a].sort((x,y)=>x-y);return b.length%2?b[(b.length-1)/2]:(b[b.length/2-1]+b[b.length/2])/2;}
function playable(branch,opening,hand){return new Set(d.actionsForHand(branch,opening,hand).flatMap(a=>(a.type==='single'?[a.tile]:(a.tiles||[])).map(key))).size;}
function qualifiesSacrifice(ownLoss,nextGain,otherGain,opponentReduction){
 return ownLoss>0&&nextGain>=THRESHOLD.nextPassGain-1e-12&&otherGain>=THRESHOLD.otherPassGain-1e-12&&opponentReduction>=THRESHOLD.opponentLegalTileReductionPerOwnLoss*ownLoss-1e-12;
}
function pick(opts,state,known,mode,stats){
 const f=state.currentPlayer,baseline=chooseBy('min-hand-pips',opts,{seed:0,turns:state.turns,player:f});
 if(mode==='baseline'||baseline.type!=='single'||state.stock.length)return baseline;
 const alts=opts.actions.filter(a=>a.type==='single'&&key(a.tile)===key(baseline.tile)&&a.from!==baseline.from);
 if(!alts.length)return baseline;
 const n=(f+1)%3,o=(f+2)%3,used=new Set([...known,...state.hands[f].map(key)]);
 const unseen=deck.filter(t=>!used.has(key(t))),N=unseen.length,kn=state.hands[n].length,ko=state.hands[o].length;
 if(N!==kn+ko)throw Error('unseen tile count mismatch');
 const inspect=a=>{
  const branch=e.applySinglePlacement(state.branchState,a);
  const legal=unseen.filter(t=>d.actionsForHand(branch,state.openingState,[t]).length>0).length;
  return{branch,legal,nextPass:passProbability(N,legal,kn),otherPass:passProbability(N,legal,ko),own:ownMobility(state,a)};
 };
 const base=inspect(baseline);let selected=baseline,chosen=base;
 stats.opportunities++;
 for(const a of alts){
  const v=inspect(a),ownLoss=Math.max(0,base.own-v.own);
  if(mode==='mobility-guard'&&ownLoss>0){stats.rejectedSacrifices++;continue;}
  if(mode==='conditional-sacrifice'&&ownLoss>0&&!qualifiesSacrifice(ownLoss,v.nextPass-base.nextPass,v.otherPass-base.otherPass,base.legal-v.legal)){stats.rejectedSacrifices++;continue;}
  if(v.nextPass>chosen.nextPass+1e-12){selected=a;chosen=v;}
 }
 if(selected!==baseline){
  if(key(selected.tile)!==key(baseline.tile))throw Error('changed stone');
  stats.changes++;stats.nextPassGainSum+=chosen.nextPass-base.nextPass;stats.otherPassGainSum+=chosen.otherPass-base.otherPass;
  const ownDelta=chosen.own-base.own;
  if(ownDelta<0){stats.sacrifices++;stats.ownLossSum-=ownDelta;}
  if(mode==='mobility-guard'&&ownDelta<0)throw Error('guard violated');
  if(mode==='conditional-sacrifice'&&ownDelta<0&&!qualifiesSacrifice(-ownDelta,chosen.nextPass-base.nextPass,chosen.otherPass-base.otherPass,base.legal-chosen.legal))throw Error('threshold violated');
  // Audit ONLY: actual hidden opponent tiles do not enter pick's scoring.
  stats.nextLegalDeltaSum+=playable(chosen.branch,state.openingState,state.hands[n])-playable(base.branch,state.openingState,state.hands[n]);
  stats.otherLegalDeltaSum+=playable(chosen.branch,state.openingState,state.hands[o])-playable(base.branch,state.openingState,state.hands[o]);
 }
 return selected;
}
function play(base,seat,profile,mode){
 let s=r.cloneRoundState(base);const known=new Set(['1-1']);
 if(base.openingFollowup)known.add(key(base.openingFollowup.tile));
 const stats={opportunities:0,changes:0,sacrifices:0,rejectedSacrifices:0,ownLossSum:0,nextPassGainSum:0,otherPassGainSum:0,nextLegalDeltaSum:0,otherLegalDeltaSum:0};
 while(!s.outcome&&s.turns<200){
  const f=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock);
  let action=null;
  if(opts.phase==='play')action=f===seat?pick(opts,s,known,mode,stats):chooseBy(profile,opts,{seed:0,turns:s.turns,player:f});
  s=r.stepRound(s,()=>action);
  if(action)for(const tile of action.type==='single'?[action.tile]:(action.tiles||[])){
   const k=key(tile);if(known.has(k))throw Error('duplicate tile '+k);known.add(k);
  }
 }
 if(!s.outcome||s.outcome.kind==='unresolved')throw Error('unresolved');
 const o=s.outcome;
 return{win:+(o.kind==='finish'&&o.playerIndex===seat),pips:e.pipSum(s.hands[seat]),turns:s.turns,block:+(o.kind==='block'),
  minus:o.kind==='finish'&&o.playerIndex===seat?o.minus:0,endingDoubles:s.hands[seat].filter(t=>t[0]===t[1]).length,...stats};
}
function run(start=1374640,count=600){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<2)throw Error('bad args');
 const summaries={};let full=0;
 for(const profile of profiles){
  const rows=[],seedContrasts=Object.fromEntries(modes.slice(1).map(m=>[m,[]])),guardComparison=[];
  for(let seed=start;seed<start+count;seed++){
   const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(base.kind!=='ready')throw Error('initializer unresolved');
   const wins=Object.fromEntries(modes.map(m=>[m,0]));
   for(let seat=0;seat<3;seat++){
    const out={};
    for(const mode of modes){out[mode]=play(base,seat,profile,mode);wins[mode]+=out[mode].win;full++;}
    rows.push({seed,seat,startingDoubles:base.hands[seat].filter(t=>t[0]===t[1]).length,out});
   }
   for(const mode of modes.slice(1))seedContrasts[mode].push((wins[mode]-wins.baseline)/3);
   guardComparison.push((wins['conditional-sacrifice']-wins['mobility-guard'])/3);
  }
  const byMode={},contrasts={};
  for(const mode of modes){
   const x=rows.map(z=>z.out[mode]),sum=k=>x.reduce((s,z)=>s+z[k],0);
   byMode[mode]={appearances:x.length,finishFirstRate:mean(x.map(z=>z.win)),meanFinalPips:mean(x.map(z=>z.pips)),
    medianFinalPips:median(x.map(z=>z.pips)),meanTurns:mean(x.map(z=>z.turns)),blockRate:mean(x.map(z=>z.block)),
    meanStartingDoubles:mean(rows.map(z=>z.startingDoubles)),meanEndingDoubles:mean(x.map(z=>z.endingDoubles)),
    minusFinishCounts:Object.fromEntries([0,-10,-20,-30,-40].map(v=>[v,x.filter(z=>z.win&&z.minus===v).length])),
    opportunities:sum('opportunities'),changes:sum('changes'),sacrifices:sum('sacrifices'),rejectedSacrifices:sum('rejectedSacrifices'),
    ownLossSum:sum('ownLossSum'),nextPassGainPPPerChange:sum('changes')?100*sum('nextPassGainSum')/sum('changes'):null,
    otherPassGainPPPerChange:sum('changes')?100*sum('otherPassGainSum')/sum('changes'):null,
    observedNextLegalDeltaPerChange:sum('changes')?sum('nextLegalDeltaSum')/sum('changes'):null,
    observedOtherLegalDeltaPerChange:sum('changes')?sum('otherLegalDeltaSum')/sum('changes'):null};
  }
  for(const mode of modes.slice(1))contrasts[mode]={finishFirstDeltaPP:100*mean(seedContrasts[mode]),
   exploratorySeedCluster95HalfWidthPP:100*halfWidth(seedContrasts[mode]),
   pipsDelta:mean(rows.map(z=>z.out[mode].pips-z.out.baseline.pips))};
  contrasts.conditionalVsGuard={finishFirstDeltaPP:100*mean(guardComparison),
   exploratorySeedCluster95HalfWidthPP:100*halfWidth(guardComparison),
   pipsDelta:mean(rows.map(z=>z.out['conditional-sacrifice'].pips-z.out['mobility-guard'].pips))};
  summaries[profile]={byMode,contrasts};
 }
 return{schema:'qosa-conditional-sacrifice-holdout/v1',timestampBaku:'2026-10-24 04:51 (+04)',
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0; branch opening provisional',mode:'3x9',
  seedRange:[start,start+count-1],deals:count,fullContinuations:full,pairedHiddenWorldContinuations:0,
  profiles,modes,threshold:THRESHOLD,
  method:'matched deal/seat/opponent policy; min-hand-pips baseline; same-stone side tie-break; allow own-mobility sacrifice only if both opponents predicted pass gains and combined expected opponent legal-tile reduction exceed fixed thresholds; no opponent identities used in choice',
  limitations:'Provisional opening/locking; uniform hidden allocations ignore past action likelihood; thresholds exploratory; opponent hand access only for post-selection audit; block winner unassigned; finish-first is not match victory; normal seed-cluster 95% intervals exploratory and uncorrected',
  summaries,next:'Independent disjoint-seed retest if promising; compare conditional gate with strict own-mobility guard and unrestricted; seek real-play branch opening/locking fixture'};
}
function test(){
 if(!qualifiesSacrifice(1,.20,.15,1.5)||qualifiesSacrifice(1,.19,.15,1.5)||qualifiesSacrifice(2,.3,.3,2.9))throw Error('threshold');
 const a=run(1374640,3),b=run(1374640,3);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.fullContinuations!==72)throw Error('deterministic replay');
 for(const p of profiles)if(a.summaries[p].byMode['mobility-guard'].sacrifices!==0)throw Error('guard regression');
 return{passed:true,continuations:a.fullContinuations};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1374640),+(a[1]||600)),null,2));}
module.exports={THRESHOLD,qualifiesSacrifice,pick,play,run,test};