'use strict';
// Research-only hidden-world allocation primitive. No move or scoring rules assumed.
function sampleWorld(known, played, capacities, seed) {
 const deck=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)deck.push(`${a}-${b}`);
 const used=new Set([...known,...played]);
 if(used.size!==known.length+played.length||[...used].some(t=>!deck.includes(t)))throw Error("invalid known/played tiles");
 if(capacities.some(n=>!Number.isInteger(n)||n<0)||capacities.reduce((a,b)=>a+b,0)!==28-used.size)throw Error("capacity mismatch");
 let s=seed>>>0;const next=()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0};
 const remaining=deck.filter(t=>!used.has(t));
 for(let i=remaining.length-1;i>0;i--){let j=next()%(i+1);[remaining[i],remaining[j]]=[remaining[j],remaining[i]]}
 let offset=0;return capacities.map(n=>{const part=remaining.slice(offset,offset+n);offset+=n;return part});
}
module.exports={sampleWorld};
if(require.main===module){
 const known=["0-0","0-1","0-2","0-3","0-4","0-5","0-6","1-1","1-2"],played=["1-3","1-4","1-5","1-6","2-2","2-3","2-4","2-5","2-6"];
 const assert=require('node:assert/strict');const seen=new Set();
 for(let seed=1;seed<=10000;seed++){
  const w=sampleWorld(known,played,[5,4,1],seed);
  const all=[...known,...played,...w.flat()];
  assert.equal(all.length,28);assert.equal(new Set(all).size,28);
  assert.deepEqual(w.map(x=>x.length),[5,4,1]);
  assert.deepEqual(w,sampleWorld(known,played,[5,4,1],seed));
  seen.add(w[0].join(','));
 }
 assert.throws(()=>sampleWorld(['0-0','0-0'],[],[26],1));
 assert.throws(()=>sampleWorld([],[],[9,9,1],1));
 assert.throws(()=>sampleWorld(['8-8'],[],[27],1));
 console.log(JSON.stringify({schema:'qosha-hidden-world-allocation-smoke/v1',passed:true,seeds:[1,10000],allocations:10000,uniqueOpponentHands:seen.size,invalidInputsRejected:3,limitation:'Allocation conservation and deterministic replay only; no uniformity proof or game-policy validation.'}));
}
