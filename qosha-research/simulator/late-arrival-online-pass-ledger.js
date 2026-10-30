'use strict';
// Exact first-pass online knowledge audit for a constructed 3x9 late-arrival witness.
// Both physical branch interpretations are PROVISIONAL.
// node qosha-research/simulator/late-arrival-online-pass-ledger.js
const assert = require('node:assert/strict');
const deck=[];
for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)deck.push(a+'-'+b);
const prefix=['1-1','1-2','2-2','2-4','4-4','4-5','5-5','2-5'];
const knownOwn='3-3';
const laterPublic='1-3';
const played=new Set(prefix);
assert.equal(played.size,8);
const free=deck.filter(t=>!played.has(t)&&t!==knownOwn);
const ownCandidates=free.filter(t=>t!==laterPublic);
assert.equal(free.length,19);
assert.equal(ownCandidates.length,18);
const touches=(t,n)=>t.split('-').includes(String(n));
const legal={current:new Set(free.filter(t=>touches(t,1))),
             global:new Set(free.filter(t=>touches(t,1)||touches(t,2)))};
assert(legal.current.has(laterPublic)&&legal.global.has(laterPublic));
const choose=(n,k)=>{if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);};
function combinations(items,k,fn){
  const chosen=[];
  function visit(start){
    if(chosen.length===k){fn(chosen.slice());return;}
    for(let i=start;i<=items.length-(k-chosen.length);i++){
      chosen.push(items[i]);visit(i+1);chosen.pop();
    }
  }
  visit(0);
}
function exact(own,model){
  assert(['current','global'].includes(model));
  assert.equal(own.length,6);assert(own.includes(knownOwn));
  assert.equal(new Set(own).size,6);
  assert(own.every(t=>t===knownOwn||ownCandidates.includes(t)));
  const pool=free.filter(t=>!own.includes(t));
  assert.equal(pool.length,14);
  assert(pool.includes(laterPublic));
  const allowed=pool.filter(t=>!legal[model].has(t));
  const online=choose(allowed.length,7);
  const retrospective=choose(allowed.filter(t=>t!==laterPublic).length,7);
  assert.equal(online,retrospective,'future public 1-3 is redundant after forced pass');
  const numerators=Object.fromEntries(pool.map(t=>[t,allowed.includes(t)?choose(allowed.length-1,6):0]));
  assert.equal(Object.values(numerators).reduce((a,b)=>a+b,0),7*online);
  assert.equal(numerators[laterPublic],0);
  return {online,retrospective,numerators,posterior:online?
    Object.fromEntries(pool.map(t=>[t,numerators[t]/online])):null};
}
function brute(own,model){
  const pool=free.filter(t=>!own.includes(t));
  let n=0,passes=0,retrospective=0;
  const numerators=Object.fromEntries(pool.map(t=>[t,0]));
  combinations(pool,7,hand=>{
    n++;
    if(hand.some(t=>legal[model].has(t)))return;
    passes++;
    if(!hand.includes(laterPublic))retrospective++;
    for(const t of hand)numerators[t]++;
  });
  assert.equal(n,choose(14,7));
  return {n,passes,retrospective,numerators};
}
function run(){
  const aggregates={current:{ownHandsCompatible:0,onlinePassWorlds:0,retrospectivePassWorlds:0,tile2_6Numerator:0},
                    global:{ownHandsCompatible:0,onlinePassWorlds:0,retrospectivePassWorlds:0,tile2_6Numerator:0}};
  let ownHands=0,bruteAssignments=0,fixtures=[];
  combinations(ownCandidates,5,five=>{
    ownHands++;
    const own=[knownOwn,...five];
    for(const model of ['current','global']){
      const r=exact(own,model),a=aggregates[model];
      a.ownHandsCompatible+=Number(r.online>0);
      a.onlinePassWorlds+=r.online;
      a.retrospectivePassWorlds+=r.retrospective;
      a.tile2_6Numerator+=r.numerators['2-6']||0;
      if([1,111,4000,8568].includes(ownHands)){
        const b=brute(own,model);
        assert.equal(b.passes,r.online);
        assert.equal(b.retrospective,r.retrospective);
        assert.deepEqual(b.numerators,r.numerators);
        bruteAssignments+=b.n;
        fixtures.push({own,model,passWorlds:r.online,posterior1_3:r.posterior?.[laterPublic]??null});
      }
    }
  });
  assert.equal(ownHands,8568);
  assert.equal(bruteAssignments,27456);
  assert.equal(aggregates.current.onlinePassWorlds,1585584);
  assert.equal(aggregates.global.onlinePassWorlds,152460);
  for(const model of ['current','global']){
    const a=aggregates[model];
    assert.equal(a.onlinePassWorlds,a.retrospectivePassWorlds);
    a.p2_6Seat1GivenForcedPass=a.tile2_6Numerator/a.onlinePassWorlds;
    a.p1_3Seat1GivenForcedPass=0;
    a.p1_3Seat2GivenForcedPass=1;
  }
  assert.equal(aggregates.current.p2_6Seat1GivenForcedPass,0.5);
  assert.equal(aggregates.global.p2_6Seat1GivenForcedPass,0);
  return {version:'late-arrival-online-pass-ledger/v1',passed:true,
    rules:'recovered qosa-1.0.0 3x9; current-only/global-ever-open both PROVISIONAL',
    prefix,knownOwn,unseenAtFirstPass:laterPublic,
    design:'8568 own hands excluding future seat-2 tile 1-3; 3432 possible seat-1 seven-tile hands per own hand before pass; 14 unknown stones split 7+7',
    ownHands,priorJointAssignments:ownHands*choose(14,7),bruteAssignments,
    aggregates,fixtures,
    finding:'Because 1-3 is legal for seat 1 in both models, an observed FORCED pass already excludes it from seat 1. If it is not in the observer hand and stock is exhausted, it must be in seat 2. Retrospectively revealing 1-3 adds zero information in this witness.',
    caveats:'Constructed chronological witness, no real forced-pass log. Only a forced (not voluntary) pass permits exclusion; no unknown stock; known public 1-branch legal. Both physical late-arrival rules and blocked ties unresolved. No win-rate or natural-play prevalence.',
    next:'Generalize legal-tile exclusion ledger to actual logged forced-pass histories and compare with independently confirmed table legality before full-game strategy ranking.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,exact,brute};
