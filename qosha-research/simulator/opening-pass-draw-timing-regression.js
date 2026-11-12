'use strict';
// Independent exact oracle: a forced pass is assessed AFTER the mandatory stock draw.
// qosa-1.0.0, 3x9+1; no gameplay or branch assumptions.
// Run: node qosha-research/simulator/opening-pass-draw-timing-regression.js
const assert=require('node:assert/strict');
function C(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);}
function joint(slotsA,slotsB,stockSlots,ones){
 const denom=C(slotsA+slotsB+stockSlots,ones);
 let both2=0,both3=0,total=0;
 for(let a=0;a<=ones;a++)for(let b=0;b<=ones-a;b++){
  const s=ones-a-b;if(s>stockSlots)continue;
  const n=C(slotsA,a)*C(slotsB,b)*C(stockSlots,s);
  total+=n;if(a>=2&&b>=2)both2+=n;if(a>=3&&b>=3)both3+=n;
 }
 assert.equal(total,denom);return {denom,both2,both3,probBoth2:both2/denom,probBoth3:both3/denom};
}
// At the actual forced-pass decision: starter already drew the only stock tile.
// Six remaining 1-connectors are distributed between two 9-tile opponents.
const postDraw=joint(9,9,0,6);
assert.equal(postDraw.denom,18564);
assert.equal(postDraw.probBoth2,192/221);
assert.equal(postDraw.probBoth3,18480/48620);
// Counterfactual: starter initially has no other 1, but the mandatory stock draw
// has NOT yet occurred. Stock may still contain a 1 and rescue the starter.
// Thus this is NOT the same conditioning event as a forced pass.
const preDraw=joint(9,9,1,6);
assert.equal(preDraw.denom,27132);
assert.equal(preDraw.both2,22176);
assert.ok(preDraw.probBoth2<postDraw.probBoth2);
console.log(JSON.stringify({schema:'qosha-opening-pass-draw-timing/v1',passed:true,engine:'independent-exact-oracle',rules:'qosa-1.0.0 opening',deals:0,seedSet:null,strategies:[],postDraw,preDraw,warning:'81.7337% is a pre-draw counterfactual, not the probability conditional on a forced pass after drawing.'}));
