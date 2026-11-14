'use strict';
// Research-only pinned inventory audit. Does not claim the pinned commit is current.
// node qosha-research/simulator/pinned-inventory-audit.js
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const inventory=path.join(root,'simulator-checkout-inventory-2026-11-14.md');
const prefix='qosha-research/simulator/';
const blob=b=>crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
const text=fs.readFileSync(inventory,'utf8');
const entries=[...text.matchAll(/^\x60(qosha-research\/simulator\/[^\x60\r\n]+)\x60 ([0-9a-f]{40}) (\d+)$/gm)].map(m=>({name:m[1].slice(prefix.length),sha:m[2],bytes:Number(m[3])}));
const errors=[],missing=[],changed=[],verified=[],extra=[];
if(entries.length!==387)errors.push('Expected 387 pinned entries; found '+entries.length);
const names=new Set();
for(const e of entries){
 if(names.has(e.name))errors.push('Duplicate '+e.name);
 names.add(e.name);
 const full=path.resolve(__dirname,e.name);
 if(!full.startsWith(__dirname+path.sep)||e.name.split('/').some(s=>s==='..'||s==='.'||!s)) {errors.push('Unsafe '+e.name);continue;}
 if(!fs.existsSync(full)){missing.push(e.name);continue;}
 if(!fs.lstatSync(full).isFile()){errors.push('Nonregular '+e.name);continue;}
 const data=fs.readFileSync(full);
 if(data.length!==e.bytes||blob(data)!==e.sha)changed.push(e.name);
 else verified.push(e.name);
}
function scan(dir,rel=''){
 for(const d of fs.readdirSync(dir,{withFileTypes:true})){
  const r=rel?rel+'/'+d.name:d.name;
  if(d.isSymbolicLink()){errors.push('Symlink '+r);continue;}
  if(d.isDirectory())scan(path.join(dir,d.name),r);
  else if(!d.isFile())errors.push('Nonregular '+r);
  else if(!names.has(r))extra.push(r);
 }
}
scan(__dirname);
const report={schema:'qosha-pinned-inventory-audit/v1',pin:'cdb2a10e50e58314e4af5472838b31e5740db2f9',expected:387,verified:verified.length,missing,changed,extra,errors,exactPinnedMatch:errors.length===0&&missing.length===0&&changed.length===0&&extra.length===0,limitation:'The pinned inventory is historical. Changed or extra files may be legitimate later research; this audit does not validate gameplay and must not silently reject newer source as corrupt.'};
console.log(JSON.stringify(report,null,2));
if(errors.length||missing.length)process.exitCode=1;
