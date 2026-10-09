'use strict';
// Reproduce: node qosha-research/simulator/paired-both-block-holdout.js 12 25 80
// Official block winner is UNKNOWN; strict minimum pips is a descriptive proxy.
const e=require('./engine'),r=require('./round-driver'),{sampleWorld}=require('./hidden-world');
const {actionKey}=require('./decision-regret'),{neutralChoose}=require('./side-equivariance-audit');
const {collect,immediateThreat}=require('./threat-first-holdout'),{blockRank}=require('./block-remainder-holdout');
const POLICIES=['closed-branch-control','min-hand-pips','random-legal'];
const SCANS=[['closed-branch-control',282000,288000],['min-hand-pips',288000,294000]];
function forced(s,k){return r.stepRound(s,o=>{const a=o.actions.find(x=>actionKey(x)===k);if(!a)throw Error('missing action');return a;});}
function finish(s,p,seed){s=r.cloneRoundState(s);while(!s.outcome&&s.turns<200)s=r.stepRound(s,(o,t)=>neutralChoose(p,o,{seed,turns:t.turns,player:t.currentPlayer}));if(!s.outcome||s.outcome.kind==='unresolved')throw Error('unresolved');return s;}
function metrics(s,f){const o=s.outcome,b=blockRank(o,f);return{block:!!b,strict:+!!(b&&b.strictMin),tied:+!!(b&&b.tiedMin),rank:b?b.rank:null,margin:b?b.pips-Math.min(...o.remainders.filter((_,i)=>i!==f)):null,pips:e.pipSum(s.hands[f]),first:+(o.kind==='finish'&&o.playerIndex===f),minus:+(o.kind==='finish'&&o.playerIndex===f&&(o.minus||0)<0)};}
function empty(){return{both:0,alignedOnly:0,threatOnly:0,neither:0,strictAligned:0,strictThreat:0,tiedAligned:0,tiedThreat:0,bothPipDiff:0,bothMarginDiff:0,bothRankDiff:0,firstDiff:0,pipsDiff:0,minusDiff:0};}
function check(d,n){if(d.both+d.alignedOnly+d.threatOnly+d.neither!==n)throw Error('block partition');}
function analyze(p,train,test){
 const s=p.state,before=JSON.stringify(s),f=p.focal,next=(f+1)%3,c=p.choice,base=18000000+1000*p.seed;
 const spec={focalPlayer:f,focalHand:s.hands[f],knownTiles:p.known,hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 const aligned=c.highMob>c.lowMob?0:1,other=1-aligned,risks=[0,0];
 for(let i=0;i<train;i++){const w=sampleWorld(spec,base+i);for(let j=0;j<2;j++)risks[j]+=immediateThreat(forced(w,c.keys[j]),next);}
 const override=(risks[aligned]-risks[other])/train>=0.12-1e-12;
 const out={seed:p.seed,discoveryPolicy:p.policy,group:p.group,focal:f,hand:s.hands[f].map(e.tileKey),opponentSizes:[s.hands[next].length,s.hands[(f+2)%3].length],tile:c.tile,alignedIndex:aligned,override,trainRiskAligned:risks[aligned]/train,trainRiskAlternative:risks[other]/train,worldSeedStart:base,policies:{}};
 if(override){
  const data=Object.fromEntries(POLICIES.map(k=>[k,empty()])),testRisk=[0,0];
  for(let i=0;i<test;i++){
   const seed=base+train+i,w=sampleWorld(spec,seed),states=c.keys.map(k=>forced(w,k));
   for(let j=0;j<2;j++)testRisk[j]+=immediateThreat(states[j],next);
   for(const policy of POLICIES){
    const a=metrics(finish(states[aligned],policy,seed),f),b=metrics(finish(states[other],policy,seed),f),d=data[policy];
    d.firstDiff+=b.first-a.first;d.pipsDiff+=b.pips-a.pips;d.minusDiff+=b.minus-a.minus;
    if(a.block&&b.block){d.both++;d.strictAligned+=a.strict;d.strictThreat+=b.strict;d.tiedAligned+=a.tied;d.tiedThreat+=b.tied;d.bothPipDiff+=b.pips-a.pips;d.bothMarginDiff+=b.margin-a.margin;d.bothRankDiff+=b.rank-a.rank;}
    else if(a.block)d.alignedOnly++;else if(b.block)d.threatOnly++;else d.neither++;
   }
  }
  for(const policy of POLICIES){check(data[policy],test);out.policies[policy]=data[policy];}
  out.testRiskAligned=testRisk[aligned]/test;out.testRiskThreatFirst=testRisk[other]/test;
 }
 if(JSON.stringify(s)!==before)throw Error('source mutated');return out;
}
function mean(a){return a.length?a.reduce((s,x)=>s+x,0)/a.length:null;}
function ci(a){if(!a.length)return null;const m=mean(a),v=a.length>1?a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1):0,h=1.96*Math.sqrt(v/a.length);return{n:a.length,mean:m,ci95PositionNormalApprox:[m-h,m+h]};}
function bootstrap(rows,p,count=1000){
 let seed=0x5b61c2a9;function next(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n;}
 const v=[];for(let i=0;i<count;i++){let n=0,k=0;for(let j=0;j<rows.length;j++){const d=rows[next(rows.length)].policies[p];n+=d.strictThreat-d.strictAligned;k+=d.both;}if(k)v.push(n/k);}
 v.sort((a,b)=>a-b);return{resamples:count,valid:v.length,ci95PositionBootstrapPercentile:v.length?[v[Math.floor(.025*(v.length-1))],v[Math.floor(.975*(v.length-1))]]:null};
}
function aggregate(rows,test){
 const a=rows.filter(x=>x.override),out={positions:rows.length,overrides:a.length,trainingWorlds:rows.length*25,evaluationWorlds:a.length*test,immediateRiskDelta:ci(a.map(x=>x.testRiskThreatFirst-x.testRiskAligned)),policies:{}};
 for(const p of POLICIES){
  const ds=a.map(x=>x.policies[p]),sum=k=>ds.reduce((s,d)=>s+d[k],0),both=sum('both'),n=a.length*test;
  const cells={both,alignedOnly:sum('alignedOnly'),threatOnly:sum('threatOnly'),neither:sum('neither')};
  if(Object.values(cells).reduce((s,x)=>s+x,0)!==n)throw Error('aggregate partition');
  out.policies[p]={n,blockPairs:cells,positionsWithBothBlock:ds.filter(x=>x.both).length,
   strictMinAlignedGivenBothBlock:both?sum('strictAligned')/both:null,
   strictMinThreatGivenBothBlock:both?sum('strictThreat')/both:null,
   pairedStrictMinDelta:both?(sum('strictThreat')-sum('strictAligned'))/both:null,
   pairedFocalPipsDelta:both?sum('bothPipDiff')/both:null,
   pairedMarginDelta:both?sum('bothMarginDiff')/both:null,
   pairedRankDelta:both?sum('bothRankDiff')/both:null,
   pairedStrictMinPositionBootstrap:bootstrap(a,p),
   allFinishFirstDelta:ci(ds.map(d=>d.firstDiff/test)),allBlockDelta:ci(ds.map(d=>(d.threatOnly-d.alignedOnly)/test)),allPipsDelta:ci(ds.map(d=>d.pipsDiff/test))};
 }
 return out;
}
function selfTest(){
 const d=empty();d.both=2;d.alignedOnly=1;d.threatOnly=3;d.neither=4;check(d,10);
 let bad=false;try{check(d,9);}catch(_){bad=true;}if(!bad)throw Error('partition guard');
 if(!blockRank({kind:'block',remainders:[4,5,6]},0).strictMin)throw Error('strict');
 if(!blockRank({kind:'block',remainders:[4,4,6]},0).tiedMin)throw Error('tie');
 if(blockRank({kind:'finish',playerIndex:0},0)!==null)throw Error('finish not block');
 return{passed:true,cases:5};
}
function run(quota=12,train=25,test=80){
 if(![quota,train,test].every(x=>Number.isInteger(x)&&x>0&&x<=300))throw Error('bad parameters');
 selfTest();
 const scans=SCANS.map(([policy,a,b])=>({policy,...collect(policy,a,b,quota)})),positions=scans.flatMap(x=>x.positions);
 if(new Set(positions.map(x=>x.seed)).size!==positions.length)throw Error('duplicate seeds');
 const rows=positions.map(x=>analyze(x,train,test)),active=rows.filter(x=>x.override);
 const summary=aggregate(rows,test);summary.trainingWorlds=rows.length*train;
 return{schema:'qosa-paired-both-block/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',seedScans:scans.map(x=>({policy:x.policy,range:x.seedRange,eligible:x.eligible,available:x.available})),selectedSeeds:rows.map(x=>x.seed),positions:rows.length,overrides:active.length,trainWorlds:train,testWorlds:test,newHiddenWorlds:rows.length*train+active.length*test,pairedCandidateContinuations:active.length*test*2*POLICIES.length,fullStrategyRounds:0,worldSeedFormula:'18000000+1000*dealSeed+worldIndex; training 0..train-1, evaluation train..train+test-1 only for overrides',strategies:['mobility-aligned','threat-first if training risk improvement >=12pp'],continuationPolicies:POLICIES.map(p=>'side-neutral-'+p),summary,rows,limitations:['Block winner unassigned; strict minimum pips is not official win','Only one position generated both-block worlds in this run','Assumed branch locking/opening','Simple bots','First eligible per seed','Exploratory clustered CIs','No pass-history conditioning','V8 CommonJS, not independent Node CLI'],exactNextAction:'Find multiple distinct both-block positions on disjoint seeds before interpreting the paired block-rank proxy; clarify official block rule.'};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?selfTest():run(Number(a[0]||12),Number(a[1]||25),Number(a[2]||80)),null,2));}
module.exports={run,selfTest,analyze,aggregate};