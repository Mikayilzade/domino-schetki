'use strict';
// Exact own-hand posterior for a deliberately forced late-arrival prefix.
// Run: node qosha-research/simulator/late-arrival-own-hand-posterior.js
// Both branch interpretations are provisional; this is not a natural-game frequency.
const assert = require('node:assert/strict');
const deck = [];
for (let a=0;a<=6;a++) for (let b=a;b<=6;b++) deck.push([a,b]);
const key = ([a,b]) => a<b?`${a}-${b}`:`${b}-${a}`;
const prefix = [[1,1],[1,2],[2,2],[2,4],[4,4],[4,5],[5,5],[2,5]];
const fixed = [2,6]; // Seat 1's known candidate, legal only under global-ever-open.
const excluded = new Set([...prefix,fixed].map(key));
assert.equal(excluded.size,9);
const free = deck.filter(t=>!excluded.has(key(t)));
assert.equal(free.length,19);
// The other three branches remain open at 1; the returned 2 is locked in current-only.
const current = free.filter(([a,b])=>a===1||b===1);
const globalExtra = free.filter(([a,b])=>(a===2||b===2)&&!current.some(t=>key(t)===key([a,b])));
assert.equal(current.length,5);
assert.equal(globalExtra.length,2);
const category = t => current.some(v=>key(v)===key(t))?'current':
  globalExtra.some(v=>key(v)===key(t))?'extra':'dead';
function choose(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);}
function enumerate(items,k,fn){const indices=[];function go(start){if(indices.length===k){fn(indices.map(i=>items[i]));return;}
  for(let i=start;i<=items.length-(k-indices.length);i++){indices.push(i);go(i+1);indices.pop();}}
  go(0);
}
const counts=Array(6).fill(0), example=Array(6).fill(null);
let ownWorlds=0, weightedPassNumerator=0, weightedCurrentLegal=0, weightedGlobalLegal=0;
const opponentOptions=choose(13,6);
enumerate(free,6,own=>{
  ownWorlds++;
  const r=own.filter(t=>category(t)==='current').length;
  const s=own.filter(t=>category(t)==='extra').length;
  counts[r]++;
  if(!example[r])example[r]={own:own.map(key),r,s};
  const currentRemaining=5-r, extraRemaining=2-s;
  const passCount=choose(13-currentRemaining,6);
  weightedPassNumerator+=passCount;
  weightedCurrentLegal+=6*currentRemaining/13;
  weightedGlobalLegal+=1+6*(currentRemaining+extraRemaining)/13;
});
assert.equal(ownWorlds,choose(19,6));
for(let r=0;r<=5;r++){
  assert.equal(counts[r],choose(5,r)*choose(14,6-r));
  // Independently enumerate opponent six-tile hands for one representative own hand per r.
  const own=new Set(example[r].own);
  const available=free.filter(t=>!own.has(key(t)));
  assert.equal(available.length,13);
  let worlds=0,passes=0,legalSum=0;
  enumerate(available,6,hand=>{worlds++;const n=hand.filter(t=>category(t)==='current').length;
    passes+=+(n===0);legalSum+=n;});
  assert.equal(worlds,opponentOptions);
  assert.equal(passes,choose(8+r,6));
  assert.equal(legalSum,opponentOptions*6*(5-r)/13);
}
assert.equal(weightedPassNumerator,choose(14,6)*choose(13,6));
const rows=counts.map((ownHands,r)=>({
  ownCurrentLegal:r,ownHandCount:ownHands,ownHandShare:ownHands/ownWorlds,
  conditionalPassNumerator:choose(8+r,6),conditionalPassDenominator:opponentOptions,
  conditionalCurrentOnlyPass:choose(8+r,6)/opponentOptions,
  meanOpponentCurrentLegal:6*(5-r)/13,
  globalEverOpenPass:0
}));
const result={passed:true,version:'late-arrival-own-hand-posterior/v1',
  rules:'recovered qosa-1.0.0, 3x9, two PROVISIONAL late-arrival branch models',
  prefix:prefix.map(key),seat1FixedCandidate:key(fixed),
  categories:{currentOnlyLegal:current.map(key),globalExtra:globalExtra.map(key),neither:12},
  ownHandSubsets:ownWorlds,opponentHandsPerOwnHand:opponentOptions,
  independentlyBruteCheckedOpponentHands:6*opponentOptions,
  rows,unconditionalPass:weightedPassNumerator/(ownWorlds*opponentOptions),
  unconditionalMeanCurrentLegal:weightedCurrentLegal/ownWorlds,
  unconditionalMeanGlobalLegal:weightedGlobalLegal/ownWorlds,
  caveat:'Forced scripted prefix and fixed seat-1 candidate; own six drawn uniformly from 19 free, then seat-1 six uniformly from remaining 13. Not observed-game prevalence, win probability or authenticated physical rule.',
  next:'Verify physical reopening and blocked-tie scoring; condition exact posteriors on real public history before strategy ranking.'};
if(require.main===module)console.log(JSON.stringify(result,null,2));
module.exports={run:()=>result};
