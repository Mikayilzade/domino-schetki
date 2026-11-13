'use strict';
// Exact conditional oracle for the forced 1-1 starter pass, 3x9+1.
// Six remaining 1-bearing dominoes are uniformly placed among 18 opponent slots.
// This is independent of disputed branch unlocking, block scoring and loneZero.
const assert = require('node:assert/strict');
function choose(n,k){let x=1;for(let i=1;i<=k;i++)x=x*(n-k+i)/i;return Math.round(x);}
const denominator=choose(18,9);
const nextCannotFollow=choose(12,9)/denominator;
const nextCanFollow=1-nextCannotFollow;
const exactlyK=Array.from({length:7},(_,k)=>({k,ways:choose(6,k)*choose(12,9-k)}));
assert.equal(exactlyK.reduce((s,r)=>s+r.ways,0),denominator);
assert.equal(exactlyK[0].ways,220);
assert.equal(denominator,48620);
assert.equal(exactlyK.filter(r=>r.k>=2&&r.k<=4).reduce((s,r)=>s+r.ways,0)/denominator,192/221);
console.log(JSON.stringify({test:'opening-pass-next-player-exact',passed:true,mode:'3x9+1',seedSet:'none-exact-enumeration',totalEquiprobableSlotSubsets:denominator,nextCannotFollow,nextCanFollow,exactlyK,gameplayDeals:0,strategies:[],assumptions:'uniform conditional placement of six 1-bearing tiles among 18 opponent slots; no further draws',limitation:'not a win-rate or branch-strategy finding'}));
