'use strict';
// Analytic next-opponent pass calibration, 3x9. Branch number-lock PROVISIONAL.
// node qosha-research/simulator/pass-next-calibration.js test
// node qosha-research/simulator/pass-next-calibration.js 1580740 1200
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),b=require('./strategy-runner'),pc=require('./pass-conditioned-side');
const target=require('./pass-targeted-two-opponent');
const ok=(v,m)=>{if(!v)throw Error('pass-next-calibration: '+m);};
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;
const median=a=>{const z=[...a].sort((x,y)=>x-y),n=z.length;return n?n%2?z[(n-1)/2]:(z[n/2-1]+z[n/2])/2:null;};
function choose(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return v;}
function passProb(pool,nextSize,fn,fo,legal){
 const N=pool.length;let mustN=0,flex=0,forcedO=0,mustLegal=0,flexLegal=0,totalLegal=0;
 for(const t of pool){const k=e.tileKey(t),x=fn.has(k),y=fo.has(k),hit=legal.has(k);
  ok(!(x&&y),'contradictory remembered passes');if(hit)totalLegal++;
  if(x)forcedO++;else if(y){mustN++;if(hit)mustLegal++;}
  else{flex++;if(hit)flexLegal++;}
 }
 const draw=nextSize-mustN;
 ok(draw>=0&&draw<=flex&&forcedO+mustN+flex===N,'posterior capacity');
 const uniform=choose(N-totalLegal,nextSize)/choose(N,nextSize);
 const conditional=mustLegal?0:choose(flex-flexLegal,draw)/choose(flex,draw);
 ok(Number.isFinite(uniform)&&Number.isFinite(conditional)&&uniform>=0&&uniform<=1&&conditional>=0&&conditional<=1,'probability bounds');
 if(!fn.size&&!fo.size)ok(Math.abs(uniform-conditional)<1e-12,'empty memory equivalence');
 return{uniform,conditional,totalLegal,mandatoryNext:mustN,flexible:flex};
}
function evaluate(c){
 const s=c.state,seat=c.seat,n=(seat+1)%3,o=(seat+2)%3;
 const present=new Set(s.hands.flat().map(e.tileKey)),hand=new Set(s.hands[seat].map(e.tileKey));
 const pool=e.createDoubleSixDeck().filter(t=>present.has(e.tileKey(t))&&!hand.has(e.tileKey(t)));
 ok(pool.length===s.hands[n].length+s.hands[o].length,'unknown pool conservation');
 const actions=c.actions.map((a,i)=>{
  const tr=d.applyTurn(s.branchState,s.openingState,s.hands[seat],[],a);
  ok(tr.hand.length>0,'exclude focal immediate finish');
  const legal=new Set(e.createDoubleSixDeck().filter(t=>d.actionsForHand(tr.branchState,tr.openingState,[t]).length).map(e.tileKey));
  const p=passProb(pool,s.hands[n].length,c.mem[n],c.mem[o],legal);
  const actual=+(d.actionsForHand(tr.branchState,tr.openingState,s.hands[n]).length===0);
  return{index:i,side:a.side,from:a.from,to:a.to,actual,...p,
   brierUniform:(p.uniform-actual)**2,brierConditional:(p.conditional-actual)**2};
 });
 return{seed:c.seed,seat:c.seat,mix:c.mix,turn:c.turn,handSize:c.handSize,both:c.both,
  forbiddenNext:c.forbiddenNext,forbiddenOther:c.forbiddenOther,passInformationBits:c.passInformationBits,
  opponentHandSizes:c.opponentHandSizes,actions,
  uniformBrier:mean(actions.map(x=>x.brierUniform)),conditionalBrier:mean(actions.map(x=>x.brierConditional)),
  deltaBrier:mean(actions.map(x=>x.brierUniform-x.brierConditional))};
}
function stats(rows){
 const n=rows.length,delta=rows.map(z=>z.deltaBrier),m=mean(delta),a=rows.flatMap(z=>z.actions);
 const certain=a.filter(z=>z.conditional===0||z.conditional===1);
 return{positions:n,actionOutcomes:a.length,
  uniformBrier:mean(rows.map(z=>z.uniformBrier)),conditionalBrier:mean(rows.map(z=>z.conditionalBrier)),
  deltaBrierUniformMinusConditional:m,
  deltaHalfWidth95:n>1?1.96*Math.sqrt(delta.reduce((s,x)=>s+(x-m)**2,0)/(n-1)/n):null,
  observedPassRate:mean(a.map(z=>z.actual)),meanUniformPred:mean(a.map(z=>z.uniform)),
  meanConditionalPred:mean(a.map(z=>z.conditional)),
  conditionalBetterPositions:rows.filter(z=>z.deltaBrier>1e-12).length,
  uniformBetterPositions:rows.filter(z=>z.deltaBrier< -1e-12).length,
  equalPositions:rows.filter(z=>Math.abs(z.deltaBrier)<=1e-12).length,
  certainConditionalPredictions:certain.length,
  certainErrors:certain.filter(z=>z.actual!==z.conditional).length};
}
function run(start=1580740,count=1200){
 ok(Number.isInteger(start)&&Number.isInteger(count)&&count>=2&&count%2===0&&count<=5000,'arguments');
 const rows=[],minus={'-10':0,'-20':0,'-30':0,'-40':0},focal=[];
 let rounds=0,finishes=0,blocks=0,turnTotal=0,passEvents=0,eligible=0;
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  ok(base.kind==='ready','initializer');let best=null;
  for(let seat=0;seat<3;seat++)for(let mix=0;mix<pc.STRONG_MIXES.length;mix++){
   const profiles=[];profiles[seat]='closed-branch-control';
   profiles[(seat+1)%3]=pc.STRONG_MIXES[mix][0];profiles[(seat+2)%3]=pc.STRONG_MIXES[mix][1];
   const mem=[new Set(),new Set(),new Set()];
   if(base.openingPassed){pc.remember(mem,base,base.starter);passEvents++;}
   let s=r.cloneRoundState(base);
   while(!s.outcome&&s.turns<200){
    const opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
    if(opts.phase==='pass'&&!s.stock.length){pc.remember(mem,s,s.currentPlayer);passEvents++;}
    if(s.currentPlayer===seat&&s.hands[seat].length>1&&!s.stock.length&&opts.phase==='play'){
     const c=target.candidate(s,seat,mem,profiles,seed,mix);
     if(c){eligible++;if(target.better(c,best))best=c;}
    }
    s=r.stepRound(s,(o,st)=>b.chooseBy(profiles[st.currentPlayer],o,{seed,rotation:seat,turns:st.turns,player:st.currentPlayer}));
   }
   ok(s.outcome&&s.outcome.kind!=='unresolved','round resolution');
   rounds++;turnTotal+=s.turns;
   if(s.outcome.kind==='finish'){finishes++;if(s.outcome.minus<0)minus[String(s.outcome.minus)]++;}else blocks++;
   focal.push({first:+(s.outcome.kind==='finish'&&s.outcome.playerIndex===seat),
    pips:e.pipSum(s.hands[seat]),starting:base.hands[seat].filter(t=>t[0]===t[1]).length,
    ending:s.hands[seat].filter(t=>t[0]===t[1]).length});
  }
  if(best)rows.push(evaluate(best));
 }
 const mid=start+count/2;
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-pass-next-calibration/v1',timestampAsiaBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9; four-side number-lock PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,deals:count,baselineRounds:rounds,finishes,blocks,
  unresolved:0,meanRoundTurns:turnTotal/rounds,blockRate:blocks/rounds,minusFinishes:minus,
  passEvents,eligibleCandidatesBeforeSelection:eligible,selectedPositions:rows.length,
  actionOutcomes:rows.length*2,forcedHiddenWorldContinuations:0,
  strategies:['closed-branch-control','min-hand-pips'],opponentMixes:pc.STRONG_MIXES,
  baseline:{finishFirst:mean(focal.map(x=>x.first)),meanRemainingPips:mean(focal.map(x=>x.pips)),
   medianRemainingPips:median(focal.map(x=>x.pips)),meanStartingDoubles:mean(focal.map(x=>x.starting)),
   meanEndingDoubles:mean(focal.map(x=>x.ending))},
  combined:stats(rows),discovery:stats(rows.filter(z=>z.seed<mid)),
  holdout:stats(rows.filter(z=>z.seed>=mid)),
  onePass:stats(rows.filter(z=>!z.both)),bothPass:stats(rows.filter(z=>z.both)),
  highInformation:stats(rows.filter(z=>z.passInformationBits>=3)),rows,
  design:'One publicly selected same-tile different-numerical-end position per deal; BOTH-pass priority, then pass-information bits; two counterfactual next-opponent legal-move/pass labels per position. Exact combinatorial conditional/uniform probabilities, Brier averaged per deal. No Monte Carlo variance.',
  posterior:'Uniform unknown allocations conditioned on remembered no-stock passes; opponent action-choice likelihood ignored. Hidden actual opponent hand used only to score next-move label.',
  limitations:'Selection scans full simulated trajectories and enriches pass histories; strong but simplified bots; 6 correlated seat/mix baselines, one position/deal; counterfactual next-pass is not first-finish or match win; branch lock and block winner/loneZero/bust/101-match scoring unvalidated. Exploratory unadjusted deal-cluster normal intervals.',
  nextAction:'Replicate Brier calibration on disjoint seeds, especially BOTH-pass; test opponent action-choice likelihood; authenticate branch lock and blocked-winner fixtures.'};
}
function test(){
 ok(choose(5,2)===10&&choose(5,6)===0,'choose');
 const pool=[[0,0],[0,1],[0,2],[0,3],[0,4]],fn=new Set(['0-0']),fo=new Set(['0-1']);
 const p=passProb(pool,2,fn,fo,new Set(['0-1','0-3']));
 ok(Math.abs(p.uniform-0.3)<1e-12&&p.conditional===0,'mandatory legal');
 const q=passProb(pool,2,fn,fo,new Set(['0-3']));
 ok(Math.abs(q.uniform-0.6)<1e-12&&Math.abs(q.conditional-2/3)<1e-12,'flex legal');
 const x=passProb(pool,2,fn,fo,new Set(['0-0']));
 ok(Math.abs(x.conditional-1)<1e-12,'forced-other legal');
 const z=passProb(pool,2,new Set(),new Set(),new Set(['0-3']));
 ok(Math.abs(z.uniform-z.conditional)<1e-12,'empty-memory equivalence');
 const a=run(1580740,4),v=run(1580740,4);
 delete a.timestampAsiaBaku;delete v.timestampAsiaBaku;
 ok(JSON.stringify(a)===JSON.stringify(v),'deterministic replay');
 ok(a.baselineRounds===24&&a.rows.length<=4&&a.rows.every(z=>z.actions.length===2),'accounting');
 return{passed:true,checks:7,pilotDeals:4,positions:a.rows.length};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1580740),+(a[1]||1200)),null,2));}
module.exports={run,test,passProb,stats};
