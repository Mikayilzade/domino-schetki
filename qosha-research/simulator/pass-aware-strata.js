'use strict';
// Reproducible deal-cluster summaries for pass-aware adviser runs.
// node qosha-research/simulator/pass-aware-strata.js test
// node qosha-research/simulator/pass-aware-strata.js runs/first.json runs/second.json
function ci(rows,field){
 const groups=new Map();
 for(const row of rows){if(!groups.has(row.seed))groups.set(row.seed,[]);groups.get(row.seed).push(row[field]);}
 const a=[...groups.values()].map(xs=>xs.reduce((s,x)=>s+x,0)/xs.length);
 if(!a.length)return{positions:0,deals:0,mean:null,halfWidth95:null};
 const mean=a.reduce((s,x)=>s+x,0)/a.length;
 const halfWidth95=a.length>1?1.96*Math.sqrt(a.reduce((s,x)=>s+(x-mean)**2,0)/(a.length-1)/a.length):null;
 return{positions:rows.length,deals:a.length,mean,halfWidth95};
}
function summarize(rows){
 const fields=['conditionalVsUniformPP','conditionalVsControlPP','uniformVsControlPP','conditionalPipsVsControl','conditionalMinusVsControlPP','controlOracleRegretPP','conditionalOracleRegretPP'];
 return{positions:rows.length,deals:new Set(rows.map(x=>x.seed)).size,
  changedChoices:rows.filter(x=>x.conditionalKey!==x.uniformKey).length,
  conditionalChanges:rows.filter(x=>x.conditionalKey!==x.controlKey).length,
  uniformChanges:rows.filter(x=>x.uniformKey!==x.controlKey).length,
  metrics:Object.fromEntries(fields.map(f=>[f,ci(rows,f)]))};
}
function analyze(runs){
 if(!Array.isArray(runs)||!runs.length)throw Error('at least one run required');
 const rows=[],byRun=[];
 for(const run of runs){
  if(run.schema!=='qosha-pass-aware-advisor/v1'||run.engine!=='qosa-research-0.5.3'||run.trainWorlds!==48||run.evalWorlds!==32)throw Error('incompatible run');
  if(run.positions!==run.rows.length)throw Error('position count');
  if(rows.some(r=>r.seed>=run.seedStart&&r.seed<=run.seedEnd))throw Error('overlapping seed windows');
  rows.push(...run.rows);
  const mid=run.seedStart+run.deals/2;
  byRun.push({seedStart:run.seedStart,seedEnd:run.seedEnd,deals:run.deals,
   discovery:summarize(run.rows.filter(x=>x.seed<mid)),
   holdout:summarize(run.rows.filter(x=>x.seed>=mid)),combined:summarize(run.rows)});
 }
 const strata={
  weakPass:rows.filter(x=>x.forbiddenNext+x.forbiddenOther<=4),
  strongPass:rows.filter(x=>x.forbiddenNext+x.forbiddenOther>=5),
  openingSwitch:rows.filter(x=>x.openingSwitch),
  noOpeningSwitch:rows.filter(x=>!x.openingSwitch),
  policiesDiffer:rows.filter(x=>x.conditionalKey!==x.uniformKey),
  policiesSame:rows.filter(x=>x.conditionalKey===x.uniformKey)};
 return{schema:'qosha-pass-aware-strata/v1',engine:'qosa-research-0.5.3',
  ruleStatus:'recovered qosa-1.0.0 3x9; four-side number-lock PROVISIONAL',
  seeds:runs.map(x=>[x.seedStart,x.seedEnd]),deals:runs.reduce((s,x)=>s+x.deals,0),
  baselineRounds:runs.reduce((s,x)=>s+x.baselineRounds,0),
  forcedHiddenWorldContinuations:runs.reduce((s,x)=>s+x.forcedHiddenWorldContinuations,0),
  positions:rows.length,byRun,combined:summarize(rows),
  strata:Object.fromEntries(Object.entries(strata).map(([k,v])=>[k,summarize(v)])),
  preregistered:'Primary conditional-vs-uniform-trained finish-first difference on held-out both-pass worlds; secondary vs branch control. Pass strength = forbiddenNext + forbiddenOther (weak <=4, strong >=5). Opening-switch compares conditional adviser action type to branch control. Training 48, evaluation 32; no overlap in seeds.',
  limitations:'Exploratory uncorrected normal 95% CIs clustered by deal, not match victory. First-eligible both-pass positions; up to four bot-proposed actions; simple continuation policies; conditional posterior ignores opponent prior-choice likelihood; provisional branch number-lock and unvalidated block winner/loneZero/bust/101 scoring. No universal human-play rule.'};
}
function test(){
 const r=(seed,v)=>({seed,conditionalVsUniformPP:v,conditionalVsControlPP:v,uniformVsControlPP:v,
  conditionalPipsVsControl:0,conditionalMinusVsControlPP:0,controlOracleRegretPP:0,conditionalOracleRegretPP:0,
  conditionalKey:'a',uniformKey:'b',controlKey:'a',forbiddenNext:2,forbiddenOther:3,openingSwitch:false});
 const x=ci([r(1,10),r(1,30),r(2,0)],'conditionalVsUniformPP');
 if(x.deals!==2||x.positions!==3||x.mean!==10||Math.abs(x.halfWidth95-19.6)>1e-8)throw Error('deal cluster');
 const s=summarize([r(1,10),r(2,0)]);
 if(s.positions!==2||s.changedChoices!==2)throw Error('summary');
 return{passed:true,checks:3};
}
if(require.main===module){
 const args=process.argv.slice(2);
 if(args[0]==='test')console.log(JSON.stringify(test()));
 else{const fs=require('fs');console.log(JSON.stringify(analyze(args.map(p=>JSON.parse(fs.readFileSync(p,'utf8')))),null,2));}
}
module.exports={ci,summarize,analyze,test};
