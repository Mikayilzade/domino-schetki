'use strict';
// Exact seat1 hand allocation audit for the synthetic public-paired-one-ply fixture.
// NOT a full-game strategy result. Global-ever-open branch model is PROVISIONAL.
// node qosha-research/simulator/public-response-dominance-exact.js
const assert = require('node:assert/strict');
const tileKey = (a,b) => [Math.min(a,b),Math.max(a,b)].join('-');
const deck = [];
for (let a=0;a<=6;a++) for(let b=a;b<=6;b++) deck.push(tileKey(a,b));
const played = ['1-1','1-2'];
const focal = ['0-0','0-1','1-3','1-4','1-5','1-6','0-2','2-3','2-4'];
const baseKnown = new Set([...played,...focal]);
assert.equal(baseKnown.size,11);
assert.equal(deck.length,28);
assert.deepEqual(deck.filter(t=>t.startsWith('1-')||t.endsWith('-1')).sort(),
 ['0-1','1-1','1-2','1-3','1-4','1-5','1-6'].sort());
const universe = deck.filter(t=>!baseKnown.has(t));
assert.equal(universe.length,17);
function choose(n,k){let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return Math.round(r);}
function audit(label,knownSeat1){
 const fixed = new Set(knownSeat1);
 assert.equal(fixed.size,knownSeat1.length);
 for(const t of fixed)assert(universe.includes(t));
 const pool=universe.filter(t=>!fixed.has(t)),slots=9-fixed.size;
 assert.equal(pool.length-slots,8,'seat2 must hold eight tiles');
 const responseCount=(h,move)=>Number(h.has('2-2'))+Number(h.has(move==='1-3'?'3-3':'4-4'));
 const binsA=[0,0,0],binsB=[0,0,0],delta={'-1':0,'0':0,'1':0};
 const pairedPassDelta={'-1':0,'0':0,'1':0};
 let worlds=0;
 for(let mask=0;mask<2**pool.length;mask++){
  let bits=mask,n=0;
  while(bits){bits&=bits-1;n++;}
  if(n!==slots)continue;
  const h=new Set(fixed);
  for(let i=0;i<pool.length;i++)if(mask&(1<<i))h.add(pool[i]);
  assert.equal(h.size,9);
  const a=responseCount(h,'1-3'),b=responseCount(h,'1-4');
  binsA[a]++;binsB[b]++;delta[String(b-a)]++;
  pairedPassDelta[String(Number(b===0)-Number(a===0))]++;
  worlds++;
 }
 assert.equal(worlds,choose(pool.length,slots));
 assert.equal(binsA.reduce((s,x)=>s+x,0),worlds);
 assert.equal(binsB.reduce((s,x)=>s+x,0),worlds);
 const result={label,knownSeat1,compatibleSeat1Hands:worlds,
  candidateA:'1-3 left',candidateB:'1-4 left',
  distinctPlayableDoubleCountsA:binsA,distinctPlayableDoubleCountsB:binsB,
  passCountsA:binsA[0],passCountsB:binsB[0],
  passRatesA:binsA[0]/worlds,passRatesB:binsB[0]/worlds,
  pairedResponseDeltaBminusA:delta,pairedPassDeltaBminusA:pairedPassDelta};
 return result;
}
function run(){
 const control=audit('unknown doubles',[]),k3=audit('seat1 has 3-3',['3-3']),
  k4=audit('seat1 has 4-4',['4-4']),both=audit('seat1 has 3-3 and 4-4',['3-3','4-4']);
 assert.equal(control.compatibleSeat1Hands,24310);
 assert.deepEqual([control.passCountsA,control.passCountsB],[5005,5005]);
 assert.deepEqual([k3.compatibleSeat1Hands,k3.passCountsA,k3.passCountsB],[12870,0,3003]);
 assert.deepEqual([k4.compatibleSeat1Hands,k4.passCountsA,k4.passCountsB],[12870,3003,0]);
 assert.deepEqual([both.compatibleSeat1Hands,both.passCountsA,both.passCountsB],[6435,0,0]);
 assert.deepEqual(k3.pairedResponseDeltaBminusA,{'-1':6435,'0':6435,'1':0});
 assert.deepEqual(k4.pairedResponseDeltaBminusA,{'-1':0,'0':6435,'1':6435});
 assert.deepEqual(both.pairedResponseDeltaBminusA,{'-1':0,'0':6435,'1':0});
 assert.deepEqual(control.pairedResponseDeltaBminusA,{'-1':6435,'0':11440,'1':6435});
 return {schema:'qosha-public-response-dominance-exact/v1',
  engine:'qosa-research-0.5.3; independent exact one-ply audit',
  rules:'recovered qosa-1.0.0 3x9; PROVISIONAL global-ever-open',
  opening:'1-1, starter follows with 1-2 up; focal seat0 to move; stock empty',
  assumptions:'seat1 has 9 stones, seat2 has 8; focal 9 and played 2 fixed; all remaining 1-X tiles unavailable to seat1; no choice-policy weighting',
  allocationsAcrossConditionalScenarios:control.compatibleSeat1Hands+k3.compatibleSeat1Hands+k4.compatibleSeat1Hands+both.compatibleSeat1Hands,
  newSeededAllocations:0,newDeals:0,newFullRounds:0,
  scenarios:[control,k3,k4,both],
  finding:'Known 3-3 makes 1-4 weakly dominate 1-3 in reducing immediate opponent double options: strictly fewer in 50% of compatible hands, never more. Known 4-4 reverses the direction; both known remove the advantage.',
  limitations:'Synthetic position; exactly two response types after either move; one-ply opponent mobility only. Not a proven first-place, minus, block or regret improvement.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,audit};
