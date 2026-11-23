'use strict';
// Exact opening combinatorics, independent of gameplay engine.
const assert=require('node:assert/strict');
function C(n,k){if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x=x*(n-i+1)/i;return Math.round(x);}
const total=C(27,8);let passNum=0,weightedPass=0,weightedAll=0;const rows=[];
for(let k=0;k<=6;k++){
 const hands=C(6,k)*C(21,8-k),passNumerator=C(6,k)*C(15,8-k)*13;
 passNum+=passNumerator;weightedPass+=k*passNumerator;weightedAll+=k*hands;
 rows.push({otherDoubles:k,prior:hands/total,passJoint:passNumerator/(19*total)});
}
const passProbability=passNum/(19*total),priorMean=weightedAll/total,passMean=weightedPass/passNum;
assert.ok(Math.abs(passProbability-C(21,9)/C(27,9))<1e-12);
assert.ok(Math.abs(priorMean-16/9)<1e-12);
assert.ok(Math.abs(passMean-16/7)<1e-12);
assert.ok(Math.abs(rows.reduce((s,r)=>s+r.passJoint,0)-passProbability)<1e-12);
console.log(JSON.stringify({schema:'qosha-opening-pass-double-enrichment/v1',rules:'qosa-1.0.0 opening only',deals:0,seedSet:null,strategies:[],passProbability,priorMean,passMean,enrichment:passMean/priorMean,rows:rows.map(r=>({...r,posteriorGivenPass:r.passJoint/passProbability}))},null,2));
