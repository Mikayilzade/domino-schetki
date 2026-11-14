'use strict';
// Exact raw-deal double count conditional on holding 1-1 in uniform 3x9+1.
// Independent of branch-opening, turn policy, block scoring and loneZero.
const assert = require('node:assert/strict');
function choose(n,k) { if(k<0||k>n)return 0; let x=1;for(let i=1;i<=k;i++)x=x*(n-i+1)/i;return x; }
function distribution(ownsOneOne) {
  const draws=ownsOneOne?8:9;
  const offset=ownsOneOne?1:0;
  const denominator=choose(27,draws);
  return Array.from({length:8},(_,total)=>{
    const extra=total-offset;
    return choose(6,extra)*choose(21,draws-extra)/denominator;
  });
}
function summary(p) {return {expectedDoubles:p.reduce((a,x,i)=>a+i*x,0),atLeastThree:p.slice(3).reduce((a,b)=>a+b,0),distribution:p};}
const starter=summary(distribution(true));
const nonstarter=summary(distribution(false));
for(const p of [starter.distribution,nonstarter.distribution]) assert.ok(Math.abs(p.reduce((a,b)=>a+b,0)-1)<1e-12);
assert.ok(Math.abs(starter.expectedDoubles-25/9)<1e-12);
assert.ok(Math.abs(nonstarter.expectedDoubles-2)<1e-12);
assert.ok(Math.abs(starter.atLeastThree-0.5940812810378027)<1e-12);
assert.ok(Math.abs(nonstarter.atLeastThree-0.30463160028377423)<1e-12);
console.log(JSON.stringify({oracle:'starter-double-confounding/v1',mode:'3x9+1',assumptions:['uniform 28-tile deal','raw hand before mandatory stock draw','starter defined as owner of 1-1 only when 1-1 dealt to a player'],starter,nonstarter,deltaAtLeastThree:starter.atLeastThree-nonstarter.atLeastThree},null,2));
module.exports={distribution,summary};
