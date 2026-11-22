'use strict';
// Exact opening oracle, no simulator imports. Node >=18.
// Conditional on starter playing 1-1, drawing stock, and having no 1-x connector
// among the nine remaining stones. Six 1-x connectors then reside in the
// opponents' 18 stones (nine per seat).
const choose=(n,k)=>{if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x=x*(n-i+1)/i;return Math.round(x);};
const denominator=choose(18,6);
const rows=Array.from({length:7},(_,j)=>({firstOpponentConnectors:j,secondOpponentConnectors:6-j,count:choose(9,j)*choose(9,6-j)}));
const total=rows.reduce((s,r)=>s+r.count,0);
if(total!==denominator||denominator!==18564)throw Error('partition normalization failed');
const exactlyBalanced=rows[3].count/denominator;
const oneHasAtLeastFour=1-exactlyBalanced;
if(Math.abs(exactlyBalanced-7056/18564)>1e-12)throw Error('balance invariant failed');
console.log(JSON.stringify({schema:'qosha-opening-pass-opponent-split/v1',rules:'qosa-1.0.0 opening only',conditioning:'starter owns and plays 1-1, post-stock hand contains zero ordinary 1-x connectors; uniform complete deal',denominator,rows,exactlyThreeEach:exactlyBalanced,atLeastFourConnectorsInOneOpponent:oneHasAtLeastFour},null,2));
/*
Research checkpoint: 2026-11-22 10:52 Asia/Baku
Engine reference: qosha-research-0.5.3 (NOT invoked); rules: qosa-1.0.0 opening subset.
Deals: 0; hidden worlds: 0; seed set: none; strategies: none; exact partition enumeration only.
Result: P(opponents split six ordinary 1-x connectors 3/3 | starter forced pass)
= 7056/18564 = 38.00905%; P(one opponent has >=4)=61.99095%.
This is a distribution of tile ownership, NOT a legal-move probability or strategy advantage.
Confidence: exact under uniform deal and the explicitly conditioned event; branch legality
and double-opening conventions irrelevant to this tile-allocation statement.
Gameplay validation: 0/17 suites executed; hidden-world validation: 0/4.
Historical 180000 matched-seat rounds remain separate. No new strategy conclusion.
Next: restore SHA-verified complete research checkout; execute strict pinned verifier,
preflight, 17+4 validation suites and fingerprint replays; then matched-seed trials.
No scoreboard/PWA files or GitHub Actions changed.
*/
