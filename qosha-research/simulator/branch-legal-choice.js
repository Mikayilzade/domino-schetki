'use strict';
// Legal single-vs-double decision comparison at a one-stone next opponent.
// Unlike branch-unlock-delay-ablation, BOTH arms are legal moves.
// Model-specific number locks are PROVISIONAL; different discarded tiles/pips can confound outcomes.
// node qosha-research/simulator/branch-legal-choice.js test
// node qosha-research/simulator/branch-legal-choice.js 1485340 1600 24 64
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),b=require('./strategy-runner'),abl=require('./branch-unlock-delay-ablation');
const DECK=e.createDoubleSixDeck(),PROFILES=['min-hand-pips','closed-branch-control'],key=e.tileKey;
const actionKey=a=>[a.type,(a.numbers||[]).join(','),a.side||'',a.to??'',key(a.tile||[0,0])].join(':');
const pips=a=>e.pipSum(a.type==='single'?[a.tile]:(a.tiles||[]));
function pairFor(opts,opening){
 if(opts.phase!=='play'||opts.drawn||opts.actions.some(a=>a.type==='mixed-finish'))return null;
 const singles=opts.actions.filter(a=>a.type==='single');
 const doubles=opts.actions.filter(a=>a.type==='double-sequence'&&a.tiles.length===1&&!opening.openedNumbers.has(a.numbers[0]));
 const pairs=[];for(const single of singles)for(const dbl of doubles)
  pairs.push({single,double:dbl,absDiff:Math.abs(pips(dbl)-pips(single)),sort:actionKey(dbl)+'|'+actionKey(single)});
 pairs.sort((a,b)=>a.absDiff-b.absDiff||a.sort.localeCompare(b.sort));
 return pairs[0]||null;
}
function playable(s){return new Set(DECK.filter(t=>d.actionsForHand(s.branchState,s.openingState,[t]).length).map(key));}
function collect(start,count,quota){
 if(![start,count,quota].every(Number.isInteger)||count<2||count%2||quota<1)throw Error('scan args');
 const positions=[],scan={};let fullRounds=0,finishes=0,blocks=0,unresolved=0;
 for(let pi=0;pi<2;pi++){
  const profile=PROFILES[pi],begin=start+pi*count/2,end=begin+count/2;
  let seen=0,trajectories=0,eligible=0,selected=0,last=begin-1,equal=0;
  for(let seed=begin;seed<end&&selected<quota;seed++){
   seen++;last=seed;
   const initial=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(initial.kind!=='ready')throw Error('init '+seed);
   let chosen=false;
   for(let seat=0;seat<3;seat++){
    trajectories++;let s=r.cloneRoundState(initial);
    const live=new Set([...initial.hands.flat(),...initial.stock].map(key));
    const known=DECK.filter(t=>!live.has(key(t))).map(t=>t.slice());
    const forbidden=[new Set(),new Set(),new Set()];
    if(initial.openingPassed)for(const k of playable(s))forbidden[initial.starter].add(k);
    while(!s.outcome&&s.turns<200){
     const p=s.currentPlayer,n=(p+1)%3,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
     if(opts.phase==='pass'&&!s.stock.length){
      for(const k of playable(s))forbidden[p].add(k);
      if(s.hands[p].some(t=>forbidden[p].has(key(t))))throw Error('pass contradiction');
     }
     if(!chosen&&p===seat&&s.hands[n].length===1&&s.hands[p].length>=3&&!s.stock.length){
      const pair=pairFor(opts,s.openingState);
      if(pair){
       eligible++;
       positions.push({profile,seed,seat,turn:s.turns,state:r.cloneRoundState(s),
        known:known.map(t=>t.slice()),forbidden:forbidden.map(x=>[...x]),
        double:actionKey(pair.double),single:actionKey(pair.single),
        doublePips:pips(pair.double),singlePips:pips(pair.single),number:pair.double.numbers[0],
        nextHandSize:1,focalHandSize:s.hands[p].length});
       if(pair.absDiff===0)equal++;
       selected++;chosen=true;
      }
     }
     const a=opts.phase==='play'?b.chooseBy(profile,opts,{seed,turns:s.turns,player:p}):null;
     s=r.stepRound(s,()=>a);
     if(a)known.push(...(a.type==='single'?[a.tile]:(a.tiles||[])).map(t=>t.slice()));
    }
    fullRounds++;
    if(!s.outcome||s.outcome.kind==='unresolved')unresolved++;
    else if(s.outcome.kind==='finish')finishes++;else blocks++;
    if(chosen)break;
   }
  }
  scan[profile]={seedStart:begin,seedEnd:last,dealsScanned:seen,trajectories,eligible,selected,equalPipsPairs:equal};
 }
 return{positions,scan,fullRounds,finishes,blocks,unresolved};
}
function rollout(world,pos,actionKeyWanted,profile,seed){
 const p=pos.seat,n=(p+1)%3;
 const opts=d.turnOptions(world.branchState,world.openingState,world.hands[p],world.stock);
 const a=opts.actions.find(x=>actionKey(x)===actionKeyWanted);
 if(!a)throw Error('legal candidate changed');
 let s=r.stepRound(world,()=>a);
 if(s.outcome)throw Error('forced action unexpectedly finished');
 const nextOpts=d.turnOptions(s.branchState,s.openingState,s.hands[n],s.stock);
 const nextPlayable=s.hands[n].filter(t=>d.actionsForHand(s.branchState,s.openingState,[t]).length).length;
 const nextPass=+(nextOpts.phase==='pass');
 const nextAction=nextOpts.phase==='play'?b.chooseBy(profile,nextOpts,{seed,turns:s.turns,player:n}):null;
 s=r.stepRound(s,()=>nextAction);
 const immediateNextFinish=+(s.outcome?.kind==='finish'&&s.outcome.playerIndex===n);
 const end=r.runRound(s,(o,state)=>b.chooseBy(profile,o,{seed,turns:state.turns,player:state.currentPlayer}),{maxTurns:200});
 if(end.outcome.kind==='unresolved')throw Error('unresolved continuation');
 return{nextPlayable,nextPass,immediateNextFinish,win:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===p),
  pips:e.pipSum(end.hands[p]),minus:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===p&&end.outcome.minus<0),
  minusCode:end.outcome.kind==='finish'&&end.outcome.playerIndex===p?String(end.outcome.minus||0):'none',
  block:+(end.outcome.kind==='block'),turns:end.turns-world.turns,
  remainingDoubles:end.hands[p].filter(t=>t[0]===t[1]).length};
}
function ci(xs){if(!xs.length)return{n:0,mean:null,halfWidth95:null};
 const m=xs.reduce((a,b)=>a+b,0)/xs.length;
 const v=xs.length>1?xs.reduce((a,x)=>a+(x-m)**2,0)/(xs.length-1):0;
 return{n:xs.length,mean:m,halfWidth95:xs.length>1?1.96*Math.sqrt(v/xs.length):null};}
function run(start=1485340,count=1600,quota=24,worlds=64){
 if(!Number.isInteger(worlds)||worlds<1||worlds>128)throw Error('worlds');
 const disc=collect(start,count,quota),rows=[];
 if(disc.unresolved)throw Error('unresolved discovery');
 for(const pos of disc.positions){
  const before=JSON.stringify(pos.state);
  const sums={nextPlayable:0,nextPass:0,immediateNextFinish:0,win:0,pips:0,minus:0,block:0,turns:0,remainingDoubles:0};
  const minusCounts={double:{},single:{}};
  for(let i=0;i<worlds;i++){
   const ws=(3980000000+(pos.seed-start)*512+pos.seat*128+i)>>>0;
   const world=abl.sample(pos,ws);
   const x=rollout(world,pos,pos.double,pos.profile,ws),y=rollout(world,pos,pos.single,pos.profile,ws);
   for(const k of Object.keys(sums))sums[k]+=(x[k]-y[k])/worlds;
   for(const [arm,v] of [['double',x],['single',y]])
    minusCounts[arm][v.minusCode]=(minusCounts[arm][v.minusCode]||0)+1;
  }
  if(JSON.stringify(pos.state)!==before)throw Error('source mutation');
  rows.push({seed:pos.seed,profile:pos.profile,seat:pos.seat,turn:pos.turn,number:pos.number,
   double:pos.double,single:pos.single,doublePips:pos.doublePips,singlePips:pos.singlePips,
   pipDiff:pos.doublePips-pos.singlePips,samePips:pos.doublePips===pos.singlePips,
   focalHandSize:pos.focalHandSize,...Object.fromEntries(Object.entries(sums).map(([k,v])=>[k+'Delta',v])),
   minusCounts});
 }
 const summaries={};
 for(const profile of PROFILES){
  summaries[profile]={};
  for(const label of ['all','same-pips','different-pips']){
   const sub=rows.filter(x=>x.profile===profile&&(label==='all'||(label==='same-pips')===x.samePips));
   summaries[profile][label]={positions:sub.length,matchedWorlds:sub.length*worlds,
    forcedContinuations:sub.length*worlds*2,meanDiscardPipDifference:ci(sub.map(x=>x.pipDiff)),
    immediateOpponentFinishChangePP:ci(sub.map(x=>100*x.immediateNextFinishDelta)),
    nextOpponentPlayableChange:ci(sub.map(x=>x.nextPlayableDelta)),
    nextOpponentPassChangePP:ci(sub.map(x=>100*x.nextPassDelta)),
    focalFinishFirstChangePP:ci(sub.map(x=>100*x.winDelta)),
    focalRemainderChange:ci(sub.map(x=>x.pipsDelta)),
    focalMinusFinishChangePP:ci(sub.map(x=>100*x.minusDelta)),
    blockChangePP:ci(sub.map(x=>100*x.blockDelta)),
    meanTurnDifference:ci(sub.map(x=>x.turnsDelta)),
    meanRemainingDoubleDifference:ci(sub.map(x=>x.remainingDoublesDelta)),
    focalMinusCounts:Object.fromEntries(['double','single'].map(arm=>[arm,
     Object.fromEntries(['none','0','-10','-20','-30','-40'].map(k=>[k,sub.reduce((z,x)=>z+(x.minusCounts[arm][k]||0),0)]))]))};
  }
 }
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',
  day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-legal-single-vs-double-one-stone/v1',timestampBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9; number-lock PROVISIONAL',
  startSeed:start,reservedEndSeed:start+count-1,
  latestConsumedSeed:Math.max(...Object.values(disc.scan).map(x=>x.seedEnd)),
  discovery:disc.scan,uniqueDiscoverySeeds:Object.values(disc.scan).reduce((z,x)=>z+x.dealsScanned,0),
  fullRoundDiscoveryContinuations:disc.fullRounds,discoveryFinishes:disc.finishes,
  discoveryBlocks:disc.blocks,discoveryUnresolved:disc.unresolved,
  positions:rows.length,matchedHiddenWorldAllocations:rows.length*worlds,
  forcedCounterfactualContinuations:2*rows.length*worlds,worldsPerPosition:worlds,
  profiles:PROFILES,summaries,rows,
  worldSeedFormula:'(3980000000+(dealSeed-startSeed)*512+seat*128+worldIndex)>>>0',
  comparison:'Both actions are LEGAL: play one number-opening double vs play one ordinary single, both from same state. Choose pair with minimum absolute discarded-pip difference; deterministic lexical tie-break. Same hidden worlds and continuation bot.',
  limitations:'Not pure unlock ablation: the discarded tile, pip sum (unless same-pips), and retained double differ. Authentic four-branch number-lock semantics provisional; pass posterior excludes action likelihood; no validated 101-point scoring, block winner, loneZero/bust. Finish-first is not match win; selected late-game positions and exploratory CIs.',
  nextAction:'Independent legal-choice holdout, enlarge same-pips stratum, test pass-conditioned worlds and authentic real-table lock geometry.'};
}
function test(){
 const fixture={phase:'play',drawn:false,actions:[
  {type:'single',tile:[0,4],side:'up',to:4},
  {type:'single',tile:[2,3],side:'up',to:3},
  {type:'double-sequence',tiles:[[2,2]],numbers:[2]},
  {type:'double-sequence',tiles:[[3,3]],numbers:[3]}]};
 const pair=pairFor(fixture,e.createOpeningState([1]));
 if(!pair||pips(pair.single)!==pips(pair.double)||pips(pair.double)!==4)throw Error('equal-pip pair priority');
 const x=run(1485340,400,2,3),y=run(1485340,400,2,3);
 delete x.timestampBaku;delete y.timestampBaku;
 if(JSON.stringify(x)!==JSON.stringify(y)||x.positions!==4||x.discoveryUnresolved)throw Error('deterministic replay');
 return{passed:true,positions:x.positions,forced:x.forcedCounterfactualContinuations};
}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1485340),
 +(a[1]||1600),+(a[2]||24),+(a[3]||64)),null,2));}
module.exports={pairFor,collect,rollout,run,test};
