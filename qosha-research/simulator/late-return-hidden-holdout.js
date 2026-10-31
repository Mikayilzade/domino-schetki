'use strict';
// Conditional seeded late-return holdout. Both physical branch models PROVISIONAL.
// node qosha-research/simulator/late-return-hidden-holdout.js [start=3392072] [count=1024]
const assert=require('node:assert/strict');
const {actions,key}=require('./late-return-rule-sensitivity');
const {evaluate,applyOne}=require('./late-return-voluntary-double-stop');
const {createDoubleSixDeck,mixSeed32}=require('./engine');
const MODELS=['global-ever-open','all-current-only'],STYLES=['low','high','double-first','double-last'],STOPS=['single','greedy'];
const TRACE=[
 [1,[0,1],0],[2,null,null],[0,[1,3],1],[1,[0,0],null],
 [2,[0,5],0],[0,[1,4],2],[1,[1,2],3],[2,[3,3],null],[0,[2,2],null]
];
const USED=['1-1','0-1','1-3','0-0','0-5','1-4','1-2','3-3','2-2','2-3'];
const FREE=createDoubleSixDeck().filter(t=>!USED.includes(key(t)));
assert.equal(FREE.length,18);
function rng(seed){let s=mixSeed32(seed)||0x9e3779b9;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};}
function shuffle(a,r){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function sample(seed){
 const r=rng(seed),eligible=FREE.filter(t=>!t.includes(1));
 assert.equal(eligible.length,16);
 const seat2=shuffle(eligible,r).slice(0,7),used=new Set(seat2.map(key));
 const rest=shuffle(FREE.filter(t=>!used.has(key(t))),r);
 const hands=[rest.slice(0,6),[[2,3],...rest.slice(6)],seat2];
 assert.deepEqual(hands.map(h=>h.length),[6,6,7]);
 const all=[...USED.slice(0,9),...hands.flat().map(key)];
 assert.equal(all.length,28);assert.equal(new Set(all).size,28);
 assert(!hands[2].some(t=>t.includes(1)));
 return hands;
}
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
  assert.equal(s.turn,seat,'chronological turn');
  if(t===null){assert.equal(actions(s,seat).length,0,'opening pass must be forced');s.turn=(seat+1)%3;}
  else{const a=actions(s,seat).find(a=>key(a.t)===key(t)&&a.side===side);
   assert(a,'chronological move legal');applyOne(s,seat,a);}
 }
 assert.deepEqual(s.ends,[5,3,4,2]);assert.deepEqual(s.unlocked,[false,true,false,true]);
 assert.deepEqual(s.hands.map(h=>h.map(key).sort()),hands.map(h=>h.map(key).sort()));
 return s;
}
function one(seed){
 const hands=sample(seed),states=MODELS.map(m=>replay(m,hands));
 const candidates=actions(states[0],1).filter(a=>a.side!==null);
 assert.deepEqual(candidates.map(a=>key(a.t)+'@'+a.side),
  actions(states[1],1).filter(a=>a.side!==null).map(a=>key(a.t)+'@'+a.side));
 if(candidates.length<2)return {eligible:false,hand:hands[1].map(key).sort().join(','),actions:candidates.length};
 let robust=0,minPass=Infinity,bestCount=0,branchFlips=0,stopFlips=0;
 let mobilityImproved=0,mobilityWorsened=0,extraDoubles=0,truePasses=0;
 for(const c of candidates){
  const cell=MODELS.map((m,mi)=>STYLES.map(style=>STOPS.map(stop=>evaluate(states[mi],c,style,stop))));
  let passes=0;
  for(let mi=0;mi<2;mi++)for(let si=0;si<4;si++)for(let ti=0;ti<2;ti++)
   passes+=Number(cell[mi][si][ti].pass);
  truePasses+=passes;
  if(passes===0)robust++;
  if(passes<minPass){minPass=passes;bestCount=1;}else if(passes===minPass)bestCount++;
  for(let si=0;si<4;si++)for(let ti=0;ti<2;ti++)
   branchFlips+=Number(cell[0][si][ti].pass!==cell[1][si][ti].pass);
  for(let mi=0;mi<2;mi++)for(let si=0;si<4;si++){
   const a=cell[mi][si][0],b=cell[mi][si][1];
   stopFlips+=Number(a.pass!==b.pass);
   mobilityImproved+=Number(b.legalStones>a.legalStones);
   mobilityWorsened+=Number(b.legalStones<a.legalStones);
   extraDoubles+=b.extraDoubles.reduce((x,y)=>x+y,0);
  }
 }
 return {eligible:true,hand:hands[1].map(key).sort().join(','),actions:candidates.length,
  robust,minPass,bestCount,branchFlips,stopFlips,mobilityImproved,mobilityWorsened,
  extraDoubles,truePasses};
}
function run(start=3392072,count=1024){
 assert(Number.isSafeInteger(start)&&start>=0&&Number.isInteger(count)&&count>0&&count<=10000);
 const out={worlds:count,eligibleWorlds:0,excludedFewerThanTwoActions:0,
  actionCandidates:0,evaluatedContinuations:0,truePassOutcomes:0,robustWorlds:0,
  robustCandidateActions:0,worldsWithBranchPassReversal:0,worldsWithStoppingPassChange:0,
  branchPassReversals:0,stoppingPassChanges:0,stoppingMobilityIncreases:0,
  stoppingMobilityDecreases:0,extraOpponentDoubles:0,uniqueFocalHands:0,
  uniqueAllocations:0,uniqueBestWorlds:0,minPassHistogram:{}};
 const handSet=new Set(),allocationSet=new Set();
 for(let i=0;i<count;i++){
  const seed=start+i,h=sample(seed);
  allocationSet.add(h.map(a=>a.map(key).sort().join(',')).join('|'));
  if(i<16)assert.deepEqual(sample(seed),h,'deterministic same-seed replay');
  const x=one(seed);handSet.add(x.hand);
  if(!x.eligible){out.excludedFewerThanTwoActions++;continue;}
  out.eligibleWorlds++;out.actionCandidates+=x.actions;
  out.evaluatedContinuations+=x.actions*16;out.truePassOutcomes+=x.truePasses;
  out.robustCandidateActions+=x.robust;out.robustWorlds+=Number(x.robust>0);
  out.uniqueBestWorlds+=Number(x.bestCount===1);
  out.worldsWithBranchPassReversal+=Number(x.branchFlips>0);
  out.worldsWithStoppingPassChange+=Number(x.stopFlips>0);
  out.branchPassReversals+=x.branchFlips;out.stoppingPassChanges+=x.stopFlips;
  out.stoppingMobilityIncreases+=x.mobilityImproved;
  out.stoppingMobilityDecreases+=x.mobilityWorsened;
  out.extraOpponentDoubles+=x.extraDoubles;
  out.minPassHistogram[x.minPass]=(out.minPassHistogram[x.minPass]||0)+1;
 }
 out.uniqueFocalHands=handSet.size;out.uniqueAllocations=allocationSet.size;
 assert.equal(out.eligibleWorlds+out.excludedFewerThanTwoActions,count);
 return {schema:'qosha-late-return-hidden-holdout/v1',
  engine:'qosa-research-0.5.3 + late-return-hidden-holdout/v1',
  rules:'recovered qosa-1.0.0 3x9; both late-return models PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,seededConditionalWorlds:count,
  history:'one fixed 9-event chronological public trace; starter draws stock 2-3; seat2 forced pass',
  policies:STYLES,models:MODELS,stopping:STOPS,
  focus:'ordinary candidate placements only, 2-opponent-turn horizon, no full-game scoring',
  ...out,completeRounds:0,fullGameContinuations:0,
  limitations:'Conditional synthetic worlds, one shared public history; no human move likelihood; physical branch reopening and blocked ties unresolved; no win/minus/regret claim'};
}
if(require.main===module)console.log(JSON.stringify(run(Number(process.argv[2]||3392072),Number(process.argv[3]||1024)),null,2));
module.exports={run,sample,replay,one};
