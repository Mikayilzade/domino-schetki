'use strict';
// Independent sampler contract: fixed hand/stock, rejection, replay and seat symmetry.
// Does not validate branch legality or game outcomes.
const assert=require('node:assert/strict');
const {sample}=require('./conditional-hidden-worlds');
const fixed={knownHands:[[[1,1],[0,6]],[[2,2]],[[3,3]]],knownStock:[[4,4]]};
const allKeys=new Set(Array.from({length:7},(_,a)=>Array.from({length:7-a},(_,i)=>`${a}-${a+i}`)).flat());
const N=100000;let aHasFive=0,bHasFive=0;
for(let seed=0;seed<N;seed++){
 const w=sample({...fixed,seed});
 assert.deepEqual(w,sample({...fixed,seed}));
 assert.deepEqual(w.hands.map(h=>h.length),[9,9,9]);assert.equal(w.stock.length,1);
 for(let i=0;i<3;i++)for(const t of fixed.knownHands[i])assert.ok(w.hands[i].includes(t.join('-')));
 assert.equal(w.stock[0],'4-4');
 const all=[...w.hands.flat(),...w.stock];assert.equal(all.length,28);assert.equal(new Set(all).size,28);
 assert.ok(all.every(t=>allKeys.has(t)));
 if(w.hands[1].includes('5-5'))aHasFive++;
 if(w.hands[2].includes('5-5'))bHasFive++;
}
// 23 unfixed stones; seats 1 and 2 each have 8 free slots. Expected 8/23.
const expected=8/23,p1=aHasFive/N,p2=bHasFive/N;
assert.ok(Math.abs(p1-expected)<0.015,`seat1 marginal ${p1}`);
assert.ok(Math.abs(p2-expected)<0.015,`seat2 marginal ${p2}`);
assert.ok(Math.abs(p1-p2)<0.015,`seat asymmetry ${p1-p2}`);
for(const bad of [
 {knownHands:[[[1,1]],[[1,1]],[]]},
 {knownHands:[[[7,7]],[],[]]},
 {knownHands:[Array(10).fill([0,0]),[],[]]},
 {knownHands:[[],[],[]],knownStock:[[1,1],[2,2]]},
])assert.throws(()=>sample(bad));
console.log(JSON.stringify({schema:'qosha-conditional-hidden-worlds-regression/v1',passed:true,seedSet:'0..99999',samples:N,strategies:[],deals:0,seat1:p1,seat2:p2,expected,negativeFixtures:4}));
