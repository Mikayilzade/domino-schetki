'use strict';
// Exact one-turn optional double-chain opportunities, conditional synthetic 3x9.
// Physical branch reopening and human chain policy UNVERIFIED.
// node qosha-research/simulator/public-double-chain-exact.js
const assert=require('node:assert/strict'),e=require('./engine'),d=require('./turn-dispatcher');
const key=e.tileKey;
const played=[[1,1],[1,2]];
const focal=[[0,0],[0,1],[1,3],[1,4],[1,5],[1,6],[0,2],[2,3],[2,4]];
const occupied=new Set([...played,...focal].map(key));
assert.equal(occupied.size,11);
const unknown=e.createDoubleSixDeck().filter(t=>!occupied.has(key(t)));
assert.equal(unknown.length,17);
const branch=e.createBranchState([1,1]);branch.branches.up.end=2;
const opened=e.createOpeningState([1]);
const legal=d.actionsForHand(branch,opened,focal);
const candidates=['1-3','1-4'].map(k=>legal.find(a=>a.type==='single'&&key(a.tile)===k&&a.side==='left'));
assert(candidates.every(Boolean),'both candidate moves legal');
const after=candidates.map(a=>e.applySinglePlacement(branch,a));
function choose(n,k){let x=1;for(let i=1;i<=k;i++)x=x*(n-k+i)/i;return Math.round(x);}
function census(label,known){
 const fixed=new Set(known.map(key));
 assert.equal(fixed.size,known.length);
 for(const k of fixed)assert(unknown.some(t=>key(t)===k),'known tile must be unplayed');
 const pool=unknown.filter(t=>!fixed.has(key(t))),slots=9-known.length;
 const bins=[[0,0,0],[0,0,0]],diff={'-2':0,'-1':0,'0':0,'1':0,'2':0};
 let worlds=0,applyChecks=0,passChecks=0;
 for(let mask=0;mask<2**pool.length;mask++){
  let n=0,b=mask;while(b){b&=b-1;n++;}
  if(n!==slots)continue;
  const hand=[...known];
  for(let i=0;i<pool.length;i++)if(mask&(1<<i))hand.push(pool[i]);
  assert.equal(hand.length,9);
  const held=new Set(hand.map(key));assert.equal(held.size,9,'unique tiles');
  const oracle=[Number(held.has('2-2'))+Number(held.has('3-3')),
                Number(held.has('2-2'))+Number(held.has('4-4'))];
  const maxes=after.map((state,j)=>{
   const acts=d.actionsForHand(state,opened,hand);
   assert(acts.every(a=>a.type==='double-sequence'),'unexpected ordinary response');
   const m=acts.reduce((v,a)=>Math.max(v,a.sequence.length),0);
   assert.equal(m,oracle[j],'independent tile-membership oracle');
   assert.equal(d.turnOptions(state,opened,hand,[]).phase,m?'play':'pass');
   if(!m)passChecks++;
   if(m===2&&applyChecks<8){
    const two=acts.find(a=>a.sequence.length===2);
    const result=d.applyTurn(state,opened,hand,[],two);
    assert.equal(result.playedTiles.length,2);
    assert.equal(result.hand.length,7);
    assert(result.openingState.openedNumbers.has(2));
    assert(result.openingState.openedNumbers.has(j===0?3:4));
    for(const side of e.SIDES)assert.equal(result.branchState.branches[side].end,state.branches[side].end);
    applyChecks++;
   }
   return m;
  });
  bins[0][maxes[0]]++;bins[1][maxes[1]]++;
  diff[String(maxes[1]-maxes[0])]++;
  worlds++;
 }
 assert.equal(worlds,choose(pool.length,slots));
 assert.deepEqual(bins.map(a=>a.reduce((s,n)=>s+n,0)),[worlds,worlds]);
 return {label,knownSeat1:known.map(key),compatibleHands:worlds,
  maxPlayableDoubleTilesByMove:bins,
  twoDoubleOpportunityRate:bins.map(a=>a[2]/worlds),
  passRate:bins.map(a=>a[0]/worlds),
  meanMaxPlayableDoubleTiles:bins.map(a=>(a[1]+2*a[2])/worlds),
  pairedDeltaBminusA:diff,applyChecks,passChecks};
}
function run(){
 const control=census('unknown',[]),k3=census('known 3-3',[[3,3]]),
       k4=census('known 4-4',[[4,4]]),both=census('both known',[[3,3],[4,4]]);
 assert.deepEqual(control.maxPlayableDoubleTilesByMove,[[5005,12870,6435],[5005,12870,6435]]);
 assert.deepEqual(k3.maxPlayableDoubleTilesByMove,[[0,6435,6435],[3003,6864,3003]]);
 assert.deepEqual(k4.maxPlayableDoubleTilesByMove,[[3003,6864,3003],[0,6435,6435]]);
 assert.deepEqual(both.maxPlayableDoubleTilesByMove,[[0,3432,3003],[0,3432,3003]]);
 assert.equal(k3.meanMaxPlayableDoubleTiles[0]-k3.meanMaxPlayableDoubleTiles[1],0.5);
 assert.equal(k4.meanMaxPlayableDoubleTiles[1]-k4.meanMaxPlayableDoubleTiles[0],0.5);
 return {schema:'qosha-public-double-chain-exact/v1',
  engine:'qosa-research-0.5.3 + dispatcher exact chain cross-check',
  rules:'recovered qosa-1.0.0 3x9; PROVISIONAL global-ever-open',
  newDeals:0,newRandomWorlds:0,newFullRounds:0,seedRange:null,
  reusedExactConditionalHands:control.compatibleHands+k3.compatibleHands+k4.compatibleHands+both.compatibleHands,
  candidates:['1-3 left','1-4 left'],scenarios:[control,k3,k4,both],
  finding:'Known 3-3: 1-4 lowers opportunity for a two-double reply from 50% to 23.333%, and mean maximum immediate doubles from 1.5 to 1.0. Known 4-4 reverses this; both known cancel it.',
  limitations:'Exact conditional synthetic allocation, no human opponent choice weighting; optional double chain need not be played. Not win rate, minus or full-game regret. Branch and blocked ties unverified.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,census};