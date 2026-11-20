'use strict';
// Research-only exact joint opening-pass oracle; no branch/scoring assumptions.
// Run: node qosha-research/simulator/opening-pass-joint-opponent-oracle-20261120.js
const assert=require('node:assert/strict');
function C(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);}
const rows=[];
for(let k=0;k<=6;k++){
  const passWays=C(6,k)*C(15,8-k)*13;
  for(let x=0;x<=6;x++){
    const opponentWays=C(6,x)*C(12,9-x);
    rows.push({extraStarterDoubles:k,nextPlayerConnectors:x,weightedWays:passWays*opponentWays});
  }
}
const passWays=C(21,8)*13;
const opponentWays=C(18,9);
assert.equal(rows.reduce((s,r)=>s+r.weightedWays,0),passWays*opponentWays);
const threePlus=rows.filter(r=>r.extraStarterDoubles>=3).reduce((s,r)=>s+r.weightedWays,0);
const bothThree=rows.filter(r=>r.nextPlayerConnectors===3).reduce((s,r)=>s+r.weightedWays,0);
const joint=rows.filter(r=>r.extraStarterDoubles>=3&&r.nextPlayerConnectors===3).reduce((s,r)=>s+r.weightedWays,0);
assert.equal(joint*passWays*opponentWays,threePlus*bothThree); // conditional independence
const pPass=passWays/(C(27,8)*19);
const pJointGivenPass=joint/(passWays*opponentWays);
assert.ok(Math.abs(pJointGivenPass-(threePlus/(passWays*opponentWays))*(bothThree/(passWays*opponentWays)))<1e-12);
console.log(JSON.stringify({schema:'qosha-opening-pass-joint/v1',engine:'exact-combinatorial-independent',rules:'qosa-1.0.0 confirmed 1-1 opening only',passed:true,deals:0,seeds:null,strategies:[],pPass,pStarterThreePlusAndBothOpponentsThreeGivenPass:pJointGivenPass,pJointUnconditional:pPass*pJointGivenPass,assumptions:'Uniform 3x9+1 deal; starter holds 1-1; mandatory stock draw; immediate pass; no branch/scoring/opponent-policy assumptions',limitations:'Counts connectors, not legal moves or winning chances; no gameplay engine validation'},null,2));
