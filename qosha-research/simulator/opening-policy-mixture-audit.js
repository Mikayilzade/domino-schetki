'use strict';
// Reanalysis ONLY: no new deals or hidden-world allocations.
// node qosha-research/simulator/opening-policy-mixture-audit.js [test]
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const input=path.join(__dirname,'../runs/2026-10-29-1053-opening-pip-margin-holdout.json');
const near=(a,b)=>Math.abs(a-b)<1e-9;
function analyze(d){
 assert.equal(d.schema,'qosha-opening-pip-margin-holdout/v1');
 assert.equal(d.positions,600);assert.equal(d.worldsPerPosition,32);
 assert.equal(d.newHiddenAllocations,19200);
 assert.deepEqual(d.dealSeeds,[2855320,2885319]);
 assert.deepEqual(d.worldSeeds,[2885320,2904519]);
 const rows=[];
 const metric=(policy,chain,branch,bucket)=>{
  const mode=d.modes[policy+'-'+chain+'-'+branch];
  assert(mode,'missing policy/branch mode');
  const all=mode.means.relativePipMargin.delta;
  const small=mode.strata['1-2'].relativePipMarginDelta;
  const large=mode.strata['3+'].relativePipMarginDelta;
  assert.equal(mode.strata['1-2'].positions,300);
  assert.equal(mode.strata['3+'].positions,300);
  assert(near(all,(small+large)/2),'bucket means must recover overall mean');
  return bucket==='all'?all:mode.strata[bucket].relativePipMarginDelta;
 };
 for(const chain of ['single','chain'])for(const bucket of ['all','1-2','3+']){
  const v={};for(const policy of ['high','low','random']){
   const global=metric(policy,chain,'global',bucket);
   const current=metric(policy,chain,'current',bucket);
   assert(near(global,current),'provisional branch-model disagreement');
   v[policy]=global;
  }
  // Mixture weight p denotes fraction of high-pip-policy games, 1-p low-pip.
  // This is linear reweighting of already simulated policy outcomes, not a new simulation.
  const threshold=v.low>=0?0:(v.high<=0?null:-v.low/(v.high-v.low));
  if(threshold!==null)assert(threshold>=0&&threshold<=1);
  rows.push({chain,bucket,high:v.high,low:v.low,random:v.random,
   highPolicyShareBreakEven:threshold,halfHighHalfLow:(v.high+v.low)/2,
   worstOfThreePolicies:Math.min(v.high,v.low,v.random)});
 }
 return {schema:'qosha-opening-policy-mixture-audit/v1',
  source:'runs/2026-10-29-1053-opening-pip-margin-holdout.json',
  engine:d.engine,rules:d.rules,sourceDealSeeds:d.dealSeeds,sourceWorldSeeds:d.worldSeeds,
  sourceDeals:d.deals,sourceWorlds:d.newHiddenAllocations,
  newDeals:0,newWorlds:0,newCompleteRounds:0,newForcedContinuations:0,
  definition:'owned-double connector minus higher-pip connector: opponents remaining pips minus focal remaining pips after two opponent turns',
  mixture:'p*high-pip-policy+(1-p)*low-pip-policy; threshold where mean short-window margin changes sign',
  rows,limitations:['Reweighting prior observations; no independent holdout or new seeds',
   'Thresholds are descriptive and lack confidence intervals/covariance',
   'Opponent policies are synthetic, not calibrated to human behavior',
   'Starter hands selected by pip gap; connector value and double ownership confounded',
   'No first-place, minus, block, tie, 101 match or full-round conclusions',
   'Late-arrival branch interpretations remain provisional']};
}
function test(){
 const a=analyze(JSON.parse(fs.readFileSync(input,'utf8')));
 assert.equal(a.rows.length,6);
 const row=(chain,bucket)=>a.rows.find(r=>r.chain===chain&&r.bucket===bucket);
 assert(near(row('single','all').highPolicyShareBreakEven,0.3372946691461336));
 assert(near(row('chain','all').highPolicyShareBreakEven,0.16879960678657252));
 assert(near(row('single','1-2').highPolicyShareBreakEven,0.09488687331805043));
 assert(near(row('single','3+').highPolicyShareBreakEven,0.5663771829022475));
 assert.equal(row('chain','1-2').highPolicyShareBreakEven,0);
 assert(near(row('chain','3+').highPolicyShareBreakEven,0.38929663080456595));
 return {passed:true,rows:6,sourceWorldsAlreadyCounted:a.sourceWorlds,newWorlds:0};
}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():analyze(JSON.parse(fs.readFileSync(input,'utf8'))),null,2));
module.exports={analyze,test};
