'use strict';
// Exact opening-pass risk conditional on additional doubles in the starter's INITIAL hand.
// Starter holds 1-1. Remaining 27 tiles: six 1-x connectors, five other doubles,
// sixteen other non-double non-connectors. Draw 8 initial tiles, then compulsory stock tile.
// This is independent of branch geometry, blocked-round winner and loneZero.
function choose(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v)}
const denominator=choose(27,8)*19;
const results=[];
for(let threshold=0;threshold<=3;threshold++){
 let selected=0,pass=0;
 for(let c=0;c<=6;c++)for(let d=threshold;d<=5;d++){
  const other=8-c-d;if(other<0||other>16)continue;
  const hands=choose(6,c)*choose(5,d)*choose(16,other);
  selected+=hands*19;
  if(c===0)pass+=hands*13; // stock is not any of six connectors
 }
 results.push({minOtherDoubles:threshold,handProbability:selected/denominator,
  passGivenHand:pass/selected,passUnconditional:pass/denominator,
  selectedAssignments:selected,passAssignments:pass});
}
if(Math.abs(results[0].passGivenHand-choose(21,9)/choose(27,9))>1e-12)throw Error('oracle mismatch');
if(!(results[3].passGivenHand>results[2].passGivenHand&&results[2].passGivenHand>results[1].passGivenHand))throw Error('unexpected ordering');
console.log(JSON.stringify({schema:'qosha-opening-double-pass-oracle/v1',denominator,results},null,2));
