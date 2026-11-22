'use strict';
// Self-contained regression for the exact-path Git blob verifier.
// Run: node qosha-research/simulator/verify-current-tree-manifest-regression.js
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {verify}=require('./verify-current-tree-manifest');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'qosha-verify-'));
const dir=path.join(root,'qosha-research','simulator');
const file=path.join(dir,'fixture.js');
const blob=b=>crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
try {
 fs.mkdirSync(dir,{recursive:true});
 const data=Buffer.from('module.exports = 1;\n');fs.writeFileSync(file,data);
 const manifest={schema:'qosha-simulator-tree-manifest/v1',scope:'qosha-research/simulator/',sourceCommit:'a'.repeat(40),fileCount:1,files:[{path:'simulator/fixture.js',sha:blob(data),size:data.length}]};
 const check=m=>verify(root,m);
 assert.equal(check(manifest).passed,true,'exact manifest should pass');
 fs.writeFileSync(file,'module.exports = 2;\n');
 assert.equal(check(manifest).passed,false,'mutated blob must fail');
 fs.writeFileSync(file,data);
 fs.writeFileSync(path.join(dir,'extra.js'),'');
 assert.equal(check(manifest).passed,false,'unexpected file must fail');
 fs.unlinkSync(path.join(dir,'extra.js'));
 fs.unlinkSync(file);
 assert.equal(check(manifest).passed,false,'missing file must fail');
 fs.writeFileSync(file,data);
 const bad={...manifest,files:[{...manifest.files[0],path:'simulator/../escape.js'}]};
 assert.equal(check(bad).passed,false,'path traversal must fail');
 const incomplete={...manifest,fileCount:2};
 assert.equal(check(incomplete).passed,false,'incomplete manifest must fail');
 if(process.platform!=='win32'){
  fs.symlinkSync(file,path.join(dir,'alias.js'));
  assert.equal(check(manifest).passed,false,'symlink must fail');
  fs.unlinkSync(path.join(dir,'alias.js'));
 }
 assert.equal(check(manifest).passed,true,'restored exact tree should pass');
 console.log(JSON.stringify({passed:true,checks:7,fixture:'synthetic',gameplayValidated:false}));
} finally {fs.rmSync(root,{recursive:true,force:true});}
