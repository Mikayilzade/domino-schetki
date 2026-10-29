'use strict';
// Conditional exact census, NOT a population frequency of natural Qoşa games.
// node qosha-research/simulator/late-arrival-conditional-census.js
const assert = require('node:assert/strict');
const DECK = [];
for (let a=0;a<=6;a++) for (let b=a;b<=6;b++) DECK.push([a,b]);
const key = t => t.slice().sort((a,b)=>a-b).join('-');
const tile = (a,b) => a<=b?[a,b]:[b,a];
const NUMBERS = [0,2,3,4,5,6];
function legal(board,t,side) {
  const [a,b]=t, end=board.ends[side];
  return a===b ? a===end && !board.opened.includes(a)
    : !board.locks[side] && (a===end || b===end);
}
function apply(board,t,side,model) {
  assert(legal(board,t,side),'illegal prefix move '+key(t));
  const n={ends:board.ends.slice(),locks:board.locks.slice(),opened:board.opened.slice()};
  if(t[0]===t[1]) {n.locks[side]=false;n.opened.push(t[0]);}
  else {n.ends[side]=t[0]===board.ends[side]?t[1]:t[0];
    n.locks[side]=!(model==='global'&&n.opened.includes(n.ends[side]));}
  return n;
}
function position(x,y,z,w) {
  const steps=[[1,1],tile(1,x),[x,x],tile(x,y),[y,y],tile(y,z),[z,z],tile(z,x),tile(x,w)];
  const used=new Set(steps.map(key));
  assert.equal(used.size,9);
  const free=DECK.filter(t=>!used.has(key(t)));
  assert.equal(free.length,19);
  const boards={};
  for(const model of ['global','current']) {
    let b={ends:[1,1,1,1],locks:[false,false,false,false],opened:[1]};
    for(let i=1;i<8;i++) b=apply(b,steps[i],0,model);
    boards[model]=b;
  }
  assert.equal(legal(boards.global,steps[8],0),true);
  assert.equal(legal(boards.current,steps[8],0),false);
  // Seat 1 has played 2-2 and y-z, leaving 7 tiles: fixed x-w plus 6 of 19 free.
  // Seat 0 has played 4 tiles and drawn stock, leaving 6; seat 2 leaves 7.
  const currentFree=free.filter(t=>[0,1,2,3].some(s=>legal(boards.current,t,s)));
  const globalExtra=free.filter(t=>[0,1,2,3].some(s=>legal(boards.global,t,s)) &&
    ![0,1,2,3].some(s=>legal(boards.current,t,s)));
  assert.equal(currentFree.length,5);
  assert.equal(globalExtra.length,2);
  return {steps,free,boards};
}
function countSubsets(pos) {
  const {free,boards,steps}=pos;
  let worlds=0,currentPass=0,currentLegalTiles=0,globalLegalTiles=0;
  const hand=[steps[8]];
  function hasLegal(b,t){return [0,1,2,3].some(side=>legal(b,t,side));}
  function visit(start,left){
    if(!left){
      worlds++;
      let c=0,g=0;
      for(const t of hand){c+=+hasLegal(boards.current,t);g+=+hasLegal(boards.global,t);}
      currentPass+=+(c===0);currentLegalTiles+=c;globalLegalTiles+=g;
      return;
    }
    for(let i=start;i<=free.length-left;i++){
      hand.push(free[i]);visit(i+1,left-1);hand.pop();
    }
  }
  visit(0,6);
  return {worlds,currentPass,currentLegalTiles,globalLegalTiles};
}
function run(){
  let witnesses=0,exhaustive=0,aggregate={worlds:0,currentPass:0,currentLegalTiles:0,globalLegalTiles:0};
  const examples=[];
  for(const x of NUMBERS)for(const y of NUMBERS)for(const z of NUMBERS){
    if(new Set([x,y,z]).size!==3)continue;
    for(let w=0;w<=6;w++){
      if([1,x,y,z].includes(w))continue;
      const pos=position(x,y,z,w);
      if(witnesses%30===0){
        const c=countSubsets(pos);
        assert.deepEqual(c,{worlds:27132,currentPass:3003,currentLegalTiles:42840,globalLegalTiles:87108});
        for(const k of Object.keys(c))aggregate[k]+=c[k];
        examples.push({x,y,z,w});exhaustive++;
      }
      witnesses++;
    }
  }
  assert.equal(witnesses,360);assert.equal(exhaustive,12);
  return {passed:true,engine:'standalone-independent-branch-census/v1',
    ruleModels:'global-ever-open vs all-current-only; BOTH PROVISIONAL',
    chronologicalWitnesses:360,exhaustiveRelabels:12,
    conditionalWorldsPerRelabel:27132,conditionalForcedPassWorlds:3003,
    currentPassRate:3003/27132,globalPassRate:0,
    meanCurrentLegalDistinctTiles:42840/27132,
    meanGlobalLegalDistinctTiles:87108/27132,
    totalExhaustiveConditionalWorlds:aggregate.worlds,
    counts:aggregate,examples,
    assumptions:'Condition on a scripted 8-stone legal chronological prefix, fixed x-w ownership by seat 1, 3x9+stock with confirmed starter draw; choose seat-1 remaining 6 tiles uniformly from 19 free tiles. No conditioning on earlier strategic choices. Other sides retain open 1.',
    limitations:'Not a natural-game frequency, win rate, or authentic physical branch rule. The 12 exact checks are symmetry representatives, not independent real deals.',
    next:'Confirm late-arrival branch opening physically and blocked-tie scoring; only then measure full-game winning tactics.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,position,countSubsets};
