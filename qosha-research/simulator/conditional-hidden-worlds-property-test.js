'use strict';
// Standalone test for seeded partial-deal completion; no game rules assumed.
const assert=require('node:assert/strict');
const {sample}=require('./conditional-hidden-worlds');
const fixed={knownHands:[[[1,1],[6,0]],[[3,3]],[]],knownStock:[]};
const snapshot=JSON.stringify(fixed);
const N=50000,counts=[0,0,0,0];
for(let seed=0;seed<N;seed++){
 const a=sample({...fixed,seed}),b=sample({...fixed,seed});
 assert.deepEqual(a,b,'same seed must replay');
 assert.equal(JSON.stringify(fixed),snapshot,'caller input must not mutate');
 assert.deepEqual(a.hands.map(h=>h.length),[9,9,9]);
 assert.equal(a.stock.length,1);
 const all=[...a.hands.flat(),...a.stock];
 assert.equal(all.length,28);assert.equal(new Set(all).size,28);
 assert.ok(a.hands[0].includes('1-1')&&a.hands[0].includes('0-6'));
 assert.ok(a.hands[1].includes('3-3'));
 const t='2-2';const idx=a.hands.findIndex(h=>h.includes(t));
 counts[idx<0?3:idx]++;
}
// One unfixed tile is uniform among 25 available positions: 7,8,9,1.
const expected=[N*7/25,N*8/25,N*9/25,N/25];
for(let i=0;i<4;i++)assert.ok(Math.abs(counts[i]-expected[i])<6*Math.sqrt(expected[i]*(1-expected[i]/N)),`seat ${i} frequency`);
for(const bad of [
 {knownHands:[[[1,1]],[[1,1]],[]]},
 {knownHands:[[[7,1]],[],[]]},
 {knownHands:[Array(10).fill([0,0]),[],[]]},
 {knownHands:[[],[]]},
 {knownHands:[[],[],[]],knownStock:[[1,1],[2,2]]}
])assert.throws(()=>sample(bad));
// Seed IDs must not silently alias through >>>0 coercion.
for(const seed of [-1, 0x100000000, 1.5, '1', NaN, Infinity, null]){
 assert.throws(()=>sample({seed}), 'invalid seed '+String(seed));
}
assert.deepEqual(sample({seed:0xffffffff}),sample({seed:0xffffffff}));
// Regression: seed 1640531527 previously initialized xorshift32 at zero,
// producing a constant-zero stream and a deterministic degenerate shuffle.
const zeroStateSeed=1640531527;
const recovered=sample({seed:zeroStateSeed});
assert.deepEqual(recovered,sample({seed:zeroStateSeed}));
assert.notEqual(recovered.stock[0],'0-0','zero-state shuffle must not survive');
assert.notDeepEqual(recovered,sample({seed:zeroStateSeed+1}));
console.log(JSON.stringify({test:'conditional-hidden-worlds-property',passed:true,allocations:N,seeds:'0..49999',fixed:'seat0 1-1 0-6; seat1 3-3',tile:'2-2',counts,expected,strategies:[],gameplayDeals:0}));
