'use strict';
// Exact combinatorial check, independent of provisional branch legality.
// Condition: 3x9+1, starter has played 1-1, drawn stock and has no 1-x (x=0,2..6).
// Six ordinary 1-x connectors then lie among the opponents' 18 stones.
const assert = require('node:assert/strict');
function C(n,k){if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return Math.round(r)}
const denominator=C(18,9);
const counts=Array.from({length:7},(_,j)=>C(6,j)*C(12,9-j));
assert.equal(denominator,48620);
assert.deepEqual(counts,[220,2970,11880,18480,11880,2970,220]);
assert.equal(counts.reduce((a,b)=>a+b,0),denominator);
const bothAtLeastOne=counts.slice(1,6).reduce((a,b)=>a+b,0);
const bothAtLeastTwo=counts.slice(2,5).reduce((a,b)=>a+b,0);
assert.equal(bothAtLeastOne,48180);
assert.equal(bothAtLeastTwo,42240);
console.log(JSON.stringify({schema:'qosha-exact-oracle/v1',condition:'starter forced pass after 1-1 plus mandatory draw; 3x9+1',denominator,connectorCountByNextOpponent:counts,bothOpponentsAtLeastOne:{numerator:bothAtLeastOne,probability:bothAtLeastOne/denominator},bothOpponentsAtLeastTwo:{numerator:bothAtLeastTwo,probability:bothAtLeastTwo/denominator},gameplayDeals:0,seedSet:null,strategies:[],limitations:'connector ownership only; no branch legality, move success, scoring or strategy inference'},null,2));
