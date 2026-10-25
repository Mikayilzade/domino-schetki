'use strict';
// Late-opponent hand-size ablation. Artificial one-turn delayed unlock is NONLEGAL.
// node qosha-research/simulator/branch-late-hand-strata.js test
// node qosha-research/simulator/branch-late-hand-strata.js 1483740 1600 12 64
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),b=require('./strategy-runner'),abl=require('./branch-unlock-delay-ablation');
const deck=e.createDoubleSixDeck(),key=e.tileKey,profiles=['min-hand-pips','closed-branch-control'],groups=['1','2','3-4'];
const group=n=>n===1?'1':n===2?'2':n===3||n===4?'3-4':null;
const actionKey=a=>[a.type,(a.numbers||[]).join(','),a.side||'',a.to??'',key(a.tile||[0,0])].join(':');
const playable=s=>new Set(deck.filter(t=>d.actionsForHand(s.branchState,s.openingState,[t]).length).map(key));
function collect(start,count,quota){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<2||count%2||!Number.isInteger(quota)||quota<1)throw Error('scan args');
 const positions=[],scan={};let fullRounds=0,finishes=0,blocks=0,unresolved=0;
 for(let pi=0;pi<2;pi++){
  const profile=profiles[pi],begin=start+pi*count/2,end=begin+count/2,selected={'1':0,'2':0,'3-4':0};
  let seen=0,trajectories=0,eligible=0,last=begin-1;
  for(let seed=begin;seed<end&&groups.some(g=>selected[g]<quota);seed++){
   seen++;last=seed;
   const initial=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(initial.kind!=='ready')throw Error('init '+seed);
   let chosen=false;
   for(let seat=0;seat<3;seat++){
    trajectories++;let s=r.cloneRoundState(initial);
    const live=new Set([...initial.hands.flat(),...initial.stock].map(key));
    const known=deck.filter(t=>!live.has(key(t))).map(t=>t.slice()),forbidden=[new Set(),new Set(),new Set()];
    if(initial.openingPassed)for(const k of playable(s))forbidden[initial.starter].add(k);
    while(!s.outcome&&s.turns<200){
     const p=s.currentPlayer,n=(p+1)%3,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
     if(opts.phase==='pass'&&!s.stock.length){
      for(const k of playable(s))forbidden[p].add(k);
      if(s.hands[p].some(t=>forbidden[p].has(key(t))))throw Error('pass contradiction');
     }
     const g=group(s.hands[n].length);
     if(!chosen&&p===seat&&g&&selected[g]<quota&&opts.phase==='play'&&!opts.drawn&&!s.stock.length&&
       s.hands[p].length>=3&&!opts.actions.some(a=>a.type==='mixed-finish')){
      const candidates=opts.actions.filter(a=>a.type==='double-sequence'&&a.tiles.length===1&&
        !s.openingState.openedNumbers.has(a.numbers[0]));
      if(candidates.length){
       eligible++;
       const h=e.mixSeed32((seed^Math.imul(seat+1,0x85ebca6b)^Math.imul(s.turns+1,0xc2b2ae35))>>>0);
       const a=candidates[h%candidates.length];
       positions.push({profile,seed,seat,turn:s.turns,state:r.cloneRoundState(s),known:known.map(t=>t.slice()),
        forbidden:forbidden.map(x=>[...x]),action:actionKey(a),number:a.numbers[0],
        focalHandSize:s.hands[p].length,nextHandSize:s.hands[n].length,group:g});
       selected[g]++;chosen=true;
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
  scan[profile]={seedStart:begin,seedEnd:last,dealsScanned:seen,trajectories,eligible,selected};
 }
 return{positions,scan,fullRounds,finishes,blocks,unresolved};
}
function ci(xs){
 if(!xs.length)return{n:0,mean:null,halfWidth95:null};
 const m=xs.reduce((a,x)=>a+x,0)/xs.length;
 const v=xs.length>1?xs.reduce((a,x)=>a+(x-m)**2,0)/(xs.length-1):0;
 return{n:xs.length,mean:m,halfWidth95:xs.length>1?1.96*Math.sqrt(v/xs.length):null};
}
function run(start=1483740,count=1600,quota=12,worlds=64){
 if(!Number.isInteger(worlds)||worlds<1||worlds>128)throw Error('worlds');
 const disc=collect(start,count,quota),rows=[],summaries={};
 if(disc.unresolved)throw Error('unresolved discovery');
 for(const pos of disc.positions){
  const before=JSON.stringify(pos.state);
  const sums={nextPassDelta:0,nextPlayableDelta:0,nextFinishDelta:0,winDelta:0,pipsDelta:0,
   minusDelta:0,blockDelta:0,turnsDelta:0,nextFinishImmediate:0,nextFinishDelayed:0,
   nextPassImmediate:0,nextPassDelayed:0,remainingDoublesDelta:0};
  const minusCounts={immediate:{},delayed:{}};
  for(let i=0;i<worlds;i++){
   const ws=(3950000000+(pos.seed-start)*256+pos.seat*64+i)>>>0,world=abl.sample(pos,ws);
   const x=abl.rollout(world,pos,pos.profile,ws,false),y=abl.rollout(world,pos,pos.profile,ws,true);
   if(x.handAfter!==y.handAfter)throw Error('focal hand mismatch');
   const diffs={nextPassDelta:x.nextPass-y.nextPass,nextPlayableDelta:x.nextPlayable-y.nextPlayable,
    nextFinishDelta:x.immediateNextFinish-y.immediateNextFinish,winDelta:x.win-y.win,
    pipsDelta:x.pips-y.pips,minusDelta:x.minus-y.minus,blockDelta:x.block-y.block,
    turnsDelta:x.turns-y.turns,remainingDoublesDelta:x.remainingDoubles-y.remainingDoubles,
    nextFinishImmediate:x.immediateNextFinish,nextFinishDelayed:y.immediateNextFinish,
    nextPassImmediate:x.nextPass,nextPassDelayed:y.nextPass};
   for(const k of Object.keys(sums))sums[k]+=diffs[k]/worlds;
   for(const [arm,v] of [['immediate',x],['delayed',y]])minusCounts[arm][v.minusCode]=(minusCounts[arm][v.minusCode]||0)+1;
  }
  if(JSON.stringify(pos.state)!==before)throw Error('source mutation');
  rows.push({seed:pos.seed,profile:pos.profile,seat:pos.seat,turn:pos.turn,group:pos.group,
   nextHandSize:pos.nextHandSize,focalHandSize:pos.focalHandSize,number:pos.number,
   startingDoubles:pos.state.hands[pos.seat].filter(t=>t[0]===t[1]).length,...sums,minusCounts});
 }
 for(const profile of profiles){
  summaries[profile]={};
  for(const g of groups){
   const sub=rows.filter(x=>x.profile===profile&&x.group===g);
   summaries[profile][g]={positions:sub.length,matchedWorlds:sub.length*worlds,forcedContinuations:sub.length*worlds*2,
    handSizes:Object.fromEntries([1,2,3,4].map(n=>[n,sub.filter(x=>x.nextHandSize===n).length])),
    nextPlayableGain:ci(sub.map(x=>x.nextPlayableDelta)),nextPassChangePP:ci(sub.map(x=>100*x.nextPassDelta)),
    immediateNextFinishChangePP:ci(sub.map(x=>100*x.nextFinishDelta)),
    immediateNextFinishRatePP:ci(sub.map(x=>100*x.nextFinishImmediate)),
    delayedNextFinishRatePP:ci(sub.map(x=>100*x.nextFinishDelayed)),
    focalFinishFirstChangePP:ci(sub.map(x=>100*x.winDelta)),
    focalRemainderPipsChange:ci(sub.map(x=>x.pipsDelta)),
    focalMinusFinishChangePP:ci(sub.map(x=>100*x.minusDelta)),
    blockChangePP:ci(sub.map(x=>100*x.blockDelta)),turnLengthChange:ci(sub.map(x=>x.turnsDelta)),
    meanStartingDoubles:ci(sub.map(x=>x.startingDoubles)),
    focalMinusCounts:Object.fromEntries(['immediate','delayed'].map(arm=>[arm,
     Object.fromEntries(['none','0','-10','-20','-30','-40'].map(k=>[k,sub.reduce((z,x)=>z+(x.minusCounts[arm][k]||0),0)]))]))};
  }
 }
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',
  day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-late-next-hand-unlock-delay/v1',timestampBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9; four-branch number-lock model PROVISIONAL',
  startSeed:start,reservedEndSeed:start+count-1,latestConsumedSeed:Math.max(...Object.values(disc.scan).map(x=>x.seedEnd)),
  discovery:disc.scan,uniqueDiscoverySeeds:Object.values(disc.scan).reduce((z,x)=>z+x.dealsScanned,0),
  fullRoundDiscoveryContinuations:disc.fullRounds,discoveryFinishes:disc.finishes,
  discoveryBlocks:disc.blocks,discoveryUnresolved:disc.unresolved,
  positions:rows.length,matchedHiddenWorldAllocations:rows.length*worlds,
  forcedCounterfactualContinuations:2*rows.length*worlds,worldsPerPosition:worlds,
  profiles,groups,quotaPerGroupPerProfile:quota,summaries,rows,
  worldSeedFormula:'(3950000000+(dealSeed-startSeed)*256+seat*64+worldIndex)>>>0',
  intervention:'Both arms play identical legal double; delayed arm artificially hides new number for next opponent turn only, then unlocks. Delayed arm is NOT a legal move.',
  sampler:'Exact uniform opponent allocation conditional on observed no-stock pass exclusions, no action-choice likelihood.',
  selection:'One selected position per unique seed/profile, first eligible of underfilled next-hand-size stratum; seed windows disjoint by profile.',
  limitations:'Provisional branch-lock geometry; nonlegal intervention; synthetic previous winner; simple bots; position-cluster exploratory CIs; no 101-point match outcome, block winner, loneZero/bust validation; one-stone sample intentionally enriched.',
  nextAction:'Repeat one-stone immediate finish-threat effect on disjoint seeds and compare actual legal branch-control actions; validate authentic four-branch lock geometry.'};
}
function test(){
 if(group(1)!=='1'||group(2)!=='2'||group(3)!=='3-4'||group(4)!=='3-4'||group(5)!==null)throw Error('groups');
 const x=run(1483740,800,1,3),y=run(1483740,800,1,3);
 delete x.timestampBaku;delete y.timestampBaku;
 if(JSON.stringify(x)!==JSON.stringify(y)||x.positions!==6||x.discoveryUnresolved)throw Error('deterministic replay');
 return{passed:true,positions:x.positions,forced:x.forcedCounterfactualContinuations};
}
if(require.main===module){
 const args=process.argv.slice(2);
 console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||1483740),
  +(args[1]||1600),+(args[2]||12),+(args[3]||64)),null,2));
}
module.exports={group,collect,run,test};
