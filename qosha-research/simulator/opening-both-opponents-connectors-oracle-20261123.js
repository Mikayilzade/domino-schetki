'use strict';
/*
Qoşa açdı exact opening conditional oracle — 2026-11-23 19:50 Asia/Baku
Rules: recovered qosa-1.0.0, 3 players x 9 tiles + 1 stock.
Reference gameplay engine: qosha-research-0.5.3 (NOT validated this run).
Experiment: after starter plays 1-1, mandatory draw still leaves no 1-x.
Starter holds 9 nonconnector tiles; the two opponents divide 18 remaining
tiles, of which exactly six are ordinary 1-x connectors.
All C(18,9)=48,620 next-seat hands are equiprobable.
No stochastic seeds; no strategies; 0 gameplay deals, 0 hidden worlds, 0 rollouts.
Results: both opponents own >=1 connector in 48,180/48,620 = 99.0950226244%.
Exactly one opponent has none in 440/48,620 = 0.9049773756%.
These are connector ownership facts, NOT legal-move/strategy outcomes.
Confidence: exact uniform-allocation combinatorics; Node v22 standalone executed,
but full 17 gameplay + 4 hidden-world validation suites remain unexecuted.
Historical 180,000 matched-seat rounds are separate legacy data.
Limitation: branch-opening/block/loneZero rules provisional, full engine unavailable
because executable shell cannot resolve github.com.
Next action: recover complete pinned research checkout, strict integrity audit,
preflight, 17+4 suites and fingerprint replays; archive outputs before comparisons.
No live PWA or Actions changes.
*/
const choose=(n,k)=>{if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return Math.round(r)};
const total=choose(18,9);
const counts=Array.from({length:7},(_,k)=>({connectorsNext:k,allocations:choose(6,k)*choose(12,9-k)}));
const sum=counts.reduce((a,x)=>a+x.allocations,0);
if(total!==48620||sum!==total)throw Error('partition invariant');
const both=counts.filter(x=>x.connectorsNext>0&&x.connectorsNext<6).reduce((a,x)=>a+x.allocations,0);
const neither=counts.filter(x=>x.connectorsNext===0||x.connectorsNext===6).reduce((a,x)=>a+x.allocations,0);
if(both+neither!==total||neither!==440)throw Error('symmetry invariant');
console.log(JSON.stringify({timestampBaku:'2026-11-23 19:50 +04',rules:'qosa-1.0.0',engineReference:'qosha-research-0.5.3',condition:'starter forced pass after mandatory draw following 1-1',gameplayDeals:0,seedSet:null,strategies:[],totalAllocations:total,counts,bothOpponentsHaveConnector:both,probability:both/total,oneOpponentHasNoConnector:neither,probabilityOneLacks:neither/total,notes:'Connector ownership only; no branch legality or policy decisions inferred'},null,2));
