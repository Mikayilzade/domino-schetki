'use strict';
// Exact seat-1 tile posterior after one/two forced passes in a constructed 3x9 witness.
// Both late-arrival branch models are PROVISIONAL. Run: node this-file [--test] [--hand 3-3,0-0,...] [--event first|both]
const assert = require('node:assert/strict');
const deck=[]; for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)deck.push(a+"-"+b);
const prefix=['1-1','1-2','2-2','2-4','4-4','4-5','5-5','2-5'];
const knownFuture=['1-3','3-3']; // seat 2 and seat 0, respectively
const excluded=new Set([...prefix,...knownFuture]);
assert.equal(excluded.size,10);
const free=deck.filter(t=>!excluded.has(t));
assert.equal(free.length,18);
const touches=(t,n)=>t.split('-').includes(String(n));
const mask={current:new Set(free.filter(t=>touches(t,1))),global:new Set(free.filter(t=>touches(t,1)||touches(t,2)))};
const later=new Set(free.filter(t=>touches(t,3)));
function choose(n,k){if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x=x*(n-i+1)/i;return Math.round(x);}
function subsets(items,k,fn){const acc=[];function go(start){if(acc.length===k){fn(acc.slice());return;}for(let i=start;i<=items.length-(k-acc.length);i++){acc.push(items[i]);go(i+1);acc.pop();}}go(0);}
function posterior(own,model,event){
  assert(['current','global'].includes(model)&&['first','both'].includes(event));
  assert.equal(own.length,6);assert(own.includes('3-3'));
  assert.equal(new Set(own).size,6);
  assert(own.every(t=>t==='3-3'||free.includes(t)));
  const pool=free.filter(t=>!own.includes(t));assert.equal(pool.length,13);
  const forbidden=t=>mask[model].has(t)||(event==='both'&&later.has(t));
  const allowed=pool.filter(t=>!forbidden(t));
  const worlds=choose(allowed.length,7);
  const numerator=Object.fromEntries(pool.map(t=>[t,allowed.includes(t)?choose(allowed.length-1,6):0]));
  assert.equal(Object.values(numerator).reduce((a,b)=>a+b,0),7*worlds);
  return {model,event,own,remainingPool:pool,allowed,compatibleWorlds:worlds,
    posterior:worlds?Object.fromEntries(pool.map(t=>[t,numerator[t]/worlds])):null,numerator};
}
function brute(own,model,event){const pool=free.filter(t=>!own.includes(t));const counts=Object.fromEntries(pool.map(t=>[t,0]));let worlds=0;
  subsets(pool,7,hand=>{if(hand.some(t=>mask[model].has(t)||(event==='both'&&later.has(t))))return;
    worlds++;for(const t of hand)counts[t]++;});return {worlds,counts};}
function run(){
  const events={};for(const model of ['current','global'])for(const event of ['first','both'])events[model+'-'+event]={worlds:0,ownHandsPossible:0,tiles:Object.fromEntries(free.map(t=>[t,0]))};
  let ownHands=0,example=null,bruteChecks=0;
  subsets(free,5,part=>{
    const own=['3-3',...part];ownHands++;
    for(const model of ['current','global'])for(const event of ['first','both']){
      const r=posterior(own,model,event),agg=events[model+'-'+event];
      agg.worlds+=r.compatibleWorlds;agg.ownHandsPossible+=Number(r.compatibleWorlds>0);
      for(const [t,n] of Object.entries(r.numerator))agg.tiles[t]+=n;
    }
    if(!example&&!own.includes('2-6')&&posterior(own,'global','both').compatibleWorlds>0)example=own;
    if(ownHands===1||ownHands===111||ownHands===4000||ownHands===8568){
      for(const model of ['current','global'])for(const event of ['first','both']){
        const a=posterior(own,model,event),b=brute(own,model,event);
        assert.equal(a.compatibleWorlds,b.worlds);
        assert.deepEqual(a.numerator,b.counts);bruteChecks+=choose(13,7);
      }
    }
  });
  assert.equal(ownHands,8568);assert(example);
  const expected={ 'current-first':1585584,'global-first':152460,'current-both':16632,'global-both':462};
  for(const [k,r] of Object.entries(events)){
    assert.equal(r.worlds,expected[k]);
    assert.equal(Object.values(r.tiles).reduce((a,b)=>a+b,0),7*r.worlds);
    r.p2_6=r.tiles['2-6']/r.worlds;
    r.p0_6=r.tiles['0-6']/r.worlds;
    delete r.tiles;
  }
  assert.equal(events['current-first'].p2_6,0.5);
  assert.equal(events['current-both'].p2_6,7/9);
  assert.equal(events['global-first'].p2_6,0);
  assert.equal(events['global-both'].p2_6,0);
  const examples={};for(const model of ['current','global'])for(const event of ['first','both']){
    const r=posterior(example,model,event);examples[model+'-'+event]={compatibleWorlds:r.compatibleWorlds,
      p2_6:r.posterior?.['2-6']??null,p0_6:r.posterior?.['0-6']??null,
      candidateTilePosterior:r.posterior};
  }
  return {version:'late-arrival-tile-posterior/v1',passed:true,mode:'recovered qosa-1.0.0 3x9',
    branchModels:'BOTH PROVISIONAL',prefix,knownFuture,knownStock:'1-2 drawn by seat 0 and played',
    events:'first = seat 1 forced pass; both = first pass, seat 2 plays 1-3, seat 0 plays 3-3, seat 1 forced pass again',
    design:'uniform over 8568 possible seat-0 remaining hands (3-3 plus five of 18), then 1716 seat-1 hands from 13 remaining tiles',
    ownHands,bruteOpponentHandsChecked:bruteChecks,events,exampleOwnHand:example,examples,
    interpretation:'For an ACTUALLY KNOWN own hand use --hand; do not interpret marginal averages as physical rule odds or natural-game frequencies.',
    caveats:'Forced scripted moves; unweighted voluntary move selection; branch reopening and blocked-tie scoring unconfirmed; no full-game winning tactic.',
    next:'Apply per-hand posterior to a genuine logged forced pass, authenticate physical branch rule and blocked ties.'};
}
if(require.main===module){
  const h=process.argv.indexOf('--hand');
  if(h>=0){const own=process.argv[h+1].split(',');const e=process.argv.indexOf('--event');const event=e>=0?process.argv[e+1]:'both';
    console.log(JSON.stringify({own,event,current:posterior(own,'current',event),global:posterior(own,'global',event)},null,2));}
  else console.log(JSON.stringify(run(),null,2));
}
module.exports={run,posterior,brute};
