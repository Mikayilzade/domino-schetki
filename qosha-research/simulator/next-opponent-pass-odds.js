'use strict';
// Exact next-opponent pass odds for reachable Qoşa 3x9 positions.
// Run: node qosha-research/simulator/next-opponent-pass-odds.js [startSeed] [maxSeeds] [targetPositions]
// Model: qosa-research-0.5.3 / qosa-1.0.0. Uniform unknown tiles, not conditioned on prior decisions.
// This is an immediate next-turn diagnostic, NOT a game-win prediction.
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner');
const {geometrySignature}=require('./geometry-number-aware');
const check=(v,msg)=>{if(!v)throw Error(msg);};
const key=a=>[a.type,a.side||'',a.to??'',e.tileKey(a.tile||[0,0])].join('|');
function signature(b,o){return geometrySignature(e.SIDES.map(s=>b.branches[s].end),[...o.openedNumbers],e.SIDES.map(s=>b.branches[s].active));}
function passOdds(b,o,pool,h){
 check(Number.isInteger(h)&&h>=0&&h<=pool.length,'bad hand size');
 check(new Set(pool.map(e.tileKey)).size===pool.length,'duplicate hidden tile');
 const counts=pool.map(tile=>d.actionsForHand(b,o,[tile]).length);
 const legal=counts.filter(x=>x>0).length,dead=pool.length-legal;
 let pass=1;for(let i=0;i<h;i++)pass*=Math.max(0,dead-i)/(pool.length-i);
 return {unknown:pool.length,playable:legal,handSize:h,passProbability:pass,
  expectedPlayableTiles:pool.length?h*legal/pool.length:0};
}
function unknownPool(state,focal){
 const deck=e.createDoubleSixDeck(),remain=state.hands.flat().concat(state.stock);
 check(new Set(remain.map(e.tileKey)).size===remain.length,'duplicate remaining');
 const remains=new Set(remain.map(e.tileKey));
 const played=deck.filter(t=>!remains.has(e.tileKey(t)));
 const known=new Set(played.concat(state.hands[focal]).map(e.tileKey));
 const pool=deck.filter(t=>!known.has(e.tileKey(t)));
 const actual=state.hands.filter((_,i)=>i!==focal).flat().concat(state.stock).map(e.tileKey).sort();
 check(JSON.stringify(pool.map(e.tileKey).sort())===JSON.stringify(actual),'hidden-pool mismatch');
 return pool;
}
function analysePosition(state){
 if(state.stock.length||state.outcome)return null;
 const focal=state.currentPlayer,hand=state.hands[focal],next=(focal+1)%3;
 if(hand.length<2)return null;
 const opts=d.turnOptions(state.branchState,state.openingState,hand,state.stock);
 if(opts.phase!=='play')return null;
 const singles=opts.actions.filter(a=>a.type==='single').sort((a,b)=>key(a).localeCompare(key(b)));
 const pool=unknownPool(state,focal),replyHand=state.hands[next],xs=[];
 for(const action of singles){
  const p=d.applyTurn(state.branchState,state.openingState,hand,state.stock,action);
  const g=signature(p.branchState,p.openingState),odds=passOdds(p.branchState,p.openingState,pool,replyHand.length);
  const reply=d.actionsForHand(p.branchState,p.openingState,replyHand);
  xs.push({key:key(action),tile:action.tile,side:action.side,pips:e.pipSum([action.tile]),
   endCount:g.accessibleEndCount,ends:g.accessibleEndValues,odds,replyPass:reply.length===0,replyActions:reply.length});
 }
 for(let i=0;i<xs.length;i++)for(let j=i+1;j<xs.length;j++){
  const a=xs[i],b=xs[j];
  if(e.tileKey(a.tile)!==e.tileKey(b.tile)&&a.pips===b.pips&&a.endCount===b.endCount&&
     JSON.stringify(a.ends)!==JSON.stringify(b.ends))return{focal,next,handSize:hand.length,nextHandSize:replyHand.length,a,b};
 }
 return null;
}
function selfTest(){
 const b=e.createBranchState([1,1]);['left','right','down'].forEach(s=>b.branches[s].end=3);
 const o=e.createOpeningState([1,2]),pool=[[1,5],[1,6],[2,4],[0,0]];
 let x=passOdds(b,o,pool,2);
 check(x.playable===2&&Math.abs(x.passProbability-1/6)<1e-12,'1/6 fixture');
 b.branches.up.end=2;x=passOdds(b,o,pool,2);
 check(x.playable===1&&Math.abs(x.passProbability-1/2)<1e-12,'1/2 fixture');
 let brute=0;for(let i=0;i<pool.length;i++)for(let j=i+1;j<pool.length;j++)
  if(!d.actionsForHand(b,o,[pool[i],pool[j]]).length)brute++;
 check(brute===3,'exact brute-force 3/6');
 b.branches.up.end=0;
 check(d.actionsForHand(b,o,[[0,0]]).length>0,'unopened double is playable');
 check(passOdds(b,o,pool,0).passProbability===1,'empty hand');
 return 'PASS exact odds, enumeration, unopened double';
}
function runExperiment({startSeed=8100000,maxSeeds=20000,targetPositions=80}={}){
 const out={engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  seedStart:startSeed,seedMaxExclusive:startSeed+maxSeeds,discoveryPolicy:'min-hand-pips',
  targetPositions,completedDiscoveryRounds:0,finishes:0,blocks:0,unresolved:0,
  positions:0,unequalPredictedOdds:0,actualPassFlips:0,
  sumPredictedAbsoluteGap:0,sumActualPassOracleGain:0,sumNextOpponentHand:0,
  examples:[],selectedSeeds:[]};
 for(let seed=startSeed;seed<startSeed+maxSeeds&&out.positions<targetPositions;seed++){
  const initState=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(initState.kind!=='ready'){out.unresolved++;continue;}
  let state=initState,recorded=false;
  while(!state.outcome&&state.turns<200){
   if(!recorded){const p=analysePosition(state);if(p){
    recorded=true;out.positions++;out.selectedSeeds.push(seed);
    const a=p.a,b=p.b,hi=a.odds.passProbability>=b.odds.passProbability?a:b;
    const lo=hi===a?b:a;
    if(a.odds.passProbability!==b.odds.passProbability)out.unequalPredictedOdds++;
    if(a.replyPass!==b.replyPass)out.actualPassFlips++;
    out.sumPredictedAbsoluteGap+=Math.abs(a.odds.passProbability-b.odds.passProbability);
    out.sumActualPassOracleGain+=Number(hi.replyPass)-Number(lo.replyPass);
    out.sumNextOpponentHand+=p.nextHandSize;
    if(out.examples.length<12)out.examples.push({seed,turn:state.turns,nextHandSize:p.nextHandSize,a,b});
   }}
   state=r.stepRound(state,(opts,s)=>chooseBy('min-hand-pips',opts,{seed,turns:s.turns,player:s.currentPlayer}));
  }
  out.completedDiscoveryRounds++;
  if(state.outcome?.kind==='finish')out.finishes++;
  else if(state.outcome?.kind==='block')out.blocks++;
  else out.unresolved++;
 }
 out.seedEndInclusive=startSeed+out.completedDiscoveryRounds-1;
 out.meanAbsolutePredictedPassGap=out.positions?out.sumPredictedAbsoluteGap/out.positions:null;
 out.meanActualPassGainOracle=out.positions?out.sumActualPassOracleGain/out.positions:null;
 out.meanNextOpponentHand=out.positions?out.sumNextOpponentHand/out.positions:null;
 return out;
}
if(require.main===module){
 console.log(selfTest());
 console.log(JSON.stringify(runExperiment({startSeed:Number(process.argv[2]||8100000),
  maxSeeds:Number(process.argv[3]||20000),targetPositions:Number(process.argv[4]||80)}),null,2));
}
module.exports={signature,passOdds,unknownPool,analysePosition,selfTest,runExperiment};
