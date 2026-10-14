'use strict';
// Qoşa 3x9: independent hidden-world follow-up to three selected double-opening exceptions.
// Reproduce: node qosha-research/simulator/open44-policy-replies.js test
// Reproduce: node qosha-research/simulator/open44-policy-replies.js 100
const base=require('./matched-k-outcome-runner'),e=require('./engine');
const d=require('./turn-dispatcher'),rd=require('./round-driver'),hidden=require('./hidden-world');
const {actionKey}=require('./decision-regret'),{chooseBy}=require('./strategy-runner');
const SEEDS=[4300746,4301813,4301845],POLICIES=['closed-branch-control','min-hand-pips','fast-doubles','moderate-double-hold','random-legal'];
const START=320;
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
function replay(world,key,policy,seed){
 const focal=world.currentPlayer,opponent=(focal+1)%3;
 let s=rd.cloneRoundState(world),first=true,reply=null,ret=null,ret4=null;
 while(!s.outcome&&s.turns<200){
  const o=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
  let action=null;
  if(o.phase==='play'){
   action=first?o.actions.find(a=>actionKey(a)===key):chooseBy(policy,o,{seed,turns:s.turns,player:s.currentPlayer});
   if(!action)throw Error('missing forced action');
  }
  if(!first&&s.currentPlayer===opponent&&reply===null)reply=action?actionKey(action):o.phase;
  if(!first&&s.currentPlayer===focal&&ret===null){
   ret=o.phase==='play'?o.actions.length:0;
   ret4=o.phase==='play'?o.actions.filter(a=>(a.tiles||[a.tile]).some(t=>t&&t.includes(4))).length:0;
  }
  s=rd.stepRound(s,()=>action);first=false;
 }
 if(!s.outcome||s.outcome.kind==='unresolved')throw Error('unresolved');
 return {win:+(s.outcome.kind==='finish'&&s.outcome.playerIndex===focal),pips:e.pipSum(s.hands[focal]),
  minus:+(s.outcome.kind==='finish'&&s.outcome.playerIndex===focal&&(s.outcome.minus||0)<0),
  block:+(s.outcome.kind==='block'),reply,ret,ret4};
}
function run(worlds=100){
 if(!Number.isInteger(worlds)||worlds<1||worlds>500)throw Error('worlds must be 1..500');
 const positions=[];
 for(const seed of SEEDS){
  const pos=base.discover(seed,seed+1,1,'closed-branch-control').positions[0];
  if(!pos)throw Error('missing position '+seed);
  const s=pos.state,before=JSON.stringify(s),used=new Set(s.hands.flat().concat(s.stock).map(e.tileKey));
  const spec={focalPlayer:pos.focal,focalHand:s.hands[pos.focal],
   knownTiles:e.createDoubleSixDeck().filter(t=>!used.has(e.tileKey(t))),
   hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
  const expected=JSON.stringify(hidden.candidateKeys(s)),alloc=new Set(),nextS=[],nextD=[];
  const results=Object.fromEntries(POLICIES.map(p=>[p,[]]));
  for(let k=START;k<START+worlds;k++){
   const ws=(1500000000+Math.imul(seed,73)+k)>>>0,w=hidden.sampleWorld(spec,ws);
   if(JSON.stringify(hidden.candidateKeys(w))!==expected)throw Error('visible candidates changed');
   alloc.add(JSON.stringify(w.hands.map((h,i)=>i===pos.focal?[]:h.map(e.tileKey).sort())));
   for(const [key,out] of [[pos.pair.single,nextS],[pos.pair.double,nextD]]){
    const opts=d.turnOptions(w.branchState,w.openingState,w.hands[w.currentPlayer],w.stock);
    const action=opts.actions.find(a=>actionKey(a)===key);
    if(!action)throw Error('candidate unavailable');
    const after=d.applyTurn(w.branchState,w.openingState,w.hands[w.currentPlayer],w.stock,action);
    out.push(d.turnOptions(after.branchState,after.openingState,w.hands[(w.currentPlayer+1)%3],after.stock).actions.length);
   }
   for(const p of POLICIES)results[p].push({single:replay(w,pos.pair.single,p,ws),double:replay(w,pos.pair.double,p,ws)});
  }
  if(JSON.stringify(s)!==before)throw Error('source state mutated');
  const metrics=Object.fromEntries(POLICIES.map(p=>{
   const rows=results[p],stats=k=>({
    finishFirst:avg(rows.map(r=>r[k].win)),meanPips:avg(rows.map(r=>r[k].pips)),
    minusFinish:avg(rows.map(r=>r[k].minus)),block:avg(rows.map(r=>r[k].block)),
    returnRate:avg(rows.map(r=>+(r[k].ret!==null))),
    returnActions:avg(rows.filter(r=>r[k].ret!==null).map(r=>r[k].ret)),
    returnFourActions:avg(rows.filter(r=>r[k].ret4!==null).map(r=>r[k].ret4))});
   return [p,{single:stats('single'),double:stats('double'),
    winDeltaSingleMinusDouble:avg(rows.map(r=>r.single.win-r.double.win)),
    replyChanged:avg(rows.map(r=>+(r.single.reply!==r.double.reply))),
    discordantWorlds:rows.filter(r=>r.single.win!==r.double.win).length}];
  }));
  positions.push({seed,turn:pos.turn,focal:pos.focal,pair:pos.pair,
   uniqueAllocations:alloc.size,immediateNextOpponent:{singleActions:avg(nextS),doubleActions:avg(nextD),
    passFlips:nextS.filter((n,i)=>(n>0)!==(nextD[i]>0)).length},metrics});
 }
 return {schema:'qosa-open44-policy-replies/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9',worldIndices:[START,START+worlds-1],worldSeedFormula:'(1500000000+Math.imul(dealSeed,73)+worldIndex)>>>0',
  discoveryPolicy:'closed-branch-control',policies:POLICIES,positions,
  sampledWorlds:SEEDS.length*worlds,continuations:SEEDS.length*worlds*2*POLICIES.length,
  newFullStrategyRounds:0,verifiedPriorFullStrategyRounds:180000,
  limitations:'Selected exception positions, not representative new deals; uniform unseen worlds with replacement, no history conditioning, deterministic bots, provisional opening rules, block winner unassigned. First replies and return mobility are post-action mediators.'};
}
function test(){const a=run(2),b=run(2);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.sampledWorlds!==6||a.continuations!==60||
 a.positions.map(p=>p.turn).join(',')!=='14,10,9')throw Error('regression failed');
 return {passed:true,seeds:SEEDS};}
module.exports={run,test};
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():run(Number(process.argv[2]||100)),null,2));
