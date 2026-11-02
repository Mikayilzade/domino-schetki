'use strict';
const cohort = require('./pass-history-current-only-cohort');
const softmax = require('./pass-history-opponent-choice-softmax');
const audit = require('./model-agreement-common-world-regret-node');
const PROFILES = ['closed-branch-control', 'min-hand-pips', 'fast-doubles'];
const TEMPERATURES = [0.1, 0.3, 1.5];
const POLICY_PRIOR = [1 / 3, 1 / 3, 1 / 3];
const STRATA = ['3-3', '2-3'];
function check(ok, message) { if (!ok) throw new Error('temperature-grid: ' + message); }
function hash32(s) { let h = 2166136261; for (let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);} return h>>>0; }
function stat(values) {
  const xs=values.filter(Number.isFinite),n=xs.length;
  if(!n)return{n:0,mean:null,sd:null,ci95:null};
  const mean=xs.reduce((a,b)=>a+b,0)/n,sd=Math.sqrt(xs.reduce((a,x)=>a+(x-mean)**2,0)/Math.max(1,n-1));
  return{n,mean,sd,ci95:1.96*sd/Math.sqrt(n)};
}
function weightedCandidateMetrics(worldRows,keys,weights,profile,model){
  const out={};
  for(const key of keys){let sw=0,first=0,remainder=0,minusRisk=0,minusLoss=0;
    for(let i=0;i<worldRows.length;i++){const w=weights[i];if(!w)continue;const m=worldRows[i].metrics[profile][model][key];
      sw+=w;first+=w*Number(m.focalFirst);remainder+=w*m.remainder;minusRisk+=w*Number(m.minusRisk);minusLoss+=w*m.minusLoss;}
    out[key]=sw?{firstFinishChance:first/sw,meanRemainder:remainder/sw,minusRisk:minusRisk/sw,expectedMinusLoss:minusLoss/sw}:null;
  }return out;
}
function summarizeCandidateRegret(states,model,profile,temp,scheme,metric,scale=1){
  return stat(states.map(s=>{const r=s.weightings[model][profile][temp][scheme].regret;const v=r&&r.averageCandidateRegret?r.averageCandidateRegret[metric]:null;return Number.isFinite(v)?v*scale:NaN;}));
}
function summarize(states,profiles,temperatures){
  const result={};
  for(const stratum of ['all',...STRATA]){
    const group=states.filter(s=>stratum==='all'||s.opponentHandSizes===stratum),models={};
    for(const model of ['global','currentOnly']){
      models[model]={};
      for(const profile of profiles){
        models[model][profile]={};
        for(const temp of temperatures){
          const schemes={};
          for(const scheme of ['pass-only','stable-style-mixture','per-decision-mixture']){
            schemes[scheme]={
              firstFinishRegretPp:summarizeCandidateRegret(group,model,profile,temp,scheme,'firstFinishChance',100),
              meanRemainderRegretPips:summarizeCandidateRegret(group,model,profile,temp,scheme,'meanRemainder'),
              minusRiskRegretPp:summarizeCandidateRegret(group,model,profile,temp,scheme,'minusRisk',100),
              expectedMinusLoss:summarizeCandidateRegret(group,model,profile,temp,scheme,'expectedMinusLoss'),
              effectiveSampleSize:stat(group.map(s=>s.weightings[model][profile][temp][scheme].ess))
            };
          }
          const weightedMinusPassOnly={};
          for(const scheme of ['stable-style-mixture','per-decision-mixture']){
            weightedMinusPassOnly[scheme]={};
            for(const[metric,scale]of [['firstFinishChance',100],['meanRemainder',1],['minusRisk',100],['expectedMinusLoss',1]]){
              weightedMinusPassOnly[scheme][metric]=stat(group.map(s=>{
                const a=s.weightings[model][profile][temp][scheme].regret?.averageCandidateRegret?.[metric];
                const b=s.weightings[model][profile][temp]['pass-only'].regret?.averageCandidateRegret?.[metric];
                return Number.isFinite(a)&&Number.isFinite(b)?(a-b)*scale:NaN;
              }));
            }
          }
          models[model][profile][temp]={schemes,weightedMinusPassOnly};
        }
      }
    }
    result[stratum]={stateCount:group.length,models};
  }return result;
}
function runTemperatureGrid(options={}){
  const startSeed=options.startSeed??3553601,deals=options.deals??16000,targetPositions=options.targetPositions??1500,
    maxWorlds=options.maxWorlds??20000,targetPerStratum=options.targetPerStratum??50,
    profiles=options.continuationProfiles||PROFILES,temperatures=options.temperatures||TEMPERATURES;
  check(profiles.length>0&&profiles.every(p=>PROFILES.includes(p)),'invalid continuation profile');
  check(temperatures.length>0&&temperatures.every(t=>Number.isFinite(t)&&t>0),'temperatures must be positive');
  check(targetPerStratum>0,'target per stratum must be positive');
  const discovery=cohort.run({startSeed,deals,targetPositions,maxWorlds}),pool=discovery.positions.filter(p=>p.support.joint>0),prepared=[];
  for(const sm of pool){const state=softmax.prepareState(sm,maxWorlds);if(state.common.length>=2&&STRATA.includes(state.opponentHandSizes))prepared.push(state);}
  const chosen=[];
  for(const stratum of STRATA){
    const group=prepared.filter(s=>s.opponentHandSizes===stratum).sort((a,b)=>hash32('qosha-temperature-grid-v1#'+a.sm.seed)-hash32('qosha-temperature-grid-v1#'+b.sm.seed));
    chosen.push(...group.slice(0,targetPerStratum));
  }
  check(chosen.length===targetPerStratum*STRATA.length,'stratified selection quota not met');
  for(const stratum of STRATA)check(chosen.filter(s=>s.opponentHandSizes===stratum).length===targetPerStratum,'missing stratum '+stratum);
  let candidateWorldPairsPerProfile=0,totalModelRollouts=0,unresolved=0,totalJointWorlds=0;const stateResults=[];
  for(const state of chosen){
    const focal=state.snap.state.currentPlayer;candidateWorldPairsPerProfile+=state.worldRows.length*state.common.length;totalJointWorlds+=state.worldRows.length;
    for(const world of state.worldRows){
      world.temperatureLogWeights={};
      for(const temp of temperatures){
        world.temperatureLogWeights[temp]={global:{},currentOnly:{}};
        for(const model of ['global','currentOnly'])for(const mode of ['stable-style-mixture','per-decision-mixture']){
          world.temperatureLogWeights[temp][model][mode]=softmax.worldLogWeight(state.snap,world.hiddenBySeat,focal,model,mode,POLICY_PRIOR,temp);
        }
      }
      world.metrics={};
      for(const profile of profiles){
        world.metrics[profile]={global:{},currentOnly:{}};
        for(const key of state.common){
          const global=audit.simulateGlobal(state.spec,world,key,profile),currentOnly=audit.simulateCurrent(state.spec,world,key,profile);
          world.metrics[profile].global[key]=global;world.metrics[profile].currentOnly[key]=currentOnly;totalModelRollouts+=2;
          unresolved+=Number(global.outcomeKind==='unresolved')+Number(currentOnly.outcomeKind==='unresolved');
        }
      }
    }
    const weightings={};
    for(const model of ['global','currentOnly']){
      weightings[model]={};
      for(const profile of profiles){
        weightings[model][profile]={};
        const passWeights=state.worldRows.map(()=>1/state.worldRows.length);
        const passRegret=softmax.regretFromCandidateMetrics(weightedCandidateMetrics(state.worldRows,state.common,passWeights,profile,model));
        for(const temp of temperatures){
          const schemes={'pass-only':{ess:state.worldRows.length,positiveWorlds:state.worldRows.length,maxWeight:1/state.worldRows.length,regret:passRegret}};
          for(const mode of ['stable-style-mixture','per-decision-mixture']){
            const logs=state.worldRows.map(w=>w.temperatureLogWeights[temp][model][mode]),posterior=softmax.posteriorWeights(logs);
            schemes[mode]={ess:posterior.ess,positiveWorlds:posterior.positiveCount,maxWeight:posterior.maxWeight,
              regret:softmax.regretFromCandidateMetrics(weightedCandidateMetrics(state.worldRows,state.common,posterior.weights,profile,model))};
          }
          weightings[model][profile][temp]=schemes;
        }
      }
    }
    stateResults.push({seed:state.sm.seed,turn:state.snap.state.turns,opponentHandSizes:state.opponentHandSizes,passCount:state.snap.passHistory.length,
      commonRootActions:state.common.length,support:state.counts,jointWorlds:state.worldRows.length,weightings});
  }
  const now=new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku',hour12:false}).replace(' ','T')+'+04:00';
  return{
    schema:'qosha-opponent-choice-softmax-temperature-grid/v1',timestampBaku:options.timestampBaku||now,
    engine:'qosha-research-0.5.3 + trace-instrumented pass-history support + common-world regret evaluator + temperature grid',
    rules:'recovered qosa-1.0.0; 3x9; global-ever-open/current-only remain provisional',
    seedWindow:{start:startSeed,reservedEnd:startSeed+deals-1,scannedThrough:discovery.lastScannedSeed,uniqueDealAllocations:discovery.uniqueDealAllocations,duplicateDealAllocations:discovery.duplicateDeals},
    discovery:{dealsRequested:deals,dealsGenerated:discovery.dealsGenerated,selectedLateStates:discovery.selectedPositions,jointPositiveStates:pool.length,
      preparedJointMultiActionStates:prepared.length,selectedStates:stateResults.length,selected3v3:stateResults.filter(s=>s.opponentHandSizes==='3-3').length,
      selected2v3:stateResults.filter(s=>s.opponentHandSizes==='2-3').length,outcomes:discovery.outcomes,passObservations:discovery.passObservations},
    opponentChoiceModel:{policies:['random-legal','min-hand-pips','fast-doubles'],priorWeights:POLICY_PRIOR,temperatures,
      stableStyle:'each opponent has one latent policy for the round; equal prior mixture per opponent; independent opponent likelihoods multiply',
      perDecision:'each observed opponent decision independently uses equal mixture of policy action distributions',
      likelihood:'random-legal uniform over all legal actions; min-hand-pips and fast-doubles use softmax over ordinal rank scores; rank scores normalized over distinct action ranks',
      forcedPasses:'not reweighted; exact pass masks already restrict hidden worlds'},
    support:{jointStateWorldAssignments:totalJointWorlds,rawAllocations:stateResults.reduce((a,s)=>a+s.support.raw,0),global:stateResults.reduce((a,s)=>a+s.support.global,0),
      currentOnly:stateResults.reduce((a,s)=>a+s.support.currentOnly,0),joint:stateResults.reduce((a,s)=>a+s.support.joint,0),globalOnly:stateResults.reduce((a,s)=>a+s.support.globalOnly,0),
      currentOnlyExclusive:stateResults.reduce((a,s)=>a+s.support.currentOnlyExclusive,0),neither:stateResults.reduce((a,s)=>a+s.support.neither,0)},
    pairedContinuations:{profiles,candidateWorldPairsPerProfile,modelRolloutsPerProfile:candidateWorldPairsPerProfile*2,totalModelRollouts,unresolved,
      continuationSeeds:'same deterministic hidden-world seed reused across candidates, temperatures, likelihood modes, and both branch models'},
    summaryByStratum:summarize(stateResults,profiles,temperatures),
    selectedStates:stateResults.map(s=>({seed:s.seed,turn:s.turn,opponentHandSizes:s.opponentHandSizes,passCount:s.passCount,commonRootActions:s.commonRootActions,jointWorlds:s.jointWorlds,support:s.support})),
    limitations:['selected synthetic late states discovered under current-only counterfactual; not population representative',
      'opponent-policy prior and softmax rank likelihood are assumptions; forced-pass evidence only is exact',
      'branch opening, block scoring, and global/current-only semantics remain unauthenticated','state-cluster normal intervals are descriptive; no strategy promotion'],
    exactNextAction:'Independent fresh holdout: calibrate opponent-choice likelihood against held-out real decision traces or compare a trace-fitted temperature; preserve common hidden worlds and continuation seeds. Continue seeking authenticated branch/block ruling.',
    cumulativeSeparateCohorts:options.cumulativeBase?{
      dealAllocations:options.cumulativeBase.dealAllocations+discovery.uniqueDealAllocations,
      jointSupportMultiActionStates:options.cumulativeBase.jointSupportMultiActionStates+stateResults.length,
      stateWorldAssignments:options.cumulativeBase.stateWorldAssignments+totalJointWorlds,
      note:'additive cohort summaries; no global dedup of allocations across cohorts or state-world assignments'}:null
  };
}
function test(){
  let assertions=0;const ok=(condition,message)=>{assertions++;check(condition,message);};
  ok(TEMPERATURES[0]<TEMPERATURES[1]&&TEMPERATURES[1]<TEMPERATURES[2],'temperature grid order');
  const regret=require('./decision-regret');
  const actions=[
    {type:'single',side:'up',to:1,tile:[0,1],from:0},
    {type:'single',side:'left',to:2,tile:[0,2],from:0},
    {type:'single',side:'down',to:3,tile:[0,3],from:0}
  ];
  const topKey=regret.actionKey(actions[2]),cold=softmax.policyProbability(actions,topKey,'min-hand-pips',0.1),warm=softmax.policyProbability(actions,topKey,'min-hand-pips',1.5);
  ok(cold>warm,'higher temperature flattens top-action probability');
  const posterior=softmax.posteriorWeights([0,Math.log(2),-Infinity]);
  ok(Math.abs(posterior.weights.reduce((a,b)=>a+b,0)-1)<1e-12,'posterior normalization');
  ok(Math.abs(posterior.ess-1.8)<1e-12&&posterior.positiveCount===2,'posterior ESS');
  ok(softmax.test().passed&&softmax.priorGridTest().passed,'existing softmax and prior-grid regressions');
  return{passed:true,assertions:assertions+softmax.test().assertions+softmax.priorGridTest().assertions};
}
module.exports={runTemperatureGrid,test,hash32,stat,TEMPERATURES,PROFILES};
if(require.main===module){
  const a=process.argv.slice(2),result=a[0]==='test'?test():runTemperatureGrid({
    startSeed:Number(a[0]||3553601),deals:Number(a[1]||16000),targetPositions:Number(a[2]||1500),maxWorlds:Number(a[3]||20000),targetPerStratum:Number(a[4]||50)});
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
