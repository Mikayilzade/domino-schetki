'use strict';
// Two-double 2-6 confounding holdout; recovered qosa-1.0.0 branch semantics provisional.
// Usage: node qosha-research/simulator/two-double-confound-runner.js 1075000 2500 moderate-double-hold
const e=require('./engine'),r=require('./round-driver'),init=require('./initializer'),s=require('./strategy-runner');
const ENGINE='qosa-research-0.5.3';
const PAIRS=['0-2','0-3','0-4','0-5','0-6','2-3','2-4','2-5','2-6','3-4','3-5','3-6','4-5','4-6','5-6'];
function features(hand,starter){
 const ds=hand.filter(t=>t[0]===t[1]&&t[0]!==1).map(t=>t[0]).sort((a,b)=>a-b);
 if(ds.length!==2)return null;
 const ordinary=hand.filter(t=>t[0]!==t[1]);
 return {pair:ds.join('-'),starter:+starter,pipBin:12*Math.floor(e.pipSum(hand)/12),bothConnected:+ds.every(n=>ordinary.some(t=>t.includes(n)))};
}
function blank(){return {n:0,gain:0,loss:0,controlWins:0,holdWins:0,pipsDelta:0,minusDelta:0,blockDelta:0,turnDelta:0};}
function add(g,a,b,focal){
 g.n++;
 const aw=a.outcome.kind==='finish'&&a.outcome.playerIndex===focal,bw=b.outcome.kind==='finish'&&b.outcome.playerIndex===focal;
 g.gain+=+(aw&&!bw);g.loss+=+(bw&&!aw);g.controlWins+=+aw;g.holdWins+=+bw;
 g.pipsDelta+=e.pipSum(a.hands[focal])-e.pipSum(b.hands[focal]);
 g.minusDelta+=+(aw&&a.outcome.minus<0)-+(bw&&b.outcome.minus<0);
 g.blockDelta+=+(a.outcome.kind==='block')-+(b.outcome.kind==='block');
 g.turnDelta+=a.turns-b.turns;
}
function diff(g){return (g.gain-g.loss)/g.n;}
function group(g){return {n:g.n,controlFinish:g.controlWins/g.n,holdFinish:g.holdWins/g.n,deltaPP:100*diff(g),meanPipsDelta:g.pipsDelta/g.n,minusDeltaPP:100*g.minusDelta/g.n,blockDeltaPP:100*g.blockDelta/g.n,meanTurnDelta:g.turnDelta/g.n,pairedGain:g.gain,pairedLoss:g.loss};}
function addAggregates(a,b){for(const k of Object.keys(a))a[k]+=b[k];}
function adjusted(cells,comparator){
 let covered=0,strata=0,weighted=0,targetAll=0;
 const strataMap={};
 for(const [key,g] of Object.entries(cells)){
  const [pair,starter,pipBin,connected]=key.split('|');
  const stratum=[starter,pipBin,connected].join('|');
  const row=strataMap[stratum]||(strataMap[stratum]={target:blank(),other:blank()});
  if(pair==='2-6')addAggregates(row.target,g);
  else if(comparator==='all'||(comparator==='other6'&&pair.endsWith('-6')))addAggregates(row.other,g);
 }
 for(const {target,other} of Object.values(strataMap)){
  targetAll+=target.n;
  if(target.n<1||other.n<3)continue;
  covered+=target.n;strata++;
  weighted+=target.n*(diff(target)-diff(other));
 }
 return {comparator,targetSeats:targetAll,coveredTargetSeats:covered,coverage:targetAll?covered/targetAll:0,strata,adjustedDifferencePP:covered?100*weighted/covered:null};
}
function run(startSeed,count,opponents='moderate-double-hold'){
 if(!Number.isInteger(startSeed)||!Number.isInteger(count)||count<1||!['moderate-double-hold','min-hand-pips','fast-doubles'].includes(opponents))throw Error('invalid arguments');
 const cells={},pairs={},all=blank(),checks={deals:0,eligible:0,rounds:0,unresolved:0,deck:0};
 for(let seed=startSeed;seed<startSeed+count;seed++){
  const deal=e.dealThreeByNine(seed);
  if(new Set([...deal.hands.flat(),...deal.stock].map(e.tileKey)).size!==28)throw Error('deck '+seed);
  checks.deals++;checks.deck++;
  const base=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('initializer '+seed);
  for(let focal=0;focal<3;focal++){
   const f=features(deal.hands[focal],focal===base.starter);if(!f)continue;
   checks.eligible++;
   const play=policy=>r.runRound(base,(opts,state)=>s.chooseBy(state.currentPlayer===focal?policy:opponents,opts,{seed,rotation:0,turns:state.turns,player:state.currentPlayer,salt:0}),{maxTurns:200});
   const a=play('closed-branch-control'),b=play('moderate-double-hold');
   if(a.outcome.kind==='unresolved'||b.outcome.kind==='unresolved'){checks.unresolved++;throw Error('unresolved '+seed+' '+focal);}
   checks.rounds+=2;
   add(all,a,b,focal);add(pairs[f.pair]||(pairs[f.pair]=blank()),a,b,focal);
   const key=[f.pair,f.starter,f.pipBin,f.bothConnected].join('|');
   add(cells[key]||(cells[key]=blank()),a,b,focal);
  }
 }
 if(checks.rounds!==2*checks.eligible||Object.values(pairs).reduce((sum,g)=>sum+g.n,0)!==checks.eligible||Object.values(cells).reduce((sum,g)=>sum+g.n,0)!==checks.eligible)throw Error('accounting');
 return {engine:ENGINE,rules:'recovered qosa-1.0.0 3x9, branch opening provisional',startSeed,endSeed:startSeed+count-1,opponents,checks,all:group(all),pairs:Object.fromEntries(PAIRS.map(p=>[p,pairs[p]?group(pairs[p]):null])),adjusted:[adjusted(cells,'other6'),adjusted(cells,'all')],cells:Object.entries(cells).sort(([a],[b])=>a.localeCompare(b)).map(([k,g])=>[k,g.n,g.gain,g.loss,g.controlWins,g.holdWins,g.pipsDelta,g.minusDelta,g.blockDelta,g.turnDelta])};
}
function selfTest(){const a=run(1075000,12),b=run(1075000,12);if(JSON.stringify(a)!==JSON.stringify(b))throw Error('nondeterministic');return{deterministic12:true,deck:a.checks.deck,unresolved:a.checks.unresolved};}
if(require.main===module){const start=Number(process.argv[2]||1075000),count=Number(process.argv[3]||2500),opponents=process.argv[4]||'moderate-double-hold';console.log(JSON.stringify({selfTest:selfTest(),result:run(start,count,opponents)},null,2));}
module.exports={ENGINE,features,run,selfTest,adjusted};
