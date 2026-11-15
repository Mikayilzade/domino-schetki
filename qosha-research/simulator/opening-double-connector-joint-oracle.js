'use strict';
// Exact opening joint distribution. No gameplay engine dependency.
// After mandatory 1-1, starter has 9 uniformly sampled tiles among 27:
// 6 other doubles, 6 connectors 1-x, and 15 remaining tiles.
const assert=require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0;let a=1;for(let i=1;i<=k;i++)a=a*(n-i+1)/i;return Math.round(a);}
const total=choose(27,9),cells=[];
for(let doubles=0;doubles<=6;doubles++)for(let connectors=0;connectors<=6;connectors++){
 const ways=choose(6,doubles)*choose(6,connectors)*choose(15,9-doubles-connectors);
 if(ways)cells.push({doubles,connectors,ways});
}
assert.equal(cells.reduce((a,c)=>a+c.ways,0),total);
const p=(predicate)=>cells.filter(predicate).reduce((a,c)=>a+c.ways,0)/total;
const result={schema:'qosha-opening-double-connector-joint/v1',rules:'qosa-1.0.0 opening only',sample:'uniform 9 of 27 after mandatory stock draw',total,
 bothAtLeastTwo:p(c=>c.doubles>=2&&c.connectors>=2),
 connectorAtLeastTwo:p(c=>c.connectors>=2),
 doublesAtLeastTwo:p(c=>c.doubles>=2),
 bothGivenConnectorAtLeastTwo:p(c=>c.doubles>=2&&c.connectors>=2)/p(c=>c.connectors>=2),
 doublesAtLeastTwoGivenNoConnector:p(c=>c.doubles>=2&&c.connectors===0)/p(c=>c.connectors===0),
 cells};
assert.ok(Math.abs(result.connectorAtLeastTwo-0.67678119)<1e-7);
console.log(JSON.stringify(result,null,2));
