'use strict';
// Standalone exact-path/blob verifier. Usage:
// node verify-current-tree-manifest.js <checkout-root> <manifest.json>
// Supports both qosha-current-simulator-manifest/v1 (truncated:false) and
// qosha-simulator-tree-manifest/v1 (scope + exact fileCount).
// Both require sourceCommit (40 hex), files [{path,sha,size}].
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function verify(root,manifest){
  const errors=[];
  const supportedSchema=manifest.schema==='qosha-current-simulator-manifest/v1'||
    manifest.schema==='qosha-simulator-tree-manifest/v1';
  const complete=manifest.truncated===false||
    (manifest.schema==='qosha-simulator-tree-manifest/v1'&&
     manifest.scope==='qosha-research/simulator/'&&
     Number.isSafeInteger(manifest.fileCount)&&manifest.fileCount===manifest.files?.length);
  if(!supportedSchema||
     !/^[a-f0-9]{40}$/.test(manifest.sourceCommit||'')||
     !complete||!Array.isArray(manifest.files)||!manifest.files.length)
    return {passed:false,errors:['Invalid or unverified complete manifest metadata']};
  const expected=new Map();
  for(const f of manifest.files){
    const name=f.path;
    if(typeof name!=='string'||!name.startsWith('simulator/')||
       name.split('/').some(x=>!x||x==='.'||x==='..')||
       !/^[a-f0-9]{40}$/.test(f.sha||'')||!Number.isSafeInteger(f.size)||f.size<0||expected.has(name)){
      errors.push('Invalid/duplicate manifest entry '+String(name));continue;
    }
    expected.set(name,f);
  }
  const found=new Set();
  function visit(dir,relative){
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
      const rel=relative?relative+'/'+entry.name:entry.name;
      const full=path.join(dir,entry.name);
      if(entry.isSymbolicLink()){errors.push('Symlink '+rel);continue;}
      if(entry.isDirectory()){visit(full,rel);continue;}
      if(!entry.isFile()){errors.push('Non-file '+rel);continue;}
      const name='simulator/'+rel;found.add(name);
      if(!expected.has(name)){errors.push('Unexpected file '+name);continue;}
      const data=fs.readFileSync(full),f=expected.get(name);
      const sha=crypto.createHash('sha1').update(Buffer.from('blob '+data.length+'\0')).update(data).digest('hex');
      if(data.length!==f.size||sha!==f.sha)errors.push('Blob mismatch '+name);
    }
  }
  const sim=path.join(root,'qosha-research','simulator');
  if(!fs.existsSync(sim)||!fs.lstatSync(sim).isDirectory()||fs.lstatSync(sim).isSymbolicLink())
    errors.push('Missing/unsafe simulator directory');
  else visit(sim,'');
  for(const name of expected.keys())if(!found.has(name))errors.push('Missing file '+name);
  return {passed:errors.length===0,sourceCommit:manifest.sourceCommit,expected:expected.size,found:found.size,errors};
}
if(require.main===module){
  const [root,file]=process.argv.slice(2);
  if(!root||!file){console.error('Usage: node verify-current-tree-manifest.js <checkout-root> <manifest.json>');process.exit(2);}
  const result=verify(path.resolve(root),JSON.parse(fs.readFileSync(file,'utf8')));
  console.log(JSON.stringify(result,null,2));if(!result.passed)process.exitCode=1;
}
module.exports={verify};
