'use strict';
// End-to-end exact ownership marginals from a chronological PUBLIC trace.
// Branch legality remains PROVISIONAL global-ever-open. No game simulations.
// Usage: node qosha-research/simulator/public-ownership-bridge.js test|fixture|trace.json
const assert=require('node:assert/strict');
const fs=require('node:fs');
const history=require('./public-history-replay');
const ownership=require('./public-pass-ownership');
const posterior=require('./midgame-exact-posterior');
const legacyBridge=require('./public-pass-inference-bridge');
const key=t=>Array.isArray(t)?[Math.min(...t),Math.max(...t)].join('-'):t;
function analyze(spec){
 const r=history.replay(spec),p=r.posteriorSpec;
 assert(p&&Array.isArray(p.focalHand),'a verified focal hand is required');
 const known={0:p.focalHand,1:p.knownOpponentTiles[1]||[],2:p.knownOpponentTiles[2]||[],3:[]};
 const masks={1:[],2:[]};
 for(const o of p.passObservations){
  assert([1,2].includes(o.player)&&o.noInterveningDraw===true,'only verified hidden-seat no-acquisition passes');
  assert(o.source.includes('provisional global-ever-open'),'branch model provenance required');
  masks[o.player].push(o.forbiddenTiles);
 }
 const exact=ownership.analyzeOwnership({played:r.playedTiles,handSizes:r.handSizes,
  stockSize:r.stockSize,known,passMasks:masks});
 assert(exact.possible,'no compatible allocations');
 const reference=posterior.prepare(p),legacy=legacyBridge.analyze(spec);
 assert.equal(BigInt(exact.compatibleWorlds),reference.total,'ownership versus exact sampler count');
 assert.equal(BigInt(exact.compatibleWorlds),BigInt(legacy.compatibleWorlds),'ownership versus existing ledger count');
 const fixed=new Set([...r.playedTiles,...Object.values(known).flat()].map(key));
 let compared=0;
 for(const [tile,m] of Object.entries(exact.marginals)){
  if(fixed.has(tile))continue;
  const q=legacy.probabilities?.[tile];
  assert(q,'missing existing posterior for hidden tile '+tile);
  for(const owner of ['seat1','seat2','stock']){
   const n=BigInt(m.numerators[owner]),total=BigInt(exact.compatibleWorlds);
   assert(Math.abs(Number(n)/Number(total)-q[owner])<1e-12,'posterior mismatch '+tile+'/'+owner);
  }
  assert.equal(m.numerators.seat0,'0','unknown tile cannot belong to fixed focal hand');
  compared++;
 }
 const certain=Object.fromEntries(Object.entries(exact.marginals)
  .filter(([,m])=>m.certain!==null).map(([tile,m])=>[tile,m.certain]));
 return {schema:'qosha-public-ownership-bridge/v1',engine:'qosa-research-0.5.3',
  rules:'recovered qosa-1.0.0 3x9; PROVISIONAL global-ever-open public replay',
  compatibleWorlds:exact.compatibleWorlds,played:r.playedTiles.length,
  handSizes:r.handSizes,stockSize:r.stockSize,observedPasses:r.passCount,
  eligibleHiddenPasses:r.activeNoStockPasses,crossCheckedHiddenTiles:compared,
  threeWayExactCrossCheck:true,certain,marginals:exact.marginals,
  limitations:'Uniform conditional allocations, not opponent-choice probabilities. Public replay branch legality is provisional; only verified forced no-acquisition passes count. No block/tie or win-rate inference.'};
}
function test(){
 const cases=[];
 const base=history.fixture();
 cases.push(['onePass',base,'5005']);
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
 let tiles=0;
 for(const [name,s,count] of cases){
  const before=JSON.stringify(s),r=analyze(s);
  assert.equal(r.compatibleWorlds,count,name);
  assert.equal(JSON.stringify(s),before,'source mutated: '+name);
  assert.equal(r.marginals['1-1'],undefined,'played tile must not have owner marginal');
  assert.equal(r.marginals[key(s.focalHand[0])].certain,'seat0','focal ownership');
  tiles+=r.crossCheckedHiddenTiles;
  if(name==='knownOpponent')assert.equal(r.marginals['3-6'].certain,'seat1');
  if(name==='knownDraw')assert.equal(r.marginals['3-6'].certain,'seat2');
  if(name==='focalPass')assert.equal(r.eligibleHiddenPasses,0);
 }
 assert.throws(()=>analyze({...history.fixture(),model:'provisional-current-only'}));
 const missing=history.fixture();delete missing.focalHand;
 assert.throws(()=>analyze(missing),/focal hand/);
 return {passed:true,scenarios:cases.length,negativeGuards:2,
  exactWorldCounts:Object.fromEntries(cases.map(([name,,count])=>[name,count])),
  crossCheckedHiddenTileMarginals:tiles,newDeals:0,newRandomWorlds:0,newCompleteRounds:0,
  finding:'Chronological verified passes now yield all four owner marginals, independently reconciled with both existing exact counters. No physical branch or winning-strategy claim.'};
}
if(require.main===module){
 const arg=process.argv[2]||'test';
 console.log(JSON.stringify(arg==='test'?test():analyze(arg==='fixture'?history.fixture():
  JSON.parse(fs.readFileSync(arg,'utf8'))),null,2));
}
module.exports={analyze,test};
