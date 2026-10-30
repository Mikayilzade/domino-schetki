'use strict';
// Connect chronological public replay to the conservative stock-aware exact
// ownership ledger. Replay geometry is PROVISIONAL global-ever-open only.
// Usage: node qosha-research/simulator/public-pass-inference-bridge.js test|fixture|trace.json
const assert=require('node:assert/strict');
const fs=require('node:fs');
const history=require('./public-history-replay');
const exact=require('./midgame-exact-posterior');
const ledger=require('./forced-pass-inference');
const key=t=>t[0]+'-'+t[1];
function inputFromReplay(r){
 assert(r&&r.model==='provisional-global-ever-open','explicit provisional global-ever-open replay required');
 const p=r.posteriorSpec;
 assert(p&&Array.isArray(p.focalHand),'replay must include a verified focalHand');
 assert.equal(r.activeNoStockPasses,p.passObservations.length,'active pass count mismatch');
 const masks={seat1:[],seat2:[]};
 for(const o of p.passObservations){
  assert([1,2].includes(o.player),'focal player pass is not a hidden-owner constraint');
  assert.equal(o.noInterveningDraw,true,'pass cannot constrain a later acquired hand');
  assert(typeof o.source==='string'&&o.source.includes('provisional global-ever-open'),
   'pass legal mask must come from labelled chronological replay');
  assert(Array.isArray(o.forbiddenTiles),'missing replay legal mask');
  masks['seat'+o.player].push(o.forbiddenTiles.map(key));
 }
 return {snapshotNoInterveningDraws:true,own:p.focalHand.map(key),
  played:p.playedTiles.map(key),
  knownSeat1:(p.knownOpponentTiles[1]||[]).map(key),
  knownSeat2:(p.knownOpponentTiles[2]||[]).map(key),
  counts:{seat1:p.handSizes[1],seat2:p.handSizes[2],stock:p.stockSize},
  passMasks:masks};
}
function analyze(spec){
 const r=history.replay(spec),input=inputFromReplay(r);
 const answer=ledger.infer(input),benchmark=exact.prepare(r.posteriorSpec);
 assert.equal(BigInt(answer.compatibleWorlds),benchmark.total,
  'two independent exact conditional counters disagree');
 return {schema:'qosha-public-pass-inference-bridge/v1',
  rules:'recovered qosa-1.0.0, 3x9; branch global-ever-open PROVISIONAL',
  openingSource:r.openingSource,played:r.playedTiles.length,
  observedPasses:r.passCount,eligibleNoAcquisitionPasses:r.activeNoStockPasses,
  discardedPasses:r.discardedPasses,handSizes:r.handSizes,stock:r.stockSize,
  exactCrossCheck:true,compatibleWorlds:answer.compatibleWorlds,
  inconsistent:answer.inconsistent,certain:answer.certain,
  probabilities:answer.probabilities,
  limitations:'Only externally observed forced passes; replayed legal masks assume unverified global-ever-open. Later-acquisition passes are discarded. Uniform allocations are not human-policy probabilities; no game-win or scoring claim.'};
}
function test(){
 const base=history.fixture(),copy=JSON.stringify(base);
 const a=analyze(base);
 assert.equal(a.compatibleWorlds,5005);
 assert.equal(a.eligibleNoAcquisitionPasses,1);
 const noPass=history.fixture();noPass.events=noPass.events.slice(0,1);
 const noPassResult=analyze(noPass);
 assert.equal(noPassResult.compatibleWorlds,24310);
 assert.equal(noPassResult.observedPasses,0);
 assert.equal(noPassResult.eligibleNoAcquisitionPasses,0);
 const staleHand=history.fixture();staleHand.events=[];
 assert.throws(()=>analyze(staleHand),/focal hand count mismatch/);
 const drawn=history.fixture();drawn.opening.drawnTile=[3,6];
 assert.equal(analyze(drawn).compatibleWorlds,2002);
 const stock=history.fixture();stock.opening={starter:2,fromStock:true,
  stockDraw:false,isFirstRound:false,previousWinnerIndex:2,
  followup:{tile:[1,2],side:'up'}};
 assert.equal(analyze(stock).compatibleWorlds,5005);
 const known=history.fixture();known.knownOpponentTiles={1:[[3,6]],2:[]};
 assert.equal(analyze(known).compatibleWorlds,3003);
 assert.equal(JSON.stringify(base),copy,'source mutated');
 assert.throws(()=>inputFromReplay({model:'provisional-current-only',posteriorSpec:{}}));
 assert.throws(()=>inputFromReplay({model:'provisional-global-ever-open'}));
 const corrupted=history.replay(base);
 corrupted.posteriorSpec.passObservations[0].noInterveningDraw=false;
 assert.throws(()=>inputFromReplay(corrupted));
 const wrongSource=history.replay(base);
 wrongSource.posteriorSpec.passObservations[0].source='unverified mask';
 assert.throws(()=>inputFromReplay(wrongSource));
 return {passed:true,scenarios:5,negativeGuards:5,
  expectedCompatibleWorlds:{singlePass:5005,noPass:24310,knownDraw:2002,
   stockOpening:5005,knownOpponentTile:3003},
  newSeededDeals:0,newRandomHiddenWorlds:0,newCompleteRounds:0,
  finding:'Chronological provisional legal masks feed the independent exact stock-aware ledger without manual mask transcription; identical conditional world counts across five controls.'};
}
if(require.main===module){
 const arg=process.argv[2]||'test';
 const output=arg==='test'?test():analyze(arg==='fixture'?history.fixture():
  JSON.parse(fs.readFileSync(arg,'utf8')));
 console.log(JSON.stringify(output,null,2));
}
module.exports={inputFromReplay,analyze,test};
