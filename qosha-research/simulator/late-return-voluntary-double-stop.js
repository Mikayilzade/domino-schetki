'use strict';
// Voluntary multi-double stopping sensitivity in one chronologically reachable 3x9 witness.
// Both physical branch models and opponent policies are PROVISIONAL.
// node qosha-research/simulator/late-return-voluntary-double-stop.js
const assert=require('node:assert/strict');
const {run:prior,replay,actions,choices,key,clone,policy}=require('./late-return-rule-sensitivity');
const MODELS=['global-ever-open','all-current-only'];
const POLICIES=['low','high','double-first','double-last'];
const LABELS=['0-2@down','0-3@left','3-4@left','2-4@down','2-3@left','2-3@down'];
function applyOne(s,p,a){
 assert(a&&actions(s,p).some(x=>key(x.t)===key(a.t)&&x.side===a.side),'illegal tile or branch');
 const i=s.hands[p].findIndex(t=>key(t)===key(a.t));
 assert(i>=0);s.hands[p].splice(i,1);s.played.push(key(a.t));
 if(a.side===null){
  const n=a.t[0];s.opened.add(n);
  for(let side=0;side<4;side++)if(s.ends[side]===n)s.unlocked[side]=true;
 }else{
  s.ends[a.side]=a.to;
  s.unlocked[a.side]=s.model==='global-ever-open'&&s.opened.has(a.to);
 }
 s.turn=(p+1)%3;
}
function evaluate(s,choice,style,stop){
 assert(['single','greedy'].includes(stop));
 const v=clone(s),candidate=actions(v,1).find(a=>key(a.t)===key(choice.t)&&a.side===choice.side);
 assert(candidate,'candidate must be legal in both provisional models');
 applyOne(v,1,candidate);
 const opponentStones=[],extraDoubles=[];
 for(const p of [2,0]){
  const first=policy(actions(v,p),style);
  let n=0,extra=0;
  if(first){
   applyOne(v,p,first);n++;
   // Only a turn that BEGAN with a double may extend through further legal doubles.
   // A normal tile followed by a double is deliberately NOT permitted.
   if(stop==='greedy'&&first.side===null){
    for(;;){
     const doubles=actions(v,p).filter(a=>a.side===null);
     if(!doubles.length)break;
     applyOne(v,p,policy(doubles,style));n++;extra++;
     assert(n<=4,'physical maximum four doubles');
    }
   }
  }else v.turn=(p+1)%3;
  assert(v.hands[p].length>0,'no opponent finish in this short horizon');
  opponentStones.push(n);extraDoubles.push(extra);
 }
 const all=[...v.played,...v.hands.flat().map(key)];
 assert.equal(all.length,28,'28-tile conservation');
 assert.equal(new Set(all).size,28,'no duplicated tiles');
 const legalStones=new Set(actions(v,1).map(a=>key(a.t))).size;
 return {legalStones,pass:legalStones===0,opponentStones,extraDoubles};
}
function run(){
 const baseline=prior();
 assert.deepEqual(baseline.passStatusReversals,['0-2@down','0-3@left','2-3@left']);
 const expectedSingle=[
  [0,3,0,2,2,4],[3,0,0,2,0,3],
  [4,4,3,3,2,2],[3,3,3,3,2,2],
  [4,4,4,2,2,4],[3,3,4,2,2,3],
  [0,3,0,2,2,4],[3,0,0,2,0,3]];
 const expectedGreedy=[
  [0,3,0,4,2,4],[5,0,0,4,0,4],
  [5,5,4,4,4,4],[5,5,4,4,4,4],
  [5,5,4,4,4,4],[5,5,4,4,4,4],
  [0,3,0,4,2,4],[5,0,0,4,0,4]];
 const rows=[];
 let changedMobility=0,improved=0,worsened=0,changedPass=0,extraDoubles=0;
 for(const style of POLICIES)for(const model of MODELS){
  const state=replay(model);
  const single=choices.map(c=>evaluate(state,c,style,'single'));
  const greedy=choices.map(c=>evaluate(state,c,style,'greedy'));
  assert.deepEqual(choices.map(c=>evaluate(state,c,style,'greedy')),greedy,'same-state replay');
  const singleStones=single.map(x=>x.legalStones),greedyStones=greedy.map(x=>x.legalStones);
  rows.push({style,model,singleStones,greedyStones,
   extraDoubles:greedy.map(x=>x.extraDoubles.reduce((a,b)=>a+b,0)),
   passChanged:single.map((x,i)=>x.pass!==greedy[i].pass)});
  for(let i=0;i<choices.length;i++){
   const d=greedyStones[i]-singleStones[i];
   changedMobility+=+(d!==0);improved+=+(d>0);worsened+=+(d<0);
   changedPass+=+(single[i].pass!==greedy[i].pass);
   extraDoubles+=greedy[i].extraDoubles.reduce((a,b)=>a+b,0);
  }
 }
 assert.deepEqual(rows.map(x=>x.singleStones),expectedSingle);
 assert.deepEqual(rows.map(x=>x.greedyStones),expectedGreedy);
 assert.equal(changedMobility,29);assert.equal(improved,29);assert.equal(worsened,0);
 assert.equal(changedPass,0);assert.equal(extraDoubles,34);
 const robust=LABELS.filter((_,i)=>rows.every(r=>r.singleStones[i]>0&&r.greedyStones[i]>0));
 assert.deepEqual(robust,['2-4@down','2-3@down']);
 return {schema:'qosha-late-return-voluntary-double-stop/v1',
  engine:'qosa-research-0.5.3 + late-return-voluntary-double-stop/v1',
  rules:'qosa-1.0.0 3x9; BOTH branch interpretations PROVISIONAL',
  fixture:'one fixed reachable 28-tile 3x9+stock deal, 9 public events, no random seeds',
  newDeals:0,newHiddenWorlds:0,newCompleteRounds:0,newFullContinuations:0,
  policies:POLICIES,models:MODELS,stopping:['single','greedy'],
  pairedComparisons:48,deterministicTwoOpponentContinuations:96,
  changedMobility,improved,worsened,changedPass,extraDoubles,
  robustPassSafeCandidates:robust,rows,
  limitation:'one selected full-information fixture; greedy only extends a turn started with a double; no mixed finish or human policy likelihood; no win/score/regret inference'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,evaluate,applyOne};
