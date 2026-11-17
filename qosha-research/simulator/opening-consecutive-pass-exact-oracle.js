'use strict';
// Exact conditional opening-pass cascade; no gameplay-engine imports.
// qosa-1.0.0 3x9+1: starter owns 1-1, draws the one stock tile,
// and has no 1-x (x=0,2,3,4,5,6) among its nine other tiles.
// The next seat receives 9 of the 18 remaining tiles uniformly.
const assert = require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v)}
const starterPass = choose(21,9)/choose(27,9);
const nextPassGivenStarterPass = choose(12,9)/choose(18,9);
let checked=0,dead=0;
for(let mask=0;mask<(1<<18);mask++){
 let count=0;for(let b=mask;b;b&=b-1)count++;
 if(count!==9)continue;
 checked++;
 // remaining tiles indexed 0..5 = six 1-x connectors, 6..17 nonconnectors
 if((mask&63)===0)dead++;
}
assert.equal(checked,choose(18,9));
assert.equal(dead,choose(12,9));
assert.equal(dead/checked,nextPassGivenStarterPass);
assert.equal(choose(21,9)/choose(27,9),starterPass);
const output={
 engineReference:'qosha-research-0.5.3',
 rules:'qosa-1.0.0', mode:'3x9+1', method:'exact-combinatorics-plus-exhaustive-18-choose-9',
 seeds:null, gameplayDeals:0, strategies:[],
 starterForcedPassProbability:starterPass,
 nextSeatForcedPassGivenStarterPass:nextPassGivenStarterPass,
 bothConsecutiveForcedPassProbability:starterPass*nextPassGivenStarterPass,
 nextSeatHasConnectorGivenStarterPass:1-nextPassGivenStarterPass,
 checkedNextSeatHands:checked, noConnectorNextSeatHands:dead,
 limitations:'Only immediate ordinary 1-x follow-up after 1-1, assuming uniform shuffle and clockwise seat order; no later-turn strategy or win-rate claim. No engine validation.'
};
console.log(JSON.stringify(output,null,2));
