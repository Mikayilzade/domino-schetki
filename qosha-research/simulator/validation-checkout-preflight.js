'use strict';
// Research-only preflight: fail closed when a checkout is incomplete.
// node qosha-research/simulator/validation-checkout-preflight.js
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const vm=require('node:vm');
const Module=require('node:module');
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
// Independently inspect every nested simulator JS/JSON input, not only files
// reachable through literal require() from the 17 suite entrypoints.
const inputFiles=[];
function inspectInputs(dir) {
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    const full=path.join(dir,entry.name);
    const relative=path.relative(root,full).split(path.sep).join('/');
    if(entry.isSymbolicLink()) {invalid.push('Simulator input symlink: '+relative);continue;}
    if(entry.isDirectory()) {inspectInputs(full);continue;}
    if(!entry.isFile()) {invalid.push('Unexpected simulator entry: '+relative);continue;}
    if(!/\.(?:js|json)$/.test(entry.name)) continue;
    inputFiles.push(relative);
    if(entry.name.endsWith('.js')) {
      // Syntax-check every JS file, including unreferenced nested modules, in-process.
      // This is a parse check only; no game logic or top-level module code runs.
      // Parse in-process as CommonJS, without executing any module code.
      // Avoid one Node startup per file: hundreds of child processes can
      // exceed the outer gate's 120s preflight timeout on slower machines.
      try {
        // Node's CommonJS loader accepts a leading hashbang; Module.wrap alone
        // places it inside a function where vm.Script rejects it. Strip only
        // the initial hashbang, matching the loader's parse allowance.
        const source=fs.readFileSync(full,'utf8').replace(/^#![^\r\n]*/, '');
        new vm.Script(Module.wrap(source),{filename:full});
      }
      catch(e) { invalid.push('Invalid simulator JS: '+relative+' ('+String(e.message).slice(-500)+')'); }
    }
    if(entry.name.endsWith('.json')) {
      try {JSON.parse(fs.readFileSync(full,'utf8'));}
      catch(e) {invalid.push('Invalid simulator JSON: '+relative+' ('+e.message+')');}
    }
  }
}
inspectInputs(root);
// Check literal relative dependency closure for every simulator JS input, including
// utilities not reached from the 17 suite entrypoints. Syntax alone cannot
// detect a missing require target in an otherwise valid unreferenced module.
for(const relative of inputFiles.filter(n=>n.endsWith('.js'))) walk(path.join(root,relative));
inputFiles.sort();
if(inputFiles.length<17) invalid.push('Incomplete simulator input inventory: '+inputFiles.length);
for(const required of ['validation-gate.js','validation-fingerprint-replay-test.js',
  'hidden-world-validation-gate.js','hidden-world-fingerprint-replay-test.js',
  'validation-checkout-preflight.js','round-driver.js','initializer.js']) {
  if(!inputFiles.includes(required)) invalid.push('Missing required simulator input: '+required);
}
for(const f of contracts)walk(path.join(root,'..',f));
for(const f of ['validation-gate.js','validation-fingerprint-replay-test.js',
  'hidden-world-validation-gate.js','hidden-world-fingerprint-replay-test.js',
  ...suites])walk(path.join(root,f));
const requiredMissing=[...missing].sort();
const report={schema:'qosha-checkout-preflight/v1',passed:requiredMissing.length===0&&invalid.length===0,expectedSuites:17,missing:requiredMissing,invalid,visitedFiles:visited.size,simulatorInputs:inputFiles.length,simulatorJsonFiles:inputFiles.filter(x=>x.endsWith('.json')).length,simulatorJsSyntaxChecked:inputFiles.filter(x=>x.endsWith('.js')).length,sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),limitation:'Recursive simulator JS literal-relative-require closure plus JS/JSON presence, symlink, in-process CommonJS JS parse and JSON syntax checks. Does not execute suites, verify dynamic imports, or authenticate physical rules.'};
console.log(JSON.stringify(report,null,2));
if(!report.passed)process.exitCode=1;
