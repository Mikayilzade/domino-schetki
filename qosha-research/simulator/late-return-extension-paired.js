'use strict';
// Paired extension-policy sensitivity on identical seeded hidden allocations.
// node qosha-research/simulator/late-return-extension-paired.js [start=3396168] [count=1024]
const assert=require('node:assert/strict');
const {sample}=require('./late-return-hidden-holdout');
const {advance}=require('./late-return-second-cycle-holdout');
const {actions,key}=require('./late-return-rule-sensitivity');
const {evaluate}=require('./late-return-voluntary-double-stop');
const MODELS=['global-ever-open','all-current-only'];
const STYLES=['low','high','double-first','double-last'];
const STOPS=['single','greedy'];
const id=a=>key(a.t)+'@'+(a.side===null?'D':a.side);
function candidates(states){
 const b=new Set(actions(states[1],1).filter(x=>x.side!==null).map(id));
 const seen=new Set();
 return actions(states[0],1).filter(x=>x.side!==null&&b.has(id(x))&&!seen.has(id(x))&&seen.add(id(x)));
}
function one(seed){
 const h=sample(seed),lo=advance(h,'low'),hi=advance(h,'high');
 const a=lo.accepted?candidates(lo.states):[];
 const b=hi.accepted?candidates(hi.states):[];
 const base={lowEligible:lo.accepted&&a.length>=2,highEligible:hi.accepted&&b.length>=2};
 if(!base.lowEligible||!base.highEligible)return {...base,pairedEligible:false};
 const bMap=new Map(b.map(x=>[id(x),x]));
 const common=a.filter(x=>bMap.has(id(x)));
 let robustLow=0,robustHigh=0,robustBoth=0,lowOnly=0,highOnly=0;
 let passLow=0,passHigh=0,lowMore=0,highMore=0,equal=0;
 const sameHistory=lo.history.join('|')===hi.history.join('|');
 for(const c of common){
  const totals=[lo,hi].map(ext=>{
   let passes=0;
   for(let mi=0;mi<2;mi++)for(const style of STYLES)for(const stop of STOPS)
    passes+=Number(evaluate(ext.states[mi],c,style,stop).pass);
   return passes;
  });
  const [x,y]=totals;
  passLow+=x;passHigh+=y;
  lowMore+=Number(x>y);highMore+=Number(y>x);equal+=Number(x===y);
  robustLow+=Number(x===0);robustHigh+=Number(y===0);
  robustBoth+=Number(x===0&&y===0);
  lowOnly+=Number(x===0&&y>0);highOnly+=Number(y===0&&x>0);
  if(sameHistory)assert.equal(x,y,'identical history must produce identical outcomes');
 }
 return {...base,pairedEligible:true,common:common.length,lowCandidates:a.length,highCandidates:b.length,
  sameHistory,robustLow,robustHigh,robustBoth,lowOnly,highOnly,passLow,passHigh,lowMore,highMore,equal};
}
function run(start=3396168,count=1024){
 assert(Number.isSafeInteger(start)&&start>=0&&Number.isInteger(count)&&count>0&&count<=10000);
 const out={schema:'qosha-late-return-extension-paired/v1',engine:'qosa-research-0.5.3 + late-return-extension-paired/v1',
  rules:'recovered qosa-1.0.0 3x9; both late-arrival branch models PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,seededConditionalWorlds:count,
  extensionPolicies:['low','high'],opponentPolicies:STYLES,stopping:STOPS,
  lowEligible:0,highEligible:0,bothEligible:0,commonCandidateWorlds:0,zeroCommonWorlds:0,
  commonCandidateComparisons:0,deterministicTwoOpponentContinuations:0,sameHistoryWorlds:0,
  robustLow:0,robustHigh:0,robustBoth:0,robustLowOnly:0,robustHighOnly:0,
  passLow:0,passHigh:0,lowMorePassCandidates:0,highMorePassCandidates:0,equalPassCandidates:0,
  completeRounds:0,fullGameContinuations:0};
 for(let i=0;i<count;i++){
  const seed=start+i;
  if(i<16)assert.deepEqual(sample(seed),sample(seed),'deterministic deal replay');
  const r=one(seed);
  if(i<16)assert.deepEqual(one(seed),r,'deterministic continuation replay');
  out.lowEligible+=Number(r.lowEligible);out.highEligible+=Number(r.highEligible);
  if(!r.pairedEligible)continue;
  out.bothEligible++;out.commonCandidateWorlds+=Number(r.common>0);
  out.zeroCommonWorlds+=Number(r.common===0);
  out.commonCandidateComparisons+=r.common;
  out.deterministicTwoOpponentContinuations+=r.common*32;
  out.sameHistoryWorlds+=Number(r.sameHistory);
  for(const k of ['robustLow','robustHigh','robustBoth','passLow','passHigh'])out[k]+=r[k];
  out.robustLowOnly+=r.lowOnly;out.robustHighOnly+=r.highOnly;
  out.lowMorePassCandidates+=r.lowMore;out.highMorePassCandidates+=r.highMore;
  out.equalPassCandidates+=r.equal;
 }
 assert(out.bothEligible<=Math.min(out.lowEligible,out.highEligible));
 assert.equal(out.robustBoth+out.robustLowOnly,out.robustLow);
 assert.equal(out.robustBoth+out.robustHighOnly,out.robustHigh);
 assert.equal(out.lowMorePassCandidates+out.highMorePassCandidates+out.equalPassCandidates,out.commonCandidateComparisons);
 out.limitations='One fixed synthetic public prefix; extension policy changes chronological history, not hidden allocation. Selected common-legal candidates, uniform conditional worlds, two provisional branch models, 2-opponent horizon, no full-game win/minus/regret inference.';
 return out;
}
if(require.main===module)console.log(JSON.stringify(run(Number(process.argv[2]||3396168),Number(process.argv[3]||1024)),null,2));
module.exports={run,one,candidates};
