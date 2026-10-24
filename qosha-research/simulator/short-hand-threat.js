'use strict';
// Next-clockwise-opponent 1–2-stone threat: first qualifying position per deal,
// prioritizing 1-stone over 2-stone, from homogeneous MANY discovery.
// Four-branch number locking remains PROVISIONAL; finish-first != 101 match victory.
// node qosha-research/simulator/short-hand-threat.js test
// node qosha-research/simulator/short-hand-threat.js 1416440 12000 12
const e=require('./engine'),init=require('./initializer'),round=require('./round-driver');
const d=require('./turn-dispatcher'),forced=require('./forced-double-count-ablation');
const late=require('./late-forced-double-paired'),hidden=require('./hidden-world');
const regret=require('./decision-regret'),threat=require('./chain-next-opponent-threat');
const POLICIES=['random-legal','min-hand-pips'];
function ci(xs){
 if(!xs.length)return{n:0,mean:null,halfWidth95:null};
 const m=xs.reduce((a,b)=>a+b,0)/xs.length;
 const v=xs.length>1?xs.reduce((a,b)=>a+(b-m)**2,0)/(xs.length-1):0;
 return{n:xs.length,mean:m,halfWidth95:xs.length>1?2.05*Math.sqrt(v/xs.length):null};
}
function eligible(opts,s){
 if(opts.phase!=='play'||opts.drawn||s.hands[s.currentPlayer].length<3||
    opts.actions.some(a=>a.type==='single'||a.type==='mixed-finish'))return false;
 return new Set(opts.actions.filter(a=>a.type==='double-sequence').map(a=>a.tiles.length)).size>1;
}
function summarize(sub,worlds){
 const cats={manyOnly:0,fewOnly:0,both:0,neither:0};
 for(const row of sub)for(const k of Object.keys(cats))cats[k]+=row.category[k];
 return{positions:sub.length,worlds:sub.length*worlds,immediateFinishWorlds:cats,
  manyOnlyThreatProbabilityPP:ci(sub.map(x=>100*x.category.manyOnly/worlds)),
  policies:Object.fromEntries(POLICIES.map(p=>[p,Object.fromEntries(
   ['finishPP','pips','minusPP','blockPP'].map(k=>[k,ci(sub.map(x=>x.diff[p][k]))]))]))};
}
function run(startSeed=1416440,count=12000,worlds=12){
 if(!Number.isInteger(startSeed)||!Number.isInteger(count)||count<1||
 !Number.isInteger(worlds)||worlds<1||worlds>64)throw Error('invalid arguments');
 const rows=[],disc={rounds:0,finishes:0,blocks:0,unresolved:0,
  eligibleNext1:0,eligibleNext2:0,chosenNext1:0,chosenNext2:0};
 for(let seed=startSeed;seed<startSeed+count;seed++){
  const initial=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(initial.kind!=='ready')throw Error('initializer unresolved at '+seed);
  let one=null,two=null;
  const out=round.runRound(initial,(opts,s)=>{
   if(eligible(opts,s)){
    const n=s.hands[(s.currentPlayer+1)%3].length;
    if(n===1){disc.eligibleNext1++;if(!one)one=round.cloneRoundState(s);}
    else if(n===2){disc.eligibleNext2++;if(!two)two=round.cloneRoundState(s);}
   }
   return forced.choose(forced.MANY,opts,{seed,turns:s.turns,player:s.currentPlayer});
  },{maxTurns:200});
  disc.rounds++;
  if(out.outcome.kind==='finish')disc.finishes++;
  else if(out.outcome.kind==='block')disc.blocks++;
  else disc.unresolved++;
  const state=one||two;if(!state)continue;
  const focal=state.currentPlayer,next=(focal+1)%3,nextStones=state.hands[next].length;
  disc[nextStones===1?'chosenNext1':'chosenNext2']++;
  const opts=d.turnOptions(state.branchState,state.openingState,state.hands[focal],state.stock);
  const few=forced.choose(forced.FEW,opts),many=forced.choose(forced.MANY,opts);
  if(few.tiles.length>=many.tiles.length)throw Error('forced double count not variable');
  const keys=[regret.actionKey(few),regret.actionKey(many)];
  const spec={visibleState:state,focalPlayer:focal,focalHand:state.hands[focal],
   knownTiles:late.knownTiles(state),hiddenHandSizes:state.hands.map(h=>h.length),
   stockSize:state.stock.length};
  const category={manyOnly:0,fewOnly:0,both:0,neither:0};
  const diff=Object.fromEntries(POLICIES.map(p=>[p,{finishPP:0,pips:0,minusPP:0,blockPP:0}]));
  for(let i=0;i<worlds;i++){
   const worldSeed=(3100000000+(seed-startSeed)*64+i)>>>0;
   const world=hidden.sampleWorld(spec,worldSeed);
   const acts=d.turnOptions(world.branchState,world.openingState,world.hands[focal],world.stock).actions;
   if(keys.some(k=>!acts.some(a=>regret.actionKey(a)===k)))throw Error('candidate illegal in sampled world');
   const a=acts.find(x=>regret.actionKey(x)===keys[0]),b=acts.find(x=>regret.actionKey(x)===keys[1]);
   const ta=threat.nextImmediateFinish(world,a),tb=threat.nextImmediateFinish(world,b);
   const cat=tb.finish&&!ta.finish?'manyOnly':ta.finish&&!tb.finish?'fewOnly':ta.finish&&tb.finish?'both':'neither';
   category[cat]++;
   for(const p of POLICIES){
    const x=late.forceThenContinue(world,keys[0],p,worldSeed);
    const y=late.forceThenContinue(world,keys[1],p,worldSeed);
    diff[p].finishPP+=100*(y.first-x.first)/worlds;
    diff[p].pips+=(y.pips-x.pips)/worlds;
    diff[p].minusPP+=100*(y.minus-x.minus)/worlds;
    diff[p].blockPP+=100*(y.block-x.block)/worlds;
   }
  }
  rows.push({seed,turn:state.turns,focal,nextStones,focalStones:state.hands[focal].length,
   hand:state.hands[focal].map(e.tileKey),
   ends:e.SIDES.map(k=>state.branchState.branches[k].end),
   opened:[...state.openingState.openedNumbers].sort((a,b)=>a-b),
   few:few.numbers,many:many.numbers,category,diff});
 }
 if(disc.unresolved)throw Error('unresolved discovery');
 const groups={all:rows,next1:rows.filter(x=>x.nextStones===1),
  next2:rows.filter(x=>x.nextStones===2),
  threatDifference:rows.filter(x=>x.category.manyOnly+x.category.fewOnly>0),
  noThreatDifference:rows.filter(x=>x.category.manyOnly+x.category.fewOnly===0),
  focal3:rows.filter(x=>x.focalStones===3),
  focal4plus:rows.filter(x=>x.focalStones>=4)};
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',
  month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-short-hand-threat/v1',timestampBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9; four-branch number lock PROVISIONAL',
  seedStart:startSeed,seedEnd:startSeed+count-1,uniqueDeals:count,worldsPerPosition:worlds,
  discovery:disc,positions:rows.length,hiddenWorldAllocations:rows.length*worlds,
  forcedCounterfactualContinuations:rows.length*worlds*2*POLICIES.length,
  fullRoundContinuations:count,strategies:['homogeneous pip-late-max-pips-forced-doubles discovery',
   'forced fewest doubles','forced max-pips doubles',...POLICIES],
  worldSeedFormula:'(3100000000+(dealSeed-seedStart)*64+worldIndex)>>>0',
  hypothesis:'When the next clockwise opponent has 1 or 2 stones, does opening extra doubles expose an immediate legal finish, and how do paired forced choices perform?',
  selection:'First eligible next1 and first eligible next2 on homogeneous MANY trajectory; select next1 if present, else next2, at most one position per seed. Focal has >=3 stones. Eligibility: double-only actions with variable double counts, no draw.',
  summary:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,summarize(v,worlds)])),
  rows,confidence:'Exploratory 95% half-width across selected positions (2.05*SE), uncorrected; worlds within a position and trajectories across hypotheses not independent.',
  limitations:'Uniform hidden allocations fix focal hand, played tiles and hand sizes but ignore past passes/choices. First eligible selected on homogeneous MANY trajectory and next1 prioritized; not random table positions. Two simple continuation policies. Number-lock geometry unverified; synthetic previous winner for stock 1-1, opening follow-up default, block winner/loneZero/bust/101 match scoring unresolved. Finish-first is not match victory.',
  exactNextHypothesis:'Independent disjoint holdout seeds >= '+(startSeed+count)+': increase next1 sample and test a selective anti-threat double policy against matched seed baselines; condition hidden worlds on observed passes, then authenticate real branch lock and match scoring.'};
}
function test(){
 const board=e.createBranchState([1,1]),opening=e.createOpeningState([1]);
 board.branches.up.end=2;board.branches.left.end=3;
 const hand=[[2,2],[3,3],[0,6]],opts=d.turnOptions(board,opening,hand,[]);
 const few=forced.choose(forced.FEW,opts),many=forced.choose(forced.MANY,opts);
 const mock={branchState:board,openingState:opening,hands:[hand,[[2,6]],[[4,5]]],
  stock:[],currentPlayer:0,turns:8,consecutivePasses:0,outcome:null};
 if(threat.nextImmediateFinish(mock,few).finish!==0||threat.nextImmediateFinish(mock,many).finish!==1)
  throw Error('positive control failed');
 const a=run(1416440,300,3),b=run(1416440,300,3);
 delete a.timestampBaku;delete b.timestampBaku;
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('non-deterministic replay');
 if(a.forcedCounterfactualContinuations!==a.positions*3*4||a.discovery.unresolved)
  throw Error('accounting');
 for(const row of a.rows){
  if(Object.values(row.category).reduce((x,y)=>x+y,0)!==3)throw Error('threat partition');
  if(row.nextStones>2)throw Error('wrong next-player filter');
 }
 return{passed:true,discovery:a.discovery.rounds,positions:a.positions,
  forcedContinuations:a.forcedCounterfactualContinuations,positiveControl:true};
}
if(require.main===module){
 const args=process.argv.slice(2);
 console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||1416440),+(args[1]||12000),+(args[2]||12)),null,2));
}
module.exports={eligible,summarize,run,test};
