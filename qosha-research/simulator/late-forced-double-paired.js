'use strict';
// Late forced-double choice: matched hidden-world counterfactuals, provisional branch locking.
// node qosha-research/simulator/late-forced-double-paired.js test
// node qosha-research/simulator/late-forced-double-paired.js 1405640 1200 24
const e=require('./engine'),init=require('./initializer'),round=require('./round-driver');
const d=require('./turn-dispatcher'),forced=require('./forced-double-count-ablation');
const base=require('./strategy-runner'),hidden=require('./hidden-world');
const regret=require('./decision-regret');
const POLICIES=['min-hand-pips','closed-branch-control'];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function summarize(xs){
 if(!xs.length)return {n:0,mean:null,halfWidth95:null};
 const m=mean(xs),variance=xs.length>1?xs.reduce((s,x)=>s+(x-m)**2,0)/(xs.length-1):0;
 return {n:xs.length,mean:m,halfWidth95:xs.length>1?2.0*Math.sqrt(variance/xs.length):null,positive:xs.filter(x=>x>1e-9).length,zero:xs.filter(x=>Math.abs(x)<=1e-9).length,negative:xs.filter(x=>x< -1e-9).length};
}
function eligible(opts,state){
 if(opts.drawn||opts.phase!=='play'||state.hands[state.currentPlayer].length>4)return false;
 if(opts.actions.some(a=>a.type==='single'||a.type==='mixed-finish'))return false;
 const doubles=opts.actions.filter(a=>a.type==='double-sequence');
 return doubles.length>1&&new Set(doubles.map(a=>a.tiles.length)).size>1;
}
function knownTiles(state){
 const present=new Set(state.hands.flat().concat(state.stock).map(e.tileKey));
 if(present.size!==state.hands.flat().length+state.stock.length)throw Error('duplicate current tile');
 return e.createDoubleSixDeck().filter(t=>!present.has(e.tileKey(t)));
}
function forceThenContinue(world,key,policy,worldSeed){
 let first=true;
 const end=round.runRound(world,(opts,s)=>{
  if(first){
   first=false;
   const hit=opts.actions.find(a=>regret.actionKey(a)===key);
   if(!hit)throw Error('forced action not legal in hidden world');
   return hit;
  }
  return base.chooseBy(policy,opts,{seed:worldSeed,turns:s.turns,player:s.currentPlayer});
 },{maxTurns:200});
 if(first||end.outcome.kind==='unresolved')throw Error('counterfactual unresolved');
 const focal=world.currentPlayer,o=end.outcome;
 return {first:o.kind==='finish'&&o.playerIndex===focal?1:0,
  pips:e.pipSum(end.hands[focal]),
  minus:o.kind==='finish'&&o.playerIndex===focal&&o.minus<0?1:0,
  minusPoints:o.kind==='finish'&&o.playerIndex===focal?-(o.minus||0):0,
  block:o.kind==='block'?1:0};
}
function analyzePosition(hit,startSeed,worlds){
 const {seed,state,handSize}=hit,focal=state.currentPlayer;
 const opts=d.turnOptions(state.branchState,state.openingState,state.hands[focal],state.stock);
 if(!eligible(opts,state))throw Error('stored state not eligible');
 const few=forced.choose(forced.FEW,opts),many=forced.choose(forced.MANY,opts);
 if(few.tiles.length>=many.tiles.length)throw Error('forced count does not differ');
 const spec={visibleState:state,focalPlayer:focal,focalHand:state.hands[focal],
  knownTiles:knownTiles(state),hiddenHandSizes:state.hands.map(h=>h.length),stockSize:state.stock.length};
 const deltas=Object.fromEntries(POLICIES.map(p=>[p,{finishPP:0,pips:0,minusPP:0,minusPoints:0,blockPP:0,fewMinus:0,manyMinus:0}]));
 const keys=[regret.actionKey(few),regret.actionKey(many)];
 for(let i=0;i<worlds;i++){
  const worldSeed=(1000000000+(seed-startSeed)*128+i)>>>0;
  const world=hidden.sampleWorld(spec,worldSeed);
  const actualKeys=hidden.candidateKeys(world);
  if(keys.some(k=>!actualKeys.includes(k)))throw Error('candidate changed in world');
  for(const policy of POLICIES){
   const a=forceThenContinue(world,keys[0],policy,worldSeed);
   const b=forceThenContinue(world,keys[1],policy,worldSeed);
   const v=deltas[policy];
   v.finishPP+=100*(b.first-a.first)/worlds;
   v.pips+=(b.pips-a.pips)/worlds;
   v.minusPP+=100*(b.minus-a.minus)/worlds;
   v.minusPoints+=(b.minusPoints-a.minusPoints)/worlds;
   v.blockPP+=100*(b.block-a.block)/worlds;
   v.fewMinus+=a.minus;v.manyMinus+=b.minus;
  }
 }
 return {seed,turn:state.turns,handSize,focal,hand:state.hands[focal].map(e.tileKey),
  branchEnds:e.SIDES.map(side=>state.branchState.branches[side].end),
  opened:[...state.openingState.openedNumbers].sort((a,b)=>a-b),
  fewDoubles:few.tiles.length,manyDoubles:many.tiles.length,deltas};
}
function run(startSeed=1405640,count=1200,worlds=24){
 if(!Number.isInteger(startSeed)||!Number.isInteger(count)||count<1||
  !Number.isInteger(worlds)||worlds<1||worlds>64)throw Error('invalid seed/count/worlds');
 const hits=[],discovery={rounds:0,finishes:0,blocks:0,unresolved:0};
 for(let seed=startSeed;seed<startSeed+count;seed++){
  const original=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(original.kind!=='ready')throw Error('initializer unresolved');
  let found=null;
  const result=round.runRound(original,(opts,state)=>{
   if(!found&&eligible(opts,state))found={seed,state:round.cloneRoundState(state),handSize:state.hands[state.currentPlayer].length};
   return forced.choose(forced.MANY,opts,{seed,turns:state.turns,player:state.currentPlayer});
  },{maxTurns:200});
  discovery.rounds++;
  if(result.outcome.kind==='finish')discovery.finishes++;
  else if(result.outcome.kind==='block')discovery.blocks++;
  else discovery.unresolved++;
  if(found)hits.push(found);
 }
 if(discovery.unresolved)throw Error('unresolved discovery');
 const rows=hits.map(hit=>analyzePosition(hit,startSeed,worlds));
 const summary={};
 for(const policy of POLICIES){
  summary[policy]={};
  for(const group of ['all','3','4']){
   const sub=rows.filter(x=>group==='all'||x.handSize===+group);
   summary[policy][group]={positions:sub.length,
    manyMinusFewFinishPP:summarize(sub.map(x=>x.deltas[policy].finishPP)),
    manyMinusFewPips:summarize(sub.map(x=>x.deltas[policy].pips)),
    manyMinusFewMinusPP:summarize(sub.map(x=>x.deltas[policy].minusPP)),
    manyMinusFewMinusPoints:summarize(sub.map(x=>x.deltas[policy].minusPoints)),
    manyMinusFewBlockPP:summarize(sub.map(x=>x.deltas[policy].blockPP)),
    fewMinusFinishes:sub.reduce((n,x)=>n+x.deltas[policy].fewMinus,0),
    manyMinusFinishes:sub.reduce((n,x)=>n+x.deltas[policy].manyMinus,0)};
  }
 }
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return {schema:'qosha-late-forced-double-paired/v1',timestampBaku:stamp,engine:'qosa-research-0.5.3',
  rules:'recovered qosa-1.0.0 3x9, four-branch number-lock PROVISIONAL',
  seedStart:startSeed,seedEnd:startSeed+count-1,discovery,eligiblePositions:rows.length,
  hiddenWorldsPerPosition:worlds,hiddenWorldAllocations:rows.length*worlds,
  forcedCounterfactualContinuations:rows.length*worlds*2*POLICIES.length,
  policies:POLICIES,comparison:'forced one-double minimum vs max-pips multi-double from SAME reachable late state, SAME sampled hidden opponent allocation and SAME continuation policy; first eligible <=4-stone state per seed',
  worldSeedFormula:'(1000000000 + (dealSeed - seedStart)*128 + worldIndex) >>> 0',
  hypothesis:'Longer forced-double sequence may improve finish-first but for 3-stone late hands saving a double could improve minus finish; compare separately.',
  summary,examples:rows.slice(0,8),counterexamples:rows.filter(x=>POLICIES.some(p=>x.deltas[p].finishPP<0)).slice(0,8),
  limitations:'Hidden worlds sampled uniformly given current known tiles/counts, NOT conditioned on earlier opponents decisions. Discovery trajectory always max-pips late opening. First eligible late position per deal. Approximate position-cluster 95% CI uncorrected for multiple tests, worlds nested within positions. Real number-locking unverified; synthetic previous winner if stock 1-1, opening followup default, block winner/loneZero/bust/101 match unvalidated. Finish-first not match win.'};
}
function test(){
 const one={type:'double-sequence',tiles:[[2,2]],numbers:[2]},two={type:'double-sequence',tiles:[[2,2],[3,3]],numbers:[2,3]};
 const mock={phase:'play',drawn:false,actions:[one,two]};
 if(!eligible(mock,{hands:[[[1,2],[2,2],[3,3]]],currentPlayer:0}))throw Error('eligible 3 stones');
 if(eligible({...mock,drawn:true},{hands:[[[1,2],[2,2],[3,3]]],currentPlayer:0}))throw Error('draw gate');
 if(eligible({...mock,actions:[...mock.actions,{type:'single'}]},{hands:[[[1,2],[2,2],[3,3]]],currentPlayer:0}))throw Error('ordinary gate');
 const a=run(1405640,40,4),b=run(1405640,40,4);
 delete a.timestampBaku;delete b.timestampBaku;
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('non-deterministic');
 if(a.discovery.rounds!==40||a.forcedCounterfactualContinuations!==a.eligiblePositions*16)throw Error('accounting');
 return {passed:true,checks:['late forced eligibility','no draw','no ordinary action','matched hidden-world paired replay','continuation accounting'],positions:a.eligiblePositions,continuations:a.forcedCounterfactualContinuations};
}
if(require.main===module){const args=process.argv.slice(2);console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||1405640),+(args[1]||1200),+(args[2]||24)),null,2));}
module.exports={eligible,knownTiles,forceThenContinue,analyzePosition,run,test,POLICIES};