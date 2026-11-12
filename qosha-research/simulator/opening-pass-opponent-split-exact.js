'use strict';
// 2026-11-12 11:56 Asia/Baku. Independent exact opening-pass ownership oracle.
// Engine: independent-combinatorial-oracle/v1; recovered rules: qosa-1.0.0 3x9+1.
// Deals: 0; seed set: none; strategies: none; no gameplay or Monte Carlo samples.
// Runtime: Node v22.16.0, isolated source executed 2026-11-12, assertions passed.
// New exact finding: conditional on starter owning 1-1 and passing after stock draw,
// all six remaining pip-1 connectors are held by the two opponents. In 99.0950%
// of those passes both opponents own >=1 connector; 0.90498% all six are on one seat.
// This is NOT a claim about legal branches, play or winning odds.
// Historical 180,000 matched-seat rounds remain separate. Full engine 0/17 and
// hidden-world 0/4 suites executed; DNS blocks executable GitHub checkout.
// Next: verify this oracle against initialized-round states after checkout recovery,
// then run validation gates and matched-world opening comparisons.
// No PWA/scoreboard files changed.
const assert=require('node:assert/strict');
function C(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-k+i)/i;return Math.round(v);}
const total=C(27,9),pass=C(21,9),splitDenom=C(18,6);
const split=Array.from({length:7},(_,k)=>({connectorsSeatA:k,connectorsSeatB:6-k,worlds:C(9,k)*C(9,6-k)}));
assert.equal(total,4686825);assert.equal(pass,293930);
assert.equal(split.reduce((a,x)=>a+x.worlds,0),splitDenom);
assert.equal(splitDenom,18564);assert.equal(split[0].worlds,84);assert.equal(split[6].worlds,84);
console.log(JSON.stringify({schema:'qosha-opening-pass-opponent-split-exact/v1',engine:'independent-combinatorial-oracle/v1',rules:'qosa-1.0.0 opening 3x9+1',deals:0,seedSet:null,strategies:[],conditionalEvent:'1-1 initially in starter hand; starter plays it, draws stock, then has no tile with pip 1',passProbability:pass/total,opponentSplit:split.map(x=>({...x,probability:x.worlds/splitDenom})),probBothOpponentsHaveConnector:1-(split[0].worlds+split[6].worlds)/splitDenom,probExactlyOneOpponentHasAllSix:(split[0].worlds+split[6].worlds)/splitDenom,limitations:'Uniform random deal; counts only pip-1 ownership after opening pass. Does not prove legal branch access, move choice, or strategic win probability.'},null,2));
