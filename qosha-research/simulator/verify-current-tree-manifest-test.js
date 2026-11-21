'use strict';
// Regression tests for exact pinned simulator tree integrity.
// Run: node qosha-research/simulator/verify-current-tree-manifest-test.js
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const {verify}=require('./verify-current-tree-manifest');
const commit='a'.repeat(40);
function blob(data){return crypto.createHash('sha1').update(Buffer.from('blob '+Buffer.byteLength(data)+'\0')).update(data).digest('hex');}
function fixture(fn){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'qosha-verify-'));
  const dir=path.join(root,'qosha-research','simulator');
  fs.mkdirSync(dir,{recursive:true});
  const data='module.exports=42;\n';
  fs.writeFileSync(path.join(dir,'engine.js'),data);
  const manifest={schema:'qosha-simulator-tree-manifest/v1',sourceCommit:commit,scope:'qosha-research/simulator/',fileCount:1,files:[{path:'simulator/engine.js',sha:blob(data),size:Buffer.byteLength(data)}]};
  try{fn({root,dir,manifest});}finally{fs.rmSync(root,{recursive:true,force:true});}
}
test('exact blob and path set passes',()=>fixture(({root,manifest})=>assert.equal(verify(root,manifest).passed,true)));
test('modified bytes with same length fail',()=>fixture(({root,dir,manifest})=>{fs.writeFileSync(path.join(dir,'engine.js'),'module.exports=43;\n');assert.match(verify(root,manifest).errors.join(' '),/Blob mismatch/);}));
test('unexpected file fails even when manifest count matches',()=>fixture(({root,dir,manifest})=>{fs.writeFileSync(path.join(dir,'extra.js'),'x');assert.match(verify(root,manifest).errors.join(' '),/Unexpected file/);}));
test('missing file fails',()=>fixture(({root,dir,manifest})=>{fs.unlinkSync(path.join(dir,'engine.js'));assert.match(verify(root,manifest).errors.join(' '),/Missing file/);}));
test('duplicate manifest path fails',()=>fixture(({root,manifest})=>{manifest.files.push({...manifest.files[0]});manifest.fileCount=2;assert.match(verify(root,manifest).errors.join(' '),/Invalid\/duplicate/);}));
test('incomplete metadata fails closed',()=>fixture(({root,manifest})=>{delete manifest.fileCount;assert.equal(verify(root,manifest).passed,false);}));
test('current schema requires truncated:false',()=>fixture(({root,manifest})=>{manifest.schema='qosha-current-simulator-manifest/v1';delete manifest.scope;delete manifest.fileCount;assert.equal(verify(root,manifest).passed,false);manifest.truncated=false;assert.equal(verify(root,manifest).passed,true);}));
test('symlink entry fails',()=>fixture(({root,dir,manifest})=>{try{fs.symlinkSync('engine.js',path.join(dir,'alias.js'));}catch(e){if(e.code==='EPERM'||e.code==='EACCES')return;throw e;}assert.match(verify(root,manifest).errors.join(' '),/Symlink/);}));

test('reject traversal path even when SHA is valid',()=>fixture(({root,manifest})=>{manifest.files[0].path='simulator/../engine.js';assert.equal(verify(root,manifest).passed,false);}));
test('reject unpinned source commit',()=>fixture(({root,manifest})=>{manifest.sourceCommit='HEAD';assert.equal(verify(root,manifest).passed,false);}));
test('reject manifest with truncated tree flag',()=>fixture(({root,manifest})=>{manifest.truncated=true;assert.equal(verify(root,manifest).passed,false);}));
