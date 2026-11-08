'use strict';
// Research-only 3x9 opening initializer empirical regression against exact oracle.
// Run: node qosha-research/simulator/opening-initializer-distribution-regression.js
// This is NOT a physical-rule validation or a full round-engine suite.
const assert=require('node:assert/strict');
const e=require('./engine');
const init=require('./initializer');
const START=24000000, N=50000;
const expected=[293930,1220940,1744200,1085280,305235,35910,1330];
const denominator=4686825;
const counts={hand:Array(7).fill(0),stock:Array(7).fill(0)};
const cases={hand:0,stock:0,redeal:0,passes:0,followups:0};
const deck=new Set(e.createDoubleSixDeck().map(e.tileKey));
function touchesOne(t){return t[0]!==t[1]&&(t[0]===1||t[1]===1)}
for(let seed=START;seed<START+N;seed++){
 const deal=e.dealThreeByNine(seed);
 const all=[...deal.hands.flat(),...deal.stock].map(e.tileKey);
 assert.equal(all.length,28);assert.equal(new Set(all).size,28);
 assert.deepEqual(new Set(all),deck);
 const owner=deal.hands.findIndex(h=>h.some(t=>e.tileKey(t)==='1-1'));
 const mode=owner>=0?'hand':'stock';
 const starter=owner>=0?owner:0; // fixed, deal-independent previous winner
 const initial=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:false,previousWinnerIndex:0});
 assert.equal(initial.kind,'ready');
 assert.equal(initial.starter,starter);
 assert.equal(initial.currentPlayer,(starter+1)%3);
 assert.equal(initial.stock.length,0);
 assert.equal(initial.openingDraw===null,mode==='stock');
 const raw=deal.hands[starter].filter(t=>touchesOne(t)).length;
 const K=raw+(mode==='hand'&&touchesOne(deal.stock[0])?1:0);
 assert.ok(K>=0&&K<=6);
 counts[mode][K]++;cases[mode]++;
 assert.equal(initial.openingPassed,K===0);
 assert.equal(initial.openingFollowup===null,K===0);
 if(K===0)cases.passes++;else{
   cases.followups++;
   assert.ok(touchesOne(initial.openingFollowup.tile));
 }
 const played=['1-1',...(initial.openingFollowup?[e.tileKey(initial.openingFollowup.tile)]:[])];
 const remaining=[...initial.hands.flat(),...initial.stock].map(e.tileKey);
 assert.equal(remaining.length,28-played.length);
 assert.equal(new Set([...remaining,...played]).size,28);
 assert.deepEqual(new Set([...remaining,...played]),deck);
 if(mode==='stock'){
   const redeal=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:true});
   assert.equal(redeal.kind,'redeal');
   assert.equal(redeal.reason,'1-1-in-stock-on-first-round');
   cases.redeal++;
 }
}
// Conditional expected distribution is identical for both opening modes.
// Use conservative 6-sigma + 4-count bands; diagnostic only, not proof of RNG.
for(const mode of ['hand','stock']){
 const n=cases[mode];assert.ok(n>1000);
 for(let k=0;k<7;k++){
   const p=expected[k]/denominator;
   const observed=counts[mode][k],mean=n*p;
   const band=6*Math.sqrt(n*p*(1-p))+4;
   assert.ok(Math.abs(observed-mean)<=band,
     mode+' K='+k+' observed='+observed+' expected='+mean+' band='+band);
 }
}
console.log(JSON.stringify({schema:'qosha-opening-initializer-distribution-regression/v1',
 passed:true,engine:'qosha-research-0.5.3',rules:'qosa-1.0.0 3x9+1; previous winner fixed at seat 0 independently of deal',
 seeds:[START,START+N-1],deals:N,strategies:[],cases,counts,
 exactReference:{denominator,counts:expected},confidence:'6-sigma+4 per-cell descriptive smoke; not physical-rule validation'},null,2));
