'use strict';
const assert=require('assert');
const e=require('./engine');
const fixture=require('../fixtures/seed-1898414179.json');
const all=[...fixture.initialHands.flat(),...fixture.initialStock];
assert.equal(all.length,28);
assert.equal(new Set(all.map(e.tileKey)).size,28);
const current=e.dealThreeByNine(fixture.seed);
const sameHands=JSON.stringify(current.hands)===JSON.stringify(fixture.initialHands);
const sameStock=JSON.stringify(current.stock)===JSON.stringify(fixture.initialStock);
console.log(JSON.stringify({
  seed:fixture.seed,
  historicalEngine:fixture.engineVersion,
  currentDeterministicDealMatchesHistorical:sameHands&&sameStock,
  sameHands,
  sameStock,
  currentStock:current.stock,
  historicalStock:fixture.initialStock
},null,2));
