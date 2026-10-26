'use strict';
// Disjoint matched-seed opponent-robustness experiment; four-side number-lock PROVISIONAL.
// node qosha-research/simulator/random-opponent-policy-holdout.js test
// node qosha-research/simulator/random-opponent-policy-holdout.js 1560340 240
const e=require('./engine'),r=require('./round-driver'),i=require('./initializer'),b=require('./strategy-runner');
const ARMS=['closed-branch-control','min-hand-pips','fast-doubles','moderate-double-hold'];
const MIXES=[['random-legal','random-legal'],['random-legal','closed-branch-control'],['random-legal','min-hand-pips']];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const median=a=>{if(!a.length)return null;const z=[...a].sort((x,y)=>x-y),n=z.length;return n%2?z[(n-1)/2]:(z[n/2-1]+z[n/2])/2;};
function ci(a){const m=mean(a),v=a.length>1?a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1):0;
 return{n:a.length,mean:m,halfWidth95:a.length>1?1.96*Math.sqrt(v/a.length):null};}
function check(x,msg){if(!x)throw Error('random opponent holdout: '+msg);}
function summarize(rows){
 const out={observations:rows.length,distinctDeals:new Set(rows.map(x=>x[0])).size,byArm:{},pairedVsClosed:{}};
 const seeds=[...new Set(rows.map(x=>x[0]))],clusters=seeds.map(s=>rows.filter(x=>x[0]===s));
 for(let a=0;a<ARMS.length;a++){
  const z=rows.map(x=>x[4+a]),n=z.length;
  const initialDoubles=rows.map(x=>x[3]);
  const byDouble={};
  for(let pip=0;pip<=6;pip++){
   const sub=rows.filter(x=>x[3].includes(pip));
   byDouble[pip+'-'+pip]={n:sub.length,finishFirstRate:mean(sub.map(x=>x[4+a][0])),
    meanFinalPips:mean(sub.map(x=>x[4+a][1]))};
  }
  out.byArm[ARMS[a]]={finishFirstRate:mean(z.map(x=>x[0])),meanFinalPips:mean(z.map(x=>x[1])),
   medianFinalPips:median(z.map(x=>x[1])),blockRate:mean(z.map(x=>x[3])),
   minusFinishRate:mean(z.map(x=>+(x[2]<0))),meanTurns:mean(z.map(x=>x[4])),
   meanStartingDoubles:mean(initialDoubles.map(x=>x.length)),meanEndingDoubles:mean(z.map(x=>x[5])),
   meanFocalDoubleOpenings:mean(z.map(x=>x[6])),meanFocalMultiChoicePoints:mean(z.map(x=>x[7])),
   byInitialDouble:byDouble};
  if(a){const paired=f=>ci(clusters.map(g=>mean(g.map(x=>f(x[4+a],x[4])))));
   out.pairedVsClosed[ARMS[a]]={finishFirstDeltaPP:paired((x,y)=>100*(x[0]-y[0])),
    finalPipsDelta:paired((x,y)=>x[1]-y[1]),blockDeltaPP:paired((x,y)=>100*(x[3]-y[3])),
    minusFinishDeltaPP:paired((x,y)=>100*(+(x[2]<0)-+(y[2]<0))),
    focalOpeningDelta:paired((x,y)=>x[6]-y[6])};}
 }
 return out;
}
function run(start=1560340,count=240){
 check(Number.isInteger(start)&&Number.isInteger(count)&&count>=2&&count%2===0&&count<=3000,'seed arguments');
 const rows=[],minus={'-10':0,'-20':0,'-30':0,'-40':0};
 let rounds=0,finishes=0,blocks=0,turns=0;
 for(let seed=start;seed<start+count;seed++){
  const base=i.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  check(base.kind==='ready','initializer '+seed);
  for(let seat=0;seat<3;seat++)for(let mi=0;mi<MIXES.length;mi++){
   const startDoubles=base.hands[seat].filter(t=>t[0]===t[1]).map(t=>t[0]).sort((a,b)=>a-b);
   const results=[];
   for(let ai=0;ai<ARMS.length;ai++){
    const profiles=[];profiles[seat]=ARMS[ai];
    profiles[(seat+1)%3]=MIXES[mi][0];profiles[(seat+2)%3]=MIXES[mi][1];
    let opened=0,choices=0;
    const out=r.runRound(base,(opts,s)=>{
     const p=s.currentPlayer;
     const action=b.chooseBy(profiles[p],opts,{seed,rotation:seat,turns:s.turns,player:p});
     if(p===seat){choices+=+(opts.actions.length>1);if(action.type==='double-sequence'||action.type==='mixed-finish')opened+=(action.numbers||[]).length;}
     return action;
    },{maxTurns:200});
    check(out.outcome.kind!=='unresolved','unresolved '+seed);
    rounds++;turns+=out.turns;
    if(out.outcome.kind==='finish'){finishes++;if(out.outcome.minus<0)minus[String(out.outcome.minus)]++;}
    else blocks++;
    const win=out.outcome.kind==='finish'&&out.outcome.playerIndex===seat;
    results.push([+win,e.pipSum(out.hands[seat]),win?out.outcome.minus:0,+(out.outcome.kind==='block'),
     out.turns,out.hands[seat].filter(t=>t[0]===t[1]).length,opened,choices]);
   }
   rows.push([seed,seat,mi,startDoubles,...results]);
  }
 }
 const mid=start+count/2,summary={};
 for(const [name,filter] of [['discovery',x=>x[0]<mid],['holdout',x=>x[0]>=mid],['combined',()=>true]]){
  summary[name]={};for(let mi=0;mi<MIXES.length;mi++)summary[name][MIXES[mi].join('+')]=summarize(rows.filter(x=>filter(x)&&x[2]===mi));
 }
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-random-opponent-policy-holdout/v1',timestampAsiaBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0, 3x9, number-lock/four-side PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,deals:count,discovery:[start,mid-1],holdout:[mid,start+count-1],
  arms:ARMS,opponentMixes:MIXES,fullRounds:rounds,finishes,blocks,unresolved:0,meanTurns:turns/rounds,minusFinishes:minus,summary,
  rowFormat:'[seed,focalSeat,mixIndex,initialDoubleNumbers,closed[finish,pips,minus,block,turns,endingDoubles,doubleOpenings,multiChoicePoints],min[same],fast[same],moderate[same]]',
  rows,design:'3 focal seats x 3 opponent mixes x 4 focal arms per deal; identical initial deals per comparison. Random-legal opponent action is deterministic per seed, turn and seat. Discovery/holdout disjoint. Paired exploratory uncorrected 95% normal half-widths cluster by deal, not by repeated seats.',
  limitations:'Number-lock/four-side geometry provisional. Block winner, loneZero, bust and 101-match unvalidated; finish-first not match victory. Random-legal is a simple bot, not a human. Repeated seats and mixes correlated, exploratory intervals uncorrected. Per-initial-double and opening counts are descriptive, not causal. No new hidden-world regret estimates this pass.',
  next:'If branch control remains better against random legal opponents in both halves, replicate with mixed/tempo opponents; prioritize authentic branch-opening and block scoring fixtures.'};
}
function test(){
 const four=require('./four-branch-lock-kernel-test'),score=require('./scoring-contract-test');
 check(four.test().passed&&score.test().passed,'contract fixtures');
 const x=run(1560340,2),y=run(1560340,2);
 delete x.timestampAsiaBaku;delete y.timestampAsiaBaku;
 check(JSON.stringify(x)===JSON.stringify(y),'deterministic replay');
 check(x.fullRounds===72&&x.rows.length===18&&x.unresolved===0,'round accounting');
 return{passed:true,fixture:'four-branch synthetic + score floor/block contracts',replayDeals:2,replayRounds:72};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1560340),+(a[1]||240)),null,2));}
module.exports={run,test,ARMS,MIXES};