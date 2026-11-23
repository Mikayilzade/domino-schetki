'use strict';
// Exact posterior for a 9-tile opponent hand in the forced 1-1 opening-pass state.
// The six 1-x (x != 1) connectors are all among 18 opponent tiles.
// Conditioning here is on VERIFIED TILE OWNERSHIP, not a move selected by an opponent.
const assert = require('node:assert/strict');
function choose(n,k) { if(k<0||k>n)return 0; let r=1; for(let i=1;i<=k;i++)r=r*(n-i+1)/i; return Math.round(r); }
function posterior(knownConnectorCount,knownNonConnectorCount=0) {
  const a=knownConnectorCount,b=knownNonConnectorCount;
  if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||a>6||b<0||b>12||a+b>9)throw Error('invalid known tile counts');
  const remainingHand=9-a-b, remainingPool=18-a-b, connectors=6-a, other=12-b;
  const denom=choose(remainingPool,remainingHand);
  const counts=Array.from({length:7},(_,total)=>{
    const n=choose(connectors,total-a)*choose(other,remainingHand-(total-a));
    return {totalConnectors:total,worlds:n,probability:n/denom};
  }).filter(x=>x.worlds>0);
  assert.equal(counts.reduce((s,x)=>s+x.worlds,0),denom);
  return {knownConnectorCount:a,knownNonConnectorCount:b,denominator:denom,distribution:counts,
    mean:counts.reduce((s,x)=>s+x.totalConnectors*x.probability,0)};
}
function tests() {
  assert.equal(posterior(0,0).denominator,48620);
  assert.equal(posterior(1,0).denominator,24310);
  assert.deepEqual(posterior(2,0).distribution.map(x=>x.worlds),[792,3696,4752,1980,220]);
  assert.equal(posterior(2,0).denominator,11440);
  assert.equal(posterior(6,0).distribution.length,1);
  assert.equal(posterior(6,0).distribution[0].totalConnectors,6);
  for(let a=0;a<=6;a++)for(let b=0;b<=12;b++)if(a+b<=9)posterior(a,b);
  return 'all exact posterior conservation checks passed';
}
if(require.main===module) {
  console.log(tests());
  console.log(JSON.stringify({version:'opening-ownership-posterior/v1',rules:'qosa-1.0.0 opening only',
    assumptions:'uniform 3x9+1 deal, forced opening pass, verified tile ownership (not chosen move)',
    example:posterior(2,0)},null,2));
}
module.exports={posterior,tests};
