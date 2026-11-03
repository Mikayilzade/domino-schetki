'use strict';
// Stratified audit of every tied-minimum block in a disjoint seed holdout.
// No block winner, tie-break, score award, or physical branch rule is assigned.
const e=require('./engine'),init=require('./initializer'),rd=require('./round-driver');
const strat=require('./strategy-runner'),side=require('./branch-side-full-round');
const current=require('./branch-current-full-round');
const MODELS=['global','currentAll','localFirst','localLast'],MIXES=side.MIXES;
const SOURCE_BLOBS={"engine":"82e5bd544a57683d5b4f7812beb2d4abf80da894","initializer":"2fad29e516454580ec9a06115354e9866f3096e6","turn-kernel":"94657896e1f8e471ceb2e9a65d1842b6102dff18","turn-dispatcher":"55b0bcf3f1653c64b4e06bc95d7e917a480562a0","round-driver":"fbaad78865adbddde1ea6651e6a501dc0bde3203","strategy-runner":"b7078942bc8f5dac6a8b07494ae8aaeadbdb1f5f","branch-side-full-round":"19d9a20c64db756353e1afeb62e3ca67ba6b34f8","branch-current-full-round":"729ccfb3a55328a960e5a3a9a10ea3bcbb45e412"};
function timestampAsiaBaku(){return new Intl.DateTimeFormat('sv-SE',{
 timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',
 minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date()).replace(' ','T')+'+04:00';}
function minSet(values){const m=Math.min(...values);return values.map((v,i)=>v===m?i:-1).filter(i=>i>=0);}
function sameSet(a,b){return a.length===b.length&&a.every((v,i)=>v===b[i]);}
function allocationFingerprint(deal){return deal.hands.map(h=>h.map(e.tileKey).sort().join(',')).join('|')+'#'+deal.stock.map(e.tileKey).sort().join(',');}
function actionKey(a){
 if(!a)return '-';
 if(a.type==='single')return 'S/'+a.handIndex+'/'+e.tileKey(a.tile)+'/'+a.side+'/'+a.from+'/'+a.to;
 if(a.type==='mixed-finish')return 'M/'+a.handIndex+'/'+e.tileKey(a.tile)+'/'+a.side+'/'+a.from+'/'+a.to+'/'+(a.sequence||[]).map(x=>e.tileKey(x.tile)+'@'+x.side).join(',');
 if(a.type==='double-sequence')return 'D/'+(a.sequence||[]).map(x=>e.tileKey(x.tile)+'@'+x.side).join(',');
 throw new Error('unknown action type '+a.type);
}
function fnv32(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(16).padStart(8,'0');}
function traceChecksum(payload){return fnv32(JSON.stringify(payload));}
function eventRow(state,seat,passed,drawn,drawnTile,action){return[state.turns,seat,passed?1:0,drawn?1:0,drawnTile?e.tileKey(drawnTile):'',actionKey(action),state.stock.length,state.consecutivePasses];}
function simulateOne(base,seed,mix,rotation,model){
 const policies=[0,1,2].map(seat=>MIXES[mix][(seat+rotation)%3]),ctx={seed,rotation,salt:mix+1},events=[];
 let state;
 if(model==='global'){
  state=rd.cloneRoundState(base);
  while(!state.outcome&&state.turns<200){
   const p=state.currentPlayer,opts=require('./turn-dispatcher').turnOptions(state.branchState,state.openingState,state.hands[p],state.stock);
   const chosen=opts.phase==='play'?strat.chooseBy(policies[p],opts,{...ctx,turns:state.turns,player:p}):null;
   const next=rd.stepRound(state,()=>chosen);
   events.push(eventRow(next,p,opts.phase==='pass',opts.drawn,opts.drawnTile,chosen));state=next;
  }
 }else if(model==='currentAll'){
  state=current.currentInit(base);
  while(!state.outcome&&state.turns<200){
   const p=state.currentPlayer,preStock=state.stock.map(t=>[...t]),tr=current.currentStep(state,policies[p],ctx);
   const drawn=state.stock.length<preStock.length;
   events.push(eventRow(state,p,tr.passed,drawn,drawn?preStock[0]:null,tr.action));
  }
 }else if(model==='localFirst'||model==='localLast'){
  const priority=model==='localFirst'?'first':'last';state=side.localInit(base);
  while(!state.outcome&&state.turns<200){
   const p=state.currentPlayer,preStock=state.stock.map(t=>[...t]),tr=side.localStep(state,policies[p],priority,ctx);
   const drawn=state.stock.length<preStock.length;
   events.push(eventRow(state,p,tr.passed,drawn,drawn?preStock[0]:null,tr.action));
  }
 }else throw new Error('unknown model '+model);
 if(!state.outcome)state.outcome={kind:'unresolved',reason:'turn-limit',turns:state.turns};
 return{state,events,policies};
}
function finalGeometry(state,model){
 const ends=e.SIDES.map(s=>[s,state.branchState.branches[s].active?1:0,state.branchState.branches[s].end]);
 if(model==='global')return{ends,openedNumbers:[...state.openingState.openedNumbers].sort((a,b)=>a-b)};
 return{ends,openBySide:e.SIDES.map(s=>[s,[...state.openBySide[s]].sort((a,b)=>a-b)]),usedNumbers:[...state.usedNumbers].sort((a,b)=>a-b)};
}
function blockDetail(state){
 if(!state.outcome||state.outcome.kind!=='block')return null;
 if(state.stock.length!==0||state.consecutivePasses<3)throw new Error('block precondition failed');
 const pips=state.hands.map(e.pipSum),counts=state.hands.map(h=>h.length);
 if(state.outcome.remainders.join(',')!==pips.join(','))throw new Error('block remainder mismatch');
 const minPipCandidates=minSet(pips),fewestTileCandidates=minSet(counts),lastPasser=state.currentPlayer;
 if(!Number.isInteger(lastPasser)||lastPasser<0||lastPasser>=state.hands.length)throw new Error('last passer unavailable');
 return{pips,counts,minPipCandidates,fewestTileCandidates,lastPasser,tied:minPipCandidates.length>1,
  lastPasserInSet:minPipCandidates.includes(lastPasser),agreement:sameSet(minPipCandidates,fewestTileCandidates),
  fewestTied:fewestTileCandidates.length>1,minRemainderPips:Math.min(...pips)};
}
function buildTrace(seed,mix,rotation,model,fingerprint,sim,detail){
 const state=sim.state,payload={
  seed,mix:mix+1,rotation,model,policies:sim.policies,allocationFingerprint:fingerprint,
  finalPips:detail.pips,finalTileCounts:detail.counts,finalHands:state.hands.map(h=>h.map(e.tileKey)),
  minPipCandidates:detail.minPipCandidates,fewestTileCandidates:detail.fewestTileCandidates,
  lastPasser:detail.lastPasser,lastPasserInMinPipSet:detail.lastPasserInSet,
  minPipVsFewestTileSetAgreement:detail.agreement,finalGeometry:finalGeometry(state,model),events:sim.events
 };
 return{...payload,traceChecksum:traceChecksum(payload)};
}
function makeStats(){return{rounds:0,finishes:0,blocks:0,unresolved:0,tiedMinPip:0,uniqueMinPip:0,
 minPipCandidateSetSizeCounts:{'1':0,'2':0,'3':0},lastPasserInMinPipSet:0,
 pipsVsFewestTilesCandidateSetAgreement:0,fewestTilesTied:0,minRemainderPipsTotal:0,tiedTraceCount:0};}
function record(stats,state,detail){
 stats.rounds++;
 if(!state.outcome||state.outcome.kind==='unresolved'){stats.unresolved++;return;}
 if(state.outcome.kind==='finish'){stats.finishes++;return;}
 if(state.outcome.kind!=='block')throw new Error('unknown outcome');
 stats.blocks++;stats.minRemainderPipsTotal+=detail.minRemainderPips;
 stats.minPipCandidateSetSizeCounts[String(detail.minPipCandidates.length)]++;
 if(detail.tied)stats.tiedMinPip++;else stats.uniqueMinPip++;
 if(detail.lastPasserInSet)stats.lastPasserInMinPipSet++;
 if(detail.agreement)stats.pipsVsFewestTilesCandidateSetAgreement++;
 if(detail.fewestTied)stats.fewestTilesTied++;
}
function clusterCounter(){return{rounds:0,finishes:0,blocks:0,unresolved:0,tiedMinPip:0,lastPasserInMinPipSet:0,
 pipsVsFewestTilesCandidateSetAgreement:0,fewestTilesTied:0};}
function recordCluster(c,state,detail){
 c.rounds++;
 if(!state.outcome||state.outcome.kind==='unresolved'){c.unresolved++;return;}
 if(state.outcome.kind==='finish'){c.finishes++;return;}
 c.blocks++;if(detail.tied)c.tiedMinPip++;if(detail.lastPasserInSet)c.lastPasserInMinPipSet++;
 if(detail.agreement)c.pipsVsFewestTilesCandidateSetAgreement++;if(detail.fewestTied)c.fewestTilesTied++;
}
function ratioClusterCI(clusters,numeratorKey,denominatorKey){
 const groups=clusters.length,numerator=clusters.reduce((s,c)=>s+c[numeratorKey],0),denominator=clusters.reduce((s,c)=>s+c[denominatorKey],0);
 if(!denominator||groups<2)return{numerator,denominator,rate:null,se:null,ci95:null,clusters:groups};
 const rate=numerator/denominator,residualSS=clusters.reduce((s,c)=>s+Math.pow(c[numeratorKey]-rate*c[denominatorKey],2),0);
 const se=Math.sqrt((groups/(groups-1))*residualSS/(denominator*denominator));
 return{numerator,denominator,rate,se,ci95:[Math.max(0,rate-1.96*se),Math.min(1,rate+1.96*se)],clusters:groups,residualSS};
}
function summarize(stats,clusters){
 return{rounds:stats.rounds,finishes:stats.finishes,blocks:stats.blocks,unresolved:stats.unresolved,
  blockRate:ratioClusterCI(clusters,'blocks','rounds'),
  minPipTieRateAmongBlocks:ratioClusterCI(clusters,'tiedMinPip','blocks'),
  lastPasserInMinPipSetRate:ratioClusterCI(clusters,'lastPasserInMinPipSet','blocks'),
  minPipVsFewestTileSetAgreementRate:ratioClusterCI(clusters,'pipsVsFewestTilesCandidateSetAgreement','blocks'),
  fewestTileCandidateTieRate:ratioClusterCI(clusters,'fewestTilesTied','blocks'),
  minPipCandidateSetSizeCounts:stats.minPipCandidateSetSizeCounts,
  meanMinimumRemainderPips:stats.blocks?stats.minRemainderPipsTotal/stats.blocks:null,tiedTraceCount:stats.tiedTraceCount};
}
function run(seedStart=9002000,deals=2000,timestampOverride=null,verifyTraces=true){
 if(!Number.isInteger(seedStart)||!Number.isInteger(deals)||deals<1||deals>5000)throw new Error('invalid seed range/count');
 const timestamp=timestampOverride||timestampAsiaBaku(),stats=Object.fromEntries(MODELS.map(m=>[m,makeStats()])),clusters=Object.fromEntries(MODELS.map(m=>[m,[]]));
 const stratumStats={},stratumClusters={};
 for(const model of MODELS)for(let mix=0;mix<2;mix++)for(let rotation=0;rotation<3;rotation++){
  const key=model+'|mix'+(mix+1)+'|rotation'+rotation;stratumStats[key]=makeStats();stratumClusters[key]=[];
 }
 const seen=new Set(),duplicateAllocationSeeds=[],traces=[];let uniqueAllocations=0,totalModelRounds=0;
 for(let seed=seedStart;seed<seedStart+deals;seed++){
  const deal=e.dealThreeByNine(seed),fingerprint=allocationFingerprint(deal);
  if(seen.has(fingerprint)){duplicateAllocationSeeds.push(seed);continue;}
  seen.add(fingerprint);uniqueAllocations++;
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw new Error('initializer not ready for '+seed);
  const dealClusters=Object.fromEntries(MODELS.map(m=>[m,clusterCounter()])),stratumDealClusters={};
  for(const model of MODELS)for(let mix=0;mix<2;mix++)for(let rotation=0;rotation<3;rotation++){
   const key=model+'|mix'+(mix+1)+'|rotation'+rotation;stratumDealClusters[key]=clusterCounter();
   const sim=simulateOne(base,seed,mix,rotation,model),detail=blockDetail(sim.state);
   record(stats[model],sim.state,detail);recordCluster(dealClusters[model],sim.state,detail);
   record(stratumStats[key],sim.state,detail);recordCluster(stratumDealClusters[key],sim.state,detail);totalModelRounds++;
   if(detail&&detail.tied){stats[model].tiedTraceCount++;stratumStats[key].tiedTraceCount++;
    traces.push(buildTrace(seed,mix,rotation,model,fingerprint,sim,detail));}
   if(sim.state.outcome.kind==='unresolved')throw new Error('unresolved seed '+seed+' '+model);
  }
  for(const model of MODELS)clusters[model].push(dealClusters[model]);
  for(const key of Object.keys(stratumDealClusters))stratumClusters[key].push(stratumDealClusters[key]);
 }
 const modelSummary={};
 for(const model of MODELS){
  modelSummary[model]=summarize(stats[model],clusters[model]);
  if(modelSummary[model].unresolved!==0)throw new Error('unresolved rounds in '+model);
  if(modelSummary[model].rounds!==uniqueAllocations*6)throw new Error('round census in '+model);
  if(Object.values(stats[model].minPipCandidateSetSizeCounts).reduce((a,b)=>a+b,0)!==stats[model].blocks)
   throw new Error('candidate-set census in '+model);
 }
 const strataSummary={};
 for(const key of Object.keys(stratumStats)){
  strataSummary[key]=summarize(stratumStats[key],stratumClusters[key]);
  if(strataSummary[key].rounds!==uniqueAllocations)throw new Error('stratum census '+key);
 }
 let replayPassed=0;
 if(verifyTraces)for(const trace of traces){
  const base=init.initializeThreePlayerRound({seed:trace.seed,isFirstRound:false,previousWinnerIndex:trace.seed%3});
  const sim=simulateOne(base,trace.seed,trace.mix-1,trace.rotation,trace.model),detail=blockDetail(sim.state);
  if(!detail||!detail.tied)throw new Error('trace no longer tied block '+trace.seed+'/'+trace.model);
  const replay=buildTrace(trace.seed,trace.mix-1,trace.rotation,trace.model,trace.allocationFingerprint,sim,detail);
  if(replay.traceChecksum!==trace.traceChecksum)throw new Error('trace replay mismatch '+trace.seed+'/'+trace.model);
  replayPassed++;
 }
 if(replayPassed!==(verifyTraces?traces.length:0))throw new Error('trace replay census');
 return{
  schema:'qosha-block-tied-minimum-stratified-audit/v1',timestampAsiaBaku:timestamp,
  engineVersion:'qosha-research-0.5.3',
  rulesVersion:'recovered qosa-1.0.0; branch opening and block candidate interpretation remain provisional',
  mode:'3 players x 9 stones + one stock; same unique deals across four provisional branch models',
  seedStart,seedEnd:seedStart+deals-1,seedDraws:deals,uniqueAllocations,duplicateAllocationSeeds,
  roundsPerModel:uniqueAllocations*6,totalModelRounds,strategies:MIXES.map(x=>[...x]),
  modelDefinitions:{
   global:'global-ever-open number unlock; current research dispatcher',
   currentAll:'double unlocks all currently matching ends at play time; later-arriving sides remain locked',
   localFirst:'double unlocks one currently matching side, first in up/left/right/down order',
   localLast:'double unlocks one currently matching side, last in up/left/right/down order'},
  blockContract:'empty stock and >=3 consecutive passes; no winner, tie split, score, or match result assigned',
  metrics:{models:modelSummary,strata:strataSummary},tiedMinimumTraceCount:traces.length,
  tiedMinimumTraceCountsByModel:Object.fromEntries(MODELS.map(m=>[m,traces.filter(t=>t.model===m).length])),
  traceReplayVerification:{attempted:verifyTraces?traces.length:0,passed:replayPassed,failed:0},traces,
  sourceBlobs:SOURCE_BLOBS,
  finding:'Policy-mix and seat-rotation strata describe coded-model block candidate behavior only. No block winner, scoring rule, or strategy superiority is inferred.',
  confidence:'High for deterministic replay and internal measurements under coded assumptions; no physical-rule authentication.',
  limitations:[
   'Global-ever-open, current-all, local-first and local-last are alternative provisional branch models, not authenticated table rules.',
   'Policy and seat-rotation differences are descriptive; same seed allocation is reused but trajectories can diverge.',
   'Minimum-pip and fewest-tile candidate sets are diagnostics, not an authenticated block winner rule.',
   'Last passer is recorded without priority; no tie split, point award, match score, or winner is assigned.',
   'Approximate 95% intervals are deal-clustered; six rounds per model and each mix/rotation stratum remain grouped by seed.',
   'No historical baseline or previous cohort is pooled into this holdout.'],
  exactNextAction:'Compare tied-block trace strata across policy mixes and seat rotations using paired seed-cluster contrasts; test the leading descriptive interaction on a second disjoint holdout without assigning block winners.'
 };
}
function test(){
 const a=run(9004000,24,'2026-11-03T00:00:00+04:00',true),b=run(9004000,24,'2026-11-03T00:00:00+04:00',true);
 if(JSON.stringify(a)!==JSON.stringify(b))throw new Error('deterministic replay failed');
 if(a.seedDraws!==24||a.uniqueAllocations!==24||a.duplicateAllocationSeeds.length)throw new Error('allocation census');
 if(a.totalModelRounds!==24*24||a.traceReplayVerification.passed!==a.tiedMinimumTraceCount)throw new Error('round/trace census');
 for(const model of MODELS){
  if(a.metrics.models[model].rounds!==24*6||a.metrics.models[model].unresolved!==0)throw new Error('model census '+model);
  for(let mix=1;mix<=2;mix++)for(let rotation=0;rotation<3;rotation++){
   if(a.metrics.strata[model+'|mix'+mix+'|rotation'+rotation].rounds!==24)throw new Error('stratum census');
  }
 }
 for(const trace of a.traces){
  if(trace.minPipCandidates.length<2)throw new Error('non-tied trace');
  for(let i=1;i<trace.events.length;i++)if(trace.events[i][0]!==trace.events[i-1][0]+1)throw new Error('trace turn sequence');
 }
 return{passed:true,pilotDeals:24,totalModelRounds:576,tiedTraceRows:a.tiedMinimumTraceCount,
  replayedTraceRows:a.traceReplayVerification.passed,deterministicReplay:true,
  assertions:'allocation/model/stratum census, tied-set eligibility, monotone event turns, full tied-trace replay'};
}
module.exports={run,test,traceChecksum,MODELS,MIXES,actionKey,allocationFingerprint};
