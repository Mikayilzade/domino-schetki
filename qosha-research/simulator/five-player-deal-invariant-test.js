'use strict';
// Research-only 5x5+3 deal invariant. No 5-player opening, draw, or block
// semantics are assumed; this is NOT a full-round validation.
const assert=require('node:assert/strict');
const e=require('./engine');
function run({startSeed=23000000,deals=1024}={}){
 const reference=e.createDoubleSixDeck().map(e.tileKey).sort();
 let checks=0,stockOneOne=0,handOneOne=0,duplicateAllocations=0;
 const seen=new Set();
 for(let seed=startSeed;seed<startSeed+deals;seed++){
  const deck=e.shuffledDeck(seed);
  const hands=Array.from({length:5},(_,seat)=>deck.slice(seat*5,seat*5+5));
  const stock=deck.slice(25);
  assert.equal(hands.length,5);checks++;
  for(const hand of hands){assert.equal(hand.length,5);checks++;}
  assert.equal(stock.length,3);checks++;
  const all=[...hands.flat(),...stock];
  assert.equal(all.length,28);checks++;
  assert.deepEqual(all.map(e.tileKey).sort(),reference);checks++;
  const oneOneCount=all.filter(tile=>e.tileKey(tile)==='1-1').length;
  assert.equal(oneOneCount,1);checks++;
  if(stock.some(tile=>e.tileKey(tile)==='1-1'))stockOneOne++;
  else handOneOne++;
  const key=hands.map(hand=>hand.map(e.tileKey).sort().join(',')).join('|')+'|'+stock.map(e.tileKey).sort().join(',');
  if(seen.has(key))duplicateAllocations++;else seen.add(key);
 }
 assert.equal(stockOneOne+handOneOne,deals);checks++;
 return {passed:true,schema:'qosha-five-player-deal-invariant/v1',engine:'qosha-research-0.5.3',
  rules:'double-six, 5 seats x 5 tiles, 3 stock; no opening/draw assumptions',
  seedRange:[startSeed,startSeed+deals-1],deals,checks,uniqueAllocations:seen.size,
  duplicateAllocations,stockOneOne,handOneOne,
  limitation:'Only 28-tile allocation conservation and 1-1 location; not a 5-player round, policy, or physical-rule validation'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
