'use strict';
// Qoşa research checkpoint — 2026-11-13 13:54 Asia/Baku
// Engine reference: qosha-research-0.5.3; rules: recovered qosa-1.0.0.
// Mode: 3 players x 9 stones + 1 stock. Exact enumeration, 0 simulated deals.
// Seed set: none; strategies: none; no win/pips/length/block/minus/regret metrics.
// Finding: P(no immediate follow-up after mandatory opening 1-1 + stock draw |
// starter originally held 1-1) = C(21,9)/C(27,9) = 0.06271409749670619.
// Confidence: exact under uniform shuffling and confirmed opening rule;
// not a gameplay strategy advantage. Does not validate branch/block/loneZero.
// Full gameplay gate: 0/17 executed this pass; hidden-world gate: 0/4.
// Historical 180,000 matched-seat rounds are separate; not added to this sample.
// Next: reconstruct executable research-only checkout, run both gates, archive JSON;
// then compare matched-seed opening decisions, accounting for forced-pass rate.
// The code was independently executed in local Node v22.16.0 before GitHub upload.
// No live PWA files or GitHub Actions touched.
const assert=require('node:assert/strict');
function choose(n,k){let a=1n;for(let i=1;i<=k;i++)a=a*BigInt(n-i+1)/BigInt(i);return a;}
const total=choose(27,9), noFollowup=choose(21,9);
assert.equal(total,4686825n);
assert.equal(noFollowup,293930n);
const probability=Number(noFollowup)/Number(total);
assert.ok(Math.abs(probability-0.06271409749670619)<1e-15);
console.log(JSON.stringify({schema:'qosha-opening-followup-exact/v1',passed:true,checkpoint:'2026-11-13 13:54 Asia/Baku',engine:'qosha-research-0.5.3',rules:'recovered qosa-1.0.0',conditional:'opening 1-1 in starter initial 9; mandatory stock draw completed',nonOpeningTiles:27,otherOneTiles:6,starterNonOpeningTilesAfterDraw:9,possibleSubsets:String(total),noOneSubsets:String(noFollowup),forcedPassProbability:probability,hasFollowupProbability:1-probability,assumptions:['uniform 28-tile shuffle','3x9+1 deal','starter holds 1-1','draw stock regardless of availability','only one-valued tiles are legal immediately after 1-1'],deals:0,seeds:null,strategies:[],gameplayGateExecuted:0,gameplayGateTotal:17,hiddenWorldGateExecuted:0,hiddenWorldGateTotal:4,confidence:'exact combinatorial oracle, not full engine validation',next:'reconstruct checkout and execute both validation gates'},null,2));
