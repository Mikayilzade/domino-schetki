'use strict';
const e=require('./engine'),alloc=require('./hidden-world-enumeration'),cohort=require('./pass-history-current-only-cohort');
const audit=require('./model-agreement-common-world-regret-node'),rd=require('./round-driver'),regret=require('./decision-regret');
const SIDES=e.SIDES;
function ck(x,m){if(!x)throw Error('joint-support audit: '+m);}
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
  const hand=[...hands[pass.player],...later];ck(hand.length===pass.handSizeAtPass,'pass hand size');
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
function agg(rows){
 ck(rows.length>0,'empty candidate worlds');return{n:rows.length,firstFinishChance:rows.filter(x=>x.focalFirst).length/rows.length,
 meanRemainder:rows.reduce((a,x)=>a+x.remainder,0)/rows.length,minusRisk:rows.filter(x=>x.minusRisk).length/rows.length,
 expectedMinusLoss:rows.reduce((a,x)=>a+x.minusLoss,0)/rows.length,
 outcomes:rows.reduce((a,x)=>(a[x.outcomeKind]=(a[x.outcomeKind]||0)+1,a),{})};
}
function regretFor(cs,model){
 if(!cs.length)return null;const v=cs.map(x=>x[model]);
 const b={f:Math.max(...v.map(x=>x.firstFinishChance)),r:Math.min(...v.map(x=>x.meanRemainder)),
  k:Math.min(...v.map(x=>x.minusRisk)),l:Math.min(...v.map(x=>x.expectedMinusLoss))};
 const p=v.map(x=>({firstFinishChance:b.f-x.firstFinishChance,meanRemainder:x.meanRemainder-b.r,
  minusRisk:x.minusRisk-b.k,expectedMinusLoss:x.expectedMinusLoss-b.l}));
 const keys=Object.keys(p[0]),avg=Object.fromEntries(keys.map(k=>[k,p.reduce((a,x)=>a+x[k],0)/p.length]));
 const spread={firstFinishChance:Math.max(...v.map(x=>x.firstFinishChance))-Math.min(...v.map(x=>x.firstFinishChance)),
  meanRemainder:Math.max(...v.map(x=>x.meanRemainder))-Math.min(...v.map(x=>x.meanRemainder)),
  minusRisk:Math.max(...v.map(x=>x.minusRisk))-Math.min(...v.map(x=>x.minusRisk)),
  expectedMinusLoss:Math.max(...v.map(x=>x.expectedMinusLoss))-Math.min(...v.map(x=>x.expectedMinusLoss))};
 return{averageCandidateRegret:avg,spread,best:b,perCandidate:p};
}
function cluster(xs){if(!xs.length)return{n:0,mean:null,ci95:null};const m=xs.reduce((a,b)=>a+b,0)/xs.length;
 const sd=Math.sqrt(xs.reduce((a,x)=>a+(x-m)**2,0)/Math.max(1,xs.length-1));return{n:xs.length,mean:m,ci95:1.96*sd/Math.sqrt(xs.length)};}
function signature(snap,cur){const s=snap.state;return[snap.seed,s.turns,s.currentPlayer,SIDES.map(x=>s.branchState.branches[x].end).join(','),
 [...s.openingState.openedNumbers].sort((a,b)=>a-b).join(','),SIDES.map(x=>[...cur.openBySide[x]].sort().join('.')).join('/'),
 s.hands[s.currentPlayer].map(e.tileKey).sort().join(','),
 snap.passHistory.map(p=>p.player+'@'+p.turn+':'+p.forbiddenGlobal.join(',')+':'+p.forbiddenCurrent.join(',')).join(';')].join('#');}
function getSnapshot(seed,maxWorlds){
 const r=cohort.simulateSeed(seed);for(let i=r.eligible.length-1;i>=0;i--){const s={...r.eligible[i],seed};
  try{return{snapshot:s,summary:cohort.analyzeSnapshot(s,maxWorlds)};}catch(err){if(!/exact support exceeds cap/.test(err.message))throw err;}}
 return null;
}
function runAudit({startSeed=3454291,deals=810,targetPositions=100,maxWorlds=20000,continuationProfiles=['closed-branch-control']}={}){
 const profiles=[...new Set(continuationProfiles)],allowed=new Set(['closed-branch-control','min-hand-pips','fast-doubles','moderate-double-hold']);
 ck(profiles.length>0&&profiles.every(p=>allowed.has(p)),'invalid continuation profile list');const defaultProfile=profiles[0];
 const discovery=cohort.run({startSeed,deals,targetPositions,maxWorlds}),selected=discovery.positions.filter(x=>x.support.joint>0);
 const states=[],supportTotals={raw:0,global:0,currentOnly:0,joint:0,globalOnly:0,currentOnlyExclusive:0,neither:0};
 const zeroOutcomes=()=>({finish:0,block:0,unresolved:0}),zeroMetrics=()=>({n:0,firsts:0,rem:0,risk:0,loss:0});
 const outcomeRolloutsByProfile=Object.fromEntries(profiles.map(p=>[p,{global:zeroOutcomes(),currentOnly:zeroOutcomes()}]));
 const rolloutMetricsByProfile=Object.fromEntries(profiles.map(p=>[p,{global:zeroMetrics(),currentOnly:zeroMetrics()}]));
 let exactAllocationsChecked=0,jointStateWorldAssignments=0,candidateActionWorldPairs=0,rollouts=0,duplicateWithinStateAllocations=0;
 for(const sm of selected){
  const rec=getSnapshot(sm.seed,maxWorlds);ck(rec,'snapshot not reconstructed');const snap=rec.snapshot,s=snap.state;
  ck(JSON.stringify(rec.summary.support)===JSON.stringify(sm.support),'support changed');
  const f=s.currentPlayer,fh=s.hands[f].map(t=>[...t]),seats=[(f+1)%3,(f+2)%3],sizes=seats.map(p=>s.hands[p].length);
  const known=new Set([...snap.playedTiles,...fh].map(e.tileKey));ck(known.size===snap.playedTiles.length+fh.length,'known tile overlap');
  const pool=e.createDoubleSixDeck().filter(t=>!known.has(e.tileKey(t)));ck(pool.length===sizes[0]+sizes[1]+s.stock.length,'pool size');
  const cur=currentState(snap);
  const cohortKeys=cohort.currentOnlyActions(s.branchState,s.openingState,snap.openedAtDouble,s.hands[f]).map(regret.actionKey).sort();
  const currentKeys=audit.currentActionKeys(cur).sort();ck(JSON.stringify(cohortKeys)===JSON.stringify(currentKeys),'current root mismatch');
  const globalKeys=audit.globalActionKeys(s),common=globalKeys.filter(k=>currentKeys.includes(k)),sig=signature(snap,cur),spec={seed:sm.seed,signature:sig,state:rd.cloneRoundState(s),current:cur};
  const counts={raw:0,global:0,currentOnly:0,joint:0,globalOnly:0,currentOnlyExclusive:0,neither:0},worlds=[],fps=new Set();
  const allocationSpec={pool,hiddenHandSizes:sizes,stockSize:s.stock.length};ck(Number(alloc.countAllocations(allocationSpec))<=maxWorlds,'support cap');
  for(const a of alloc.iterateAllocations(allocationSpec)){
   exactAllocationsChecked++;const v=passValid(a,snap,f,fh,seats);counts.raw++;counts.global+=+v.g;counts.currentOnly+=+v.c;counts.joint+=+v.j;
   counts.globalOnly+=+v.go;counts.currentOnlyExclusive+=+v.ce;counts.neither+=+v.neither;
   const fp=alloc.allocationFingerprint(a);if(fps.has(fp))duplicateWithinStateAllocations++;fps.add(fp);
   if(v.j){const st=stateFor(snap,a,f,seats),seed=e.mixSeed32(hash32(sig+'#'+fp)^0x6d2b79f5);worlds.push({state:st,key:fp,seed});}
  }
  ck(JSON.stringify(counts)===JSON.stringify(rec.summary.support),'exact support mismatch');
  ck(worlds.length===sm.support.joint&&new Set(worlds.map(w=>w.key)).size===worlds.length,'joint world uniqueness');
  for(const k of Object.keys(supportTotals))supportTotals[k]+=counts[k];jointStateWorldAssignments+=worlds.length;
  const cs=common.map(key=>({key,byProfile:Object.fromEntries(profiles.map(p=>[p,{g:[],c:[]}]))}));
  for(const w of worlds){
   const wg=audit.globalActionKeys(w.state),wc=audit.currentActionKeys(audit.cloneCurrentForWorld(spec,w));
   ck(common.every(k=>wg.includes(k)&&wc.includes(k)),'root action changed across world');
   for(const x of cs)for(const profile of profiles){
    const g=audit.simulateGlobal(spec,w,x.key,profile),c=audit.simulateCurrent(spec,w,x.key,profile);
    x.byProfile[profile].g.push(g);x.byProfile[profile].c.push(c);candidateActionWorldPairs++;rollouts+=2;
    for(const [modelName,y]of[['global',g],['currentOnly',c]]){
     outcomeRolloutsByProfile[profile][modelName][y.outcomeKind]++;const m=rolloutMetricsByProfile[profile][modelName];
     m.n++;m.firsts+=+y.focalFirst;m.rem+=y.remainder;m.risk+=+y.minusRisk;m.loss+=y.minusLoss;
    }
   }
  }
  const candidates=cs.map(x=>{const byProfile=Object.fromEntries(profiles.map(p=>[p,{global:agg(x.byProfile[p].g),currentOnly:agg(x.byProfile[p].c)}]));
   return{key:x.key,byProfile,global:byProfile[defaultProfile].global,currentOnly:byProfile[defaultProfile].currentOnly};});
  const regretByProfile={},modelDeltaByProfile={};
  for(const profile of profiles){
   const pc=cs.map(x=>({key:x.key,global:agg(x.byProfile[profile].g),currentOnly:agg(x.byProfile[profile].c)}));
   modelDeltaByProfile[profile]=pc.length?Object.fromEntries(['firstFinishChance','meanRemainder','minusRisk','expectedMinusLoss'].map(k=>[
    k,pc.reduce((a,x)=>a+x.global[k]-x.currentOnly[k],0)/pc.length])):null;
   regretByProfile[profile]={global:regretFor(pc,'global'),currentOnly:regretFor(pc,'currentOnly')};
  }
  states.push({seed:sm.seed,turn:s.turns,focalPlayer:f,passCount:snap.passHistory.length,handSizes:s.hands.map(h=>h.length),
   rawWorlds:counts.raw,globalWorlds:counts.global,currentOnlyWorlds:counts.currentOnly,jointWorlds:worlds.length,jointWorldKeys:worlds.map(w=>w.key),
   rootActions:{global:globalKeys.length,currentOnly:currentKeys.length,common:common.length,commonKeys:common},candidates,regretByProfile,modelDeltaByProfile,
   regret:regretByProfile[defaultProfile],modelDeltaGlobalMinusCurrent:modelDeltaByProfile[defaultProfile]});
 }
 const eligible=states.filter(s=>s.rootActions.common>=2),metrics=['firstFinishChance','meanRemainder','minusRisk','expectedMinusLoss'];
 const regretClusterByStateByProfile={},modelDeltaClusterByStateByProfile={};
 for(const profile of profiles){const rc={global:{},currentOnly:{}},dc={};
  for(const modelName of ['global','currentOnly'])for(const metric of metrics)rc[modelName][metric]=cluster(eligible.map(s=>s.regretByProfile[profile][modelName].averageCandidateRegret[metric]));
  for(const metric of metrics)dc[metric]=cluster(eligible.map(s=>s.modelDeltaByProfile[profile][metric]));
  regretClusterByStateByProfile[profile]=rc;modelDeltaClusterByStateByProfile[profile]=dc;}
 const aggregateRolloutMetricsByProfile={};
 for(const profile of profiles){const mm={};for(const modelName of ['global','currentOnly']){const m=rolloutMetricsByProfile[profile][modelName];
  mm[modelName]={n:m.n,focalFirstFinishChance:m.n?m.firsts/m.n:null,meanFocalRemainder:m.n?m.rem/m.n:null,minusRisk:m.n?m.risk/m.n:null,expectedMinusLoss:m.n?m.loss/m.n:null};}
  aggregateRolloutMetricsByProfile[profile]=mm;}
 return{schema:'qosha-pass-history-joint-support-choice-audit/v2',timestampBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku',hour12:false}).replace(' ','T')+'+04:00',
  engine:'qosha-research-0.5.3 + current-only-pass-support-1.0 + model-agreement-common-world-regret-node; recovered qosa-1.0.0; 3x9',
  rules:'global-ever-open and current-only branch models both provisional; exact paired comparisons only on joint pass-consistent support',
  seedWindow:{start:startSeed,end:startSeed+deals-1,scannedThrough:discovery.lastScannedSeed},
  discovery:{dealsRequested:deals,dealsGenerated:discovery.dealsGenerated,uniqueDealAllocations:discovery.uniqueDealAllocations,duplicateDealAllocations:discovery.duplicateDeals,
   outcomes:discovery.outcomes,eligibleLateStates:discovery.eligibleLateStates,passObservations:discovery.passObservations,selectedPositions:discovery.selectedPositions,
   jointPositivePositions:discovery.jointPositivePositions,selection:'latest eligible state per seed; focal >=2 current-only actions; both opponents <=3 tiles; hidden-seat prior no-stock pass; exact support <= cap',
   generationPolicies:'seed-even=min-hand-pips; seed-odd=fast-doubles; seeded uniform top-ranked choice'},
  conditioning:{method:'exact labeled allocation enumeration; reconstruct pass-time hand from current hand plus same-seat later public plays; filter both pass masks; paired set is intersection',
   priorActionInference:'none; no opponent-choice likelihood',currentOnlyTraceCompatible:true,exactSupportLimit:maxWorlds,
   continuationSeed:'mixSeed32(fnv1a(state-signature + # + allocation-fingerprint) XOR 0x6d2b79f5), shared across arms',
   continuationProfiles:profiles,actionOrbitTieBreak:'seeded symmetric orbit/member selection; same world seed and salt 11 across candidate arms'},
  supportTotals,states:states.length,statesWithCommonActions:states.filter(s=>s.rootActions.common>0).length,statesWith2plusCommonActions:eligible.length,
  jointStateWorldAssignments,exactAllocationsChecked,duplicateWithinStateAllocations,candidateWorldPairs:jointStateWorldAssignments,
  candidateActionWorldPairsPerProfile:candidateActionWorldPairs/profiles.length,rolloutsPerProfile:rollouts/profiles.length,candidateActionWorldPairs,rollouts,
  outcomeRolloutsByProfile,aggregateRolloutMetricsByProfile,regretClusterByStateByProfile,modelDeltaClusterByStateByProfile,
  defaultProfile,outcomeRollouts:outcomeRolloutsByProfile[defaultProfile],aggregateRolloutMetrics:aggregateRolloutMetricsByProfile[defaultProfile],
  regretClusterByState:regretClusterByStateByProfile[defaultProfile],modelDeltaClusterByState:modelDeltaClusterByStateByProfile[defaultProfile],statesData:states};
}
function assertRegression(r){
 ck(r.discovery.dealsGenerated===810&&r.discovery.uniqueDealAllocations===810&&r.discovery.duplicateDealAllocations===0,'deal census');
 ck(r.discovery.jointPositivePositions===17,'joint-positive states');
 ck(r.supportTotals.raw===212&&r.supportTotals.global===52&&r.supportTotals.currentOnly===151&&r.supportTotals.joint===52&&
  r.supportTotals.currentOnlyExclusive===99&&r.supportTotals.neither===61,'support totals');
 ck(r.jointStateWorldAssignments===52&&r.exactAllocationsChecked===212&&r.duplicateWithinStateAllocations===0,'allocation accounting');
 ck(r.statesWith2plusCommonActions===17&&r.candidateActionWorldPairs===133&&r.rollouts===266,'paired rollouts');
 ck(r.outcomeRollouts.global.unresolved===0&&r.outcomeRollouts.currentOnly.unresolved===0,'unresolved rollouts');
 return{passed:true,assertions:8,deals:r.discovery.dealsGenerated,selectedJointStates:r.states,
  exactJointStateWorldAssignments:r.jointStateWorldAssignments,candidateActionWorldPairs:r.candidateActionWorldPairs,modelRollouts:r.rollouts};
}
function test(){return assertRegression(runAudit());}
module.exports={runAudit,test,assertRegression};
if(require.main===module){const a=process.argv.slice(2),r=a[0]==='test'?test():runAudit({
 startSeed:Number(a[0]||3454291),deals:Number(a[1]||810),targetPositions:Number(a[2]||100),maxWorlds:Number(a[3]||20000)});
process.stdout.write(JSON.stringify(r,null,2)+'\n');}
