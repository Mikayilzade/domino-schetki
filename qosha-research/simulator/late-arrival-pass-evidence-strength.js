'use strict';
// Independent exact evidence-strength audit of the deliberately scripted
// chronological late-arrival witness. No real-game rule is authenticated.
// Run: node qosha-research/simulator/late-arrival-pass-evidence-strength.js
const assert = require('node:assert/strict');
const deck = [];
for (let a=0;a<=6;a++) for (let b=a;b<=6;b++) deck.push(a+'-'+b);
const prefix = ['1-1','1-2','2-2','2-4','4-4','4-5','5-5','2-5'];
const fixed = new Set([...prefix,'1-3','3-3']);
assert.equal(fixed.size,10);
const free = deck.filter(t=>!fixed.has(t));
assert.equal(free.length,18);
const touches = (t,n)=>t.split('-').includes(String(n));
const firstMasks = {
  current:new Set(free.filter(t=>touches(t,1))),
  global:new Set(free.filter(t=>touches(t,1)||touches(t,2)))
};
const newlyOpened = new Set(free.filter(t=>touches(t,3)));
assert.equal(firstMasks.current.size,4);
assert.equal(firstMasks.global.size,7);
assert.equal(newlyOpened.size,5);
function choose(n,k){
  if(k<0||k>n)return 0;
  let v=1;
  for(let i=1;i<=k;i++)v=v*(n-i+1)/i;
  return Math.round(v);
}
function subsets(items,k,fn){
  const chosen=[];
  function visit(start,left){
    if(!left){fn(chosen.slice());return;}
    for(let i=start;i<=items.length-left;i++){
      chosen.push(items[i]);visit(i+1,left-1);chosen.pop();
    }
  }
  visit(0,k);
}
function evidenceCounts(pool){
  const out={};
  for(const model of ['current','global']){
    const first=firstMasks[model];
    const blocked=pool.filter(t=>first.has(t)).length;
    const additional=pool.filter(t=>newlyOpened.has(t)&&!first.has(t)).length;
    out[model]={first:choose(13-blocked,7),both:choose(13-blocked-additional,7)};
  }
  assert(out.current.first>=out.global.first);
  assert(out.current.both>=out.global.both);
  return out;
}
function blank(){return {ownHandsCompatible:0,observationsCurrent:0,observationsGlobal:0,
  modelExclusiveOwnHands:0,modelExclusiveCurrentObservations:0,
  currentObservationsWithBFatLeast2:0,currentObservationsWithBFatLeast3:0,
  currentObservationsWithBFatLeast10:0,currentObservationsWithBFatLeast100:0,
  minFiniteBF:null,maxFiniteBF:null};}
const events={first:blank(),both:blank()};
const fixtures={firstExclusive:null,firstShared:null,bothExclusive:null,bothShared:null};
let ownHands=0;
subsets(free,5,ownFive=>{
  ownHands++;
  const ownSet=new Set(ownFive);
  const pool=free.filter(t=>!ownSet.has(t));
  assert.equal(pool.length,13);
  const evidence=evidenceCounts(pool);
  for(const event of ['first','both']){
    const a=evidence.current[event],b=evidence.global[event];
    const r=events[event];
    r.observationsCurrent+=a;r.observationsGlobal+=b;
    if(a>0)r.ownHandsCompatible++;
    if(a>0&&b===0){r.modelExclusiveOwnHands++;r.modelExclusiveCurrentObservations+=a;}
    if(a>0){
      const bf=b===0?Infinity:a/b;
      for(const threshold of [2,3,10,100]){
        if(bf>=threshold)r['currentObservationsWithBFatLeast'+threshold]+=a;
      }
      if(Number.isFinite(bf)){
        r.minFiniteBF=r.minFiniteBF===null?bf:Math.min(r.minFiniteBF,bf);
        r.maxFiniteBF=r.maxFiniteBF===null?bf:Math.max(r.maxFiniteBF,bf);
      }
      const fixtureName=event+(b===0?'Exclusive':'Shared');
      if(!fixtures[fixtureName])fixtures[fixtureName]={own:['3-3',...ownFive],pool,evidence};
    }
  }
});
assert.equal(ownHands,choose(18,5));
assert.equal(ownHands,8568);
assert.equal(choose(13,7),1716);
assert.equal(events.first.observationsCurrent,1585584);
assert.equal(events.first.observationsGlobal,152460);
assert.equal(events.both.observationsCurrent,16632);
assert.equal(events.both.observationsGlobal,462);
assert.equal(events.first.modelExclusiveOwnHands,462);
// Independent brute-force check: enumerate opponent seven-tile hands for
// each of four distinct representative own hands and both branch models.
const bruteFixtures=[];
for(const [name,fixture] of Object.entries(fixtures)){
  assert(fixture,name+' missing');
  let n=0;
  const brute={current:{first:0,both:0},global:{first:0,both:0}};
  subsets(fixture.pool,7,hand=>{
    n++;
    for(const model of ['current','global']){
      const passFirst=hand.every(t=>!firstMasks[model].has(t));
      const passBoth=passFirst&&hand.every(t=>!newlyOpened.has(t));
      brute[model].first+=Number(passFirst);
      brute[model].both+=Number(passBoth);
    }
  });
  assert.equal(n,1716);
  assert.deepEqual(brute,fixture.evidence);
  bruteFixtures.push({name,own:fixture.own,opponentHandsChecked:n,counts:brute});
}
for(const [event,r] of Object.entries(events)){
  assert(r.modelExclusiveCurrentObservations<=r.observationsCurrent);
  r.marginalLikelihoodRatioCurrentOverGlobal=r.observationsCurrent/r.observationsGlobal;
  r.exclusiveShareOfCurrentObservations=r.modelExclusiveCurrentObservations/r.observationsCurrent;
  r.strongBF10ShareOfCurrentObservations=r.currentObservationsWithBFatLeast10/r.observationsCurrent;
}
const result={passed:true,version:'late-arrival-pass-evidence-strength/v1',
  rules:'recovered qosa-1.0.0, 3x9; global-ever-open and all-current-only BOTH PROVISIONAL',
  publicPrefix:prefix,
  evidence:'first: seat 1 forced pass after prefix; both: additionally seat 2 plays 1-3 and seat 0 plays known 3-3, then seat 1 forced pass again',
  knownStock:'1-2 already drawn and played by seat 0',
  knownOwnHand:'seat 0 has 3-3 plus any five of 18 free stones',
  design:'uniform over 8568 own hands and 1716 seat-1 seven-tile hands per own hand; seat-2 receives the other seven',
  ownHands,opponentHandsPerOwn:1716,analyticalJointAssignments:ownHands*1716,
  events,bruteFixtures,
  caveats:'These likelihood ratios are conditional on scripted voluntary choices and an artificial uniform allocation prior, not posterior odds that a physical rule is true. Two forced passes are required for the both event. No natural-play prevalence, strategy win rate, score, or regret inference. Physical branch reopening and block ties remain unverified.',
  next:'On a genuinely logged game, verify forced (not voluntary) passes and all known stones; then compute per-known-hand likelihoods under both branch models. Independently authenticate late-arrival reopening and blocked ties.'};
if(require.main===module)console.log(JSON.stringify(result,null,2));
module.exports={run:()=>result};
