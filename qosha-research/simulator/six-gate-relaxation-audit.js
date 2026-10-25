'use strict';
// Matched-seed public 6-6 gate relaxation audit. Four-branch number lock PROVISIONAL.
// node qosha-research/simulator/six-gate-relaxation-audit.js test
// node qosha-research/simulator/six-gate-relaxation-audit.js 1559140 600
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),
 init=require('./initializer'),b=require('./strategy-runner'),old=require('./six-public-response-gate');
const DECK=e.createDoubleSixDeck(),KEY=e.tileKey;
const MIXES=[['closed-branch-control','closed-branch-control'],['min-hand-pips','min-hand-pips'],['closed-branch-control','min-hand-pips']];
const ARMS=[['control',null,null],['strict-5pp',0.05,0],['zero-threshold',0,0],['mobility-minus-one',0.05,1],['both-relaxed',0,1]];
const tiles=a=>a.type==='single'?[a.tile]:(a.tiles||[]);
const touchesSix=a=>tiles(a).some(t=>t.includes(6));
const mean=xs=>xs.length?xs.reduce((s,x)=>s+x,0)/xs.length:null;
function ci(xs){if(!xs.length)return{n:0,mean:null,halfWidth95:null};
 const m=mean(xs),v=xs.length>1?xs.reduce((s,x)=>s+(x-m)**2,0)/(xs.length-1):0;
 return{n:xs.length,mean:m,halfWidth95:xs.length>1?1.96*Math.sqrt(v/xs.length):null};}
function median(xs){if(!xs.length)return null;const z=[...xs].sort((a,b)=>a-b),n=z.length;return n%2?z[(n-1)/2]:(z[n/2-1]+z[n/2])/2;}
function gateContext(opts,s,known,baseline,diag){
 const f=s.currentPlayer,h=s.hands[f],n=(f+1)%3,o=(f+2)%3;
 if(h.length<=3||!h.some(t=>KEY(t)==='6-6')||
 h.filter(t=>t[0]!==t[1]&&t.includes(6)).length<2||
 s.hands[n].length<=4||s.hands[o].length<=4||!touchesSix(baseline))return null;
 if(diag)diag.ready++;
 const alts=opts.actions.filter(a=>!touchesSix(a));if(!alts.length)return null;
 if(diag)diag.withAlternative++;
 const used=new Set([...known,...h.map(KEY)]),unseen=DECK.filter(t=>!used.has(KEY(t)));
 if(unseen.length!==s.hands[n].length+s.hands[o].length+s.stock.length)throw Error('public conservation');
 const after=a=>d.applyTurn(s.branchState,s.openingState,h,s.stock,a);
 const base=after(baseline),baseP=old.passChance(unseen,base,s.hands[n].length),baseM=old.mob(base);
 const options=alts.map(a=>{const x=after(a);return{action:a,passGain:old.passChance(unseen,x,s.hands[n].length)-baseP,mobilityDelta:old.mob(x)-baseM,
 observedPassDelta:+!d.actionsForHand(x.branchState,x.openingState,s.hands[n]).length -
 +!d.actionsForHand(base.branchState,base.openingState,s.hands[n]).length};});
 if(diag){const best=Math.max(...options.map(x=>x.passGain));
  diag.maxGainSum+=best;diag.positive+=+(best>1e-12);diag.gt5+=+(best>0.05+1e-12);
  for(const [k,threshold,budget] of [['strict',0.05,0],['zero',0,0],['minus1',0.05,1],['both',0,1]]){
   diag.feasible[k]+=+options.some(x=>x.passGain>threshold+1e-12&&x.mobilityDelta>=-budget);
  }
  const q=options.filter(x=>x.passGain>1e-12).sort((a,b)=>b.passGain-a.passGain)[0];
  if(q){const bin=q.mobilityDelta<-1?'lt-1':q.mobilityDelta===-1?'-1':q.mobilityDelta===0?'0':'positive';diag.bestPositiveMob[bin]++;}
 }
 return{options};
}
function choose(opts,s,known,arm,signal,diag,checkStrict){
 const baseline=b.chooseBy('closed-branch-control',opts,{seed:0,turns:s.turns,player:s.currentPlayer});
 if(arm===0){gateContext(opts,s,known,baseline,diag);return baseline;}
 const [name,threshold,budget]=ARMS[arm],ctx=gateContext(opts,s,known,baseline,null);
 if(!ctx)return baseline;
 signal.eligible++;
 let best=baseline,bestGain=threshold;
 for(const x of ctx.options){
  if(x.mobilityDelta>=-budget&&x.passGain>bestGain+1e-12){best=x.action;bestGain=x.passGain;}
 }
 if(best!==baseline){signal.changed++;const x=ctx.options.find(x=>x.action===best);
  signal.predicted+=x.passGain;signal.observed+=x.observedPassDelta;signal.mobility+=x.mobilityDelta;
 }
 if(checkStrict&&arm===1){
  const z=old.select(opts,s,known,{eligible:0,changed:0,predicted:0,observed:0,mobility:0});
  if(JSON.stringify(z)!==JSON.stringify(best))throw Error('strict gate mismatch');
 }
 return best;
}
function summarize(rows){
 const groups=new Map();for(const x of rows){if(!groups.has(x[0]))groups.set(x[0],[]);groups.get(x[0]).push(x);}
 const result={observations:rows.length,distinctDeals:groups.size,byArm:{},comparisons:{}};
 for(let a=0;a<ARMS.length;a++){
  const z=rows.map(x=>x[4+a]),signals=a?rows.map(x=>x[9+a-1]):[];
  result.byArm[ARMS[a][0]]={finishFirstRate:mean(z.map(x=>x[0])),meanFinalPips:mean(z.map(x=>x[1])),
   medianFinalPips:median(z.map(x=>x[1])),minusFinishRate:mean(z.map(x=>x[2])),
   blockRate:mean(z.map(x=>x[3])),meanTurns:mean(z.map(x=>x[4])),
   meanEndingDoubles:mean(z.map(x=>x[5])),eligible:signals.reduce((s,x)=>s+x[0],0),
   changed:signals.reduce((s,x)=>s+x[1],0)};
  if(a){const grouped=[...groups.values()];
   result.comparisons[ARMS[a][0]+'-minus-control']={
    winDeltaPP:ci(grouped.map(g=>mean(g.map(x=>100*(x[4+a][0]-x[4][0]))))),
    pipsDelta:ci(grouped.map(g=>mean(g.map(x=>x[4+a][1]-x[4][1])))),
    minusDeltaPP:ci(grouped.map(g=>mean(g.map(x=>100*(x[4+a][2]-x[4][2]))))),
    blockDeltaPP:ci(grouped.map(g=>mean(g.map(x=>100*(x[4+a][3]-x[4][3])))))};
  }
 }
 return result;
}
function freshDiag(){return{ready:0,withAlternative:0,maxGainSum:0,positive:0,gt5:0,
 feasible:{strict:0,zero:0,minus1:0,both:0},bestPositiveMob:{'lt-1':0,'-1':0,'0':0,positive:0}};}
function run(start=1559140,count=600){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<2||count%2||count>3000)throw Error('seed/count');
 const rows=[],diag=freshDiag(),minus={'-10':0,'-20':0,'-30':0,'-40':0};
 let rounds=0,finishes=0,blocks=0,turns=0;
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('initialization '+seed);
  for(let seat=0;seat<3;seat++)for(let mi=0;mi<3;mi++){
   const hand=base.hands[seat],cat=hand.some(t=>KEY(t)==='6-6')?(hand.filter(t=>t[0]!==t[1]&&t.includes(6)).length>=2?2:1):0;
   const outputs=[],signals=[];
   for(let arm=0;arm<ARMS.length;arm++){
    const profiles=[null,null,null];profiles[seat]=arm;profiles[(seat+1)%3]=MIXES[mi][0];profiles[(seat+2)%3]=MIXES[mi][1];
    const known=new Set(['1-1']);if(base.openingFollowup)known.add(KEY(base.openingFollowup.tile));
    const signal={eligible:0,changed:0,predicted:0,observed:0,mobility:0};
    const out=r.runRound(base,(opts,s)=>{
     const p=s.currentPlayer,profile=profiles[p];
     const a=typeof profile==='number'?choose(opts,s,known,profile,signal,arm===0?diag:null,seed<start+6):
      b.chooseBy(profile,opts,{seed,seat,turns:s.turns,player:p});
     if(!opts.actions.includes(a))throw Error('selected illegal action');
     for(const t of tiles(a)){const k=KEY(t);if(known.has(k))throw Error('reused tile');known.add(k);}
     return a;
    },{maxTurns:200});
    rounds++;turns+=out.turns;
    if(out.outcome.kind==='finish'){finishes++;if(out.outcome.minus<0)minus[String(out.outcome.minus)]++;}
    else if(out.outcome.kind==='block')blocks++;else throw Error('unresolved '+seed);
    outputs.push([+(out.outcome.kind==='finish'&&out.outcome.playerIndex===seat),e.pipSum(out.hands[seat]),
     +(out.outcome.kind==='finish'&&out.outcome.playerIndex===seat&&out.outcome.minus<0),
     +(out.outcome.kind==='block'),out.turns,out.hands[seat].filter(t=>t[0]===t[1]).length]);
    if(arm)signals.push([signal.eligible,signal.changed,signal.predicted,signal.observed,signal.mobility]);
   }
   rows.push([seed,seat,mi,cat,...outputs,...signals]);
  }
 }
 const mid=start+count/2,summary={};
 for(const [cohort,pred] of [['discovery',x=>x[0]<mid],['holdout',x=>x[0]>=mid],['combined',()=>true]]){
  summary[cohort]={};
  for(let mi=0;mi<3;mi++){
   const subset=rows.filter(x=>pred(x)&&x[2]===mi);
   summary[cohort][MIXES[mi].join('+')]={all:summarize(subset),initialSixTwoPlus:summarize(subset.filter(x=>x[3]===2))};
  }
 }
 return{schema:'qosha-six-public-gate-relaxation/v1',engine:'qosa-research-0.5.3',
  rules:'recovered qosa-1.0.0 3x9; number-lock/four-branch PROVISIONAL',
  timestampAsiaBaku:new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04',
  seedStart:start,seedEnd:start+count-1,deals:count,discovery:[start,mid-1],holdout:[mid,start+count-1],
  fullRounds:rounds,finishes,blocks,unresolved:0,meanTurns:turns/rounds,minusFinishes:minus,
  arms:ARMS,opponentMixes:MIXES,baselineDecisionDiagnostics:diag,summary,
  rowFormat:'[seed,seat,mix,initial6category,control[win,pips,minus,block,turns,endingDoubles],strict[same],zero[same],minusOne[same],both[same],strictSignal[eligible,changed,predicted,actualDiagnostic,mobility],zeroSignal[same],minusOneSignal[same],bothSignal[same]]',
  rows,design:'Matched 3x9 seed/seat/opponent mix across 5 focal policies, 45 rounds/deal; 300+300 preregistered halves. The public-information gate sees only own tiles, previously played tiles, opponent hand sizes, branch/open state. Actual opponent hands are used only for retrospective diagnostic, not decisions. Strict arm checked against previously persisted select(). Deal-cluster exploratory normal 95% intervals, uncorrected.',
  limitations:'All gameplay results provisional: four-branch/number-lock unvalidated, block winner, loneZero, bust and 101 match scoring unvalidated. Fixed simple bots, correlated seat rotations, exploratory multiple contrasts, no authenticated real-game tactics. Immediate observed pass uses actual hidden hands only after the policy choice; do not use it as a decision feature.',
  next:'If relaxing gates changes more decisions, replicate promising candidate on disjoint seeds and check pips, not only first finishes. If still rare, stop tuning 6-6 retention and prioritize authentic branch lock/open fixtures and broad hand-pattern discovery.'};
}
function test(){
 const q=old.test();if(!q.passed)throw Error('prior gate test');
 const a=run(1559140,4),b=run(1559140,4);delete a.timestampAsiaBaku;delete b.timestampAsiaBaku;
 if(JSON.stringify(a)!==JSON.stringify(b)||a.fullRounds!==180||a.rows.length!==36||a.unresolved)throw Error('replay');
 for(const row of a.rows)for(let k=9;k<13;k++)if(row[k][1]>row[k][0])throw Error('changed>eligible');
 return{passed:true,previousGateFixture:q.fixture,replayDeals:4,replayRounds:180};
}
if(require.main===module){const x=process.argv.slice(2);console.log(JSON.stringify(x[0]==='test'?test():run(+(x[0]||1559140),+(x[1]||600)),null,2));}
module.exports={run,test,choose,gateContext};
