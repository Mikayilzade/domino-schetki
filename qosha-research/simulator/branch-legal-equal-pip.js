'use strict';
// Equal-discard-pips LEGAL single-vs-number-opening-double alternatives.
// Exact-pip matching controls removed pips, NOT tile identity or future hand shape.
// Four-branch number locking is PROVISIONAL.
// node qosha-research/simulator/branch-legal-equal-pip.js test
// node qosha-research/simulator/branch-legal-equal-pip.js 1487540 6000 12 32
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),b=require('./strategy-runner');
const abl=require('./branch-unlock-delay-ablation'),legal=require('./branch-legal-choice');
const DECK=e.createDoubleSixDeck(),key=e.tileKey;
const PROFILES=['min-hand-pips','closed-branch-control'],GROUPS=['1','2-4'];
const group=n=>n===1?'1':n>=2&&n<=4?'2-4':null;
const actionKey=a=>[a.type,(a.numbers||[]).join(','),a.side||'',a.to??'',key(a.tile||[0,0])].join(':');
const pips=a=>e.pipSum(a.type==='single'?[a.tile]:(a.tiles||[]));
function equalPairs(opts,opening){
 if(opts.phase!=='play'||opts.drawn||opts.actions.some(a=>a.type==='mixed-finish'))return [];
 const singles=opts.actions.filter(a=>a.type==='single');
 const doubles=opts.actions.filter(a=>a.type==='double-sequence'&&a.tiles.length===1&&!opening.openedNumbers.has(a.numbers[0]));
 const pairs=[];for(const single of singles)for(const dbl of doubles)
  if(pips(single)===pips(dbl))pairs.push({single,double:dbl,pips:pips(dbl),
   sort:actionKey(dbl)+'|'+actionKey(single)});
 return pairs.sort((a,b)=>a.sort.localeCompare(b.sort));
}
const playable=s=>new Set(DECK.filter(t=>d.actionsForHand(s.branchState,s.openingState,[t]).length).map(key));
function collect(start,count,quota){
 if(![start,count,quota].every(Number.isInteger)||count<2||count%2||quota<1)throw Error('invalid scan');
 const positions=[],scan={};let fullRounds=0,finishes=0,blocks=0,unresolved=0;
 for(let pi=0;pi<2;pi++){
  const profile=PROFILES[pi],begin=start+pi*count/2,end=begin+count/2;
  const selected={'1':0,'2-4':0};
  let seen=0,trajectories=0,eligibleAny=0,eligibleEqual=0,last=begin-1;
  for(let seed=begin;seed<end&&GROUPS.some(g=>selected[g]<quota);seed++){
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
     const g=group(s.hands[n].length);
     if(!chosen&&p===seat&&g&&selected[g]<quota&&s.hands[p].length>=3&&!s.stock.length&&
       opts.phase==='play'&&!opts.drawn&&!opts.actions.some(a=>a.type==='mixed-finish')){
      const any=legal.pairFor(opts,s.openingState);
      if(any){
       eligibleAny++;
       const pairs=equalPairs(opts,s.openingState);
       if(pairs.length){
        eligibleEqual++;
        const pair=pairs[0];
        positions.push({profile,seed,seat,turn:s.turns,state:r.cloneRoundState(s),
         known:known.map(t=>t.slice()),forbidden:forbidden.map(x=>[...x]),
         double:actionKey(pair.double),single:actionKey(pair.single),
         doublePips:pair.pips,singlePips:pair.pips,number:pair.double.numbers[0],
         nextHandSize:s.hands[n].length,focalHandSize:s.hands[p].length,group:g});
        selected[g]++;chosen=true;
       }
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
  scan[profile]={seedStart:begin,seedEnd:last,dealsScanned:seen,trajectories,
   eligibleAny,eligibleEqual,selected};
 }
 return{positions,scan,fullRounds,finishes,blocks,unresolved};
}
function ci(xs){
 if(!xs.length)return{n:0,mean:null,halfWidth95:null};
 const m=xs.reduce((a,b)=>a+b,0)/xs.length;
 const v=xs.length>1?xs.reduce((a,x)=>a+(x-m)**2,0)/(xs.length-1):0;
 return{n:xs.length,mean:m,halfWidth95:xs.length>1?1.96*Math.sqrt(v/xs.length):null};
}
function run(start=1487540,count=6000,quota=12,worlds=32){
 if(![start,count,quota,worlds].every(Number.isInteger)||worlds<1||worlds>128)throw Error('invalid run');
 const disc=collect(start,count,quota);
 if(disc.unresolved)throw Error('unresolved discovery');
 const rows=[];
 for(const pos of disc.positions){
  const before=JSON.stringify(pos.state),sums={nextPlayable:0,nextPass:0,immediateNextFinish:0,
   win:0,pips:0,minus:0,block:0,turns:0,remainingDoubles:0};
  const minusCounts={double:{},single:{}};
  for(let i=0;i<worlds;i++){
   const ws=(3985000000+(pos.seed-start)*512+pos.seat*128+i)>>>0;
   const world=abl.sample(pos,ws);
   const x=legal.rollout(world,pos,pos.double,pos.profile,ws);
   const y=legal.rollout(world,pos,pos.single,pos.profile,ws);
   for(const k of Object.keys(sums))sums[k]+=(x[k]-y[k])/worlds;
   for(const [arm,v] of [['double',x],['single',y]])
    minusCounts[arm][v.minusCode]=(minusCounts[arm][v.minusCode]||0)+1;
  }
  if(JSON.stringify(pos.state)!==before)throw Error('source mutation');
  rows.push({seed:pos.seed,profile:pos.profile,seat:pos.seat,turn:pos.turn,group:pos.group,
   nextHandSize:pos.nextHandSize,focalHandSize:pos.focalHandSize,number:pos.number,
   double:pos.double,single:pos.single,discardedPips:pos.doublePips,
   ...Object.fromEntries(Object.entries(sums).map(([k,v])=>[k+'Delta',v])),minusCounts});
 }
 const summaries={};
 for(const profile of PROFILES){
  summaries[profile]={};
  for(const g of GROUPS){
   const sub=rows.filter(x=>x.profile===profile&&x.group===g);
   summaries[profile][g]={positions:sub.length,matchedWorlds:sub.length*worlds,
    forcedContinuations:sub.length*worlds*2,
    discardedPips:ci(sub.map(x=>x.discardedPips)),
    nextOpponentFinishChangePP:ci(sub.map(x=>100*x.immediateNextFinishDelta)),
    nextOpponentPlayableChange:ci(sub.map(x=>x.nextPlayableDelta)),
    nextOpponentPassChangePP:ci(sub.map(x=>100*x.nextPassDelta)),
    focalFinishFirstChangePP:ci(sub.map(x=>100*x.winDelta)),
    focalRemainderPipsChange:ci(sub.map(x=>x.pipsDelta)),
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
 return{schema:'qosha-legal-equal-pip-branch-choice/v1',timestampBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0, 3x9; number-lock PROVISIONAL',
  startSeed:start,reservedEndSeed:start+count-1,
  latestConsumedSeed:Math.max(...Object.values(disc.scan).map(x=>x.seedEnd)),
  discovery:disc.scan,uniqueDiscoverySeeds:Object.values(disc.scan).reduce((z,x)=>z+x.dealsScanned,0),
  fullRoundDiscoveryContinuations:disc.fullRounds,discoveryFinishes:disc.finishes,
  discoveryBlocks:disc.blocks,discoveryUnresolved:disc.unresolved,
  positions:rows.length,matchedHiddenWorldAllocations:rows.length*worlds,
  forcedCounterfactualContinuations:2*rows.length*worlds,worldsPerPosition:worlds,
  profiles:PROFILES,groups:GROUPS,quotaPerGroupPerProfile:quota,summaries,rows,
  worldSeedFormula:'(3985000000+(dealSeed-startSeed)*512+seat*128+worldIndex)>>>0',
  selection:'First equal-discard-pip legal double-opening vs ordinary single alternative encountered in a seat-rotated deal; at most one per deal. Opponent 1 vs 2-4 stones analyzed separately.',
  comparison:'Both arms LEGAL in provisional engine and remove EQUAL pips. Different tile identity, remaining double, post-action hand geometry remain confounded. Same pass-conditioned hidden worlds and continuation bot.',
  limitations:'Equal pips is not same tile, not isolated unlock effect. Selection and quota censoring; uncorrected position-cluster intervals, correlated hidden worlds; four-branch lock, block winner, loneZero/bust and 101 match scoring unverified. Finish-first is not match victory.',
  nextAction:'Increase equal-pip one-stone position count on disjoint seeds; stratify by post-action next-opponent mobility and remaining doubles, validate real four-branch geometry.'};
}
function test(){
 const opts={phase:'play',drawn:false,actions:[
  {type:'single',tile:[1,5],side:'up',to:5},
  {type:'single',tile:[1,4],side:'up',to:4},
  {type:'double-sequence',tiles:[[3,3]],numbers:[3]},
  {type:'double-sequence',tiles:[[2,2]],numbers:[2]}]};
 const a=equalPairs(opts,e.createOpeningState([1]));
 if(a.length!==1||a[0].pips!==6||a[0].double.numbers[0]!==3)throw Error('equal pip selector');
 const no=equalPairs({...opts,actions:opts.actions.slice(1)},e.createOpeningState([1]));
 if(no.length)throw Error('false equal pip');
 const c=collect(1487540,20,1),z=collect(1487540,20,1);
 if(JSON.stringify(c)!==JSON.stringify(z)||c.unresolved)throw Error('deterministic discovery');
 return{passed:true,discoveryRounds:c.fullRounds,positions:c.positions.length};
}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1487540),
 +(a[1]||6000),+(a[2]||12),+(a[3]||32)),null,2));}
module.exports={equalPairs,collect,run,test};
