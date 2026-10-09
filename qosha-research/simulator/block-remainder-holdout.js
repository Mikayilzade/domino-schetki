'use strict';
// Reproduce: node qosha-research/simulator/block-remainder-holdout.js 8 25 25
// A block with the fewest remaining pips is NOT assumed to be an official win.
const e=require('./engine'),r=require('./round-driver'),{sampleWorld}=require('./hidden-world');
const {actionKey}=require('./decision-regret'),{neutralChoose}=require('./side-equivariance-audit');
const {collect,immediateThreat}=require('./threat-first-holdout');
const POLICIES=['closed-branch-control','min-hand-pips','random-legal'];
const SCANS=[['closed-branch-control',246000,252000],['min-hand-pips',252000,258000]];
function mean(a){return a.reduce((s,x)=>s+x,0)/a.length;}
function stat(a){if(!a.length)return null;const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0,h=1.96*sd/Math.sqrt(a.length);return{n:a.length,mean:m,ci95PositionNormalApprox:[m-h,m+h]};}
function blockRank(o,f){
 if(!o||o.kind!=='block')return null;
 const p=o.remainders;
 if(!Array.isArray(p)||p.length!==3||!p.every(x=>Number.isInteger(x)&&x>=0)||!Number.isInteger(f)||f<0||f>=3)throw Error('invalid block remainder vector');
 const rank=1+p.filter(x=>x<p[f]).length,ties=p.filter(x=>x===p[f]).length;
 return{rank,strictMin:rank===1&&ties===1,tiedMin:rank===1&&ties>1,notMin:rank>1,pips:p[f]};
}
function metrics(s,f){const o=s.outcome;if(!o||o.kind==='unresolved')throw Error('unresolved');const b=blockRank(o,f);return{first:+(o.kind==='finish'&&o.playerIndex===f),block:+!!b,blockStrictMin:+!!(b&&b.strictMin),blockTiedMin:+!!(b&&b.tiedMin),blockNotMin:+!!(b&&b.notMin),pips:e.pipSum(s.hands[f]),turns:s.turns};}
function forced(w,key){return r.stepRound(w,opts=>{const a=opts.actions.find(x=>actionKey(x)===key);if(!a)throw Error('candidate mismatch');return a;});}
function finish(s,policy,seed){while(!s.outcome&&s.turns<200)s=r.stepRound(s,(opts,t)=>neutralChoose(policy,opts,{seed,turns:t.turns,player:t.currentPlayer}));if(!s.outcome||s.outcome.kind==='unresolved')throw Error('unresolved');return s;}
function analyze(p,trainWorlds,testWorlds){
 const s=p.state,original=JSON.stringify(s),f=p.focal,next=(f+1)%3,c=p.choice;
 const spec={focalPlayer:f,focalHand:s.hands[f],knownTiles:p.known,hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 const aligned=c.highMob>c.lowMob?0:1,other=1-aligned,base=16000000+1000*p.seed,train=[0,0];
 for(let i=0;i<trainWorlds;i++){const w=sampleWorld(spec,base+i);for(let j=0;j<2;j++)train[j]+=immediateThreat(forced(w,c.keys[j]),next);}
 const risk=train.map(x=>x/trainWorlds),override=risk[other]+.12<=risk[aligned],selected=override?other:aligned;
 const testRisk=[0,0],values=Object.fromEntries(POLICIES.map(x=>[x,[[],[]]]));
 for(let i=0;i<testWorlds;i++){
  const seed=base+trainWorlds+i,w=sampleWorld(spec,seed),states=c.keys.map(k=>forced(w,k));
  for(let j=0;j<2;j++)testRisk[j]+=immediateThreat(states[j],next);
  for(const policy of POLICIES)for(let j=0;j<2;j++)values[policy][j].push(metrics(finish(r.cloneRoundState(states[j]),policy,seed),f));
 }
 if(JSON.stringify(s)!==original)throw Error('source mutated');
 const fields=['first','block','blockStrictMin','blockTiedMin','blockNotMin','pips','turns'];
 const policies=Object.fromEntries(POLICIES.map(policy=>[policy,Object.fromEntries(fields.map(k=>{
  const a=mean(values[policy][aligned].map(x=>x[k])),b=mean(values[policy][selected].map(x=>x[k]));
  return[k,{aligned:a,threatFirst:b,delta:b-a}];
 }))]));
 return{seed:p.seed,discoveryPolicy:p.policy,group:p.group,focal:f,opponentHandSizes:[s.hands[next].length,s.hands[(f+2)%3].length],focalHand:s.hands[f].map(e.tileKey),alignedIndex:aligned,override,trainRiskAligned:risk[aligned],trainRiskAlternative:risk[other],testRiskAligned:testRisk[aligned]/testWorlds,testRiskThreatFirst:testRisk[selected]/testWorlds,worldSeedStart:base,policies};
}
function aggregate(rows){const out={positions:rows.length,overrides:rows.filter(x=>x.override).length,riskDelta:stat(rows.map(x=>x.testRiskThreatFirst-x.testRiskAligned)),policies:{}};
 for(const policy of POLICIES){out.policies[policy]={};for(const [label,g] of [['all',rows],['overrideOnly',rows.filter(x=>x.override)]])out.policies[policy][label]=Object.fromEntries(['first','block','blockStrictMin','blockTiedMin','blockNotMin','pips','turns'].map(k=>[k,stat(g.map(x=>x.policies[policy][k].delta))]));}
 return out;
}
function run(quota=8,trainWorlds=25,testWorlds=25){
 if(![quota,trainWorlds,testWorlds].every(x=>Number.isInteger(x)&&x>0&&x<=100))throw Error('invalid parameters');
 const scans=SCANS.map(([policy,a,b])=>({policy,...collect(policy,a,b,quota)})),positions=scans.flatMap(x=>x.positions);
 if(new Set(positions.map(x=>x.seed)).size!==positions.length)throw Error('duplicate positions');
 const rows=positions.map(p=>analyze(p,trainWorlds,testWorlds));
 return{schema:'qosa-block-remainder-holdout/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',seedScans:scans.map(x=>({policy:x.policy,range:x.seedRange,eligible:x.eligible,available:x.available})),selectedSeeds:rows.map(x=>x.seed),positions:rows.length,trainWorlds,testWorlds,newHiddenWorlds:rows.length*(trainWorlds+testWorlds),pairedCandidateContinuations:rows.length*testWorlds*2*POLICIES.length,fullStrategyRounds:0,worldSeedFormula:'16000000+1000*dealSeed+worldIndex; train 0..trainWorlds-1; test trainWorlds..trainWorlds+testWorlds-1',strategies:['mobility-aligned','threat-first override when training immediate finish risk falls >=12pp'],continuationPolicies:POLICIES.map(x=>'side-neutral-'+x),blockRule:'No winner assigned at block. Strict/tied minimum remaining pips are descriptive proxies only; no invented win rate.',summary:aggregate(rows),rows,limitations:['Assumed branch open/locked semantics','Handcrafted bots','Block winner undefined; proxy not official win','Pass history not conditioned','First eligible position per seed','Exploratory unadjusted position-clustered normal CIs','V8 CommonJS harness, not Node CLI'],exactNextAction:'Validate official block scoring/winner rule before promoting block-based tactical advice; replicate proxy on disjoint seeds.'};
}
function selfTest(){
 const cases=[[{kind:'block',remainders:[4,5,6]},0,'strictMin'],[{kind:'block',remainders:[4,4,6]},1,'tiedMin'],[{kind:'block',remainders:[8,4,6]},0,'notMin']];
 for(const [o,f,k] of cases)if(!blockRank(o,f)[k])throw Error('block proxy '+k);
 if(blockRank({kind:'finish',playerIndex:0},0)!==null)throw Error('finish is not block');
 if(blockRank({kind:'block',remainders:[0,0,0]},2).rank!==1)throw Error('tie rank');
 if(metrics({outcome:{kind:'block',remainders:[4,5,6]},hands:[[[1,3]],[[2,3]],[[3,3]]],turns:12},0).first!==0)throw Error('block must not become win');
 return{passed:true,cases:5};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?selfTest():run(Number(a[0]||8),Number(a[1]||25),Number(a[2]||25)),null,2));}
module.exports={blockRank,metrics,analyze,aggregate,run,selfTest};
