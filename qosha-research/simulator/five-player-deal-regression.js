'use strict';
// Branch-independent 5x5+3 distribution audit; NOT full five-player game validation.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const e=require('./engine');
const seeds=Array.from({length:1024},(_,i)=>23000000+i);
const deckKeys=new Set(e.createDoubleSixDeck().map(e.tileKey));
let stockOpening=0;
const dealHashes=new Set();
for(const seed of seeds){
  const d=e.shuffledDeck(seed);
  const hands=Array.from({length:5},(_,seat)=>d.slice(seat*5,seat*5+5));
  const stock=d.slice(25);
  const again=e.shuffledDeck(seed);
  assert.deepEqual(d,again,'deterministic shuffle');
  assert.deepEqual(hands.map(h=>h.length),[5,5,5,5,5]);
  assert.equal(stock.length,3);
  const keys=[...hands.flat(),...stock].map(e.tileKey);
  assert.equal(keys.length,28);
  assert.equal(new Set(keys).size,28);
  assert.deepEqual(new Set(keys),deckKeys);
  assert.deepEqual(keys,d.map(e.tileKey));
  const ones=keys.filter(k=>k==='1-1');
  assert.equal(ones.length,1);
  if(stock.some(t=>e.tileKey(t)==='1-1'))stockOpening++;
  dealHashes.add(crypto.createHash('sha256').update(JSON.stringify({hands,stock})).digest('hex'));
}
assert.ok(dealHashes.size>1000,'suspicious duplicate deal frequency');
console.log(JSON.stringify({schema:'qosha-five-player-deal-regression/v1',passed:true,deals:seeds.length,seeds:[seeds[0],seeds.at(-1)],uniqueDeals:dealHashes.size,stockOpening,players:5,handSize:5,stockSize:3,strategies:[],engine:'qosha-research-0.5.3',rules:'double-six 5x5+3; shuffle partition only, no five-player opening or draw rule asserted'},null,2));
