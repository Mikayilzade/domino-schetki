'use strict';
// Research-only executable validation gate. Run from any working directory:
// node qosha-research/simulator/validation-gate.js
// Does not modify live scoreboard or launch GitHub Actions.
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const crypto=require('node:crypto');
const root=__dirname;
const suites=[
  'opening-stock-regression.js',
  'score-minus-regression.js',
  'illegal-action-regression.js',
  'hand-order-regression.js',
  'terminal-minus-integration-test.js',
  'branch-permutation-regression.js',
  'round-conservation-regression.js'
];
const results=[];
for(const name of suites){
  const p=path.join(root,name);
  const run=spawnSync(process.execPath,[p],{encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});
  let payload=null;
  if(run.status===0){try{payload=JSON.parse(run.stdout)}catch{}}
  const ok=run.status===0&&payload?.passed===true;
  // An executable gate must reject vacuous reports, not only process exit codes.
  if(ok&&name==='hand-order-regression.js'&&!(payload.fixtures>=3&&payload.comparisons>0&&payload.transitions>0)){
    payload.passed=false;
    payload.validationError='hand-order coverage was empty';
  }
  results.push({suite:name,passed:ok&&payload?.passed===true,exitCode:run.status,signal:run.signal||null,
    summary:payload,stderr:(run.stderr||'').slice(-4000),
    stdoutParseError:run.status===0&&!payload?(run.stdout||'').slice(-1000):null});
}
const report={schema:'qosha-validation-gate/v1',engine:'qosha-research-0.5.3',
 rules:'recovered qosa-1.0.0 / 3x9 / provisional branch semantics',
 seedSet:'21000000..21000999 for conservation; opening stock seed selected by deterministic search',
 strategies:['deterministic seeded legal-action selection for invariant smoke only'],
 suites:results,passed:results.every(x=>x.passed),
 dealsExecuted:results.find(x=>x.suite==='round-conservation-regression.js')?.summary?.deals||0,
 reportSha256:crypto.createHash('sha256').update(JSON.stringify(results)).digest('hex')};
console.log(JSON.stringify(report,null,2));
if(!report.passed)process.exitCode=1;
