'use strict';
// Independent block-conditional audit on fresh deal seeds. Node: node qosha-research/simulator/block-conditional-holdout.js 8 25 25
// Official winner at block remains UNKNOWN. Rank-at-block is only a descriptive proxy.
const {collect}=require('./threat-first-holdout');
const {analyze,selfTest:baseTest}=require('./block-remainder-holdout');
const SCANS=[['closed-branch-control',270000,276000],['min-hand-pips',276000,282000]];
const POLICIES=['closed-branch-control','min-hand-pips','random-legal'];
const KEYS=['block','blockStrictMin','blockTiedMin','blockNotMin','first','pips','turns'];
function mean(a){return a.reduce((s,x)=>s+x,0)/a.length;}
function ci(a){if(!a.length)return null;const m=mean(a),v=a.length>1?a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1):0,h=1.96*Math.sqrt(v/a.length);return{n:a.length,mean:m,ci95PositionNormalApprox:[m-h,m+h]};}
function sum(rows,p,k,side){return rows.reduce((s,r)=>s+r.policies[p][k][side],0);}
function conditional(rows,p,side){
 const blocks=sum(rows,p,'block',side);
 if(blocks===0)return{blockWorldEquivalent:0,strictMinGivenBlock:null,strictOrTiedMinGivenBlock:null};
 return{blockWorldEquivalent:blocks*25,strictMinGivenBlock:sum(rows,p,'blockStrictMin',side)/blocks,
 strictOrTiedMinGivenBlock:(sum(rows,p,'blockStrictMin',side)+sum(rows,p,'blockTiedMin',side))/blocks};
}
function bootstrap(rows,p,count=1000){
 let state=0x5a17c9ef;
 function next(n){state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)%n;}
 const ds=[];
 for(let b=0;b<count;b++){const sampled=Array.from({length:rows.length},()=>rows[next(rows.length)]);
  const a=conditional(sampled,p,'aligned').strictMinGivenBlock,z=conditional(sampled,p,'threatFirst').strictMinGivenBlock;
  if(a!==null&&z!==null)ds.push(z-a);
 }
 ds.sort((x,y)=>x-y);
 return{resamples:count,valid:ds.length,ci95PositionBootstrapPercentile:ds.length?[ds[Math.floor(.025*(ds.length-1))],ds[Math.floor(.975*(ds.length-1))]]:null};
}
function audit(rows){
 const policies={};
 for(const p of POLICIES){
  for(const row of rows)for(const side of ['aligned','threatFirst']){
   const m=row.policies[p],parts=m.blockStrictMin[side]+m.blockTiedMin[side]+m.blockNotMin[side];
   if(Math.abs(parts-m.block[side])>1e-9)throw Error('block categories do not sum to block');
  }
  const aligned=conditional(rows,p,'aligned'),threatFirst=conditional(rows,p,'threatFirst');
  policies[p]={aligned,threatFirst,
   strictMinGivenBlockChange:aligned.strictMinGivenBlock===null||threatFirst.strictMinGivenBlock===null?null:threatFirst.strictMinGivenBlock-aligned.strictMinGivenBlock,
   bootstrap:bootstrap(rows,p),
   pairedPositionDeltas:Object.fromEntries(KEYS.map(k=>[k,ci(rows.map(r=>r.policies[p][k].delta))]))};
 }
 return{positions:rows.length,overrides:rows.filter(x=>x.override).length,
 immediateOpponentFinishRiskDelta:ci(rows.map(x=>x.testRiskThreatFirst-x.testRiskAligned)),
 policies};
}
function selfTest(){
 baseTest();
 const make=(a,b)=>({policies:Object.fromEntries(POLICIES.map(p=>[p,Object.fromEntries(
 ['block','blockStrictMin','blockTiedMin','blockNotMin'].map(k=>[k,{aligned:a[k],threatFirst:b[k],delta:b[k]-a[k]}])
 )]))});
 const r=[make({block:1,blockStrictMin:1,blockTiedMin:0,blockNotMin:0},{block:1,blockStrictMin:0,blockTiedMin:1,blockNotMin:0}),
 make({block:0,blockStrictMin:0,blockTiedMin:0,blockNotMin:0},{block:1,blockStrictMin:1,blockTiedMin:0,blockNotMin:0})];
 if(conditional(r,POLICIES[0],'aligned').strictMinGivenBlock!==1)throw Error('aligned conditional denominator');
 if(conditional(r,POLICIES[0],'threatFirst').strictMinGivenBlock!==.5)throw Error('threat-first conditional denominator');
 return{passed:true,cases:7};
}
function run(quota=8,trainWorlds=25,testWorlds=25){
 if(![quota,trainWorlds,testWorlds].every(x=>Number.isInteger(x)&&x>0&&x<=100))throw Error('invalid params');
 selfTest();
 const scans=SCANS.map(([policy,a,b])=>({policy,...collect(policy,a,b,quota)}));
 const positions=scans.flatMap(x=>x.positions);
 if(new Set(positions.map(x=>x.seed)).size!==positions.length)throw Error('duplicate seeds');
 const rows=positions.map(p=>analyze(p,trainWorlds,testWorlds));
 const summary=audit(rows);
 return{schema:'qosa-block-conditional-holdout/v1',
 timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',
 engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
 seedScans:scans.map(x=>({policy:x.policy,range:x.seedRange,eligible:x.eligible,available:x.available})),
 selectedSeeds:rows.map(x=>x.seed),positions:rows.length,trainWorlds,testWorlds,
 newHiddenWorlds:rows.length*(trainWorlds+testWorlds),
 pairedCandidateContinuations:rows.length*testWorlds*2*POLICIES.length,
 fullStrategyRounds:0,worldSeedFormula:'16000000+1000*dealSeed+worldIndex; training 0..trainWorlds-1; evaluation trainWorlds..trainWorlds+testWorlds-1',
 strategies:['mobility-aligned','threat-first override if training immediate next-opponent finish risk falls >=12pp'],
 continuationPolicies:POLICIES.map(x=>'side-neutral-'+x),
 summary,rows,
 blockInterpretation:'Strictly-lowest and tied-lowest remaining pips at block are descriptive only; no official winner is assigned. Conditional block rates are ratios of different action-induced block subsets and are NOT a causal matched-block effect.',
 confidence:'Exploratory unadjusted position-level CIs, bootstrap by position (1000 fixed-seed resamples); no multiple comparison correction.',
 limitations:['Branch locking/opening assumption-labelled','Simple continuation bots','Block winner not specified','No pass-history conditioning of sampled hidden worlds','First eligible state per seed','Selected quota strata','Conditional-on-block selection bias','V8 CommonJS harness, Node CLI not independently run'],
 exactNextAction:'Compare block remainder rank conditional on comparable block-producing worlds, and seek confirmed block scoring rule; do not promote official block-win claims.'};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?selfTest():run(Number(a[0]||8),Number(a[1]||25),Number(a[2]||25)),null,2));}
module.exports={run,audit,conditional,selfTest};