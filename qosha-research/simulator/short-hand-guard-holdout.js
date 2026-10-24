'use strict';
// Visible-only anti-threat guard for late forced-double choices, 3x9.
// Run: node qosha-research/simulator/short-hand-guard-holdout.js test
//      node qosha-research/simulator/short-hand-guard-holdout.js 1428440 6000 16
// Four-branch number-locking is PROVISIONAL. Finish-first != 101-point match victory.
const e=require('./engine'),init=require('./initializer'),round=require('./round-driver');
const d=require('./turn-dispatcher'),forced=require('./forced-double-count-ablation');
const late=require('./late-forced-double-paired'),hidden=require('./hidden-world');
const regret=require('./decision-regret'),threat=require('./chain-next-opponent-threat');
const short=require('./short-hand-threat');
const POLICIES=['random-legal','min-hand-pips'];
const FIELDS=['finishPP','pips','minusPP','blockPP'];
function ci(xs){
 if(!xs.length)return{n:0,mean:null,halfWidth95:null};
 const m=xs.reduce((s,x)=>s+x,0)/xs.length;
 const v=xs.length>1?xs.reduce((s,x)=>s+(x-m)**2,0)/(xs.length-1):0;
 return{n:xs.length,mean:m,halfWidth95:xs.length>1?2.05*Math.sqrt(v/xs.length):null};
}
function immediateSingleTilePlayable(tr,tile){
 const opts=d.turnOptions(tr.branchState,tr.openingState,[tile],[]);
 return opts.phase==='play'&&opts.actions.length>0;
}
// The guard uses ONLY visible hand, played tiles, public hand sizes, and board.
// Uniform unseen-tile exposure is a PROXY, not the posterior given opponent history.
function guardDecision(state,few,many){
 const focal=state.currentPlayer,next=(focal+1)%3;
 const nextStones=state.hands[next].length;
 if(nextStones!==1)return{choice:'many',nextStones,unseenPool:0,
  newlyPlayable:0,playableFew:0,playableMany:0,stockIgnored:state.stock.length};
 const pool=hidden.hiddenPool({focalHand:state.hands[focal],knownTiles:late.knownTiles(state)});
 const a=d.applyTurn(state.branchState,state.openingState,state.hands[focal],state.stock,few);
 const b=d.applyTurn(state.branchState,state.openingState,state.hands[focal],state.stock,many);
 let newCount=0,fewCount=0,manyCount=0;
 for(const tile of pool){
  const x=immediateSingleTilePlayable(a,tile),y=immediateSingleTilePlayable(b,tile);
  if(x)fewCount++;
  if(y)manyCount++;
  if(y&&!x)newCount++;
 }
 return{choice:newCount>0?'few':'many',nextStones,unseenPool:pool.length,
  newlyPlayable:newCount,playableFew:fewCount,playableMany:manyCount,
  stockIgnored:state.stock.length};
}
function diff(y,x){return{finishPP:100*(y.first-x.first),pips:y.pips-x.pips,
 minusPP:100*(y.minus-x.minus),blockPP:100*(y.block-x.block)};}
function zero(){return{finishPP:0,pips:0,minusPP:0,blockPP:0};}
function addAvg(target,x,n){for(const k of FIELDS)target[k]+=x[k]/n;}
function summarize(rows,worlds){
 const cats={manyOnly:0,fewOnly:0,both:0,neither:0};
 for(const row of rows)for(const k of Object.keys(cats))cats[k]+=row.category[k];
 const policies={};
 for(const p of POLICIES)policies[p]=Object.fromEntries(['manyMinusFew','guardMinusMany','guardMinusFew'].map(mode=>[
  mode,Object.fromEntries(FIELDS.map(k=>[k,ci(rows.map(r=>r.metrics[p][mode][k]))]))]));
 return{positions:rows.length,worlds:rows.length*worlds,guardFew:rows.filter(r=>r.guard.choice==='few').length,
  guardMany:rows.filter(r=>r.guard.choice==='many').length,
  newlyPlayableUnseenTiles:ci(rows.filter(r=>r.nextStones===1).map(r=>r.guard.newlyPlayable)),
  immediateFinishWorlds:cats,
  guardMinusManyNextImmediateFinishPP:ci(rows.map(r=>r.guardThreatMinusManyPP)),
  policies};
}
function run(startSeed=1428440,count=6000,worlds=16){
 if(!Number.isInteger(startSeed)||!Number.isInteger(count)||count<1||
 !Number.isInteger(worlds)||worlds<1||worlds>64)throw Error('invalid arguments');
 const rows=[],disc={rounds:0,finishes:0,blocks:0,unresolved:0,
  eligibleNext1:0,eligibleNext2:0,chosenNext1:0,chosenNext2:0};
 for(let seed=startSeed;seed<startSeed+count;seed++){
  const initial=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(initial.kind!=='ready')throw Error('initializer unresolved '+seed);
  let one=null,two=null;
  const out=round.runRound(initial,(opts,s)=>{
   if(short.eligible(opts,s)){
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
  if(few.tiles.length>=many.tiles.length)throw Error('no forced double count contrast');
  const guard=guardDecision(state,few,many);
  const keys=[regret.actionKey(few),regret.actionKey(many)];
  const spec={visibleState:state,focalPlayer:focal,focalHand:state.hands[focal],
   knownTiles:late.knownTiles(state),hiddenHandSizes:state.hands.map(h=>h.length),
   stockSize:state.stock.length};
  const category={manyOnly:0,fewOnly:0,both:0,neither:0};
  const metrics=Object.fromEntries(POLICIES.map(p=>[p,{
   manyMinusFew:zero(),guardMinusMany:zero(),guardMinusFew:zero()}]));
  let guardThreatMinusManyPP=0;
  for(let i=0;i<worlds;i++){
   const worldSeed=(3500000000+(seed-startSeed)*64+i)>>>0;
   const world=hidden.sampleWorld(spec,worldSeed);
   const actions=d.turnOptions(world.branchState,world.openingState,world.hands[focal],world.stock).actions;
   if(keys.some(k=>!actions.some(a=>regret.actionKey(a)===k)))throw Error('candidate set changed');
   const a=actions.find(x=>regret.actionKey(x)===keys[0]);
   const b=actions.find(x=>regret.actionKey(x)===keys[1]);
   const ta=threat.nextImmediateFinish(world,a),tb=threat.nextImmediateFinish(world,b);
   const cat=tb.finish&&!ta.finish?'manyOnly':ta.finish&&!tb.finish?'fewOnly':ta.finish&&tb.finish?'both':'neither';
   category[cat]++;
   guardThreatMinusManyPP+=100*((guard.choice==='few'?ta.finish:tb.finish)-tb.finish)/worlds;
   for(const p of POLICIES){
    const x=late.forceThenContinue(world,keys[0],p,worldSeed);
    const y=late.forceThenContinue(world,keys[1],p,worldSeed);
    const g=guard.choice==='few'?x:y;
    addAvg(metrics[p].manyMinusFew,diff(y,x),worlds);
    addAvg(metrics[p].guardMinusMany,diff(g,y),worlds);
    addAvg(metrics[p].guardMinusFew,diff(g,x),worlds);
   }
  }
  rows.push({seed,turn:state.turns,focal,nextStones,
   focalStones:state.hands[focal].length,hand:state.hands[focal].map(e.tileKey),
   ends:e.SIDES.map(k=>state.branchState.branches[k].end),
   opened:[...state.openingState.openedNumbers].sort((a,b)=>a-b),
   few:few.numbers,many:many.numbers,guard,category,guardThreatMinusManyPP,metrics});
 }
 if(disc.unresolved)throw Error('unresolved discovery');
 const groups={all:rows,next1:rows.filter(r=>r.nextStones===1),
  next2:rows.filter(r=>r.nextStones===2),
  guardFew:rows.filter(r=>r.guard.choice==='few'),
  guardMany:rows.filter(r=>r.guard.choice==='many')};
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',
  month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-short-hand-guard-holdout/v1',timestampBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9; four-branch number lock PROVISIONAL',
  seedStart:startSeed,seedEnd:startSeed+count-1,uniqueDeals:count,worldsPerPosition:worlds,
  discovery:disc,positions:rows.length,hiddenWorldAllocations:rows.length*worlds,
  forcedCounterfactualContinuations:rows.length*worlds*2*POLICIES.length,
  fullRoundContinuations:count,strategies:['homogeneous max-pips discovery','forced fewest doubles',
   'forced max-pips doubles','visible-only new-tile exposure guard',...POLICIES],
  worldSeedFormula:'(3500000000+(dealSeed-seedStart)*64+worldIndex)>>>0',
  hypothesis:'On next-opponent one-stone states, does a visible-only guard against newly playable unseen tiles reduce immediate finish risk without excessive loss of own finish-first?',
  guardDefinition:'If next clockwise opponent has exactly one stone AND opening extra doubles makes >=1 previously unplayable tile in the unseen pool immediately playable, choose few; otherwise choose many. Unseen pool excludes focal hand and publicly played tiles. Stock draw ignored in exposure proxy.',
  selection:'First eligible next1 and first eligible next2 on homogeneous MANY trajectory; prefer next1, else next2, at most one per deal. Same pre-action state and hidden world for all forced choices.',
  summary:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,summarize(v,worlds)])),
  rows,confidence:'Exploratory uncorrected position-cluster 95% half-width; hidden worlds within a position correlated. No independent holdout for this exact guard yet.',
  limitations:'Visible exposure is NOT conditioned on opponent passes/previous decisions and ignores possible stock draw. Uniform sampled hidden allocations likewise ignore history. Homogeneous max-pips discovery is selection-biased; simple continuation bots; real number locking unverified, synthetic previous winner, opening follow-up default, block winner/loneZero/bust/101 match scoring unresolved. Finish-first is not match victory.',
  exactNextHypothesis:'Independent disjoint seeds >= '+(startSeed+count)+': validate guard versus pure few/many on next1 with a history-conditioned hidden-world sampler, then authenticate branch lock and match scoring.'};
}
function test(){
 const board=e.createBranchState([1,1]),opening=e.createOpeningState([1]);
 board.branches.up.end=2;board.branches.left.end=3;
 const hand=[[2,2],[3,3],[0,6]],opts=d.turnOptions(board,opening,hand,[]);
 const few=forced.choose(forced.FEW,opts),many=forced.choose(forced.MANY,opts);
 const mock={branchState:board,openingState:opening,hands:[hand,[[2,6]],[[4,5]]],
  stock:[],currentPlayer:0,turns:8,consecutivePasses:0,outcome:null};
 if(guardDecision(mock,few,many).choice!=='few')throw Error('guard misses newly exposed tile');
 const safe={...mock,hands:[hand,[[2,6],[4,5]],[]]};
 if(guardDecision(safe,few,many).choice!=='many')throw Error('guard must not act for next2');
 const a=run(1428440,200,3),b=run(1428440,200,3);
 delete a.timestampBaku;delete b.timestampBaku;
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('non-deterministic replay');
 if(a.forcedCounterfactualContinuations!==a.positions*3*4||a.discovery.unresolved)
  throw Error('accounting');
 for(const row of a.rows){
  if(Object.values(row.category).reduce((x,y)=>x+y,0)!==3)throw Error('threat partition');
  if(row.nextStones>2)throw Error('next opponent hand-size filter');
  if(row.guard.choice==='few'&&row.guard.newlyPlayable===0)throw Error('guard without risk');
 }
 return{passed:true,discovery:a.discovery.rounds,positions:a.positions,
  forcedContinuations:a.forcedCounterfactualContinuations,positiveControl:true};
}
if(require.main===module){
 const args=process.argv.slice(2);
 console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||1428440),+(args[1]||6000),+(args[2]||16)),null,2));
}
module.exports={guardDecision,run,test};
