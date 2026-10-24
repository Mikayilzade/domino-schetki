'use strict';
// Three-stone double-connector-double hypothesis; real four-branch number locking PROVISIONAL.
// node qosha-research/simulator/three-stone-chain-preservation.js test
// node qosha-research/simulator/three-stone-chain-preservation.js 1406840 2400 24
const e=require('./engine'), init=require('./initializer'), r=require('./round-driver');
const d=require('./turn-dispatcher'), forced=require('./forced-double-count-ablation');
const late=require('./late-forced-double-paired'), hidden=require('./hidden-world');
const regret=require('./decision-regret'), base=require('./strategy-runner');
const CHAIN='pip-late-three-stone-chain', FEW=forced.FEW, MANY=forced.MANY;
const PROFILES=[[CHAIN,FEW,MANY],[CHAIN,MANY,'min-hand-pips'],[CHAIN,MANY,'closed-branch-control']];
// Full 3! permutations, not only cyclic rotations: cyclic assignments confound seat order with strategy identity.
const PERMS=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
const POLICIES=['min-hand-pips','closed-branch-control'];
const mean=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
const median=xs=>{if(!xs.length)return null;const a=[...xs].sort((x,y)=>x-y),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;};
function ci(xs){if(!xs.length)return {n:0,mean:null,halfWidth95:null};
 const m=mean(xs),v=xs.length>1?xs.reduce((s,x)=>s+(x-m)**2,0)/(xs.length-1):0;
 return {n:xs.length,mean:m,halfWidth95:xs.length>1?2.05*Math.sqrt(v/xs.length):null};}
function threeChoice(opts,state){
 if(!state||opts.phase!=='play'||opts.drawn||opts.hand.length!==3||
  opts.actions.some(a=>a.type==='single'||a.type==='mixed-finish'))return null;
 const doubles=opts.actions.filter(a=>a.type==='double-sequence');
 if(!doubles.some(a=>a.tiles.length===1)||!doubles.some(a=>a.tiles.length===2))return null;
 const chain=[];
 for(const action of doubles.filter(a=>a.tiles.length===1)){
  const tr=d.applyTurn(state.branchState,state.openingState,opts.hand,opts.stock,action);
  if(tr.hand.length===2&&d.mixedFinishActions(tr.branchState,tr.openingState,tr.hand).length)chain.push(action);
 }
 chain.sort((a,b)=>e.pipSum(b.tiles)-e.pipSum(a.tiles)||regret.actionKey(a).localeCompare(regret.actionKey(b)));
 return {chain:chain[0]||null,chainChoices:chain.length};
}
function choose(name,opts,ctx={}){
 if(name!==CHAIN)return name===FEW||name===MANY?forced.choose(name,opts,ctx):base.chooseBy(name,opts,ctx);
 const many=forced.choose(MANY,opts,ctx),found=threeChoice(opts,ctx.state);
 return found&&found.chain?found.chain:many;
}
function blank(){return {appearances:0,first:0,pips:[],actions:0,chainOpportunities:0,chainSelected:0,
 minus:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0}};}
function tournament(startSeed,count){
 const profiles={},all={continuations:0,finishes:0,blocks:0,unresolved:0};
 for(const names of PROFILES){
  const label=names.join(' / '),stats=Object.fromEntries(names.map(n=>[n,blank()]));
  const clusters=Array.from({length:count/100},()=>({rounds:0,wins:Object.fromEntries(names.map(n=>[n,0])),
   pips:Object.fromEntries(names.map(n=>[n,0]))}));
  let finishes=0,blocks=0,unresolved=0,turns=0;
  for(let seed=startSeed;seed<startSeed+count;seed++){
   const original=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(original.kind!=='ready')throw Error('initializer unresolved '+seed);
   const cluster=clusters[Math.floor((seed-startSeed)/100)];
   for(let rotation=0;rotation<PERMS.length;rotation++){
    const seats=PERMS[rotation].map(i=>names[i]);
    const out=r.runRound(original,(opts,s)=>{
     const name=seats[s.currentPlayer],m=stats[name];m.actions++;
     const a=choose(name,opts,{state:s,seed,rotation,turns:s.turns,player:s.currentPlayer});
     if(name===CHAIN){
      const found=threeChoice(opts,s);
      if(found&&found.chain){m.chainOpportunities++;if(regret.actionKey(a)===regret.actionKey(found.chain))m.chainSelected++;}
     }
     return a;
    },{maxTurns:200});
    cluster.rounds++;turns+=out.turns;
    if(out.outcome.kind==='finish'){
     finishes++;const name=seats[out.outcome.playerIndex];stats[name].first++;
     stats[name].minus[String(out.outcome.minus||0)]++;cluster.wins[name]++;
    }else if(out.outcome.kind==='block')blocks++;else unresolved++;
    for(let seat=0;seat<3;seat++){
     const name=seats[seat],p=e.pipSum(out.hands[seat]);
     stats[name].appearances++;stats[name].pips.push(p);cluster.pips[name]+=p;
    }
   }
  }
  const byStrategy={};
  for(const name of names){const m=stats[name];byStrategy[name]={
   appearances:m.appearances,finishFirstCount:m.first,finishFirstRate:m.first/m.appearances,
   meanFinalPips:mean(m.pips),medianFinalPips:median(m.pips),actions:m.actions,
   chainOpportunities:m.chainOpportunities,chainSelected:m.chainSelected,minusFinishes:m.minus};}
  const paired={};
  for(const other of names.filter(n=>n!==CHAIN))paired['chain-minus-'+other]={
   finishFirstPP:ci(clusters.map(c=>100*(c.wins[CHAIN]-c.wins[other])/c.rounds)),
   meanFinalPips:ci(clusters.map(c=>(c.pips[CHAIN]-c.pips[other])/c.rounds))};
  profiles[label]={rounds:count*PERMS.length,finishes,blocks,unresolved,meanTurns:turns/(count*PERMS.length),
   byStrategy,paired,clusterSizeDeals:100};
  all.continuations+=count*PERMS.length;all.finishes+=finishes;all.blocks+=blocks;all.unresolved+=unresolved;
 }
 if(all.unresolved)throw Error('unresolved tournament');
 return {profiles,...all};
}
function position(hit,startSeed,worlds){
 const {seed,state}=hit,focal=state.currentPlayer,hand=state.hands[focal];
 const opts=d.turnOptions(state.branchState,state.openingState,hand,state.stock);
 const found=threeChoice(opts,state);if(!found)throw Error('not 3-stone variable-count');
 const few=forced.choose(FEW,opts),many=forced.choose(MANY,opts),select=found.chain||many;
 const keys={few:regret.actionKey(few),many:regret.actionKey(many),select:regret.actionKey(select)};
 const unique=[...new Set(Object.values(keys))];
 const spec={visibleState:state,focalPlayer:focal,focalHand:hand,
  knownTiles:late.knownTiles(state),hiddenHandSizes:state.hands.map(h=>h.length),stockSize:state.stock.length};
 const byPolicy={},counter={continuations:0,allocations:worlds};
 for(const policy of POLICIES){
  const diffs={fewMinusMany:{finishPP:0,pips:0,minusPP:0},selectMinusMany:{finishPP:0,pips:0,minusPP:0}};
  let fewMinus=0,manyMinus=0,selectMinus=0;
  for(let i=0;i<worlds;i++){
   const worldSeed=(2000000000+(seed-startSeed)*64+i)>>>0,world=hidden.sampleWorld(spec,worldSeed);
   const actual=hidden.candidateKeys(world);
   if(unique.some(k=>!actual.includes(k)))throw Error('candidate changed across hidden worlds');
   const outcomes={};
   for(const k of unique){outcomes[k]=late.forceThenContinue(world,k,policy,worldSeed);counter.continuations++;}
   const a=outcomes[keys.few],b=outcomes[keys.many],c=outcomes[keys.select];
   for(const [label,left] of [['fewMinusMany',a],['selectMinusMany',c]]){
    diffs[label].finishPP+=100*(left.first-b.first)/worlds;
    diffs[label].pips+=(left.pips-b.pips)/worlds;
    diffs[label].minusPP+=100*(left.minus-b.minus)/worlds;
   }
   fewMinus+=a.minus;manyMinus+=b.minus;selectMinus+=c.minus;
  }
  byPolicy[policy]={...diffs,fewMinus,manyMinus,selectMinus};
 }
 return {seed,turn:state.turns,hand:hand.map(e.tileKey),focal,opponentSizes:state.hands.map(h=>h.length),
  ends:e.SIDES.map(side=>state.branchState.branches[side].end),opened:[...state.openingState.openedNumbers].sort(),
  chain:!!found.chain,chainChoices:found.chainChoices,fewIsChain:keys.few===keys.select&&!!found.chain,
  fewAction:few.numbers,manyAction:many.numbers,selectAction:select.numbers,byPolicy,counter};
}
function hiddenStudy(startSeed,count,worlds){
 const rows=[],discovery={rounds:0,finishes:0,blocks:0,unresolved:0};
 for(let seed=startSeed;seed<startSeed+count;seed++){
  const original=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(original.kind!=='ready')throw Error('initializer unresolved '+seed);
  let found=null;
  const out=r.runRound(original,(opts,s)=>{
   if(!found&&threeChoice(opts,s))found={seed,state:r.cloneRoundState(s)};
   return forced.choose(MANY,opts,{seed,turns:s.turns,player:s.currentPlayer});
  },{maxTurns:200});
  discovery.rounds++;
  if(out.outcome.kind==='finish')discovery.finishes++;
  else if(out.outcome.kind==='block')discovery.blocks++;
  else discovery.unresolved++;
  if(found)rows.push(position(found,startSeed,worlds));
 }
 if(discovery.unresolved)throw Error('unresolved discovery');
 const summary={};
 for(const policy of POLICIES){
  summary[policy]={};
  for(const group of ['all','chain','no-chain']){
   const sub=rows.filter(x=>group==='all'||(group==='chain'?x.chain:!x.chain));
   const x={positions:sub.length,chainActionEqualsFew:sub.filter(r=>r.fewIsChain).length};
   for(const contrast of ['fewMinusMany','selectMinusMany'])
    x[contrast]=Object.fromEntries(['finishPP','pips','minusPP'].map(metric=>
     [metric,ci(sub.map(row=>row.byPolicy[policy][contrast][metric]))]));
   x.minusFinishCounts={few:sub.reduce((s,r)=>s+r.byPolicy[policy].fewMinus,0),
    many:sub.reduce((s,r)=>s+r.byPolicy[policy].manyMinus,0),
    select:sub.reduce((s,r)=>s+r.byPolicy[policy].selectMinus,0)};
   summary[policy][group]=x;
  }
 }
 return {discovery,positions:rows.length,chainPositions:rows.filter(x=>x.chain).length,
  hiddenAllocations:rows.reduce((s,x)=>s+x.counter.allocations,0),
  forcedCounterfactualContinuations:rows.reduce((s,x)=>s+x.counter.continuations,0),
  summary,rows};
}
function run(startSeed=1406840,count=2400,worlds=24){
 if(!Number.isInteger(startSeed)||!Number.isInteger(count)||count<100||count%100||
 !Number.isInteger(worlds)||worlds<1||worlds>64)throw Error('count must be multiple of 100; worlds 1..64');
 const tournamentResult=tournament(startSeed,count),hiddenResult=hiddenStudy(startSeed,count,worlds);
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return {schema:'qosha-three-stone-chain-preservation/v1',timestampBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9, four-branch number locking PROVISIONAL',
  seedStart:startSeed,seedEnd:startSeed+count-1,uniqueDeals:count,worldsPerPosition:worlds,
  hypothesis:'At forced 3-stone turns with two doubles and an ordinary connector, preserve one double only when playing that double makes an immediate next-turn ordinary+double mixed-finish legal; otherwise open both. Compare to always fewest and max-pips on matched deals and matched hidden worlds.',
  tournament:tournamentResult,hidden: hiddenResult,
  totalFullRoundContinuations:tournamentResult.continuations+hiddenResult.discovery.rounds,
  forcedCounterfactualContinuations:hiddenResult.forcedCounterfactualContinuations,
  limitations:'Number-locking four-branch model not authenticated; exact chain means next-turn mixed finish is legal, NOT guaranteed before opponents act. Hidden worlds uniform given known tiles and counts, not conditioned on prior opponents moves. First 3-stone choice from homogeneous max-pips trajectories; simple continuation bots. Seat rotations/profile repeats correlated; exploratory 95% position/seed-cluster intervals uncorrected. Synthetic previous winner when 1-1 stock, default follow-up. Block winner/loneZero/bust/101-point match unvalidated; finish-first != match victory.'};
}
function test(){
 const board=e.createBranchState([1,1]),opening=e.createOpeningState([1,4,5]);
 board.branches.up.end=2;board.branches.left.end=3;board.branches.right.end=4;board.branches.down.end=5;
 const state={branchState:board,openingState:opening,currentPlayer:0};
 const chainHand=[[2,2],[3,3],[2,3]],chainOpts=d.turnOptions(board,opening,chainHand,[]);
 const hit=threeChoice(chainOpts,state);
 if(!hit||!hit.chain||choose(CHAIN,chainOpts,{state}).tiles.length!==1)throw Error('double-connector-double chain');
 const otherHand=[[2,2],[3,3],[0,6]],otherOpts=d.turnOptions(board,opening,otherHand,[]);
 if(!threeChoice(otherOpts,state)||threeChoice(otherOpts,state).chain||
 choose(CHAIN,otherOpts,{state}).tiles.length!==2)throw Error('nonchain should open both');
 const ordinaryHand=[[2,2],[3,3],[4,6]],ordinaryOpts=d.turnOptions(board,opening,ordinaryHand,[]);
 if(threeChoice(ordinaryOpts,state))throw Error('ordinary move must gate chain');
 const a=run(1406840,100,4),b=run(1406840,100,4);
 delete a.timestampBaku;delete b.timestampBaku;
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('non-deterministic replay');
 if(a.tournament.continuations!==1800||a.totalFullRoundContinuations!==1900||
 a.hidden.forcedCounterfactualContinuations<0)throw Error('continuation accounting');
 if(PERMS.length!==6||[0,1,2].some(seat=>PERMS.filter(p=>p[seat]===0).length!==2))throw Error('permutation balance');
 return {passed:true,checks:['3-stone chain','nonchain opens both','ordinary-move exclusion','six-permutation seat balance','deterministic replay','accounting'],
  testFullContinuations:a.totalFullRoundContinuations,testForcedContinuations:a.forcedCounterfactualContinuations};
}
if(require.main===module){const args=process.argv.slice(2);console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||1406840),+(args[1]||2400),+(args[2]||24)),null,2));}
module.exports={threeChoice,choose,position,hiddenStudy,tournament,run,test,CHAIN,FEW,MANY,PROFILES};