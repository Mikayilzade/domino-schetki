'use strict';
const assert = require('node:assert/strict');
const choose=(n,k)=>{if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return v};
// Uniform 3x9+1 28-tile deal. 1-1 in stock with probability 1/28.
// For dealt 1-1: starter's other eight tiles plus stock are nine draws.
// For stock 1-1: previous winner's initial nine tiles are nine draws.
// Both must avoid the six remaining 1-containing tiles for a forced pass.
const stockOpening=1/28;
const dealtOpening=27/28;
const passGivenDealt=choose(21,9)/choose(27,9);
const passGivenStock=choose(21,9)/choose(27,9);
const firstRoundRedeal=stockOpening;
const firstRoundAttemptPass=dealtOpening*passGivenDealt;
const firstRoundAcceptedPass=passGivenDealt;
const laterRoundPass=dealtOpening*passGivenDealt+stockOpening*passGivenStock;
assert.ok(Math.abs(stockOpening+dealtOpening-1)<1e-14);
assert.ok(Math.abs(passGivenDealt-0.06271409749670619)<1e-14);
assert.ok(Math.abs(firstRoundAttemptPass-0.06047430830039525)<1e-14);
assert.ok(Math.abs(laterRoundPass-firstRoundAcceptedPass)<1e-14);
console.log(JSON.stringify({schema:'qosha-opening-mode-reference/v1',passed:true,deals:0,seeds:[],strategies:[],stockOpening,firstRoundRedeal,passGivenDealt,passGivenStock,firstRoundAttemptPass,firstRoundAcceptedPass,laterRoundPass,limitation:'Uniform independent deal and previous winner independent of current deal; first-round redeals excluded from accepted denominator. No full-engine validation.'},null,2));
