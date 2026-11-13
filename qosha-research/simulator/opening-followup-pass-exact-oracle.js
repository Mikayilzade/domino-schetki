'use strict';
// Exact 3x9+1 opening-pass oracle. No dependency on provisional branch semantics.
const assert=require('node:assert/strict');
function choose(n,k){let x=1;for(let i=1;i<=k;i++)x=x*(n-k+i)/i;return x;}
const favorable=choose(21,9),total=choose(27,9),probability=favorable/total;
let sequential=1;for(let i=0;i<9;i++)sequential*=(21-i)/(27-i);
assert.ok(Math.abs(probability-sequential)<1e-12);
assert.ok(probability>0&&probability<1);
console.log(JSON.stringify({
 schema:'qosha-opening-pass-exact/v1',passed:true,
 engine:'independent-combinatorial-oracle/v1',
 rules:'recovered qosa-1.0.0 / 3x9+1',deals:0,seedSet:null,strategies:[],
 condition:'starter owns 1-1, draws sole stock after placing 1-1',
 eligibleTilesAfterOpening:27,otherOneTiles:6,
 starterOtherHandTiles:8,stockDraws:1,unfavorableTiles:21,drawsChecked:9,
 favorableCombinations:favorable,totalCombinations:total,
 openingPassProbability:probability,openingPassPercent:100*probability,
 confidence:'exact under uniform allocation; independent of branch rules',
 limitation:'only immediate opening follow-up pass, not a strategy result or full engine validation'
},null,2));