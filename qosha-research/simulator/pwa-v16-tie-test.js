'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const legacy = require('./finish-score-match-integration');
const v16 = require('./finish-score-match-integration-v16');
const audit = require('./pwa-v16-tie-audit');
const entities = scores => scores.map((score,i)=>({id:'P'+i,score,exploded:false}));
function extract(src, anchor, tail) {
  const start=src.indexOf(anchor);
  assert.ok(start>=0,'missing active PWA source anchor '+anchor);
  const end=src.indexOf(tail,start);
  assert.ok(end>=0,'missing active PWA source terminator '+tail);
  return src.slice(start,end+tail.length);
}
function sourceOracle() {
  // Execute ONLY the extracted read-only Qoşa evaluate functions in a stubbed
  // harness, not the live app or its DOM/storage/network side effects.
  const v14=fs.readFileSync(path.resolve(__dirname,'../../scoreboard-v14.js'),'utf8');
  const v16src=fs.readFileSync(path.resolve(__dirname,'../../scoreboard-v16.js'),'utf8');
  const e14=extract(v14,'evaluate=function(g,e,delta){','\n};');
  const draw=extract(v16src,'function drawPlacesV16(entities,points){','\n}');
  const e16=extract(v16src,'evaluate=function(g,e,delta){','\n};');
  const factory=new Function('refreshEntityLabelsV14','scoreNameForEntity','addHistory','displayPlaceV14','state','rankNormal','terminalTieV16',
    'let evaluate; '+e14+'\n'+draw+'\nconst evaluateV16Base=evaluate;\n'+e16+'\nreturn evaluate;');
  return factory(()=>{},e=>e.id,()=>{},(e,p)=>({...e,points:p}),{calculator:{phoneKind:'play'}},()=>[],()=>[]);
}
function pwaFixture(evaluatePwa,pre,deltas,order) {
  const g={mode:'qosha',pendingResult:null,entities:entities(pre)};
  for(const seat of order){
    if(deltas[seat]===0)continue;
    const e=g.entities[seat];
    e.score=Math.max(0,e.score+deltas[seat]);
    evaluatePwa(g,e,deltas[seat]);
    if(g.pendingResult)break;
  }
  return {scores:g.entities.map(e=>e.score),draw:!!g.pendingResult?.isDrawV16,points:g.pendingResult?.places.map(x=>x.points)||[],finished:!!g.pendingResult};
}
function test() {
  let assertions=0;
  const eq=(a,b,msg)=>{assert.deepStrictEqual(a,b,msg);assertions++;};
  const pwa=sourceOracle();
  const scenarios=[
    {pre:[100,70,70],out:{kind:'finish',playerIndex:2,minus:0,remainders:[1,0,0]},order:[0,1,2],draw:true,points:[1.5,1.5]},
    {pre:[100,70,70],out:{kind:'finish',playerIndex:2,minus:0,remainders:[1,10,0]},order:[0,1,2],draw:true,points:[1.5,1.5],pending:[1]},
    {pre:[100,70,70],out:{kind:'finish',playerIndex:2,minus:0,remainders:[1,10,0]},order:[1,0,2],draw:false,points:[2,1]},
    {pre:[100,70,70],out:{kind:'finish',playerIndex:1,minus:-10,remainders:[1,0,0]},order:[0,1,2],draw:true,points:[1.5,1.5],pending:[1]},
    {pre:[100,70,70],out:{kind:'finish',playerIndex:1,minus:-10,remainders:[1,0,0]},order:[1,0,2],draw:false,points:[2,1]},
    {pre:[100,70,71],out:{kind:'finish',playerIndex:2,minus:0,remainders:[1,0,0]},order:[0,1,2],draw:false,points:[2,1]}
  ];
  for(const s of scenarios){
    const actual=v16.applyFinishOutcomeToMatch(entities(s.pre),s.out,{seatOrder:s.order});
    const deltas=legacy.finishOutcomeToDeltas(s.out).deltas;
    const oracle=pwaFixture(pwa,s.pre,deltas,s.order);
    eq(actual.entities.map(x=>x.score),oracle.scores,'PWA source score match');
    eq(actual.isDraw,oracle.draw,'PWA source tie flag');
    eq(actual.places.map(x=>x.points),oracle.points,'PWA source points');
    eq(actual.isDraw,s.draw,'fixture tie expectation');
    eq(actual.places.map(x=>x.points),s.points,'fixture points expectation');
    if(s.pending)eq(actual.pendingSeats,s.pending,'pending event fixture');
    if(s.draw)eq(actual.places.every(x=>x.place===null),true,'draw has no unique first place');
  }
  const old=legacy.applyFinishOutcomeToMatch(entities([100,70,70]),scenarios[0].out);
  eq(old.places.map(x=>x.points),[2,1],'historical adapter unchanged');
  const block=v16.applyFinishOutcomeToMatch(entities([3,4,5]),{kind:'block',remainders:[3,4,5]});
  eq(block.unscored,true,'block remains unscored');
  const smoke=audit.auditCohort(20000000,40);
  eq(smoke.seed.acceptedRounds,40,'40-deal smoke');
  eq(audit.auditCohort(20000000,40),smoke,'deterministic smoke replay');
  const full=audit.runAudit();
  eq(full.cohorts.map(x=>x.tieArmEvents),[8,9,9,4],'tie arm event census');
  eq(full.cohorts.map(x=>x.uniqueTieFinishOrdinals),[3,3,3,2],'unique tied finish census');
  eq(full.cohorts.map(x=>x.historical.pairwisePlaceChanges),[206,188,137,154],'legacy pairwise place census');
  eq(full.cohorts.map(x=>x.v16.pairwisePlaceChanges),[214,188,155,165],'v16 pairwise place census');
  eq(full.cohorts.map(x=>x.v16.completedMatchesPerOrder[0]),[75,72,73,76],'match boundary census');
  return {passed:true,assertions,cohorts:4,acceptedOutcomes:4000,newDeals:0,tieArmEvents:30,uniqueTieBoundaries:11};
}
if(require.main===module)process.stdout.write(JSON.stringify(test(),null,2)+'\n');
module.exports={test};
