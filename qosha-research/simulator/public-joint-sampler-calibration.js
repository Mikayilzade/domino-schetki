'use strict';
// Calibrate the existing exact hidden-world sampler against the exact PAIRWISE
// owner posterior. Uses only a synthetic opening capacity/pass fixture.
// Physical branch reopening and blocked-tie rules are NOT inferred.
// Run: node qosha-research/simulator/public-joint-sampler-calibration.js test
// Run: node qosha-research/simulator/public-joint-sampler-calibration.js 3279432 32768
const assert=require('node:assert/strict');
const posterior=require('./midgame-exact-posterior');
const joint=require('./public-pass-joint-ownership');
const key=t=>Array.isArray(t)?t[0]+'-'+t[1]:t;
function setup(){
 const connectors=[];for(let n=0;n<=6;n++)if(n!==1)connectors.push([Math.min(n,1),Math.max(n,1)]);
 // Eight non-1 stones are known to focal seat0. No 1-X can be in that hand.
 const focal=[[0,0],[0,2],[0,3],[0,4],[0,5],[0,6],[2,2],[2,3]];
 const played=[[1,1]],handSizes=[8,9,9],stockSize=1;
 const passObservations=[{player:2,forbiddenTiles:connectors,noInterveningDraw:true,
  source:'synthetic forced pass; all six 1-X connectors legal and no later acquisition'}];
 return {
  posteriorSpec:{playedTiles:played,focalHand:focal,knownOpponentTiles:{1:[],2:[]},
   handSizes,stockSize,passObservations},
  jointSpec:{played:['1-1'],known:{0:focal},handSizes,stockSize,
   passMasks:{2:[connectors]}}
 };
}
function run(start=3279432,count=32768){
 assert(Number.isSafeInteger(start)&&start>=0&&Number.isSafeInteger(count)&&count>=128,'bad seeds');
 const inputs=setup(),snapshot=JSON.stringify(inputs);
 const prepared=posterior.prepare(inputs.posteriorSpec);
 const exact=joint.analyzeJoint(inputs.jointSpec,'1-2','1-3');
 assert.equal(String(prepared.total),exact.compatibleWorlds,'independent exact counters');
 assert.equal(prepared.total,7150n,'conditional capacity fixture');
 const total=BigInt(exact.compatibleWorlds),m=exact.jointNumerators;
 assert.equal(BigInt(m.seat1.seat1)*5n,total*4n);
 assert.equal(BigInt(m.stock.seat1)*10n,total);
 assert.equal(BigInt(m.seat1.stock)*10n,total);
 assert.equal(m.stock.stock,'0');
 const counts={bothSeat1:0,firstStock:0,secondStock:0,other:0,stockConnector:0};
 const unique=new Set();
 for(let i=0;i<count;i++){
  const world=posterior.samplePrepared(prepared,start+i);
  posterior.assertWorld(prepared,world);
  if(i<32)assert.equal(JSON.stringify(world),
   JSON.stringify(posterior.samplePrepared(prepared,start+i)),'seed replay');
  const h=world.hands[1].map(key),s=world.stock.map(key);
  if(s.some(t=>t.startsWith('1-')||t.endsWith('-1')))counts.stockConnector++;
  if(h.includes('1-2')&&h.includes('1-3'))counts.bothSeat1++;
  else if(s.includes('1-2')&&h.includes('1-3'))counts.firstStock++;
  else if(s.includes('1-3')&&h.includes('1-2'))counts.secondStock++;
  else counts.other++;
  unique.add(h.slice().sort().join(',')+'|'+s.join(','));
 }
 assert.equal(counts.other,0,'impossible pair assignment');
 assert.equal(counts.bothSeat1+counts.firstStock+counts.secondStock,count);
 assert.equal(JSON.stringify(inputs),snapshot,'input mutated');
 const expected={bothSeat1:0.8,firstStock:0.1,secondStock:0.1,stockConnector:0.6};
 const calibration={};
 for(const name of Object.keys(expected)){
  const p=expected[name],observed=counts[name]/count;
  const z=(observed-p)/Math.sqrt(p*(1-p)/count);
  assert(Math.abs(z)<5,'exact posterior sampling calibration failed: '+name+' z='+z);
  calibration[name]={observed,expected:p,z};
 }
 return {schema:'qosha-public-joint-sampler-calibration/v1',
  engine:'qosa-research-0.5.3 + public-joint-sampler-calibration/v1',
  rules:'recovered qosa-1.0.0 3x9; synthetic externally assumed forced pass',
  seedRange:[start,start+count-1],deals:0,hiddenWorldAllocations:count,
  completeRounds:0,forcedContinuations:0,strategies:'none; exact uniform conditional sampler',
  exactCompatibleWorlds:exact.compatibleWorlds,exactPair:{bothSeat1:'80%',firstStock:'10%',secondStock:'10%',bothStock:'0%'},
  counts,distinctWorlds:unique.size,calibration,
  finding:'The existing conditional sampler reproduces the exact negative correlation between two hidden connector owners; independent 90% marginals must not be multiplied.',
  confidence:'exact DP pair posterior; seeded Monte Carlo calibration of synthetic known-hand fixture; 5-sigma sanity bounds, not a physical-game claim',
  limitations:'The forced-pass mask is hypothetical; branch reopening, blocked ties, loneZero, bust, match scoring and win-rate effects remain unresolved.',
  nextAction:'Replay this calibrated sampler on an authenticated physical pass trace; compare legal candidate moves on matched worlds only after branch and blocked-tie rules are verified.'};
}
if(require.main===module){
 const args=process.argv.slice(2);
 console.log(JSON.stringify(args[0]==='test'?run(3279432,512):run(
  args[0]===undefined?3279432:Number(args[0]),
  args[1]===undefined?32768:Number(args[1])),null,2));
}
module.exports={setup,run};
