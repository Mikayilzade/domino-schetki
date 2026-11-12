'use strict';
// Independent exact first-round redeal oracle; no branch or scoring assumptions.
const assert = require('node:assert/strict');
const N=28, handSize=9, players=3;
assert.equal(players*handSize+1,N);
const ownership=[0,0,0], stockSlot=27;
for(let slot=0;slot<N;slot++){
  if(slot!==stockSlot)ownership[Math.floor(slot/handSize)]++;
}
assert.deepEqual(ownership,[9,9,9]);
const pStock=1/N, pAccept=1-pStock;
assert.equal(pStock,1/28);
assert.equal(1/pAccept,28/27);
assert.equal(pStock*pStock,1/784);
console.log(JSON.stringify({
  schema:'qosha-opening-redeal-oracle/v1',
  engine:'independent exact combinatorial oracle',
  rules:'qosa-1.0.0',mode:'3x9+1',
  positions:N,handPositions:ownership,stockPositions:1,
  firstRoundRedealProbability:pStock,
  firstRoundAcceptedProbability:pAccept,
  expectedInitialDealAttempts:1/pAccept,
  probabilityAtLeastTwoConsecutiveRedeals:pStock*pStock,
  gameplayDeals:0,seedSet:null,strategies:[],
  limitations:'First round only, independent uniform reshuffles; later-round stock 1-1 belongs to previous winner. Not gameplay-engine validation or strategic evidence.'
},null,2));
