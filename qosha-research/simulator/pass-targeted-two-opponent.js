'use strict';
// Target informative opponent passes without peeking at opponent hands.
// Highest public pass-information candidate per independent deal, with BOTH-pass priority.
// Four-side number-lock remains PROVISIONAL; finish-first != match victory.
// node qosha-research/simulator/pass-targeted-two-opponent.js test
// node qosha-research/simulator/pass-targeted-two-opponent.js 1577940 800 16 24
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),b=require('./strategy-runner'),side=require('./side-equivariant-holdout');
const pc=require('./pass-conditioned-side');
const MIXES=pc.STRONG_MIXES;
const check=(v,m)=>{if(!v)throw Error('pass-targeted: '+m);};
const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;
const median=a=>{const x=[...a].sort((a,b)=>a-b),n=x.length;return n?(n%2?x[(n-1)/2]:(x[n/2-1]+x[n/2])/2):null;};
const key=a=>[a.type,a.side||'',a.to??'',(a.numbers||[]).join(','),e.tileKey(a.tile||[0,0])].join(':');
function choose(scores,actions){
 return actions.map((a,i)=>({i,id:key(a),first:avg(scores[i].map(x=>x.first)),pips:avg(scores[i].map(x=>x.pips))}))
 .sort((x,y)=>y.first-x.first||x.pips-y.pips||x.id.localeCompare(y.id))[0].i;
}
function candidate(s,seat,mem,profiles,seed,mix){
 const opts=d.turnOptions(s.branchState,s.openingState,s.hands[seat],s.stock);
 if(s.stock.length||opts.phase!=='play')return null;
 const pair=side.pairs(opts.actions)['different-end'];
 if(!pair)return null;
 const n=(seat+1)%3,o=(seat+2)%3;
 const remaining=new Set(s.hands.flat().map(e.tileKey));
 const known=new Set(s.hands[seat].map(e.tileKey));
 const unseen=e.createDoubleSixDeck().filter(t=>remaining.has(e.tileKey(t))&&!known.has(e.tileKey(t)));
 const fn=unseen.filter(t=>mem[n].has(e.tileKey(t))).length;
 const fo=unseen.filter(t=>mem[o].has(e.tileKey(t))).length;
 if(fn+fo===0)return null;
 const support=pc.passSupport(s.hands[n].length,s.hands[o].length,fn,fo);
 check(support>0&&support<=1,'pass support');
 const bits=-Math.log2(support),both=fn>0&&fo>0;
 return{seed,seat,mix,turn:s.turns,handSize:s.hands[seat].length,
  forbiddenNext:fn,forbiddenOther:fo,both,passInformationBits:bits,
  opponentHandSizes:[s.hands[n].length,s.hands[o].length],
  support,actions:[pair.a,pair.b],state:r.cloneRoundState(s),
  mem:mem.map(x=>new Set(x)),profiles:[...profiles]};
}
function better(a,z){
 if(!z)return true;
 if(a.both!==z.both)return a.both;
 if(Math.abs(a.passInformationBits-z.passInformationBits)>1e-10)return a.passInformationBits>z.passInformationBits;
 return a.turn<z.turn;
}
function evaluate(c,train,evalN){
 const{seed,seat,mix,turn,actions,state,mem,profiles}=c;
 const salts=[0x36d9f09d,0x7f4a7c15,0x9e3779b9];
 const salt=(phase,i)=>e.mixSeed32((seed^Math.imul(seat+1,0x85ebca6b)^Math.imul(mix+1,0xc2b2ae35)^
  Math.imul(turn+1,0x27d4eb2d)^Math.imul(i+1,0x165667b1)^salts[phase])>>>0);
 const before=JSON.stringify(state),training=[[[],[]],[[],[]]],evaluation=[[],[]];
 for(let mode=0;mode<2;mode++)for(let wi=0;wi<train;wi++){
  const w=pc.world(state,seat,mem,salt(mode,wi),mode===0);
  for(let ai=0;ai<2;ai++)training[mode][ai].push(side.rollout(w,actions[ai],seat,profiles,seed,'equivariant'));
 }
 const conditional=choose(training[0],actions),uniform=choose(training[1],actions);
 for(let wi=0;wi<evalN;wi++){
  const w=pc.world(state,seat,mem,salt(2,wi),true);
  for(let ai=0;ai<2;ai++)evaluation[ai].push(side.rollout(w,actions[ai],seat,profiles,seed,'equivariant'));
 }
 check(JSON.stringify(state)===before,'state mutation');
 const m=(ai,f)=>avg(evaluation[ai].map(z=>z[f]));
 const best=Math.max(m(0,'first'),m(1,'first'));
 return{seed,seat,mix,turn,handSize:c.handSize,forbiddenNext:c.forbiddenNext,
  forbiddenOther:c.forbiddenOther,both:c.both,passInformationBits:c.passInformationBits,
  uniformPassCompatibility:c.support,opponentHandSizes:c.opponentHandSizes,
  actions:actions.map(key),chosenConditional:conditional,chosenUniform:uniform,
  switch:conditional!==uniform,train,evalWorlds:evalN,
  conditionalMinusUniformFirstPP:100*(m(conditional,'first')-m(uniform,'first')),
  conditionalMinusUniformPips:m(conditional,'pips')-m(uniform,'pips'),
  conditionalMinusUniformMinusPP:100*(m(conditional,'minus')-m(uniform,'minus')),
  conditionalMinusUniformBlockPP:100*(m(conditional,'block')-m(uniform,'block')),
  pairAbsFirstPP:100*Math.abs(m(1,'first')-m(0,'first')),
  pairAbsPips:Math.abs(m(1,'pips')-m(0,'pips')),
  conditionalRegretPP:100*(best-m(conditional,'first')),
  uniformRegretPP:100*(best-m(uniform,'first')),
  trainingFirst:training.map(t=>t.map(z=>avg(z.map(x=>x.first)))),
  evaluationFirst:evaluation.map(z=>avg(z.map(x=>x.first))),
  evaluationPips:evaluation.map(z=>avg(z.map(x=>x.pips)))};
}
function run(start=1577940,count=800,train=16,evalN=24){
 check([start,count,train,evalN].every(Number.isInteger)&&count>=2&&count%2===0&&count<=1200&&
  train>=2&&train<=64&&evalN>=2&&evalN<=64,'arguments');
 const rows=[],focal=[],minus={'-10':0,'-20':0,'-30':0,'-40':0};
 let rounds=0,finishes=0,blocks=0,turnTotal=0,passEvents=0,allEligible=0;
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  check(base.kind==='ready','initialization');
  let best=null;
  for(let seat=0;seat<3;seat++)for(let mix=0;mix<MIXES.length;mix++){
   const profiles=[];profiles[seat]='closed-branch-control';
   profiles[(seat+1)%3]=MIXES[mix][0];profiles[(seat+2)%3]=MIXES[mix][1];
   const mem=[new Set(),new Set(),new Set()];
   if(base.openingPassed){pc.remember(mem,base,base.starter);passEvents++;}
   let s=r.cloneRoundState(base);
   while(!s.outcome&&s.turns<200){
    const opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
    if(opts.phase==='pass'&&!s.stock.length){pc.remember(mem,s,s.currentPlayer);passEvents++;}
    if(s.currentPlayer===seat&&s.stock.length===0&&opts.phase==='play'){
     const c=candidate(s,seat,mem,profiles,seed,mix);
     if(c){allEligible++;if(better(c,best))best=c;}
    }
    s=r.stepRound(s,(o,st)=>b.chooseBy(profiles[st.currentPlayer],o,{seed,rotation:seat,turns:st.turns,player:st.currentPlayer}));
   }
   check(s.outcome&&s.outcome.kind!=='unresolved','baseline resolution');
   rounds++;turnTotal+=s.turns;
   if(s.outcome.kind==='finish'){finishes++;if(s.outcome.minus<0)minus[String(s.outcome.minus)]++;}else blocks++;
   focal.push({first:+(s.outcome.kind==='finish'&&s.outcome.playerIndex===seat),
    pips:e.pipSum(s.hands[seat]),starting:base.hands[seat].filter(t=>t[0]===t[1]).length,
    ending:s.hands[seat].filter(t=>t[0]===t[1]).length});
  }
  if(best)rows.push(evaluate(best,train,evalN));
 }
 const half=start+count/2,split=(f)=>pc.summary(rows.filter(f));
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',
  month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-pass-targeted-two-opponent/v1',timestampAsiaBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9; four-side number-lock PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,deals:count,baselineRounds:rounds,finishes,blocks,
  unresolved:0,meanRoundTurns:turnTotal/rounds,blockRate:blocks/rounds,minusFinishes:minus,
  passEvents,eligibleCandidatesBeforeSelection:allEligible,selectedPositions:rows.length,
  trainWorldsPerMode:train,evalWorldsPerPosition:evalN,
  forcedHiddenWorldContinuations:rows.length*(train*4+evalN*2),
  strategies:['closed-branch-control','min-hand-pips'],
  opponentMixes:MIXES,baseline:{finishFirst:avg(focal.map(z=>z.first)),
   meanRemainingPips:avg(focal.map(z=>z.pips)),medianRemainingPips:median(focal.map(z=>z.pips)),
   meanStartingDoubles:avg(focal.map(z=>z.starting)),meanEndingDoubles:avg(focal.map(z=>z.ending))},
  discovery:split(z=>z.seed<half),holdout:split(z=>z.seed>=half),combined:pc.summary(rows),
  passStrata:{oneOpponent:split(z=>!z.both),bothOpponents:split(z=>z.both)},
  passStrengthStrata:{weakBelow2Bits:split(z=>z.passInformationBits<2),
   strongAtLeast2Bits:split(z=>z.passInformationBits>=2),
   atLeast3Bits:split(z=>z.passInformationBits>=3)},
  rows,
  selection:'One selected position per independent deal: prioritize publicly observed passes by BOTH opponents, then maximize exact pass information bits; deterministic earliest-turn tie-break. Focal same-tile different-numerical-end side pair; stock empty; six strong-opponent baseline trajectories/deal. Selection scans complete baseline trajectory; do not compare strata causally.',
  design:'Two side choices trained on identical deterministic 16 conditional vs 16 uniform hidden worlds per action; held out on 24 independent pass-compatible worlds per action; permutation-equivariant continuation. First-finish primary; pips/minus/block secondary. No hidden opponent hands used to select candidate.',
  posterior:'Uniform over unseen allocations conditioned on all observed no-stock passes; ignores opponent policy-choice likelihood.',
  limitations:'Selection deliberately enriches BOTH-pass and strong-pass positions, not population-representative; exploratory unadjusted deal-cluster normal 95% intervals; simple bots, provisional branch locks, authentic block winner/loneZero/bust/101 match unresolved; finish-first != match victory.',
  nextAction:'Replicate targeted both-pass strata on disjoint seeds with opponent-policy likelihood model only if specified; obtain authentic branch-opening and blocked-round fixtures.'};
}
function test(){
 check(Math.abs(pc.passSupport(4,5,1,1)-35/126)<1e-12,'exact joint support');
 const a=run(1577940,4,2,2),z=run(1577940,4,2,2);
 delete a.timestampAsiaBaku;delete z.timestampAsiaBaku;
 check(JSON.stringify(a)===JSON.stringify(z),'deterministic replay');
 check(a.baselineRounds===24,'round count');
 check(a.selectedPositions===a.rows.length,'position count');
 check(a.forcedHiddenWorldContinuations===a.selectedPositions*12,'forced accounting');
 check(new Set(a.rows.map(z=>z.seed)).size===a.rows.length,'one per deal');
 check(a.rows.every(z=>z.forbiddenNext+z.forbiddenOther>0),'pass gate');
 check(a.rows.every(z=>z.both===(z.forbiddenNext>0&&z.forbiddenOther>0)),'both pass stratum');
 return{passed:true,checks:8,pilotDeals:4,positions:a.selectedPositions,forced:a.forcedHiddenWorldContinuations};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1577940),+(a[1]||800),+(a[2]||16),+(a[3]||24)),null,2));
}
module.exports={run,test,candidate,better,evaluate};
