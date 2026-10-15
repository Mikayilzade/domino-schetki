'use strict';
// Balanced, disjoint retained-pass role holdout (3x9, qosa-research-0.5.3).
// Reproduce: node qosha-research/simulator/pass-role-balanced-runner.js test
//           node qosha-research/simulator/pass-role-balanced-runner.js 400000 500000 25
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const {chooseBy}=require('./strategy-runner'),{actionKey}=require('./decision-regret');
const {discover,compatible}=require('./pass-history-persistent-runner');
const {worlds}=require('./connector-exact-response-runner');
const {force,POLICIES}=require('./connector-equal-pip-runner');
function mean(xs){return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;}
function stat(xs){if(!xs.length)return null;const m=mean(xs),sd=xs.length>1?Math.sqrt(xs.reduce((a,b)=>a+(b-m)**2,0)/(xs.length-1)):0;return{n:xs.length,mean:m,exploratoryCI95:[m-1.96*sd/Math.sqrt(xs.length),m+1.96*sd/Math.sqrt(xs.length)]};}
function role(pos){
 const n=(pos.focal+1)%3,t=(pos.focal+2)%3;
 const next=pos.evidence.some(x=>x.player===n&&x.playedAfter.length>0);
 const third=pos.evidence.some(x=>x.player===t&&x.playedAfter.length>0);
 return next&&!third?'next-only':third&&!next?'third-only':next&&third?'both':'neither';
}
function select(start,end,perRole){
 const f=discover(start,end,999999),groups={'next-only':[],'third-only':[]};
 const exposure={'next-only':0,'third-only':0,both:0,neither:0};
 for(const pos of f.positions){const k=role(pos);exposure[k]++;if(groups[k]&&groups[k].length<perRole)groups[k].push(pos);}
 return{scanned:f.scanned,eligible:f.positions.length,exposure,groups};
}
function nextPass(world,key){
 const next=r.stepRound(world,opts=>{
  const action=opts.actions.find(a=>actionKey(a)===key);
  if(!action)throw Error('missing focal action');return action;
 });
 if(next.outcome)return null;
 const o=d.turnOptions(next.branchState,next.openingState,next.hands[next.currentPlayer],next.stock);
 return +(o.phase==='pass');
}
function evaluate(pos){
 const ww=worlds(pos),legacy=pos.evidence.filter(x=>x.playedAfter.length===0);
 const retained=pos.evidence.filter(x=>x.playedAfter.length>0);
 if(!retained.length||!compatible(pos.visibleState,pos.evidence))throw Error('invalid true-world pass history');
 const n=(pos.focal+1)%3,t=(pos.focal+2)%3;
 const roleNext=retained.filter(x=>x.player===n),roleThird=retained.filter(x=>x.player===t);
 const base=[],conditioned=[],nextOnly=[],thirdOnly=[];
 for(let i=0;i<ww.length;i++){
  const w=ww[i];
  if(compatible(w,legacy))base.push(i);
  if(compatible(w,pos.evidence))conditioned.push(i);
  if(compatible(w,[...legacy,...roleNext]))nextOnly.push(i);
  if(compatible(w,[...legacy,...roleThird]))thirdOnly.push(i);
 }
 if(!conditioned.length||conditioned.length>base.length)throw Error('invalid posterior');
 const n0=base.length,nn=nextOnly.length,nt=thirdOnly.length,nb=conditioned.length;
 const attribution={next:((n0-nn)+(nt-nb))/2,third:((n0-nt)+(nn-nb))/2};
 if(attribution.next+attribution.third!==n0-nb)throw Error('Shapley decomposition failed');
 const state=pos.visibleState,opts=d.turnOptions(state.branchState,state.openingState,state.hands[pos.focal],state.stock);
 const chosen=chooseBy('closed-branch-control',opts,{seed:pos.seed,turns:state.turns,player:state.currentPlayer});
 const key=actionKey(chosen),truth=nextPass(state,key);
 const prediction={actualNextPass:truth};
 if(truth!==null){
  const predictions=ww.map(w=>nextPass(w,key));
  for(const [label,indices] of [['raw',ww.map((_,i)=>i)],['legacy',base],['conditioned',conditioned]]){
   const ps=indices.map(i=>predictions[i]).filter(v=>v!==null);
   const p=mean(ps);prediction[label]={n:ps.length,probability:p,brier:p===null?null:(p-truth)**2};
  }
 }
 const policy={};
 for(const policyName of POLICIES){
  const deltas=[];
  for(let i=0;i<ww.length;i++){
   const seed=61000000+1000*pos.seed+i;
   const a=force(ww[i],pos.pair.connector,policyName,seed);
   const b=force(ww[i],pos.pair.other,policyName,seed);
   deltas.push({finish:a.finish-b.finish,remainder:a.remainder-b.remainder,minus:a.minus-b.minus,block:a.block-b.block});
  }
  policy[policyName]={};
  for(const metric of ['finish','remainder','minus','block']){
   policy[policyName][metric]={legacy:mean(base.map(i=>deltas[i][metric])),conditioned:mean(conditioned.map(i=>deltas[i][metric]))};
  }
 }
 return{seed:pos.seed,turn:pos.turn,role:role(pos),focal:pos.focal,
  retainedNext:roleNext.length,retainedThird:roleThird.length,legacyPasses:legacy.length,
  worlds:ww.length,legacyWorlds:n0,conditionedWorlds:nb,additionalExcluded:n0-nb,
  attribution,prediction,policy};
}
function run(start=400000,end=500000,perRole=25){
 const picked=select(start,end,perRole),rows=[];
 for(const roleName of ['next-only','third-only'])for(const pos of picked.groups[roleName])rows.push(evaluate(pos));
 const summary={};
 for(const roleName of ['next-only','third-only']){
  const xs=rows.filter(x=>x.role===roleName);
  const brier=xs.filter(x=>x.prediction.actualNextPass!==null);
  summary[roleName]={
   positions:xs.length,allocations:xs.reduce((a,x)=>a+x.worlds,0),
   legacyWorlds:xs.reduce((a,x)=>a+x.legacyWorlds,0),
   conditionedWorlds:xs.reduce((a,x)=>a+x.conditionedWorlds,0),
   additionalExcluded:xs.reduce((a,x)=>a+x.additionalExcluded,0),
   excludedPerExposedPosition:stat(xs.map(x=>x.additionalExcluded)),
   eliminatedShareOfLegacy:stat(xs.map(x=>x.legacyWorlds?(x.additionalExcluded/x.legacyWorlds):0)),
   trueNextPassRate:stat(brier.map(x=>x.prediction.actualNextPass)),
   nextPassBrierRaw:stat(brier.map(x=>x.prediction.raw.brier)),
   nextPassBrierLegacy:stat(brier.map(x=>x.prediction.legacy.brier)),
   nextPassBrierConditioned:stat(brier.map(x=>x.prediction.conditioned.brier)),
   brierImprovementVsLegacy:stat(brier.map(x=>x.prediction.legacy.brier-x.prediction.conditioned.brier)),
   policy:Object.fromEntries(POLICIES.map(p=>[p,Object.fromEntries(['finish','remainder','minus','block'].map(metric=>
    [metric,{legacy:stat(xs.map(x=>x.policy[p][metric].legacy)),conditioned:stat(xs.map(x=>x.policy[p][metric].conditioned))}]))]))
  };
 }
 return{schema:'qosa-balanced-retained-pass-role/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}),
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0; branch semantics provisional',
  mode:'3x9',seedRange:[start,end-1],scannedDeals:picked.scanned,eligiblePositions:picked.eligible,
  exposedRoleCounts:picked.exposure,selection:'first 25 retained next-only and first 25 retained third-only; disjoint role groups',
  positions:rows.length,exactHiddenAllocations:rows.reduce((a,x)=>a+x.worlds,0),
  candidateContinuations:rows.reduce((a,x)=>a+x.worlds,0)*POLICIES.length*2,
  strategies:POLICIES,continuationSeedFormula:'61000000+1000*dealSeed+lexicographicAllocationIndex',
  discoveryPolicy:'closed-branch-control',newFullStrategyRounds:0,cumulativeVerifiedFullRounds:180000,
  summary,selectedSeeds:rows.map(x=>x.seed),rows,
  limitations:'First eligible state per seed, selected role-exposed positions, non-random strata, small exact hidden allocations, equal allocation prior, no conditioning on voluntary opponent choices, assumed branch opening, unassigned block winner, deterministic bot continuations, exploratory intervals. True next-pass label is observed only for the deterministic discovery-policy action.'};
}
function test(){
 const pos=discover(281304,281305,1).positions[0];if(!pos)throw Error('fixture not found');
 const x=evaluate(pos),y=evaluate(pos);
 if(JSON.stringify(x)!==JSON.stringify(y))throw Error('nondeterministic fixture');
 if(x.conditionedWorlds>x.legacyWorlds||x.attribution.next+x.attribution.third!==x.additionalExcluded)throw Error('role invariant');
 return{passed:true,fixture:281304,role:x.role,worlds:x.worlds,legacy:x.legacyWorlds,conditioned:x.conditionedWorlds};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(Number(a[0]||400000),Number(a[1]||500000),Number(a[2]||25)),null,2));
}
module.exports={role,select,nextPass,evaluate,run,test};
