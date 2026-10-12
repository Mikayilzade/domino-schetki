'use strict';
// Deterministic pooled audit of three independently selected 3x9 pass-vs-win cohorts.
// Run: node qosha-research/simulator/pass-vs-win-pooled-audit.js
// No new deals are simulated; do not credit this audit as new strategy rounds.
const fs=require('node:fs'),path=require('node:path');
const FILES=["2026-10-12-1945-pass-vs-direct-win-2920000.json","2026-10-12-2051-pass-vs-direct-win-independent-2930000.json","2026-10-12-2153-pass-vs-win-third-cohort-2940000.json"];
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function ci(a){if(!a.length)return null;const m=mean(a),se=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length*(a.length-1))):0;return {mean:m,ci95:[m-1.96*se,m+1.96*se]};}
function audit(input){
 const rows=input.flatMap(x=>x.rows),seen=new Set();
 for(const x of input)if(x.engine!=='qosa-research-0.5.3'||x.rules!=='qosa-1.0.0'||x.mode!=='3x9')throw Error('version mismatch');
 for(const r of rows){
  if(seen.has(r.seed))throw Error('duplicate deal seed '+r.seed);seen.add(r.seed);
  if(r.keys.length<3||r.compatibleWorlds<6||r.trainWorlds+r.testWorlds!==r.compatibleWorlds||r.continuations!==r.compatibleWorlds*r.keys.length*POLICIES.length)throw Error('world/action accounting '+r.seed);
  if(r.passHistory.length!==r.keys.length||r.passUniform.length!==r.keys.length||r.history>=r.keys.length||r.maxPips>=r.keys.length)throw Error('action accounting '+r.seed);
  for(const p of POLICIES){const z=r.policies[p];if(!z||z.direct>=r.keys.length||Math.abs(z.directMinusHistoryWin-(z.holdoutDirectWin-z.holdoutHistoryWin))>1e-9)throw Error('metric mismatch '+r.seed);}
 }
 const passSpread=r=>Math.max(...r.passHistory)-Math.min(...r.passHistory)>1e-9;
 const sameSide=r=>new Set(r.keys.map(k=>k.split('|')[1])).size===1;
 const groups={all:rows,passSpread:rows.filter(passSpread),noPassSpread:rows.filter(r=>!passSpread(r)),sameSide:rows.filter(sameSide),differentSides:rows.filter(r=>!sameSide(r)),atLeast12CompatibleWorlds:rows.filter(r=>r.compatibleWorlds>=12),atLeast12AndPassSpread:rows.filter(r=>r.compatibleWorlds>=12&&passSpread(r))};
 const strata={};
 for(const [name,group] of Object.entries(groups)){
  strata[name]={positions:group.length,policies:{}};
  for(const p of POLICIES){
   const zs=group.map(r=>r.policies[p]);
   strata[name].policies[p]={
    directMinusPassFirstPlace:ci(zs.map(z=>z.directMinusHistoryWin)),
    passMinusMaxPipsFirstPlace:ci(zs.map(z=>z.historyMinusMaxPipsWin)),
    directTrainingMinusHoldoutFirstPlace:ci(zs.map(z=>z.trainWin-z.holdoutDirectWin)),
    changedDirectChoice:zs.filter((z,i)=>z.direct!==group[i].history).length
   };
  }
 }
 return {schema:'qosa-pass-vs-win-pooled-audit/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  sources:FILES,cohorts:input.map((x,i)=>({file:FILES[i],positions:x.rows.length,seedMin:Math.min(...x.rows.map(r=>r.seed)),seedMax:Math.max(...x.rows.map(r=>r.seed))})),
  positions:rows.length,distinctSeeds:seen.size,historyCompatibleWorlds:rows.reduce((s,r)=>s+r.compatibleWorlds,0),
  candidateContinuations:rows.reduce((s,r)=>s+r.continuations,0),
  positionsWithAtMostFiveHoldoutWorlds:rows.filter(r=>r.testWorlds<=5).length,
  positionsWithStrictHistoryActionReversal:rows.filter(r=>r.history!==r.uniform).length,
  strata,
  methodology:'Equal weight per selected visible position; exploratory normal 95% position-level intervals; training-minus-holdout is descriptive selection optimism, not an independent test of policy strength.',
  limitations:'No new deals; retrospective subgroup slicing; small train/test hidden worlds; conditional equal-weight allocations; assumed branch rules; fixed bots; block winner unassigned; candidate restriction to canonical singles.',
  finding:'Pass maximization is not proven to beat immediate pip discard; 55/96 positions have <=5 holdout worlds. Direct-win training scores exceed held-out scores by roughly 6-7 percentage points across bots, consistent with selection optimism.',
  next:'Run independent preregistered >=12 compatible-world cohort with positive pass spread and same-side controls; use disjoint seeds and out-of-sample first-place, pips and minus outcomes.'};
}
function run(){const dir=path.resolve(__dirname,'..','runs');return audit(FILES.map(f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'))));}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={audit,run,FILES};
