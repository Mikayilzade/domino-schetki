'use strict';
// Independent later-round 1-1-from-stock opening audit, recovered 3x9 rules.
// node qosha-research/simulator/public-history-stock-opening-audit.js test
// node qosha-research/simulator/public-history-stock-opening-audit.js 2066000 12000
const trace=require('./public-history-replay');
const post=require('./midgame-exact-posterior');
const key=t=>t.slice().sort((a,b)=>a-b).join('-');
function cases(){
 const hand=trace.fixture();
 const stock=trace.fixture();
 stock.opening={starter:2,fromStock:true,stockDraw:false,isFirstRound:false,previousWinnerIndex:2,
  followup:{tile:[1,2],side:'up'}};
 return {hand,stock};
}
function test(){
 const base=trace.test(),{hand,stock}=cases();
 const a=trace.replay(hand),b=trace.replay(stock);
 const pa=post.prepare(a.posteriorSpec),pb=post.prepare(b.posteriorSpec);
 if(pa.total!==5005n||pb.total!==pa.total||a.eventCounts.draw!==1||b.eventCounts.draw!==0||
  a.eventCounts.openingFromStock!==0||b.eventCounts.openingFromStock!==1||
  JSON.stringify(a.playedTiles)!==JSON.stringify(b.playedTiles)||
  JSON.stringify(a.passObservations)!==JSON.stringify(b.passObservations))
  throw Error('opening provenance equivalence regression');
 for(let i=0;i<100;i++){
  const wa=post.samplePrepared(pa,2066000+i),wb=post.samplePrepared(pb,2066000+i);
  post.assertWorld(pa,wa);post.assertWorld(pb,wb);
  if(JSON.stringify(wa.hands)!==JSON.stringify(wb.hands))throw Error('paired posterior worlds differ');
 }
 return {passed:true,publicHistory:base,exactPartitionsEach:Number(pa.total),
  pairedSeeds:100,draws:{handOpening:1,stockOpening:0}};
}
function run(start=2066000,count=12000){
 if(!Number.isInteger(start)||start<0||!Number.isInteger(count)||count<100)throw Error('seed range');
 const checks=test(),{hand,stock}=cases();
 const a=trace.replay(hand),b=trace.replay(stock);
 const pa=post.prepare(a.posteriorSpec),pb=post.prepare(b.posteriorSpec);
 let hits=0,paired=0;const distinct=new Set();
 for(let i=0;i<count;i++){
  const seed=start+i,wa=post.samplePrepared(pa,seed),wb=post.samplePrepared(pb,seed);
  post.assertWorld(pa,wa);post.assertWorld(pb,wb);
  if(JSON.stringify(wa.hands)!==JSON.stringify(wb.hands)||JSON.stringify(wa.stock)!==JSON.stringify(wb.stock))
   throw Error('posterior opening source should not affect allocations');
  paired++;hits+=+wa.hands[1].some(t=>key(t)==='3-6');
  distinct.add(wa.hands[1].map(key).sort().join(','));
 }
 const target=0.6,rate=hits/count,z=(rate-target)/Math.sqrt(target*(1-target)/count);
 if(Math.abs(z)>5)throw Error('exact conditional calibration failed');
 return {schema:'qosha-stock-opening-audit/v1',timestampBaku:new Intl.DateTimeFormat('sv-SE',
  {timeZone:'Asia/Baku',dateStyle:'short',timeStyle:'medium'}).format(new Date())+' +04:00',
  engine:'qosa-research-0.5.3 + public-history-replay-1.2',
  rules:'recovered qosa-1.0.0 3x9; confirmed later-round 1-1 from stock; provisional global-ever-open branch model',
  seedRange:[start,start+count-1],deals:0,modelRounds:0,forcedContinuations:0,
  independentHiddenAllocations:count,pairedEquivalenceChecks:paired,
  strategies:'none; opening provenance and exact conditional hidden-world validation',
  openingModes:[{source:a.openingSource,draws:a.eventCounts.draw},
    {source:b.openingSource,draws:b.eventCounts.draw}],
  exact:{compatiblePartitionsPerMode:Number(pa.total),seat1Has36:target},
  sampled:{worlds:count,pairedChecks:paired,distinctSeat1Hands:distinct.size,seat1Has36:hits,rate,z},
  tests:checks,
  finding:'Later-round stock-1-1 opening by previous winner is now represented without falsely inventing a replacement draw; equal resulting public states have identical conditional posterior worlds.',
  confidence:'Confirmed opening-source rule plus deterministic 5005-partition exact benchmark; synthetic public trace only',
  limitations:['Public trace synthetic, not authenticated physical play',
   'Branch unlocking and blocked-round winner/ties/101 scoring unvalidated',
   'Equal post-opening states imply equal posterior, not a new strategy advantage',
   'No real-game win-rate or minus-risk claim'],
  nextAction:'Validate a real recorded midgame late-arrival branch opening and block-tie fixture; then compare paired double/connector tactics on confirmed legal moves'};
}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2066000),+(a[1]||12000)),null,2));}
module.exports={cases,test,run};
