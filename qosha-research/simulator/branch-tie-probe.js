'use strict';
// Synthetic rule-discriminator and block-tie audit. All four models PROVISIONAL.
// node qosha-research/simulator/branch-tie-probe.js test
// node qosha-research/simulator/branch-tie-probe.js 1602140 800
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),init=require('./initializer');
const strat=require('./strategy-runner'),side=require('./branch-side-full-round'),current=require('./branch-current-full-round');
const NAMES=['global','currentAll','localFirst','localLast'];
const check=(v,m)=>{if(!v)throw Error('branch-tie-probe: '+m);};
const median=a=>{const s=[...a].sort((x,y)=>x-y);return s.length%2?s[(s.length-1)/2]:(s[s.length/2-1]+s[s.length/2])/2;};
function candidates(pips){
 check(pips.length===3&&pips.every(x=>Number.isInteger(x)&&x>=0),'invalid pips');
 const min=Math.min(...pips);return{min,players:pips.flatMap((x,i)=>x===min?[i]:[])};
}
function lateArrivalProbe(){
 let b=e.createBranchState([1,1]),opened=e.createOpeningState([1]);
 const bySide=Object.fromEntries(e.SIDES.map(s=>[s,new Set([1])])),used=new Set([1]);
 const history=[{tile:[1,1],type:'centre'}];
 function single(tile,sideName){
  const p=e.legalSinglePlacements(b,tile).find(x=>x.side===sideName);
  check(p&&d.openedSinglePlacements(b,opened,tile).some(x=>x.side===sideName)&&bySide[sideName].has(p.from),'shared legal prefix');
  b=e.applySinglePlacement(b,p);history.push({tile,type:'single',side:sideName,from:p.from,to:p.to});
 }
 function double(n){
  const matching=e.sidesEndingIn(b,n);
  check(matching.length&&!used.has(n),'double placement');
  check(d.actionsForHand(b,opened,[[n,n]]).some(x=>x.type==='double-sequence'),'global double');
  check(current.sequences({branchState:b,usedNumbers:used},[[n,n]]).length>0,'current double');
  used.add(n);opened=e.openNumber(opened,n);
  for(const s of matching)bySide[s].add(n);
  history.push({tile:[n,n],type:'double',matchingSides:matching});
 }
 single([1,5],'up');single([1,3],'left');double(3);double(5);single([3,5],'left');
 const candidate=[5,6],sideName='left';
 const global=d.openedSinglePlacements(b,opened,candidate).some(x=>x.side===sideName);
 const currentOnly=e.legalSinglePlacements(b,candidate).some(x=>x.side===sideName&&bySide[sideName].has(x.from));
 check(global&&!currentOnly,'models must disagree on late arrival');
 check(bySide.up.has(5)&&d.openedSinglePlacements(b,opened,candidate).some(x=>x.side==='up'),'control up');
 return{authentic:false,history,candidate:{tile:candidate,side:sideName},question:'After 5-5 on up, left later reaches 5. Is left 5-6 legal?',globalEverOpen:global,allCurrentOnly:currentOnly,control:'up 5-6 legal in both'};
}
function blank(){return{rounds:0,finishes:0,blocks:0,ties2:0,ties3:0,uniqueMinimum:0,zeroMinimumTies:0,turns:0,minus:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0},policies:{}};}
function record(z,s,policies,base){
 z.rounds++;z.turns+=s.turns;
 if(s.outcome.kind==='finish'){z.finishes++;z.minus[String(s.outcome.minus)]++;}
 else if(s.outcome.kind==='block'){
  z.blocks++;const x=candidates(s.outcome.remainders);
  if(x.players.length===1)z.uniqueMinimum++;
  if(x.players.length===2)z.ties2++;
  if(x.players.length===3)z.ties3++;
  if(x.min===0&&x.players.length>1)z.zeroMinimumTies++;
 }else throw Error('unresolved');
 for(let p=0;p<3;p++){
  const m=z.policies[policies[p]]||(z.policies[policies[p]]={appearances:0,firstFinishes:0,pips:[],startDoubles:0,endDoubles:0});
  m.appearances++;m.firstFinishes+=+(s.outcome.kind==='finish'&&s.outcome.playerIndex===p);
  m.pips.push(e.pipSum(s.hands[p]));
  m.startDoubles+=base.hands[p].filter(t=>t[0]===t[1]).length;
  m.endDoubles+=s.hands[p].filter(t=>t[0]===t[1]).length;
 }
}
function run(startSeed=1602140,deals=800){
 check(Number.isInteger(startSeed)&&Number.isInteger(deals)&&deals>0&&deals<=5000,'seed/count');
 const out={schema:'qosha-branch-tie-probe/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',
 engine:'qosa-research-0.5.3+tie-probe',rules:'recovered qosa-1.0.0; all branch models PROVISIONAL',startSeed,endSeed:startSeed+deals-1,deals,
 mixes:side.MIXES,seatRotations:3,models:Object.fromEntries(NAMES.map(n=>[n,blank()])),paired:{bothBlocked:0,bothTied:0,globalUniqueCurrentTied:0,globalTiedCurrentUnique:0},
 probe:lateArrivalProbe(),assumptions:['Same 3x9 deals, policies and rotations across models; subsequent trajectories may diverge','Blocked minimum is NOT an authenticated winner','No real move-by-move trace; archived fixture contains initial hands only','101 match scoring, loneZero and authentic branch rule unresolved']};
 for(let seed=startSeed;seed<startSeed+deals;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  check(base.kind==='ready','initializer');
  for(let mix=0;mix<2;mix++)for(let rotation=0;rotation<3;rotation++){
   const policies=[0,1,2].map(p=>side.MIXES[mix][(p+rotation)%3]),ctx={seed,rotation,salt:mix+1};
   const global=r.runRound(base,(opts,s)=>strat.chooseBy(policies[s.currentPlayer],opts,{...ctx,turns:s.turns,player:s.currentPlayer}),{maxTurns:200});
   const curr=current.currentRound(base,policies,ctx);
   const results={global,currentAll:curr,localFirst:side.localRound(base,policies,'first',ctx),localLast:side.localRound(base,policies,'last',ctx)};
   for(const n of NAMES)record(out.models[n],results[n],policies,base);
   if(global.outcome.kind==='block'&&curr.outcome.kind==='block'){
    out.paired.bothBlocked++;
    const a=candidates(global.outcome.remainders).players.length,b=candidates(curr.outcome.remainders).players.length;
    out.paired.bothTied+=+(a>1&&b>1);
    out.paired.globalUniqueCurrentTied+=+(a===1&&b>1);
    out.paired.globalTiedCurrentUnique+=+(a>1&&b===1);
   }
  }
 }
 for(const z of Object.values(out.models)){
  z.meanTurns=z.turns/z.rounds;z.blockRate=z.blocks/z.rounds;z.tieRateAmongBlocks=z.blocks?(z.ties2+z.ties3)/z.blocks:0;
  for(const m of Object.values(z.policies)){
   m.firstFinishRate=m.firstFinishes/m.appearances;
   m.meanRemainingPips=m.pips.reduce((a,b)=>a+b,0)/m.pips.length;m.medianRemainingPips=median(m.pips);
   m.meanStartingDoubles=m.startDoubles/m.appearances;m.meanEndingDoubles=m.endDoubles/m.appearances;delete m.pips;
  }
 }
 out.modelRounds=NAMES.reduce((sum,n)=>sum+out.models[n].rounds,0);
 out.nextHypothesis='Obtain an authentic late-side move and block-tie scoring convention before ranking tactics; otherwise test ambiguity-invariant hypotheses.';
 return out;
}
function test(){
 const p=lateArrivalProbe();check(p.history.length===6,'probe length');
 for(const [x,k] of [[[4,4,10],2],[[0,0,6],2],[[3,3,3],3],[[4,5,10],1]])check(candidates(x).players.length===k,'tie fixture');
 const a=run(1602140,4),b=run(1602140,4);delete a.timestampAsiaBaku;delete b.timestampAsiaBaku;
 check(JSON.stringify(a)===JSON.stringify(b)&&a.modelRounds===96,'replay');
 return{passed:true,fixtures:['late arrival','control branch','2-way tie','3-way tie','zero-pip tie','unique minimum','deterministic replay'],pilotDeals:4,pilotModelRounds:96};
}
if(require.main===module){
 const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1602140),+(a[1]||800)),null,2));
}
module.exports={run,test,lateArrivalProbe,candidates};
