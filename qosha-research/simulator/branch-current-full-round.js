'use strict';
// PROVISIONAL matched full-round test: a played double unlocks its number on
// every side ending in that number NOW, but not on sides reaching it later.
// Compare with global-ever-open and one-side-only models; no real-rule claim.
const e=require('./engine'),r=require('./round-driver'),init=require('./initializer');
const strat=require('./strategy-runner'),side=require('./branch-side-full-round');
const MIXES=side.MIXES;
function check(x,m){if(!x)throw Error('branch-current-full-round: '+m);}
function clone(h){return h.map(t=>[...t]);}
function remove(hand,tile){const key=e.tileKey(tile),i=hand.findIndex(t=>e.tileKey(t)===key);check(i>=0,'missing tile');return hand.filter((_,j)=>j!==i);}
function currentInit(base){const s=side.localInit(base);s.counters={multiSideOpenings:0,openedSides:0,futureLockedTransitions:0,passesWithGlobalOption:0};return s;}
function sequences(s,hand){
 const out=[];
 function walk(remaining,used,prefix){
  if(prefix.length)out.push(prefix);
  for(let i=0;i<remaining.length;i++){
   const tile=remaining[i],n=tile[0];
   if(n!==tile[1]||used.has(n))continue;
   const sides=e.sidesEndingIn(s.branchState,n);
   if(!sides.length)continue;
   const next=new Set(used);next.add(n);
   walk(remaining.filter((_,j)=>i!==j),next,[...prefix,{tile,number:n,sides}]);
  }
 }
 walk(hand,s.usedNumbers,[]);
 return out;
}
function singles(s,hand){
 const out=[];
 hand.forEach((tile,handIndex)=>{
  if(tile[0]===tile[1])return;
  for(const p of e.legalSinglePlacements(s.branchState,tile))
   if(s.openBySide[p.side].has(p.from))out.push({type:'single',handIndex,...p});
 });
 return out;
}
function actions(s,hand){
 const ss=singles(s,hand),mixed=[];
 for(const single of ss){
  const rem=hand.filter((_,i)=>i!==single.handIndex);
  if(!rem.length||!rem.every(t=>t[0]===t[1]))continue;
  const shifted={...s,branchState:e.applySinglePlacement(s.branchState,single)};
  for(const seq of sequences(shifted,rem))
   if(seq.length===rem.length)mixed.push({...single,type:'mixed-finish',sequence:seq,
    tiles:[single.tile,...seq.map(x=>x.tile)],numbers:seq.map(x=>x.number),
    finishDoubles:seq.map(x=>x.tile)});
 }
 const mixKeys=new Set(mixed.map(a=>a.handIndex+':'+a.side+':'+a.to));
 const ordinary=ss.filter(a=>!mixKeys.has(a.handIndex+':'+a.side+':'+a.to));
 let seqs=sequences(s,hand);
 if(hand.length&&hand.every(t=>t[0]===t[1])){
  const full=seqs.filter(seq=>seq.length===hand.length);
  if(full.length)seqs=full;
 }
 return [...mixed,...ordinary,...seqs.map(sequence=>({type:'double-sequence',
  sequence,tiles:sequence.map(x=>x.tile),numbers:sequence.map(x=>x.number)}))];
}
function options(s){
 const p=s.currentPlayer;
 let hand=clone(s.hands[p]),stock=clone(s.stock),a=actions(s,hand),drawn=false;
 if(a.length)return{phase:'play',hand,stock,actions:a,drawn};
 if(stock.length){
  hand.push(stock[0]);stock=stock.slice(1);drawn=true;
  a=actions(s,hand);
  if(a.length)return{phase:'play',hand,stock,actions:a,drawn};
 }
 return{phase:'pass',hand,stock,actions:[],drawn};
}
function currentStep(s,policy,ctx){
 const p=s.currentPlayer,opts=options(s);
 let hand=opts.hand,played=[],finishDoubles=[],action=null;
 const passed=opts.phase==='pass';
 s.stock=opts.stock;
 if(!passed){
  action=strat.chooseBy(policy,opts,{...ctx,turns:s.turns,player:p});
  check(opts.actions.includes(action),'illegal policy choice');
  if(action.type==='single'||action.type==='mixed-finish'){
   s.branchState=e.applySinglePlacement(s.branchState,action);
   if(s.usedNumbers.has(action.to)&&!s.openBySide[action.side].has(action.to))
    s.counters.futureLockedTransitions++;
   hand=remove(hand,action.tile);played.push(action.tile);
  }
  if(action.sequence)for(const entry of action.sequence){
   const matching=e.sidesEndingIn(s.branchState,entry.number);
   check(!s.usedNumbers.has(entry.number),'double repeated');
   check(matching.length===entry.sides.length&&matching.every(x=>entry.sides.includes(x)),
    'double sides differ from current ends');
   s.usedNumbers.add(entry.number);
   for(const sideName of matching)s.openBySide[sideName].add(entry.number);
   s.counters.openedSides+=matching.length;
   if(matching.length>1)s.counters.multiSideOpenings++;
   hand=remove(hand,entry.tile);played.push(entry.tile);finishDoubles.push(entry.tile);
  }
 }else{
  const globalSingles=e.legalSinglesForHand(s.branchState,hand).some(a=>
   a.tile[0]!==a.tile[1]&&s.usedNumbers.has(a.from));
  if(globalSingles)s.counters.passesWithGlobalOption++;
 }
 s.hands[p]=hand;s.consecutivePasses=passed?s.consecutivePasses+1:0;s.turns++;
 if(!passed&&hand.length===0)
  s.outcome={kind:'finish',playerIndex:p,minus:e.finishMinus(finishDoubles),remainders:s.hands.map(e.pipSum)};
 else if(!s.stock.length&&s.consecutivePasses>=3)
  s.outcome={kind:'block',playerIndex:null,minus:0,remainders:s.hands.map(e.pipSum)};
 else s.currentPlayer=(p+1)%3;
 return{passed,action,played};
}
function currentRound(base,policies,ctx){
 const s=currentInit(base);
 while(!s.outcome&&s.turns<200){
  const before=s.hands.reduce((n,h)=>n+h.length,0)+s.stock.length;
  const tr=currentStep(s,policies[s.currentPlayer],ctx);
  const remaining=s.hands.flat().concat(s.stock);
  check(remaining.length===before-tr.played.length,'conservation');
  check(new Set(remaining.map(e.tileKey)).size===remaining.length,'duplicate remaining tile');
 }
 if(!s.outcome)s.outcome={kind:'unresolved',reason:'turn-limit'};
 return s;
}
function median(a){const b=[...a].sort((x,y)=>x-y),n=b.length;return n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2;}
function stats(){return{rounds:0,finishes:0,blocks:0,blockTies:0,unresolved:0,turns:0,
 minus:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0},byPolicy:{},
 counters:{multiSideOpenings:0,openedSides:0,futureLockedTransitions:0,passesWithGlobalOption:0}};}
function record(z,s,policies,base){
 z.rounds++;z.turns+=s.turns;
 if(s.outcome.kind==='finish'){z.finishes++;z.minus[String(s.outcome.minus)]++;}
 else if(s.outcome.kind==='block'){
  z.blocks++;
  const m=Math.min(...s.outcome.remainders);
  if(s.outcome.remainders.filter(x=>x===m).length>1)z.blockTies++;
 }else z.unresolved++;
 if(s.counters)for(const k of Object.keys(z.counters))z.counters[k]+=s.counters[k];
 for(let p=0;p<3;p++){
  const name=policies[p],m=z.byPolicy[name]||(z.byPolicy[name]={appearances:0,firstFinish:0,pips:[],startDoubles:0,endDoubles:0});
  m.appearances++;
  if(s.outcome.kind==='finish'&&s.outcome.playerIndex===p)m.firstFinish++;
  m.pips.push(e.pipSum(s.hands[p]));
  m.startDoubles+=base.hands[p].filter(t=>t[0]===t[1]).length;
  m.endDoubles+=s.hands[p].filter(t=>t[0]===t[1]).length;
 }
}
function finalize(z){
 z.meanTurns=z.turns/z.rounds;z.blockRate=z.blocks/z.rounds;
 for(const m of Object.values(z.byPolicy)){
  m.firstFinishRate=m.firstFinish/m.appearances;
  m.meanRemainingPips=m.pips.reduce((a,b)=>a+b,0)/m.pips.length;
  m.medianRemainingPips=median(m.pips);
  m.meanStartingDoubles=m.startDoubles/m.appearances;
  m.meanEndingDoubles=m.endDoubles/m.appearances;
  delete m.pips;
 }
 return z;
}
function paired(){return{rounds:0,kindChanged:0,globalFinishAlternativeBlock:0,
 globalBlockAlternativeFinish:0,bothFinishedDifferentWinner:0,turnDelta:0,pipDelta:0};}
function pair(z,a,b){
 z.rounds++;
 if(a.outcome.kind!==b.outcome.kind)z.kindChanged++;
 if(a.outcome.kind==='finish'&&b.outcome.kind==='block')z.globalFinishAlternativeBlock++;
 if(a.outcome.kind==='block'&&b.outcome.kind==='finish')z.globalBlockAlternativeFinish++;
 if(a.outcome.kind==='finish'&&b.outcome.kind==='finish'&&a.outcome.playerIndex!==b.outcome.playerIndex)
  z.bothFinishedDifferentWinner++;
 z.turnDelta+=b.turns-a.turns;
 z.pipDelta+=b.hands.reduce((sum,h,p)=>sum+e.pipSum(h)-e.pipSum(a.hands[p]),0)/3;
}
function run(startSeed=1601340,deals=800){
 check(Number.isInteger(startSeed)&&Number.isInteger(deals)&&deals>0&&deals<=5000,'seed/count');
 const out={schema:'qosha-branch-current-full-round/v1',
 timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',
 engine:'qosa-research-0.5.3+branch-current-counterfactual',rules:'recovered qosa-1.0.0; all branch opening models PROVISIONAL',
 startSeed,endSeed:startSeed+deals-1,deals,seatRotations:3,mixes:MIXES,
 models:{global:stats(),currentAll:stats(),localFirst:stats(),localLast:stats()},
 paired:{globalVsCurrent:paired(),globalVsFirst:paired(),globalVsLast:paired(),currentVsFirst:paired()},
 assumptions:[
 'Global model unlocks a played double number on all sides, including sides reaching that number later.',
 'Current-all model unlocks the number on EVERY side whose end matches the double AT PLAY TIME, never on other sides arriving at that number later.',
 'Current-all per-side number unlock persists if that side later leaves and returns to the same number; no second copy of the double exists.',
 'One-side-only first/last models select one currently matching side by up,left,right,down order.',
 'Initial 1-1 opens all four sides in every model; non-double placement changes only its side end.',
 'Same initial hands, opening followup, deterministic policies, seeds and seat rotations; later paths can diverge.',
 'Block winner/ties are counted but NOT resolved as first place; 101 match scoring and authentic opening rule are not verified.',
 'Random-legal action indices can differ across models; this is not a pure causal intervention on subsequent moves.'
 ]};
 for(let seed=startSeed;seed<startSeed+deals;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  check(base.kind==='ready','initializer '+seed);
  for(let mix=0;mix<2;mix++)for(let rotation=0;rotation<3;rotation++){
   const policies=[0,1,2].map(seat=>MIXES[mix][(seat+rotation)%3]);
   const ctx={seed,rotation,salt:mix+1};
   const global=r.runRound(base,(opts,s)=>strat.chooseBy(policies[s.currentPlayer],opts,{...ctx,turns:s.turns,player:s.currentPlayer}),{maxTurns:200});
   const current=currentRound(base,policies,ctx);
   const first=side.localRound(base,policies,'first',ctx);
   const last=side.localRound(base,policies,'last',ctx);
   record(out.models.global,global,policies,base);
   record(out.models.currentAll,current,policies,base);
   record(out.models.localFirst,first,policies,base);
   record(out.models.localLast,last,policies,base);
   pair(out.paired.globalVsCurrent,global,current);
   pair(out.paired.globalVsFirst,global,first);
   pair(out.paired.globalVsLast,global,last);
   pair(out.paired.currentVsFirst,current,first);
  }
 }
 for(const m of Object.values(out.models))finalize(m);
 for(const p of Object.values(out.paired)){
  p.meanTurnDelta=p.turnDelta/p.rounds;p.meanPipDelta=p.pipDelta/p.rounds;
  delete p.turnDelta;delete p.pipDelta;
 }
 return out;
}
function test(){
 let b=e.createBranchState([1,1]);
 b=e.applySinglePlacement(b,{side:'up',tile:[1,5],to:5});
 b=e.applySinglePlacement(b,{side:'left',tile:[1,5],to:5});
 const base={branchState:b,hands:[[[5,5]],[[5,6]],[[0,0]]],stock:[],currentPlayer:0,turns:1,consecutivePasses:0};
 const s=currentInit(base);
 const a=actions(s,s.hands[0]);check(a.length===1&&a[0].sequence[0].sides.join(',')==='up,left','two current ends');
 currentStep(s,'fast-doubles',{seed:1,rotation:0});
 check(s.openBySide.up.has(5)&&s.openBySide.left.has(5),'all current ends opened');
 check(!s.openBySide.right.has(5),'future side not opened');
 s.branchState=e.applySinglePlacement(s.branchState,{side:'right',tile:[1,5],to:5});
 check(!singles(s,[[5,6]]).some(x=>x.side==='right'),'late-arriving side locked');
 check(singles(s,[[5,6]]).some(x=>x.side==='up'),'already opened side legal');
 s.branchState=e.applySinglePlacement(s.branchState,{side:'up',tile:[5,6],to:6});
 s.branchState=e.applySinglePlacement(s.branchState,{side:'up',tile:[5,6],to:5});
 check(singles(s,[[5,6]]).some(x=>x.side==='up'),'side-local unlock persists');
 let four=e.createBranchState([1,1]);
 for(const [sideName,n] of [['up',2],['left',3],['right',4],['down',5]])
  four=e.applySinglePlacement(four,{side:sideName,tile:[1,n],to:n});
 const f=currentInit({branchState:four,hands:[[[2,2],[3,3],[4,4],[5,5]],[],[]],stock:[],currentPlayer:0,turns:1,consecutivePasses:0});
 check(sequences(f,f.hands[0]).filter(x=>x.length===4).length===24,'24 full four-double orders');
 currentStep(f,'fast-doubles',{seed:1,rotation:0});
 check(f.outcome.kind==='finish'&&f.outcome.minus===-40,'four-double minus');
 let mixed=e.createBranchState([1,1]);
 mixed=e.applySinglePlacement(mixed,{side:'left',tile:[1,2],to:2});
 const m=currentInit({branchState:mixed,hands:[[[1,5],[5,5],[2,2]],[],[]],stock:[],currentPlayer:0,turns:1,consecutivePasses:0});
 check(actions(m,m.hands[0]).some(x=>x.type==='mixed-finish'&&x.finishDoubles.length===2),'mixed-finish legal');
 currentStep(m,'fast-doubles',{seed:1,rotation:0});
 check(m.outcome.kind==='finish'&&m.outcome.minus===-20,'mixed-finish minus');
 check(e.applyScoreDelta(5,-10)===0,'score floor');
 const x=run(1601340,5),y=run(1601340,5);
 delete x.timestampAsiaBaku;delete y.timestampAsiaBaku;
 check(JSON.stringify(x)===JSON.stringify(y),'deterministic replay');
 check(Object.values(x.models).every(z=>z.rounds===30&&z.unresolved===0),'pilot 120 complete rounds');
 return{passed:true,pilotDeals:5,pilotModelRounds:120,fixtures:['all currently matching ends','future side stays locked','side unlock persistence','four-double -40','mixed finish -20','score floor','conservation','replay']};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1601340),+(a[1]||800)),null,2));
}
module.exports={test,run,currentInit,sequences,singles,actions,currentStep,currentRound};