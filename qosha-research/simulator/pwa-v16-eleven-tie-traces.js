'use strict';
/**
 * Reconstruct the 11 unique v16 tie boundaries, with all six event orders.
 * No physical block scoring; no changes to live PWA. Deterministic replay.
 * Usage: node simulator/pwa-v16-eleven-tie-traces.js > runs/tie-traces.json
 */
const engine=require('./engine');
const initializer=require('./initializer');
const round=require('./round-driver');
const legacy=require('./finish-score-match-integration');
const v16=require('./finish-score-match-integration-v16');
const reference=require('./pwa-v16-tie-audit');
const orders=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
const cohorts=[17000000,18000000,19000000,20000000];
function assert(x,m){if(!x)throw Error(m);}
function fresh(){return [0,1,2].map(i=>({id:'P'+i,score:0,exploded:false}));}
function choose(opts,state,seed){
 if(opts.phase!=='play'||!opts.actions.length)return null;
 const h=engine.mixSeed32((seed ^ Math.imul(state.turns+1,0x9e3779b9) ^
 Math.imul(state.currentPlayer+1,0x85ebca6b) ^ 0x51)>>>0);
 return opts.actions[h%opts.actions.length];
}
function trace(before,deltas,order){
 let current=before.map(x=>({...x}));const events=[],applied=new Set();
 let finished=false,draw=false,places=[];
 for(const seat of order){
  const delta=deltas[seat];
  if(delta===0){applied.add(seat);continue;}
  const pre=current[seat].score;
  const result=require('./match-scoring-v16').evaluateQoshaScoreEvent(current,current[seat].id,delta);
  current=result.entities;applied.add(seat);
  events.push({seat,delta,preScore:pre,postScore:current[seat].score,ignored:!!result.ignored,finished:result.finished});
  if(result.finished){finished=true;draw=!!result.isDraw;places=result.places;break;}
 }
 return {entities:current,events,finished,isDraw:draw,places,
  pending:order.filter(seat=>!applied.has(seat)&&deltas[seat]!==0),
  skippedZero:order.filter(seat=>deltas[seat]===0)};
}
function audit(startSeed,accepted=1000){
 const arms=orders.map(order=>({order,entities:fresh(),boundaries:[]}));
 const ties=new Map();let cursor=startSeed,redeals=0,finishes=0,blocks=0;
 for(let index=0;index<accepted;index++){
  let setup,seed;
  do{
   seed=cursor++;
   setup=initializer.initializeThreePlayerRoundFromDeal({...engine.dealThreeByNine(seed),isFirstRound:true});
   if(setup.kind==='redeal')redeals++;
   else assert(setup.kind==='ready','initializer failed');
  }while(setup.kind==='redeal');
  const terminal=round.runRound(setup,(opts,state)=>choose(opts,state,seed),{maxTurns:200});
  assert(terminal.outcome&&['finish','block'].includes(terminal.outcome.kind),'unresolved');
  if(terminal.outcome.kind==='block'){blocks++;continue;}
  finishes++;
  const mapped=legacy.finishOutcomeToDeltas(terminal.outcome,3);
  for(const arm of arms){
   const before=arm.entities.map(x=>({...x}));
   const actual=v16.applyFinishOutcomeToMatch(before,terminal.outcome,{seatOrder:arm.order});
   const replay=trace(before,mapped.deltas,arm.order);
   assert(JSON.stringify(actual.entities)===JSON.stringify(replay.entities),'entities differ');
   assert(JSON.stringify(actual.places)===JSON.stringify(replay.places),'places differ');
   assert(JSON.stringify(actual.pendingSeats)===JSON.stringify(replay.pending),'pending differ');
   assert(actual.isDraw===replay.isDraw,'draw differs');
   arm.entities=actual.entities;
   if(actual.finished){
    arm.boundaries.push(index);
    if(actual.isDraw){
     if(!ties.has(index))ties.set(index,{roundIndex:index,seed,arms:[]});
     ties.get(index).arms.push({order:arm.order.join('-'),preScores:before.map(x=>x.score),
       deltas:mapped.deltas,events:replay.events,pending:replay.pending,
       survivorScores:replay.entities.filter(x=>!x.exploded).map(x=>({id:x.id,score:x.score})),
       places:replay.places,isDraw:true});
    }
    arm.entities=fresh();
   }
  }
 }
 const expected=reference.auditCohort(startSeed,accepted);
 assert(expected.tieArmEvents===Array.from(ties.values()).reduce((n,x)=>n+x.arms.length,0),'tie arm count drift');
 assert(expected.uniqueTieFinishOrdinals===ties.size,'unique tie boundary drift');
 assert(arms.every(a=>JSON.stringify(a.boundaries)===JSON.stringify(arms[0].boundaries)),'match boundary drift');
 return {startSeed,endSeed:cursor-1,accepted,redeals,finishes,blocks,
   completedMatches:arms[0].boundaries.length,tieArmEvents:expected.tieArmEvents,
   uniqueTieBoundaries:ties.size,ties:[...ties.values()]};
}
function run(){
 const results=cohorts.map(seed=>audit(seed));
 assert(results.reduce((n,x)=>n+x.uniqueTieBoundaries,0)===11,'expected 11 unique boundaries');
 assert(results.reduce((n,x)=>n+x.tieArmEvents,0)===30,'expected 30 tie arms');
 return {schema:'qosa-pwa-v16-tie-boundary-traces/v1',engine:'qosha-research-0.5.3',
  rules:'qosa-1.0.0 coded 3x9; terminal pip mapping provisional; blocks unscored',
  policy:'seed/turn/player hash legal action; no strategy comparison',results,
  limitations:'Dependent six-order replays, not independent tie samples. PWA implementation, not physical table rules.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,audit,trace};
