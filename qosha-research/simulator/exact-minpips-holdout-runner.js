'use strict';
// Independent exact late-double experiment: min-hand-pips discovery.
// node qosha-research/simulator/exact-minpips-holdout-runner.js test
// node qosha-research/simulator/exact-minpips-holdout-runner.js 82000 90000 30
const ex=require('./exact-late-double-runner');
const num=require('./late-double-number-control-runner');
function run(start=82000,end=90000,quota=30){
  const {buckets,scanned}=num.collect(start,end,quota,'min-hand-pips');
  const rows=[...buckets.zero,...buckets.nonzero].map(ex.analyze);
  return {schema:'qosa-exact-independent/v1',engine:'qosa-research-0.5.3',
    rules:'qosa-1.0.0',mode:'3x9',start,end,quota,discovery:'min-hand-pips',
    scannedDeals:scanned,positions:rows.length,exactHiddenAllocations:rows.reduce((n,x)=>n+x.exactAllocations,0),
    candidateContinuations:rows.reduce((n,x)=>n+x.continuations,0),
    continuationSeedFormula:'14000000+1000*dealSeed+lexicographicAllocationIndex',
    summary:ex.summarize(rows),rows};
}
function selfTest(){const test=ex.selfTest();const out=run(82000,82400,2);
 if(!test.passed||out.positions!==4)throw Error('independent holdout regression');
 return {passed:true,positions:out.positions,exactHiddenAllocations:out.exactHiddenAllocations};}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?selfTest():run(Number(a[0]||82000),Number(a[1]||90000),Number(a[2]||30)),null,2));}
module.exports={run,selfTest};
