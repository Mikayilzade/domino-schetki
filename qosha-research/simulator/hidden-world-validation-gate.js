'use strict';
// Standalone Monte Carlo allocation gate. Run separately from the 17-suite gameplay gate.
// node qosha-research/simulator/hidden-world-validation-gate.js
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const crypto=require('node:crypto');
const fs=require('node:fs');
// Bind the Monte Carlo evidence to the actual allocator and rollout code, not
// only to unchanged test entrypoints. Use the same recursive fail-closed source
// inventory as the gameplay gate; reject symlinks outside the research tree.
function sourcePaths(dir,prefix='') {
  const found=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    const rel=prefix?prefix+'/'+entry.name:entry.name;
    if(entry.isSymbolicLink())throw new Error('Symlink in simulator source tree: '+rel);
    if(entry.isDirectory())found.push(...sourcePaths(path.join(dir,entry.name),rel));
    else if(entry.isFile()&&/\.(js|json)$/.test(entry.name))found.push(rel);
  }
  return found.sort();
}
const sourceFiles=sourcePaths(__dirname);
for(const required of ['hidden-world.js','hidden-world-validation-gate.js','hidden-world-test.js','decision-regret.js']) {
  if(!sourceFiles.includes(required))throw new Error('Missing required Monte Carlo source: '+required);
}
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const sourceHashes=Object.fromEntries(sourceFiles.map(n=>[n,hash(fs.readFileSync(path.join(__dirname,n)))]));
const sourceManifestSha256=hash(JSON.stringify(sourceHashes));
const contractHashes=Object.fromEntries(['README.md','RULES.md','EXPERIMENTS.md'].map(n=>
  [n,hash(fs.readFileSync(path.join(__dirname,'..',n)))]));
const contractManifestSha256=hash(JSON.stringify(contractHashes));
// Require the same checkout integrity preflight as the gameplay gate.
// Otherwise a Monte Carlo-only green report could conceal missing or invalid
// transitive dependencies in a partial checkout.
const preflightRun=spawnSync(process.execPath,[path.join(__dirname,'validation-checkout-preflight.js')],
  {encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});
let preflightPayload=null;
try {preflightPayload=JSON.parse(preflightRun.stdout||'');} catch {}
const preflight={passed:preflightRun.status===0&&preflightPayload?.passed===true,
  exitCode:preflightRun.status,signal:preflightRun.signal||null,
  spawnError:preflightRun.error?.message||null,summary:preflightPayload,
  stderr:(preflightRun.stderr||'').slice(-2000)};
const suites=[
  'hidden-world-test.js',
  'hidden-world-seat-stock-regression-test.js',
  'hidden-world-enumeration-test.js',
  'hidden-world-empirical-oracle-test.js'
];
const results=suites.map(name=>{
  // Fail closed: an incomplete or invalid checkout must not execute tests
  // against potentially missing/mismatched transitive dependencies.
  if(!preflight.passed)return {name,passed:false,skipped:true,error:'checkout preflight failed'};
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
      ? payload?.schema==='qosha-hidden-world-seat-stock-regression/v1'&&payload?.status==='passed'&&payload?.checks===300&&payload?.seeds==='25000000..25000099'&&payload?.focalSeats?.join(',')==='0,1,2'
      : name==='hidden-world-enumeration-test.js'
        ? payload?.passed===true&&payload?.exactAllocations===16800&&payload?.hashRankedSubset===128&&payload?.seedlessReproducible===true
        : payload?.schema==='qosha-hidden-world-empirical-oracle/v1'&&payload?.passed===true&&payload?.worlds===12000&&payload?.seedStart===24000000&&payload?.seedEnd===24011999&&payload?.expected?.join(',')===[4/17,9/17,4/17].join(',')&&payload?.maxAbsoluteDeviation>=0&&payload?.maxAbsoluteDeviation<0.02&&payload?.nextSeatCounts&&Object.values(payload.nextSeatCounts).reduce((a,b)=>a+b,0)===12000;
  return {name,sha256,passed:run.status===0&&evidence,exitCode:run.status,
    signal:run.signal||null,spawnError:run.error?.message||null,
    evidence:payload||stdout.slice(0,1000),stderr:(run.stderr||'').slice(-2000)};
});
const report={schema:'qosha-hidden-world-validation-gate/v1',
  executedAt:new Date().toISOString(),nodeVersion:process.version,
  engine:'qosha-research-0.5.3',rules:'recovered qosa-1.0.0; allocation only',
  strategyDeals:0,sourceManifestSha256,sourceHashes,contractManifestSha256,contractHashes,seedSets:['700..724','25000000..25000099 (3 seats)','24000000..24011999'],
  preflight,suites:results,passed:preflight.passed&&results.every(r=>r.passed),
  limitations:'Does not validate gameplay, pass-history likelihood, or opponent-choice model; run gameplay validation-gate.js independently.'};
console.log(JSON.stringify(report,null,2));
if(!report.passed)process.exitCode=1;
