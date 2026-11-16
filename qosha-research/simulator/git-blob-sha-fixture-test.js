'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
// Independent fixture regression for the Git blob digest used by checkout preflight.
// Does not validate any real repository file or gameplay rule.
const gitBlob=bytes=>crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'qosha-blob-'));
try {
  const cases=[Buffer.alloc(0),Buffer.from('hello\n'),Buffer.from('Qoşa açdı 🁡\n','utf8'),Buffer.from([0,1,2,255,10,0])];
  for(let i=0;i<cases.length;i++){
    const file=path.join(dir,'case-'+i);fs.writeFileSync(file,cases[i]);
    const expected=execFileSync('git',['hash-object','--',file],{encoding:'utf8'}).trim();
    assert.equal(gitBlob(cases[i]),expected,'git blob SHA-1 case '+i);
    const changed=Buffer.concat([cases[i],Buffer.from([0])]);
    assert.notEqual(gitBlob(changed),expected,'mutation detected '+i);
  }
  console.log(JSON.stringify({passed:true,cases:cases.length,mutationsDetected:cases.length,fixtureOnly:true}));
} finally {fs.rmSync(dir,{recursive:true,force:true});}
