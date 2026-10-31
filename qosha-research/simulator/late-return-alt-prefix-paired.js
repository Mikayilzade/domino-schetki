'use strict';
// Paired late-return analysis on an alternate reachable branch-side chronology.
// Both physical late-arrival branch interpretations remain PROVISIONAL.
// node qosha-research/simulator/late-return-alt-prefix-paired.js [start=3400264] [count=2048]
const assert=require('node:assert/strict');
const {sample}=require('./late-return-hidden-holdout');
const {actions,key,policy}=require('./late-return-rule-sensitivity');
const {applyOne,evaluate}=require('./late-return-voluntary-double-stop');
const MODELS=['global-ever-open','all-current-only'];
const STYLES=['low','high','double-first','double-last'];
const STOPS=['single','greedy'];
// Same tile sequence as the prior prefix, but 1-3 is placed right and 1-4 left.
const TRACE=[[1,[0,1],0],[2,null,null],[0,[1,3],2],[1,[0,0],null],
 [2,[0,5],0],[0,[1,4],1],[1,[1,2],3],[2,[3,3],null],[0,[2,2],null]];
const id=a=>key(a.t)+'@'+(a.side===null?'D':a.side);
function replay(model,hands){
 const initial=[
  [[1,3],[1,4],[2,2],...hands[0]],
  [[1,1],[0,1],[0,0],[1,2],...hands[1].filter(t=>key(t)!=='2-3')],
  [[0,5],[3,3],...hands[2]]
 ];
 assert.deepEqual(initial.map(h=>h.length),[9,9,9]);
 const s={model,hands:initial.map(h=>h.map(t=>t.slice())),ends:[1,1,1,1],
  unlocked:[true,true,true,true],opened:new Set([1]),played:['1-1'],turn:1,stock:[]};
 s.hands[1].splice(s.hands[1].findIndex(t=>key(t)==='1-1'),1);s.hands[1].push([2,3]);
 for(const [seat,t,side] of TRACE){
  assert.equal(s.turn,seat,'clockwise prefix');
  if(t===null){assert.equal(actions(s,seat).length,0,'prefix pass forced');s.turn=(seat+1)%3;}
  else{
   const a=actions(s,seat).find(a=>key(a.t)===key(t)&&a.side===side);
   assert(a,'alternate prefix move legal');applyOne(s,seat,a);
  }
 }
 assert.deepEqual(s.ends,[5,4,3,2],'alternate branch signature');
 assert.equal(s.played.length+s.hands.flat().length,28,'28-tile conservation');
 assert.equal(new Set([...s.played,...s.hands.flat().map(key)]).size,28,'unique tiles');
 assert.deepEqual(s.hands.map(h=>h.map(key).sort()),hands.map(h=>h.map(key).sort()));
 return s;
}
function advance(hands,style){
 const states=MODELS.map(m=>replay(m,hands)),history=[];
 for(const seat of [1,2,0]){
  const a=actions(states[0],seat),b=actions(states[1],seat),bs=new Set(b.map(id));
  const common=a.filter(x=>bs.has(id(x)));
  if(!common.length&&(a.length||b.length))return {accepted:false,reason:'no-common-action'};
  const choice=policy(common,style);
  for(const s of states){
   if(choice){
    const actual=actions(s,seat).find(x=>id(x)===id(choice));
    assert(actual,'common action legal under both models');applyOne(s,seat,actual);
   }else{assert.equal(actions(s,seat).length,0,'no voluntary pass');s.turn=(seat+1)%3;}
  }
  history.push(seat+':'+(choice?id(choice):'pass'));
 }
 for(const s of states){
  assert.equal(s.turn,1,'clockwise return');
  assert.equal(s.played.length+s.hands.flat().length,28,'extension conservation');
  assert(new Set([...s.played,...s.hands.flat().map(key)]).size===28,'extension unique tiles');
  assert(s.hands.every(h=>h.length>=4),'no early finish');
 }
 assert.deepEqual(states[0].hands.map(h=>h.map(key).sort()),states[1].hands.map(h=>h.map(key).sort()));
 return {accepted:true,states,history};
}
function commonCandidates(low,high){
 const lists=[actions(low.states[0],1),actions(low.states[1],1),
  actions(high.states[0],1),actions(high.states[1],1)]
  .map(xs=>new Set(xs.filter(a=>a.side!==null).map(id)));
 return actions(low.states[0],1).filter((a,i,xs)=>a.side!==null&&
  lists.every(s=>s.has(id(a)))&&xs.findIndex(b=>id(b)===id(a))===i);
}
function compare(ext,c){
 let passes=0,legalStones=0;
 for(let mi=0;mi<MODELS.length;mi++)for(const style of STYLES)for(const stop of STOPS){
  const r=evaluate(ext.states[mi],c,style,stop);
  passes+=Number(r.pass);legalStones+=r.legalStones;
 }
 return {safe:passes===0,passes,meanReturnLegalStones:legalStones/16};
}
function one(seed){
 const hands=sample(seed),low=advance(hands,'low'),high=advance(hands,'high');
 if(!low.accepted||!high.accepted)return {eligible:false,reason:'extension-not-accepted'};
 const candidates=commonCandidates(low,high);
 if(candidates.length<2)return {eligible:false,reason:'fewer-than-two-common-candidates',commonCandidates:candidates.length};
 let lowOnlySafe=0,highOnlySafe=0,bothSafe=0,neitherSafe=0;
 for(const c of candidates){
  const a=compare(low,c),b=compare(high,c);
  if(low.history.join('|')===high.history.join('|'))assert.deepEqual(a,b,'same history equality');
  if(a.safe&&b.safe)bothSafe++;else if(a.safe)lowOnlySafe++;else if(b.safe)highOnlySafe++;else neitherSafe++;
 }
 return {eligible:true,candidates:candidates.length,lowOnlySafe,highOnlySafe,bothSafe,neitherSafe,
  worldsWithAnySafetyFlip:Number(lowOnlySafe+highOnlySafe>0),
  lowHistory:low.history.join('|'),highHistory:high.history.join('|')};
}
function runCohort(start,count){
 assert(Number.isSafeInteger(start)&&start>=0&&Number.isInteger(count)&&count>0&&count<=10000);
 const out={seedStart:start,seedEnd:start+count-1,worlds:count,eligibleWorlds:0,
  excludedExtension:0,excludedCandidate:0,commonCandidateComparisons:0,twoOpponentContinuations:0,
  lowOnlySafe:0,highOnlySafe:0,bothSafe:0,neitherSafe:0,worldsWithAnySafetyFlip:0,
  distinctLowExtensions:new Set(),distinctHighExtensions:new Set(),uniqueAllocations:new Set()};
 for(let i=0;i<count;i++){
  const seed=start+i,h=sample(seed);
  out.uniqueAllocations.add(h.map(hand=>hand.map(key).sort().join(',')).join('|'));
  if(i<16)assert.deepEqual(sample(seed),h,'same-seed allocation replay');
  const r=one(seed);
  if(i<16)assert.deepEqual(one(seed),r,'same-seed continuation replay');
  if(!r.eligible){if(r.reason==='extension-not-accepted')out.excludedExtension++;else out.excludedCandidate++;continue;}
  out.eligibleWorlds++;out.commonCandidateComparisons+=r.candidates;
  out.twoOpponentContinuations+=r.candidates*32;
  out.lowOnlySafe+=r.lowOnlySafe;out.highOnlySafe+=r.highOnlySafe;
  out.bothSafe+=r.bothSafe;out.neitherSafe+=r.neitherSafe;
  out.worldsWithAnySafetyFlip+=r.worldsWithAnySafetyFlip;
  out.distinctLowExtensions.add(r.lowHistory);out.distinctHighExtensions.add(r.highHistory);
 }
 out.distinctLowExtensions=out.distinctLowExtensions.size;
 out.distinctHighExtensions=out.distinctHighExtensions.size;
 out.uniqueAllocations=out.uniqueAllocations.size;
 assert.equal(out.eligibleWorlds+out.excludedExtension+out.excludedCandidate,count,'cohort accounting');
 assert.equal(out.lowOnlySafe+out.highOnlySafe+out.bothSafe+out.neitherSafe,out.commonCandidateComparisons,'candidate partition');
 return out;
}
function run(start=3400264,count=2048){
 assert(Number.isSafeInteger(start)&&start>=0&&Number.isInteger(count)&&count>1&&count<=10000);
 const devCount=Math.floor(count/2),holdCount=count-devCount;
 const development=runCohort(start,devCount),holdout=runCohort(start+devCount,holdCount);
 const sum=k=>development[k]+holdout[k];
 return {schema:'qosha-late-return-alt-prefix-paired/v1',
  engine:'qosa-research-0.5.3 + late-return-alt-prefix-paired/v1',
  rules:'recovered qosa-1.0.0 3x9 + one stock; both late-arrival branch models PROVISIONAL',
  prefix:'same fixed tile sequence as prior nine-event trace, but 1-3 placed right and 1-4 left; pass remains forced',
  seedStart:start,seedEnd:start+count-1,seededConditionalWorlds:count,
  models:MODELS,extensionPolicies:['low','high'],opponentReplyPolicies:STYLES,stopping:STOPS,
  development,holdout,
  combined:{worlds:count,eligibleWorlds:sum('eligibleWorlds'),
   excludedExtension:sum('excludedExtension'),excludedCandidate:sum('excludedCandidate'),
   commonCandidateComparisons:sum('commonCandidateComparisons'),twoOpponentContinuations:sum('twoOpponentContinuations'),
   lowOnlySafe:sum('lowOnlySafe'),highOnlySafe:sum('highOnlySafe'),bothSafe:sum('bothSafe'),neitherSafe:sum('neitherSafe'),
   worldsWithAnySafetyFlip:sum('worldsWithAnySafetyFlip')},
  completeRounds:0,fullGameContinuations:0,
  limitations:'Conditional seeded worlds under one alternate synthetic reachable public prefix; common-action and >=2-candidate selection, policy-selected histories, correlated candidate rows, no human move likelihood. Physical branch reopening and blocked ties remain provisional; no win/minus/regret inference.',
  nextSeed:start+count};
}
if(require.main===module){
 if(process.argv[2]==='test')console.log(JSON.stringify(run(3400264,64),null,2));
 else console.log(JSON.stringify(run(Number(process.argv[2]||3400264),Number(process.argv[3]||2048)),null,2));
}
module.exports={run,runCohort,one,replay,advance,commonCandidates,TRACE};
