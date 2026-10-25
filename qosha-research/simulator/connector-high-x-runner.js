'use strict';
// High-X (4-4/5-5/6-6) legal X-X versus X-Y with X>Y, fresh-seed targeted scan.
// No synthetic hands: one selected late-game state per deal/seat trajectory, preferring
// next opponent 1 tile over 2-4 tiles. Geometry and number locking PROVISIONAL.
// node qosha-research/simulator/connector-high-x-runner.js test
// node qosha-research/simulator/connector-high-x-runner.js 1534940 8000 24
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),b=require('./strategy-runner');
const legal=require('./branch-legal-choice'),abl=require('./branch-unlock-delay-ablation');
const deck=e.createDoubleSixDeck(),key=e.tileKey;
const profiles=['min-hand-pips','closed-branch-control'];
const ak=a=>[a.type,(a.numbers||[]).join(','),a.side||'',a.to??'',key(a.tile||[0,0])].join(':');
const playable=s=>new Set(deck.filter(t=>d.actionsForHand(s.branchState,s.openingState,[t]).length).map(key));
function pairs(s,p){
 const o=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
 if(o.phase!=='play'||o.drawn||o.actions.some(a=>a.type==='mixed-finish'))return[];
 const out=[];
 for(const a of o.actions.filter(a=>a.type==='double-sequence'&&a.tiles.length===1&&a.numbers[0]>=4&&!s.openingState.openedNumbers.has(a.numbers[0])))
 for(const c of o.actions.filter(a=>a.type==='single')){
  const x=a.numbers[0];if(!c.tile.includes(x))continue;
  const y=c.tile[0]===x?c.tile[1]:c.tile[0];if(y>=x)continue;
  const after=d.applyTurn(s.branchState,s.openingState,s.hands[p],s.stock,c).hand;
  out.push({x,y,gap:x-y,double:ak(a),single:ak(c),connectorsAfter:after.filter(t=>t[0]!==t[1]&&t.includes(x)).length});
 }
 out.sort((a,b)=>b.x-a.x||a.gap-b.gap||a.double.localeCompare(b.double)||a.single.localeCompare(b.single));
 return out;
}
function collect(start,count){
 if(![start,count].every(Number.isInteger)||count<2||count%2)throw Error('seed/count');
 const positions=[],scan={};let fullRounds=0,finishes=0,blocks=0,unresolved=0;
 for(let pi=0;pi<2;pi++){
  const profile=profiles[pi],begin=start+pi*count/2,end=begin+count/2;
  let selected=0,early=0,late=0,trajectories=0;
  for(let seed=begin;seed<end;seed++){
   const initial=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(initial.kind!=='ready')throw Error('initializer '+seed);
   for(let seat=0;seat<3;seat++){
    trajectories++;let s=r.cloneRoundState(initial),candidateEarly=null,candidateLate=null;
    const live=new Set([...initial.hands.flat(),...initial.stock].map(key));
    const known=deck.filter(t=>!live.has(key(t))).map(t=>t.slice());
    const forbidden=[new Set(),new Set(),new Set()];
    if(initial.openingPassed)for(const k of playable(s))forbidden[initial.starter].add(k);
    while(!s.outcome&&s.turns<200){
     const p=s.currentPlayer,n=(p+1)%3,o=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
     if(o.phase==='pass'&&!s.stock.length){
      for(const k of playable(s))forbidden[p].add(k);
      if(s.hands[p].some(t=>forbidden[p].has(key(t))))throw Error('pass contradiction');
     }
     if(p===seat&&!s.stock.length&&s.hands[p].length>=3&&s.hands[n].length>=1&&s.hands[n].length<=4){
      const q=pairs(s,p)[0];
      if(q){
       const pos={profile,seed,seat,turn:s.turns,state:r.cloneRoundState(s),
        known:known.map(t=>t.slice()),forbidden:forbidden.map(x=>[...x]),
        focalHandSize:s.hands[p].length,nextHandSize:s.hands[n].length,...q};
       if(s.hands[n].length===1&&!candidateLate)candidateLate=pos;
       else if(s.hands[n].length>1&&!candidateEarly)candidateEarly=pos;
      }
     }
     const a=o.phase==='play'?b.chooseBy(profile,o,{seed,turns:s.turns,player:p}):null;
     s=r.stepRound(s,()=>a);
     if(a)known.push(...(a.type==='single'?[a.tile]:(a.tiles||[])).map(t=>t.slice()));
    }
    fullRounds++;
    if(!s.outcome||s.outcome.kind==='unresolved')unresolved++;
    else if(s.outcome.kind==='finish')finishes++;else blocks++;
    const selectedPos=candidateLate||candidateEarly;
    if(selectedPos){positions.push(selectedPos);selected++;if(candidateLate)late++;else early++;}
   }
  }
  scan[profile]={seedStart:begin,seedEnd:end-1,dealsScanned:count/2,trajectories,selected,oneStone:late,twoToFour:early};
 }
 return{positions,scan,fullRounds,finishes,blocks,unresolved};
}
function ci(xs){if(!xs.length)return{n:0,mean:null,halfWidth95:null};
 const mean=xs.reduce((a,b)=>a+b,0)/xs.length;
 const v=xs.length>1?xs.reduce((a,x)=>a+(x-mean)**2,0)/(xs.length-1):0;
 return{n:xs.length,mean,halfWidth95:xs.length>1?1.96*Math.sqrt(v/xs.length):null};}
function summarize(rows){return{positions:rows.length,
 immediateNextFinishDeltaPP:ci(rows.map(x=>100*x.immediateNextFinishDelta)),
 nextPlayableDelta:ci(rows.map(x=>x.nextPlayableDelta)),
 focalFinishFirstDeltaPP:ci(rows.map(x=>100*x.winDelta)),
 focalRemainderDelta:ci(rows.map(x=>x.pipsDelta)),
 focalMinusFinishDeltaPP:ci(rows.map(x=>100*x.minusDelta)),
 blockDeltaPP:ci(rows.map(x=>100*x.blockDelta)),
 gap:ci(rows.map(x=>x.gap)),connectorsAfter:ci(rows.map(x=>x.connectorsAfter))};}
function run(start=1534940,count=8000,worlds=24){
 if(!Number.isInteger(worlds)||worlds<1||worlds>64)throw Error('worlds');
 const disc=collect(start,count);if(disc.unresolved)throw Error('unresolved');
 const rows=[],policies=['min-hand-pips','closed-branch-control'],metrics=['win','pips','minus','block','nextPlayable','immediateNextFinish','turns'];
 for(const pos of disc.positions){
  const before=JSON.stringify(pos.state);
  const sums=Object.fromEntries(policies.map(x=>[x,Object.fromEntries(metrics.map(k=>[k,0]))]));
  for(let i=0;i<worlds;i++){
   const ws=e.mixSeed32((1534940000^Math.imul(pos.seed,0x9e3779b9)^Math.imul(pos.seat+1,0x85ebca6b)^i)>>>0);
   const world=abl.sample(pos,ws);
   for(const policy of policies){
    const a=legal.rollout(world,pos,pos.double,policy,ws),c=legal.rollout(world,pos,pos.single,policy,ws);
    for(const k of metrics)sums[policy][k]+=(a[k]-c[k])/worlds;
   }
  }
  if(JSON.stringify(pos.state)!==before)throw Error('state mutation');
  rows.push({seed:pos.seed,seat:pos.seat,profile:pos.profile,turn:pos.turn,x:pos.x,y:pos.y,gap:pos.gap,
   nextHandSize:pos.nextHandSize,focalHandSize:pos.focalHandSize,connectorsAfter:pos.connectorsAfter,
   double:pos.double,single:pos.single,
   policies:Object.fromEntries(policies.map(policy=>[policy,Object.fromEntries(metrics.map(k=>[k+'Delta',sums[policy][k]]))]))});
 }
 const flatten=policy=>rows.map(x=>({...x,...x.policies[policy]}));
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-high-x-targeted-v1',timestampBaku:stamp,engine:'qosa-research-0.5.3',
  rules:'recovered qosa-1.0.0 3x9; number locking PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,uniqueDeals:count,scan:disc.scan,
  fullRoundDiscoveryContinuations:disc.fullRounds,finishes:disc.finishes,blocks:disc.blocks,unresolved:disc.unresolved,
  positions:rows.length,worldsPerPosition:worlds,hiddenWorldAllocations:rows.length*worlds,
  forcedCounterfactualContinuations:rows.length*worlds*2*policies.length,
  strategies:profiles,continuationPolicies:policies,
  summary:Object.fromEntries(policies.map(policy=>{
   const x=flatten(policy);return[policy,{all:summarize(x),
    byX:Object.fromEntries([4,5,6].map(n=>[n,summarize(x.filter(t=>t.x===n))])),
    byNextHand:Object.fromEntries(['1','2-4'].map(n=>[n,summarize(x.filter(t=>n==='1'?t.nextHandSize===1:t.nextHandSize>=2))])),
    byConnectors:Object.fromEntries(['0','1+'].map(n=>[n,summarize(x.filter(t=>n==='0'?t.connectorsAfter===0:t.connectorsAfter>0))]))}]})),
  rows,worldSeedFormula:'mixSeed32(1534940000 XOR imul(dealSeed,0x9e3779b9) XOR imul(seat+1,0x85ebca6b) XOR worldIndex)',
  selection:'Fresh real seeded 3x9 trajectories; scan all turns (not first eligible) and pick at most one high-X positive-gap legal pair per deal/seat trajectory, preferring next opponent exactly one stone over 2-4. X=6>5>4 priority, then smallest positive gap. No synthetic hands. Same worlds per legal pair; two continuation bots.',
  limitations:'Selected positions from up to 3 seat rotations of same deal are correlated; position-cluster CIs are exploratory and may understate uncertainty. Provisional number-lock geometry, legal arms differ in discarded tile/remaining double, simple bots, pass-conditioned posterior ignores action-choice likelihood, block winner/loneZero/bust/101-match scoring unvalidated. Finish-first != match win.',
  nextAction:'Repeat high-X strata in disjoint seed windows; if underpowered switch to hand-size-balanced non-one-stone states; authenticate real four-branch opening and block scoring.'};
}
function test(){
 const bs=e.createBranchState([1,1]);bs.branches.up.end=5;
 const s={branchState:bs,openingState:e.createOpeningState([1]),hands:[[[5,5],[1,5],[0,1]],[],[]],stock:[]};
 const p=pairs(s,0);if(!p.length||p[0].x!==5||p[0].y!==1||p[0].gap!==4)throw Error('high-X legal pair fixture');
 const a=run(1534940,40,2),z=run(1534940,40,2);delete a.timestampBaku;delete z.timestampBaku;
 if(JSON.stringify(a)!==JSON.stringify(z)||a.unresolved||a.forcedCounterfactualContinuations!==a.positions*8)throw Error('deterministic replay');
 return{passed:true,fixture:'5-5 vs 1-5',positions:a.positions,forced:a.forcedCounterfactualContinuations};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1534940),+(a[1]||8000),+(a[2]||24)),null,2));}
module.exports={pairs,collect,run,test,summarize};
