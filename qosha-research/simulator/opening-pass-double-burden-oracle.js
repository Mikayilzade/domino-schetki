'use strict';
// Exact opening-hand double burden conditional on a forced pass.
// Recovered qosa-1.0.0: 3x9, starter owns 1-1 and draws the one stock tile.
// The nine other tiles are a uniform 9-subset of the remaining 27:
// 6 links 1-x, 6 other doubles x-x, 15 other non-links.
const assert=require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0n;let x=1n;for(let i=1;i<=k;i++)x=x*BigInt(n-i+1)/BigInt(i);return x;}
const total=choose(27,9);
const pass=choose(21,9);
const byDouble=Array.from({length:7},(_,k)=>choose(6,k)*choose(15,9-k));
assert.equal(byDouble.reduce((a,b)=>a+b,0n),pass);
const passAndAtLeastTwo=byDouble.slice(2).reduce((a,b)=>a+b,0n);
const conditional=Number(passAndAtLeastTwo)/Number(pass);
assert.ok(Math.abs(Number(pass)/Number(total)-0.06271409749670619)<1e-14);
assert.ok(Math.abs(conditional-0.8516143299425033)<1e-14);
console.log(JSON.stringify({schema:'qosha-opening-pass-double-burden/v1',rules:'qosa-1.0.0',mode:'3x9+1',deals:0,seedSet:null,method:'exact hypergeometric enumeration',passProbability:Number(pass)/Number(total),passWithAtLeastTwoOtherDoublesProbability:Number(passAndAtLeastTwo)/Number(total),atLeastTwoOtherDoublesGivenPass:conditional,otherDoubleDistributionGivenPass:byDouble.map(x=>Number(x)/Number(pass)),limitation:'Uniform deal; conditional on player owning 1-1 and receiving stock. Counts doubles, not legal double sequences or strategy outcomes.'},null,2));
