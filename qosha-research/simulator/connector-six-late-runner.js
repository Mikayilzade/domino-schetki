'use strict';
// Targeted reachable late-game 6-6 X-X vs X-Y legal-choice scanner.
// Only 3x9 real seeded trajectories, next clockwise opponent 2-4 stones.
// Four-branch number-lock geometry PROVISIONAL; neither arm is a pure unlock intervention.
// node qosha-research/simulator/connector-six-late-runner.js test
// node qosha-research/simulator/connector-six-late-runner.js 1550940 1600 8
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),b=require('./strategy-runner'),abl=require('./branch-unlock-delay-ablation');
const legal=require('./branch-legal-choice'),broad=require('./connector-high-x-broad-runner');
const deck=e.createDoubleSixDeck(),key=e.tileKey;
const profiles=['min-hand-pips','closed-branch-control'];
const playable=s=>new Set(deck.filter(t=>d.actionsForHand(s.branchState,s.openingState,[t]).length).map(key));
function selectPair(state,player){return broad.pairs(state,player).find(x=>x.x===6)||null;}
function collect(start,count){
 if(![start,count].every(Number.isInteger)||count<2||count%2)throw Error('seed/count');
 const positions=[],scan={};let fullRounds=0,finishes=0,blocks=0,unresolved=0;
 for(let pi=0;pi<2;pi++){
  const profile=profiles[pi],begin=start+pi*count/2,end=begin+count/2;
  const tally={seedStart:begin,seedEnd:end-1,dealsScanned:count/2,trajectories:0,lateTurns:0,
   late6HeldTurns:0,late6LegalDoubleTurns:0,late6LegalPairTurns:0,
   trajectoriesWithPair:0,selected:0,byNextHand:{'2':0,'3':0,'4':0}};
  for(let seed=begin;seed<end;seed++){
   const initial=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(initial.kind!=='ready')throw Error('initializer '+seed);
   for(let seat=0;seat<3;seat++){
    tally.trajectories++;let s=r.cloneRoundState(initial),best=null,everPair=false;
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
     if(p===seat&&!s.stock.length&&s.hands[p].length>=2&&s.hands[n].length>=2&&s.hands[n].length<=4){
      tally.lateTurns++;
      if(s.hands[p].some(t=>key(t)==='6-6')){
       tally.late6HeldTurns++;
       if(o.phase==='play'&&o.actions.some(a=>a.type==='double-sequence'&&a.tiles.length===1&&a.numbers[0]===6)){
        tally.late6LegalDoubleTurns++;
        const q=selectPair(s,p);
        if(q){
         tally.late6LegalPairTurns++;everPair=true;
         const pos={profile,seed,seat,turn:s.turns,state:r.cloneRoundState(s),
          known:known.map(t=>t.slice()),forbidden:forbidden.map(x=>[...x]),
          focalHandSize:s.hands[p].length,nextHandSize:s.hands[n].length,...q};
         if(!best||pos.nextHandSize<best.nextHandSize||
           (pos.nextHandSize===best.nextHandSize&&pos.turn>best.turn))best=pos;
        }
       }
      }
     }
     const a=o.phase==='play'?b.chooseBy(profile,o,{seed,turns:s.turns,player:p}):null;
     s=r.stepRound(s,()=>a);
     if(a)known.push(...(a.type==='single'?[a.tile]:(a.tiles||[])).map(t=>t.slice()));
    }
    fullRounds++;
    if(!s.outcome||s.outcome.kind==='unresolved')unresolved++;
    else if(s.outcome.kind==='finish')finishes++;else blocks++;
    if(everPair)tally.trajectoriesWithPair++;
    if(best){positions.push(best);tally.selected++;tally.byNextHand[String(best.nextHandSize)]++;}
   }
  }
  scan[profile]=tally;
 }
 return{positions,scan,fullRounds,finishes,blocks,unresolved};
}
function ci(values){if(!values.length)return{n:0,mean:null,halfWidth95:null};
 const mean=values.reduce((a,b)=>a+b,0)/values.length;
 const variance=values.length>1?values.reduce((a,x)=>a+(x-mean)**2,0)/(values.length-1):0;
 return{n:values.length,mean,halfWidth95:values.length>1?1.96*Math.sqrt(variance/values.length):null};}
function dealCI(rows,policy,metric,mult=1){
 const groups=new Map();for(const x of rows){const a=groups.get(x.seed)||[];a.push(mult*x.policies[policy][metric+'Delta']);groups.set(x.seed,a);}
 return ci([...groups.values()].map(xs=>xs.reduce((a,b)=>a+b,0)/xs.length));
}
function summarize(rows){return Object.fromEntries(profiles.map(policy=>[policy,
  Object.fromEntries(['all','2','3','4'].map(stratum=>{
   const sub=stratum==='all'?rows:rows.filter(x=>x.nextHandSize===+stratum);
   return[stratum,{positions:sub.length,distinctDeals:new Set(sub.map(x=>x.seed)).size,
    focalFinishFirstDeltaPP:dealCI(sub,policy,'win',100),
    focalRemainderDeltaPips:dealCI(sub,policy,'pips'),
    nextPlayableDelta:dealCI(sub,policy,'nextPlayable'),
    focalMinusFinishDeltaPP:dealCI(sub,policy,'minus',100),
    blockDeltaPP:dealCI(sub,policy,'block',100),
    immediateNextFinishDeltaPP:dealCI(sub,policy,'immediateNextFinish',100)}];
  }))]));
}
function run(start=1550940,count=1600,worlds=8){
 if(!Number.isInteger(worlds)||worlds<1||worlds>64)throw Error('worlds');
 const disc=collect(start,count);if(disc.unresolved)throw Error('unresolved');
 const rows=[],metrics=['win','pips','minus','block','nextPlayable','immediateNextFinish','turns'];
 for(const pos of disc.positions){
  const before=JSON.stringify(pos.state);
  const sums=Object.fromEntries(profiles.map(p=>[p,Object.fromEntries(metrics.map(k=>[k,0]))]));
  for(let i=0;i<worlds;i++){
   const ws=e.mixSeed32((1550940000^Math.imul(pos.seed,0x9e3779b9)^Math.imul(pos.seat+1,0x85ebca6b)^i)>>>0);
   const world=abl.sample(pos,ws);
   for(const policy of profiles){
    const dbl=legal.rollout(world,pos,pos.double,policy,ws),conn=legal.rollout(world,pos,pos.single,policy,ws);
    for(const k of metrics)sums[policy][k]+=(dbl[k]-conn[k])/worlds;
   }
  }
  if(JSON.stringify(pos.state)!==before)throw Error('source mutation');
  rows.push({seed:pos.seed,seat:pos.seat,profile:pos.profile,turn:pos.turn,
   x:6,y:pos.y,gap:pos.gap,nextHandSize:pos.nextHandSize,focalHandSize:pos.focalHandSize,
   connectorsAfter:pos.connectorsAfter,double:pos.double,single:pos.single,
   policies:Object.fromEntries(profiles.map(policy=>[policy,
    Object.fromEntries(metrics.map(k=>[k+'Delta',sums[policy][k]]))]))});
 }
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',
  day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-six-late-target-v1',timestampBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9; number locking PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,uniqueDeals:count,scan:disc.scan,
  fullRoundDiscoveryContinuations:disc.fullRounds,finishes:disc.finishes,blocks:disc.blocks,
  unresolved:disc.unresolved,positions:rows.length,worldsPerPosition:worlds,
  hiddenWorldAllocations:rows.length*worlds,forcedCounterfactualContinuations:rows.length*worlds*4,
  strategies:profiles,continuationPolicies:profiles,summary:summarize(rows),rows,
  worldSeedFormula:'mixSeed32(1550940000 XOR imul(dealSeed,0x9e3779b9) XOR imul(seat+1,0x85ebca6b) XOR worldIndex)',
  selection:'3x9 reachable full seeded trajectories; focal >=2, next clockwise opponent exactly 2-4, stock empty, unopened 6-6 and legal 6-Y with Y<6. Scan all turns; at most one position per deal/seat trajectory, choose smaller next-hand size then later turn. Two legal arms, same pass-consistent worlds and continuation bots. Track eligibility at every gate.',
  limitations:'Rare selected late positions; selected reachable states and up to 3 rotations per deal; exploratory deal-cluster uncertainty, no multiple-comparison correction. Double and connector arms leave different tiles/doubles/pips. Four-branch number-lock rule PROVISIONAL; uniform pass-conditioned hidden worlds omit opponent earlier action likelihood; block winner/loneZero/bust/101-match unvalidated; finish-first != match win.',
  nextAction:'Increase independent late 6-6 positions to >=30 per 2/3/4 next-hand stratum or develop a legal reachable-state enrichment policy; verify authentic branch opening and block winner before advice.'};
}
function test(){
 const bs=e.createBranchState([1,1]);bs.branches.up.end=6;
 const fixture={branchState:bs,openingState:e.createOpeningState([1]),
  hands:[[[6,6],[1,6],[0,1]],[[2,3],[3,4]],[[0,3]]],stock:[]};
 const p=selectPair(fixture,0);
 if(!p||p.x!==6||p.y!==1||p.gap!==5)throw Error('6-6 vs 1-6 legal fixture');
 const a=run(1550940,40,2),z=run(1550940,40,2);
 delete a.timestampBaku;delete z.timestampBaku;
 if(JSON.stringify(a)!==JSON.stringify(z)||a.unresolved||a.fullRoundDiscoveryContinuations!==120||
  a.forcedCounterfactualContinuations!==a.positions*8)throw Error('deterministic late replay');
 return{passed:true,fixture:'6-6 vs 1-6 legal',positions:a.positions,forced:a.forcedCounterfactualContinuations};
}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1550940),+(a[1]||1600),+(a[2]||8)),null,2));}
module.exports={selectPair,collect,run,test,summarize};