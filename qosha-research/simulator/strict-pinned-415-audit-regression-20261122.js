'use strict';
// Self-contained regression for the strict pinned 415-blob verifier.
// Does not require a repository checkout or modify any live scoreboard files.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const {audit}=require('./strict-pinned-415-audit-20261122');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'qosha-415-audit-'));
const sha=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
const rows=[];
try {
  const sim=path.join(temp,'simulator');
  fs.mkdirSync(sim);
  for(let i=0;i<415;i++){
    const name='fixture-'+String(i).padStart(3,'0')+'.js';
    const bytes=Buffer.from('// pinned fixture '+i+'\n');
    fs.writeFileSync(path.join(sim,name),bytes);
    rows.push({path:'simulator/'+name,sha:sha(bytes),size:bytes.length});
  }
  const manifest=path.join(temp,'manifest.json');
  const meta={schema:'qosha-simulator-tree-manifest/v1',
    sourceCommit:'ca057df2f0b164e5659332ded435d155cd285a17',
    scope:'qosha-research/simulator/',fileCount:415,files:rows};
  const save=()=>fs.writeFileSync(manifest,JSON.stringify(meta));
  const run=()=>audit(temp,manifest);
  save();assert.equal(run().ok,true,'intact snapshot must pass');
  const target=path.join(sim,'fixture-000.js');
  fs.appendFileSync(target,'// corruption\n');
  assert(run().failures.some(f=>f.reason==='blob mismatch'),'changed blob rejected');
  fs.writeFileSync(target,'// pinned fixture 0\n');
  fs.unlinkSync(target);
  assert(run().failures.some(f=>f.reason==='missing'),'missing blob rejected');
  fs.symlinkSync(path.join(sim,'fixture-001.js'),target);
  assert(run().failures.some(f=>f.reason==='symlink'),'symlink rejected');
  fs.unlinkSync(target);
  fs.symlinkSync(path.join(sim,'nonexistent-fixture.js'),target);
  assert(run().failures.some(f=>f.reason==='symlink'),'dangling symlink rejected as symlink');
  fs.unlinkSync(target);
  fs.writeFileSync(target,'// pinned fixture 0\n');
  const extra=path.join(sim,'unlisted-extra.js');
  fs.writeFileSync(extra,'// unlisted\\n');
  assert(run().failures.some(f=>f.reason==='unexpected file'),'unlisted file rejected');
  fs.unlinkSync(extra);
  meta.files[1]={...meta.files[1],path:meta.files[0].path};
  save();
  assert(run().failures.some(f=>f.reason==='invalid manifest row'),'duplicate path rejected');
  meta.files[1]=rows[1];meta.files[2]={...rows[2],path:'simulator/../outside.js'};
  save();
  assert(run().failures.some(f=>f.reason==='invalid manifest row'),'traversal rejected');
  meta.files[2]=rows[2];meta.sourceCommit='not-pinned';save();
  assert.throws(run,/Unexpected pinned manifest metadata/,'wrong source commit rejected');
  console.log(JSON.stringify({schema:'qosha-strict-pinned-415-audit-regression/v1',
    passed:true,syntheticFiles:415,checks:9,gameplayDeals:0}));
}finally{fs.rmSync(temp,{recursive:true,force:true});}
