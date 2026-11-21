'use strict';
// Research-only immutable snapshot verification. Unlike the normal preflight,
// this rejects SHA/size drift from the pinned 415-file source commit.
// Run: node qosha-research/simulator/verify-pinned-snapshot.js
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const research=path.resolve(__dirname,'..');
const manifestFile=path.join(research,'simulator-tree-manifest-20261121-current.json');
const errors=[];
let checked=0;
try {
  const m=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
  if(m.schema!=='qosha-simulator-tree-manifest/v1'||
     m.sourceCommit!=='ca057df2f0b164e5659332ded435d155cd285a17'||
     m.fileCount!==415||!Array.isArray(m.files)||m.files.length!==415)
    throw new Error('Unexpected pinned manifest metadata');
  const seen=new Set();
  for(const e of m.files) {
    const rel=e.path;
    if(typeof rel!=='string'||!rel.startsWith('simulator/')||
       rel.split('/').some(s=>!s||s==='.'||s==='..')||
       seen.has(rel)||!/^[0-9a-f]{40}$/.test(e.sha)||
       !Number.isSafeInteger(e.size)||e.size<0) {
      errors.push('Invalid/duplicate manifest row: '+String(rel));continue;
    }
    seen.add(rel);
    const file=path.resolve(research,rel);
    if(!file.startsWith(path.resolve(research,'simulator')+path.sep)) {
      errors.push('Escaping path: '+rel);continue;
    }
    try {
      const stat=fs.lstatSync(file);
      if(!stat.isFile()||stat.isSymbolicLink())throw new Error('not a regular file');
      const bytes=fs.readFileSync(file);
      const blob=crypto.createHash('sha1').update('blob '+bytes.length+String.fromCharCode(0)).update(bytes).digest('hex');
      if(bytes.length!==e.size||blob!==e.sha)
        errors.push('Pinned blob drift: '+rel);
      else checked++;
    } catch(err) {errors.push('Missing/unreadable: '+rel+' ('+err.message+')');}
  }
} catch(err) {errors.push('Manifest unavailable/invalid: '+err.message);}
const report={schema:'qosha-pinned-snapshot-verification/v1',
  sourceCommit:'ca057df2f0b164e5659332ded435d155cd285a17',
  expected:415,verified:checked,errors,passed:errors.length===0&&checked===415,
  note:'Verifies only pinned 415 files; newer research changes need a separate manifest. This is not a gameplay validation gate.'};
console.log(JSON.stringify(report,null,2));
if(!report.passed)process.exitCode=1;
