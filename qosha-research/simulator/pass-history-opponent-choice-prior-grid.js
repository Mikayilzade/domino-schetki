'use strict';
const e=require('./engine'),alloc=require('./hidden-world-enumeration'),cohort=require('./pass-history-current-only-cohort');
const audit=require('./model-agreement-common-world-regret-node'),rd=require('./round-driver'),d=require('./turn-dispatcher'),regret=require('./decision-regret');
const SIDES=e.SIDES, POLICIES=['random-legal','min-hand-pips','fast-doubles'];
const PROFILES=['closed-branch-control','min-hand-pips','fast-doubles'];
const PRIOR=1/POLICIES.length;
function ck(x,m){if(!x)throw Error('opponent-choice likelihood audit: '+m);}
function hash32(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function currentState(snap){
 const s=snap.state,openBySide=Object.fromEntries(SIDES.map(side=>[side,new Set()]));
 ck(snap.openedAtDouble instanceof Map,'missing opening ledger');
 for(const[n,sides]of snap.openedAtDouble)for(const side of sides)openBySide[side].add(n);
 return{branchState:e.cloneBranchState(s.branchState),openBySide,usedNumbers:new Set([...s.openingState.openedNumbers]),
  hands:s.hands.map(h=>h.map(t=>[...t])),stock:s.stock.map(t=>[...t]),currentPlayer:s.currentPlayer,
  turns:s.turns,consecutivePasses:s.consecutivePasses,outcome:null};
}
function passValid(a,snap,focal,fh,seats){
 const hands=[[],[],[]];hands[focal]=fh.map(t=>[...t]);seats.forEach((p,i)=>hands[p]=a.hiddenHands[i].map(t=>[...t]));
 let g=true,c=true;
 for(const pass of snap.passHistory){
  const later=snap.playedEvents.filter(x=>x.player===pass.player&&x.turn>pass.turn).flatMap(x=>x.tiles.map(t=>[...t]));
  const hand=[...hands[pass.player],...later];ck(hand.length===pass.handSizeAtPass,'pass-time hand size');
  ck(new Set(hand.map(e.tileKey)).size===hand.length,'duplicate pass-time tile');
  if(hand.some(t=>pass.forbiddenGlobal.includes(e.tileKey(t))))g=false;
  if(hand.some(t=>pass.forbiddenCurrent.includes(e.tileKey(t))))c=false;
 }
 return{g,c,j:g&&c,go:g&&!c,ce:c&&!g,neither:!g&&!c};
}
function stateFor(snap,a,focal,seats){
 const s=rd.cloneRoundState(snap.state);s.hands[focal]=snap.state.hands[focal].map(t=>[...t]);
 seats.forEach((p,i)=>s.hands[p]=a.hiddenHands[i].map(t=>[...t]));s.stock=a.stock.map(t=>[...t]);s.outcome=null;return s;
}
function signature(snap,cur){const s=snap.state;return[snap.seed,s.turns,s.currentPlayer,SIDES.map(x=>s.branchState.branches[x].end).join(','),
 [...s.openingState.openedNumbers].sort((a,b)=>a-b).join(','),SIDES.map(x=>[...cur.openBySide[x]].sort().join('.')).join('/'),
 s.hands[s.currentPlayer].map(e.tileKey).sort().join(','),
 snap.passHistory.map(p=>p.player+'@'+p.turn+':'+p.forbiddenGlobal.join(',')+':'+p.forbiddenCurrent.join(',')).join(';')].join('#');}
function tupleCompare(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){const z=(a[i]||0)-(b[i]||0);if(z)return z;}return 0;}
function actionRank(policy,a){
 const finish=a.type==='mixed-finish'?1:0,tiles=a.type==='single'?[a.tile]:(a.tiles||[]);
 const pips=e.pipSum(tiles),doubles=tiles.filter(t=>t[0]===t[1]).length;
 return policy==='fast-doubles'?[finish,doubles,pips]:[finish,pips];
}
function policyProbability(actions,observedKey,policy){
 if(!actions.length)return 0;
 const keyed=actions.map(a=>({key:regret.actionKey(a),rank:actionRank(policy,a)}));
 if(policy==='random-legal')return keyed.some(x=>x.key===observedKey)?1/keyed.length:0;
 let best=keyed[0].rank;for(const x of keyed)if(tupleCompare(x.rank,best)>0)best=x.rank;
 const top=keyed.filter(x=>tupleCompare(x.rank,best)===0);
 return top.some(x=>x.key===observedKey)?1/top.length:0;
}
function logSumExp(xs){const m=Math.max(...xs);if(m===-Infinity)return-Infinity;return m+Math.log(xs.reduce((a,x)=>a+Math.exp(x-m),0));}
function decisionHand(snapshot,hiddenBySeat,seat,decision){
 const later=snapshot.playedEvents.filter(ev=>ev.player===seat&&ev.turn>=decision.turn).flatMap(ev=>ev.tiles.map(t=>[...t]));
 const hand=[...hiddenBySeat[seat].map(t=>[...t]),...later];
 ck(hand.length===decision.handSizeBefore,'reconstructed decision hand size at turn '+decision.turn+' seat '+seat);
 ck(new Set(hand.map(e.tileKey)).size===hand.length,'duplicate reconstructed decision hand');
 return hand;
}
function actionsAtDecision(decision,hand,model){
 const branch=e.cloneBranchState(decision.branchState),opening=e.cloneOpeningState(decision.openingState);
 if(model==='global')return d.actionsForHand(branch,opening,hand);
 if(model==='currentOnly'){
  const opened=new Map(decision.openedAtDouble.map(([n,sides])=>[n,new Set(sides)]));
  return cohort.currentOnlyActions(branch,opening,opened,hand);
 }
 throw Error('unknown branch model '+model);
}

function validatePriorWeights(weights){
 ck(Array.isArray(weights)&&weights.length===POLICIES.length,'prior weights length');
 ck(weights.every(x=>Number.isFinite(x)&&x>=0),'prior weights must be finite/nonnegative');
 ck(Math.abs(weights.reduce((a,b)=>a+b,0)-1)<1e-12,'prior weights must sum to one');
 return weights;
}
function weightedPolicyMixture(probabilities,weights){
 validatePriorWeights(weights);ck(probabilities.length===weights.length,'policy probability length');
 return probabilities.reduce((sum,p,i)=>sum+weights[i]*p,0);
}
function stableStyleMixtureLogLikelihood(policyLogLikelihoods,weights){
 validatePriorWeights(weights);ck(policyLogLikelihoods.length===weights.length,'policy log likelihood length');
 return logSumExp(policyLogLikelihoods.map((x,i)=>x===-Infinity||weights[i]===0?-Infinity:x+Math.log(weights[i])));
}

function seatLogLikelihood(snapshot,hiddenBySeat,seat,model,mode,priorWeights=POLICIES.map(()=>PRIOR)){
 const decisions=snapshot.decisionHistory.filter(x=>x.player===seat&&x.action&&x.turn<snapshot.state.turns);
 if(!decisions.length)return 0;
 const logs=POLICIES.map(()=>0);let mixtureLog=0;
 for(const decision of decisions){
  const hand=decisionHand(snapshot,hiddenBySeat,seat,decision),actions=actionsAtDecision(decision,hand,model);
  const probs=POLICIES.map(p=>policyProbability(actions,decision.actionKey,p));
  if(mode==='per-decision-mixture'){
   const p=weightedPolicyMixture(probs,priorWeights);if(!(p>0))return-Infinity;mixtureLog+=Math.log(p);
  }else{
   for(let i=0;i<logs.length;i++){if(logs[i]===-Infinity||!(probs[i]>0))logs[i]=-Infinity;else logs[i]+=Math.log(probs[i]);}
  }
 }
 return mode==='per-decision-mixture'?mixtureLog:stableStyleMixtureLogLikelihood(logs,priorWeights);
}
function worldLogWeight(snapshot,hiddenBySeat,focal,model,mode,priorWeights=POLICIES.map(()=>PRIOR)){
 const opponents=[0,1,2].filter(p=>p!==focal);
 return opponents.reduce((sum,seat)=>{const v=seatLogLikelihood(snapshot,hiddenBySeat,seat,model,mode,priorWeights);return sum===-Infinity||v===-Infinity?-Infinity:sum+v;},0);
}
function posteriorWeights(logs){
 const max=Math.max(...logs);if(max===-Infinity)return{weights:logs.map(()=>0),positiveCount:0,ess:0,maxWeight:0};
 const raw=logs.map(x=>x===-Infinity?0:Math.exp(x-max)),sum=raw.reduce((a,b)=>a+b,0),weights=raw.map(x=>x/sum);
 return{weights,positiveCount:weights.filter(x=>x>0).length,ess:1/weights.reduce((a,x)=>a+x*x,0),maxWeight:Math.max(...weights)};
}
function weightedCandidateMetrics(worldRows,candidateKeys,weights,profile,model){
 const out={};for(const key of candidateKeys){let sw=0,first=0,rem=0,risk=0,loss=0;
  for(let i=0;i<worldRows.length;i++){const w=weights[i];if(!w)continue;const m=worldRows[i].metrics[profile][model][key];sw+=w;first+=w*+m.focalFirst;rem+=w*m.remainder;risk+=w*+m.minusRisk;loss+=w*m.minusLoss;}
  out[key]=sw?{firstFinishChance:first/sw,meanRemainder:rem/sw,minusRisk:risk/sw,expectedMinusLoss:loss/sw}:null;
 }return out;
}
function regretFromCandidateMetrics(byCandidate){
 const xs=Object.values(byCandidate).filter(Boolean);if(xs.length<2)return null;
 const best={firstFinishChance:Math.max(...xs.map(x=>x.firstFinishChance)),meanRemainder:Math.min(...xs.map(x=>x.meanRemainder)),
  minusRisk:Math.min(...xs.map(x=>x.minusRisk)),expectedMinusLoss:Math.min(...xs.map(x=>x.expectedMinusLoss))};
 const keys=Object.keys(best),per=xs.map(x=>({firstFinishChance:best.firstFinishChance-x.firstFinishChance,
  meanRemainder:x.meanRemainder-best.meanRemainder,minusRisk:x.minusRisk-best.minusRisk,
  expectedMinusLoss:x.expectedMinusLoss-best.expectedMinusLoss}));
 const average=Object.fromEntries(keys.map(k=>[k,per.reduce((a,x)=>a+x[k],0)/per.length]));
 const spread=Object.fromEntries(keys.map(k=>[k,Math.max(...xs.map(x=>x[k]))-Math.min(...xs.map(x=>x[k]))]));
 return{candidateCount:xs.length,best,averageCandidateRegret:average,spread};
}
function evaluateWeighting(worldRows,candidateKeys,profile,model,mode){
 const logs=worldRows.map(x=>x.logWeights[model][mode]),post=mode==='pass-only'?
  {weights:worldRows.map(()=>1/worldRows.length),positiveCount:worldRows.length,ess:worldRows.length,maxWeight:1/worldRows.length}:posteriorWeights(logs);
 const byCandidate=weightedCandidateMetrics(worldRows,candidateKeys,post.weights,profile,model);
 return{positiveWorlds:post.positiveCount,effectiveSampleSize:post.ess,maxPosteriorWeight:post.maxWeight,
  candidateMetrics:byCandidate,regret:regretFromCandidateMetrics(byCandidate)};
}
function stats(values,scale=1){
 const xs=values.filter(Number.isFinite).map(x=>x*scale),n=xs.length;if(!n)return{n:0,mean:null,sd:null,ci95:null};
 const mean=xs.reduce((a,b)=>a+b,0)/n,sd=Math.sqrt(xs.reduce((a,x)=>a+(x-mean)**2,0)/Math.max(1,n-1));
 return{n,mean,sd,ci95:1.96*sd/Math.sqrt(n)};
}
function summarizeMetric(states,model,profile,scheme,metric,scale=1){
 return stats(states.map(s=>s.weightings[model][profile][scheme].regret?.averageCandidateRegret?.[metric]),scale);
}
function summarizeStrata(states,profiles){
 const out={};for(const stratum of ['all','3-3','2-3']){
  const group=states.filter(s=>stratum==='all'||s.opponentHandSizes===stratum);
  const models={};for(const model of ['global','currentOnly']){models[model]={};for(const profile of profiles){
   const schemes={};for(const scheme of ['pass-only','stable-style-mixture','per-decision-mixture']){
    schemes[scheme]={
     firstFinishRegretPp:summarizeMetric(group,model,profile,scheme,'firstFinishChance',100),
     meanRemainderRegretPips:summarizeMetric(group,model,profile,scheme,'meanRemainder'),
     minusRiskRegretPp:summarizeMetric(group,model,profile,scheme,'minusRisk',100),
     expectedMinusLoss:summarizeMetric(group,model,profile,scheme,'expectedMinusLoss'),
     effectiveSampleSize:stats(group.map(s=>s.weightings[model][profile][scheme].effectiveSampleSize))
    };
   }
   const deltas={};for(const scheme of ['stable-style-mixture','per-decision-mixture']){
    deltas[scheme]={};for(const [metric,scale] of [['firstFinishChance',100],['meanRemainder',1],['minusRisk',100],['expectedMinusLoss',1]]){
     deltas[scheme][metric]=stats(group.map(s=>{
      const a=s.weightings[model][profile][scheme].regret?.averageCandidateRegret?.[metric];
      const b=s.weightings[model][profile]['pass-only'].regret?.averageCandidateRegret?.[metric];
      return Number.isFinite(a)&&Number.isFinite(b)?a-b:NaN;
     }),scale);
    }
   }
   models[model][profile]={schemes,weightedMinusPassOnly:deltas};
  }}
  out[stratum]={stateCount:group.length,models};
 }return out;
}
function reconstructSnapshot(seed,expected,maxWorlds){
 const round=cohort.simulateSeed(seed);for(let i=round.eligible.length-1;i>=0;i--){const snap={...round.eligible[i],seed};
  try{const summary=cohort.analyzeSnapshot(snap,maxWorlds);if(JSON.stringify(summary.support)===JSON.stringify(expected))return snap;}
  catch(err){if(!/exact support exceeds cap/.test(err.message))throw err;}}
 return null;
}
function prepareState(sm,maxWorlds){
 const snap=reconstructSnapshot(sm.seed,sm.support,maxWorlds);ck(snap,'could not reconstruct selected snapshot');
 ck(Array.isArray(snap.decisionHistory),'decision trace missing; use trace-instrumented cohort runner');
 const s=snap.state,f=s.currentPlayer,fh=s.hands[f].map(t=>[...t]),seats=[(f+1)%3,(f+2)%3];
 const known=new Set([...snap.playedTiles,...fh].map(e.tileKey));ck(known.size===snap.playedTiles.length+fh.length,'known tile overlap');
 const pool=e.createDoubleSixDeck().filter(t=>!known.has(e.tileKey(t))),sizes=seats.map(p=>s.hands[p].length);
 ck(pool.length===sizes[0]+sizes[1]+s.stock.length,'hidden pool size');
 const cur=currentState(snap),sig=signature(snap,cur),spec={seed:sm.seed,signature:sig,state:rd.cloneRoundState(s),current:cur};
 const globalKeys=audit.globalActionKeys(s),currentKeys=audit.currentActionKeys(cur),common=globalKeys.filter(k=>currentKeys.includes(k));
 const counts={raw:0,global:0,currentOnly:0,joint:0,globalOnly:0,currentOnlyExclusive:0,neither:0},worldRows=[],seen=new Set();
 const allocationSpec={pool,hiddenHandSizes:sizes,stockSize:s.stock.length};
 for(const a of alloc.iterateAllocations(allocationSpec)){
  counts.raw++;const v=passValid(a,snap,f,fh,seats);counts.global+=+v.g;counts.currentOnly+=+v.c;counts.joint+=+v.j;
  counts.globalOnly+=+v.go;counts.currentOnlyExclusive+=+v.ce;counts.neither+=+v.neither;
  const fp=alloc.allocationFingerprint(a);ck(!seen.has(fp),'duplicate hidden allocation');seen.add(fp);
  if(!v.j)continue;
  const st=stateFor(snap,a,f,seats),seed=e.mixSeed32(hash32(sig+'#'+fp)^0x6d2b79f5);
  const hiddenBySeat=st.hands.map(h=>h.map(t=>[...t]));
  const logWeights={global:{},currentOnly:{}};
  for(const model of ['global','currentOnly'])for(const mode of ['stable-style-mixture','per-decision-mixture'])
   logWeights[model][mode]=worldLogWeight(snap,hiddenBySeat,f,model,mode);
  worldRows.push({key:fp,seed,state:st,hiddenBySeat,logWeights,metrics:{}});
 }
 ck(JSON.stringify(counts)===JSON.stringify(sm.support),'exact support counts mismatch');
 ck(worldRows.length===sm.support.joint,'joint support count mismatch');
 return{sm,snap,spec,cur,common,counts,worldRows,opponentHandSizes:sizes.slice().sort((a,b)=>a-b).join('-')};
}
function runAudit(options={}){
 const startSeed=options.startSeed??3489601,deals=options.deals??12000,targetPositions=options.targetPositions??800,
  maxWorlds=options.maxWorlds??20000,targetPerStratum=options.targetPerStratum??35,
  profiles=options.continuationProfiles||PROFILES;
 ck(profiles.length>0&&profiles.every(p=>['closed-branch-control','min-hand-pips','fast-doubles','moderate-double-hold'].includes(p)),'invalid profiles');
 const discovery=cohort.run({startSeed,deals,targetPositions,maxWorlds});
 const pool=discovery.positions.filter(p=>p.support.joint>0),prepared=[];
 for(const sm of pool){const p=prepareState(sm,maxWorlds);if(p.common.length>=2&&(p.opponentHandSizes==='3-3'||p.opponentHandSizes==='2-3'))prepared.push(p);}
 const chosen=[];for(const stratum of ['3-3','2-3']){
  const group=prepared.filter(x=>x.opponentHandSizes===stratum).sort((a,b)=>
   hash32('qosha-choice-likelihood-holdout-v1#'+a.sm.seed)-hash32('qosha-choice-likelihood-holdout-v1#'+b.sm.seed));
  chosen.push(...group.slice(0,targetPerStratum));
 }
 const candidatePairsPerProfile=chosen.reduce((a,s)=>a+s.worldRows.length*s.common.length,0);
 let totalRollouts=0,unresolved=0;const stateResults=[];
 for(const state of chosen){
  for(const world of state.worldRows){for(const profile of profiles){world.metrics[profile]={global:{},currentOnly:{}};
   for(const key of state.common){
    const g=audit.simulateGlobal(state.spec,world,key,profile),c=audit.simulateCurrent(state.spec,world,key,profile);
    world.metrics[profile].global[key]=g;world.metrics[profile].currentOnly[key]=c;totalRollouts+=2;
    unresolved+=+(g.outcomeKind==='unresolved')+(c.outcomeKind==='unresolved');
   }
  }}
  const weightings={};for(const model of ['global','currentOnly']){weightings[model]={};for(const profile of profiles){
   weightings[model][profile]={};for(const mode of ['pass-only','stable-style-mixture','per-decision-mixture'])
    weightings[model][profile][mode]=evaluateWeighting(state.worldRows,state.common,profile,model,mode);
  }}
  stateResults.push({seed:state.sm.seed,turn:state.snap.state.turns,focalPlayer:state.snap.state.currentPlayer,
   opponentHandSizes:state.opponentHandSizes,passCount:state.snap.passHistory.length,commonRootActions:state.common.length,
   support:state.counts,jointWorlds:state.worldRows.length,likelihoodPositiveWorlds:{
    globalStable:state.worldRows.filter(w=>w.logWeights.global['stable-style-mixture']>-Infinity).length,
    currentStable:state.worldRows.filter(w=>w.logWeights.currentOnly['stable-style-mixture']>-Infinity).length,
    globalPerDecision:state.worldRows.filter(w=>w.logWeights.global['per-decision-mixture']>-Infinity).length,
    currentPerDecision:state.worldRows.filter(w=>w.logWeights.currentOnly['per-decision-mixture']>-Infinity).length},
   weightings});
 }
 const summaryByStratum=summarizeStrata(stateResults,profiles),totalJointWorlds=stateResults.reduce((a,s)=>a+s.jointWorlds,0);
 return{schema:'qosha-opponent-choice-likelihood-audit/v1',
  timestampBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku',hour12:false}).replace(' ','T')+'+04:00',
  engine:'qosha-research-0.5.3 + trace-instrumented pass-history support + common-world regret evaluator',
  rules:'recovered qosa-1.0.0; 3x9; global-ever-open/current-only remain provisional',
  seedWindow:{start:startSeed,reservedEnd:startSeed+deals-1,scannedThrough:discovery.lastScannedSeed,uniqueDealAllocations:discovery.uniqueDealAllocations,duplicateDealAllocations:discovery.duplicateDeals},
  discovery:{dealsRequested:deals,dealsGenerated:discovery.dealsGenerated,selectedLateStates:discovery.selectedPositions,
   jointPositiveStates:pool.length,preparedJointMultiActionStates:prepared.length,selectedStates:stateResults.length,
   selected3v3:stateResults.filter(s=>s.opponentHandSizes==='3-3').length,selected2v3:stateResults.filter(s=>s.opponentHandSizes==='2-3').length,
   outcomes:discovery.outcomes,passObservations:discovery.passObservations},
  opponentChoiceModel:{policies:POLICIES,priorWeights:Object.fromEntries(POLICIES.map(p=>[p,PRIOR])),
   stableStyle:'each opponent has one latent policy for the round; equal prior mixture per opponent; multiply independent opponent likelihoods',
   perDecision:'each opponent action independently uses equal mixture of the three policy action distributions',
   policyActionLikelihood:'random-legal is uniform over all legal actions; min-hand-pips / fast-doubles are uniform over top-ranked actions; action ranking matches the cohort generator',
   forcedPasses:'not reweighted; exact pass masks already require no legal tile'},
  support:{jointStateWorldAssignments:totalJointWorlds,rawAllocations:stateResults.reduce((a,s)=>a+s.support.raw,0),
   global:stateResults.reduce((a,s)=>a+s.support.global,0),currentOnly:stateResults.reduce((a,s)=>a+s.support.currentOnly,0),
   joint:stateResults.reduce((a,s)=>a+s.support.joint,0),globalOnly:stateResults.reduce((a,s)=>a+s.support.globalOnly,0),
   currentOnlyExclusive:stateResults.reduce((a,s)=>a+s.support.currentOnlyExclusive,0),neither:stateResults.reduce((a,s)=>a+s.support.neither,0)},
  pairedContinuations:{profiles,candidateWorldPairsPerProfile:candidatePairsPerProfile,modelRolloutsPerProfile:candidatePairsPerProfile*2,
   totalModelRollouts:totalRollouts,unresolved,continuationSeeds:'same deterministic world seed reused for all candidate arms and both branch models'},
  summaryByStratum,states:stateResults,
  limitations:['selected late states from current-only-counterfactual discovery; not population representative',
   'pass-only support is exact for the stated masks; opponent-choice posterior depends on the explicit policy prior and likelihood approximation',
   'policy type is not authenticated; action model treats a policy as uniform among top-ranked legal actions',
   'forced passes are handled by support masks; draw/stock likelihood is not modeled beyond recovered 3x9 opening',
   'global/current-only branch semantics and block scoring remain unauthenticated; regret is model-dependent',
   'state-cluster normal intervals are descriptive; subgroup results are exploratory; no strategy promoted'],
  exactNextAction:'replicate the likelihood-weighting effect on a fresh disjoint seed window; compare stable-style and per-decision mixture ESS and weighted regret; prioritize authentic branch/block ruling'};
}

const DEFAULT_PRIOR_GRID={'uniform':[1/3,1/3,1/3],'random-legal-heavy':[0.6,0.2,0.2],'fast-doubles-heavy':[0.2,0.2,0.6]};
function priorGridTest(){
 let assertions=0;const ok=(x,m)=>{assertions++;ck(x,m);};const g=DEFAULT_PRIOR_GRID;
 for(const[name,w]of Object.entries(g))ok(Math.abs(w.reduce((a,b)=>a+b,0)-1)<1e-12,'normalized prior '+name);
 ok(Math.abs(weightedPolicyMixture([1,0,0],g.uniform)-1/3)<1e-12,'uniform action mass');
 ok(Math.abs(weightedPolicyMixture([1,0,0],g['random-legal-heavy'])-0.6)<1e-12,'random-heavy action mass');
 ok(Math.abs(weightedPolicyMixture([1,0,0],g['fast-doubles-heavy'])-0.2)<1e-12,'fast-heavy action mass');
 ok(Math.abs(Math.exp(stableStyleMixtureLogLikelihood([Math.log(0.5),Math.log(0.25),-Infinity],g['random-legal-heavy']))-0.35)<1e-12,'stable-style weighted likelihood');
 const p=posteriorWeights([0,Math.log(2),-Infinity]);
 ok(Math.abs(p.weights.reduce((a,b)=>a+b,0)-1)<1e-12,'posterior normalization');
 ok(Math.abs(p.ess-1.8)<1e-12&&p.positiveCount===2,'posterior ESS/support');
 let rejected=false;try{weightedPolicyMixture([1,0,0],[0.8,0.3,-0.1]);}catch(_){rejected=true;}ok(rejected,'invalid prior rejected');
 ok(weightedPolicyMixture([0.2,0.4,0.8],g['fast-doubles-heavy'])>weightedPolicyMixture([0.2,0.4,0.8],g['random-legal-heavy']),'prior direction');
 return{passed:true,assertions};
}
function runPriorGrid(options={}){
 const startSeed=options.startSeed??3521601,deals=options.deals??16000,targetPositions=options.targetPositions??1500,
  maxWorlds=options.maxWorlds??20000,targetPerStratum=options.targetPerStratum??50,
  profiles=options.continuationProfiles||PROFILES,priorGrid=options.priorGrid||DEFAULT_PRIOR_GRID;
 ck(profiles.length>0&&profiles.every(p=>['closed-branch-control','min-hand-pips','fast-doubles','moderate-double-hold'].includes(p)),'invalid continuation profiles');
 for(const weights of Object.values(priorGrid))validatePriorWeights(weights);
 const priorNames=Object.keys(priorGrid),discovery=cohort.run({startSeed,deals,targetPositions,maxWorlds});
 const pool=discovery.positions.filter(p=>p.support.joint>0),prepared=[];
 for(const sm of pool){const p=prepareState(sm,maxWorlds);if(p.common.length>=2&&(p.opponentHandSizes==='3-3'||p.opponentHandSizes==='2-3'))prepared.push(p);}
 const chosen=[];
 for(const stratum of ['3-3','2-3']){
  const group=prepared.filter(x=>x.opponentHandSizes===stratum).sort((a,b)=>hash32('qosha-prior-grid-holdout-v1#'+a.sm.seed)-hash32('qosha-prior-grid-holdout-v1#'+b.sm.seed));
  chosen.push(...group.slice(0,targetPerStratum));
 }
 let candidateWorldPairsPerProfile=0,totalRollouts=0,unresolved=0,totalJointWorlds=0;const stateResults=[];
 for(const state of chosen){
  const focal=state.snap.state.currentPlayer;candidateWorldPairsPerProfile+=state.worldRows.length*state.common.length;totalJointWorlds+=state.worldRows.length;
  for(const world of state.worldRows){
   world.priorLogs={};
   for(const priorName of priorNames){
    world.priorLogs[priorName]={global:{},currentOnly:{}};
    for(const model of ['global','currentOnly'])for(const mode of ['stable-style-mixture','per-decision-mixture'])
     world.priorLogs[priorName][model][mode]=worldLogWeight(state.snap,world.hiddenBySeat,focal,model,mode,priorGrid[priorName]);
   }
   world.metrics={};
   for(const profile of profiles){
    world.metrics[profile]={global:{},currentOnly:{}};
    for(const key of state.common){
     const g=audit.simulateGlobal(state.spec,world,key,profile),c=audit.simulateCurrent(state.spec,world,key,profile);
     world.metrics[profile].global[key]=g;world.metrics[profile].currentOnly[key]=c;totalRollouts+=2;
     unresolved+=+(g.outcomeKind==='unresolved')+(c.outcomeKind==='unresolved');
    }
   }
  }
  const weightings={};
  for(const model of ['global','currentOnly']){
   weightings[model]={};
   for(const profile of profiles){
    weightings[model][profile]={};
    for(const priorName of priorNames){
     const schemes={},passWeights=state.worldRows.map(()=>1/state.worldRows.length);
     schemes['pass-only']={positiveWorlds:state.worldRows.length,effectiveSampleSize:state.worldRows.length,
      maxPosteriorWeight:1/state.worldRows.length,regret:regretFromCandidateMetrics(weightedCandidateMetrics(state.worldRows,state.common,passWeights,profile,model))};
     for(const mode of ['stable-style-mixture','per-decision-mixture']){
      const logs=state.worldRows.map(w=>w.priorLogs[priorName][model][mode]),post=posteriorWeights(logs);
      schemes[mode]={positiveWorlds:post.positiveCount,effectiveSampleSize:post.ess,maxPosteriorWeight:post.maxWeight,
       regret:regretFromCandidateMetrics(weightedCandidateMetrics(state.worldRows,state.common,post.weights,profile,model))};
     }
     weightings[model][profile][priorName]=schemes;
    }
   }
  }
  stateResults.push({seed:state.sm.seed,turn:state.snap.state.turns,opponentHandSizes:state.opponentHandSizes,passCount:state.snap.passHistory.length,
   commonRootActions:state.common.length,jointWorlds:state.worldRows.length,support:state.counts,weightings});
 }
 const stat=(values,scale=1)=>{const xs=values.filter(Number.isFinite).map(x=>x*scale),n=xs.length;if(!n)return{n:0,mean:null,sd:null,ci95:null};const mean=xs.reduce((a,b)=>a+b,0)/n,sd=Math.sqrt(xs.reduce((a,x)=>a+(x-mean)**2,0)/Math.max(1,n-1));return{n,mean,sd,ci95:1.96*sd/Math.sqrt(n)};};
 const summaryByStratum={};
 for(const stratum of ['all','3-3','2-3']){
  const group=stateResults.filter(s=>stratum==='all'||s.opponentHandSizes===stratum),models={};
  for(const model of ['global','currentOnly']){
   models[model]={};
   for(const profile of profiles){
    models[model][profile]={};
    for(const priorName of priorNames){
     const schemes={};
     for(const scheme of ['pass-only','stable-style-mixture','per-decision-mixture']){
      const getReg=s=>s.weightings[model][profile][priorName][scheme].regret?.averageCandidateRegret;
      schemes[scheme]={firstFinishRegretPp:stat(group.map(s=>getReg(s)?.firstFinishChance),100),
       meanRemainderRegretPips:stat(group.map(s=>getReg(s)?.meanRemainder)),minusRiskRegretPp:stat(group.map(s=>getReg(s)?.minusRisk),100),
       expectedMinusLoss:stat(group.map(s=>getReg(s)?.expectedMinusLoss)),
       effectiveSampleSize:stat(group.map(s=>s.weightings[model][profile][priorName][scheme].effectiveSampleSize))};
     }
     const deltas={};
     for(const scheme of ['stable-style-mixture','per-decision-mixture']){
      deltas[scheme]={};
      for(const[metric,scale]of [['firstFinishChance',100],['meanRemainder',1],['minusRisk',100],['expectedMinusLoss',1]]){
       deltas[scheme][metric]=stat(group.map(s=>{const a=s.weightings[model][profile][priorName][scheme].regret?.averageCandidateRegret?.[metric],b=s.weightings[model][profile][priorName]['pass-only'].regret?.averageCandidateRegret?.[metric];return Number.isFinite(a)&&Number.isFinite(b)?a-b:NaN;}),scale);
      }
     }
     models[model][profile][priorName]={schemes,weightedMinusPassOnly:deltas};
    }
   }
  }
  summaryByStratum[stratum]={stateCount:group.length,models};
 }
 const now=new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku',hour12:false}).replace(' ','T')+'+04:00';
 return{schema:'qosha-opponent-choice-prior-grid/v1',timestampBaku:options.timestampBaku||now,
  engine:'qosha-research-0.5.3 + trace-instrumented pass-history support + common-world regret evaluator + prior-grid weighting',
  rules:'recovered qosa-1.0.0; 3x9; global-ever-open/current-only remain provisional',
  seedWindow:{start:startSeed,reservedEnd:startSeed+deals-1,scannedThrough:discovery.lastScannedSeed,uniqueDealAllocations:discovery.uniqueDealAllocations,duplicateDealAllocations:discovery.duplicateDeals},
  discovery:{dealsRequested:deals,dealsGenerated:discovery.dealsGenerated,selectedLateStates:discovery.selectedPositions,jointPositiveStates:pool.length,
   preparedJointMultiActionStates:prepared.length,selectedStates:stateResults.length,selected3v3:stateResults.filter(s=>s.opponentHandSizes==='3-3').length,
   selected2v3:stateResults.filter(s=>s.opponentHandSizes==='2-3').length,outcomes:discovery.outcomes,passObservations:discovery.passObservations},
  opponentChoiceModel:{policies:POLICIES,priors:priorGrid,stableStyle:'one latent policy per opponent for the round; prior mixture per opponent; opponent likelihoods multiply',
   perDecision:'at each observed decision, prior-weighted mixture of policy action distributions',
   policyActionLikelihood:'random-legal uniform over legal actions; min-hand-pips/fast-doubles uniform over top-ranked actions',forcedPasses:'exact pass masks; not reweighted'},
  pairedContinuations:{profiles,candidateWorldPairsPerProfile,modelRolloutsPerProfile:candidateWorldPairsPerProfile*2,totalModelRollouts:totalRollouts,unresolved,
   continuationSeeds:'same deterministic hidden-world seed reused across candidates and both branch models'},
  support:{jointStateWorldAssignments:totalJointWorlds,rawAllocations:stateResults.reduce((a,s)=>a+s.support.raw,0),global:stateResults.reduce((a,s)=>a+s.support.global,0),
   currentOnly:stateResults.reduce((a,s)=>a+s.support.currentOnly,0),joint:stateResults.reduce((a,s)=>a+s.support.joint,0),globalOnly:stateResults.reduce((a,s)=>a+s.support.globalOnly,0),
   currentOnlyExclusive:stateResults.reduce((a,s)=>a+s.support.currentOnlyExclusive,0),neither:stateResults.reduce((a,s)=>a+s.support.neither,0)},
  summaryByStratum,
  selectedStates:stateResults.map(s=>({seed:s.seed,turn:s.turn,opponentHandSizes:s.opponentHandSizes,passCount:s.passCount,commonRootActions:s.commonRootActions,jointWorlds:s.jointWorlds,support:s.support})),
  stateRegret:stateResults.map(s=>({seed:s.seed,opponentHandSizes:s.opponentHandSizes,weightings:Object.fromEntries(['global','currentOnly'].map(m=>[m,Object.fromEntries(profiles.map(p=>[p,
   Object.fromEntries(priorNames.map(pr=>[pr,Object.fromEntries(['pass-only','stable-style-mixture','per-decision-mixture'].map(sc=>[sc,{ess:s.weightings[m][p][pr][sc].effectiveSampleSize,
    regret:s.weightings[m][p][pr][sc].regret?.averageCandidateRegret??null}]))]))]))]))})),
  limitations:['selected synthetic late states discovered under current-only counterfactual; not population representative',
   'opponent-policy prior grid and top-ranked-action likelihood are assumptions; forced-pass evidence only is exact',
   'branch opening, block scoring, and global/current-only semantics remain unauthenticated','state-cluster normal intervals are descriptive; no strategy promotion'],
  exactNextAction:'Independent fresh holdout; test prior-grid stability with alternative action-likelihood temperature/softmax rather than only uniform top-ranked actions; seek authenticated branch/block ruling',
  cumulativeSeparateCohorts:{dealAllocations:53028+discovery.uniqueDealAllocations,jointSupportMultiActionStates:774+stateResults.length,stateWorldAssignments:4171+totalJointWorlds,
   note:'additive cohort summaries; no global dedup of allocations across cohorts or state-world assignments'}};
}

function test(){
 let assertions=0;const ok=(x,m)=>{assertions++;ck(x,m);};
 const actions=[{type:'single',side:'up',to:2,tile:[1,2],from:1},{type:'single',side:'left',to:3,tile:[1,3],from:1},
  {type:'double-sequence',numbers:[1],tiles:[[1,1]]}];
 const keys=actions.map(regret.actionKey);
 ok(Math.abs(policyProbability(actions,keys[0],'random-legal')-1/3)<1e-12,'random-legal mass');
 ok(policyProbability(actions,keys[1],'min-hand-pips')===1,'min-pips top action');
 ok(policyProbability(actions,keys[0],'min-hand-pips')===0,'min-pips rejects non-top');
 ok(policyProbability(actions,keys[2],'fast-doubles')===1,'fast-doubles top action');
 const post=posteriorWeights([0,Math.log(2),-Infinity]);
 ok(Math.abs(post.weights[0]-1/3)<1e-12&&Math.abs(post.weights[1]-2/3)<1e-12,'posterior normalization');
 ok(Math.abs(post.ess-1.8)<1e-12&&post.positiveCount===2,'posterior ESS');
 const reg=regretFromCandidateMetrics({a:{firstFinishChance:.4,meanRemainder:8,minusRisk:.2,expectedMinusLoss:2},
  b:{firstFinishChance:.3,meanRemainder:6,minusRisk:.1,expectedMinusLoss:1}});
 ok(Math.abs(reg.averageCandidateRegret.firstFinishChance-.05)<1e-12,'weighted regret first finish');
 ok(Math.abs(reg.averageCandidateRegret.meanRemainder-1)<1e-12,'weighted regret remainder');
 const perm=actions.map(a=>({...a,side:a.side==='up'?'down':a.side==='down'?'up':a.side}));
 ok(actions.every((a,i)=>policyProbability(actions,keys[i],'random-legal')===
  policyProbability(perm,regret.actionKey(perm[i]),'random-legal')),'label-permutation action probability');
 return{passed:true,assertions};
}
module.exports={runAudit,runPriorGrid,test,priorGridTest,policyProbability,posteriorWeights,seatLogLikelihood,worldLogWeight,regretFromCandidateMetrics,summarizeStrata,weightedPolicyMixture,stableStyleMixtureLogLikelihood,DEFAULT_PRIOR_GRID,prepareState,reconstructSnapshot};
if(require.main===module){const a=process.argv.slice(2);const out=a[0]==='test'?{base:test(),priorGrid:priorGridTest()}:a[0]==='prior-grid'?runPriorGrid({
 startSeed:Number(a[0]||3489601),deals:Number(a[1]||12000),targetPositions:Number(a[2]||800),
 maxWorlds:Number(a[3]||20000),targetPerStratum:Number(a[4]||50)}):runAudit({startSeed:Number(a[0]||3489601),deals:Number(a[1]||12000),targetPositions:Number(a[2]||800),maxWorlds:Number(a[3]||20000),targetPerStratum:Number(a[4]||35)});process.stdout.write(JSON.stringify(out,null,2)+'\n');}
