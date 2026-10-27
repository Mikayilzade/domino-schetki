'use strict';
// PROVISIONAL full-round counterfactual: a double unlocks only one matching side.
// "first" and "last" select sides in engine.SIDES order; neither is authenticated.
// Reproduce: node qosha-research/simulator/branch-side-full-round.js test
//            node qosha-research/simulator/branch-side-full-round.js 1600540 800
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),strat=require('./strategy-runner');
const MIXES=[['random-legal','min-hand-pips','closed-branch-control'],['fast-doubles','moderate-double-hold','closed-branch-control']];
function check(x,m){if(!x)throw Error('branch-side-full-round: '+m);}
function copyHand(h){return h.map(t=>[...t]);}
function localInit(base){
 return {branchState:e.cloneBranchState(base.branchState),
  openBySide:Object.fromEntries(e.SIDES.map(side=>[side,new Set([1])])),
  usedNumbers:new Set([1]),hands:base.hands.map(copyHand),stock:copyHand(base.stock),
  currentPlayer:base.currentPlayer,turns:base.turns,consecutivePasses:base.consecutivePasses,outcome:null};
}
function localSingles(s,hand){
 const out=[];
 hand.forEach((tile,handIndex)=>{if(tile[0]===tile[1])return;
  for(const p of e.legalSinglePlacements(s.branchState,tile))
   if(s.openBySide[p.side].has(p.from))out.push({type:'single',handIndex,...p});
 });
 return out;
}
function localSequences(s,hand,priority){
 const out=[];
 function recur(remaining,used,prefix){
  if(prefix.length)out.push(prefix);
  for(let i=0;i<remaining.length;i++){
   const tile=remaining[i],n=tile[0];
   if(n!==tile[1]||used.has(n))continue;
   const sides=e.sidesEndingIn(s.branchState,n);
   if(!sides.length)continue;
   const side=priority==='first'?sides[0]:sides[sides.length-1];
   const next=new Set(used);next.add(n);
   recur(remaining.filter((_,j)=>i!==j),next,[...prefix,{tile,number:n,side}]);
  }
 }
 recur(hand,s.usedNumbers,[]);
 return out;
}
function localActions(s,hand,priority){
 const singles=localSingles(s,hand),mixed=[];
 for(const single of singles){
  const rem=hand.filter((_,i)=>i!==single.handIndex);
  if(!rem.length||!rem.every(t=>t[0]===t[1]))continue;
  const shifted={...s,branchState:e.applySinglePlacement(s.branchState,single)};
  for(const seq of localSequences(shifted,rem,priority))
   if(seq.length===rem.length)mixed.push({...single,type:'mixed-finish',
    sequence:seq,tiles:[single.tile,...seq.map(x=>x.tile)],numbers:seq.map(x=>x.number),
    finishDoubles:seq.map(x=>x.tile)});
 }
 const mixKeys=new Set(mixed.map(a=>a.handIndex+':'+a.side+':'+a.to));
 const ordinary=singles.filter(a=>!mixKeys.has(a.handIndex+':'+a.side+':'+a.to));
 let seqs=localSequences(s,hand,priority);
 if(hand.length&&hand.every(t=>t[0]===t[1])){
  const full=seqs.filter(seq=>seq.length===hand.length);
  if(full.length)seqs=full;
 }
 const doubles=seqs.map(sequence=>({type:'double-sequence',sequence,
  tiles:sequence.map(x=>x.tile),numbers:sequence.map(x=>x.number)}));
 return [...mixed,...ordinary,...doubles];
}
function localOptions(s,priority){
 const p=s.currentPlayer;
 let hand=copyHand(s.hands[p]),stock=copyHand(s.stock),actions=localActions(s,hand,priority);
 if(actions.length)return{phase:'play',hand,stock,actions,drawn:false};
 if(stock.length){
  hand.push(stock[0]);stock=stock.slice(1);
  actions=localActions(s,hand,priority);
  if(actions.length)return{phase:'play',hand,stock,actions,drawn:true};
 }
 return{phase:'pass',hand,stock,actions:[],drawn:hand.length!==s.hands[p].length};
}
function removeOnce(hand,tile){
 const key=e.tileKey(tile),i=hand.findIndex(t=>e.tileKey(t)===key);
 check(i>=0,'played tile absent');
 return hand.filter((_,j)=>j!==i);
}
function localStep(s,policy,priority,ctx){
 const p=s.currentPlayer,opts=localOptions(s,priority);
 let played=[],finishDoubles=[],action=null,passed=opts.phase==='pass';
 let hand=opts.hand;
 s.stock=opts.stock;
 if(!passed){
  action=strat.chooseBy(policy,opts,{...ctx,turns:s.turns,player:p});
  check(opts.actions.includes(action),'policy selected illegal action');
  if(action.type==='single'||action.type==='mixed-finish'){
   s.branchState=e.applySinglePlacement(s.branchState,action);
   hand=removeOnce(hand,action.tile);played.push(action.tile);
  }
  if(action.sequence){
   for(const entry of action.sequence){
    check(!s.usedNumbers.has(entry.number),'duplicate opening');
    check(e.sidesEndingIn(s.branchState,entry.number).includes(entry.side),'illegal local double side');
    s.usedNumbers.add(entry.number);s.openBySide[entry.side].add(entry.number);
    hand=removeOnce(hand,entry.tile);played.push(entry.tile);finishDoubles.push(entry.tile);
   }
  }
 }
 s.hands[p]=hand;
 s.consecutivePasses=passed?s.consecutivePasses+1:0;
 s.turns++;
 if(!passed&&hand.length===0){
  s.outcome={kind:'finish',playerIndex:p,minus:e.finishMinus(finishDoubles),remainders:s.hands.map(e.pipSum)};
 }else if(!s.stock.length&&s.consecutivePasses>=3){
  s.outcome={kind:'block',playerIndex:null,minus:0,remainders:s.hands.map(e.pipSum)};
 }else s.currentPlayer=(p+1)%3;
 return {passed,action,played};
}
function localRound(base,policies,priority,ctx){
 const s=localInit(base),initialCount=s.hands.reduce((n,h)=>n+h.length,0)+s.stock.length;
 let steps=0;
 while(!s.outcome&&s.turns<200){
  const before=s.hands.reduce((n,h)=>n+h.length,0)+s.stock.length;
  const tr=localStep(s,policies[s.currentPlayer],priority,ctx);
  const after=s.hands.reduce((n,h)=>n+h.length,0)+s.stock.length;
  check(after===before-tr.played.length,'tile conservation');
  steps++;
 }
 if(!s.outcome)s.outcome={kind:'unresolved',reason:'turn-limit'};
 check(initialCount>=0&&initialCount<=28,'initial tile count');
 return s;
}
function median(a){const b=[...a].sort((x,y)=>x-y);return b.length%2?b[(b.length-1)/2]:(b[b.length/2-1]+b[b.length/2])/2;}
function makeStats(){return{rounds:0,finishes:0,blocks:0,unresolved:0,turns:0,minus:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0},
 byPolicy:{},meanTurns:null,blockRate:null};}
function record(z,out,policies,base){
 z.rounds++;z.turns+=out.turns;
 if(out.outcome.kind==='finish'){z.finishes++;z.minus[String(out.outcome.minus)]++;}
 else if(out.outcome.kind==='block')z.blocks++;else z.unresolved++;
 for(let seat=0;seat<3;seat++){
  const name=policies[seat],m=z.byPolicy[name]||(z.byPolicy[name]={appearances:0,firstFinish:0,pips:[],startDoubles:0,endDoubles:0});
  m.appearances++;m.firstFinish+=+(out.outcome.kind==='finish'&&out.outcome.playerIndex===seat);
  m.pips.push(e.pipSum(out.hands[seat]));
  m.startDoubles+=base.hands[seat].filter(t=>t[0]===t[1]).length;
  m.endDoubles+=out.hands[seat].filter(t=>t[0]===t[1]).length;
 }
}
function finalize(z){
 z.meanTurns=z.turns/z.rounds;z.blockRate=z.blocks/z.rounds;
 for(const m of Object.values(z.byPolicy)){
  m.finishFirstRate=m.firstFinish/m.appearances;m.meanFinalPips=m.pips.reduce((a,b)=>a+b,0)/m.pips.length;
  m.medianFinalPips=median(m.pips);m.meanStartingDoubles=m.startDoubles/m.appearances;
  m.meanEndingDoubles=m.endDoubles/m.appearances;delete m.pips;
 }
 return z;
}
function paired(){return{rounds:0,kindChanged:0,finishWinnerChanged:0,globalFinishLocalBlock:0,globalBlockLocalFinish:0,turnDelta:0,pipDelta:0};}
function pair(z,global,local){
 z.rounds++;if(global.outcome.kind!==local.outcome.kind)z.kindChanged++;
 if(global.outcome.kind==='finish'&&local.outcome.kind==='finish'&&global.outcome.playerIndex!==local.outcome.playerIndex)z.finishWinnerChanged++;
 if(global.outcome.kind==='finish'&&local.outcome.kind==='block')z.globalFinishLocalBlock++;
 if(global.outcome.kind==='block'&&local.outcome.kind==='finish')z.globalBlockLocalFinish++;
 z.turnDelta+=local.turns-global.turns;
 z.pipDelta+=local.hands.reduce((sum,h,i)=>sum+e.pipSum(h)-e.pipSum(global.hands[i]),0)/3;
}
function run(startSeed=1600540,deals=800){
 check(Number.isInteger(startSeed)&&Number.isInteger(deals)&&deals>0&&deals<=5000,'seed/count');
 const out={schema:'qosha-branch-side-full-round/v1',
 timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',
 engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0; BOTH global and side-local opening are PROVISIONAL',
 startSeed,endSeed:startSeed+deals-1,deals,seatRotations:3,mixes:MIXES,
 models:{global:makeStats(),localFirst:makeStats(),localLast:makeStats()},
 paired:{localFirst:paired(),localLast:paired(),firstVsLast:paired()},
 assumptions:[
 'Only double-opening semantics change: global unlocks a number on all matching sides; local unlocks that number on exactly one matching side.',
 'Local first/last select the first/last matching side in up,left,right,down order; bots do not choose a side for doubles.',
 'Initial 1-1 unlocks all four sides in every model. Non-double placements change only the chosen side end.',
 'Identical initial 3x9 deals, opening followup, policies, seat rotations, seeds and turn cap; trajectories diverge after differing openings.',
 'Block outcome has no assigned winner; compare only first FINISHER, not first-place or 101-match winner.',
 'Random-legal selects an index in the available legal action list; differing lists may alter choices.',
 'The branch rule, block winner/ties, loneZero and 101 scoring are not authenticated; no human tactical claim.'
 ]};
 for(let seed=startSeed;seed<startSeed+deals;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  check(base.kind==='ready','initializer '+seed);
  for(let mix=0;mix<2;mix++)for(let rotation=0;rotation<3;rotation++){
   const policies=[0,1,2].map(seat=>MIXES[mix][(seat+rotation)%3]);
   const ctx={seed,rotation,salt:mix+1};
   const global=r.runRound(base,(opts,s)=>strat.chooseBy(policies[s.currentPlayer],opts,{...ctx,turns:s.turns,player:s.currentPlayer}),{maxTurns:200});
   const first=localRound(base,policies,'first',ctx);
   const last=localRound(base,policies,'last',ctx);
   record(out.models.global,global,policies,base);
   record(out.models.localFirst,first,policies,base);
   record(out.models.localLast,last,policies,base);
   pair(out.paired.localFirst,global,first);
   pair(out.paired.localLast,global,last);
   pair(out.paired.firstVsLast,first,last);
  }
 }
 for(const m of Object.values(out.models))finalize(m);
 for(const p of Object.values(out.paired)){p.meanTurnDelta=p.turnDelta/p.rounds;p.meanPipDelta=p.pipDelta/p.rounds;delete p.turnDelta;delete p.pipDelta;}
 return out;
}
function test(){
 let b=e.createBranchState([1,1]);b=e.applySinglePlacement(b,{side:'up',tile:[1,5],to:5});
 b=e.applySinglePlacement(b,{side:'left',tile:[1,5],to:5});
 const base={branchState:b,hands:[[[5,5]],[[5,6]],[[0,0]]],stock:[],currentPlayer:0,turns:1,consecutivePasses:0};
 const a=localInit(base),c=localInit(base);
 const f=localActions(a,a.hands[0],'first').find(x=>x.type==='double-sequence');
 const l=localActions(c,c.hands[0],'last').find(x=>x.type==='double-sequence');
 check(f.sequence[0].side==='up'&&l.sequence[0].side==='left','side priority');
 localStep(a,'fast-doubles','first',{seed:1,rotation:0});
 localStep(c,'fast-doubles','last',{seed:1,rotation:0});
 check(localActions(a,[[5,6]],'first').length===1,'first-side unlock');
 check(localActions(c,[[5,6]],'last').length===1,'last-side unlock');
 check(a.openBySide.up.has(5)&&!a.openBySide.left.has(5),'no global leak');
 check(!c.openBySide.up.has(5)&&c.openBySide.left.has(5),'other side opens');
 check(e.finishMinus([[0,0],[1,1],[2,2],[3,3]])===-40,'minus 40');
 check(e.applyScoreDelta(5,-10)===0,'score floor');
 const x=run(1600540,6),y=run(1600540,6);
 delete x.timestampAsiaBaku;delete y.timestampAsiaBaku;
 check(JSON.stringify(x)===JSON.stringify(y),'deterministic replay');
 check(x.models.global.rounds===36&&x.models.localFirst.rounds===36&&x.models.localLast.rounds===36,'pilot rounds');
 check(!x.models.global.unresolved&&!x.models.localFirst.unresolved&&!x.models.localLast.unresolved,'pilot resolved');
 return{passed:true,pilotDeals:6,pilotRoundsAcrossModels:108,fixture:'two 5-ends; first unlocks up, last unlocks left',globalRounds:36};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1600540),+(a[1]||800)),null,2));}
module.exports={test,run,localInit,localActions,localStep,localRound,MIXES};
