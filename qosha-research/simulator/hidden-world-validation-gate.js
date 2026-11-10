'use strict';
// Standalone Monte Carlo allocation gate. Run separately from the 17-suite gameplay gate.
// node qosha-research/simulator/hidden-world-validation-gate.js
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const crypto=require('node:crypto');
const fs=require('node:fs');
const suites=[
  'hidden-world-test.js',
  'hidden-world-seat-stock-regression-test.js',
  'hidden-world-enumeration-test.js',
  'hidden-world-empirical-oracle-test.js'
];
const results=suites.map(name=>{
  const file=path.join(__dirname,name);
  if(!fs.existsSync(file))return {name,passed:false,error:'missing suite'};
  const sha256=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const run=spawnSync(process.execPath,[file],{encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});
  const stdout=(run.stdout||'').trim();
  let payload=null;
  try{payload=JSON.parse(stdout)}catch{}
  // The older hidden-world-test.js is assertion-based and emits a fixed success line.
  // Do not interpret arbitrary successful output as passing coverage.
  const evidence=name==='hidden-world-test.js'
    ? /^fixed-visible hidden-world regression: ok; worlds=25 candidates=\d+$/.test(stdout)
    : name==='hidden-world-seat-stock-regression-test.js'
      ? payload?.status==='passed'&&payload?.checks===300
      : name==='hidden-world-enumeration-test.js'
        ? payload?.passed===true&&payload?.exactAllocations===16800&&payload?.hashRankedSubset===128
        : payload?.passed===true&&payload?.worlds===12000&&payload?.maxAbsoluteDeviation<0.02;
  return {name,sha256,passed:run.status===0&&evidence,exitCode:run.status,
    signal:run.signal||null,spawnError:run.error?.message||null,
    evidence:payload||stdout.slice(0,1000),stderr:(run.stderr||'').slice(-2000)};
});
const report={schema:'qosha-hidden-world-validation-gate/v1',
  executedAt:new Date().toISOString(),nodeVersion:process.version,
  engine:'qosha-research-0.5.3',rules:'recovered qosa-1.0.0; allocation only',
  strategyDeals:0,seedSets:['700..724','25000000..25000099 (3 seats)','24000000..24011999'],
  suites:results,passed:results.every(r=>r.passed),
  limitations:'Does not validate gameplay, pass-history likelihood, or opponent-choice model; run gameplay validation-gate.js independently.'};
console.log(JSON.stringify(report,null,2));
if(!report.passed)process.exitCode=1;
