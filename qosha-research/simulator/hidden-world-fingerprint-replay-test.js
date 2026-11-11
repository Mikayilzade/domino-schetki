'use strict';
// Independent reproducibility check for the Monte Carlo allocation gate.
// Run from any directory: node qosha-research/simulator/hidden-world-fingerprint-replay-test.js
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=__dirname;
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function enumerate(dir,prefix=''){
  const out=[];
  for(const name of fs.readdirSync(dir)){
    const rel=prefix?prefix+'/'+name:name;
    const full=path.join(dir,name),st=fs.lstatSync(full);
    assert.equal(st.isSymbolicLink(),false,'symlink: '+rel);
    if(st.isDirectory())out.push(...enumerate(full,rel));
    else if(st.isFile()&&/\.(js|json)$/.test(name))out.push(rel);
  }
  return out.sort();
}
function execute(){
  const run=spawnSync(process.execPath,[path.join(root,'hidden-world-validation-gate.js')],
    {encoding:'utf8',timeout:120000+4*120000+60000,maxBuffer:32*1024*1024});
  if(run.error)throw run.error;
  const report=JSON.parse(run.stdout);
  assert.equal(report.schema,'qosha-hidden-world-validation-gate/v1');
  const sources=Object.fromEntries(enumerate(root).map(n=>[n,hash(fs.readFileSync(path.join(root,n)))]));
  assert.deepEqual(report.sourceHashes,sources);
  assert.equal(report.sourceManifestSha256,hash(JSON.stringify(sources)));
  const contracts=Object.fromEntries(['README.md','RULES.md','EXPERIMENTS.md'].map(n=>
    [n,hash(fs.readFileSync(path.join(root,'..',n)))]));
  assert.deepEqual(report.contractHashes,contracts);
  assert.equal(report.contractManifestSha256,hash(JSON.stringify(contracts)));
  assert.deepEqual(report.suites.map(x=>x.name),[
    'hidden-world-test.js','hidden-world-seat-stock-regression-test.js',
    'hidden-world-enumeration-test.js','hidden-world-empirical-oracle-test.js']);
  const stable={
    schema:report.schema,engine:report.engine,rules:report.rules,
    seedSets:report.seedSets,strategyDeals:report.strategyDeals,
    sourceManifestSha256:report.sourceManifestSha256,
    contractManifestSha256:report.contractManifestSha256,
    preflight:{passed:report.preflight.passed,exitCode:report.preflight.exitCode,
      signal:report.preflight.signal,summary:report.preflight.summary},
    suites:report.suites.map(({name,sha256,passed,skipped,exitCode,signal,evidence,error})=>
      ({name,sha256:sha256||null,passed,skipped:!!skipped,exitCode:exitCode??null,
        signal:signal||null,evidence:evidence??null,error:error||null}))
  };
  assert.equal(report.validationFingerprintSha256,hash(JSON.stringify(stable)));
  assert.equal(report.reportSha256,hash(JSON.stringify({...report,reportSha256:null})));
  assert.notEqual(hash(JSON.stringify({...stable,strategyDeals:1})),report.validationFingerprintSha256);
  assert.equal(run.status,report.passed?0:1);
  return report;
}
const a=execute(),b=execute();
assert.equal(a.validationFingerprintSha256,b.validationFingerprintSha256);
assert.equal(a.sourceManifestSha256,b.sourceManifestSha256);
assert.equal(a.contractManifestSha256,b.contractManifestSha256);
assert.deepEqual(a.suites.map(x=>[x.name,x.passed,x.evidence]),b.suites.map(x=>[x.name,x.passed,x.evidence]));
console.log(JSON.stringify({schema:'qosha-hidden-world-fingerprint-replay/v1',
  passed:a.passed,replayConsistent:true,suites:a.suites.length,
  sourceManifestSha256:a.sourceManifestSha256,
  contractManifestSha256:a.contractManifestSha256,
  validationFingerprintSha256:a.validationFingerprintSha256,
  limitation:'Allocation gate replay does not validate gameplay or physical rules.'},null,2));
if(!a.passed)process.exitCode=1;
