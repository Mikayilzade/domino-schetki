'use strict';
const assert=require('node:assert/strict');
// Independent exact opening joint oracle. 2026-11-14 13:53 Asia/Baku.
// Conditional on starter owning 1-1. The other 27 tiles partition into
// six 1-x connectors, six non-1-1 doubles and fifteen other singles.
// Eight tiles are initially in hand; one of 19 unseen tiles is then drawn.
// "Other doubles" counts only the INITIAL hand; drawn doubles are excluded.
function choose(n,k){if(k<0||k>n)return 0n;let v=1n;for(let i=1;i<=Math.min(k,n-k);i++)v=v*BigInt(n-i+1)/BigInt(i);return v;}
const denominator=choose(27,8)*19n;
const joint=Array.from({length:8},()=>Array(7).fill(0n));
for(let c=0;c<=6;c++)for(let d=0;d<=6;d++){
  const other=8-c-d;if(other<0||other>15)continue;
  const ways=choose(6,c)*choose(6,d)*choose(15,other);
  joint[c+1][d]+=ways*BigInt(6-c);
  joint[c][d]+=ways*BigInt(19-(6-c));
}
assert.equal(joint.flat().reduce((a,b)=>a+b,0n),denominator);
const p=v=>Number(v)/Number(denominator);
const sum=(predicate)=>joint.flatMap((row,c)=>row.map((v,d)=>predicate(c,d)?v:0n)).reduce((a,b)=>a+b,0n);
const connector2=p(sum((c)=>c>=2));
const double2=p(sum((c,d)=>d>=2));
const both=p(sum((c,d)=>c>=2&&d>=2));
assert.ok(Math.abs(connector2-0.6767811898246681)<1e-12);
assert.ok(Math.abs(double2-0.5940812810378028)<1e-12);
assert.ok(both<=Math.min(connector2,double2));
console.log(JSON.stringify({
 schema:'qosha-opening-joint-exact/v1',
 timestamp:'2026-11-14 13:53 Asia/Baku',
 engine:'independent exact combinatorial oracle (reference qosha-research-0.5.3 unvalidated)',
 rules:'qosa-1.0.0 opening only',mode:'3x9+1',
 denominator:String(denominator),seedSet:null,deals:0,strategies:[],
 metrics:{
   probabilityAtLeastTwoPostDrawConnectors:connector2,
   probabilityAtLeastTwoOtherDoublesInitially:double2,
   probabilityBoth:both,
   probabilityTwoOtherDoublesGivenTwoPostDrawConnectors:both/connector2
 },
 finding:'Among starters holding 1-1, 36.38% have >=2 post-draw 1-x connectors AND >=2 other doubles initially; association is descriptive, not causal or a strategy result.',
 confidence:'exact under uniform random shuffle, compulsory draw, and 1-1 ownership',
 limitations:'Counts stones, not legal branch actions; does not validate gameplay engine, block, scoring or branch model. Drawn doubles excluded from initial double count.',
 gameplayValidation:'0/17 executed this checkpoint',hiddenWorldValidation:'0/4 executed this checkpoint',
 historicalMatchedSeatRounds:'180000 (separate legacy subtotal)',
 next:'Run this oracle alongside complete checkout preflight, 17 gameplay and 4 hidden-world suites and fingerprint replays; then compare matched-seed policies.'
},null,2));
