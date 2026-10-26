'use strict';
// Matched-seed broad strategy comparison + reachable action invariants.
// Four-branch number-lock remains PROVISIONAL.
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),b=require('./strategy-runner');
const four=require('./four-branch-lock-kernel-test'),score=require('./scoring-contract-test');
const ARMS=['closed-branch-control','min-hand-pips','fast-doubles','moderate-double-hold'];
const MIXES=[['closed-branch-control','closed-branch-control'],['min-hand-pips','min-hand-pips'],['closed-branch-control','min-hand-pips']];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const median=a=>{const z=[...a].sort((x,y)=>x-y);return z.length%2?z[(z.length-1)/2]:(z[z.length/2-1]+z[z.length/2])/2;};
const check=(v,m)=>{if(!v)throw Error('contract '+m);};
const ci=a=>{const m=mean(a),v=a.length>1?a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1):0;return{n:a.length,mean:m,halfWidth95:a.length>1?1.96*Math.sqrt(v/a.length):null};};
function audit(seed,rotation){
 const initial=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
 check(initial.kind==='ready','init');
 let s=r.cloneRoundState(initial),checked=0,turns=0;
 const played=[[1,1],...(initial.openingFollowup?[initial.openingFollowup.tile]:[])];
 while(!s.outcome&&s.turns<200){
  const p=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
  const before=JSON.stringify([s.branchState,[...s.openingState.openedNumbers],s.hands,s.stock]);
  check((opts.phase==='play')===(opts.actions.length>0),'options phase');
  for(const a of opts.phase==='play'?opts.actions:[null]){
   const t=d.applyTurn(s.branchState,s.openingState,s.hands[p],s.stock,a);
   const x=opts.hand.map(e.tileKey).sort().join(','),y=t.hand.concat(t.playedTiles).map(e.tileKey).sort().join(',');
   check(x===y,'hand conservation');
   check(t.stock.length===opts.stock.length,'stock conservation');
   for(const n of s.openingState.openedNumbers)check(t.openingState.openedNumbers.has(n),'open monotonic');
   const changed=e.SIDES.filter(side=>s.branchState.branches[side].end!==t.branchState.branches[side].end);
   if(!a)check(t.passed&&!t.playedTiles.length,'pass');
   else if(a.type==='double-sequence')check(changed.length===0&&t.playedTiles.length===a.numbers.length,'double geometry');
   else check(changed.length<=1&&changed.every(side=>side===a.side),'single geometry');
   check(before===JSON.stringify([s.branchState,[...s.openingState.openedNumbers],s.hands,s.stock]),'no mutation');
   checked++;
  }
  const action=opts.phase==='play'?b.chooseBy(ARMS[(turns+rotation)%ARMS.length],opts,{seed,turns:s.turns,player:p}):null;
  const tr=d.applyTurn(s.branchState,s.openingState,s.hands[p],s.stock,action);
  played.push(...tr.playedTiles);
  s=r.stepRound(s,()=>action);
  const all=played.concat(s.hands.flat(),s.stock).map(e.tileKey);
  check(all.length===28&&new Set(all).size===28,'28 unique tiles');
  turns++;
 }
 check(s.outcome&&s.outcome.kind!=='unresolved','termination');
 if(s.outcome.kind==='finish')check(s.hands[s.outcome.playerIndex].length===0,'empty winner hand');
 else check(s.outcome.kind==='block'&&s.outcome.playerIndex===null,'unresolved block winner');
 return{checked,turns,kind:s.outcome.kind};
}
function summarize(rows){
 const byArm={},comparisons={},seeds=[...new Set(rows.map(x=>x[0]))];
 for(let a=0;a<ARMS.length;a++){
  const z=rows.map(x=>x[3+a]);
  byArm[ARMS[a]]={finishFirstRate:mean(z.map(x=>x[0])),meanFinalPips:mean(z.map(x=>x[1])),
   medianFinalPips:median(z.map(x=>x[1])),blockRate:mean(z.map(x=>x[3])),
   minusFinishRate:mean(z.map(x=>+(x[2]<0))),meanTurns:mean(z.map(x=>x[4])),
   meanEndingDoubles:mean(z.map(x=>x[5]))};
  if(a){
   const group=seeds.map(seed=>rows.filter(x=>x[0]===seed));
   const dif=(f)=>ci(group.map(g=>mean(g.map(x=>f(x[3+a],x[3])))));
   comparisons[ARMS[a]+'-minus-closed']={
    winDeltaPP:dif((x,y)=>100*(x[0]-y[0])),
    pipsDelta:dif((x,y)=>x[1]-y[1]),
    blockDeltaPP:dif((x,y)=>100*(x[3]-y[3])),
    minusDeltaPP:dif((x,y)=>100*(+(x[2]<0)-+(y[2]<0)))};
  }
 }
 return{observations:rows.length,distinctDeals:seeds.length,byArm,comparisons};
}
function run(start=1559740,count=600){
 check(Number.isInteger(start)&&Number.isInteger(count)&&count>=2&&count%2===0&&count<=3000,'seed args');
 const rows=[],minus={'-10':0,'-20':0,'-30':0,'-40':0};
 let rounds=0,finishes=0,blocks=0,turns=0;
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  check(base.kind==='ready','initialization');
  for(let seat=0;seat<3;seat++)for(let mi=0;mi<3;mi++){
   const outcomes=[];
   for(let ai=0;ai<ARMS.length;ai++){
    const policies=[];policies[seat]=ARMS[ai];policies[(seat+1)%3]=MIXES[mi][0];policies[(seat+2)%3]=MIXES[mi][1];
    const end=r.runRound(base,(opts,s)=>b.chooseBy(policies[s.currentPlayer],opts,{seed,turns:s.turns,player:s.currentPlayer}),{maxTurns:200});
    check(end.outcome.kind!=='unresolved','round resolved');
    rounds++;turns+=end.turns;
    const win=end.outcome.kind==='finish'&&end.outcome.playerIndex===seat;
    if(end.outcome.kind==='finish'){finishes++;if(end.outcome.minus<0)minus[String(end.outcome.minus)]++;}
    else blocks++;
    outcomes.push([+win,e.pipSum(end.hands[seat]),win?end.outcome.minus:0,+(end.outcome.kind==='block'),
     end.turns,end.hands[seat].filter(t=>t[0]===t[1]).length]);
   }
   rows.push([seed,seat,mi,...outcomes]);
  }
 }
 const mid=start+count/2,summary={};
 for(const [name,pred] of [['discovery',x=>x[0]<mid],['holdout',x=>x[0]>=mid],['combined',()=>true]]){
  summary[name]={};
  for(let mi=0;mi<3;mi++)summary[name][MIXES[mi].join('+')]=summarize(rows.filter(x=>pred(x)&&x[2]===mi));
 }
 const audits=[];for(let seed=start;seed<start+12;seed++)for(let rot=0;rot<3;rot++)audits.push(audit(seed,rot));
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',
  day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-broad-policy-contract-audit/v1',timestampAsiaBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9; four-branch number-lock PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,deals:count,discovery:[start,mid-1],holdout:[mid,start+count-1],
  arms:ARMS,opponentMixes:MIXES,fullRounds:rounds,finishes,blocks,unresolved:0,
  meanTurns:turns/rounds,minusFinishes:minus,summary,
  contractAudit:{reachableRounds:audits.length,checkedAlternatives:audits.reduce((s,x)=>s+x.checked,0),
   turns:audits.reduce((s,x)=>s+x.turns,0),allPassed:true,excludedFromCumulative:true},
  rowFormat:'[seed,focalSeat,mixIndex,closed[win,pips,minus,block,turns,endingDoubles],min[same],fast[same],moderate[same]]',
  rows,design:'Four focal policies, three fixed opponent mixes, three focal seats, 36 matched complete rounds/deal. Split independent seed halves. Deal-cluster exploratory normal 95% intervals; no multiplicity correction.',
  limitations:'Number-lock/four-side geometry is a provisional assumption. Block winner, loneZero, bust and 101-point scoring unvalidated. Finish-first is not match win. Simple bots, correlated rotations, exploratory comparisons; not authenticated human tactics.',
  next:'If a broad strategy wins in both seed halves and multiple opponent mixes, test on independent seeds; otherwise seek authentic branch-open and block-winner fixtures.'};
}
function test(){
 check(four.test().passed,'four branch kernel');
 check(score.test().passed,'score contract');
 const a=run(1559740,2),z=run(1559740,2);
 delete a.timestampAsiaBaku;delete z.timestampAsiaBaku;
 check(JSON.stringify(a)===JSON.stringify(z),'replay');
 check(a.fullRounds===72&&a.rows.length===18&&a.contractAudit.allPassed,'replay totals');
 return{passed:true,replayRounds:72,contract:a.contractAudit};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1559740),+(a[1]||600)),null,2));}
module.exports={run,test,audit};
