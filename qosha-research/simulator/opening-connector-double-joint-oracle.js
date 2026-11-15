'use strict';
// Exact opening-hand joint distribution, independent of provisional board rules.
// After 1-1 and compulsory stock draw, 9 of the remaining 27 tiles are held:
// 6 distinct 1-x connectors, 6 other doubles, 15 other tiles.
const assert=require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);}
const denom=choose(27,9),joint=[];
let total=0,connectorTwo=0,doubleTwo=0,both=0;
for(let c=0;c<=6;c++)for(let d=0;d<=6;d++){
 const n=choose(6,c)*choose(6,d)*choose(15,9-c-d);
 if(!n)continue;
 total+=n;joint.push({connectors:c,otherDoubles:d,count:n});
 if(c>=2)connectorTwo+=n;
 if(d>=2)doubleTwo+=n;
 if(c>=2&&d>=2)both+=n;
}
assert.equal(total,denom);
assert.equal(joint.reduce((s,x)=>s+x.count,0),denom);
assert.equal(joint.reduce((s,x)=>s+x.connectors*x.count,0),2*denom);
assert.equal(joint.reduce((s,x)=>s+x.otherDoubles*x.count,0),2*denom);
const report={schema:'qosha-opening-connector-double-joint/v1',passed:true,model:'uniform 3x9+1; starter owns 1-1, mandatory stock draw',population:{connectors:6,otherDoubles:6,other:15,heldAfterDraw:9},denominator:denom,probabilityConnectorAtLeastTwo:connectorTwo/denom,probabilityOtherDoublesAtLeastTwo:doubleTwo/denom,probabilityBothAtLeastTwo:both/denom,conditionalOtherDoublesAtLeastTwoGivenConnectorAtLeastTwo:both/connectorTwo,conditionalConnectorAtLeastTwoGivenOtherDoublesAtLeastTwo:both/doubleTwo,meanConnectors:2,meanOtherDoubles:2,seedSet:null,dealsSimulated:0,jointCounts:joint,limitations:'Opening-hand composition only. Connector count is not legal action count; no branch or finishing strategy inference.'};
console.log(JSON.stringify(report,null,2));
