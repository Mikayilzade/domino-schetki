'use strict';
// Matched hidden-world late-double experiment with a genuinely distinct random-legal continuation.
// Number-lock branch geometry remains PROVISIONAL. No 101-point match inference.
// node qosha-research/simulator/chain-next-opponent-threat.js test
// node qosha-research/simulator/chain-next-opponent-threat.js 1411640 4800 16
const e=require('./engine'),init=require('./initializer'),round=require('./round-driver');
const d=require('./turn-dispatcher'),forced=require('./forced-double-count-ablation');
const chain=require('./three-stone-chain-preservation'),late=require('./late-forced-double-paired');
const hidden=require('./hidden-world'),regret=require('./decision-regret');
const POLICIES=['random-legal','min-hand-pips'];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function ci(a){const n=a.length,m=mean(a);if(n<2)return{n,mean:m,halfWidth95:null};const v=a.reduce((s,x)=>s+(x-m)**2,0)/(n-1);return{n,mean:m,halfWidth95:2.05*Math.sqrt(v/n)};}
function nextImmediateFinish(world,action){
 const focal=world.currentPlayer,next=(focal+1)%3;
 const tr=d.applyTurn(world.branchState,world.openingState,world.hands[focal],world.stock,action);
 if(!tr.hand.length)return{finish:0,minus:0,notAtRisk:1};
 const opts=d.turnOptions(tr.branchState,tr.openingState,world.hands[next],tr.stock);
 if(opts.phase!=='play')return{finish:0,minus:0,notAtRisk:0};
 let finish=0,minus=0;
 for(const a of opts.actions){
  const after=d.applyTurn(tr.branchState,tr.openingState,world.hands[next],tr.stock,a);
  if(!after.hand.length){finish=1;if(e.finishMinus(after.finishDoubles)<0)minus=1;}
 }
 return{finish,minus,notAtRisk:0};
}
function position(hit,startSeed,worlds){
 const {seed,state}=hit,focal=state.currentPlayer,next=(focal+1)%3;
 const opts=d.turnOptions(state.branchState,state.openingState,state.hands[focal],state.stock);
 const found=chain.threeChoice(opts,state);
 if(!found)throw Error('ineligible position');
 const few=forced.choose(forced.FEW,opts),many=forced.choose(forced.MANY,opts);
 if(few.tiles.length!==1||many.tiles.length!==2)throw Error('unexpected double-count');
 const keys=[regret.actionKey(few),regret.actionKey(many)];
 const spec={visibleState:state,focalPlayer:focal,focalHand:state.hands[focal],
  knownTiles:late.knownTiles(state),hiddenHandSizes:state.hands.map(h=>h.length),stockSize:state.stock.length};
 const diffs=Object.fromEntries(POLICIES.map(p=>[p,{finishPP:0,pips:0,minusPP:0,blockPP:0}]));
 const threat={finishPP:0,minusPP:0,manyOnly:0,fewOnly:0,both:0,neither:0};
 let continuations=0;
 for(let i=0;i<worlds;i++){
  const worldSeed=(2400000000+(seed-startSeed)*64+i)>>>0,world=hidden.sampleWorld(spec,worldSeed);
  const actions=d.turnOptions(world.branchState,world.openingState,world.hands[focal],world.stock).actions;
  const a=actions.find(x=>regret.actionKey(x)===keys[0]),b=actions.find(x=>regret.actionKey(x)===keys[1]);
  if(!a||!b)throw Error('hidden world changed legal action');
  const ta=nextImmediateFinish(world,a),tb=nextImmediateFinish(world,b);
  threat.finishPP+=100*(tb.finish-ta.finish)/worlds;
  threat.minusPP+=100*(tb.minus-ta.minus)/worlds;
  threat.manyOnly+=tb.finish&&!ta.finish?1:0;
  threat.fewOnly+=ta.finish&&!tb.finish?1:0;
  threat.both+=ta.finish&&tb.finish?1:0;
  threat.neither+=!ta.finish&&!tb.finish?1:0;
  for(const policy of POLICIES){
   const x=late.forceThenContinue(world,keys[0],policy,worldSeed);
   const y=late.forceThenContinue(world,keys[1],policy,worldSeed);
   continuations+=2;
   const v=diffs[policy];v.finishPP+=100*(y.first-x.first)/worlds;
   v.pips+=(y.pips-x.pips)/worlds;v.minusPP+=100*(y.minus-x.minus)/worlds;
   v.blockPP+=100*(y.block-x.block)/worlds;
  }
 }
 return{seed,turn:state.turns,focal,hand:state.hands[focal].map(e.tileKey),
  nextOpponentStones:state.hands[next].length,otherOpponentStones:state.hands[(focal+2)%3].length,
  chain:!!found.chain,ends:e.SIDES.map(side=>state.branchState.branches[side].end),
  opened:[...state.openingState.openedNumbers].sort((a,b)=>a-b),
  few:few.numbers,many:many.numbers,threat,diffs,worlds,continuations};
}
function summarize(rows){
 const out={positions:rows.length,nextImmediateFinishManyMinusFewPP:ci(rows.map(r=>r.threat.finishPP)),
  nextImmediateMinusManyMinusFewPP:ci(rows.map(r=>r.threat.minusPP)),
  threatWorldCounts:{manyOnly:0,fewOnly:0,both:0,neither:0},policies:{}};
 for(const row of rows)for(const k of Object.keys(out.threatWorldCounts))out.threatWorldCounts[k]+=row.threat[k];
 for(const p of POLICIES)out.policies[p]=Object.fromEntries(['finishPP','pips','minusPP','blockPP'].map(k=>[k,ci(rows.map(r=>r.diffs[p][k]))]));
 return out;
}
function run(startSeed=1411640,count=4800,worlds=16){
 if(!Number.isInteger(startSeed)||!Number.isInteger(count)||count<1||
 !Number.isInteger(worlds)||worlds<1||worlds>64)throw Error('invalid seed/count/worlds');
 const rows=[],discovery={rounds:0,finishes:0,blocks:0,unresolved:0};
 for(let seed=startSeed;seed<startSeed+count;seed++){
  const original=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(original.kind!=='ready')throw Error('initializer unresolved');
  let hit=null;
  const out=round.runRound(original,(opts,s)=>{
   if(!hit&&chain.threeChoice(opts,s))hit={seed,state:round.cloneRoundState(s)};
   return forced.choose(forced.MANY,opts,{seed,turns:s.turns,player:s.currentPlayer});
  },{maxTurns:200});
  discovery.rounds++;
  if(out.outcome.kind==='finish')discovery.finishes++;
  else if(out.outcome.kind==='block')discovery.blocks++;
  else discovery.unresolved++;
  if(hit)rows.push(position(hit,startSeed,worlds));
 }
 if(discovery.unresolved)throw Error('unresolved discovery');
 const groups={all:rows,next1:rows.filter(r=>r.nextOpponentStones===1),
  next2:rows.filter(r=>r.nextOpponentStones===2),
  nextAtMost2:rows.filter(r=>r.nextOpponentStones<=2),
  next3to4:rows.filter(r=>r.nextOpponentStones>=3&&r.nextOpponentStones<=4),
  next5plus:rows.filter(r=>r.nextOpponentStones>=5),
  chain:rows.filter(r=>r.chain),noChain:rows.filter(r=>!r.chain)};
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-chain-next-opponent-threat/v1',timestampBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9, number-lock geometry PROVISIONAL',
  seedStart:startSeed,seedEnd:startSeed+count-1,uniqueDeals:count,worldsPerPosition:worlds,
  discovery,positions:rows.length,hiddenWorldAllocations:rows.length*worlds,
  forcedCounterfactualContinuations:rows.reduce((s,r)=>s+r.continuations,0),
  fullRoundContinuations:count,policies:POLICIES,
  hypothesis:'Does opening both doubles expose the next clockwise opponent to an immediate finish, especially with <=2 stones, and does this alter few-versus-many outcomes under genuinely distinct random-legal versus min-hand-pips continuations?',
  worldSeedFormula:'(2400000000+(dealSeed-seedStart)*64+worldIndex)>>>0',
  comparison:'many-minus-few forced legal actions on identical hidden allocations; next-opponent immediate finish means any legal finishing move, not chosen policy action',
  summary:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,summarize(v)])),
  rows,limitations:'First eligible three-stone variable-double turn from homogeneous max-pips discovery; random-legal deterministic by world seed and turn, but not behaviorally identical to min-hand-pips. Uniform hidden allocations ignore past opponent actions/passes. World samples correlated within position. Exploratory position-cluster 95% half-width uncorrected. Small <=2 subgroup may be inconclusive. Real branch opening unverified, previous winner synthetic for stock 1-1, block winner/loneZero/bust/101 match scoring unresolved. Finish-first not match victory.'};
}
function test(){
 // Positive control: opening 2-2 exposes a newly playable 2-6 to the next player.
 const board=e.createBranchState([1,1]),opening=e.createOpeningState([1]);
 board.branches.up.end=2;board.branches.left.end=3;
 const hand=[[2,2],[3,3],[0,6]],opts=d.turnOptions(board,opening,hand,[]);
 const few=forced.choose(forced.FEW,opts),many=forced.choose(forced.MANY,opts);
 const mock={branchState:board,openingState:opening,hands:[hand,[[2,6]],[[4,5]]],
  stock:[],currentPlayer:0,turns:8,consecutivePasses:0,outcome:null};
 if(nextImmediateFinish(mock,few).finish!==0||nextImmediateFinish(mock,many).finish!==1)
  throw Error('immediate threat positive control');
 const state=init.initializeThreePlayerRound({seed:1411640,isFirstRound:false,previousWinnerIndex:0});
 if(state.kind!=='ready')throw Error('init');
 const a=run(1411640,60,3),b=run(1411640,60,3);
 delete a.timestampBaku;delete b.timestampBaku;
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('nondeterministic');
 if(a.forcedCounterfactualContinuations!==a.positions*3*2*POLICIES.length)throw Error('accounting');
 for(const row of a.rows)if(row.threat.manyOnly+row.threat.fewOnly+row.threat.both+row.threat.neither!==3)throw Error('threat partition');
 return{passed:true,positions:a.positions,discovery:a.discovery.rounds,forced:a.forcedCounterfactualContinuations};
}
if(require.main===module){const args=process.argv.slice(2);console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||1411640),+(args[1]||4800),+(args[2]||16)),null,2));}
module.exports={nextImmediateFinish,position,run,test};
