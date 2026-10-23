'use strict';
// Three-way matched holdout: baseline vs unrestricted exact-next-pass tie-break vs
// pass tie-break allowed only if own post-action tile mobility does not decrease.
// Run: node qosha-research/simulator/next-pass-mobility-guard-holdout.js test
//      node qosha-research/simulator/next-pass-mobility-guard-holdout.js 1372040 200
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner');
const {passProbability}=require('./next-pass-tiebreak-holdout');
const profiles=['min-hand-pips','closed-branch-control'];
const modes=['baseline','unrestricted','mobility-guard'];
const deck=e.createDoubleSixDeck(),key=e.tileKey;
const mean=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
function halfWidth(xs){if(xs.length<2)return null;const m=mean(xs);
 return 1.96*Math.sqrt(xs.reduce((s,x)=>s+(x-m)**2,0)/(xs.length-1)/xs.length);}
function median(xs){const a=[...xs].sort((x,y)=>x-y),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;}
function after(state,action){return e.applySinglePlacement(state.branchState,action);}
function ownMobility(state,action){
 const remaining=state.hands[state.currentPlayer].filter(t=>key(t)!==key(action.tile));
 const playable=d.actionsForHand(after(state,action),state.openingState,remaining);
 return new Set(playable.flatMap(a=>a.type==='single'?[key(a.tile)]:(a.tiles||[]).map(key))).size;
}
function choose(opts,state,known,mode,stats){
 const f=state.currentPlayer,baseline=chooseBy('min-hand-pips',opts,{seed:0,turns:state.turns,player:f});
 if(mode==='baseline'||baseline.type!=='single'||state.stock.length)return baseline;
 const alts=opts.actions.filter(a=>a.type==='single'&&key(a.tile)===key(baseline.tile)&&a.from!==baseline.from);
 if(!alts.length)return baseline;
 const next=(f+1)%3,other=(f+2)%3,k=state.hands[next].length;
 const used=new Set([...known,...state.hands[f].map(key)]);
 const unseen=deck.filter(t=>!used.has(key(t)));
 if(unseen.length!==k+state.hands[other].length)throw Error('hidden pool mismatch');
 const probability=a=>{
  const br=after(state,a),legal=unseen.filter(t=>d.actionsForHand(br,state.openingState,[t]).length>0).length;
  return passProbability(unseen.length,legal,k);
 };
 const baseP=probability(baseline),baseMob=ownMobility(state,baseline);
 let best=baseline,bestP=baseP,bestMob=baseMob;
 stats.opportunities++;
 for(const a of alts){
  const mobility=ownMobility(state,a);
  if(mode==='mobility-guard'&&mobility<baseMob)continue;
  const p=probability(a);
  if(p>bestP+1e-12){best=a;bestP=p;bestMob=mobility;}
 }
 if(best!==baseline){
  stats.changes++;stats.predictedPassGain+=bestP-baseP;
  stats.mobilityDelta+=bestMob-baseMob;
  const actual=a=>+!d.actionsForHand(after(state,a),state.openingState,state.hands[next]).length;
  stats.observedPassGain+=actual(best)-actual(baseline);
  if(mode==='mobility-guard'&&bestMob<baseMob)throw Error('mobility guard violated');
 }
 return best;
}
function play(base,seat,profile,mode){
 let state=r.cloneRoundState(base);
 const known=new Set(['1-1']);
 if(base.openingFollowup)known.add(key(base.openingFollowup.tile));
 const stats={opportunities:0,changes:0,predictedPassGain:0,observedPassGain:0,mobilityDelta:0};
 while(!state.outcome&&state.turns<200){
  const f=state.currentPlayer,opts=d.turnOptions(state.branchState,state.openingState,state.hands[f],state.stock);
  let action=null;
  if(opts.phase==='play')action=f===seat?choose(opts,state,known,mode,stats):
   chooseBy(profile,opts,{seed:0,turns:state.turns,player:f});
  state=r.stepRound(state,()=>action);
  if(action)for(const tile of action.type==='single'?[action.tile]:(action.tiles||[])){
   const k=key(tile);if(known.has(k))throw Error('duplicate played tile');known.add(k);
  }
 }
 if(!state.outcome||state.outcome.kind==='unresolved')throw Error('unresolved round');
 const o=state.outcome;
 return{win:+(o.kind==='finish'&&o.playerIndex===seat),pips:e.pipSum(state.hands[seat]),
  minus:o.kind==='finish'&&o.playerIndex===seat?o.minus:0,block:+(o.kind==='block'),
  turns:state.turns,...stats};
}
function run(start=1372040,count=200){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<2)throw Error('bad args');
 const summaries={};let rounds=0;
 for(const profile of profiles){
  const rows=[],seedDeltas={unrestricted:[], 'mobility-guard':[]};
  for(let seed=start;seed<start+count;seed++){
   const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(base.kind!=='ready')throw Error('initializer unresolved');
   const seedWins={baseline:0,unrestricted:0,'mobility-guard':0};
   for(let seat=0;seat<3;seat++){
    const out={};
    for(const mode of modes){out[mode]=play(base,seat,profile,mode);rounds++;seedWins[mode]+=out[mode].win;}
    rows.push({seed,seat,out});
   }
   for(const mode of modes.slice(1))seedDeltas[mode].push((seedWins[mode]-seedWins.baseline)/3);
  }
  const byMode={};
  for(const mode of modes){
   const x=rows.map(z=>z.out[mode]);
   const sum=k=>x.reduce((s,v)=>s+v[k],0);
   byMode[mode]={appearances:x.length,finishFirstRate:mean(x.map(z=>z.win)),
    meanFinalPips:mean(x.map(z=>z.pips)),medianFinalPips:median(x.map(z=>z.pips)),
    meanTurns:mean(x.map(z=>z.turns)),blockRate:mean(x.map(z=>z.block)),
    minusFinishCounts:Object.fromEntries([0,-10,-20,-30,-40].map(v=>[v,x.filter(z=>z.win&&z.minus===v).length])),
    opportunities:sum('opportunities'),changedPlacements:sum('changes'),
    predictedPassGainPPPerChange:sum('changes')?100*sum('predictedPassGain')/sum('changes'):null,
    observedPassGainPPPerChange:sum('changes')?100*sum('observedPassGain')/sum('changes'):null,
    ownMobilityDeltaPerChange:sum('changes')?sum('mobilityDelta')/sum('changes'):null};
  }
  const contrasts={};
  for(const mode of modes.slice(1)){
   const x=rows.map(z=>z.out[mode].pips-z.out.baseline.pips);
   contrasts[mode]={finishFirstGainPP:100*mean(seedDeltas[mode]),
    exploratorySeedCluster95HalfWidthPP:100*halfWidth(seedDeltas[mode]),
    finalPipsDelta:mean(x)};
  }
  const gu=rows.filter(z=>z.out.unrestricted.changes>0&&z.out['mobility-guard'].changes===0).length;
  summaries[profile]={byMode,contrasts,guardedVsUnrestrictedSuppressedTrajectories:gu};
 }
 return{schema:'qosa-next-pass-mobility-guard/v1',engine:'qosa-research-0.5.3',
  rules:'recovered qosa-1.0.0; branch opening provisional',mode:'3x9',
  timestampBaku:'2026-10-24 01:45 (+04)',seedRange:[start,start+count-1],deals:count,
  fullContinuations:rounds,matchedSeats:count*3*profiles.length,
  profiles,modes,
  ownMobilityDefinition:'number of distinct remaining hand tiles with at least one legal placement on post-action branch/opening state; excludes already played tile',
  seedProtocol:'same initialized deal and focal seat across three policies; opponents fixed profile; previous winner seed%3',
  limitations:'Branch locking provisional; uniform unknown allocation; no opponent prior-choice likelihood; only same-tile geometry changes; fixed bots; no block winner; finish-first not match win; exploratory uncorrected intervals.',
  summaries,
  next:'On fresh seeds, stratify guarded benefit by mobility difference and check whether opponent two gets extra legal replies; obtain real-play branch-lock fixture.'};
}
function test(){
 if(Math.abs(passProbability(7,2,2)-10/21)>1e-12)throw Error('hypergeom');
 const a=run(1372040,3),b=run(1372040,3);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.fullContinuations!==54)throw Error('replay');
 for(const profile of profiles){const z=a.summaries[profile].byMode['mobility-guard'];
  if(z.ownMobilityDeltaPerChange!==null&&z.ownMobilityDeltaPerChange<0)throw Error('guard');}
 return{passed:true,rounds:a.fullContinuations};
}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1372040),+(a[1]||200)),null,2));}
module.exports={ownMobility,choose,play,run,test};
