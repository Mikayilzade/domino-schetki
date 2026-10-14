'use strict';
// Exact playable-identity audit on reachable 3x9 positions without any prior passes.
// Reproduce: node qosha-research/simulator/exact-playable-audit.js 3600000 3610000
const e=require('./engine'),d=require('./turn-dispatcher'),init=require('./initializer');
const r=require('./round-driver'),{chooseBy}=require('./strategy-runner');
function playableKeys(t,pool){return pool.filter(x=>d.actionsForHand(t.branchState,t.openingState,[x]).length>0).map(e.tileKey).sort();}
function run(start=3600000,end=3610000){
 if(!Number.isInteger(start)||!Number.isInteger(end)||end<=start)throw Error('invalid seed range');
 const out={schema:'qosa-exact-playable-audit/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
 mode:'3x9',seedRange:[start,end],discoveryPolicy:'closed-branch-control',
 selection:'all legal single versus one-double-opening pairs with equal removed pip sum, remaining stone count, retained-double count different, and equal K; turn 4..24 with no previous passes',
 scanned:0,ready:0,matchedKPositions:0,matchedKPairs:0,exactSetPairs:0,exactSetPositions:0,
 matchedFullEnds:0,matchedOpenedNumbers:0,byPhase:{early:0,mid:0,late:0},examples:[],
 newFullStrategyRounds:0,verifiedPriorFullStrategyRounds:180000};
 for(let seed=start;seed<end;seed++){
  out.scanned++;
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;
  out.ready++;
  let sawPass=!!s.openingPassed;
  while(!s.outcome&&s.turns<25){
   if(s.consecutivePasses>0)sawPass=true;
   if(s.turns>=4&&!sawPass){
    const opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
    if(opts.phase==='play'){
     const pool=s.hands.flatMap((h,i)=>i===s.currentPlayer?[]:h).concat(s.stock);
     const rows=[];
     for(const a of opts.actions){
      if(a.type!=='single'&&!(a.type==='double-sequence'&&a.tiles.length===1))continue;
      const t=d.applyTurn(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock,a);
      if(!t.hand.length)continue;
      rows.push({action:a,t,pips:e.pipSum(a.tiles||[a.tile]),n:t.hand.length,
       keys:playableKeys(t,pool),dc:t.hand.filter(x=>x[0]===x[1]).length,
       ends:e.SIDES.map(z=>t.branchState.branches[z].end).join(','),
       opened:[...t.openingState.openedNumbers].sort().join(',')});
     }
     let matched=false,exact=false;
     for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
      const a=rows[i],b=rows[j];
      if(a.action.type===b.action.type||a.pips!==b.pips||a.n!==b.n||a.dc===b.dc||a.keys.length!==b.keys.length)continue;
      out.matchedKPairs++;matched=true;
      if(a.ends===b.ends)out.matchedFullEnds++;
      if(a.opened===b.opened)out.matchedOpenedNumbers++;
      if(a.keys.join(',')===b.keys.join(',')){
       out.exactSetPairs++;exact=true;
       if(out.examples.length<12)out.examples.push({seed,turn:s.turns,hand:s.hands[s.currentPlayer],
        actions:[a.action.type+':'+e.tileKey((a.action.tiles||[a.action.tile])[0]),b.action.type+':'+e.tileKey((b.action.tiles||[b.action.tile])[0])],
        playableUnknown:a.keys,ends:[a.ends,b.ends],opened:[a.opened,b.opened]});
      }
     }
     if(matched){out.matchedKPositions++;out.byPhase[s.turns<=7?'early':s.turns<=14?'mid':'late']++;}
     if(exact)out.exactSetPositions++;
    }
   }
   s=r.stepRound(s,(opts,state)=>chooseBy('closed-branch-control',opts,
    {seed,turns:state.turns,player:state.currentPlayer}));
  }
 }
 out.finding='Exact playable-tile identity is much stricter than equal K; a single-vs-new-double-opening pair cannot have identical openedNumbers, because the double action opens a new number while the single action does not.';
 out.limitations='Reachable positions under one discovery policy; deterministic seed range; first-round flag false; no prior passes; no hidden-world continuation or win-rate claim; assumed branch-opening rules.';
 out.next='Replicate on disjoint seed range; quantify mobility/first-response mediation on rare exact-set pairs without claiming full branch-state control.';
 return out;
}
function test(){
 const a=run(3603084,3603085);
 if(a.exactSetPairs!==2||a.exactSetPositions!==1||a.matchedKPairs<2)throw Error('fixture regression');
 if(a.matchedOpenedNumbers!==0)throw Error('opening state unexpectedly identical');
 return{passed:true,fixture:3603084,exactSetPairs:2};
}
if(require.main===module){const args=process.argv.slice(2);
 console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||3600000),+(args[1]||3610000)),null,2));}
module.exports={run,test,playableKeys};
