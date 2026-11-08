'use strict';
// Exact starter opening mobility vs other-double ownership (3x9+1).
// Conditional on holding 1-1, eight other tiles plus mandatory stock draw
// form a uniform nine-subset of the remaining 27.
// Categories: six non-double tiles touching 1, six other doubles, fifteen others.
const assert=require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x=x*(n-i+1)/i;return Math.round(x);}
const total=choose(27,9);
const joint=Array.from({length:7},(_,k)=>Array.from({length:7},(_,d)=>choose(6,k)*choose(6,d)*choose(15,9-k-d)));
assert.equal(joint.flat().reduce((a,b)=>a+b,0),total);
const followups=joint.map(row=>row.reduce((a,b)=>a+b,0));
assert.deepEqual(followups,Array.from({length:7},(_,k)=>choose(6,k)*choose(21,9-k)));
const doubles=Array.from({length:7},(_,d)=>joint.reduce((s,row)=>s+row[d],0));
assert.deepEqual(doubles,Array.from({length:7},(_,d)=>choose(6,d)*choose(21,9-d)));
const group=ks=>{const count=ks.reduce((s,k)=>s+followups[k],0);const threePlus=ks.reduce((s,k)=>s+joint[k].slice(2).reduce((a,b)=>a+b,0),0);return {count,probability:count/total,probabilityAtLeastThreeTotalDoubles:threePlus/count};};
const result={schema:'qosha-opening-joint-exact/v1',engine:'independent exact combinatorics; not full round engine',rules:'qosa-1.0.0 confirmed 3x9+1 opening',deals:0,seedSet:null,strategies:[],denominator:total,groups:{forcedPass:group([0]),oneFollowup:group([1]),twoOrMoreFollowups:group([2,3,4,5,6]),zeroOrOneFollowup:group([0,1])},jointCounts:joint,interpretation:'At least three total doubles means 1-1 plus at least two other doubles in starter nine-tile post-draw set.',assumptions:['uniform 3x9+1 deal conditional on starter holding 1-1','mandatory stock draw occurs before follow-up','candidate follow-up tiles are the six non-double tiles touching 1'],limitations:['descriptive combinatorial association, not a causal strategy effect','does not model branch locking, turns, scores or opponents','not a full-engine validation suite']};
assert.ok(result.groups.forcedPass.probabilityAtLeastThreeTotalDoubles>result.groups.twoOrMoreFollowups.probabilityAtLeastThreeTotalDoubles);
console.log(JSON.stringify(result,null,2));
