'use strict';
// Exact joint hidden-tile ownership from a chronological PUBLIC move/pass trace.
// Public branch legality is PROVISIONAL global-ever-open; observed passes must be real.
const assert=require('node:assert/strict');
const history=require('./public-history-replay');
const joint=require('./public-pass-joint-ownership');
const marginalBridge=require('./public-ownership-bridge');
const LABELS=['seat0','seat1','seat2','stock'];
function analyze(spec,a,b){
 const replay=history.replay(spec),p=replay.posteriorSpec;
 assert(p&&Array.isArray(p.focalHand),'verified focal hand required');
 const known={0:p.focalHand,1:p.knownOpponentTiles[1]||[],2:p.knownOpponentTiles[2]||[],3:[]};
 const masks={1:[],2:[]};
 for(const o of p.passObservations){
  assert([1,2].includes(o.player)&&o.noInterveningDraw===true,'verified hidden no-acquisition pass required');
  assert(typeof o.source==='string'&&o.source.includes('provisional global-ever-open'),'branch provenance required');
  masks[o.player].push(o.forbiddenTiles);
 }
 const specExact={played:replay.playedTiles,handSizes:replay.handSizes,
  stockSize:replay.stockSize,known,passMasks:masks};
 const result=joint.analyzeJoint(specExact,a,b);
 assert(result.possible,'no compatible allocations');
 const reference=marginalBridge.analyze(spec);
 assert.equal(result.compatibleWorlds,reference.compatibleWorlds,'joint vs independent marginal total');
 const total=BigInt(result.compatibleWorlds);
 for(let k=0;k<2;k++){
  const tile=result.tiles[k],m=reference.marginals[tile];
  assert(m,'missing reference marginal '+tile);
  for(const owner of LABELS){
   const n=k===0?LABELS.reduce((s,other)=>s+BigInt(result.jointNumerators[owner][other]),0n):
    LABELS.reduce((s,other)=>s+BigInt(result.jointNumerators[other][owner]),0n);
   assert.equal(n,BigInt(m.numerators[owner]),'joint/marginal mismatch '+tile+'/'+owner);
  }
 }
 return {schema:'qosha-public-joint-history-bridge/v1',
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9; PROVISIONAL global-ever-open public replay',
  tiles:result.tiles,compatibleWorlds:result.compatibleWorlds,observedPasses:replay.passCount,
  eligibleHiddenPasses:replay.activeNoStockPasses,played:replay.playedTiles.length,
  handSizes:replay.handSizes,stockSize:replay.stockSize,
  jointNumerators:result.jointNumerators,marginals:result.marginals,
  sameOwnerProbability:result.sameOwnerProbability,independentMarginalCrossCheck:true,
  limitations:'Synthetic tests only. A real observed forced pass must be authenticated. Uniform conditional worlds are not opponent-policy likelihood; physical late-arrival reopening, blocked ties and match scoring unresolved.'};
}
function test(){
 const base=history.fixture(),cases=[['onePass',base,'5005']];
 const noPass=history.fixture();noPass.events=noPass.events.slice(0,1);
 cases.push(['noPass',noPass,'24310']);
 const knownDraw=history.fixture();knownDraw.opening.drawnTile=[3,6];
 cases.push(['knownDraw',knownDraw,'2002']);
 const stock=history.fixture();stock.opening={starter:2,fromStock:true,stockDraw:false,
  isFirstRound:false,previousWinnerIndex:2,followup:{tile:[1,2],side:'up'}};
 cases.push(['stockOpening',stock,'5005']);
 const knownOpponent=history.fixture();knownOpponent.knownOpponentTiles={1:[[3,6]],2:[]};
 cases.push(['knownOpponent',knownOpponent,'3003']);
 cases.push(['focalPass',history.focalPassFixture(),'6435']);
 let cells=0,exactWorlds=0n,nonzero=0,knownDrawCertain=false,knownOpponentCertain=false;
 for(const [name,s,count] of cases){
  const before=JSON.stringify(s),r=analyze(s,'3-6','4-6');
  assert.equal(r.compatibleWorlds,count,name);
  assert.equal(JSON.stringify(s),before,'source mutated '+name);
  let sum=0n;
  for(const owner of LABELS)for(const other of LABELS){
   const v=BigInt(r.jointNumerators[owner][other]);sum+=v;cells++;nonzero+=Number(v>0n);
  }
  assert.equal(sum,BigInt(count),'joint mass '+name);exactWorlds+=sum;
  if(name==='knownDraw'){assert.equal(r.marginals['3-6'].seat2,1);knownDrawCertain=true;}
  if(name==='knownOpponent'){assert.equal(r.marginals['3-6'].seat1,1);knownOpponentCertain=true;}
 }
 assert(knownDrawCertain&&knownOpponentCertain);
 assert.throws(()=>analyze(base,'1-1','3-6'),/played/);
 assert.throws(()=>analyze(base,'3-6','3-6'),/distinct/);
 assert.throws(()=>analyze(base,'7-7','3-6'),/invalid/);
 assert.throws(()=>analyze({...base,model:'provisional-current-only'},'3-6','4-6'));
 const missing=history.fixture();delete missing.focalHand;
 assert.throws(()=>analyze(missing,'3-6','4-6'),/focal hand/);
 return {passed:true,scenarios:cases.length,jointCellsChecked:cells,nonzeroCells:nonzero,
  compatibleWorldsAcrossScenarios:String(exactWorlds),negativeGuards:5,
  worldCounts:Object.fromEntries(cases.map(([name,,count])=>[name,count])),
  newDeals:0,newHiddenAllocations:0,newCompleteRounds:0,
  finding:'Chronological replay now yields exact joint tile-owner probabilities, including fixed known draws and observed no-acquisition passes, independently reconciled with marginal and posterior engines.'};
}
if(require.main===module)console.log(JSON.stringify(test(),null,2));
module.exports={analyze,test};
