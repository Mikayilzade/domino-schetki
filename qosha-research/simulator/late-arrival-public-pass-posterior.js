'use strict';
// Exact conditional posterior for a constructed observed forced pass.
// Both branch models remain PROVISIONAL; no real-game frequency claim.
// Run: node qosha-research/simulator/late-arrival-public-pass-posterior.js
const assert=require('node:assert/strict');
const deck=[];
for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)deck.push(a+'-'+b);
const prefix=['1-1','1-2','2-2','2-4','4-4','4-5','5-5','2-5'];
const stock='1-2',seat2Future='1-3',ownFuture='3-3';
const fixed=new Set([...prefix,seat2Future,ownFuture]);
assert.equal(fixed.size,10);
const available=deck.filter(t=>!fixed.has(t));
assert.equal(available.length,18);
const touches=(t,n)=>t.split('-').some(x=>Number(x)===n);
const priorCurrent=new Set(deck.filter(t=>touches(t,1)&&!fixed.has(t)));
const priorGlobal=new Set(deck.filter(t=>(touches(t,1)||touches(t,2))&&!fixed.has(t)));
const futureNew=new Set(deck.filter(t=>touches(t,3)&&!fixed.has(t)));
assert.equal(priorCurrent.size,4);
assert.equal(priorGlobal.size,7);
assert.equal(futureNew.size,5);
function choose(n,k){if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x=x*(n-i+1)/i;return Math.round(x);}
function combinations(items,k,fn){const chosen=[];function visit(start){if(chosen.length===k){fn(chosen);return;}
  for(let i=start;i<=items.length-(k-chosen.length);i++){chosen.push(items[i]);visit(i+1);chosen.pop();}}
  visit(0);
}
const counts={ownHands:0,opponentHandsPerOwn:choose(13,7),prePassCurrent:0,prePassGlobal:0,
  bothPassCurrent:0,bothPassGlobal:0,globalPassImpossibleOwnHands:0};
const examples={impossibleGlobal:null,bothPossible:null};
const fixtures=[];
combinations(available,5,chosen=>{
  counts.ownHands++;
  const own=[ownFuture,...chosen],ownSet=new Set(own);
  assert.equal(ownSet.size,6);
  const pool=available.filter(t=>!ownSet.has(t));
  assert.equal(pool.length,13);
  const masks={current:priorCurrent,global:priorGlobal};
  const record={own:own.slice().sort(),pool,models:{}};
  for(const model of ['current','global']){
    const prior=masks[model];
    const priorLegal=pool.filter(t=>prior.has(t)).length;
    const newLegal=pool.filter(t=>futureNew.has(t)&&!prior.has(t)).length;
    const before=choose(13-priorLegal,7);
    const beforeAndAfter=choose(13-priorLegal-newLegal,7);
    assert(beforeAndAfter<=before);
    counts[model==='current'?'prePassCurrent':'prePassGlobal']+=before;
    counts[model==='current'?'bothPassCurrent':'bothPassGlobal']+=beforeAndAfter;
    record.models[model]={priorLegal,newLegal,before,beforeAndAfter};
  }
  if(record.models.global.before===0){
    counts.globalPassImpossibleOwnHands++;
    if(!examples.impossibleGlobal)examples.impossibleGlobal=record;
  }else if(!examples.bothPossible)examples.bothPossible=record;
  if((counts.ownHands===1 || (!fixtures.some(f=>f.class==='impossible')&&record.models.global.before===0) ||
      (!fixtures.some(f=>f.class==='possible')&&record.models.global.before>0)) && fixtures.length<3){
    let worlds=0;
    const brute={current:{before:0,beforeAndAfter:0},global:{before:0,beforeAndAfter:0}};
    combinations(pool,7,hand=>{
      worlds++;
      for(const model of ['current','global']){
        const prior=masks[model];
        const passBefore=hand.every(t=>!prior.has(t));
        const passAfter=passBefore&&hand.every(t=>!futureNew.has(t));
        brute[model].before+=+passBefore;
        brute[model].beforeAndAfter+=+passAfter;
      }
    });
    assert.equal(worlds,counts.opponentHandsPerOwn);
    for(const model of ['current','global'])assert.deepEqual(brute[model],{
      before:record.models[model].before,beforeAndAfter:record.models[model].beforeAndAfter});
    fixtures.push({class:record.models.global.before?'possible':'impossible',own:record.own,worlds});
  }
});
assert.equal(counts.ownHands,choose(18,5));
assert.equal(counts.ownHands,8568);
assert.equal(counts.prePassCurrent,1585584);
assert.equal(counts.prePassGlobal,152460);
assert.equal(counts.bothPassCurrent,16632);
assert.equal(counts.bothPassGlobal,462);
assert.equal(counts.globalPassImpossibleOwnHands,462);
const total=counts.ownHands*counts.opponentHandsPerOwn;
const summary={current:{priorPass:counts.prePassCurrent/total,
  nextPassGivenPriorPass:counts.bothPassCurrent/counts.prePassCurrent,
  nextPlayableGivenPriorPass:1-counts.bothPassCurrent/counts.prePassCurrent},
  global:{priorPass:counts.prePassGlobal/total,
  nextPassGivenPriorPass:counts.bothPassGlobal/counts.prePassGlobal,
  nextPlayableGivenPriorPass:1-counts.bothPassGlobal/counts.prePassGlobal}};
const result={passed:true,version:'late-arrival-public-pass-posterior/v1',
  rules:'recovered qosa-1.0.0, 3x9, global-ever-open/current-only BOTH PROVISIONAL',
  prefix,knownStock:stock,publicEvidence:'seat 1 forced pass after prefix (empty stock); seat 2 then plays 1-3 on a different open 1 branch; seat 0 then plays owned 3-3 on that branch',
  ownKnown:'seat 0 owns 3-3 plus 5 of the other 18 available stones; every possible such hand is evaluated',
  counts,totalJointOwnOpponentAssignments:total,summary,fixtures,
  examples:{impossibleGlobal:examples.impossibleGlobal&&examples.impossibleGlobal.own,
    bothPossible:examples.bothPossible&&examples.bothPossible.own},
  caveats:'Exact conditional uniform assignments with scripted voluntary moves; observed pass is assumed forced, not strategic. No inference from voluntary tile choice; no sampling seeds; no natural-play prevalence or winner/minus estimates. Branch reopening and blocked-tie scoring unconfirmed.',
  next:'Confirm physical reopening with a real recorded pass and exact public move history; test public-history likelihood under explicit opponent choice policies before full-game win-rate/regret claims.'};
if(require.main===module)console.log(JSON.stringify(result,null,2));
module.exports={run:()=>result};
