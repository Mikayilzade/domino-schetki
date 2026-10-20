'use strict';
// Pre-registered, non-disagreement-selected holdout: one fixed seat/opponent
// trajectory per seed; first multi-action position after turn >= minTurn.
// Evaluate EVERY legal action on the SAME hidden worlds and continuations.
// CLI: node qosha-research/simulator/pass-all-actions-holdout.js [test|start count worlds cap minTurn]
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),choose=require('./strategy-runner').chooseBy;
const select=require('./joint-pass-memory-runner').select;
const sample=require('./pass-conditioned-world').sample;
const key=require('./decision-regret').actionKey;
const deck=e.createDoubleSixDeck();
const profiles=['min-hand-pips','closed-branch-control'];
const variants=['a20-one','a28-one','a28-joint'];
const avg=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
function known(s){
 const used=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
 return deck.filter(t=>!used.has(e.tileKey(t)));
}
function playable(s){
 return deck.filter(t=>d.actionsForHand(s.branchState,s.openingState,[t]).length).map(e.tileKey);
}
function discover(start,count,cap,minTurn){
 const positions=[];let completed=0,eligible=0,tooMany=0,scanned=0;
 for(let seed=start;seed<start+count&&positions.length<cap;seed++){
  scanned++;
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('init '+seed);
  const seat=seed%3,profile=profiles[seed%2],forbid=[new Set(),new Set(),new Set()];
  let s=r.cloneRoundState(base),captured=false;
  while(!s.outcome&&s.turns<200){
   const p=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
   if(opts.phase==='pass'&&!s.stock.length)for(const k of playable(s))forbid[p].add(k);
   let action=null;
   if(opts.phase==='play'){
    if(p===seat){
     const kn=known(s);
     if(!captured&&s.turns>=minTurn&&!s.stock.length&&opts.actions.length>=2){
      eligible++;
      // Computational cap applies to action count, never to observed outcomes.
      if(opts.actions.length<=18){
       const choices=Object.fromEntries(variants.map(v=>[v,key(select(opts,s,kn,forbid,v).action)]));
       positions.push({seed,seat,profile,turn:s.turns,state:r.cloneRoundState(s),
        known:kn,forbid:forbid.map(x=>new Set(x)),actions:opts.actions,choices});
       captured=true;
       break;
      }else{tooMany++;captured=true;}
     }
     action=select(opts,s,kn,forbid,'a28-one').action;
    }else action=choose(profile,opts);
   }
   s=r.stepRound(s,()=>action);
  }
  if(!captured&&!s.outcome)throw Error('discovery unresolved');
  if(s.outcome)completed++;
 }
 return {positions,scanned,completed,eligible,tooMany};
}
function rollout(world,forced,policy,focal,seed){
 let first=true;
 const end=r.runRound(world,(opts,s)=>{
  if(first){
   first=false;
   const a=opts.actions.find(x=>key(x)===key(forced));
   if(!a)throw Error('candidate missing '+key(forced));
   return a;
  }
  return choose(policy,opts,{seed,turns:s.turns,player:s.currentPlayer});
 },{maxTurns:200});
 const o=end.outcome;
 if(!o||o.kind==='unresolved')throw Error('unresolved');
 return {first:+(o.kind==='finish'&&o.playerIndex===focal),
  pips:e.pipSum(end.hands[focal]),
  minus:+(o.kind==='finish'&&o.playerIndex===focal&&o.minus<0),
  block:+(o.kind==='block')};
}
function ci(rows,field){
 const vals=rows.map(x=>x[field]);
 if(!vals.length)return null;
 const mu=avg(vals);
 if(vals.length===1)return [mu,mu];
 const sd=Math.sqrt(vals.reduce((s,x)=>s+(x-mu)**2,0)/(vals.length-1));
 const half=1.96*sd/Math.sqrt(vals.length);
 return [mu-half,mu+half];
}
function run(start=1303200,count=90,worlds=20,cap=36,minTurn=12){
 for(const x of [start,count,worlds,cap,minTurn])if(!Number.isInteger(x)||x<0)throw Error('args');
 if(!count||!worlds||!cap)throw Error('zero count');
 const found=discover(start,count,cap,minTurn);
 const report={schema:'qosa-pass-all-actions-holdout/v1',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  seedRange:[start,start+found.scanned-1],requestedSeedCount:count,
  scannedDeals:found.scanned,discoveryTrajectories:found.scanned,
  completedDiscoveryRounds:found.completed,eligibleStates:found.eligible,
  actionCapSkips:found.tooMany,selectedPositions:found.positions.length,
  worldsPerPosition:worlds,continuationPolicies:profiles,
  selection:'Pre-registered: seat=seed%3; opponent profile=seed%2; first focal turn >= minTurn with >=2 legal actions and no stock, following a28-one until selection; no disagreement filter.',
  minTurn,variants,forcedContinuations:0,unresolved:0,results:{},
  assumptions:'Uniform hidden allocations conditional on exact hand sizes and no-stock pass history of BOTH opponents; all legal actions tested; same hidden worlds and continuation per action.',
  limitations:'Provisional branch rules; deterministic continuation bots; no policy-choice likelihood; finish-first not full match win; block winner unassigned; oracle regret in-sample optimistic; action-count cap 18; exploratory unadjusted CIs.'};
 for(const policy of profiles){
  const rows=[];
  for(const p of found.positions){
   const sums=Object.fromEntries(p.actions.map(a=>[key(a),{first:0,pips:0,minus:0,block:0}]));
   const unique=new Set(p.actions.map(key));
   if(unique.size!==p.actions.length)throw Error('duplicate action keys');
   for(let i=0;i<worlds;i++){
    const seed=e.mixSeed32((p.seed ^ Math.imul(p.turn+1,0x9e3779b9) ^
      Math.imul(p.seat+1,0x85ebca6b) ^ Math.imul(i+1,0xc2b2ae35))>>>0);
    const world=sample(p.state,p.seat,p.known,p.forbid,seed);
    for(const a of p.actions){
     const x=rollout(world,a,policy,p.seat,seed),s=sums[key(a)];
     for(const metric of ['first','pips','minus','block'])s[metric]+=x[metric];
     report.forcedContinuations++;
    }
   }
   for(const v of Object.values(sums))for(const metric of ['first','pips','minus','block'])v[metric]/=worlds;
   const bestFirst=Math.max(...Object.values(sums).map(x=>x.first));
   const bestPips=Math.min(...Object.values(sums).map(x=>x.pips));
   const bestMinus=Math.max(...Object.values(sums).map(x=>x.minus));
   const v=Object.fromEntries(variants.map(name=>{
    const x=sums[p.choices[name]];
    if(!x)throw Error('chosen action absent');
    return [name,{action:p.choices[name],...x,
      firstRegret:bestFirst-x.first,pipsRegret:x.pips-bestPips,minusRegret:bestMinus-x.minus}];
   }));
   rows.push({seed:p.seed,seat:p.seat,turn:p.turn,profile:p.profile,
    hand:p.state.hands[p.seat].map(e.tileKey),actions:p.actions.length,
    actionMetrics:sums,choices:v,
    changed28vs20:+(v['a28-one'].action!==v['a20-one'].action),
    changedJoint:+(v['a28-joint'].action!==v['a28-one'].action),
    delta28First:v['a28-one'].first-v['a20-one'].first,
    delta28Pips:v['a28-one'].pips-v['a20-one'].pips,
    deltaJointFirst:v['a28-joint'].first-v['a28-one'].first,
    deltaJointPips:v['a28-joint'].pips-v['a28-one'].pips});
  }
  const mean=x=>rows.length?avg(rows.map(x)):null;
  report.results[policy]={
   positions:rows.length,pairedWorlds:rows.length*worlds,
   actionsEvaluated:rows.reduce((a,x)=>a+x.actions,0),
   meanLegalActions:mean(x=>x.actions),
   changed28vs20:rows.reduce((a,x)=>a+x.changed28vs20,0),
   changedJoint:rows.reduce((a,x)=>a+x.changedJoint,0),
   delta28First:mean(x=>x.delta28First),delta28FirstCI95:ci(rows,'delta28First'),
   delta28Pips:mean(x=>x.delta28Pips),delta28PipsCI95:ci(rows,'delta28Pips'),
   deltaJointFirst:mean(x=>x.deltaJointFirst),deltaJointFirstCI95:ci(rows,'deltaJointFirst'),
   deltaJointPips:mean(x=>x.deltaJointPips),
   variants:Object.fromEntries(variants.map(name=>[name,{
    finishFirst:mean(x=>x.choices[name].first),
    meanPips:mean(x=>x.choices[name].pips),
    minusFinish:mean(x=>x.choices[name].minus),
    block:mean(x=>x.choices[name].block),
    meanFirstRegret:mean(x=>x.choices[name].firstRegret),
    meanPipsRegret:mean(x=>x.choices[name].pipsRegret),
    meanMinusRegret:mean(x=>x.choices[name].minusRegret)
   }])),
   examples:rows.filter(x=>x.changed28vs20||x.changedJoint).slice(0,6).map(x=>({
    seed:x.seed,turn:x.turn,seat:x.seat,hand:x.hand,actions:x.actions,
    a20:x.choices['a20-one'],a28:x.choices['a28-one'],joint:x.choices['a28-joint']
   }))
  };
 }
 return report;
}
function test(){
 const a=run(1303200,4,2,3,12),b=run(1303200,4,2,3,12);
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('nondeterministic');
 if(a.selectedPositions>3||a.unresolved)throw Error('invalid totals');
 if(a.forcedContinuations!==Object.values(a.results).reduce((sum,x)=>sum+x.actionsEvaluated*a.worldsPerPosition,0))throw Error('count');
 return {passed:true,selected:a.selectedPositions,forced:a.forcedContinuations};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(
 +(a[0]||1303200),+(a[1]||90),+(a[2]||20),+(a[3]||36),+(a[4]||12)),null,2));
}
module.exports={discover,run,test};
