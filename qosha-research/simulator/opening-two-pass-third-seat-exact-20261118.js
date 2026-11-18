'use strict';
// Exact independent opening continuation calculation, 3 players x 9 + 1.
// No branch/block/score interpretation needed.
const assert=require('node:assert/strict');
function C(n,k){if(k<0||k>n)return 0n;let a=1n;for(let i=1;i<=k;i++)a=a*BigInt(n-i+1)/BigInt(i);return a;}
const d1=C(27,9),n1=C(21,9);
const d2=C(18,9),n2=C(12,9);
assert.equal(n2,220n);assert.equal(d2,48620n);
const dist=Array.from({length:7},(_,k)=>({connectors:k,ways:String(C(6,k)*C(12,9-k))}));
assert.equal(dist.reduce((s,x)=>s+BigInt(x.ways),0n),d2);
const output={schema:'qosha-two-pass-third-seat/v1',rules:'qosa-1.0.0',engine:'independent exact combinatorics',deals:0,seedSet:null,strategies:[],starterPass:Number(n1)/Number(d1),secondPassGivenStarterPass:Number(n2)/Number(d2),twoPassesGivenStarterOwns11:Number(n1*n2)/Number(d1*d2),thirdHasConnectorGivenTwoPasses:1,secondSeatConnectorDistribution:dist,assumptions:['uniform double-six deal','starter owns 1-1 and draws the only stock tile','starter has no ordinary 1-x after drawing','six ordinary 1-x are immediately playable on 1','opponents each hold nine tiles'],limitation:'Availability only; does not validate full engine, actual turn dynamics or strategy win probability.'};
console.log(JSON.stringify(output,null,2));