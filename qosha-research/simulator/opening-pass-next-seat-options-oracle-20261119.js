'use strict';
// Exact conditional count of next-seat 1-x connectors after opening pass.
function C(n,k){if(k<0||k>n)return 0;let a=1;for(let i=1;i<=k;i++)a=a*(n-k+i)/i;return Math.round(a)}
const denominator=C(18,9);
const counts=Array.from({length:7},(_,k)=>C(6,k)*C(12,9-k));
if(counts.reduce((a,b)=>a+b,0)!==denominator)throw Error('mass mismatch');
let dp=Array.from({length:10},()=>Array(7).fill(0));dp[0][0]=1;
for(let i=0;i<18;i++){
  const next=dp.map(row=>row.slice());
  for(let used=0;used<9;used++)for(let k=0;k<=6;k++)
    if(dp[used][k])next[used+1][k+(i<6?1:0)]+=dp[used][k];
  dp=next;
}
if(counts.some((v,k)=>v!==dp[9][k]))throw Error('independent DP mismatch');
const probabilities=counts.map(x=>x/denominator);
const expected=probabilities.reduce((a,p,k)=>a+k*p,0);
if(Math.abs(expected-3)>1e-12)throw Error('mean mismatch');
console.log(JSON.stringify({schema:'qosha-opening-pass-next-seat-options/v1',
  engine:'standalone exact combinatorial oracle',rules:'recovered qosa-1.0.0, 3x9',
  deals:0,seedSet:null,strategies:[],
  conditioning:'starter has 1-1, mandatory stock draw completed, no other 1-x in starter hand',
  population:18,connectors:6,nextSeatTiles:9,denominator,counts,probabilities,
  expectedConnectors:expected,probabilityAtLeastTwo:probabilities.slice(2).reduce((a,b)=>a+b,0),
  limitations:'Uniform conditional deal only; not gameplay, strategy win rate or engine validation.'},null,2));
