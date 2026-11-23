'use strict';
// Exact conditional hand composition for the confirmed 3x9+1 opening.
// Assumes uniform double-six shuffle and starter initially holds 1-1.
// A forced pass after drawing stock means none of the other eight hand
// stones nor the stock tile carries a 1. No branch-play assumption.
const assert=require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-k+i)/i;return v;}
const count=Array.from({length:7},(_,k)=>choose(6,k)*choose(15,8-k));
const denominator=choose(21,8);
assert.equal(count.reduce((a,b)=>a+b,0),denominator);
const probability=count.map(n=>n/denominator);
const mean=probability.reduce((a,p,k)=>a+k*p,0);
const atLeastTwo=probability.slice(2).reduce((a,b)=>a+b,0);
const atLeastOne=1-probability[0];
const specificDouble=8/21;
const baselineSpecificDouble=8/27;
const forcedPass=choose(21,9)/choose(27,9);
assert.ok(Math.abs(mean-16/7)<1e-12);
assert.ok(Math.abs(forcedPass-0.06271409749670619)<1e-12);
assert.ok(Math.abs(probability.reduce((a,b)=>a+b,0)-1)<1e-12);
assert.ok(Math.abs(specificDouble/baselineSpecificDouble-9/7)<1e-12);
console.log(JSON.stringify({schema:'qosha-opening-pass-double-count/v1',rules:'qosa-1.0.0 confirmed 3x9+1 opening',engine:'standalone-exact-oracle-v1',deals:0,seeds:null,strategies:[],assumptions:['uniform double-six shuffle','starter initially owns 1-1','forced pass means no other 1 in hand or stock'],forcedPassProbability:forcedPass,otherDoubleCountNumerators:count,denominator,distribution:probability,meanOtherDoubles:mean,probabilityAtLeastOne:atLeastOne,probabilityAtLeastTwo:atLeastTwo,specificOtherDoubleConditional:specificDouble,specificOtherDoubleBaseline:baselineSpecificDouble},null,2));
