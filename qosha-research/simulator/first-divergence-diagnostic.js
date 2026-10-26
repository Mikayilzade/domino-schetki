'use strict';
// First-disagreement matched diagnostics: exact known worlds, NOT hidden-world Monte Carlo.
// Number locking and four-side geometry are PROVISIONAL. Finish-first != 101-match win.
// node qosha-research/simulator/first-divergence-diagnostic.js test
// node qosha-research/simulator/first-divergence-diagnostic.js 1560820 240
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),h=require('./mobility-hybrid-holdout');
const ARMS=['mobility-hybrid','tempo-hybrid'];
const MIXES=[['closed-branch-control','closed-branch-control'],['random-legal','closed-branch-control']];
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
const median=a=>{if(!a.length)return null;const b=[...a].sort((x,y)=>x-y),n=b.length;return n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2;};
function ci(a){const m=mean(a);return{n:a.length,mean:m,halfWidth95:a.length>1?1.96*Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/(a.length-1)/a.length):null};}
function key(a){return [a.type,a.side||'',a.to??'',(a.numbers||[]).join(','),e.tileKey(a.tile||[0,0])].join(':');}
function identities(actions){return new Set(actions.flatMap(a=>(a.type==='single'?[a.tile]:(a.tiles||[])).map(e.tileKey))).size;}
function immediateProxy(s,opts,action){
 const tr=d.applyTurn(s.branchState,s.openingState,opts.hand,opts.stock,action);
 return identities(d.actionsForHand(tr.branchState,tr.openingState,tr.hand));
}
function choose(name,opts,s,seed,seat){return h.choose(name,opts,s,seed,seat);}
function continuation(state,first,seat,profiles,seed){
 let s=r.cloneRoundState(state),once=false,nextMobility=null;
 while(!s.outcome&&s.turns<200){
  if(once&&s.currentPlayer===seat&&nextMobility===null)
   nextMobility=identities(d.actionsForHand(s.branchState,s.openingState,s.hands[seat]));
  s=r.stepRound(s,(opts,t)=>{
   if(!once){
    once=true;const match=opts.actions.find(a=>key(a)===key(first));
    if(!match)throw Error('forced action missing');return match;
   }
   return choose(profiles[t.currentPlayer],opts,t,seed,seat);
  });
 }
 if(!s.outcome||s.outcome.kind==='unresolved')throw Error('continuation unresolved');
 return{first:+(s.outcome.kind==='finish'&&s.outcome.playerIndex===seat),
  pips:e.pipSum(s.hands[seat]),minus:s.outcome.kind==='finish'&&s.outcome.playerIndex===seat?s.outcome.minus:0,
  block:+(s.outcome.kind==='block'),turns:s.turns,nextMobility};
}
function summarize(rows){
 const out={positions:rows.length,distinctDeals:new Set(rows.map(x=>x.seed)).size};
 const seedGroups=[...new Set(rows.map(x=>x.seed))].map(seed=>rows.filter(x=>x.seed===seed));
 for(const metric of ['first','pips','block','turns'])
  out[metric+'Delta']=ci(seedGroups.map(g=>mean(g.map(x=>x.hybrid[metric]-x.control[metric]))));
 out.immediateProxyGain=mean(rows.map(x=>x.hybridProxy-x.controlProxy));
 const observed=rows.filter(x=>x.control.nextMobility!==null&&x.hybrid.nextMobility!==null);
 out.bothReachNext=observed.length;
 out.actualNextMobilityGain=mean(observed.map(x=>x.hybrid.nextMobility-x.control.nextMobility));
 out.proxyHigherCount=rows.filter(x=>x.hybridProxy>x.controlProxy).length;
 out.proxyReversalCount=observed.filter(x=>x.hybridProxy>x.controlProxy&&x.hybrid.nextMobility<x.control.nextMobility).length;
 out.openingSwitches=rows.filter(x=>x.controlType!==x.hybridType&&
  (x.controlType==='double-sequence'||x.hybridType==='double-sequence')).length;
 out.medianPairedPipsDelta=median(rows.map(x=>x.hybrid.pips-x.control.pips));
 return out;
}
function run(start=1560820,count=240){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<2||count%2||count>500)throw Error('count even 2..500');
 const rows=[],visited={},changed={};let baselineRounds=0,finishes=0,blocks=0,baselineTurns=0;
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('initialization '+seed);
  for(let seat=0;seat<3;seat++)for(let mi=0;mi<MIXES.length;mi++){
   const profiles=[];profiles[seat]='closed-branch-control';
   profiles[(seat+1)%3]=MIXES[mi][0];profiles[(seat+2)%3]=MIXES[mi][1];
   let s=r.cloneRoundState(base),seen=new Set();
   while(!s.outcome&&s.turns<200){
    const opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
    if(opts.phase==='play'&&s.currentPlayer===seat&&opts.actions.length>1){
     const ctrl=choose('closed-branch-control',opts,s,seed,seat);
     for(const arm of ARMS){
      const tag=arm+'|'+mi;visited[tag]=(visited[tag]||0)+1;
      if(seen.has(arm))continue;
      const alt=choose(arm,opts,s,seed,seat);
      if(key(ctrl)===key(alt))continue;
      seen.add(arm);changed[tag]=(changed[tag]||0)+1;
      const snap=r.cloneRoundState(s),before=JSON.stringify(snap);
      const cp=immediateProxy(s,opts,ctrl),ap=immediateProxy(s,opts,alt);
      const control=continuation(snap,ctrl,seat,profiles,seed);
      const hybrid=continuation(snap,alt,seat,profiles,seed);
      if(JSON.stringify(snap)!==before)throw Error('counterfactual mutated source state');
      rows.push({seed,seat,mix:mi,arm,turn:s.turns,handSize:s.hands[seat].length,
       controlType:ctrl.type,hybridType:alt.type,controlProxy:cp,hybridProxy:ap,control,hybrid});
     }
    }
    s=r.stepRound(s,(o,st)=>choose(profiles[st.currentPlayer],o,st,seed,seat));
   }
   if(!s.outcome||s.outcome.kind==='unresolved')throw Error('baseline unresolved');
   baselineRounds++;baselineTurns+=s.turns;
   finishes+=+(s.outcome.kind==='finish');blocks+=+(s.outcome.kind==='block');
  }
 }
 const mid=start+count/2,summary={};
 for(const [cohort,filter] of [['discovery',x=>x.seed<mid],['holdout',x=>x.seed>=mid],['combined',()=>true]]){
  summary[cohort]={};
  for(const arm of ARMS)for(let mi=0;mi<MIXES.length;mi++)
   summary[cohort][arm+'|'+MIXES[mi].join('+')]=summarize(rows.filter(x=>filter(x)&&x.arm===arm&&x.mix===mi));
 }
 return{schema:'qosha-first-divergence-diagnostic/v1',timestampAsiaBaku:new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04',
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0; 3x9; four-side number-lock PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,deals:count,discovery:[start,mid-1],holdout:[mid,start+count-1],
  arms:ARMS,opponentMixes:MIXES,baselineRounds,baselineFinishes:finishes,baselineBlocks:blocks,
  meanBaselineTurns:baselineTurns/baselineRounds,pairedPositions:rows.length,
  forcedKnownWorldContinuations:2*rows.length,visited,changed,summary,rows,
  design:'First disagreement per arm per baseline/seat/mix. Force two actions from same fully known position; identical future policies, exact deterministic deal. Deal-cluster exploratory 95% normal CI, no multiplicity correction. The immediate mobility proxy assumes the opponent does not move; actual next-turn mobility is measured after opponent moves (including zero-action passes).',
  limitations:'Not hidden-world Monte Carlo, full opponent hands known only for simulation; first-disagreement conditioning limits generalization; branches provisional. Block winner, loneZero, bust and 101-match scoring unvalidated; no real-game tactic inferred.',
  next:'Independent hidden-world paired regret at fixed-visible changed-choice positions; stratify next-turn mobility erosion by double-opening vs single and authenticate four-side locking.'};
}
function test(){
 if(!require('./four-branch-lock-kernel-test').test().passed||!require('./scoring-contract-test').test().passed)throw Error('contract tests');
 const a=run(1560820,2),b=run(1560820,2);delete a.timestampAsiaBaku;delete b.timestampAsiaBaku;
 if(JSON.stringify(a)!==JSON.stringify(b)||a.baselineRounds!==12||a.pairedPositions!==a.rows.length||
  a.forcedKnownWorldContinuations!==2*a.rows.length)throw Error('replay/accounting');
 return{passed:true,replayDeals:2,baselineRounds:12,pairedPositions:a.pairedPositions};
}
if(require.main===module){
 const args=process.argv.slice(2);
 console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||1560820),+(args[1]||240)),null,2));
}
module.exports={run,test,ARMS,MIXES};