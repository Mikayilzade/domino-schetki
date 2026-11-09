'use strict';
// Exact combinatorial opening-pass oracle, independent of branch semantics.
// Run: node qosha-research/simulator/opening-pass-exact-regression.js
const assert=require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0n; k=Math.min(k,n-k);let v=1n;for(let i=1;i<=k;i++)v=v*BigInt(n-k+i)/BigInt(i);return v;}
const denominator=choose(27,9);
const passHands=choose(21,9);
const mobility=Array.from({length:7},(_,k)=>({k,hands:(choose(6,k)*choose(21,9-k)).toString()}));
assert.equal(mobility.reduce((s,x)=>s+BigInt(x.hands),0n),denominator);
assert.equal(BigInt(mobility[0].hands),passHands);
const probability=Number(passHands)/Number(denominator);
assert.ok(Math.abs(probability-0.06271409749670619)<1e-15);
// In hand-owned opening, the post-opening 9-tile hand is an 8-tile
// pre-opening subset plus one drawn stock tile. Every 9-tile subset
// has exactly 9 (removed-tile, 8-tile remainder) representations.
assert.equal(choose(27,8)*19n,denominator*9n);
console.log(JSON.stringify({schema:'qosha-opening-pass-exact/v1',passed:true,
 engine:'combinatorial-oracle-1',rules:'recovered qosa-1.0.0 opening only',
 deals:0,seedSet:null,strategies:[],
 denominator:denominator.toString(),passHands:passHands.toString(),
 passProbability:probability,mobility,
 modeEquality:'exact for uniform deal and previous winner independent of allocation',
 limitation:'Not a gameplay simulation or full-engine validation; ignores informative previous-winner selection.'},null,2));
