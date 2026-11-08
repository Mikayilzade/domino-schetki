'use strict';
// Independent exact combinatorial reference; not a game-engine validation.
const assert=require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0n;let r=1n;for(let i=1;i<=k;i++)r=r*BigInt(n-i+1)/BigInt(i);return r;}
const denominator=choose(27,9),numerator=choose(21,9);
// Hand-owned 1-1: remaining 8 hand tiles plus mandatory stock draw form
// a uniform 9-subset of the 27 other tiles; six contain pip 1.
const handOpeningPass=Number(numerator)/Number(denominator);
// Stock-owned 1-1 in a later round: previous winner holds a uniform
// 9-subset of the same 27 tiles, if winner index is deal-independent.
const stockOpeningPass=handOpeningPass;
const firstRoundRedeal=1/28;
assert.equal(denominator,4686825n);
assert.equal(numerator,293930n);
assert.equal(handOpeningPass,stockOpeningPass);
assert.ok(handOpeningPass>0.06&&handOpeningPass<0.07);
console.log(JSON.stringify({
 schema:'qosha-opening-pass-exact/v1',passed:true,gameplayDeals:0,
 engine:'independent exact combinatorics',
 rules:'recovered qosa-1.0.0 3x9+1; mandatory 1-1 opening and draw',
 conditionalNoFollowupProbability:handOpeningPass,
 conditionalNoFollowupNumerator:numerator.toString(),
 conditionalNoFollowupDenominator:denominator.toString(),
 firstRoundRedealProbability:firstRoundRedeal,
 firstRoundNoFollowupPerAttempt:(27/28)*handOpeningPass,
 laterRoundNoFollowupPerAttempt:stockOpeningPass,
 limitation:'Uniform allocation; previous winner independent of current deal. Not an engine/PRNG/strategy validation.'
},null,2));
