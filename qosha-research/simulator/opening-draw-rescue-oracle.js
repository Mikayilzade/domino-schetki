'use strict';
// Exact opening-draw rescue probabilities, conditional on starter holding 1-1.
// No branch, block, or scoring interpretation is needed.
const assert = require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0n;let v=1n;k=Math.min(k,n-k);for(let i=1;i<=k;i++)v=v*BigInt(n-k+i)/BigInt(i);return v;}
const D=choose(27,8)*19n; // initial 8 other stones, then 1 of 19 stock candidates
const initialNoMove=choose(21,8)*19n;
const rescued=choose(21,8)*6n;
const stillNoMove=choose(21,8)*13n;
const p=(n)=>Number(n)/Number(D);
assert.equal(initialNoMove,rescued+stillNoMove);
assert.equal(p(rescued)/p(initialNoMove),6/19);
assert.equal(p(stillNoMove),Number(choose(21,9))/Number(choose(27,9)));
const initialChoices=[];let mass=0n;
for(let k=0;k<=6;k++){
 const n=choose(6,k)*choose(21,8-k)*19n;
 initialChoices.push({connectors:k,probability:p(n)});mass+=n;
}
assert.equal(mass,D);
const result={schema:'qosha-opening-draw-rescue/v1',engine:'independent exact combinatorial oracle',rules:'qosa-1.0.0 opening only',mode:'3x9+1',assumptions:['Uniform 28-tile shuffle, conditional on 1-1 held by starter','8 additional hand stones sampled from remaining 27; stock uniformly sampled from remaining 19','A connector is any 1-x with x in 0..6 except 1-1; no other move semantics used'],denominator:D.toString(),metrics:{initialNoConnector:p(initialNoMove),rescuedByStock:p(rescued),stillNoConnectorAfterStock:p(stillNoMove),rescueGivenInitiallyNoConnector:p(rescued)/p(initialNoMove),stockIsConnector:6/27,initialConnectorDistribution:initialChoices},gameplayDeals:0,seedSet:null,strategies:[],validation:'exact arithmetic assertions passed (isolated oracle only)',limitations:'Not a full engine validation or strategic superiority result; assumes forced opening draw when starter owns 1-1.',next:'Compare opening pass and rescue frequencies in validated seeded 3x9+1 engine.'};
console.log(JSON.stringify(result,null,2));
