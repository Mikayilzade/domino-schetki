'use strict';
// Reproduce: node qosha-research/simulator/public-pass-tournament.js test
//            node qosha-research/simulator/public-pass-tournament.js 1061000 1000
// Two matched three-player arms isolate the value of exact public next-pass probability.
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),init=require('./initializer');
const {chooseBy}=require('./strategy-runner'),{pass}=require('./joint-pass-exact');
const ARMS=[['public-next-pass','public-no-pass','closed-branch-control'],['public-next-pass','public-no-pass','min-hand-pips']];
const dk=t=>t[0]===t[1],ak=a=>[a.type,a.side||'',a.to??'',(a.numbers||[]).join(','),e.tileKey(a.tile||[0,0])].join(':');
function publicPlayed(s){const live=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));return new Set(e.createDoubleSixDeck().map(e.tileKey).filter(x=>!live.has(x)));}
function publicChoices(opts,s,played){
 const own=new Set(opts.hand.map(e.tileKey)),pool=e.createDoubleSixDeck().filter(t=>!played.has(e.tileKey(t))&&!own.has(e.tileKey(t)));
 const nextSize=s.hands[(s.currentPlayer+1)%3].length,n=pool.length;
 if(n!==s.hands[(s.currentPlayer+1)%3].length+s.hands[(s.currentPlayer+2)%3].length+opts.stock.length)throw Error('unknown-pool accounting');
 return opts.actions.map(a=>{
  const tr=d.applyTurn(s.branchState,s.openingState,opts.hand,opts.stock,a);
  const m=pool.filter(t=>d.actionsForHand(tr.branchState,tr.openingState,[t]).length).length;
  return{action:a,prob:pass(n,m,nextSize),finish:tr.hand.length===0?1:0,
   openings:a.type==='double-sequence'?(a.numbers||[]).length:0,
   pips:e.pipSum(a.tiles||[a.tile])};
 });
}
function choosePublic(rows,usePass){
 const a=[...rows].sort((x,y)=>y.finish-x.finish||(usePass?y.prob-x.prob:0)||
   x.openings-y.openings||y.pips-x.pips||ak(x.action).localeCompare(ak(y.action)));
 return a[0];
}
function med(xs){const a=[...xs].sort((x,y)=>x-y),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;}
function blank(){return{appearances:0,finishFirst:0,finalPips:[],minus:{'-10':0,'-20':0,'-30':0,'-40':0},
 actions:0,choices:0,openingActions:0,openingNumbers:0,passGapSum:0,passGapN:0,disagreeWithNoPass:0,
 startingDoubles:0,endingDoubles:0,byStartingDoubles:{},byOwnedDouble:Object.fromEntries([0,1,2,3,4,5,6].map(n=>[n,{appearances:0,finishFirst:0}]))};}
function tournament(start,count,names){
 const stats=Object.fromEntries(names.map(n=>[n,blank()]));let rounds=0,blocks=0,finishes=0,unresolved=0,turns=0;
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('initializer '+seed);
  const raw=e.dealThreeByNine(seed).hands;
  for(let rot=0;rot<3;rot++){
   const seats=[0,1,2].map(i=>names[(i+rot)%3]);let s=r.cloneRoundState(base);
   while(!s.outcome&&s.turns<200){
    const played=publicPlayed(s),p=s.currentPlayer,name=seats[p],m=stats[name];
    s=r.stepRound(s,(opts,st)=>{
     m.actions++;if(opts.actions.length>1)m.choices++;
     let a;
     if(name==='public-next-pass'||name==='public-no-pass'){
      const rows=publicChoices(opts,st,played),selected=choosePublic(rows,name==='public-next-pass');
      a=selected.action;
      if(opts.actions.length>1&&!selected.finish){
       m.passGapSum+=Math.max(...rows.map(x=>x.prob))-selected.prob;m.passGapN++;
       if(ak(selected.action)!==ak(choosePublic(rows,false).action))m.disagreeWithNoPass++;
      }
     }else a=chooseBy(name,opts,{seed,rotation:rot,turns:st.turns,player:p});
     if(a.type==='double-sequence'){m.openingActions++;m.openingNumbers+=(a.numbers||[]).length;}
     return a;
    });
    if(seed===start&&rot===0){const live=[...s.hands.flat(),...s.stock];if(live.length+publicPlayed(s).size!==28||new Set(live.map(e.tileKey)).size!==live.length)throw Error('tile conservation');}
   }
   rounds++;turns+=s.turns;
   if(s.outcome.kind==='finish'){finishes++;const m=stats[seats[s.outcome.playerIndex]];m.finishFirst++;if(s.outcome.minus<0)m.minus[String(s.outcome.minus)]++;}
   else if(s.outcome.kind==='block')blocks++;else unresolved++;
   for(let p=0;p<3;p++){
    const m=stats[seats[p]],startD=raw[p].filter(dk).length,endD=s.hands[p].filter(dk).length;
    m.appearances++;m.finalPips.push(e.pipSum(s.hands[p]));m.startingDoubles+=startD;m.endingDoubles+=endD;
    const cell=m.byStartingDoubles[startD]||(m.byStartingDoubles[startD]={appearances:0,finishFirst:0});
    cell.appearances++;if(s.outcome.kind==='finish'&&s.outcome.playerIndex===p)cell.finishFirst++;
    for(let n=0;n<=6;n++)if(raw[p].some(t=>t[0]===n&&t[1]===n)){
      const c=m.byOwnedDouble[n];c.appearances++;if(s.outcome.kind==='finish'&&s.outcome.playerIndex===p)c.finishFirst++;
    }
   }
  }
 }
 const byStrategy={};for(const name of names){const m=stats[name];byStrategy[name]={
  appearances:m.appearances,finishFirst:m.finishFirst,finishFirstRate:m.finishFirst/m.appearances,
  meanRemainder:m.finalPips.reduce((a,b)=>a+b,0)/m.finalPips.length,medianRemainder:med(m.finalPips),
  minus:m.minus,actions:m.actions,choices:m.choices,openingActions:m.openingActions,openingNumbers:m.openingNumbers,
  meanStartingDoubles:m.startingDoubles/m.appearances,meanEndingDoubles:m.endingDoubles/m.appearances,
  meanImmediatePassGap:m.passGapN?m.passGapSum/m.passGapN:null,passGapDecisions:m.passGapN,
  divergentFromNoPass:m.disagreeWithNoPass,byStartingDoubles:m.byStartingDoubles,byOwnedDouble:m.byOwnedDouble};}
 return{seedRange:[start,start+count-1],deals:count,rounds,finishes,blocks,unresolved,meanTurns:turns/rounds,strategies:names,byStrategy};
}
function run(start=1061000,count=1000){
 return{engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  discovery:'pre-registered pass-priority vs identical comparator without pass, both with immediate-finish and branch/pip tiebreakers',
  information:'only public played tiles, own hand, and opponent hand sizes; hidden tile identities not read by choice',
  assumptions:'uniform unknown distribution; prior opponent actions ignored; block winner unassigned; branch rules provisional',
  arms:ARMS.map(names=>tournament(start,count,names))};
}
function test(){
 const s=init.initializeThreePlayerRound({seed:1061000,isFirstRound:false,previousWinnerIndex:0});if(s.kind!=='ready')throw Error('initializer');
 const p=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
 if(opts.phase==='play'){
  const a=choosePublic(publicChoices(opts,s,publicPlayed(s)),true),copy=r.cloneRoundState(s),i=(p+1)%3,j=(p+2)%3;
  const t=copy.hands[i][0];copy.hands[i][0]=copy.hands[j][0];copy.hands[j][0]=t;
  const b=choosePublic(publicChoices(opts,copy,publicPlayed(copy)),true);
  if(ak(a.action)!==ak(b.action)||a.prob!==b.prob)throw Error('hidden-opponent-identity leakage');
 }
 const a=run(1061000,4),b=run(1061000,4);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.arms.some(x=>x.unresolved||x.rounds!==12))throw Error('deterministic replay');
 return{passed:true,arms:a.arms.length,rounds:a.arms.reduce((s,x)=>s+x.rounds,0)};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1061000),+(a[1]||1000)),null,2));}
module.exports={run,test,publicPlayed,publicChoices,choosePublic};