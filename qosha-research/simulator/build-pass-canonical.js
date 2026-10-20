'use strict';
// Rebuild a canonical branch-label-invariant pass runner from the persisted baseline.
// Run: node qosha-research/simulator/build-pass-canonical.js
// Then: node qosha-research/simulator/joint-pass-memory-canonical.js test
// Then: node qosha-research/simulator/joint-pass-memory-canonical.js 1308400 48 20,28
const fs=require('node:fs'),path=require('node:path');
const src=path.join(__dirname,'joint-pass-memory-runner.js');
const dst=path.join(__dirname,'joint-pass-memory-canonical.js');
let s=fs.readFileSync(src,'utf8');
function patch(before,after){
 if(s.split(before).length!==2)throw Error('expected one exact patch target: '+before.slice(0,65));
 s=s.replace(before,after);
}
patch("const init=require('./initializer'),{chooseBy}=require('./strategy-runner'),{pass}=require('./joint-pass-exact');",
"const init=require('./initializer'),{chooseBy}=require('./strategy-runner'),{pass}=require('./joint-pass-exact');\nconst {chooseCanonical,signature}=require('../runs/2026-10-20-2352-canonical-geometry');".replace('\\n','\n'));
patch("scored.sort((a,b)=>b.score-a.score||b.pips-a.pips||key(a.action).localeCompare(key(b.action)));",
"scored.sort((a,b)=>b.score-a.score||b.pips-a.pips||signature(state,a.action).localeCompare(signature(state,b.action))||key(a.action).localeCompare(key(b.action)));");
patch("}else action=chooseBy(profile,opts);","}else action=chooseCanonical(profile,opts,state);");
patch("schema:'qosa-joint-pass-memory/v1'","schema:'qosa-joint-pass-memory-canonical/v1'");
fs.writeFileSync(dst,s,'utf8');
console.log('Generated '+dst);
