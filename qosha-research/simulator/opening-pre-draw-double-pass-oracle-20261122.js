#!/usr/bin/env node
'use strict';
// Exact opening oracle, not a gameplay engine test.
// Conditional on starter holding 1-1 before its compulsory stock draw.
// Among its other eight tiles K are non-1-1 doubles (0..6).
const C=(n,k)=>{if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x=x*(n-i+1)/i;return Math.round(x)};
const rows=[];
for(let k=0;k<=6;k++){
  // 27 tiles outside 1-1: six 1-x connectors, six other doubles, fifteen other tiles.
  const total=C(6,k)*C(21,8-k);
  const noConnector=C(6,k)*C(15,8-k);
  // If the initial eight have no connector, the 19 remaining tiles
  // include six connectors and thirteen nonconnectors. One stock draw.
  const passNumerator=noConnector*13;
  const passDenominator=total*19;
  rows.push({otherDoublesBeforeDraw:k,initialHandCount:total,
    initialNoConnectorCount:noConnector,passProbability:passNumerator/passDenominator});
}
if(rows.reduce((a,r)=>a+r.initialHandCount,0)!==C(27,8))throw Error('hand partition');
const aggregate=rows.reduce((a,r)=>a+r.initialNoConnectorCount*13,a=>a,0);
// Independent total: after stock draw, nine nonconnectors out of 27.
const direct=C(21,9)/C(27,9);
const weighted=rows.reduce((a,r)=>a+r.initialHandCount*r.passProbability,0)/C(27,8);
if(Math.abs(weighted-direct)>1e-12)throw Error('weighted total mismatch');
console.log(JSON.stringify({oracle:'opening-pre-draw-double-pass/v1',
 condition:'starter owns 1-1; uniform remaining 27; mandatory single stock draw',
 rows,aggregatePassProbability:weighted,directPassProbability:direct},null,2));
