'use strict';
// Research-only executable validation gate. Run from any working directory:
// node qosha-research/simulator/validation-gate.js
// Does not modify live scoreboard or launch GitHub Actions.
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const crypto=require('node:crypto');
const root=__dirname;
const fs=require('node:fs');
// Hash the entire research simulator source, not only individual test entrypoints.
// A test can pass against a changed engine while its own test-file hash stays identical.
const sourceFiles=fs.readdirSync(root).filter(n=>n.endsWith('.js')).sort();
const sourceHashes=Object.fromEntries(sourceFiles.map(n=>[n,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex')]));
const sourceManifestSha256=crypto.createHash('sha256').update(JSON.stringify(sourceHashes)).digest('hex');
// Rules and experiment contracts affect the interpretation of a green gate.
// Include them separately so a documentation/rules revision cannot be silently
// associated with a validation report generated against earlier assumptions.
const contractNames=['README.md','RULES.md','EXPERIMENTS.md','RESULTS.md'];
const contractHashes=Object.fromEntries(contractNames.map(n=>[n,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'..',n))).digest('hex')]));
const contractManifestSha256=crypto.createHash('sha256').update(JSON.stringify(contractHashes)).digest('hex');
const suites=[
  'seed-deal-regression.js',
  'opening-stock-regression.js',
  'score-minus-regression.js',
  'pure-scoring-exhaustive-test.js',
  'illegal-action-regression.js',
  'hand-order-regression.js',
  'terminal-minus-integration-test.js',
  'branch-permutation-regression.js',
  'round-conservation-regression.js',
  'initializer-redeal-conservation-audit-test.js',
  'redeal-full-round-audit-test.js'
];
const results=[];
for(const name of suites){
  const p=path.join(root,name);
  const suiteSha256=crypto.createHash('sha256').update(require('node:fs').readFileSync(p)).digest('hex');
  const run=spawnSync(process.execPath,[p],{encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});
  let payload=null;
  if(run.status===0){try{payload=JSON.parse(run.stdout)}catch{}}
  const ok=run.status===0&&payload?.passed===true;
  // Reject a successful exit that reports no meaningful coverage. Each suite
  // has its own contract; do not infer validation from a generic "passed" flag.
  const coverage={
    'seed-deal-regression.js': p=>p.schema==='qosha-seed-deal-regression/v1'&&p.deals===1024&&p.seeds?.[0]===22000000&&p.seeds?.[1]===22001023&&p.uniqueDeals>1000&&p.stockOpening>=0,
    'opening-stock-regression.js': p=>p.firstRoundRedeal===true&&p.missingWinnerUnresolved===true&&p.previousWinnerCases?.length===3,
    'pure-scoring-exhaustive-test.js': p=>p.schema==='qosha-pure-scoring-exhaustive/v1'&&p.deals===0&&p.minusCases===98&&p.nonDoubleCases===7609&&p.floorCases===11211,
    'score-minus-regression.js': p=>p.minusCases>=8&&p.floorCases>=4&&p.terminalCases>=3&&[-10,-20,-30,-40].every(n=>p.minusValues?.includes(n)),
    'illegal-action-regression.js': p=>p.negativeCases>=8&&p.positiveControls>=1,
    'hand-order-regression.js': p=>p.fixtures>=3&&p.comparisons>0&&p.transitions>0,
    'terminal-minus-integration-test.js': p=>p.terminalFixtures>=5&&p.verifiedTerminalActions>=5&&p.nonTerminalPrefixFixtures>=1&&[-10,-20,-30,-40].every(n=>p.minusValues?.includes(n)),
    'branch-permutation-regression.js': p=>p.fixtures>=4&&p.permutations===96&&p.actionTransitions>0&&p.coverageVerified===true,
    'round-conservation-regression.js': p=>p.deals===1000&&p.stockFixtures>=3&&Array.isArray(p.seeds)&&p.seeds[0]===21000000&&p.seeds[1]===21000999&&Number.isFinite(p.meanTurns)&&p.meanTurns>0,
    'initializer-redeal-conservation-audit-test.js': p=>p.seedDraws===24&&p.uniqueAllocations===24&&p.previousWinnerInitializations===72&&p.assertions>0,
    'redeal-full-round-audit-test.js': p=>p.rounds===24&&p.transitions>0&&p.inventorySnapshots===p.transitions+p.rounds&&p.assertions>0
  };
  if(ok&&!coverage[name]?.(payload)){
    payload.passed=false;
    payload.validationError='suite coverage contract not satisfied';
  }
  results.push({suite:name,suiteSha256,passed:ok&&payload?.passed===true,exitCode:run.status,signal:run.signal||null,
    summary:payload,stderr:(run.stderr||'').slice(-4000),
    stdoutParseError:run.status===0&&!payload?(run.stdout||'').slice(-1000):null});
}
const report={schema:'qosha-validation-gate/v1',executedAt:new Date().toISOString(),nodeVersion:process.version,engine:'qosha-research-0.5.3',
 rules:'recovered qosa-1.0.0 / 3x9 / provisional branch semantics',
 seedSet:'21000000..21000999 for conservation; opening stock seed selected by deterministic search',
 strategies:['deterministic seeded legal-action selection for invariant smoke only'],
 sourceManifestSha256,sourceHashes,contractManifestSha256,contractHashes,suites:results,passed:results.every(x=>x.passed),
 dealsExecuted:results.find(x=>x.suite==='round-conservation-regression.js')?.summary?.deals||0,
 reportSha256:crypto.createHash('sha256').update(JSON.stringify(results)).digest('hex')};
console.log(JSON.stringify(report,null,2));
if(!report.passed)process.exitCode=1;
