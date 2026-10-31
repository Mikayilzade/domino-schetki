'use strict';
// Reproducible second-cycle, later-position conditional cohort.
// Both late-arrival branch models PROVISIONAL.
// node qosha-research/simulator/late-return-second-cycle-holdout.js [seed=3394120] [count=1024] [extensionPolicy=low]
const assert=require('node:assert/strict');
const {sample,replay}=require('./late-return-hidden-holdout');
const {actions,key,policy}=require('./late-return-rule-sensitivity');
const {applyOne,evaluate}=require('./late-return-voluntary-double-stop');
const MODELS=['global-ever-open','all-current-only'];
const STYLES=['low','high','double-first','double-last'],STOPS=['single','greedy'];
const id=a=>key(a.t)+'@'+(a.side===null?'D':a.side);
function shared(a,b){const bset=new Set(b.map(id));return a.filter(x=>bset.has(id(x)));}
function advance(hands,style='low'){
 const states=MODELS.map(m=>replay(m,hands)),history=[];
 for(const seat of [1,2,0]){
  const a=actions(states[0],seat),b=actions(states[1],seat),both=shared(a,b);
  if(!both.length&&(a.length||b.length))return {accepted:false,reason:'no-common-legal-action'};
  const choice=policy(both,style);
  for(const s of states){
   if(choice){
    const actual=actions(s,seat).find(x=>id(x)===id(choice));
    assert(actual,'common action legal in both models');
    applyOne(s,seat,actual);
   }else{
    assert.equal(actions(s,seat).length,0,'no voluntary pass');
    s.turn=(seat+1)%3;
   }
  }
  history.push(seat+':'+(choice?id(choice):'pass'));
 }
 for(const s of states){
  assert.equal(s.turn,1,'clockwise return');
  assert.equal(s.played.length+s.hands.flat().length,28,'tile conservation');
  assert.equal(new Set([...s.played,...s.hands.flat().map(key)]).size,28,'unique tiles');
  assert(s.hands.every(h=>h.length>=4),'no early finish');
 }
 assert.deepEqual(states[0].hands.map(h=>h.map(key).sort()),states[1].hands.map(h=>h.map(key).sort()));
 return {accepted:true,states,history};
}
function one(seed,style='low'){
 const a=advance(sample(seed),style);
 if(!a.accepted)return a;
 const opts=shared(actions(a.states[0],1),actions(a.states[1],1)).filter(x=>x.side!==null);
 const candidates=opts.filter((x,i)=>opts.findIndex(y=>id(y)===id(x))===i);
 if(candidates.length<2)return {accepted:false,reason:'fewer-than-two-common-ordinary-candidates'};
 let robust=0,stopFlips=0,branchFlips=0,improved=0,worsened=0;
 for(const c of candidates){
  const x=MODELS.map((_,mi)=>STYLES.map(p=>STOPS.map(st=>evaluate(a.states[mi],c,p,st))));
  let passes=0;
  for(let mi=0;mi<2;mi++)for(let si=0;si<4;si++)for(let ti=0;ti<2;ti++)passes+=Number(x[mi][si][ti].pass);
  robust+=Number(passes===0);
  for(let si=0;si<4;si++)for(let ti=0;ti<2;ti++)branchFlips+=Number(x[0][si][ti].pass!==x[1][si][ti].pass);
  for(let mi=0;mi<2;mi++)for(let si=0;si<4;si++){
   const p=x[mi][si][0],q=x[mi][si][1];
   stopFlips+=Number(p.pass!==q.pass);
   improved+=Number(q.legalStones>p.legalStones);
   worsened+=Number(q.legalStones<p.legalStones);
  }
 }
 return {accepted:true,history:a.history,candidates:candidates.length,robust,stopFlips,branchFlips,improved,worsened};
}
function run(start=3394120,count=1024,style='low'){
 assert(Number.isSafeInteger(start)&&start>=0&&Number.isInteger(count)&&count>0&&count<=10000);
 assert(STYLES.includes(style));
 const out={schema:'qosha-late-return-second-cycle-holdout/v1',
  engine:'qosa-research-0.5.3 + late-return-second-cycle-holdout/v1',
  rules:'recovered qosa-1.0.0 3x9; both physical branch models PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,seededConditionalWorlds:count,
  extensionPolicy:style,models:MODELS,opponentPolicies:STYLES,stopping:STOPS,
  accepted:0,noCommonAction:0,fewerThanTwoCandidates:0,candidates:0,continuations:0,
  stoppingAffectedWorlds:0,branchAffectedWorlds:0,robustPassSafeWorlds:0,
  stoppingPassFlips:0,branchPassFlips:0,mobilityIncreases:0,mobilityDecreases:0,
  distinctChronologicalExtensions:0,distinctHiddenAllocations:0,
  completeRounds:0,fullGameContinuations:0};
 const traces=new Set(),worlds=new Set();
 for(let i=0;i<count;i++){
  const seed=start+i,h=sample(seed);
  worlds.add(h.map(a=>a.map(key).sort().join(',')).join('|'));
  if(i<16)assert.deepEqual(sample(seed),h,'deterministic hidden world');
  const r=one(seed,style);
  if(!r.accepted){
   if(r.reason==='no-common-legal-action')out.noCommonAction++;
   else out.fewerThanTwoCandidates++;
   continue;
  }
  if(i<16)assert.deepEqual(one(seed,style),r,'deterministic continuation');
  out.accepted++;traces.add(r.history.join('|'));
  out.candidates+=r.candidates;out.continuations+=r.candidates*16;
  out.stoppingAffectedWorlds+=Number(r.stopFlips>0);
  out.branchAffectedWorlds+=Number(r.branchFlips>0);
  out.robustPassSafeWorlds+=Number(r.robust>0);
  out.stoppingPassFlips+=r.stopFlips;out.branchPassFlips+=r.branchFlips;
  out.mobilityIncreases+=r.improved;out.mobilityDecreases+=r.worsened;
 }
 out.distinctChronologicalExtensions=traces.size;out.distinctHiddenAllocations=worlds.size;
 assert.equal(out.accepted+out.noCommonAction+out.fewerThanTwoCandidates,count);
 out.limitations='Synthetic selected prefix, common-action selection bias, unmodelled historical opponent choice likelihood, unverified branch reopening and blocked ties; no win/minus/regret inference';
 return out;
}
if(require.main===module)console.log(JSON.stringify(run(Number(process.argv[2]||3394120),Number(process.argv[3]||1024),process.argv[4]||'low'),null,2));
module.exports={run,one,advance};
