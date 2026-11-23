'use strict';
// Exact opening oracle; independent of branch unlock, scoring, and simulator kernel.
// Conditional on starter owning 1-1 and forced to pass after mandatory stock draw.
// The six other 1-x tiles are uniformly allocated among the two opponents' 9-tile hands.
const assert=require('node:assert/strict');
const choose=(n,k)=>{if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-k+i)/i;return Math.round(v)};
const denom=choose(18,9);
const histogram=Array.from({length:7},(_,k)=>({nextSeatConnectors:k,worlds:choose(6,k)*choose(12,9-k)}));
assert.equal(histogram.reduce((a,x)=>a+x.worlds,0),denom);
assert.equal(histogram[0].worlds,choose(12,9));
const passProbability=choose(21,9)/choose(27,9);
const nextSeatCanPlay=1-histogram[0].worlds/denom;
const bothCanPlay=histogram.filter(x=>x.nextSeatConnectors>0&&x.nextSeatConnectors<6).reduce((a,x)=>a+x.worlds,0)/denom;
const report={schema:'qosha-opening-forced-pass-next-seat-exact/v1',dateBaku:'2026-11-23 04:49 +04',engine:'standalone exact combinatorial oracle (no gameplay kernel)',rules:'recovered qosa-1.0.0; 3 players x 9 tiles; starter owns 1-1; one mandatory stock draw',deals:0,seedSet:'none (exact enumeration)',strategies:[],metrics:{forcedPassProbability:passProbability,conditionalWorlds:denom,nextSeatHasOneConnectorProbability:nextSeatCanPlay,bothOpponentsHaveConnectorProbability:bothCanPlay,nextSeatConnectorHistogram:histogram.map(x=>({...x,probability:x.worlds/denom}))},finding:'After a forced opening pass, the next clockwise player can play a 1-x tile with exact probability 220/221 (99.5475%).',confidence:'exact conditional uniform allocation, independently enumerated 18 choose 9 opponent-hand allocations',limitations:'Only immediate follow-up tile availability; does not account for strategic selection, branch locking, or later rounds. Does not validate simulator or constitute a strategy win-rate claim.',nextAction:'Restore SHA-verified full checkout; run 17 gameplay + 4 hidden-world suites, fingerprint replays, then matched-seed rollouts.'};
assert.equal(histogram[0].worlds,220);
assert.equal(denom,48620);
console.log(JSON.stringify(report,null,2));
