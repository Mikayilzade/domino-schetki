'use strict';
// Research-only exact oracle for the two confirmed later-round 1-1 opening modes.
// No simulated rounds; all counts are integer combinatorics.
const assert = require('node:assert/strict');
function C(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v)}
const owned=Array(7).fill(0),stock=Array(7).fill(0);
// Starter owns 1-1: 8 other hand stones, mandatory draw from 19 remaining.
for(let rawK=0;rawK<=6;rawK++){
 const hands=C(6,rawK)*C(21,8-rawK);
 owned[rawK]+=hands*(13+rawK);
 if(rawK<6)owned[rawK+1]+=hands*(6-rawK);
}
// Stock owns 1-1: independent previous winner holds 9 of remaining 27.
for(let k=0;k<=6;k++)stock[k]=C(6,k)*C(21,9-k);
const ownedTotal=C(27,8)*19,stockTotal=C(27,9);
assert.equal(ownedTotal,42181425);assert.equal(stockTotal,4686825);
assert.equal(ownedTotal,9*stockTotal);
assert.equal(owned.reduce((a,b)=>a+b,0),ownedTotal);
assert.equal(stock.reduce((a,b)=>a+b,0),stockTotal);
for(let k=0;k<=6;k++)assert.equal(owned[k],9*stock[k],`K=${k} opening-mode identity`);
assert.equal(stock[0],293930);
assert.equal(stock[1],1220940);
const E=stock.reduce((s,v,k)=>s+k*v,0)/stockTotal;
assert.equal(E,2);
console.log(JSON.stringify({schema:'qosha-opening-mode-oracle/v1',passed:true,engine:'exact-combinatorics-only',rules:'qosa-1.0.0 / 3x9+1 / previous winner independent of current deal',gameplayDeals:0,seeds:null,strategies:[],ownedTotal,stockTotal,ownedCounts:owned,stockCounts:stock,ratio:9,meanFollowupCount:E,passProbability:stock[0]/stockTotal,atLeastTwoProbability:stock.slice(2).reduce((a,b)=>a+b,0)/stockTotal},null,2));
