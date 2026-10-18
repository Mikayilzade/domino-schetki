'use strict';
// Reproducible late-game (1-3 stones) fixed-visible matched-world pass-vs-pips comparison.
// node qosha-research/simulator/pass-pip-late-holdout.js test
// node qosha-research/simulator/pass-pip-late-holdout.js 1064809 800 30 50
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),pub=require('./public-pass-tournament');
const fr=require('./public-pass-pip-frontier'),old=require('./pass-pip-decision-strata');
const {chooseBy}=require('./strategy-runner'),{actionKey}=require('./decision-regret');
const POLICIES=['closed-branch-control','moderate-double-hold'];
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function ci(a){if(a.length<2)return null;const m=avg(a),se=Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length*(a.length-1)));return [m-1.96*se,m+1.96*se];}
function findLate(base,seat,seed){
 let s=r.cloneRoundState(base),best=null;
 while(!s.outcome&&s.turns<200){
  const p=s.currentPlayer;
  if(p===seat&&s.hands[p].length<=3&&s.hands[p].length>=1){
   const opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
   if(opts.phase==='play'&&opts.actions.length>1){
    const rows=pub.publicChoices(opts,s,pub.publicPlayed(s));
    const pass=fr.choose(rows,'pass'),hybrid=fr.choose(rows,'pass-pip-0.01');
    if(actionKey(pass.action)!==actionKey(hybrid.action)){
     const c={state:s,seed,seat,turn:s.turns,handSize:s.hands[p].length,options:opts.actions.length,
      pass:{key:actionKey(pass.action),prob:pass.prob,pips:pass.pips},
      hybrid:{key:actionKey(hybrid.action),prob:hybrid.prob,pips:hybrid.pips}};
     if(!best||c.handSize<best.handSize)best=c;
    }
   }
  }
  s=r.stepRound(s,(opts,st)=>st.currentPlayer===seat?
   fr.choose(pub.publicChoices(opts,st,pub.publicPlayed(st)),'pass').action:
   chooseBy('closed-branch-control',opts,{seed,turns:st.turns,player:st.currentPlayer}));
 }
 if(!s.outcome)throw Error('unresolved discovery '+seed+'/'+seat);
 return best;
}
function summarize(rows){
 const out={};
 for(const policy of POLICIES){
  const groups={all:rows};
  for(const row of rows){
   for(const k of ['hand:'+row.handSize,'gap:'+(Math.abs(row.pipGap)<=3?'0-3':'4+')]){
    (groups[k]||(groups[k]=[])).push(row);
   }
  }
  out[policy]=Object.fromEntries(Object.entries(groups).map(([k,rs])=>{
   const metrics=['first','pips','minus','block','turns'];
   return [k,{positions:rs.length,delta:Object.fromEntries(metrics.map(m=>{
    const xs=rs.map(x=>x.byPolicy[policy][m]);return [m,{mean:avg(xs),ci95:ci(xs)}];
   })),positiveFirst:rs.filter(x=>x.byPolicy[policy].first>0).length,
   negativeFirst:rs.filter(x=>x.byPolicy[policy].first<0).length,
   pairwiseHybridFinishRegret:avg(rs.map(x=>Math.max(0,-x.byPolicy[policy].first))),
   pairwisePassFinishRegret:avg(rs.map(x=>Math.max(0,x.byPolicy[policy].first)))}];
  }));
 }
 return out;
}
function run(start=1064809,scan=800,limit=30,worlds=50){
 if(![start,scan,limit,worlds].every(Number.isInteger)||scan<1||limit<1||worlds<1)throw Error('invalid args');
 const rows=[],selected=[],discovered={1:0,2:0,3:0};let scanned=0;
 for(let seed=start;seed<start+scan&&rows.length<limit;seed++){
  scanned++;const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('initializer '+seed);
  let best=null;
  for(let seat=0;seat<3;seat++){
   const c=findLate(base,seat,seed);
   if(c&&(!best||c.handSize<best.handSize||(c.handSize===best.handSize&&c.turn<best.turn)))best=c;
  }
  if(!best)continue;
  discovered[best.handSize]++;selected.push(seed);rows.push(old.evaluate(best,worlds));
 }
 return {schema:'qosa-pass-pip-late-holdout/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9 later-round',seedScanRequested:[start,start+scan-1],seedScanActual:[start,start+scanned-1],
  scannedDeals:scanned,selectedSeeds:selected,selectedPositions:rows.length,byHandSize:discovered,
  hiddenWorldsPerPosition:worlds,hiddenAllocations:rows.length*worlds,
  forcedContinuations:rows.length*worlds*2*POLICIES.length,newFullStrategyRounds:0,
  selection:'one smallest-hand 1-3-stone disagreement per independent deal; discovery pass focal vs closed-branch-control opponents; evaluate pass vs pass-pip-0.01',
  hiddenWorldSeeds:'(Math.imul(dealSeed,1009)+Math.imul(focalSeat+1,1000003)+worldIndex+17000000)>>>0',
  metrics:'hybrid minus pass: finish-first, raw remaining pips, beneficial minus-finish, block, turn length; position-cluster exploratory CI; pairwise regret against the better of these two only',
  limitations:'uniform hidden worlds ignoring action history; branch opening provisional; 1-1 later-round initialization; no block winner; fixed continuation policies; selected divergence only; uncorrected exploratory intervals',
  summary:summarize(rows),positions:rows};
}
function test(){
 const base=init.initializeThreePlayerRound({seed:1064821,isFirstRound:false,previousWinnerIndex:1064821%3});
 const a=findLate(base,0,1064821),b=findLate(base,0,1064821);
 if(!a||a.handSize!==3||a.pass.key===a.hybrid.key||JSON.stringify(a)!==JSON.stringify(b))throw Error('late discovery replay');
 const x=run(1064821,2,1,2),y=run(1064821,2,1,2);
 if(JSON.stringify(x)!==JSON.stringify(y)||x.selectedPositions!==1||x.forcedContinuations!==8)throw Error('paired replay');
 return {passed:true,selectedPositions:x.selectedPositions,forcedContinuations:x.forcedContinuations};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1064809),+(a[1]||800),+(a[2]||30),+(a[3]||50)),null,2));}
module.exports={findLate,summarize,run,test};
