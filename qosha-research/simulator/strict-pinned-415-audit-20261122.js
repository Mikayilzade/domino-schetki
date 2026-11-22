'use strict';
// Strict immutable-snapshot audit. Run against a checkout of the manifest's sourceCommit,
// NOT against moving main; later legitimate edits will be reported as drift.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const manifestPath=path.join(root,'simulator-tree-manifest-20261121-current.json');
function audit(base=root, manifestFile=manifestPath) {
  const m=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
  if(m.schema!=='qosha-simulator-tree-manifest/v1'||
     m.sourceCommit!=='ca057df2f0b164e5659332ded435d155cd285a17'||
     m.scope!=='qosha-research/simulator/'||
     m.fileCount!==415||!Array.isArray(m.files)||m.files.length!==415)
    throw Error('Unexpected pinned manifest metadata');
  const seen=new Set(), failures=[];
  for(const row of m.files) {
    const rel=row.path;
    if(typeof rel!=='string'||!rel.startsWith('simulator/')||
       rel.split('/').some(p=>!p||p==='.'||p==='..')||
       !/^[0-9a-f]{40}$/.test(row.sha)||
       !Number.isSafeInteger(row.size)||row.size<0||seen.has(rel)) {
      failures.push({path:String(rel),reason:'invalid manifest row'});continue;
    }
    seen.add(rel);
    let cur=base,unsafe=false;
    for(const segment of rel.split('/')) {
      cur=path.join(cur,segment);
      let stat;
      try { stat=fs.lstatSync(cur); }
      catch(e) { if(e.code!=='ENOENT')throw e; failures.push({path:rel,reason:'missing'});unsafe=true;break; }
      if(stat.isSymbolicLink()){failures.push({path:rel,reason:'symlink'});unsafe=true;break;}
    }
    if(unsafe)continue;
    if(!fs.statSync(cur).isFile()){failures.push({path:rel,reason:'nonregular'});continue;}
    const b=fs.readFileSync(cur);
    const sha=crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
    if(b.length!==row.size||sha!==row.sha)
      failures.push({path:rel,reason:'blob mismatch',expected:row.sha,actual:sha});
  }
  return {ok:failures.length===0,sourceCommit:m.sourceCommit,checked:seen.size,failures};
}
if(require.main===module) {
  try {
    const result=audit();
    process.stdout.write(JSON.stringify(result,null,2)+'\n');
    if(!result.ok)process.exitCode=1;
  }catch(e){process.stderr.write(String(e.stack||e)+'\n');process.exitCode=2;}
}
module.exports={audit};
