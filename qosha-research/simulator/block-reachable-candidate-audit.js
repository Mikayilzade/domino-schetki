'use strict';

// Reachable blocked-state candidate-set audit; no block winner or score is assigned.
// Reproduce: node qosha-research/simulator/block-reachable-candidate-audit.js 9000000 2000
// Test:      node qosha-research/simulator/block-reachable-candidate-audit.js test
const e=require('./engine');
const init=require('./initializer');
const rd=require('./round-driver');
const strat=require('./strategy-runner');
const side=require('./branch-side-full-round');
const current=require('./branch-current-full-round');

const MODEL_NAMES=['global','currentAll','localFirst','localLast'];
const MIXES=side.MIXES;
const ROUNDS_PER_DEAL=MIXES.length*3;
const SOURCE_BLOBS={
  engine:'82e5bd544a57683d5b4f7812b2d4abf80da894',
  initializer:'2fad29e516454580ec9a06115354e9866f3096e6',
  'turn-kernel':'94657896e1f8e471ceb2e9a65d1842b6102dff18',
  'turn-dispatcher':'55b0bcf3f1653c64b4e06bc95d7e917a480562a0',
  'round-driver':'fbaad78865adbddde1ea6651e6a501dc0bde3203',
  'strategy-runner':'b7078942bc8f5dac6a8b07494ae8aaeadbdb1f5f',
  'branch-side-full-round':'19d9a20c64db756353e1afeb62e3ca67ba6b34f8',
  'branch-current-full-round':'729ccfb3a55328a960e5a3a9a10ea3bcbb45e412'
};

function timestampAsiaBaku(){
  return new Intl.DateTimeFormat('sv-SE',{
    timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'
  }).format(new Date()).replace(' ','T')+'+04:00';
}
function minSet(values){
  const min=Math.min(...values);
  return values.map((value,seat)=>value===min?seat:-1).filter(seat=>seat>=0);
}
function sameSet(a,b){
  return a.length===b.length&&a.every((value,index)=>value===b[index]);
}
function freshStats(){
  return {
    rounds:0,finishes:0,blocks:0,unresolved:0,
    tiedMinPip:0,uniqueMinPip:0,
    minPipCandidateSetSizeCounts:{'1':0,'2':0,'3':0},
    lastPasserInMinPipSet:0,
    pipsVsFewestTilesCandidateSetAgreement:0,
    tiedFewestTiles:0,minRemainderPipsTotal:0,examples:[]
  };
}
function ratioClusterCI(clusters,numeratorKey,denominatorKey){
  const groups=clusters.length;
  const numerator=clusters.reduce((sum,item)=>sum+item[numeratorKey],0);
  const denominator=clusters.reduce((sum,item)=>sum+item[denominatorKey],0);
  if(!denominator||groups<2){
    return {numerator,denominator,rate:null,se:null,ci95:null,clusters:groups};
  }
  const rate=numerator/denominator;
  const residualSS=clusters.reduce((sum,item)=>
    sum+Math.pow(item[numeratorKey]-rate*item[denominatorKey],2),0);
  const se=Math.sqrt((groups/(groups-1))*residualSS/(denominator*denominator));
  return {
    numerator,denominator,rate,se,
    ci95:[Math.max(0,rate-1.96*se),Math.min(1,rate+1.96*se)],
    clusters:groups,residualSS
  };
}
function addRound(stats,state){
  stats.rounds++;
  if(!state.outcome||state.outcome.kind==='unresolved'){
    stats.unresolved++;
    return null;
  }
  if(state.outcome.kind==='finish'){
    stats.finishes++;
    return null;
  }
  if(state.outcome.kind!=='block')throw new Error('unknown outcome '+state.outcome.kind);
  if(state.stock.length!==0||state.consecutivePasses<3){
    throw new Error('block requires empty stock and >=3 consecutive passes');
  }
  const pips=state.hands.map(e.pipSum);
  const tileCounts=state.hands.map(hand=>hand.length);
  if(state.outcome.remainders.join(',')!==pips.join(',')){
    throw new Error('block remainder mismatch');
  }
  if(!Number.isInteger(state.currentPlayer)||state.currentPlayer<0||state.currentPlayer>=state.hands.length){
    throw new Error('last passer identity unavailable');
  }
  const minPipCandidates=minSet(pips);
  const fewestTileCandidates=minSet(tileCounts);
  const lastPasser=state.currentPlayer;
  const tied=minPipCandidates.length>1;
  const agreement=sameSet(minPipCandidates,fewestTileCandidates);
  const lastPasserInSet=minPipCandidates.includes(lastPasser);
  stats.blocks++;
  stats.minRemainderPipsTotal+=Math.min(...pips);
  stats.minPipCandidateSetSizeCounts[String(minPipCandidates.length)]++;
  if(tied)stats.tiedMinPip++;
  else stats.uniqueMinPip++;
  if(lastPasserInSet)stats.lastPasserInMinPipSet++;
  if(agreement)stats.pipsVsFewestTilesCandidateSetAgreement++;
  if(fewestTileCandidates.length>1)stats.tiedFewestTiles++;
  if(stats.examples.length<5){
    stats.examples.push({
      seed:state.__auditSeed,
      mix:state.__auditMix,
      rotation:state.__auditRotation,
      pips,tileCounts,minPipCandidates,fewestTileCandidates,lastPasser
    });
  }
  return {tied,agreement,lastPasserInSet,minPipCandidates,fewestTileCandidates,pips,tileCounts,lastPasser};
}
function summarizeModel(stats,clusters,mixes){
  const blockRate=ratioClusterCI(clusters,'blocks','rounds');
  const minPipTieRate=ratioClusterCI(clusters,'tied','blocks');
  const lastPasserRate=ratioClusterCI(clusters,'lastIn','blocks');
  const setAgreementRate=ratioClusterCI(clusters,'agree','blocks');
  const fewestTileTieRate=ratioClusterCI(clusters,'fewestTied','blocks');
  return {
    rounds:stats.rounds,finishes:stats.finishes,blocks:stats.blocks,unresolved:stats.unresolved,
    blockRate,
    minPipUnique:stats.uniqueMinPip,minPipTied:stats.tiedMinPip,minPipTieRate,
    minPipCandidateSetSizeCounts:stats.minPipCandidateSetSizeCounts,
    lastPasserInMinPipSet:stats.lastPasserInMinPipSet,
    lastPasserInMinPipSetRate:lastPasserRate,
    pipsVsFewestTilesCandidateSetAgreement:stats.pipsVsFewestTilesCandidateSetAgreement,
    pipsVsFewestTilesAgreementRate:setAgreementRate,
    fewestTilesTied:stats.tiedFewestTiles,fewestTileTieRate,
    meanMinimumRemainderPips:stats.blocks?stats.minRemainderPipsTotal/stats.blocks:null,
    byMix:mixes.map((item,index)=>({
      mix:index+1,rounds:item.rounds,finishes:item.finishes,blocks:item.blocks,
      blockRate:item.rounds?item.blocks/item.rounds:null,
      minPipTied:item.tiedMinPip,
      minPipTieRate:item.blocks?item.tiedMinPip/item.blocks:null,
      lastPasserInMinPipSet:item.lastPasserInMinPipSet,
      pipsVsFewestTilesAgreement:item.blocks?
        item.pipsVsFewestTilesCandidateSetAgreement/item.blocks:null
    })),
    examples:stats.examples
  };
}
function run(seedStart=9000000,deals=2000,timestampOverride=null){
  if(!Number.isInteger(seedStart)||!Number.isInteger(deals)||deals<1||deals>10000){
    throw new Error('invalid seed range/count');
  }
  const timestamp=timestampOverride||timestampAsiaBaku();
  const stats=Object.fromEntries(MODEL_NAMES.map(name=>[name,freshStats()]));
  const mixStats=Object.fromEntries(MODEL_NAMES.map(name=>[name,MIXES.map(()=>freshStats())]));
  const clusters=Object.fromEntries(MODEL_NAMES.map(name=>[name,[]]));
  const seen=new Set(),duplicateAllocationSeeds=[];
  let uniqueAllocations=0,roundContractChecks=0,blockPreconditionChecks=0;
  let blockRemainderChecks=0,candidateSetChecks=0,totalModelRounds=0;
  for(let seed=seedStart;seed<seedStart+deals;seed++){
    const deal=e.dealThreeByNine(seed);
    const fingerprint=deal.hands.map(hand=>hand.map(e.tileKey).sort().join(',' )).join('|')+
      '#'+deal.stock.map(e.tileKey).sort().join(',');
    if(seen.has(fingerprint)){
      duplicateAllocationSeeds.push(seed);
      continue;
    }
    seen.add(fingerprint);
    uniqueAllocations++;
    const base=init.initializeThreePlayerRound({
      seed,isFirstRound:false,previousWinnerIndex:seed%3
    });
    if(base.kind!=='ready')throw new Error('initializer not ready for seed '+seed);
    const dealCluster=Object.fromEntries(MODEL_NAMES.map(name=>[name,{
      rounds:0,blocks:0,tied:0,lastIn:0,agree:0,fewestTied:0
    }]));
    for(let mix=0;mix<MIXES.length;mix++){
      for(let rotation=0;rotation<3;rotation++){
        const policies=[0,1,2].map(seat=>MIXES[mix][(seat+rotation)%3]);
        const ctx={seed,rotation,salt:mix+1};
        const outputs={
          global:rd.runRound(base,(opts,state)=>
            strat.chooseBy(policies[state.currentPlayer],opts,{
              ...ctx,turns:state.turns,player:state.currentPlayer
            }),{maxTurns:200}),
          currentAll:current.currentRound(base,policies,ctx),
          localFirst:side.localRound(base,policies,'first',ctx),
          localLast:side.localRound(base,policies,'last',ctx)
        };
        for(const name of MODEL_NAMES){
          const state=outputs[name];
          state.__auditSeed=seed;
          state.__auditMix=mix;
          state.__auditRotation=rotation;
          const detail=addRound(stats[name],state);
          addRound(mixStats[name][mix],state);
          dealCluster[name].rounds++;
          totalModelRounds++;
          roundContractChecks++;
          if(detail){
            blockPreconditionChecks++;
            blockRemainderChecks++;
            candidateSetChecks++;
            const cluster=dealCluster[name];
            cluster.blocks++;
            if(detail.tied)cluster.tied++;
            if(detail.lastPasserInSet)cluster.lastIn++;
            if(detail.agreement)cluster.agree++;
            if(detail.fewestTileCandidates.length>1)cluster.fewestTied++;
          }
        }
      }
    }
    for(const name of MODEL_NAMES)clusters[name].push(dealCluster[name]);
  }
  const models={};
  for(const name of MODEL_NAMES){
    models[name]=summarizeModel(stats[name],clusters[name],mixStats[name]);
    if(models[name].unresolved!==0)throw new Error('unresolved rounds in '+name);
    if(models[name].rounds!==uniqueAllocations*ROUNDS_PER_DEAL){
      throw new Error('round count mismatch in '+name);
    }
    const setSizeTotal=Object.values(models[name].minPipCandidateSetSizeCounts)
      .reduce((sum,value)=>sum+value,0);
    if(setSizeTotal!==models[name].blocks)throw new Error('candidate set census mismatch in '+name);
  }
  return {
    schema:'qosha-reachable-block-candidate-audit/v1',
    timestampAsiaBaku:timestamp,
    engineVersion:'qosha-research-0.5.3',
    rulesVersion:'recovered qosa-1.0.0; branch and block candidate semantics remain provisional',
    mode:'3 players x 9 tiles + one stock; same deals across four branch models',
    seedStart,seedEnd:seedStart+deals-1,seedDraws:deals,
    uniqueAllocations,duplicateAllocationSeeds,
    roundsPerModel:uniqueAllocations*ROUNDS_PER_DEAL,totalModelRounds,
    strategies:MIXES.map(mix=>[...mix]),
    models,
    modelDefinitions:{
      global:'global-ever-open number unlock; current research dispatcher',
      currentAll:'double unlocks all currently matching ends at play time; later-arriving sides remain locked',
      localFirst:'double unlocks one currently matching side, first in up/left/right/down order',
      localLast:'double unlocks one currently matching side, last in up/left/right/down order'
    },
    blockContract:'empty stock and >=3 consecutive passes; block candidate sets are diagnostics only',
    candidateDefinitions:{
      minPips:'all seats with the minimum remaining pip sum; not an authenticated winner rule',
      fewestTiles:'all seats with the fewest remaining tiles; contrast metric only',
      lastPasser:'the player whose pass completes the block; no priority assigned'
    },
    checks:{
      resolvedRoundChecks:roundContractChecks,
      blockPreconditionChecks,
      blockRemainderChecks,
      candidateSetChecks
    },
    sourceBlobs:SOURCE_BLOBS,
    finding:'Block incidence is highly sensitive to the provisional branch model; minimum-pip tie rates are descriptive only. No block winner or scoring rule is assigned.',
    confidence:'High for reproducibility and internal measurements under these coded model assumptions; no physical-rule authentication.',
    limitations:[
      'Global-ever-open, current-all, local-first and local-last are alternative provisional branch models, not authenticated table rules.',
      'The models can change legal actions and trajectories; cross-model differences are model sensitivity, not a causal strategy effect.',
      'Random-legal chooses an index from each model-specific action list; lists may differ.',
      'All confidence intervals are approximate 95% deal-clustered intervals; six rounds per deal stay in one cluster.',
      'No block winner, tie split, point award, match score, or strategy superiority is inferred.'
    ],
    nextAction:'On a disjoint seed holdout, retain replay traces for every tied-minimum block and test candidate-set/last-passer diagnostics by policy mix and seat rotation; keep all winner interpretations provisional.'
  };
}
function test(){
  const a=run(9000000,8,'2026-11-03T00:00:00+04:00');
  const b=run(9000000,8,'2026-11-03T00:00:00+04:00');
  if(JSON.stringify(a)!==JSON.stringify(b))throw new Error('deterministic replay failed');
  if(a.seedDraws!==8||a.uniqueAllocations!==8||a.duplicateAllocationSeeds.length!==0){
    throw new Error('pilot allocation census failed');
  }
  for(const name of MODEL_NAMES){
    if(a.models[name].rounds!==48||a.models[name].unresolved!==0){
      throw new Error('pilot round census failed for '+name);
    }
    if(Object.values(a.models[name].minPipCandidateSetSizeCounts)
      .reduce((sum,value)=>sum+value,0)!==a.models[name].blocks){
      throw new Error('pilot candidate-set census failed for '+name);
    }
  }
  return {
    passed:true,pilotDeals:8,roundsPerModel:48,
    totalModelRounds:192,deterministicReplay:true,
    assertions:'allocation census, round census, resolved outcomes, candidate-set census'
  };
}
if(require.main===module){
  const args=process.argv.slice(2);
  console.log(JSON.stringify(args[0]==='test'?test():
    run(Number(args[0]||9000000),Number(args[1]||2000)),null,2));
}
module.exports={run,test,minSet,ratioClusterCI,MODEL_NAMES,MIXES};
