'use strict';
// Chronological public trace -> conditional hidden worlds -> exact joint-owner calibration.
// Branch model is PROVISIONAL global-ever-open; all fixtures are synthetic.
// node qosha-research/simulator/public-history-joint-sampler.js test
// node qosha-research/simulator/public-history-joint-sampler.js 3377736 1024
const assert=require('node:assert/strict');
const history=require('./public-history-replay');
const posterior=require('./midgame-exact-posterior');
const bridge=require('./public-joint-history-bridge');
const LABELS=['seat0','seat1','seat2','stock'];
const key=t=>Array.isArray(t)?Math.min(...t)+'-'+Math.max(...t):t;
function fixtures(){
 const base=history.fixture(),noPass=history.fixture();noPass.events=noPass.events.slice(0,1);
 const knownDraw=history.fixture();knownDraw.opening.drawnTile=[3,6];
 const stockOpening=history.fixture();stockOpening.opening={starter:2,fromStock:true,
  stockDraw:false,isFirstRound:false,previousWinnerIndex:2,
  followup:{tile:[1,2],side:'up'}};
 const knownOpponent=history.fixture();knownOpponent.knownOpponentTiles={1:[[3,6]],2:[]};
 return [['onePass',base],['noPass',noPass],['knownDraw',knownDraw],
  ['stockOpening',stockOpening],['knownOpponent',knownOpponent],
  ['focalPass',history.focalPassFixture()]];
}
function owner(world,tile){
 const k=key(tile),owners=[...world.hands,world.stock];
 const matches=owners.flatMap((hand,i)=>hand.some(t=>key(t)===k)?[i]:[]);
 assert.equal(matches.length,1,'exactly one owner for '+k);
 return LABELS[matches[0]];
}
function calibrate(spec,startSeed,count,tileA='3-6',tileB='4-6'){
 assert(Number.isSafeInteger(startSeed)&&startSeed>=0&&startSeed+count<=4294967296,
  'seed must be unique uint32');
 assert(Number.isSafeInteger(count)&&count>=128,'at least 128 worlds required');
 const before=JSON.stringify(spec),replay=history.replay(spec);
 assert(replay.posteriorSpec,'verified focal hand required');
 const prepared=posterior.prepare(replay.posteriorSpec);
 const exact=bridge.analyze(spec,tileA,tileB);
 assert.equal(String(prepared.total),exact.compatibleWorlds,'posterior/joint world counts');
 const counts=Object.fromEntries(LABELS.map(a=>[a,Object.fromEntries(LABELS.map(b=>[b,0]))]));
 const fingerprints=new Set();let replayChecks=0;
 for(let i=0;i<count;i++){
  const seed=startSeed+i,w=posterior.samplePrepared(prepared,seed);
  posterior.assertWorld(prepared,w);
  if(i<16){
   assert.equal(JSON.stringify(w),JSON.stringify(posterior.samplePrepared(prepared,seed)),
    'seed replay');replayChecks++;
  }
  counts[owner(w,tileA)][owner(w,tileB)]++;
  fingerprints.add(JSON.stringify([w.hands[1].map(key).sort(),
   w.hands[2].map(key).sort(),w.stock.map(key).sort()]));
 }
 assert.equal(JSON.stringify(spec),before,'input trace mutated');
 let cells=0,maxAbsZ=0,nontrivial=0;
 for(const a of LABELS)for(const b of LABELS){
  const p=Number(BigInt(exact.jointNumerators[a][b]))/Number(prepared.total);
  const observed=counts[a][b]/count;cells++;
  if(p===0)assert.equal(counts[a][b],0,'impossible owner pair sampled');
  else if(p===1)assert.equal(counts[a][b],count,'certain owner pair missed');
  else {
   const z=(observed-p)/Math.sqrt(p*(1-p)/count);
   maxAbsZ=Math.max(maxAbsZ,Math.abs(z));nontrivial++;
   assert(Math.abs(z)<5.5,'seeded joint posterior mismatch '+a+'/'+b+' z='+z);
  }
 }
 assert.equal(LABELS.reduce((sum,a)=>sum+LABELS.reduce((s,b)=>s+counts[a][b],0),0),count);
 return {compatibleWorlds:exact.compatibleWorlds,observedPasses:exact.observedPasses,
  eligibleHiddenPasses:exact.eligibleHiddenPasses,seedRange:[startSeed,startSeed+count-1],
  worlds:count,distinctAllocations:fingerprints.size,ownerMatrixCounts:counts,
  exactJointNumerators:exact.jointNumerators,cells,nontrivialCells:nontrivial,
  maxAbsZ,replayChecks};
}
function run(start=3377736,countPerScenario=1024){
 assert(Number.isSafeInteger(countPerScenario)&&countPerScenario>=128,'bad count');
 const cases=fixtures(),before=cases.map(([,s])=>JSON.stringify(s));
 const scenarios={};let worlds=0,cells=0,maxAbsZ=0;
 for(let i=0;i<cases.length;i++){
  const [name,spec]=cases[i],r=calibrate(spec,start+i*countPerScenario,countPerScenario);
  scenarios[name]=r;worlds+=r.worlds;cells+=r.cells;
  maxAbsZ=Math.max(maxAbsZ,r.maxAbsZ);
  assert.equal(JSON.stringify(spec),before[i],'fixture mutated '+name);
 }
 assert.equal(worlds,cases.length*countPerScenario);
 const row=(m,a)=>LABELS.reduce((s,b)=>s+m[a][b],0);
 assert.equal(row(scenarios.knownDraw.ownerMatrixCounts,'seat2'),countPerScenario,
  'known opening draw must remain with seat2');
 assert.equal(row(scenarios.knownOpponent.ownerMatrixCounts,'seat1'),countPerScenario,
  'known opponent tile must remain with seat1');
 return {schema:'qosha-public-history-joint-sampler/v1',
  engine:'qosa-research-0.5.3 + public-history-joint-sampler/v1',
  rules:'recovered qosa-1.0.0 3x9; PROVISIONAL global-ever-open replay',
  seedRange:[start,start+worlds-1],newDeals:0,newHiddenAllocations:worlds,
  newCompleteRounds:0,newForcedContinuations:0,strategies:'none; conditional owner calibration',
  scenarios,checkedOwnerCells:cells,maxAbsZ,
  finding:'Chronological public history and exact conditional sampling agree on joint owner distributions across six pass/draw/known-tile fixtures.',
  confidence:'synthetic deterministic V8/Node tests; exact DP target; per-cell 5.5-sigma calibration guard',
  limitations:'All passes synthetic; uniform hidden allocations ignore opponent move likelihood; provisional branch opening, block ties, loneZero, bust and 101 scoring unresolved. No win-rate or tactical claim.',
  nextAction:'Use authenticated physical chronological passes; then construct a replay-derived visible round state and compare legal moves on identical sampled worlds without assuming blocked-tie outcomes.'};
}
if(require.main===module){
 const args=process.argv.slice(2),isTest=args[0]==='test';
 console.log(JSON.stringify(isTest?run(3377736,128):
  run(args[0]===undefined?3377736:Number(args[0]),
      args[1]===undefined?1024:Number(args[1])),null,2));
}
module.exports={fixtures,owner,calibrate,run};
