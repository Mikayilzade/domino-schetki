// Exact conditional opening connector distribution, no gameplay-engine assumptions.
// 3x9+1, 1-1 starter has drawn stock and has no ordinary 1-x connector.
// All six connectors then lie in the opponents' 18 tiles, nine per seat.
'use strict';
function choose(n,k){if(k<0||k>n)return 0n;k=Math.min(k,n-k);let v=1n;for(let i=1;i<=k;i++)v=v*BigInt(n-k+i)/BigInt(i);return v;}
function exact(){const denom=choose(18,9);const rows=[];let sum=0n;for(let k=0;k<=6;k++){const count=choose(6,k)*choose(12,9-k);sum+=count;rows.push({connectorsNextSeat:k,count:String(count),probability:Number(count)/Number(denom),thirdSeatConnectors:6-k});}if(sum!==denom)throw Error('normalization failed');if(BigInt(rows[0].count)!==220n)throw Error('two-pass numerator mismatch');const expected=rows.reduce((a,r)=>a+r.connectorsNextSeat*r.probability,0);if(Math.abs(expected-3)>1e-12)throw Error('expectation mismatch');return {model:'qosa-1.0.0 conditional opening; uniform 3x9+1 allocation',condition:'starter holds 1-1, mandatory stock drawn, starter has no ordinary 1-x',denominator:String(denom),rows,expectedNextSeatConnectors:expected,probabilityNextSeatCanPlay:1-rows[0].probability,probabilityThirdSeatCanPlayIfNextPasses:1};}
if(require.main===module)console.log(JSON.stringify(exact(),null,2));
module.exports={choose,exact};
