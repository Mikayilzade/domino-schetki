'use strict';
// Independent matched-K mobility audit. Run: node qosha-research/simulator/matched-k-mobility.js 3610000 3620000
const e=require('./engine'),d=require('./turn-dispatcher'),i=require('./initializer'),r=require('./round-driver');
const choose=require('./strategy-runner').chooseBy;
const {playableKeys}=require('./exact-playable-audit');
function run(start=3610000,end=3620000){
 const out={engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',start,end,
  scanned:0,matchedKPositions:0,matchedKPairs:0,exactSetPairs:0,
  legalCountsDifferent:0,singleMore:0,doubleMore:0,legalCountsEqual:0,
  passFlips:0,bothPlayable:0,bothPass:0,sumSingleLegal:0,sumDoubleLegal:0,
  sumSharedPlayable:0,sumK:0,byPhase:{early:0,mid:0,late:0}};
 for(let seed=start;seed<end;seed++){
  out.scanned++;
  let s=i.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;
  let passed=!!s.openingPassed;
  while(!s.outcome&&s.turns<25){
   if(s.consecutivePasses)passed=true;
   if(s.turns>=4&&!passed){
    const o=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
    const next=(s.currentPlayer+1)%3;
    if(o.phase==='play'){
     const pool=s.hands.flatMap((h,p)=>p===s.currentPlayer?[]:h).concat(s.stock),rows=[];
     for(const action of o.actions){
      if(action.type!=='single'&&!(action.type==='double-sequence'&&action.tiles.length===1))continue;
      const t=d.applyTurn(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock,action);
      if(!t.hand.length)continue;
      const reply=d.turnOptions(t.branchState,t.openingState,s.hands[next],t.stock);
      rows.push({action,pips:e.pipSum(action.tiles||[action.tile]),n:t.hand.length,
       dc:t.hand.filter(x=>x[0]===x[1]).length,keys:playableKeys(t,pool),
       legal:reply.actions.length,play:reply.phase==='play'});
     }
     let matched=false;
     for(let a=0;a<rows.length;a++)for(let b=a+1;b<rows.length;b++){
      let x=rows[a],y=rows[b];
      if(x.action.type===y.action.type||x.pips!==y.pips||x.n!==y.n||
         x.dc===y.dc||x.keys.length!==y.keys.length)continue;
      if(x.action.type!=='single'){const tmp=x;x=y;y=tmp;}
      matched=true;out.matchedKPairs++;
      out.byPhase[s.turns<=7?'early':s.turns<=14?'mid':'late']++;
      if(x.keys.join(',')===y.keys.join(','))out.exactSetPairs++;
      const shared=x.keys.filter(k=>y.keys.includes(k)).length;
      out.sumSharedPlayable+=shared;out.sumK+=x.keys.length;
      out.sumSingleLegal+=x.legal;out.sumDoubleLegal+=y.legal;
      if(x.legal===y.legal)out.legalCountsEqual++;
      else {out.legalCountsDifferent++;if(x.legal>y.legal)out.singleMore++;else out.doubleMore++;}
      if(x.play!==y.play)out.passFlips++;else if(x.play)out.bothPlayable++;else out.bothPass++;
     }
     if(matched)out.matchedKPositions++;
    }
   }
   s=r.stepRound(s,(opts,st)=>choose('closed-branch-control',opts,{seed,turns:st.turns,player:st.currentPlayer}));
  }
 }
 out.meanLegalActions=out.matchedKPairs?[out.sumSingleLegal/out.matchedKPairs,out.sumDoubleLegal/out.matchedKPairs]:null;
 out.meanPlayableOverlap=out.sumK?out.sumSharedPlayable/out.sumK:null;
 return out;
}
function test(){
 const a=run(3603084,3603085);
 if(a.exactSetPairs!==2||a.matchedKPairs!==2||a.matchedKPairs!==a.legalCountsDifferent+a.legalCountsEqual||
    a.matchedKPairs!==a.passFlips+a.bothPlayable+a.bothPass)throw Error('fixture or partition failed');
 return {passed:true,seed:3603084};
}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():run(Number(process.argv[2]||3610000),Number(process.argv[3]||3620000)),null,2));
module.exports={run,test};
