'use strict';
// Independent pre-registered replication of endpoint-mobility-holdout.js.
// node qosha-research/simulator/endpoint-mobility-replication.js 24 25
// All inference is across distinct deal-seed positions, not worlds.
const e=require('./engine'), previous=require('./endpoint-mobility-holdout'), base=require('./connector-gap-pressure');
const DISCOVERY=[['closed-branch-control',146000,148000],['min-hand-pips',148000,150000]];
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'];
function stat(xs){return previous.stat(xs);}
function signed(row,policy,key){const sign=Math.sign(row.mobility.low-row.mobility.high);return sign*row.policies[policy].keepHighMinusLow[key];}
function summarize(rows){const result={};for(const policy of POLICIES){
 const eligible=rows.filter(r=>r.mobility.group!=='equal');
 const s=rs=>({finish:stat(rs.map(r=>signed(r,policy,'finish'))),pips:stat(rs.map(r=>signed(r,policy,'pips'))),minus:stat(rs.map(r=>signed(r,policy,'minus'))),lossCases:rs.filter(r=>signed(r,policy,'finish')<0).length,tieCases:rs.filter(r=>signed(r,policy,'finish')===0).length});
 const by=(key,min=8)=>Object.fromEntries([...new Set(eligible.map(key))].sort().map(k=>[k,eligible.filter(r=>key(r)===k)]).filter(([,rs])=>rs.length>=min).map(([k,rs])=>[k,s(rs)]));
 result[policy]={all:s(eligible),byDiscovery:by(r=>r.discoveryPolicy,1),bySide:by(r=>r.side,8),byOpponentVector:by(r=>r.opponents.join(':'),6),byCurrentEnd:by(r=>String(r.x),8),byMobilityGap:by(r=>String(Math.abs(r.mobility.low-r.mobility.high)),8)};
}return result;}
function run(quota=24,worlds=25){
 if(!Number.isInteger(quota)||quota<1||!Number.isInteger(worlds)||worlds<1||worlds>1000)throw Error('invalid quota/worlds');
 const selections=DISCOVERY.map(([policy,start,end])=>({policy,...previous.select(policy,start,end,quota)}));
 const positions=selections.flatMap(x=>x.selected);
 if(new Set(positions.map(p=>p.seed)).size!==positions.length)throw Error('duplicate seed');
 const rows=positions.map(p=>({seed:p.seed,discoveryPolicy:p.discoveryPolicy,turn:p.state.turns,focal:p.focal,hand:p.state.hands[p.focal].map(e.tileKey),
   opponents:[p.state.hands[(p.focal+1)%3].length,p.state.hands[(p.focal+2)%3].length],side:p.choice.side,x:p.choice.x,low:p.choice.low,high:p.choice.high,mobility:p.mobility,
   worldStart:6100000+1000*p.seed,candidates:[p.choice.spendLow,p.choice.spendHigh],policies:{}}));
 let continuations=0;
 for(const policy of POLICIES)for(let k=0;k<positions.length;k++){
   const before=JSON.stringify(positions[k].state),a=base.analyze(positions[k],worlds,policy);
   if(before!==JSON.stringify(positions[k].state))throw Error('state mutation');
   if(a.continuations<2*worlds)throw Error('missing continuations');
   continuations+=a.continuations;
   rows[k].policies[policy]={keepHighMinusLow:a.keepHighMinusLow,continuations:a.continuations};
 }
 const aligned=rows.filter(r=>r.mobility.group!=='equal');
 const ranked=aligned.map(r=>({seed:r.seed,hand:r.hand,side:r.side,endpoints:[r.low,r.high],opponents:r.opponents,mobility:r.mobility,
   averageAlignedFinish:POLICIES.reduce((a,p)=>a+signed(r,p,'finish'),0)/POLICIES.length})).sort((a,b)=>a.averageAlignedFinish-b.averageAlignedFinish);
 return{schema:'qosa-endpoint-mobility-independent-replication/v1',
 timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',
 engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',newFullStrategyRounds:0,cumulativeFullStrategyRounds:180000,historicalRoundsSeparate:4000,
 seedRanges:DISCOVERY.map(([,start,end])=>[start,end-1]),selectedSeeds:rows.map(r=>r.seed),quotaPerDiscoveryAndMobilityGroup:quota,worldsPerPosition:worlds,
 positionCount:rows.length,nonTiePositions:aligned.length,newHiddenWorlds:rows.length*worlds,priorHiddenWorlds:55210,cumulativeHiddenWorlds:55210+rows.length*worlds,
 policyWorldEvaluations:rows.length*worlds*POLICIES.length,candidateContinuations:continuations,
 worldSeedFormula:'6100000+1000*dealSeed+worldIndex',
 discoveryPolicies:DISCOVERY.map(x=>x[0]),continuationPolicies:POLICIES,
 scanAudit:Object.fromEntries(selections.map(s=>[s.policy,{eligible:s.eligible,available:s.available,selected:s.selected.length,seedRange:s.range}])),
 comparison:'Same visible state and branch side, X-LOW vs X-HIGH, sign aligned to endpoint with more OTHER remaining connectors.',
 confidence:'Pre-registered independent deal seeds; unadjusted 95% normal CI across independent selected positions; worlds paired and not treated as independent.',
 summary:summarize(rows),counterexamples:ranked.slice(0,8),successes:ranked.slice(-8).reverse(),
 limitations:['Assumption-labelled branch rules','Deterministic handcrafted bots','Block winner unassigned','First-eligible quota sampling','No causal isolation of other hand composition','Subgroup CIs exploratory and unadjusted','World samples correlated within positions'],
 nextHypothesis:'Check whether the mobility advantage survives against new opponent continuation policies and when an opponent has 1-2 tiles; seek counterexamples with multiple open sides.',positions:rows};
}
function selfTest(){
 const p=previous.select('closed-branch-control',146000,148000,1).selected[0];
 const before=JSON.stringify(p.state),a=base.analyze(p,2,'min-hand-pips'),b=base.analyze(p,2,'min-hand-pips');
 if(before!==JSON.stringify(p.state)||JSON.stringify(a)!==JSON.stringify(b))throw Error('mutation/nondeterminism');
 if(p.seed<146000||p.seed>=148000)throw Error('non-holdout seed');
 return{passed:true,seed:p.seed,worlds:2};
}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?selfTest():run(Number(process.argv[2]||24),Number(process.argv[3]||25)),null,2));
module.exports={run,selfTest,summarize,signed};