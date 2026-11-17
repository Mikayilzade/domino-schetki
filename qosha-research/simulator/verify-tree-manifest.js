'use strict';
// Snapshot integrity verifier. Checkpoint 2026-11-18 01:47 Asia/Baku.
// Engine qosha-research-0.5.3; rules recovered qosa-1.0.0.
// Deals 0; seed set none; strategies none; full gameplay suites 0/17;
// hidden-world suites 0/4. Historical 180,000 rounds separate.
// Finding: independent immutable-blob verification is now executable;
// no new validated strategy result. Next: retrieve full pinned checkout,
// run this verifier, preflight, 17+4 gates, fingerprint replays.
// Confidence: synthetic fixture only; full 398-blob checkout untested.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const manifestPath=process.argv[2]||path.join(root,'simulator-tree-manifest-20261117.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
if(manifest.schema!=='qosha-simulator-tree-manifest/v1'||!Array.isArray(manifest.files))throw Error('Unexpected manifest schema');
const seen=new Set(),missing=[],changed=[],unsafe=[];
for(const entry of manifest.files){
 const rel=entry.path;
 if(typeof rel!=='string'||!rel.startsWith('simulator/')||rel.split('/').some(s=>!s||s==='.'||s==='..')||seen.has(rel)||!Number.isSafeInteger(entry.size)||!/^[0-9a-f]{40}$/.test(entry.sha)){
  unsafe.push(rel);continue;
 }
 seen.add(rel);
 const full=path.resolve(root,rel);
 let current=root,bad=false;
 for(const segment of rel.split('/')){
  current=path.join(current,segment);
  if(fs.existsSync(current)&&fs.lstatSync(current).isSymbolicLink()){bad=true;break;}
 }
 if(bad||!full.startsWith(root+path.sep)){unsafe.push(rel);continue;}
 if(!fs.existsSync(full)){missing.push(rel);continue;}
 if(!fs.lstatSync(full).isFile()){unsafe.push(rel);continue;}
 const b=fs.readFileSync(full);
 const sha=crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
 if(sha!==entry.sha||b.length!==entry.size)changed.push({path:rel,expectedSha:entry.sha,actualSha:sha,expectedBytes:entry.size,actualBytes:b.length});
}
const report={schema:'qosha-manifest-verify/v1',sourceCommit:manifest.sourceCommit,expected:manifest.files.length,checked:seen.size,missing,changed,unsafe,exactSnapshot:missing.length===0&&changed.length===0&&unsafe.length===0,completePresence:missing.length===0&&unsafe.length===0,limitation:'A later valid edit appears in changed; manifest verifies snapshot provenance, not gameplay correctness.'};
console.log(JSON.stringify(report,null,2));
if(!report.completePresence)process.exitCode=1;
