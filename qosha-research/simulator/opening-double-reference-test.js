'use strict';
const assert = require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return Math.round(r)}
function hyper(n,k,m,x){return choose(k,x)*choose(n-k,m-x)/choose(n,m)}
function near(a,b){assert.ok(Math.abs(a-b)<1e-11,`${a} != ${b}`)}
// Uniform 3x9+1 allocation; condition on 1-1 being in starter's dealt hand.
const noFollow=choose(21,9)/choose(27,9);
const conditionalAtLeast4=Array.from({length:4},(_,i)=>hyper(21,6,8,i+3)).reduce((a,b)=>a+b,0);
const ordinaryAtLeast4=Array.from({length:4},(_,i)=>hyper(27,6,8,i+3)).reduce((a,b)=>a+b,0);
near(noFollow,0.06271409749670619);
near(conditionalAtLeast4,0.40970072239422084);
near(ordinaryAtLeast4,0.22744501874936657);
near(Array.from({length:7},(_,i)=>hyper(21,6,8,i)).reduce((a,b)=>a+b,0),1);
// Joint probability: starter >=4 doubles and a particular opponent >=3.
let joint=0;
for(let x=3;x<=6;x++)for(let y=3;y<=6-x;y++)joint+=hyper(27,6,8,x)*hyper(19,6-x,9,y);
near(joint,0.015891355021789805);
console.log(JSON.stringify({passed:true,scope:'exact-uniform-deal-combinatorics-only',noFollow,conditionalAtLeast4,ordinaryAtLeast4,jointStarter4Opponent3:joint}));
