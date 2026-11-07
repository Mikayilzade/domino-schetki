'use strict';
const assert = require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return Math.round(r)}
function hyper(n,k,m,x){return choose(k,x)*choose(n-k,m-x)/choose(n,m)}
function near(a,b){assert.ok(Math.abs(a-b)<1e-12,`${a} != ${b}`)}
// Condition: 1-1 dealt to starter, starter has no follow-up on pip 1 after mandatory stock draw.
// X = starter's other doubles among eight initial tiles; S = stock is one of the remaining doubles.
// Y = a SPECIFIED opponent's doubles among nine tiles. No gameplay/branch rules are assumed.
let opponent3=0, joint=0, starter4=0, normalization=0;
for(let x=0;x<=6;x++){
  const px=hyper(21,6,8,x);
  if(x>=3)starter4+=px;
  for(let s=0;s<=1;s++){
    const ps=s?(6-x)/13:(7+x)/13;
    for(let y=0;y<=6-x-s;y++){
      const p=px*ps*hyper(18,6-x-s,9,y);
      normalization+=p;
      if(y>=3){opponent3+=p;if(x>=3)joint+=p}
    }
  }
}
near(normalization,1);
near(starter4,0.40970072239422084);
near(opponent3,0.20714115605756472);
near(joint,0.023371577733260488);
near(joint/starter4,0.057045488220477114);
console.log(JSON.stringify({passed:true,scope:'conditional-uniform-deal-combinatorics-only',opponent3,joint,starter4,opponent3GivenStarter4:joint/starter4}));
