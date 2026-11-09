'use strict';
// Static structural audit only; DOES NOT run any gameplay validation suite.
// Run: node qosha-research/simulator/validation-gate-contract-audit.js
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const gate=fs.readFileSync(path.join(__dirname,'validation-gate.js'),'utf8');
const preflight=fs.readFileSync(path.join(__dirname,'validation-checkout-preflight.js'),'utf8');
function list(src,start,end){
  const a=src.indexOf(start),b=src.indexOf(end,a+start.length);
  assert(a>=0&&b>a,'suite list boundaries not found');
  return [...src.slice(a,b).matchAll(/'([^']+\.js)'/g)].map(x=>x[1]);
}
const suites=list(gate,'const suites=[','];\nconst results=');
const required=list(preflight,'const suites=[','];\nconst visited=');
const coverageSection=gate.slice(gate.indexOf('const coverage={'),gate.indexOf('};\n  if(ok',gate.indexOf('const coverage={')));
const coverage=[...coverageSection.matchAll(/'([^']+\.js)':\s*p\s*=>/g)].map(x=>x[1]);
assert.equal(suites.length,17);
assert.equal(new Set(suites).size,17,'duplicate gate suites');
assert.deepEqual([...suites].sort(),[...required].sort(),'preflight and gate disagree');
assert.deepEqual([...suites].sort(),[...coverage].sort(),'missing or extra coverage contract');
for(const name of suites) assert(fs.statSync(path.join(__dirname,name)).isFile(),'missing suite '+name);
console.log(JSON.stringify({schema:'qosha-gate-contract-static-audit/v1',passed:true,suites:suites.length,coverageContracts:coverage.length,preflightSuites:required.length,deals:0,limitation:'Static structural check only; does not execute the 17 suites or validate physical rules.'},null,2));
