'use strict';
// Exact conditional opening oracle; no branch, block, or scoring assumptions.
function choose(n,k){if(k<0||k>n)return 0n;let v=1n;for(let i=1;i<=Math.min(k,n-k);i++)v=v*BigInt(n-i+1)/BigInt(i);return v;}
const starterDen=choose(21,9),nextDen=choose(18,9);
const starterDoubles=Array.from({length:7},(_,k)=>({k,count:String(choose(6,k)*choose(15,9-k))}));
const nextConnectors=Array.from({length:7},(_,j)=>({j,count:String(choose(6,j)*choose(12,9-j))}));
function sum(rows){return rows.reduce((a,r)=>a+BigInt(r.count),0n);}
if(sum(starterDoubles)!==starterDen||sum(nextConnectors)!==nextDen)throw Error('normalization');
const pNextHasConnector=1-Number(choose(12,9))/Number(nextDen);
const pStarterForcedPass=Number(choose(21,9))/Number(choose(27,9));
const out={schema:'qosha-opening-pass-conditional/v1',rules:'qosa-1.0.0 opening, 3x9+1',method:'exact combinatorics',assumptions:['Starter holds and plays 1-1, draws sole stock tile','The nine remaining starter tiles contain no ordinary 1-x connector','All 28 double-six tiles are unique; deals uniform','No claim about physical branch legality or future actions'],starterForcedPassProbabilityGivenStarterOwns11:pStarterForcedPass,starterOtherDoubles:{denominator:String(starterDen),counts:starterDoubles},nextOpponentConnectorCount:{denominator:String(nextDen),counts:nextConnectors,probabilityAtLeastOne:pNextHasConnector},newFinding:'Conditional on starter forced pass, next opponent connector count is independent of starter non-1 doubles count K: each K leaves exactly 6 connectors and 12 nonconnectors for the 9-tile next hand.',deals:0,seedSet:null,strategies:[]};
console.log(JSON.stringify(out,null,2));
