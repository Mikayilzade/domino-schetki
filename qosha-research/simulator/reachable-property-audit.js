'use strict';
// Deterministic reachable-state property audit; not a strategy experiment.
const assert=require('node:assert/strict');
const e=require('./engine'),init=require('./initializer'),d=require('./turn-dispatcher'),t=require('./turn-kernel'),rd=require('./round-driver');
const DECK=e.createDoubleSixDeck().map(e.tileKey).sort();
const START=3406020,COUNT=200,LIMIT=200;
function stamp(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date())+' +04';}
function keys(xs){return xs.map(e.tileKey);}
function rng(seed){let s=e.mixSeed32(seed);if(!s)s=0x9e3779b9;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/0x100000000;};}
function alloc(deal){return deal.hands.map(h=>keys(h).sort().join(',')).join('|')+'#'+e.tileKey(deal.stock[0]);}
function conserve(hands,stock,played,label){const k=[...hands.flat(),...stock,...played].map(e.tileKey);assert.equal(k.length,28,label+' count');assert.equal(new Set(k).size,28,label+' duplicate');assert.deepStrictEqual(k.sort(),DECK,label+' deck');}
function hWith(state,p,hand){const hs=state.hands.map(h=>h.map(x=>[...x]));hs[p]=hand.map(x=>[...x]);return hs;}
function atiles(a){return a.type==='single'?[a.tile]:a.tiles;}
function asig(a){if(!a)return'PASS';if(a.type==='single')return'single:'+a.side+':'+e.tileKey(a.tile)+':'+a.to;return a.type+':'+(a.numbers||[]).join(',')+':'+(a.tiles||[]).map(e.tileKey).join(',')+':'+(a.side||'')+':'+(a.to??'');}
function aset(as){return as.map(asig).sort();}
function drawFixtures(){
 const b=e.applySinglePlacement(e.createBranchState([2,2],['up','left']),{side:'up',tile:[2,5],to:5});
 let o=t.ordinaryTurnOptions(b,[[5,6],[0,0]],[[2,6]]);assert.equal(o.phase,'play');assert.equal(o.drawn,false);assert.equal(o.stock.length,1);
 o=t.ordinaryTurnOptions(b,[[0,0],[3,4]],[[2,6]]);assert.equal(o.phase,'play');assert.equal(o.drawn,true);assert.deepStrictEqual(o.drawnTile,[2,6]);assert.equal(o.stock.length,0);assert(o.legal.every(a=>a.handIndex===2));
 let tr=t.applyOrdinaryTurn(b,[[0,0],[3,4]],[[2,6]],o.legal[0]);assert.equal(tr.passed,false);assert.equal(tr.hand.length,2);assert.equal(tr.stock.length,0);
 o=t.ordinaryTurnOptions(b,[[0,0]],[[3,4]]);assert.equal(o.phase,'pass');assert.equal(o.drawn,true);assert.deepStrictEqual(o.hand,[[0,0],[3,4]]);assert.equal(o.stock.length,0);
 tr=t.applyOrdinaryTurn(b,[[0,0]],[[3,4]]);assert.equal(tr.passed,true);assert.equal(tr.hand.length,2);assert.equal(tr.stock.length,0);
 o=t.ordinaryTurnOptions(b,[[0,0]],[]);assert.equal(o.phase,'pass');assert.equal(o.drawn,false);
 assert.equal(t.nextPassCount(2,{passed:false}),0);assert.equal(t.nextPassCount(2,{passed:true}),3);
 assert.equal(t.isBlocked({stock:[[1,1]],consecutivePasses:3,players:3}),false);assert.equal(t.isBlocked({stock:[],consecutivePasses:2,players:3}),false);assert.equal(t.isBlocked({stock:[],consecutivePasses:3,players:3}),true);
 return{fixtures:4,drawPlayable:1,drawPass:1,noDrawPass:1,inHandLegalSuppressesDraw:1};
}
function one(seed){
 const deal=e.dealThreeByNine(seed),stock0=deal.stock.map(x=>[...x]),stockOne=deal.stock.some(x=>e.tileKey(x)==='1-1');
 const state0=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:false,previousWinnerIndex:seed%3});assert.equal(state0.kind,'ready','init '+seed);
 const played=[[1,1]];if(state0.openingFollowup)played.push([...state0.openingFollowup.tile]);
 assert.equal(state0.openingPassed,!state0.openingFollowup);assert.equal(state0.consecutivePasses,state0.openingPassed?1:0);
 if(state0.openingDraw){assert.deepStrictEqual(state0.openingDraw,stock0[0]);assert.equal(stockOne,false);}else if(stockOne)assert.deepStrictEqual(stock0[0],[1,1]);
 assert.equal(state0.stock.length,0);conserve(state0.hands,state0.stock,played,'init '+seed);
 let s=state0,log=[];const random=rng((seed^0x5eed1234)>>>0);
 const m={positions:0,candidates:0,transitions:0,plays:0,passes:0,draws:0,drawPlayable:0,drawPass:0,openingDraw:state0.openingDraw?1:0,stockOneOne:stockOne?1:0,openingPass:state0.openingPassed?1:0,multiCandidate:0,actualMulti:0,maxActions:0,finish:0,block:0};
 while(!s.outcome&&s.turns<LIMIT){
  const p=s.currentPlayer,hand=s.hands[p],stock=s.stock,pre=d.actionsForHand(s.branchState,s.openingState,hand),o=d.turnOptions(s.branchState,s.openingState,hand,stock);m.positions++;
  if(pre.length){assert.equal(o.phase,'play');assert.equal(o.drawn,false);assert.deepStrictEqual(aset(o.actions),aset(pre));assert.deepStrictEqual(keys(o.hand),keys(hand));assert.deepStrictEqual(keys(o.stock),keys(stock));}
  else if(stock.length){const draw=stock[0],hh=[...hand,draw],ss=stock.slice(1),aa=d.actionsForHand(s.branchState,s.openingState,hh);assert.equal(o.drawn,true);assert.deepStrictEqual(o.drawnTile,draw);assert.deepStrictEqual(keys(o.hand),keys(hh));assert.deepStrictEqual(keys(o.stock),keys(ss));assert.equal(o.phase,aa.length?'play':'pass');assert.deepStrictEqual(aset(o.actions),aset(aa));}
  else{assert.equal(o.phase,'pass');assert.equal(o.drawn,false);assert.deepStrictEqual(keys(o.hand),keys(hand));assert.deepStrictEqual(o.stock,[]);assert.deepStrictEqual(o.actions,[]);}
  conserve(hWith(s,p,o.hand),o.stock,played,'options '+seed+'/'+s.turns);
  if(o.drawn){m.draws++;if(o.phase==='play')m.drawPlayable++;else m.drawPass++;}
  if(o.phase==='pass'){
   m.passes++;const tr=d.applyTurn(s.branchState,s.openingState,hand,stock,null);assert.equal(tr.passed,true);assert.equal(tr.drawn,o.drawn);assert.deepStrictEqual(keys(tr.hand),keys(o.hand));assert.deepStrictEqual(keys(tr.stock),keys(o.stock));assert.deepStrictEqual(tr.playedTiles,[]);
   const n=rd.stepRound(s,()=>null);assert.deepStrictEqual(keys(n.hands[p]),keys(o.hand));assert.deepStrictEqual(keys(n.stock),keys(o.stock));assert.equal(n.consecutivePasses,t.nextPassCount(s.consecutivePasses,{passed:true}));conserve(n.hands,n.stock,played,'pass '+seed+'/'+s.turns);log.push('PASS'+(o.drawn?':DRAW':''));s=n;continue;
  }
  assert(o.actions.length>0);m.candidates+=o.actions.length;m.maxActions=Math.max(m.maxActions,o.actions.length);const trs=[];
  for(const a of o.actions){const tr=d.applyTurn(s.branchState,s.openingState,hand,stock,a);m.transitions++;assert.equal(tr.passed,false);assert.equal(tr.drawn,o.drawn);assert.deepStrictEqual(tr.drawnTile,o.drawnTile);assert.deepStrictEqual(keys(tr.stock),keys(o.stock));assert.equal(tr.hand.length,o.hand.length-tr.playedTiles.length);assert.deepStrictEqual(keys(tr.playedTiles).sort(),keys(atiles(a)).sort());assert(tr.playedTiles.length>0);if(tr.playedTiles.length>1)m.multiCandidate++;conserve(hWith(s,p,tr.hand),tr.stock,[...played,...tr.playedTiles],'candidate '+seed+'/'+s.turns);trs.push(tr);}
  const ix=Math.floor(random()*o.actions.length),a=o.actions[ix],tr=trs[ix],n=rd.stepRound(s,()=>a);
  assert.deepStrictEqual(keys(n.hands[p]),keys(tr.hand));assert.deepStrictEqual(keys(n.stock),keys(tr.stock));assert.deepStrictEqual(n.branchState,tr.branchState);assert.deepStrictEqual(n.openingState,tr.openingState);assert.equal(n.consecutivePasses,0);assert.deepStrictEqual(keys(tr.playedTiles),keys(atiles(a)));
  played.push(...tr.playedTiles.map(x=>[...x]));m.plays++;if(tr.playedTiles.length>1)m.actualMulti++;log.push(asig(a));conserve(n.hands,n.stock,played,'play '+seed+'/'+s.turns);s=n;
 }
 assert(s.outcome,'limit '+seed);assert.notEqual(s.outcome.kind,'unresolved');
 if(s.outcome.kind==='finish'){assert.equal(s.hands[s.outcome.playerIndex].length,0);m.finish++;}else if(s.outcome.kind==='block'){assert.equal(s.stock.length,0);assert(s.consecutivePasses>=3);m.block++;}else assert.fail('terminal '+s.outcome.kind);
 conserve(s.hands,s.stock,played,'terminal '+seed);return{seed,allocation:alloc(deal),outcome:s.outcome.kind,turns:s.turns,log,m};
}
function run(start=START,count=COUNT){
 assert(Number.isInteger(start)&&start>=0&&Number.isInteger(count)&&count>0&&count<=10000);
 const seen=new Set(),duplicates=[],tot={trajectories:0,positions:0,actionCandidates:0,candidateTransitions:0,actualPlays:0,actualPasses:0,actualDraws:0,actualDrawPlayable:0,actualDrawPass:0,openingDraws:0,stockOneOneOpenings:0,openingPasses:0,multiTileCandidateTransitions:0,actualMultiTilePlays:0,maxLegalActions:0,finish:0,block:0,turnsTotal:0,turnsMin:null,turnsMax:0};
 for(let i=0;i<count;i++){const x=one(start+i);if(seen.has(x.allocation))duplicates.push(x.seed);seen.add(x.allocation);for(const [a,b] of [['positions','positions'],['actionCandidates','candidates'],['candidateTransitions','transitions'],['actualPlays','plays'],['actualPasses','passes'],['actualDraws','draws'],['actualDrawPlayable','drawPlayable'],['actualDrawPass','drawPass'],['openingDraws','openingDraw'],['stockOneOneOpenings','stockOneOne'],['openingPasses','openingPass'],['multiTileCandidateTransitions','multiCandidate'],['actualMultiTilePlays','actualMulti'],['finish','finish'],['block','block']])tot[a]+=x.m[b];tot.maxLegalActions=Math.max(tot.maxLegalActions,x.m.maxActions);tot.trajectories++;tot.turnsTotal+=x.turns;tot.turnsMin=tot.turnsMin===null?x.turns:Math.min(tot.turnsMin,x.turns);tot.turnsMax=Math.max(tot.turnsMax,x.turns);}
 const replay=[...new Set([start,start+1,start+2,start+Math.floor(count/2),start+count-1])];for(const seed of replay){const a=one(seed),b=one(seed);assert.deepStrictEqual(a.log,b.log,'replay '+seed);assert.equal(a.outcome,b.outcome);assert.equal(a.turns,b.turns);}
 return{schema:'qosha-reachable-property-audit/v1',timestampAsiaBaku:stamp(),engine:'qosa-research-0.5.3 / exact GitHub engine.js + initializer + turn-dispatcher + turn-kernel + round-driver sources',rules:'recovered qosa-1.0.0, 3x9 + one stock; later-round 1-1-in-stock starter uses previousWinnerIndex=seed%3',trajectoryPolicy:'seeded-uniform-legal/v1; exploration only, no strength claim',startSeed:start,endSeed:start+count-1,seedDraws:count,uniqueAllocations:seen.size,duplicateAllocationCount:count-seen.size,duplicateSeeds:duplicates,totals:{...tot,meanTurns:tot.turnsTotal/tot.trajectories},replayChecks:replay,drawPassFixtures:drawFixtures(),strategyDeals:0,strategyComparisons:0,hiddenWorlds:0,limitation:'Branch reopening and block/tie scoring remain provisional. Terminal kinds are engine diagnostics only. The single stock tile is consumed by 1-1 opening setup in 3x9, so in-round draw behavior is tested separately with synthetic turn-kernel fixtures.'};
}
if(require.main===module){const a=process.argv.slice(2).map(Number);console.log(JSON.stringify(run(Number.isFinite(a[0])?a[0]:START,Number.isFinite(a[1])?a[1]:COUNT),null,2));}
module.exports={run,one,drawFixtures,alloc};
