'use strict';
// Qoşa research checkpoint — 2026-11-07 06:53 Asia/Baku.
// Recovered rules qosa-1.0.0; engine reference qosha-research-0.5.3.
// Deterministic exact enumeration (no seeds/deals/policies). 3 players x 9 + 1 stock.
// Independent regression of 2026-11-07 05:48 RESULTS.md conditional claims.
// Executed locally: node v22.16.0; passed:true; full-engine suites 0/17.
// P(opponent >=3 doubles | dealt 1-1 starter forced opening pass)=0.20714115605756475.
// P(opponent >=3 | pass AND starter initial >=4 doubles)=0.05704548822047711.
// These are combinatorial reference values, not win/finish strategy results.
// Confidence: exact under uniform dealing and stated conditioning; no engine RNG check.
// Historical 180,000 matched-seat rounds are NOT added to this 0-deal checkpoint.
// Next: obtain runnable full checkout; execute validation-gate and fingerprint replay,
// archive JSON; compare fresh matched seeds with separate starter/pass/stock strata.
const assert = require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return v;}
function hypergeom(n,k,d,x){return choose(k,x)*choose(n-k,d-x)/choose(n,d);}
let mass=0, opponent3=0, joint=0, starter4=0;
for(let x=0;x<=6;x++){
  const px=hypergeom(21,6,8,x);
  for(let s=0;s<=1;s++){
    const ps=s?(6-x)/13:(7+x)/13;
    for(let y=0;y<=6;y++){
      const p=px*ps*hypergeom(18,6-x-s,9,y);
      mass+=p;
      if(y>=3)opponent3+=p;
      if(x>=3){starter4+=p;if(y>=3)joint+=p;}
    }
  }
}
const conditional=joint/starter4;
assert.ok(Math.abs(mass-1)<1e-12);
assert.ok(Math.abs(opponent3-0.20714115605756472)<1e-12);
assert.ok(Math.abs(conditional-0.057045488220477114)<1e-12);
assert.ok(Math.abs(starter4-0.40970072239422084)<1e-12);
console.log(JSON.stringify({passed:true,mass,opponent3,starter4,joint,conditional},null,2));
