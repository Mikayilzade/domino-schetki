'use strict';
/**
 * Qoşa v16 tie-trace fixture checkpoint — 2026-11-04T02:51:39+04:00 (Asia/Baku).
 * Engine qosha-research-0.5.3; recovered qosa-1.0.0 3x9;
 * PWA v16 event adapter, provisional finish-pip scoring, blocks unscored.
 * Deals: 0 new. Existing accepted cohorts: 4 x 1000 (17M/18M/19M/20M);
 * historical baseline not pooled. Strategies: none (fixture-only).
 * Hypothesis: stopping on the first bust preserves unprocessed nonzero events,
 * including negative survivor corrections; zero inputs are never pending.
 * Confidence: source-level fixture expectations, NOT executed in this checkpoint.
 * Exact next action: run this file and pwa-v16-eleven-tie-traces.js in a
 * complete Node checkout; persist the 66 traces and verify 30 tie arms/11
 * unique boundaries; then prioritize branch/block invariants.
 *
 * Run: node qosha-research/simulator/pwa-v16-eleven-tie-traces-fixtures-test.js
 */
const assert = require('node:assert/strict');
const { trace } = require('./pwa-v16-eleven-tie-traces');
function before(a,b,c) {
  return [a,b,c].map((score,i)=>({id:'P'+i,score,exploded:false}));
}
function check() {
  let checks=0;
  function eq(actual,expected,message){assert.deepEqual(actual,expected,message);checks++;}
  // Same three deltas, but first bust freezes the remaining score entries.
  const initial=before(100,20,20);
  const deltas=[1,5,-5];
  const bustFirst=trace(initial,deltas,[0,1,2]);
  eq(bustFirst.finished,true,'first event busts');
  eq(bustFirst.isDraw,true,'survivors tied at bust');
  eq(bustFirst.pending,[1,2],'positive and negative survivor entries pending');
  eq(bustFirst.entities.map(x=>x.score),[101,20,20],'pending events do not apply');
  eq(bustFirst.places.map(x=>x.points),[1.5,1.5],'PWA v16 draw points');
  const correctionsFirst=trace(initial,deltas,[1,2,0]);
  eq(correctionsFirst.finished,true,'last event busts');
  eq(correctionsFirst.isDraw,true,'equal and opposite deltas restore draw');
  eq(correctionsFirst.pending,[],'all events processed');
  const positiveFirst=trace(initial,deltas,[1,0,2]);
  eq(positiveFirst.isDraw,false,'positive delta before bust breaks tie');
  eq(positiveFirst.pending,[2],'negative delta remains pending');
  eq(positiveFirst.places.find(x=>x.place===1).entityId,'P2','lower score wins');
  const negativeFirst=trace(initial,deltas,[2,0,1]);
  eq(negativeFirst.isDraw,false,'negative delta before bust breaks tie');
  eq(negativeFirst.pending,[1],'positive delta remains pending');
  eq(negativeFirst.places.find(x=>x.place===1).entityId,'P2','negative correction benefits P2');
  const zero=trace(before(100,30,40),[1,0,3],[0,1,2]);
  eq(zero.pending,[2],'only nonzero unprocessed input pending');
  eq(zero.skippedZero,[1],'zero input tracked as skipped, not pending');
  eq(zero.events.length,1,'only first nonzero event applied');
  const noBust=trace(before(10,20,30),[1,0,-40],[2,1,0]);
  eq(noBust.finished,false,'no bust');
  eq(noBust.entities.map(x=>x.score),[11,20,0],'score floor applies');
  eq(noBust.pending,[],'no pending event without bust');
  eq(noBust.skippedZero,[1],'zero accounting independent of order');
  eq(initial.map(x=>x.score),[100,20,20],'caller state not mutated');
  return {checks,fixtureCases:6,independentDeals:0};
}
if(require.main===module) process.stdout.write(JSON.stringify(check())+'\n');
module.exports={check};
