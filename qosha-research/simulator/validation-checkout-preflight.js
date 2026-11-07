'use strict';
// Research-only preflight: fail closed when a checkout is incomplete.
// node qosha-research/simulator/validation-checkout-preflight.js
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=__dirname;
const contracts=['README.md','RULES.md','EXPERIMENTS.md','RESULTS.md'];
const suites=['seed-deal-regression.js','five-player-deal-regression.js','four-branch-lock-kernel-test.js','draw-enabled-action-contract-test.js','mixed-finish-exhaustive-contract-test.js','opening-stock-regression.js','specific-double-starter-test.js','score-minus-regression.js','block-boundary-regression.js','pure-scoring-exhaustive-test.js','illegal-action-regression.js','hand-order-regression.js','terminal-minus-integration-test.js','branch-permutation-regression.js','round-conservation-regression.js','initializer-redeal-conservation-audit-test.js','redeal-full-round-audit-test.js'];
const visited=new Set(),missing=new Set(),invalid=[];
function walk(file){
  if(visited.has(file))return;
  visited.add(file);
  const researchRoot=path.resolve(root,'..');
  const relative=path.relative(researchRoot,file);
  if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative)){
    invalid.push('Dependency escapes research directory: '+file);return;
  }
  if(!fs.existsSync(file)){missing.add(relative);return;}
  const stat=fs.lstatSync(file);
  if(stat.isSymbolicLink()||!stat.isFile()){
    invalid.push('Not a regular file: '+relative);return;
  }
  // Markdown contracts and JSON data are checked for presence, not parsed as JS.
  if(!file.endsWith('.js')&&!file.endsWith('.cjs'))return;
  const source=fs.readFileSync(file,'utf8');
  // Static CommonJS relative requires only; computed imports are not assumed resolved.
  const re=/\brequire\s*\(\s*['"]((?:\.\.?\/)[^'"]+)['"]\s*\)/g;
  for(const match of source.matchAll(re)){
    const base=path.resolve(path.dirname(file),match[1]);
    const resolved=[base,base+'.js',base+'.json',path.join(base,'index.js')]
      .find(candidate=>fs.existsSync(candidate)&&fs.lstatSync(candidate).isFile());
    if(!resolved){missing.add(path.relative(path.join(root,'..'),base));continue;}
    walk(resolved);
  }
}
for(const f of contracts)walk(path.join(root,'..',f));
for(const f of ['validation-gate.js','validation-fingerprint-replay-test.js',...suites])walk(path.join(root,f));
const requiredMissing=[...missing].sort();
const report={schema:'qosha-checkout-preflight/v1',passed:requiredMissing.length===0&&invalid.length===0,expectedSuites:17,missing:requiredMissing,invalid,visitedFiles:visited.size,sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),limitation:'Static relative require closure only; rejects symlinks and dependencies outside research tree. Does not execute suites, verify dynamic imports, or authenticate physical rules.'};
console.log(JSON.stringify(report,null,2));
if(!report.passed)process.exitCode=1;
