'use strict';
// Matched-hidden-world ONE-PLY opponent-pass comparison, not a full-game win-rate.
// Synthetic known-opponent-double information; provisional global-ever-open geometry.
// node qosha-research/simulator/public-paired-one-ply.js test
// node qosha-research/simulator/public-paired-one-ply.js 3383880 4096
const assert=require('node:assert/strict');
const e=require('./engine'),d=require('./turn-dispatcher');
const history=require('./public-history-replay');
const posterior=require('./midgame-exact-posterior');
const joint=require('./public-joint-history-bridge');
const SIDES=e.SIDES,LABELS=['seat0','seat1','seat2','stock'];
const key=e.tileKey;
function fixture(knownDouble){
 const s=history.fixture();
 s.events=[];
 s.focalHand.push([0,0]); // nine stones; all six unplayed 1-X connectors are known/played
 s.knownOpponentTiles={1:knownDouble?[[3,3]]:[],2:[]};
 return s;
}
function stateFromReplay(r){
 const b=e.createBranchState([1,1]);
 for(const side of SIDES)b.branches[side].end=r.branchEnds[side];
 return {branch:b,opening:e.createOpeningState(r.openedNumbers)};
}
function noSeat1Joint(spec,a,b){
 const j=joint.analyze(spec,a,b),total=BigInt(j.compatibleWorlds);
 let n=0n;
 for(const x of LABELS)for(const y of LABELS)
  if(x!=='seat1'&&y!=='seat1')n+=BigInt(j.jointNumerators[x][y]);
 return {n,total};
}
function audit(spec,start,count){
 assert(Number.isSafeInteger(start)&&start>=0&&Number.isSafeInteger(count)&&count>=128
  &&start+count<=4294967296,'valid disjoint uint32 seed interval required');
 const original=JSON.stringify(spec),r=history.replay(spec);
 assert.equal(r.currentPlayer,0,'focal seat0 must move next');
 assert.equal(r.stockSize,0,'first-round starter stock must be exhausted');
 assert.deepEqual(r.openedNumbers,[1],'only centre 1 is opened');
 const {branch,opening}=stateFromReplay(r);
 assert.deepEqual(r.branchEnds,{up:2,left:1,right:1,down:1});
 const known=spec.knownOpponentTiles[1].some(t=>key(t)==='3-3');
 const hand=spec.focalHand;
 const actions=d.actionsForHand(branch,opening,hand);
 const choices=['1-3','1-4'].map(k=>actions.find(a=>a.type==='single'
  &&key(a.tile)===k&&a.side==='left'));
 assert(choices.every(Boolean),'both focal choices must be legal');
 const next=choices.map(a=>e.applySinglePlacement(branch,a));
 const p=posterior.prepare(r.posteriorSpec);
 const exact=[noSeat1Joint(spec,'2-2','3-3'),noSeat1Joint(spec,'2-2','4-4')];
 assert(exact.every(x=>x.total===p.total),'independent exact owner posterior');
 if(known){
  assert.equal(exact[0].n,0n,'known 3-3 always lets seat1 respond to 1-3');
  assert.equal(exact[1].n*30n,p.total*7n,'exact alternative pass chance 7/30');
 }else{
  for(const x of exact)assert.equal(x.n*34n,p.total*7n,'uninformed symmetry 7/34');
 }
 const passes=[0,0],diffs=[],fingerprints=new Set();let replays=0;
 for(let i=0;i<count;i++){
  const seed=start+i,w=posterior.samplePrepared(p,seed);
  posterior.assertWorld(p,w);
  if(i<16){assert.deepEqual(w,posterior.samplePrepared(p,seed));replays++;}
  const response=next.map(b=>d.actionsForHand(b,opening,w.hands[1]).length>0);
  const has=(t)=>w.hands[1].some(x=>key(x)===t);
  assert.equal(response[0],has('2-2')||has('3-3'),'first candidate exact response oracle');
  assert.equal(response[1],has('2-2')||has('4-4'),'second candidate exact response oracle');
  const a=+!response[0],b=+!response[1];
  passes[0]+=a;passes[1]+=b;diffs.push(b-a);
  fingerprints.add(w.hands[1].map(key).sort().join(','));
 }
 const rates=passes.map(x=>x/count),mean=diffs.reduce((s,x)=>s+x,0)/count;
 const variance=diffs.reduce((s,x)=>s+(x-mean)**2,0)/count;
 const se=Math.sqrt(variance/count),z=rates.map((rate,i)=>{
  const target=Number(exact[i].n)/Number(exact[i].total);
  return target===0?(rate===0?0:Infinity):
   (rate-target)/Math.sqrt(target*(1-target)/count);
 });
 assert(z.every(x=>Number.isFinite(x)&&Math.abs(x)<5.5),'exact/seeded calibration');
 assert.equal(JSON.stringify(spec),original,'input history mutated');
 return {knownSeat1Double:known?'3-3':'none',compatibleWorlds:String(p.total),
  seedRange:[start,start+count-1],sampledWorlds:count,distinctSeat1Hands:fingerprints.size,
  candidateMoves:['1-3 left','1-4 left'],observedOpponentPassCounts:passes,
  observedOpponentPassRates:rates,
  exactOpponentPassFractions:exact.map(x=>String(x.n)+'/'+String(x.total)),
  exactOpponentPassRates:exact.map(x=>Number(x.n)/Number(x.total)),
  pairedDifferenceBminusA:mean,paired95pctInterval:[mean-1.96*se,mean+1.96*se],
  maxAbsoluteCalibrationZ:Math.max(...z.map(Math.abs)),replayChecks:replays};
}
function run(start=3383880,count=4096){
 assert(Number.isSafeInteger(start)&&Number.isSafeInteger(count)
  &&start>=0&&count>=128&&start+2*count<=4294967296,'seed range');
 const control=audit(fixture(false),start,count);
 const informed=audit(fixture(true),start+count,count);
 return {schema:'qosha-public-paired-one-ply/v1',
  engine:'qosa-research-0.5.3 + public-paired-one-ply/v1',
  rules:'recovered qosa-1.0.0 3x9; PROVISIONAL global-ever-open',
  seedRange:[start,start+2*count-1],newHiddenAllocations:2*count,
  newOpeningDeals:0,newCompleteRounds:0,newForcedContinuations:0,
  strategies:'paired candidate 1-3 vs 1-4; one-ply seat1 forced-pass only',
  control,informed,
  finding:'Without known opponent double, exact immediate-pass chances are identical (7/34 each). If seat1 is known to hold 3-3, playing 1-4 rather than 1-3 increases immediate seat1 forced-pass chance from 0 to 7/30.',
  confidence:'Exact joint owner count cross-checked with seeded same-world legal-action enumeration; synthetic conditional scenario',
  limitations:'NOT a first-place, pip, minus, block or regret outcome; next player pass is only a one-ply proxy. Known 3-3 is hypothetical. Branch rule provisional; uniform worlds ignore opponent choice likelihood.',
  nextAction:'Test multiple observed pass histories and compare full matched-seed continuations only after authenticating branch reopening and blocked ties.'};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?run(3383880,128):
  run(a[0]===undefined?3383880:Number(a[0]),a[1]===undefined?4096:Number(a[1])),null,2));
}
module.exports={fixture,audit,run};
