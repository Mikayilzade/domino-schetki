'use strict';
// Independent disjoint-seed replication. Reproduce: node qosha-research/simulator/block-remainder-replication.js 8 25 25
// Strictly-lowest pips at block is a descriptive proxy, NOT an official win.
const {collect}=require('./threat-first-holdout');
const {analyze,aggregate,selfTest}=require('./block-remainder-holdout');
const SCANS=[['closed-branch-control',258000,264000],['min-hand-pips',264000,270000]];
const POLICIES=['closed-branch-control','min-hand-pips','random-legal'];
function run(quota=8,trainWorlds=25,testWorlds=25){
 if(![quota,trainWorlds,testWorlds].every(x=>Number.isInteger(x)&&x>0&&x<=100))throw Error('invalid parameters');
 selfTest();
 const scans=SCANS.map(([policy,a,b])=>({policy,...collect(policy,a,b,quota)}));
 const positions=scans.flatMap(x=>x.positions);
 if(new Set(positions.map(x=>x.seed)).size!==positions.length)throw Error('duplicate positions');
 const rows=positions.map(p=>analyze(p,trainWorlds,testWorlds));
 const summary=aggregate(rows);
 for(const policy of POLICIES){const by=summary.policies[policy].all;if(!by||!by.blockStrictMin||!by.blockTiedMin||!by.blockNotMin)throw Error('missing block ranks');}
 return{schema:'qosa-block-remainder-replication/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',
 engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
 seedScans:scans.map(x=>({policy:x.policy,range:x.seedRange,eligible:x.eligible,available:x.available})),
 selectedSeeds:rows.map(x=>x.seed),positions:rows.length,trainWorlds,testWorlds,
 newHiddenWorlds:rows.length*(trainWorlds+testWorlds),pairedCandidateContinuations:rows.length*testWorlds*2*POLICIES.length,fullStrategyRounds:0,
 worldSeedFormula:'16000000+1000*dealSeed+worldIndex; training 0..trainWorlds-1; test trainWorlds..trainWorlds+testWorlds-1',
 strategies:['mobility-aligned','threat-first override when training next-opponent immediate finish risk decreases by >=12pp'],
 continuationPolicies:POLICIES.map(x=>'side-neutral-'+x),
 blockRule:'No winner at block assigned; strictly-lowest/tied-lowest remaining pips are descriptive proxies, NOT official wins.',
 summary,rows,
 limitations:['Branch opening/locking assumption-labelled','Handcrafted continuation bots','Block winner unresolved','No opponent-pass-history conditioning','First eligible position per deal seed','Exploratory unadjusted 95% position-level normal intervals','No independent Node CLI execution (V8 CommonJS harness)'],
 exactNextAction:'Compare strict-lowest-at-block changes on a third disjoint seed set, conditional on block frequency; seek user-confirmed block winner/scoring rule before win-based strategy claims.'};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(run(Number(a[0]||8),Number(a[1]||25),Number(a[2]||25)),null,2));}
module.exports={run};
