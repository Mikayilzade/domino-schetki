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
// Historical pinned inventory is a minimum baseline, not the current complete
// manifest. Expose additions explicitly so recovery tooling cannot mistake
// a 387-file snapshot for the full current simulator.
const currentInputNames=new Set(inputFiles);
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
// Historical pinned inventory closes the unreferenced-file gap: dependency
// closure and syntax checks cannot detect an entirely omitted standalone module.
// This is a presence check only; later legitimate edits do not fail this gate.
const pinnedInventory=path.resolve(root,'..','simulator-checkout-inventory-2026-11-14.md');
let pinnedEntries=0;
if(!fs.existsSync(pinnedInventory)) missing.add('simulator-checkout-inventory-2026-11-14.md');
else {
  const inventoryText=fs.readFileSync(pinnedInventory,'utf8');
  const matches=[...inventoryText.matchAll(/^\x60(qosha-research\/simulator\/[^\x60\r\n]+)\x60 ([0-9a-f]{40}) (\d+)$/gm)];
  pinnedEntries=matches.length;
  if(pinnedEntries!==387) invalid.push('Pinned inventory count mismatch: '+pinnedEntries+' (expected 387)');
  const pinnedNames=new Set();
  for(const match of matches) {
    const name=match[1].slice('qosha-research/simulator/'.length);
    if(pinnedNames.has(name)) invalid.push('Duplicate pinned entry: '+name);
    pinnedNames.add(name);
    const full=path.resolve(root,name);
    if(!full.startsWith(root+path.sep)||name.split('/').some(x=>!x||x==='.'||x==='..')) {
      invalid.push('Unsafe pinned path: '+name);continue;
    }
    // Reject symlinked ancestor directories too: lstat(full) alone follows
    // a parent symlink and can incorrectly accept a file outside this tree.
    let ancestor=root;
    let unsafeAncestor=false;
    for(const part of name.split('/').slice(0,-1)) {
      ancestor=path.join(ancestor,part);
      if(fs.existsSync(ancestor)&&fs.lstatSync(ancestor).isSymbolicLink()) {
        invalid.push('Symlinked pinned ancestor: '+name);
        unsafeAncestor=true;
        break;
      }
    }
    if(unsafeAncestor) continue;
    if(!fs.existsSync(full)) missing.add('simulator/'+name);
    else if(!fs.lstatSync(full).isFile()||fs.lstatSync(full).isSymbolicLink()) invalid.push('Nonregular pinned file: '+name);
  }
}
// Use the same inventory row pattern as the presence check. The earlier double-escaped
// regex matched literal backslashes and silently reported zero provenance drift.
// Audit historical blob provenance without rejecting intentional post-snapshot edits.
// Git blob IDs are SHA-1 of "blob <byteLength>\\0" followed by raw bytes.
const pinnedDrift=[];
if(fs.existsSync(pinnedInventory)) {
  const inventoryText=fs.readFileSync(pinnedInventory,'utf8');
  const rows=[...inventoryText.matchAll(/^\x60(qosha-research\/simulator\/[^\x60\r\n]+)\x60 ([0-9a-f]{40}) (\d+)$/gm)];
  for(const row of rows) {
    const name=row[1].slice('qosha-research/simulator/'.length);
    const full=path.resolve(root,name);
    if(!full.startsWith(root+path.sep)||name.split('/').some(x=>!x||x==='.'||x==='..'))continue;
    let current=root,unsafe=false;
    for(const part of name.split('/')) {
      current=path.join(current,part);
      if(!fs.existsSync(current)||fs.lstatSync(current).isSymbolicLink()){unsafe=true;break;}
    }
    if(unsafe||!fs.lstatSync(full).isFile())continue;
    const bytes=fs.readFileSync(full);
    const actual=crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
    if(actual!==row[2]||bytes.length!==Number(row[3]))
      pinnedDrift.push({path:name,pinnedBlob:row[2],actualBlob:actual,pinnedBytes:Number(row[3]),actualBytes:bytes.length});
  }
}
const pinnedNameRows=fs.existsSync(pinnedInventory)
  ? [...fs.readFileSync(pinnedInventory,'utf8').matchAll(/^\x60qosha-research\/simulator\/([^\x60\r\n]+)\x60 [0-9a-f]{40} \d+$/gm)]
      .map(row=>row[1]) : [];
const pinnedNameSet=new Set(pinnedNameRows);
const unpinnedInputs=inputFiles.filter(name=>!pinnedNameSet.has(name));
const pinnedMissingFromCurrent=pinnedNameRows.filter(name=>!currentInputNames.has(name));
const requiredMissing=[...missing].sort();
const report={schema:'qosha-checkout-preflight/v1',passed:requiredMissing.length===0&&invalid.length===0,expectedSuites:17,missing:requiredMissing,invalid,visitedFiles:visited.size,pinnedInventoryEntries:pinnedEntries,unpinnedInputCount:unpinnedInputs.length,unpinnedInputs,pinnedMissingFromCurrent,pinnedDriftCount:pinnedDrift.length,pinnedDrift,simulatorInputs:inputFiles.length,simulatorJsonFiles:inputFiles.filter(x=>x.endsWith('.json')).length,simulatorJsSyntaxChecked:inputFiles.filter(x=>x.endsWith('.js')).length,sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),limitation:'Recursive simulator JS literal-relative-require closure, historical pinned inventory presence, explicit unpinned-file diagnostics plus nonblocking Git blob SHA-1 drift audit, plus JS/JSON presence, symlink, in-process CommonJS JS parse and JSON syntax checks. Does not execute suites, verify dynamic imports, or authenticate physical rules.'};
console.log(JSON.stringify(report,null,2));
if(!report.passed)process.exitCode=1;
