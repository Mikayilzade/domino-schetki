'use strict';
// Standalone 3x9+1 conditional hidden-world sampler; no gameplay-rule assumptions.
// Uniform over completions conditional on exact known tiles. Seeded, reproducible.
const assert=require('node:assert/strict');
const universe=Array.from({length:7},(_,a)=>Array.from({length:7-a},(_,i)=>a+'-'+(a+i))).flat();
const key=t=>{assert.ok(Array.isArray(t)&&t.length===2&&t.every(x=>Number.isInteger(x)&&x>=0&&x<=6));return [...t].sort((a,b)=>a-b).join('-');};
function rng(seed){let x=(seed>>>0)^0x9e3779b9;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};}
function sample({knownHands=[[],[],[]],knownStock=[],seed=0}){
 assert.equal(knownHands.length,3);assert.ok(Array.isArray(knownStock));
 const hands=knownHands.map(h=>h.map(key)),stock=knownStock.map(key);
 const fixed=[...hands.flat(),...stock];assert.equal(new Set(fixed).size,fixed.length,'duplicate known tile');
 assert.ok(fixed.every(k=>universe.includes(k)));hands.forEach(h=>assert.ok(h.length<=9));assert.ok(stock.length<=1);
 const unknown=universe.filter(k=>!fixed.includes(k)),random=rng(seed);
 for(let i=unknown.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[unknown[i],unknown[j]]=[unknown[j],unknown[i]];}
 let offset=0;for(const h of hands){const n=9-h.length;h.push(...unknown.slice(offset,offset+n));offset+=n;}
 const n=1-stock.length;stock.push(...unknown.slice(offset,offset+n));offset+=n;
 assert.equal(offset,unknown.length);return {hands,stock,seed:seed>>>0};
}
module.exports={sample,key};
if(require.main===module){
 const N=100000,known={knownHands:[[[1,1]],[],[]],knownStock:[]};
 let nextHasOne=0,bothTwo=0;
 for(let seed=0;seed<N;seed++){
  const w=sample({...known,seed}),all=[...w.hands.flat(),...w.stock];
  assert.equal(all.length,28);assert.equal(new Set(all).size,28);
  assert.deepEqual(w.hands.map(h=>h.length),[9,9,9]);assert.equal(w.stock.length,1);
  assert.ok(w.hands[0].includes('1-1'));assert.deepEqual(w,sample({...known,seed}));
  if(w.hands[1].some(k=>k.split('-').includes('1')))nextHasOne++;
 }
 // Forced starter pass: all six remaining 1-bearing tiles are in opponent hands.
 const noOne=universe.filter(k=>!k.split('-').includes('1'));
 const conditioned={knownHands:[['1-1',...noOne.slice(0,8)].map(k=>k.split('-').map(Number)),[],[]],knownStock:[noOne[8].split('-').map(Number)]};
 for(let seed=0;seed<N;seed++){
  const w=sample({...conditioned,seed});
  const counts=w.hands.slice(1).map(h=>h.filter(k=>k.split('-').includes('1')).length);
  assert.equal(counts[0]+counts[1],6);if(counts.every(v=>v>=2))bothTwo++;
 }
 const observed=bothTwo/N,exact=192/221;
 assert.ok(Math.abs(observed-exact)<0.015);
 console.log(JSON.stringify({test:'conditional-hidden-worlds',seeds:'0..99999',samples:N,openingPassBothOpponentsTwoOrMore:observed,exact,unconditionedNextHasOne:nextHasOne/N}));
}
