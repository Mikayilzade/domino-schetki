'use strict';
// Independent conditional threat-first audit. Run: node qosha-research/simulator/threat-first-conditional.js 12 25 25
const {collect,analyze,aggregate,selfTest}=require('./threat-first-holdout');
const SCANS=[['closed-branch-control',234000,240000],['min-hand-pips',240000,246000]];
const POLICIES=['closed-branch-control','min-hand-pips','random-legal'];
function stat(a){if(!a.length)return null;const m=a.reduce((s,x)=>s+x,0)/a.length;const sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;const h=1.96*sd/Math.sqrt(a.length);return{n:a.length,mean:m,ci95PositionNormalApprox:[m-h,m+h]};}
function conditional(rows){
 const g={all:rows,override:rows.filter(x=>x.override),strongTrain:rows.filter(x=>x.override&&x.trainRiskAligned-x.trainRiskAlternative>=.30),weakTrain:rows.filter(x=>x.override&&x.trainRiskAligned-x.trainRiskAlternative<.30),mobGap1:rows.filter(x=>x.override&&Math.abs(x.highMob-x.lowMob)===1),mobGap2plus:rows.filter(x=>x.override&&Math.abs(x.highMob-x.lowMob)>=2),otherLe3:rows.filter(x=>x.override&&x.otherOpponentHandSize<=3),otherGe4:rows.filter(x=>x.override&&x.otherOpponentHandSize>=4)};
 return Object.fromEntries(Object.entries(g).map(([name,items])=>[name,{count:items.length,riskChange:stat(items.map(x=>x.testRiskThreatFirst-x.testRiskAligned)),policies:Object.fromEntries(POLICIES.map(p=>[p,{finishFirstChange:stat(items.map(x=>x.policies[p].first.overrideMinusMobility)),pipsChange:stat(items.map(x=>x.policies[p].pips.overrideMinusMobility)),blockChange:stat(items.map(x=>x.policies[p].block.overrideMinusMobility)),turnsChange:stat(items.map(x=>x.policies[p].turns.overrideMinusMobility))}]))}]));
}
function run(quota=12,trainWorlds=25,testWorlds=25){
 if(![quota,trainWorlds,testWorlds].every(x=>Number.isInteger(x)&&x>0&&x<=100))throw Error('invalid params');
 const scans=SCANS.map(([policy,a,b])=>({policy,...collect(policy,a,b,quota)}));
 const positions=scans.flatMap(x=>x.positions);
 if(new Set(positions.map(x=>x.seed)).size!==positions.length)throw Error('duplicate seeds');
 const rows=positions.map(p=>analyze(p,trainWorlds,testWorlds));
 const summary=conditional(rows);
 if(summary.override.count>rows.length)throw Error('invalid subgroup');
 return{schema:'qosa-threat-first-conditional/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',scans:scans.map(x=>({policy:x.policy,seedRange:x.seedRange,eligible:x.eligible,available:x.available})),selectedSeeds:rows.map(x=>x.seed),positionCount:rows.length,trainWorlds,testWorlds,uniqueHiddenWorlds:rows.length*(trainWorlds+testWorlds),candidateContinuations:rows.length*testWorlds*2*POLICIES.length,fullStrategyRounds:0,worldSeedFormula:'14000000+1000*dealSeed+worldIndex; training 0..trainWorlds-1; evaluation trainWorlds..trainWorlds+testWorlds-1',strategies:['mobility-aligned','frozen threat-first override >=12pp','alternative'],continuationPolicies:POLICIES.map(x=>'side-neutral-'+x),subgroupProtocol:'Frozen train-risk split >=30pp; own mobility gap 1 vs >=2; other opponent <=3 vs >=4. All exploratory.',summary:aggregate(rows),conditional:summary,rows,limitations:['Assumption-labelled branch semantics','Simple bots','No block winner assigned','Pass history ignored by hidden sampler','First eligible selection','Small subgroups','Exploratory unadjusted position-level CIs'],exactNextAction:'Investigate why threat-first raises block rate; define block outcome before promoting win recommendations; independently reproduce with Node CLI.'};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?selfTest():run(Number(a[0]||12),Number(a[1]||25),Number(a[2]||25)),null,2));}
module.exports={run,conditional};
