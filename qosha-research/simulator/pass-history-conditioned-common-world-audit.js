'use strict';
// Public-pass-history-conditioned hidden-world audit.
// Conditioning uses only observed passes in the common-history prefix; prior
// policy-selected plays are not used to infer hidden holdings.

const audit = require('./model-agreement-common-world-regret-node');
const e = require('./engine');
const d = require('./turn-dispatcher');
const r = require('./round-driver');
const hidden = require('./hidden-world');
const current = require('./branch-current-full-round');
const SIDES = e.SIDES;
const WORLD_LIMIT = 24;
const EXACT_LIMIT = 5000;
const SEED_MULTIPLIER = 0x85ebca6b;
const METRICS = ['firstFinishChance','meanRemainder','minusRisk','expectedMinusLoss'];

function check(x,m){if(!x)throw new Error('pass-history-conditioned audit: '+m);}
function hashString(value){let h=2166136261;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function worldKeyState(state){return state.hands.map(h=>h.map(e.tileKey).sort().join(',')).join('|')+'#'+state.stock.map(e.tileKey).sort().join(',');}
function passValidation(worldState,spec){
  let globalFailures=0,currentFailures=0,handSizeFailures=0,duplicateHandFailures=0,checks=0;
  for(const ev of spec.passHistory||[]){
    if(!ev.stockEmpty){handSizeFailures++;continue;}
    const hand=worldState.hands[ev.player].map(t=>[...t]);
    for(let i=ev.playedLogLength;i<spec.playedEvents.length;i++)
      if(spec.playedEvents[i].player===ev.player)hand.push([...spec.playedEvents[i].tile]);
    checks++;
    const keys=hand.map(e.tileKey);
    if(new Set(keys).size!==keys.length)duplicateHandFailures++;
    if(hand.length!==ev.handSizeAtPass)handSizeFailures++;
    if(d.actionsForHand(ev.global.branchState,ev.global.openingState,hand).length)globalFailures++;
    const cs={branchState:ev.current.branchState,
      openBySide:Object.fromEntries(SIDES.map(side=>[side,new Set(ev.current.openBySide[side])])),
      usedNumbers:new Set(ev.current.usedNumbers)};
    if(current.actions(cs,hand).length)currentFailures++;
  }
  const complete=checks===(spec.passHistory||[]).length&&handSizeFailures===0&&duplicateHandFailures===0;
  const globalValid=complete&&globalFailures===0;
  const currentValid=complete&&currentFailures===0;
  return {valid:globalValid&&currentValid,globalValid,currentValid,checks,globalFailures,currentFailures,
    handSizeFailures,duplicateHandFailures,globalOnly:globalValid&&!currentValid,
    currentOnly:currentValid&&!globalValid,neither:!globalValid&&!currentValid};
}
function chooseCombinations(items,k){
  const out=[];function rec(start,prefix){if(prefix.length===k){out.push(prefix);return;}
    for(let i=start;i<=items.length-(k-prefix.length);i++)rec(i+1,prefix.concat([items[i]]));}
  rec(0,[]);return out;
}
function conditionalWorldCount(n,groups){
  let remaining=n,total=1;
  for(let i=0;i<groups.length-1;i++){const k=groups[i];let choose=1;
    for(let j=1;j<=Math.min(k,remaining-k);j++)choose=choose*(remaining-j+1)/j;
    total*=Math.round(choose);remaining-=k;}
  return Math.round(total);
}
function enumerateAssignments(pool,groupSizes){
  const out=[];function rec(remaining,index,groups){
    if(index===groupSizes.length-1){out.push(groups.concat([remaining]));return;}
    for(const subset of chooseCombinations(remaining,groupSizes[index])){
      const selected=new Set(subset.map(e.tileKey));
      rec(remaining.filter(tile=>!selected.has(e.tileKey(tile))),index+1,groups.concat([subset]));
    }}
  if(groupSizes.length===1)return[[pool]];rec(pool,0,[]);return out;
}
function canonicalizeState(state){
  state.hands=state.hands.map(hand=>hand.map(t=>[...t]).sort((a,b)=>e.tileKey(a).localeCompare(e.tileKey(b))));
  state.stock=state.stock.map(t=>[...t]);
  return state;
}
function buildWorld(spec,assignment,focal){
  const hands=[[],[],[]];let group=0;
  for(let p=0;p<3;p++)hands[p]=p===focal?spec.state.hands[p].map(t=>[...t]):assignment[group++].map(t=>[...t]);
  const stock=spec.state.stock.length?assignment[group].map(t=>[...t]):[];
  const state=canonicalizeState(r.cloneRoundState(spec.state));state.hands=hands;state.stock=stock;canonicalizeState(state);
  return state;
}
function continuationSeed(spec,key){return e.mixSeed32(hashString(spec.signature+'#'+key)^0x6d2b79f5);}
function rankWorlds(worlds,count){return worlds.slice().sort((a,b)=>hashString(a.key)-hashString(b.key)||a.key.localeCompare(b.key)).slice(0,count);}
function sampleComparisonWorlds(spec,count=WORLD_LIMIT,maxAttempts=count*250){
  const focal=spec.state.currentPlayer;
  const pool=hidden.hiddenPool({focalHand:spec.state.hands[focal],knownTiles:spec.played});
  const groupSizes=spec.state.hands.filter((_,p)=>p!==focal).map(h=>h.length);
  if(spec.state.stock.length)groupSizes.push(spec.state.stock.length);
  check(pool.length===groupSizes.reduce((a,b)=>a+b,0),'hidden pool/group sizes');
  const space=conditionalWorldCount(pool.length,groupSizes);
  let globalPassFailures=0,currentPassFailures=0,handSizeFailures=0,duplicateHandFailures=0,passChecks=0;
  let globalValidWorldsSeen=0,currentValidWorldsSeen=0,validWorldsSeen=0,rejectedPass=0;
  let globalOnlyPassWorlds=0,currentOnlyPassWorlds=0,neitherPassWorlds=0;
  if(space<=EXACT_LIMIT){
    const assignments=enumerateAssignments(pool,groupSizes);check(assignments.length===space,'exact assignment count');
    const all=[],globalValid=[],currentValid=[],jointValid=[];
    for(const assignment of assignments){
      const state=buildWorld(spec,assignment,focal),key=worldKeyState(state),world={state,key,seed:continuationSeed(spec,key)};
      all.push(world);
      const v=passValidation(state,spec);
      passChecks+=v.checks;globalPassFailures+=v.globalFailures;currentPassFailures+=v.currentFailures;
      handSizeFailures+=v.handSizeFailures;duplicateHandFailures+=v.duplicateHandFailures;
      if(v.globalValid){globalValid.push(world);globalValidWorldsSeen++;}
      if(v.currentValid){currentValid.push(world);currentValidWorldsSeen++;}
      if(v.valid){jointValid.push(world);validWorldsSeen++;}
      else rejectedPass++;
      if(v.globalOnly)globalOnlyPassWorlds++;
      if(v.currentOnly)currentOnlyPassWorlds++;
      if(v.neither)neitherPassWorlds++;
    }
    const n=Math.min(count,jointValid.length,all.length);
    return {control:rankWorlds(all,n),conditioned:rankWorlds(jointValid,n),
      modelSpecificSupport:{globalValidWorlds:globalValid.length,currentValidWorlds:currentValid.length,
        jointValidWorlds:jointValid.length,globalOnlyPassWorlds,currentOnlyPassWorlds,neitherPassWorlds},
      stats:{method:'exact-enumeration-filtered',conditionalWorldSpace:space,attempts:space,uniqueDraws:space,
        duplicateDraws:0,validWorldsExact:jointValid.length,validWorldsSeen,globalValidWorldsSeen,currentValidWorldsSeen,
        rejectedPass,globalPassFailures,currentPassFailures,handSizeFailures,duplicateHandFailures,passChecks,
        acceptanceRate:space?jointValid.length/space:0,requestedWorlds:count,worldsPerArm:n,
        complete:n===count,allConditionalWorldsEnumerated:true,exactEnumerationStates:1}};
  }
  const seen=new Set(),control=[],conditioned=[];
  let attempts=0,duplicateDraws=0,uniqueDraws=0;
  const baseSeed=e.mixSeed32(hashString(spec.signature)^Math.imul(spec.seed+1,0x9e3779b9));
  while((control.length<count||conditioned.length<count)&&attempts<maxAttempts){
    const sampleSeed=e.mixSeed32(baseSeed^Math.imul(attempts+1,SEED_MULTIPLIER));
    const sampled=canonicalizeState(hidden.sampleWorld({visibleState:spec.state,focalPlayer:focal,
      focalHand:spec.state.hands[focal],knownTiles:spec.played,hiddenHandSizes:spec.state.hands.map(h=>h.length),
      stockSize:spec.state.stock.length},sampleSeed));
    attempts++;const key=worldKeyState(sampled);
    if(seen.has(key)){duplicateDraws++;continue;}seen.add(key);uniqueDraws++;
    const world={state:sampled,key,seed:continuationSeed(spec,key)};
    if(control.length<count)control.push(world);
    const v=passValidation(sampled,spec);
    passChecks+=v.checks;globalPassFailures+=v.globalFailures;currentPassFailures+=v.currentFailures;
    handSizeFailures+=v.handSizeFailures;duplicateHandFailures+=v.duplicateHandFailures;
    if(v.globalValid)globalValidWorldsSeen++;
    if(v.currentValid)currentValidWorldsSeen++;
    if(v.valid){validWorldsSeen++;if(conditioned.length<count)conditioned.push(world);}else rejectedPass++;
    if(v.globalOnly)globalOnlyPassWorlds++;
    if(v.currentOnly)currentOnlyPassWorlds++;
    if(v.neither)neitherPassWorlds++;
  }
  const n=Math.min(control.length,conditioned.length);
  return {control:rankWorlds(control,n),conditioned:rankWorlds(conditioned,n),
    modelSpecificSupport:{globalValidWorlds:globalValidWorldsSeen,currentValidWorlds:currentValidWorldsSeen,
      jointValidWorlds:validWorldsSeen,globalOnlyPassWorlds,currentOnlyPassWorlds,neitherPassWorlds},
    stats:{method:'seeded-rejection-with-pass-filter',conditionalWorldSpace:space,attempts,uniqueDraws,
      duplicateDraws,validWorldsExact:null,validWorldsSeen,globalValidWorldsSeen,currentValidWorldsSeen,
      rejectedPass,globalPassFailures,currentPassFailures,handSizeFailures,duplicateHandFailures,passChecks,
      acceptanceRate:uniqueDraws?validWorldsSeen/uniqueDraws:0,requestedWorlds:count,worldsPerArm:n,
      complete:n===count,allConditionalWorldsEnumerated:false,exactEnumerationStates:0}};
}
function evaluateWorldSet(spec,worlds){
  const candidates=spec.commonActionKeys.map(key=>({key,global:[],current:[]}));
  let evaluations=0;const outcomeKinds={finish:0,block:0,unresolved:0};
  for(const world of worlds){
    const gKeys=audit.globalActionKeys(world.state),cState=audit.cloneCurrentForWorld(spec,world),cKeys=audit.currentActionKeys(cState);
    for(const candidate of candidates){
      check(gKeys.includes(candidate.key),'candidate absent from global root');
      check(cKeys.includes(candidate.key),'candidate absent from current-only root');
      const g=audit.simulateGlobal(spec,world,candidate.key),c=audit.simulateCurrent(spec,world,candidate.key);
      candidate.global.push(g);candidate.current.push(c);evaluations+=2;
      if(outcomeKinds[g.outcomeKind]!==undefined)outcomeKinds[g.outcomeKind]++;
      if(outcomeKinds[c.outcomeKind]!==undefined)outcomeKinds[c.outcomeKind]++;
    }
  }
  const summary=name=>{
    const values=candidates.map(c=>{const rows=c[name],n=rows.length;return{
      first:rows.filter(x=>x.focalFirst).length/n,remainder:rows.reduce((s,x)=>s+x.remainder,0)/n,
      risk:rows.filter(x=>x.minusRisk).length/n,loss:rows.reduce((s,x)=>s+x.minusLoss,0)/n};});
    const best={first:Math.max(...values.map(x=>x.first)),remainder:Math.min(...values.map(x=>x.remainder)),
      risk:Math.min(...values.map(x=>x.risk)),loss:Math.min(...values.map(x=>x.loss))};
    return {candidateCount:values.length,regret:audit.summarizeRegret(values.map(x=>({regret:{
      firstFinishChance:best.first-x.first,meanRemainder:x.remainder-best.remainder,
      minusRisk:x.risk-best.risk,expectedMinusLoss:x.loss-best.loss}})))};
  };
  return {worlds:worlds.length,evaluations,outcomeKinds,global:summary('global'),currentOnly:summary('current')};
}
function summarizeGroup(rows,arm,model){
  return audit.summarizeRegret(rows.flatMap(s=>Object.entries(s[arm][model].regret)
    .map(([metric,value])=>({regret:{[metric]:value.mean}}))));
}
function summarizeDelta(rows,model){
  return audit.summarizeRegret(rows.map(s=>({regret:Object.fromEntries(METRICS.map(metric=>
    [metric,s.conditioned[model].regret[metric].mean-s.control[model].regret[metric].mean]))})));
}
function run(startSeed=3410970,deals=500,targetStates=72,worldsPerState=WORLD_LIMIT){
  check(Number.isInteger(startSeed)&&Number.isInteger(deals)&&deals>0,'seed/count');
  const cohort=audit.collectAgreementStates(startSeed,deals);
  const eligible=cohort.disagreementCandidates.filter(x=>x.commonActionCount>=2);
  const selected=audit.selectStates(eligible,targetStates),states=[];
  for(const spec of selected){
    const samples=sampleComparisonWorlds(spec,worldsPerState);
    const control=evaluateWorldSet(spec,samples.control),conditioned=evaluateWorldSet(spec,samples.conditioned);
    states.push({seed:spec.seed,turn:spec.turn,passCount:(spec.passHistory||[]).length,
      commonActionCount:spec.commonActionCount,signature:spec.signature,sampling:samples.stats,
      modelSpecificSupport:samples.modelSpecificSupport,control,conditioned});
  }
  const withPass=states.filter(s=>s.passCount>0);
  const passRejected=states.filter(s=>s.passCount>0&&s.sampling.rejectedPass>0);
  const modelDiscriminating=states.filter(s=>s.modelSpecificSupport.globalOnlyPassWorlds+s.modelSpecificSupport.currentOnlyPassWorlds>0);
  const sums={states:states.length,selectedDeals:new Set(states.map(s=>s.seed)).size,
    controlWorlds:states.reduce((n,s)=>n+s.control.worlds,0),conditionedWorlds:states.reduce((n,s)=>n+s.conditioned.worlds,0),
    candidateWorldEvaluations:states.reduce((n,s)=>n+s.control.evaluations+s.conditioned.evaluations,0),
    attempts:states.reduce((n,s)=>n+s.sampling.attempts,0),uniqueDraws:states.reduce((n,s)=>n+s.sampling.uniqueDraws,0),
    duplicateDraws:states.reduce((n,s)=>n+s.sampling.duplicateDraws,0),rejectedPass:states.reduce((n,s)=>n+s.sampling.rejectedPass,0),
    validWorldsSeen:states.reduce((n,s)=>n+s.sampling.validWorldsSeen,0),
    globalValidWorldsSeen:states.reduce((n,s)=>n+s.sampling.globalValidWorldsSeen,0),
    currentValidWorldsSeen:states.reduce((n,s)=>n+s.sampling.currentValidWorldsSeen,0),
    globalOnlyPassWorlds:states.reduce((n,s)=>n+s.modelSpecificSupport.globalOnlyPassWorlds,0),
    currentOnlyPassWorlds:states.reduce((n,s)=>n+s.modelSpecificSupport.currentOnlyPassWorlds,0),
    neitherPassWorlds:states.reduce((n,s)=>n+s.modelSpecificSupport.neitherPassWorlds,0),
    globalPassFailures:states.reduce((n,s)=>n+s.sampling.globalPassFailures,0),
    currentPassFailures:states.reduce((n,s)=>n+s.sampling.currentPassFailures,0),
    handSizeFailures:states.reduce((n,s)=>n+s.sampling.handSizeFailures,0),
    duplicateHandFailures:states.reduce((n,s)=>n+s.sampling.duplicateHandFailures,0),
    passChecks:states.reduce((n,s)=>n+s.sampling.passChecks,0),
    exactEnumerationStates:states.filter(s=>s.sampling.method==='exact-enumeration-filtered').length,
    belowRequestedWorlds:states.filter(s=>s.sampling.worldsPerArm<worldsPerState).length,
    samplingIncompleteStates:states.filter(s=>!s.sampling.complete&&!s.sampling.allConditionalWorldsEnumerated).length,
    unresolved:states.reduce((n,s)=>n+s.control.outcomeKinds.unresolved+s.conditioned.outcomeKinds.unresolved,0)};
  const passHistogram={};for(const s of states){const k=String(s.passCount);passHistogram[k]=(passHistogram[k]||0)+1;}
  return {schema:'qosha-pass-history-conditioned-common-world-regret/v1',
    timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',
    engine:'qosha-research-0.5.3 modules; recovered qosa-1.0.0; 3x9+stock; action-orbit continuation',
    startSeed,endSeed:startSeed+deals-1,seedDraws:deals,trajectory:cohort.metrics,
    selection:{targetStates,selectedStates:states.length,selectedDeals:sums.selectedDeals,
      eligibleFirstDivergenceStates:eligible.length,passCountHistogram:passHistogram},
    conditioning:{method:'joint pass-consistency filter over common-prefix pass events; reconstruct each pass-time hand from sampled current hand plus that player’s later public plays; require no legal action under both provisional branch models; stock must be empty',
      observedPassEventsInSelectedStates:states.reduce((n,s)=>n+s.passCount,0),
      priorActionInference:'none; only known/played tiles, hand sizes, and observed passes condition hidden worlds',
      sameDealsAndVisibleStatesAsUnconditionedAudit:true,
      modelSpecificSupport:'global-only/current-only valid allocations are counted separately; paired regret uses the joint intersection valid under both models'},
    sampling:{requestedWorldsPerState:worldsPerState,exactEnumerationLimit:EXACT_LIMIT,...sums,
      method:'exact enumerate and deterministic hash-rank when allocation space <= 5000; otherwise seeded uniform rejection without replacement; continuation seed is a hash of the allocation and is shared across arms'},
    regret:{all:{control:{global:summarizeGroup(states,'control','global'),currentOnly:summarizeGroup(states,'control','currentOnly')},
        conditioned:{global:summarizeGroup(states,'conditioned','global'),currentOnly:summarizeGroup(states,'conditioned','currentOnly')},
        deltaConditionedMinusControl:{global:summarizeDelta(states,'global'),currentOnly:summarizeDelta(states,'currentOnly')}},
      withPassHistory:{stateCount:withPass.length,control:{global:summarizeGroup(withPass,'control','global'),currentOnly:summarizeGroup(withPass,'control','currentOnly')},
        conditioned:{global:summarizeGroup(withPass,'conditioned','global'),currentOnly:summarizeGroup(withPass,'conditioned','currentOnly')},
        deltaConditionedMinusControl:{global:summarizeDelta(withPass,'global'),currentOnly:summarizeDelta(withPass,'currentOnly')}},
      passRejecting:{stateCount:passRejected.length,deltaConditionedMinusControl:{global:summarizeDelta(passRejected,'global'),currentOnly:summarizeDelta(passRejected,'currentOnly')}},
      modelDiscriminating:{stateCount:modelDiscriminating.length,globalOnlyPassWorlds:sums.globalOnlyPassWorlds,
        currentOnlyPassWorlds:sums.currentOnlyPassWorlds,deltaConditionedMinusControl:{global:summarizeDelta(modelDiscriminating,'global'),currentOnly:summarizeDelta(modelDiscriminating,'currentOnly')}}},
    states};
}
function test(){
  const branch=e.createBranchState([1,1]),opening=e.createOpeningState([1]);
  const event={player:1,turn:2,handSizeAtPass:1,playedLogLength:0,stockEmpty:true,
    global:{branchState:branch,openingState:opening},
    current:{branchState:branch,openBySide:Object.fromEntries(SIDES.map(side=>[side,[1]])),usedNumbers:[1]}};
  const spec={passHistory:[event],playedEvents:[]};
  const legalWorld={hands:[[[0,0]],[[1,5]],[[4,6]]],stock:[]};
  const blockedWorld={hands:[[[0,0]],[[2,3]],[[4,6]]],stock:[]};
  check(!passValidation(legalWorld,spec).valid,'pass with legal 1-5 rejected');
  check(passValidation(blockedWorld,spec).valid,'no-match pass accepted');
  const branch2=e.createBranchState([1,1]);
  branch2.branches.up.end=2;branch2.branches.left.end=3;branch2.branches.right.end=1;branch2.branches.down.end=4;
  const event2={...event,global:{branchState:branch2,openingState:opening},
    current:{branchState:branch2,openBySide:{up:[1],left:[],right:[],down:[]},usedNumbers:[1]}};
  const split=passValidation({hands:[[[0,0]],[[1,5]],[[4,6]]],stock:[]},{passHistory:[event2],playedEvents:[]});
  check(split.currentOnly&&split.currentValid&&!split.globalValid,'model-specific pass support split');
  const start=3410970,deals=60,target=12;
  const old=audit.runDisagreementAudit(start,deals,target,4);
  const cohort=audit.collectAgreementStates(start,deals);
  const selected=audit.selectStates(cohort.disagreementCandidates.filter(x=>x.commonActionCount>=2),target);
  check(JSON.stringify(old.states.map(x=>[x.seed,x.turn,x.actionCount,x.cell]))===
    JSON.stringify(selected.map(x=>[x.seed,x.turn,x.commonActionCount,x.cell])),'selected state set must match unconditioned audit');
  const withPass=selected.find(x=>x.passHistory&&x.passHistory.length>0);
  check(withPass,'pass history captured');
  const a=sampleComparisonWorlds(withPass,4,1000),b=sampleComparisonWorlds(withPass,4,1000);
  check(JSON.stringify(a.conditioned.map(w=>w.key))===JSON.stringify(b.conditioned.map(w=>w.key)),'conditioned sample replay');
  check(a.conditioned.every(w=>passValidation(w.state,withPass).valid),'all joint worlds pass-valid');
  const noPass=selected.find(x=>!x.passHistory||!x.passHistory.length);
  if(noPass){const n=sampleComparisonWorlds(noPass,4,1000);
    check(JSON.stringify(n.control.map(w=>w.key))===JSON.stringify(n.conditioned.map(w=>w.key)),'no-pass control unchanged');}
  return {passed:true,passFixtureRejectsLegalHand:true,passFixtureAcceptsBlockedHand:true,
    modelSpecificPassSplit:true,matchedSelectedStates:target,passConditionedWorlds:a.conditioned.length,
    method:a.stats.method,passChecks:a.stats.passChecks};
}
module.exports={run,test,passValidation,sampleComparisonWorlds,evaluateWorldSet};
