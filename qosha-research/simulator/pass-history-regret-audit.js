'use strict';
// Exact hidden-world pass-history regret audit. Run from repository root:
// node qosha-research/simulator/pass-history-regret-audit.js
// node qosha-research/simulator/pass-history-regret-audit.js test
const {analyze}=require('./pass-history-holdout-replay');
const seeds=[2605229,2608389,2609300,2617143,2618093,2620465,2630541,2632269,2641078,2645895,2651743,2673767,2676005,2678248,2686085,2698342,2702749,2715495,2715877,2724160,2726688,2731625,2735864,2738177,2742984,2746448,2750761,2754714,2756125,2756515];
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const EPS=1e-12;
function choices(row){
 const uniform=row.preferredUniform,history=row.preferredHistory;
 const tied=Math.abs(row.conditioned[0]-row.conditioned[1])<EPS;
 return {uniform,history,tieSafe:tied?uniform:history,
  changed:uniform!==history,strictReversal:uniform!==history&&!tied,
  tieInducedChange:uniform!==history&&tied};
}
function run(){
 if(new Set(seeds).size!==seeds.length)throw Error('duplicate seeds');
 const raw=seeds.map(analyze),rows=raw.map(row=>{
  const c=choices(row);
  return {seed:row.seed,turn:row.turn,allWorlds:row.allWorlds,compatibleWorlds:row.compatibleWorlds,
   continuations:row.continuations,uniform:row.uniform,conditioned:row.conditioned,
   actualNextPass:row.actualNextPass,brierUniform:row.brierUniform,brierHistory:row.brierHistory,
   choices:c,connectorMinusOther:Object.fromEntries(policies.map(p=>[p,row.policy[p].connectorMinusOther]))};
 });
 const summary={positions:rows.length,exhaustiveAllocations:rows.reduce((s,x)=>s+x.allWorlds,0),
  compatibleAllocations:rows.reduce((s,x)=>s+x.compatibleWorlds,0),
  candidateContinuations:rows.reduce((s,x)=>s+x.continuations,0),
  changedPredictions:rows.filter(x=>x.conditioned.some((v,i)=>Math.abs(v-x.uniform[i])>EPS)).length,
  changedChoices:rows.filter(x=>x.choices.changed).length,
  strictReversals:rows.filter(x=>x.choices.strictReversal).length,
  tieInducedChanges:rows.filter(x=>x.choices.tieInducedChange).length,
  conditionalWorldSizes:{min:Math.min(...rows.map(x=>x.compatibleWorlds)),
   median:[...rows].map(x=>x.compatibleWorlds).sort((a,b)=>a-b)[Math.floor(rows.length/2)],
   max:Math.max(...rows.map(x=>x.compatibleWorlds))},
  brierUniform:mean(rows.map(x=>x.brierUniform)),brierHistory:mean(rows.map(x=>x.brierHistory)),
  policy:{}};
 summary.brierRelativeReduction=1-summary.brierHistory/summary.brierUniform;
 for(const p of policies){
  const metric={connectorMinusOtherWin:mean(rows.map(x=>x.connectorMinusOther[p].win)),
   connectorMinusOtherPips:mean(rows.map(x=>x.connectorMinusOther[p].pips)),
   connectorMinusOtherMinus:mean(rows.map(x=>x.connectorMinusOther[p].minus))};
  for(const choice of ['uniform','history','tieSafe']){
   metric[choice+'RelativeWin']=mean(rows.map(x=>x.choices[choice]===0?x.connectorMinusOther[p].win:0));
   metric[choice+'WinRegret']=mean(rows.map(x=>{
    const delta=x.connectorMinusOther[p].win;
    return Math.max(0,delta)-(x.choices[choice]===0?delta:0);
   }));
   metric[choice+'RelativePips']=mean(rows.map(x=>x.choices[choice]===0?x.connectorMinusOther[p].pips:0));
   metric[choice+'RelativeMinus']=mean(rows.map(x=>x.choices[choice]===0?x.connectorMinusOther[p].minus:0));
  }
  metric.historyMinusUniformWin=metric.historyRelativeWin-metric.uniformRelativeWin;
  metric.tieSafeMinusUniformWin=metric.tieSafeRelativeWin-metric.uniformRelativeWin;
  summary.policy[p]=metric;
 }
 return {schema:'qosa-pass-history-regret-audit/v1',
  timestampAsiaBaku:new Date(Date.now()+4*3600000).toISOString().slice(0,19)+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  discoverySeedRange:'2600000..2756515',selectedSeeds:seeds,
  selection:'first equal-pip connector-vs-unrelated choice after next opponent empty-stock pass; min-hand-pips discovery',
  continuationSeedFormula:'71000000+1000*dealSeed+lexicographicAllocationIndex',
  continuationPolicies:policies,fullRoundsAdded:0,verifiedFullRounds:180000,
  summary,rows,
  interpretation:'Brier measures pass forecast accuracy, not move value. Win regret uses the better of the TWO compared actions under exact history-compatible hidden allocations and fixed continuation policy. All relative win/pip/minus numbers use always-unrelated as zero; they are NOT absolute win rates.',
  limitations:'First-eligible selection, only 30 positions and 1 strict preference reversal, very small history-compatible world counts at changes, uniform hidden allocations conditioned only on target passes, fixed bot policies, assumed branch-opening semantics, unassigned block winner; no causal or human-play claim.',
  next:'On independent seeds, target 3+ legal candidates and near-ties; preregister tie-safe posterior choice, compare matched-world first-place regret and pip/minus metrics; require more than 1 strict reversal before strategy advice.'};
}
function selfTest(){const a=analyze(seeds[0]),b=analyze(seeds[0]);if(JSON.stringify(a)!==JSON.stringify(b))throw Error('non-deterministic');const z=run();if(z.summary.positions!==30||z.summary.exhaustiveAllocations!==216||z.summary.compatibleAllocations!==122||z.summary.candidateContinuations!==732)throw Error('recovery counts mismatch');return{passed:true,positions:z.summary.positions};}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?selfTest():run(),null,2));
module.exports={run,selfTest,seeds,choices};
