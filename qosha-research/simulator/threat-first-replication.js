'use strict';
// Independent frozen 12pp threshold replication on disjoint deal-seed ranges.
// CLI: node qosha-research/simulator/threat-first-replication.js [quota=12] [trainWorlds=25] [testWorlds=25]
const {collect,analyze,aggregate,selfTest}=require('./threat-first-holdout');
const SCANS=[['closed-branch-control',222000,228000],['min-hand-pips',228000,234000]];
const POLICIES=['closed-branch-control','min-hand-pips','random-legal'];
function run(quota=12,trainWorlds=25,testWorlds=25){
 if(![quota,trainWorlds,testWorlds].every(x=>Number.isInteger(x)&&x>0&&x<=100))throw Error('invalid params');
 const scans=SCANS.map(([policy,a,b])=>({policy,...collect(policy,a,b,quota)}));
 const positions=scans.flatMap(x=>x.positions);
 if(new Set(positions.map(x=>x.seed)).size!==positions.length)throw Error('duplicate positions');
 const rows=positions.map(p=>analyze(p,trainWorlds,testWorlds));
 return{schema:'qosa-threat-first-independent-replication/v1',
  timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  source:'simulator/threat-first-replication.js',prior:'runs/2026-10-09-1245-threat-first-holdout.json',
  scans:scans.map(x=>({policy:x.policy,seedRange:x.seedRange,eligible:x.eligible,available:x.available})),
  selectedSeeds:rows.map(x=>x.seed),positionCount:rows.length,trainWorlds,testWorlds,
  uniqueHiddenWorlds:rows.length*(trainWorlds+testWorlds),evaluationWorlds:rows.length*testWorlds,
  candidateContinuations:rows.length*testWorlds*2*POLICIES.length,fullStrategyRounds:0,
  worldSeedFormula:'14000000+1000*dealSeed+worldIndex; train 0..24; evaluation 25..49',
  strategies:['mobility-aligned','threat-first frozen override >=12pp','mobility-alternative'],
  continuationPolicies:POLICIES.map(x=>'side-neutral-'+x),
  selection:'First reachable same X-Y tile on different open ends; next opponent exactly one tile; other >=2; unequal own mobility; quota per discovery-policy x mobility-direction group.',
  method:'Frozen 12pp risk-reduction override trained on 25 worlds, evaluated on 25 disjoint worlds for each position. Matched worlds and continuation policies for forced candidates. Same experiment as prior but nonoverlapping discovery seeds.',
  ciMethod:'Unadjusted exploratory normal 95% CI clustered by selected deal-seed position; hidden worlds are not independent.',
  summary:aggregate(rows),rows,
  limitations:['Assumption-labelled branch locking/opening','Simple deterministic continuation policies','Block winners unassigned','No opponent pass-history conditioning','First eligible selection','Unadjusted exploratory position-clustered intervals','Only immediate next opponent risk; no both-opponents-one-tile','V8 CommonJS evaluation harness; not Node CLI'],
  exactNextAction:'Compare outcomes conditional on override and risk-reduction strength; study both opponents at one tile on fresh seeds.'};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?selfTest():run(Number(a[0]||12),Number(a[1]||25),Number(a[2]||25)),null,2));}
module.exports={run};
