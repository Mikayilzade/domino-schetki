'use strict';
// Exact starter stock-rescue audit. 1-1 is in the raw 9-tile starter hand.
// Remaining hand: 8 of 27; stock: one of 19; 6 other tiles touch 1.
// This is a rule-invariant opening calculation, not a game simulation.
const assert=require('node:assert/strict');
const choose=(n,k)=>{if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v)};
const denom=choose(27,8)*19;
let total=0,pass=0,rescue=0;
const rows=[];
for(let d=0;d<=6;d++){
 const hands=choose(6,d)*choose(21,8-d);
 const n=hands*19;
 const noOneHands=choose(6,d)*choose(15,8-d);
 const rescued=noOneHands*6;
 const passed=noOneHands*13;
 const rawNoFollowup=noOneHands*19;
 assert.equal(rescued+passed,rawNoFollowup);
 rows.push({rawStartingDoubles:d+1,handStockPairs:n,rawHandHasNoOtherOnePct:100*rawNoFollowup/n,stockRescuePct:100*rescued/n,forcedPassPct:100*passed/n,stockRescueGivenNoOneInHandPct:100*rescued/rawNoFollowup});
 total+=n;pass+=passed;rescue+=rescued;
}
assert.equal(total,denom);
assert.equal(pass,choose(21,9)*9);
assert.equal(rescue+pass,choose(21,8)*19);
assert.equal(rescue/(rescue+pass),6/19);
console.log(JSON.stringify({schema:'qosha-opening-stock-rescue-exact/v1',rules:'qosa-1.0.0 3x9+1, starter owns 1-1, uniform deal',deals:0,denominator:denom,forcedPassPct:100*pass/denom,stockRescuePct:100*rescue/denom,noOtherOneInRawHandPct:100*(pass+rescue)/denom,rescueGivenNoOtherOnePct:100*rescue/(pass+rescue),rows},null,2));
