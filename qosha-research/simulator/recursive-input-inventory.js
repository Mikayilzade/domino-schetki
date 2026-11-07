'use strict';
// Research-only recursive inventory audit. Run from any directory:
// node qosha-research/simulator/recursive-input-inventory.js
// No writes. Complements (does not replace) validation-gate.js.
const fs=require('node:fs'), path=require('node:path'), crypto=require('node:crypto');
const root=__dirname;
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function walk(dir, prefix='') {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
    const rel=prefix?prefix+'/'+e.name:e.name, abs=path.join(dir,e.name);
    if(e.isSymbolicLink()) throw Error('symlink not permitted in evidence inventory: '+rel);
    if(e.isDirectory()) return walk(abs,rel);
    if(!e.isFile()) throw Error('unexpected entry type: '+rel);
    return /\.(?:js|json)$/i.test(e.name)?[rel]:[];
  });
}
const names=walk(root).sort();
const hashes=Object.fromEntries(names.map(n=>[n,hash(fs.readFileSync(path.join(root,n)))]));
const legacy=fs.readdirSync(root).filter(n=>n.endsWith('.js')).sort();
const untracked=names.filter(n=>!legacy.includes(n));
const report={schema:'qosha-recursive-input-inventory/v1',engine:'qosha-research-0.5.3',
  files:names.length,legacyTopLevelJs:legacy.length,
  additionalFiles:untracked,recursiveManifestSha256:hash(JSON.stringify(hashes)),
  additionalBeyondLegacy:untracked.length,
  gateInventoryMode:'recursive JS/JSON (validation-gate.js)',
  validationStatus:'inventory-only; recursive gate hashes all listed JS/JSON; 17 suites must still execute and pass'};
console.log(JSON.stringify(report,null,2));
// Additional nested or JSON files are expected and already covered by the recursive gate.
// This standalone inventory is diagnostic, not a second executable validation gate.
