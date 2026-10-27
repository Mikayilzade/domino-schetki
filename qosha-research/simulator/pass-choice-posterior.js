'use strict';
// Policy-choice-aware hidden-world next-pass audit, 3x9; branch number-lock PROVISIONAL.
// Prior *chosen tile groups*, not arbitrary side labels, inform an importance-weighted
// posterior over current opponent hands. The known synthetic bot profile is an
// explicit oracle-profile assumption, NOT a claim about human decision policies.
// node qosha-research/simulator/pass-choice-posterior.js test
// node qosha-research/simulator/pass-choice-posterior.js 1587940 600 64
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),b=require('./strategy-runner'),pc=require('./pass-conditioned-side');
const target=require('./pass-targeted-two-opponent'),base=require('./pass-next-calibration');
const ok=(v,m)=>{if(!v)throw Error('pass-choice-posterior: '+m);};
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const median=a=>{const z=[...a].sort((a,b)=>a-b),n=z.length;return n?(n%2?z[(n-1)/2]:(z[n/2-1]+z[n/2])/2):null;};
const tiles=a=>a.type==='single'?[a.tile]:(a.tiles||[]);
const groupKey=a=>a.type+':'+tiles(a).map(e.tileKey).sort().join(',');
function choiceProbability(actions,chosen,profile){
 const groups=new Map();
 for(const a of actions){const k=groupKey(a);if(!groups.has(k))groups.set(k,a);}
 const keys=[...groups.keys()],n=keys.length;
 ok(n>0&&groups.has(groupKey(chosen)),'observed action must be legal under reconstructed hand');
 if(n===1)return 1;
 const utility=a=>e.pipSum(tiles(a))/3+6*+(a.type==='mixed-finish')-
   (profile==='closed-branch-control'?4*(a.type==='double-sequence'?(a.numbers||[]).length:0):0);
 ok(['min-hand-pips','closed-branch-control'].includes(profile),'unsupported profile');
 const u=keys.map(k=>utility(groups.get(k))),m=Math.max(...u);
 const exp=u.map(v=>Math.exp(v-m)),sum=exp.reduce((s,x)=>s+x,0);
 const idx=keys.indexOf(groupKey(chosen));
 return 0.1/n+0.9*exp[idx]/sum; // fixed 10% lapse, softmax temperature=1
}
function selectedEvents(history,seat,maxPerOpponent=3){
 const suffix=[[],[],[]],counts=[0,0,0],selected=[];
 for(let i=history.length-1;i>=0;i--){
  const ev=history[i];
  suffix[ev.player]=ev.playedTiles.concat(suffix[ev.player]);
  if(ev.player!==seat&&counts[ev.player]<maxPerOpponent){
   selected.push({...ev,suffix:suffix[ev.player]});counts[ev.player]++;
  }
 }
 return selected;
}
function choiceLogLikelihood(world,events,profiles){
 let log=0,informative=0;
 for(const ev of events){
  const hand=world.hands[ev.player].concat(ev.suffix);
  ok(new Set(hand.map(e.tileKey)).size===hand.length,'reconstructed hand duplicates');
  const actions=d.actionsForHand(ev.branchState,ev.openingState,hand);
  const n=new Set(actions.map(groupKey)).size;
  if(n>1)informative++;
  log+=Math.log(choiceProbability(actions,ev.action,profiles[ev.player]));
 }
 return{log,informative};
}
function position(c,worlds){
 const s=c.state,seat=c.seat,n=(seat+1)%3,o=(seat+2)%3;
 const present=new Set(s.hands.flat().map(e.tileKey)),known=new Set(s.hands[seat].map(e.tileKey));
 const pool=e.createDoubleSixDeck().filter(t=>present.has(e.tileKey(t))&&!known.has(e.tileKey(t)));
 const ev=selectedEvents(c.history,seat),post=c.actions.map(a=>d.applyTurn(s.branchState,s.openingState,s.hands[seat],[],a));
 ok(post.every(z=>z.hand.length>0),'exclude immediate finish');
 const legal=post.map(z=>new Set(e.createDoubleSixDeck().filter(t=>d.actionsForHand(z.branchState,z.openingState,[t]).length).map(e.tileKey)));
 const exact=legal.map(l=>base.passProb(pool,s.hands[n].length,c.mem[n],c.mem[o],l));
 const actual=post.map(z=>+(d.actionsForHand(z.branchState,z.openingState,s.hands[n]).length===0));
 const outcomes=[[],[]],logs=[],inform=[];
 for(let wi=0;wi<worlds;wi++){
  const salt=e.mixSeed32((c.seed^Math.imul(seat+1,0x85ebca6b)^Math.imul(c.mix+1,0xc2b2ae35)^Math.imul(c.turn+1,0x27d4eb2d)^Math.imul(wi+1,0x165667b1)^0x4af9d125)>>>0);
  const w=pc.world(s,seat,c.mem,salt,true);
  const q=choiceLogLikelihood(w,ev,c.profiles);
  logs.push(q.log);inform.push(q.informative);
  for(let i=0;i<2;i++)outcomes[i].push(+(d.actionsForHand(post[i].branchState,post[i].openingState,w.hands[n]).length===0));
 }
 const max=Math.max(...logs),raw=logs.map(x=>Math.exp(x-max)),total=raw.reduce((s,x)=>s+x,0);
 ok(total>0&&Number.isFinite(total),'finite importance weights');
 const weights=raw.map(x=>x/total),ess=1/weights.reduce((s,x)=>s+x*x,0);
 const actions=exact.map((p,i)=>{
  const weighted=outcomes[i].reduce((z,v,j)=>z+v*weights[j],0);
  const mc=mean(outcomes[i]),truth=actual[i];
  if(p.conditional===0||p.conditional===1)ok(Math.abs(weighted-p.conditional)<1e-10,'hard pass certainty preserved');
  return{side:c.actions[i].side,from:c.actions[i].from,to:c.actions[i].to,actual:truth,
   uniform:p.uniform,passOnly:p.conditional,choiceWeighted:weighted,mcPassOnly:mc,
   brierPassOnly:(p.conditional-truth)**2,brierWeighted:(weighted-truth)**2,brierMC:(mc-truth)**2};
 });
 return{seed:c.seed,seat:c.seat,mix:c.mix,turn:c.turn,both:c.both,passInformationBits:c.passInformationBits,
  historyActions:c.history.length,choiceEvents:ev.length,meanInformativeChoices:mean(inform),
  worlds,ess,essFraction:ess/worlds,actions};
}
function stats(rows,filter=()=>true){
 const clusters=rows.map(z=>z.actions.filter(filter)).filter(z=>z.length),a=clusters.flat();
 const delta=clusters.map(z=>mean(z.map(x=>x.brierPassOnly-x.brierWeighted)));
 const m=mean(delta),N=delta.length;
 return{positions:N,labels:a.length,passOnlyBrier:mean(a.map(x=>x.brierPassOnly)),
  weightedBrier:mean(a.map(x=>x.brierWeighted)),mcPassOnlyBrier:mean(a.map(x=>x.brierMC)),
  gain:m,halfWidth95:N>1?1.96*Math.sqrt(delta.reduce((s,x)=>s+(x-m)**2,0)/(N*(N-1))):null,
  meanESSFraction:mean(rows.filter(z=>z.actions.some(filter)).map(z=>z.essFraction)),
  meanInformativeChoices:mean(rows.filter(z=>z.actions.some(filter)).map(z=>z.meanInformativeChoices))};
}
const uncertain=a=>a.passOnly>1e-12&&a.passOnly<1-1e-12;
function run(start=1587940,count=600,worlds=64){
 ok([start,count,worlds].every(Number.isInteger)&&count>=2&&count<=2400&&count%2===0&&worlds>=8&&worlds<=256,'args');
 const rows=[],minus={'-10':0,'-20':0,'-30':0,'-40':0},focal=[];
 let rounds=0,finishes=0,blocks=0,turnTotal=0,eligible=0,passEvents=0;
 for(let seed=start;seed<start+count;seed++){
  const initial=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  ok(initial.kind==='ready','initializer');let best=null;
  for(let seat=0;seat<3;seat++)for(let mix=0;mix<pc.STRONG_MIXES.length;mix++){
   const profiles=[];profiles[seat]='closed-branch-control';
   profiles[(seat+1)%3]=pc.STRONG_MIXES[mix][0];profiles[(seat+2)%3]=pc.STRONG_MIXES[mix][1];
   const mem=[new Set(),new Set(),new Set()],history=[];
   if(initial.openingPassed){pc.remember(mem,initial,initial.starter);passEvents++;}
   let s=r.cloneRoundState(initial);
   while(!s.outcome&&s.turns<200){
    const p=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
    if(opts.phase==='pass'&&!s.stock.length){pc.remember(mem,s,p);passEvents++;}
    if(p===seat&&s.hands[seat].length>1&&!s.stock.length&&opts.phase==='play'){
     const c=target.candidate(s,seat,mem,profiles,seed,mix);
     if(c){eligible++;if(target.better(c,best))best={...c,history:[...history]};}
    }
    const branch=e.cloneBranchState(s.branchState),opening=e.cloneOpeningState(s.openingState);
    let chosen=null;
    s=r.stepRound(s,(opts,st)=>{chosen=b.chooseBy(profiles[st.currentPlayer],opts,{seed,rotation:seat,turns:st.turns,player:st.currentPlayer});return chosen;});
    if(chosen)history.push({player:p,branchState:branch,openingState:opening,action:chosen,playedTiles:tiles(chosen).map(t=>[...t])});
   }
   ok(s.outcome&&s.outcome.kind!=='unresolved','baseline');
   rounds++;turnTotal+=s.turns;
   if(s.outcome.kind==='finish'){finishes++;if(s.outcome.minus<0)minus[String(s.outcome.minus)]++;}else blocks++;
   focal.push({first:+(s.outcome.kind==='finish'&&s.outcome.playerIndex===seat),
    pips:e.pipSum(s.hands[seat]),starting:initial.hands[seat].filter(t=>t[0]===t[1]).length,
    ending:s.hands[seat].filter(t=>t[0]===t[1]).length});
  }
  if(best)rows.push(position(best,worlds));
 }
 const half=start+count/2,stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',
  year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 const all=rows.flatMap(z=>z.actions);
 return{schema:'qosha-pass-choice-posterior/v1',timestampAsiaBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9; four-side number-lock PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,deals:count,baselineRounds:rounds,finishes,blocks,
  unresolved:0,meanRoundTurns:turnTotal/rounds,blockRate:blocks/rounds,minusFinishes:minus,
  selectedPositions:rows.length,eligibleCandidatesBeforeSelection:eligible,
  immediatePassLabels:all.length,forcedHiddenWorldContinuations:0,hiddenAllocations:rows.length*worlds,
  passEvents,worldsPerPosition:worlds,strategies:['closed-branch-control','min-hand-pips'],
  opponentMixes:pc.STRONG_MIXES,baseline:{finishFirst:mean(focal.map(z=>z.first)),
   meanRemainingPips:mean(focal.map(z=>z.pips)),medianRemainingPips:median(focal.map(z=>z.pips)),
   meanStartingDoubles:mean(focal.map(z=>z.starting)),meanEndingDoubles:mean(focal.map(z=>z.ending))},
  summary:{all:stats(rows),uncertain:stats(rows,uncertain),
   discovery:stats(rows.filter(z=>z.seed<half),uncertain),
   holdout:stats(rows.filter(z=>z.seed>=half),uncertain),
   both:stats(rows.filter(z=>z.both),uncertain),
   one:stats(rows.filter(z=>!z.both),uncertain),
   informative:stats(rows.filter(z=>z.meanInformativeChoices>0),uncertain),
   lowESS:stats(rows.filter(z=>z.essFraction<0.25),uncertain)},
  rows,
  design:'One public-pass-selected position/deal, same-tile different-end pair. Sample pass-compatible current hands deterministically; reconstruct earlier hands from public played tiles AFTER each observed choice, compute softmax likelihood of chosen tile GROUP (not branch label) under known synthetic opponent bot profile. Reweight identical worlds for both candidate next-pass labels. 10% uniform lapse, temperature=1, utility removedPips/3 + 6*mixedFinish - 4*openedDoubles for closed-branch-control. At most 3 most recent opponent play choices per opponent. Compare weighted MC against EXACT pass-only combinatorial posterior. Two disjoint seed halves.',
  limitations:'Synthetic known opponent profile is oracle metadata not available in human play; choice likelihood is hypothetical, not the actual deterministic bot likelihood; importance sampling has finite-world variance and potentially low ESS; public selection enriched for informative passes; first eligible per deal; correlated two counterfactual actions; provisional branch number-lock and unresolved block winner/loneZero/bust/101. No human tactic inferred.',
  nextAction:'If holdout non-certain Brier improves beyond MC error, replicate with profile-blind policy mixture and larger worlds; otherwise tune likelihood on separate discovery only and validate on disjoint seeds. Obtain authentic branch and block-winner fixtures.'};
}
function test(){
 const a={type:'single',tile:[1,5]},b={type:'single',tile:[2,3]};
 ok(Math.abs(choiceProbability([a],a,'min-hand-pips')-1)<1e-12,'forced choice');
 ok(choiceProbability([a,b],a,'min-hand-pips')>choiceProbability([a,b],b,'min-hand-pips'),'pips preference');
 const x=run(1587940,8,8),y=run(1587940,8,8);
 delete x.timestampAsiaBaku;delete y.timestampAsiaBaku;
 ok(JSON.stringify(x)===JSON.stringify(y),'deterministic replay');
 ok(x.baselineRounds===48&&x.selectedPositions===x.rows.length,'accounting');
 ok(x.immediatePassLabels===2*x.selectedPositions&&x.hiddenAllocations===8*x.selectedPositions,'labels/worlds');
 ok(x.rows.every(z=>z.ess>0&&z.ess<=z.worlds+1e-8),'ESS');
 ok(x.rows.flatMap(z=>z.actions).every(z=>z.passOnly>=0&&z.passOnly<=1&&z.choiceWeighted>=0&&z.choiceWeighted<=1),'probability bounds');
 return{passed:true,checks:7,pilotDeals:8,positions:x.selectedPositions};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1587940),+(a[1]||600),+(a[2]||64)),null,2));}
module.exports={run,test,position,choiceProbability,choiceLogLikelihood,selectedEvents,stats};
