'use strict';
// One-turn delayed unlock: an explicitly NONLEGAL intervention, not a candidate move.
// Both arms play the identical double, remove identical pips, keep identical focal hand;
// only the immediately following opponent turn sees the number locked vs unlocked.
// Reproduce: node qosha-research/simulator/branch-unlock-delay-ablation.js test
// node qosha-research/simulator/branch-unlock-delay-ablation.js 1482740 1000 100 48
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),b=require('./strategy-runner');
const DECK=e.createDoubleSixDeck(),PROFILES=['min-hand-pips','closed-branch-control'];
const key=e.tileKey,mean=xs=>xs.reduce((a,x)=>a+x,0)/xs.length;
function actionKey(a){return [a.type,(a.numbers||[]).join(','),a.side||'',a.to??'',key(a.tile||[0,0])].join(':');}
function playable(s){return new Set(DECK.filter(t=>d.actionsForHand(s.branchState,s.openingState,[t]).length).map(key));}
function collect(start,count,limit){
 const positions=[],scan={};let fullRounds=0,finishes=0,blocks=0,unresolved=0;
 for(let profileIndex=0;profileIndex<PROFILES.length;profileIndex++){
  const profile=PROFILES[profileIndex];
  let found=0,seen=0,trajectories=0,eligible=0;
  outer:for(let seed=start+profileIndex*Math.floor(count/PROFILES.length);seed<start+(profileIndex+1)*Math.floor(count/PROFILES.length);seed++){
   const initial=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(initial.kind!=='ready')throw Error('initializer '+seed);
   seen++;
   for(let seat=0;seat<3;seat++){
    trajectories++;
    let s=r.cloneRoundState(initial),selected=false;
    const live=new Set([...initial.hands.flat(),...initial.stock].map(key));
    const known=DECK.filter(t=>!live.has(key(t))).map(t=>t.slice());
    const forbidden=[new Set(),new Set(),new Set()];
    if(initial.openingPassed)for(const k of playable(s))forbidden[initial.starter].add(k);
    while(!s.outcome&&s.turns<200){
     const p=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
     if(opts.phase==='pass'&&!s.stock.length){
      for(const k of playable(s))forbidden[p].add(k);
      if(s.hands[p].some(t=>forbidden[p].has(key(t))))throw Error('pass contradiction');
     }
     if(!selected&&p===seat&&opts.phase==='play'&&!opts.drawn&&!s.stock.length&&
        s.hands[p].length>=3&&!opts.actions.some(a=>a.type==='mixed-finish')){
      const candidates=opts.actions.filter(a=>a.type==='double-sequence'&&a.tiles.length===1&&
        !s.openingState.openedNumbers.has(a.numbers[0]));
      if(candidates.length){
       eligible++;
       const h=e.mixSeed32((seed^Math.imul(seat+1,0x85ebca6b)^Math.imul(s.turns+1,0xc2b2ae35))>>>0);
       const a=candidates[h%candidates.length];
       positions.push({profile,seed,seat,turn:s.turns,state:r.cloneRoundState(s),
        known:known.map(t=>t.slice()),forbidden:forbidden.map(x=>[...x]),
        action:actionKey(a),number:a.numbers[0],focalHandSize:s.hands[p].length,
        nextHandSize:s.hands[(p+1)%3].length});
       selected=true;found++;
      }
     }
     const a=opts.phase==='play'?b.chooseBy(profile,opts,{seed,turns:s.turns,player:p}):null;
     s=r.stepRound(s,()=>a);
     if(a)known.push(...(a.type==='single'?[a.tile]:(a.tiles||[])).map(t=>t.slice()));
    }
    if(!s.outcome||s.outcome.kind==='unresolved')unresolved++;
    else if(s.outcome.kind==='finish')finishes++;
    else blocks++;
    fullRounds++;
    if(selected)break;
   }
   if(found>=limit)break outer;
  }
  scan[profile]={seedStart:start+profileIndex*Math.floor(count/PROFILES.length),seedEnd:start+profileIndex*Math.floor(count/PROFILES.length)+seen-1,dealsScanned:seen,trajectories,eligible,selected:found};
 }
 return{positions,scan,fullRounds,finishes,blocks,unresolved};
}
function sample(pos,seed){
 const s=r.cloneRoundState(pos.state),p=pos.seat,n=(p+1)%3,o=(p+2)%3;
 if(s.stock.length||s.currentPlayer!==p)throw Error('requires no-stock focal turn');
 const visible=[...pos.known,...s.hands[p]],used=new Set(visible.map(key));
 if(visible.length!==used.size)throw Error('duplicate visible tiles');
 const pool=DECK.filter(t=>!used.has(key(t))),mandatoryN=[],mandatoryO=[],flex=[];
 for(const tile of pool){
  const k=key(tile),fn=pos.forbidden[n].includes(k),fo=pos.forbidden[o].includes(k);
  if(fn&&fo)throw Error('inconsistent pass constraints');
  if(fo)mandatoryN.push(tile);else if(fn)mandatoryO.push(tile);else flex.push(tile);
 }
 const need=s.hands[n].length-mandatoryN.length;
 if(need<0||need>flex.length||mandatoryO.length+flex.length-need!==s.hands[o].length)
  throw Error('hidden hand-size mismatch');
 const ranks=new Map(e.shuffledDeck(seed).map((t,i)=>[key(t),i]));
 flex.sort((x,y)=>ranks.get(key(x))-ranks.get(key(y)));
 s.hands[n]=mandatoryN.concat(flex.slice(0,need));
 s.hands[o]=mandatoryO.concat(flex.slice(need));
 const all=[...visible,...s.hands[n],...s.hands[o]];
 if(all.length!==28||new Set(all.map(key)).size!==28)throw Error('28-tile invariant');
 for(const q of [n,o])if(s.hands[q].some(t=>pos.forbidden[q].includes(key(t))))
  throw Error('pass posterior violation');
 return s;
}
function rollout(world,pos,profile,seed,delay){
 const p=pos.seat,n=(p+1)%3,opts=d.turnOptions(world.branchState,world.openingState,world.hands[p],world.stock);
 const forced=opts.actions.find(a=>actionKey(a)===pos.action);
 if(!forced||forced.type!=='double-sequence'||forced.tiles.length!==1)throw Error('forced action changed');
 let s=r.stepRound(world,()=>forced);
 if(s.outcome)throw Error('forced action unexpectedly finished');
 if(!s.openingState.openedNumbers.has(pos.number))throw Error('double did not unlock number');
 const handAfter=s.hands[p].map(key).join(',');
 if(delay)s.openingState=e.cloneOpeningState(world.openingState);
 const nextOpts=d.turnOptions(s.branchState,s.openingState,s.hands[n],s.stock);
 const nextPlayable=s.hands[n].filter(t=>d.actionsForHand(s.branchState,s.openingState,[t]).length).length;
 const nextPass=+(nextOpts.phase==='pass');
 const nextAction=nextOpts.phase==='play'?b.chooseBy(profile,nextOpts,{seed,turns:s.turns,player:n}):null;
 s=r.stepRound(s,()=>nextAction);
 const immediateNextFinish=+(s.outcome?.kind==='finish'&&s.outcome.playerIndex===n);
 if(delay&&!s.outcome)s.openingState=e.openNumber(s.openingState,pos.number);
 const end=r.runRound(s,(o,state)=>b.chooseBy(profile,o,{seed,turns:state.turns,player:state.currentPlayer}),{maxTurns:200});
 if(end.outcome.kind==='unresolved')throw Error('unresolved continuation');
 return{handAfter,minusCode:end.outcome.kind==='finish'&&end.outcome.playerIndex===p?String(end.outcome.minus||0):'none',win:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===p),
  pips:e.pipSum(end.hands[p]),minus:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===p&&end.outcome.minus<0),
  turns:end.turns-world.turns,remainingDoubles:end.hands[p].filter(t=>t[0]===t[1]).length,
  block:+(end.outcome.kind==='block'),nextPass,nextPlayable,immediateNextFinish};
}
function ci(rows,k){if(!rows.length)return null;const xs=rows.map(x=>x[k]),m=mean(xs);
 const sd=xs.length>1?Math.sqrt(xs.reduce((s,x)=>s+(x-m)**2,0)/(xs.length-1)):0;
 return{mean:m,halfWidth95:xs.length>1?1.96*sd/Math.sqrt(xs.length):null};}
function run(start=1482740,count=1000,limit=100,worlds=48){
 if(![start,count,limit,worlds].every(Number.isInteger)||count<1||limit<1||worlds<1||worlds>128)throw Error('invalid args');
 const disc=collect(start,count,limit),rows=[],profiles={};
 for(const pos of disc.positions){
  const totals={win:0,pips:0,minus:0,block:0,nextPass:0,nextPlayable:0,immediateNextFinish:0,turns:0,remainingDoubles:0};
  const blank=()=>({'none':0,'0':0,'-10':0,'-20':0,'-30':0,'-40':0});
  const minusCounts={immediate:blank(),delayed:blank()};
  const before=JSON.stringify(pos.state);
  for(let i=0;i<worlds;i++){
   const seed=(4000000000+(pos.seed-start)*256+pos.seat*64+i)>>>0;
   const world=sample(pos,seed),immediate=rollout(world,pos,pos.profile,seed,false),
    delayed=rollout(world,pos,pos.profile,seed,true);
   if(immediate.handAfter!==delayed.handAfter)throw Error('focal hand differs');
   minusCounts.immediate[immediate.minusCode]++;
   minusCounts.delayed[delayed.minusCode]++;
   for(const k of Object.keys(totals))totals[k]+=(immediate[k]-delayed[k])/worlds;
  }
  if(JSON.stringify(pos.state)!==before)throw Error('source mutation');
  rows.push({seed:pos.seed,profile:pos.profile,seat:pos.seat,turn:pos.turn,
   number:pos.number,action:pos.action,focalHandSize:pos.focalHandSize,
   startingDoubles:pos.state.hands[pos.seat].filter(t=>t[0]===t[1]).length,minusCounts,
   nextHandSize:pos.nextHandSize,...Object.fromEntries(Object.entries(totals).map(([k,v])=>[k+'Delta',v]))});
 }
 for(const profile of PROFILES){
  const sub=rows.filter(x=>x.profile===profile);
  profiles[profile]={positions:sub.length,matchedWorlds:sub.length*worlds,
   forcedContinuations:2*sub.length*worlds,
   immediateMinusDelayedFinishFirstPP:ci(sub,'winDelta')&&{estimate:100*ci(sub,'winDelta').mean,halfWidth95:100*ci(sub,'winDelta').halfWidth95},
   immediateMinusDelayedRemainderPips:ci(sub,'pipsDelta'),
   immediateMinusDelayedTurnLength:ci(sub,'turnsDelta'),
   immediateMinusDelayedRemainingDoubles:ci(sub,'remainingDoublesDelta'),
   meanStartingDoubles:sub.length?mean(sub.map(x=>x.startingDoubles)):null,
   focalMinusFinishCounts:Object.fromEntries(['immediate','delayed'].map(arm=>[arm,
    Object.fromEntries(['none','0','-10','-20','-30','-40'].map(k=>[k,sub.reduce((s,x)=>s+x.minusCounts[arm][k],0)]))])),
   immediateMinusDelayedNextPassPP:ci(sub,'nextPassDelta')&&100*ci(sub,'nextPassDelta').mean,
   immediateMinusDelayedNextPlayableTiles:ci(sub,'nextPlayableDelta'),
   immediateMinusDelayedImmediateOpponentFinishPP:ci(sub,'immediateNextFinishDelta')&&100*ci(sub,'immediateNextFinishDelta').mean,
   immediateMinusDelayedMinusFinishPP:ci(sub,'minusDelta')&&100*ci(sub,'minusDelta').mean,
   immediateMinusDelayedBlockPP:ci(sub,'blockDelta')&&100*ci(sub,'blockDelta').mean,
   winSigns:{immediateBetter:sub.filter(x=>x.winDelta>1e-12).length,
    delayedBetter:sub.filter(x=>x.winDelta< -1e-12).length,
    tied:sub.filter(x=>Math.abs(x.winDelta)<=1e-12).length}};
 }
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',
  day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-branch-one-turn-unlock-delay/v1',timestampBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9; number-lock model PROVISIONAL',
  startSeed:start,reservedEndSeed:start+count-1,latestConsumedSeed:Math.max(...Object.values(disc.scan).map(x=>x.seedEnd)),
  uniqueDiscoverySeeds:Object.values(disc.scan).reduce((a,x)=>a+x.dealsScanned,0),
  seedWindowsScanned:Object.fromEntries(Object.entries(disc.scan).map(([k,v])=>[k,v.seedStart+'..'+v.seedEnd])),
  discovery:disc.scan,fullRoundDiscoveryContinuations:disc.fullRounds,
  discoveryFinishes:disc.finishes,discoveryBlocks:disc.blocks,discoveryUnresolved:disc.unresolved,
  positions:rows.length,matchedHiddenWorldAllocations:rows.length*worlds,
  forcedCounterfactualContinuations:2*rows.length*worlds,worldsPerPosition:worlds,
  strategies:PROFILES,profiles,rows,
  worldSeedFormula:'(4000000000+(dealSeed-startSeed)*256+seat*64+worldIndex)>>>0',
  hypothesis:'Causal within-engine one-opponent-turn effect of unlocking a number, while identical double/pips/focal hand/branch geometry are held fixed.',
  intervention:'Both arms legally play the same single double; delayed arm ARTIFICIALLY keeps that number locked for exactly the next opponent turn, then unlocks it. Delayed arm is NOT a legal Qoşa move.',
  sampler:'Exact uniform hidden allocation conditional on both opponents observed no-stock pass exclusions; no prior action-choice likelihood.',
  limitations:'Mechanism experiment only; cannot recommend delaying a double by one turn. Provisional branch locking, first eligible selection, one position per unique seed per profile (disjoint profile seed windows), simple continuation bots, synthetic previous winner, no block winner/loneZero/bust/101 scoring, finish-first not match win; exploratory position-cluster CIs.',
  nextAction:'On fresh seeds independently repeat one-turn delay and stratify by next opponent hand size, then validate authentic four-branch number-lock geometry with real-play fixtures.'};
}
function test(){
 let board=e.createBranchState([1,1]);board=e.applySinglePlacement(board,{side:'up',tile:[1,2],to:2});
 const opening=e.createOpeningState([1]),hand=[[2,2],[3,4],[0,0]];
 const opts=d.turnOptions(board,opening,hand,[]),a=opts.actions.find(x=>x.type==='double-sequence'&&x.numbers.join(',')==='2');
 if(!a)throw Error('double fixture');
 const state={branchState:board,openingState:opening,hands:[hand,[[2,6],[3,5]],[[0,3]]],stock:[],currentPlayer:0,turns:7,consecutivePasses:0,outcome:null};
 const after=r.stepRound(state,()=>a);
 const immediate=d.turnOptions(after.branchState,after.openingState,after.hands[1],[]);
 const delayed=d.turnOptions(after.branchState,opening,after.hands[1],[]);
 if(immediate.phase!=='play'||delayed.phase!=='pass'||after.hands[0].length!==2||
  !after.openingState.openedNumbers.has(2)||opening.openedNumbers.has(2))throw Error('one-turn lock geometry fixture');
 const x=run(1482740,30,2,3),y=run(1482740,30,2,3);
 delete x.timestampBaku;delete y.timestampBaku;
 if(JSON.stringify(x)!==JSON.stringify(y)||x.discoveryUnresolved||!x.positions)throw Error('deterministic replay');
 return{passed:true,fixture:'same forced double, next opponent 2-6 legal only in immediate-unlock arm',
  positions:x.positions,forced:x.forcedCounterfactualContinuations};
}
if(require.main===module){
 const args=process.argv.slice(2);
 console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||1482740),
  +(args[1]||1000),+(args[2]||100),+(args[3]||48)),null,2));
}
module.exports={collect,sample,rollout,run,test};