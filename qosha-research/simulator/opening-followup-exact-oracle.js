'use strict';
// Exact opening-pass oracle, independent of the provisional branch engine.
// Uniform 28-tile double-six shuffle; 3 seats x 9 and one stock.
// Conditional on 1-1 in a player's initial nine, they play it and draw stock.
// Nine other tiles are then held from the 27 non-1-1 tiles; exactly six
// contain a 1. Opening follow-up pass occurs iff all nine avoid those six.
const assert=require('node:assert/strict');
function choose(n,k){let v=1;for(let i=1;i<=k;i++)v=v*(n-k+i)/i;return Math.round(v);}
const total=choose(27,9),noFollow=choose(21,9);
const pPassGivenStarter=noFollow/total;
const pStockOpening=1/28;
const pPassUnconditional=pPassGivenStarter*(27/28);
assert.equal(total,4686825);
assert.equal(noFollow,293930);
assert.ok(pPassGivenStarter>0.06&&pPassGivenStarter<0.07);
assert.ok(Math.abs(pStockOpening+27/28-1)<1e-12);
console.log(JSON.stringify({schema:'qosha-opening-followup-exact/v1',passed:true,deals:0,seedSet:null,assumption:'uniform double-six shuffle, 3x9+1, starter owns 1-1; starter draws the stock after opening',conditionalNumerator:noFollow,conditionalDenominator:total,pPassGivenStarter,pStockOpening,pPassUnconditional,limitation:'Analytic combinatorics only; no simulator round execution or branch rules validated'},null,2));
