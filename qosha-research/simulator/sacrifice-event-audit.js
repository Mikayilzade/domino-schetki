'use strict';
// Conditional-sacrifice event audit: matched 3x9 trajectories, no hidden-hand policy leakage.
// Usage: node qosha-research/simulator/sacrifice-event-audit.js test
//        node qosha-research/simulator/sacrifice-event-audit.js 1376040 1600
// Branch locking/opening remains provisional under qosa-research-0.5.3.
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner');
const {pick,play:oldPlay,THRESHOLD}=require('./next-pass-sacrifice-threshold-holdout');
const {ownMobility}=require('./next-pass-mobility-guard-holdout');
const {passProbability}=require('./next-pass-tiebreak-holdout');
const profiles=['min-hand-pips','closed-branch-control'],modes=['mobility-guard','conditional-sacrifice'];
const key=e.tileKey,deck=e.createDoubleSixDeck();
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function halfWidth(a){if(a.length<2)return null;const m=mean(a);return 1.96*Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)/a.length);}
function median(a){if(!a.length)return null;const b=[...a].sort((x,y)=>x-y);return b.length%2?b[(b.length-1)/2]:(b[b.length/2-1]+b[b.length/2])/2;}
function emptyStats(){return{opportunities:0,changes:0,sacrifices:0,rejectedSacrifices:0,ownLossSum:0,nextPassGainSum:0,otherPassGainSum:0,nextLegalDeltaSum:0,otherLegalDeltaSum:0};}
function legalCount(branch,opening,hand){return new Set(d.actionsForHand(branch,opening,hand).flatMap(a=>(a.type==='single'?[a.tile]:(a.tiles||[])).map(key))).size;}
function inspect(state,known,action){
 const branch=e.applySinglePlacement(state.branchState,action),f=state.currentPlayer,n=(f+1)%3,o=(f+2)%3;
 const used=new Set([...known,...state.hands[f].map(key)]),unseen=deck.filter(t=>!used.has(key(t)));
 const N=unseen.length,kn=state.hands[n].length,ko=state.hands[o].length;
 if(N!==kn+ko)throw Error('hidden world accounting');
 const legal=unseen.filter(t=>d.actionsForHand(branch,state.openingState,[t]).length>0).length;
 return{own:ownMobility(state,action),next:legalCount(branch,state.openingState,state.hands[n]),
  other:legalCount(branch,state.openingState,state.hands[o]),nextPass:passProbability(N,legal,kn),otherPass:passProbability(N,legal,ko)};
}
function trace(base,seat,profile,mode){
 let s=r.cloneRoundState(base);const known=new Set(['1-1']);if(base.openingFollowup)known.add(key(base.openingFollowup.tile));
 const stats=emptyStats(),events=[];let unexplainedDifferences=0;
 while(!s.outcome&&s.turns<200){
  const f=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock);let action=null;
  if(opts.phase==='play'){
   if(f!==seat)action=chooseBy(profile,opts,{seed:0,turns:s.turns,player:f});
   else{
    if(mode==='conditional-sacrifice'){
     const guard=pick(opts,s,known,'mobility-guard',emptyStats());
     action=pick(opts,s,known,mode,stats);
     if(action!==guard){
      const baseline=chooseBy('min-hand-pips',opts,{seed:0,turns:s.turns,player:f});
      if(action.type!=='single'||guard.type!=='single'||baseline.type!=='single'||key(action.tile)!==key(guard.tile)||key(action.tile)!==key(baseline.tile))throw Error('not same-tile geometry');
      const a=inspect(s,known,action),g=inspect(s,known,guard),b=inspect(s,known,baseline);
      const ownLoss=Math.max(0,b.own-a.own);
      if(ownLoss===0){unexplainedDifferences++;}
      else events.push({turn:s.turns,handSize:s.hands[f].length,nextHandSize:s.hands[(f+1)%3].length,
       otherHandSize:s.hands[(f+2)%3].length,tile:key(action.tile),sides:[baseline.side,guard.side,action.side],
       ownLossVsBaseline:ownLoss,ownDeltaVsGuard:a.own-g.own,
       nextActualLegalDeltaVsGuard:a.next-g.next,otherActualLegalDeltaVsGuard:a.other-g.other,
       nextPassGainPPVsGuard:100*(a.nextPass-g.nextPass),otherPassGainPPVsGuard:100*(a.otherPass-g.otherPass)});
     }
    }else action=pick(opts,s,known,mode,stats);
   }
  }
  s=r.stepRound(s,()=>action);
  if(action)for(const tile of action.type==='single'?[action.tile]:(action.tiles||[])){
   const k=key(tile);if(known.has(k))throw Error('duplicate played tile '+k);known.add(k);
  }
 }
 if(!s.outcome||s.outcome.kind==='unresolved')throw Error('unresolved');
 const o=s.outcome;
 return{win:+(o.kind==='finish'&&o.playerIndex===seat),pips:e.pipSum(s.hands[seat]),turns:s.turns,
  block:+(o.kind==='block'),minus:o.kind==='finish'&&o.playerIndex===seat?o.minus:0,
  endingDoubles:s.hands[seat].filter(t=>t[0]===t[1]).length,events,unexplainedDifferences,stats};
}
function run(start=1376040,count=1600,timestampBaku='2026-10-24 06:51 (+04)'){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<2)throw Error('bad seed/count');
 const summaries={};let full=0;
 for(const profile of profiles){
  const rows=[],seedDiff=[],events=[],affected=new Set();
  for(let seed=start;seed<start+count;seed++){
   const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(base.kind!=='ready')throw Error('initializer unresolved');
   let wins={};for(const mode of modes)wins[mode]=0;
   for(let seat=0;seat<3;seat++){
    const out={};for(const mode of modes){out[mode]=trace(base,seat,profile,mode);wins[mode]+=out[mode].win;full++;}
    const row={seed,seat,startingDoubles:base.hands[seat].filter(t=>t[0]===t[1]).length,out};
    rows.push(row);
    for(const ev of out['conditional-sacrifice'].events){
     const x={seed,seat,...ev,finishFirstDiff:out['conditional-sacrifice'].win-out['mobility-guard'].win,
      finalPipsDiff:out['conditional-sacrifice'].pips-out['mobility-guard'].pips};
     events.push(x);affected.add(seed+':'+seat);
    }
   }
   seedDiff.push((wins['conditional-sacrifice']-wins['mobility-guard'])/3);
  }
  const byMode={};for(const mode of modes){
   const x=rows.map(z=>z.out[mode]);
   byMode[mode]={appearances:x.length,finishFirstRate:mean(x.map(z=>z.win)),meanFinalPips:mean(x.map(z=>z.pips)),
    medianFinalPips:median(x.map(z=>z.pips)),meanTurns:mean(x.map(z=>z.turns)),blockRate:mean(x.map(z=>z.block)),
    meanStartingDoubles:mean(rows.map(z=>z.startingDoubles)),meanEndingDoubles:mean(x.map(z=>z.endingDoubles)),
    minusFinishCounts:Object.fromEntries([0,-10,-20,-30,-40].map(v=>[v,x.filter(z=>z.win&&z.minus===v).length])),
    changes:x.reduce((s,z)=>s+z.stats.changes,0),sacrifices:x.reduce((s,z)=>s+z.stats.sacrifices,0),
    unexplainedDifferences:x.reduce((s,z)=>s+z.unexplainedDifferences,0)};
  }
  const group=(name,fn)=>Object.fromEntries([...new Set(events.map(fn))].sort().map(v=>[v,{
   events:events.filter(x=>fn(x)===v).length,
   affectedTrajectories:new Set(events.filter(x=>fn(x)===v).map(x=>x.seed+':'+x.seat)).size}]));
  summaries[profile]={byMode,paired:{finishFirstDeltaPP:100*mean(seedDiff),
   exploratorySeedCluster95HalfWidthPP:100*halfWidth(seedDiff),
   meanFinalPipsDelta:mean(rows.map(z=>z.out['conditional-sacrifice'].pips-z.out['mobility-guard'].pips))},
   audit:{acceptedEvents:events.length,affectedTrajectories:affected.size,
    affectedSeeds:new Set(events.map(x=>x.seed)).size,
    ownLossMagnitude:group('loss',x=>x.ownLossVsBaseline===1?'1':'2+'),
    handSize:group('hand',x=>x.handSize<=3?'1-3':x.handSize<=6?'4-6':'7+'),
    nextAccessWorse:events.filter(x=>x.nextActualLegalDeltaVsGuard<0).length,
    nextAccessBetter:events.filter(x=>x.nextActualLegalDeltaVsGuard>0).length,
    otherAccessWorse:events.filter(x=>x.otherActualLegalDeltaVsGuard<0).length,
    otherAccessBetter:events.filter(x=>x.otherActualLegalDeltaVsGuard>0).length,
    bothOpponentsRestricted:events.filter(x=>x.nextActualLegalDeltaVsGuard<0&&x.otherActualLegalDeltaVsGuard<0).length,
    meanNextPassGainPP:mean(events.map(x=>x.nextPassGainPPVsGuard)),
    meanOtherPassGainPP:mean(events.map(x=>x.otherPassGainPPVsGuard)),
    affectedTrajectoryFinishFirstDeltaPP:affected.size?100*mean(rows.filter(z=>affected.has(z.seed+':'+z.seat)).map(z=>z.out['conditional-sacrifice'].win-z.out['mobility-guard'].win)):null},
   events};
 }
 return{schema:'qosa-sacrifice-event-audit/v1',timestampBaku,engine:'qosa-research-0.5.3',
  rules:'recovered qosa-1.0.0; branch opening provisional',mode:'3x9',seedRange:[start,start+count-1],
  deals:count,fullContinuations:full,pairedHiddenWorldContinuations:0,profiles,modes,threshold:THRESHOLD,
  method:'Same seed/seat/profile guard vs conditional-sacrifice; audit conditional-only accepted sacrifice placements against counterfactual guard action at identical pre-move state. Actual opponent hands used only AFTER move choice for audit; never in policy.',
  limitations:'Provisional four-branch opening; selected rare events and correlated repeated choices; outcomes from full divergent trajectories, not isolated causal effects; simple bots; uniform unknown allocation without prior-action likelihood; no block winner; finish-first != match victory; seed-cluster CI exploratory and uncorrected.',
  summaries,next:'Do not retune thresholds on this holdout; use event strata to formulate a genuinely new predeclared hypothesis, then validate with independent seeds. Obtain real locked/open branch fixture.'};
}
function test(){
 const a=run(1376040,3,'TEST'),b=run(1376040,3,'TEST');
 if(JSON.stringify(a)!==JSON.stringify(b)||a.fullContinuations!==36)throw Error('replay');
 for(let seed=1376040;seed<1376043;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  for(let seat=0;seat<3;seat++)for(const profile of profiles)for(const mode of modes){
   const old=oldPlay(base,seat,profile,mode),now=trace(base,seat,profile,mode);
   for(const k of ['win','pips','turns','block','minus','endingDoubles'])if(old[k]!==now[k])throw Error('regression '+k);
  }
 }
 return{passed:true,fullContinuations:a.fullContinuations};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1376040),+(a[1]||1600),new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' (+04)'),null,2));}
module.exports={run,test,trace,inspect};
