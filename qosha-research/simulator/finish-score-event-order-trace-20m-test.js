'use strict';
const {runTraceAudit,traceFixture}=require('./finish-score-event-order-trace-20m');
function runTests(){
  let assertions=0;
  function ok(value,message){assertions++;if(!value)throw new Error(message);}
  function equal(a,b,message){ok(JSON.stringify(a)===JSON.stringify(b),message);}
  const a=runTraceAudit({startSeed:20000000,acceptedRounds:1000});
  const s=a.analysis;
  equal(a.seed,{start:20000000,end:20001034,attempts:1035,redeals:35,acceptedRounds:1000,uniqueAllocations:1000},'seed replay drift');
  equal(a.roundOutcomes,{finishes:942,blocks:58},'round outcome drift');
  ok(a.sixOrders.every(x=>x.completedMatches===76),'six order boundary drift');
  ok(s.pairwiseRankChanges11to20SameExploded===26,'rank change count');
  ok(s.explodedSeatDifferences11to20===0,'exploded identity changed');
  ok(s.changedSurvivorScores===26,'survivor score attribution');
  ok(s.changedPendingSurvivorSet===26,'pending attribution');
  ok(s.sortOnly===0,'pure sort classification');
  ok(s.changedPreRoundScores===0,'pre-round score drift');
  ok(s.uniqueAffectedBoundaries===3,'unique affected boundaries');
  equal(s.comparisonsPerBoundary,[{roundIndex:560,contrasts:9},{roundIndex:801,contrasts:9},{roundIndex:856,contrasts:8}],'boundary clustering');
  ok(a.caseTraces.length===26,'full event trace coverage');
  for(const trace of a.caseTraces){
    ok(trace.minGap>=11&&trace.minGap<=20,'trace bin');
    equal(trace.preScoresA,trace.preScoresB,'trace pre-round');
    ok(trace.a.events.some(x=>x.crossed)&&trace.b.events.some(x=>x.crossed),'trace crossing');
    ok(JSON.stringify(trace.a.places)!==JSON.stringify(trace.b.places),'trace place difference');
    ok(JSON.stringify(trace.a.pending)!==JSON.stringify(trace.b.pending),'trace pending difference');
  }
  const fixture=traceFixture();
  ok(JSON.stringify(fixture.aPlaces)!==JSON.stringify(fixture.bPlaces),'fixture must change rank');
  ok(fixture.aPending.includes(1)&&!fixture.bPending.includes(1),'fixture pending');
  const b=runTraceAudit({startSeed:20000000,acceptedRounds:1000});
  equal(a,b,'exact deterministic replay');
  const smoke=runTraceAudit({startSeed:20000000,acceptedRounds:40});
  ok(smoke.seed.acceptedRounds===40&&smoke.validation.passed,'40-round smoke');
  return {passed:true,assertions,fullReplay:true,smokeRounds:40,caseTraces:a.caseTraces.length};
}
if(require.main===module)process.stdout.write(JSON.stringify(runTests(),null,2)+'\n');
module.exports={runTests};
