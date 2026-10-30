'use strict';
// Two-opponent exact conditional audit, synthetic 3x9, global-ever-open PROVISIONAL.
// No full-game winner or minus claims; opponent double stopping policies explicit.
// node qosha-research/simulator/public-two-opponent-exact.js
const assert=require('node:assert/strict');
const deck=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)deck.push(`${a}-${b}`);
const played=['1-1','1-2'];
const focal=['0-0','0-1','1-3','1-4','1-5','1-6','0-2','2-3','2-4'];
const used=new Set([...played,...focal]);
assert.equal(used.size,11);
const unknown=deck.filter(t=>!used.has(t));assert.equal(unknown.length,17);
const halves=t=>t.split('-').map(Number);
const double=t=>{const [a,b]=halves(t);return a===b;};
const initialEnds=[2,1,1,1]; // up,left,right,down after public 1-2
const choices=[['1-3',3],['1-4',4]];
const policies=['single-low','greedy-all'];
function choose(n,k){let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return Math.round(r);}
function legal(hand,ends,opened){
 const eSet=new Set(ends),openEnd=new Set(ends.filter(n=>opened.has(n)));
 const doubles=[],ordinary=[];
 for(const tile of hand){const [a,b]=halves(tile);
  if(a===b){if(eSet.has(a)&&!opened.has(a))doubles.push(tile);}
  else if(openEnd.has(a)||openEnd.has(b))ordinary.push(tile);
 }
 return {doubles:doubles.sort(),ordinary:ordinary.sort(),count:doubles.length+ordinary.length};
}
function evaluate(seat1,seat2,candidate,policy){
 const ends=initialEnds.slice();ends[1]=candidate[1];
 const opened=new Set([1]);
 const response1=legal(seat1,ends,opened);
 const playedDoubles=policy==='greedy-all'?response1.doubles:response1.doubles.slice(0,1);
 for(const tile of playedDoubles)opened.add(halves(tile)[0]);
 const response2=legal(seat2,ends,opened);
 return {seat1Pass:response1.count===0,seat1DoubleCount:playedDoubles.length,
  seat1MaxDoubleCount:response1.doubles.length,
  seat2Pass:response2.count===0,seat2Ordinary:response2.ordinary.length,
  seat2Double:response2.doubles.length,seat2Legal:response2.count,
  seat2CanPlay:response2.count>0,seat2CanPlayDouble:response2.doubles.length>0};
}
function newStats(){return {worlds:0,seat1Pass:0,seat1PlayedDoubles:0,seat2Pass:0,seat2Ordinary:0,
 seat2Double:0,seat2Legal:0,seat2CanPlayDouble:0,
 seat1PlusSeat2OneStoneProxy:0};}
function add(s,r){s.worlds++;s.seat1Pass+=+r.seat1Pass;s.seat1PlayedDoubles+=r.seat1DoubleCount;
 s.seat2Pass+=+r.seat2Pass;s.seat2Ordinary+=r.seat2Ordinary;
 s.seat2Double+=r.seat2Double;s.seat2Legal+=r.seat2Legal;
 s.seat2CanPlayDouble+=+r.seat2CanPlayDouble;
 s.seat1PlusSeat2OneStoneProxy+=r.seat1DoubleCount+(r.seat2CanPlay?1:0);
}
function scenario(label,fixed){
 const pool=unknown.filter(t=>!fixed.includes(t));const slots=9-fixed.length;
 assert.equal(new Set(fixed).size,fixed.length);
 assert(fixed.every(t=>unknown.includes(t)));
 const results=Object.fromEntries(policies.map(p=>[p,choices.map(()=>newStats())]));
 const deltas=Object.fromEntries(policies.map(p=>[p,{seat1Pass:{'-1':0,'0':0,'1':0},seat2Pass:{'-1':0,'0':0,'1':0},seat2Legal:{negative:0,zero:0,positive:0},twoSeatOneStoneProxy:{negative:0,zero:0,positive:0}}]));
 let worlds=0,seat1Checks=0;
 for(let mask=0;mask<2**pool.length;mask++){
  let n=0,b=mask;while(b){b&=b-1;n++;}if(n!==slots)continue;
  const seat1=fixed.slice(),seat2=[];
  for(let i=0;i<pool.length;i++)(mask&(1<<i)?seat1:seat2).push(pool[i]);
  assert.equal(seat1.length,9);assert.equal(seat2.length,8);
  for(const p of policies){
   const a=evaluate(seat1,seat2,choices[0],p),z=evaluate(seat1,seat2,choices[1],p);
   add(results[p][0],a);add(results[p][1],z);
   const d=deltas[p];
   d.seat1Pass[String(+z.seat1Pass-(+a.seat1Pass))]++;
   d.seat2Pass[String(+z.seat2Pass-(+a.seat2Pass))]++;
   for(const [key,v] of [['seat2Legal',z.seat2Legal-a.seat2Legal],['twoSeatOneStoneProxy',z.seat1DoubleCount+(+z.seat2CanPlay)-a.seat1DoubleCount-(+a.seat2CanPlay)]])
    d[key][v<0?'negative':v>0?'positive':'zero']++;
   if(p==='greedy-all'){
    assert.equal(a.seat1DoubleCount,a.seat1MaxDoubleCount);
    assert.equal(z.seat1DoubleCount,z.seat1MaxDoubleCount);
    seat1Checks++;
   }
  }
  worlds++;
 }
 assert.equal(worlds,choose(pool.length,slots));
 for(const p of policies){
  assert(results[p].every(s=>s.worlds===worlds));
  for(const key of Object.keys(deltas[p]))assert.equal(Object.values(deltas[p][key]).reduce((x,y)=>x+y,0),worlds);
 }
 return {label,knownSeat1:fixed,exactSeat1HandPartitions:worlds,
  policies:Object.fromEntries(policies.map(p=>[p,{candidates:Object.fromEntries(choices.map((c,i)=>[c[0],results[p][i]])),pairedDeltaBminusA:deltas[p]}])),
  independentGreedyChainChecks:seat1Checks};
}
function run(){
 const scenarios=[scenario('no known seat1 double',[]),scenario('known seat1 3-3',['3-3']),
  scenario('known seat1 4-4',['4-4']),scenario('known seat1 3-3 and 4-4',['3-3','4-4'])];
 assert.deepEqual(scenarios.map(s=>s.exactSeat1HandPartitions),[24310,12870,12870,6435]);
 const k3=scenarios[1],k4=scenarios[2];
 for(const p of policies){
  assert.deepEqual(choices.map(c=>k3.policies[p].candidates[c[0]].seat1Pass),[0,3003]);
  assert.deepEqual(choices.map(c=>k4.policies[p].candidates[c[0]].seat1Pass),[3003,0]);
  assert.deepEqual(choices.map(c=>scenarios[0].policies[p].candidates[c[0]].seat1Pass),[5005,5005]);
  assert.deepEqual(choices.map(c=>scenarios[0].policies[p].candidates[c[0]].seat2Pass),p==='single-low'?[1287,1287]:[9,9]);
  assert.deepEqual(choices.map(c=>k3.policies[p].candidates[c[0]].seat2Pass),p==='single-low'?[1287,495]:[9,1]);
  assert.deepEqual(choices.map(c=>k4.policies[p].candidates[c[0]].seat2Pass),p==='single-low'?[495,1287]:[1,9]);
  assert.deepEqual(choices.map(c=>k3.policies[p].candidates[c[0]].seat1PlusSeat2OneStoneProxy),p==='single-low'?[24453,22242]:[32166,25739]);
 }
 return {schema:'qosha-public-two-opponent-exact/v1',engine:'independent exact public two-opponent kernel; recovered qosa-1.0.0 3x9',
  branchRule:'PROVISIONAL global-ever-open; synthetic known-opponent doubles; uniform compatible hidden hands',
  initial:'played 1-1,1-2; focal nine stones; seat1 nine, seat2 eight; stock empty',
  moves:['1-3 left','1-4 left'],opponentPolicies:policies,
  deals:0,seedRange:null,newRandomHiddenWorlds:0,newFullRounds:0,newForcedContinuations:0,
  exactConditionalSeat1HandPartitions:scenarios.reduce((n,s)=>n+s.exactSeat1HandPartitions,0),
  scenarios,
  limitations:'Only two subsequent turns; seat1 uses optional single-low or greedy-all doubles. Seat2 is measured BEFORE choosing a tile: tempo proxy counts at most ONE seat2 stone, not a played seat2 action. No real-game pass authentication, no win/minus/block/regret claim. Physical branch and blocked tie rules unverified.',
  nextAction:'Cross-check the independent exact kernel against engine/dispatcher from a clean checkout, then evaluate seat2 chosen action and focal return under both policies; authenticate physical branch/tie rules.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,scenario,evaluate,legal};
