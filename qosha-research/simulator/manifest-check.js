'use strict';
// Immutable snapshot verifier. Usage: node qosha-research/simulator/manifest-check.js
// A newer legitimate edit is reported as drift, not silently accepted as snapshot-identical.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'simulator-tree-manifest-20261117.json'),'utf8'));
if(manifest.schema!=='qosha-simulator-tree-manifest/v1'||manifest.scope!=='qosha-research/simulator/'||!Array.isArray(manifest.files))throw Error('Invalid manifest');
const missing=[],invalid=[],drift=[],seen=new Set();
for(const row of manifest.files){
 const rel=row.path;
 if(typeof rel!=='string'||!rel.startsWith('simulator/')||rel.split('/').some(x=>!x||x==='.'||x==='..')||seen.has(rel)||! /^[0-9a-f]{40}$/.test(row.sha)||!Number.isSafeInteger(row.size)||row.size<0){invalid.push(String(rel));continue;}
 seen.add(rel);
 let full=root,absent=false,unsafe=false;
 for(const part of rel.split('/')){full=path.join(full,part);if(!fs.existsSync(full)){absent=true;break;}if(fs.lstatSync(full).isSymbolicLink()){unsafe=true;break;}}
 if(unsafe){invalid.push(rel+': symlink');continue;}
 if(absent){missing.push(rel);continue;}
 if(!fs.lstatSync(full).isFile()){invalid.push(rel+': nonregular');continue;}
 const bytes=fs.readFileSync(full);
 const actual=crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
 if(actual!==row.sha||bytes.length!==row.size)drift.push({path:rel,expectedSha:row.sha,actualSha:actual,expectedSize:row.size,actualSize:bytes.length});
}
const complete=missing.length===0&&invalid.length===0&&seen.size===manifest.files.length;
const report={schema:'qosha-manifest-check/v1',sourceCommit:manifest.sourceCommit,expected:manifest.files.length,found:seen.size-missing.length,missing,invalid,drift,complete,exactSnapshot:complete&&drift.length===0,limitation:'Pinned historical snapshot; later intentional edits appear as drift. No gameplay tests executed.'};
console.log(JSON.stringify(report,null,2));
if(!report.exactSnapshot)process.exitCode=1;
