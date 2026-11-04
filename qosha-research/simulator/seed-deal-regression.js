'use strict';
// Deterministic deck/deal audit independent of provisional branch and block rules.
// node qosha-research/simulator/seed-deal-regression.js
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const e=require('./engine');
const seeds=Array.from({length:1024},(_,i)=>22000000+i);
const expected=new Set(e.createDoubleSixDeck().map(e.tileKey));
assert.equal(expected.size,28);
const hashes=[];
let stockOpening=0;
for(const seed of seeds){
 const a=e.dealThreeByNine(seed),b=e.dealThreeByNine(seed);
 assert.deepEqual(a,b,'same seed must reproduce same deal');
 assert.deepEqual(a.hands.map(h=>h.length),[9,9,9]);
 assert.equal(a.stock.length,1);
 const keys=[...a.hands.flat(),...a.stock].map(e.tileKey);
 assert.equal(keys.length,28);
 assert.equal(new Set(keys).size,28,'no duplicate tile');
 assert.deepEqual(new Set(keys),expected,'complete double-six deck');
 const direct=e.shuffledDeck(seed).map(e.tileKey);
 assert.deepEqual(keys,direct,'deal preserves shuffle order');
 if(e.tileKey(a.stock[0])==='1-1')stockOpening++;
 hashes.push(crypto.createHash('sha256').update(JSON.stringify(a)).digest('hex'));
}
const uniqueDeals=new Set(hashes).size;
assert.ok(uniqueDeals>1000,'unexpectedly many identical deals; investigate RNG');
console.log(JSON.stringify({schema:'qosha-seed-deal-regression/v1',passed:true,deals:1024,
 seeds:[seeds[0],seeds.at(-1)],uniqueDeals,stockOpening,
 strategies:[],engine:'qosha-research-0.5.3',rules:'double-six 3x9 + one stock, branch-independent'},null,2));
