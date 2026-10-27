'use strict';
// Non-certain next-opponent pass calibration, 3x9, provisional number-lock.
// node qosha-research/simulator/pass-next-uncertain-audit.js test
// node qosha-research/simulator/pass-next-uncertain-audit.js 1584340 3600
const base=require('./pass-next-calibration');
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const uncertain=a=>a.conditional>1e-12&&a.conditional<1-1e-12;
function stats(rows,filter){
 const clusters=rows.map(r=>r.actions.filter(filter)).filter(a=>a.length);
 const a=clusters.flat(),v=clusters.map(z=>avg(z.map(x=>x.brierUniform-x.brierConditional)));
 const m=avg(v),n=v.length;
 const bins=Array.from({length:5},(_,i)=>{const b=a.filter(x=>x.conditional>=i/5&&(i===4?x.conditional<=1:x.conditional<(i+1)/5));return{lo:i/5,hi:(i+1)/5,n:b.length,pred:avg(b.map(x=>x.conditional)),actual:avg(b.map(x=>x.actual))};});
 return{positions:n,labels:a.length,uniformBrier:avg(a.map(x=>x.brierUniform)),conditionalBrier:avg(a.map(x=>x.brierConditional)),gain:m,halfWidth95:n>1?1.96*Math.sqrt(v.reduce((s,x)=>s+(x-m)**2,0)/(n*(n-1))):null,meanPrediction:avg(a.map(x=>x.conditional)),actualPassRate:avg(a.map(x=>x.actual)),bias:avg(a.map(x=>x.conditional-x.actual)),ece5:a.length?bins.reduce((s,b)=>s+b.n/a.length*(b.n?Math.abs(b.pred-b.actual):0),0):null,bins};
}
function run(start=1584340,count=3600){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<2||count>5000||count%2)throw Error('invalid seed/count');
 const x=base.run(start,count),rows=x.rows,all=rows.flatMap(r=>r.actions);
 if(x.baselineRounds!==6*count||all.length!==x.actionOutcomes||all.some(a=>a.conditional<0||a.conditional>1||a.uniform<0||a.uniform>1||![0,1].includes(a.actual)))throw Error('invariants');
 const s={all:stats(rows,()=>true),uncertain:stats(rows,uncertain),certain:stats(rows,a=>!uncertain(a)),
  discovery:stats(rows.filter(r=>r.seed<start+count/2),uncertain),
  holdout:stats(rows.filter(r=>r.seed>=start+count/2),uncertain),
  onePass:stats(rows.filter(r=>!r.both),uncertain),
  bothPass:stats(rows.filter(r=>r.both),uncertain),
  byMix:[0,1].map(i=>stats(rows.filter(r=>r.mix===i),uncertain)),
  certainCount:all.filter(a=>!uncertain(a)).length,
  certainErrors:all.filter(a=>!uncertain(a)&&a.conditional!==a.actual).length};
 if(s.uncertain.labels+s.certainCount!==all.length||s.byMix.reduce((n,z)=>n+z.labels,0)!==s.uncertain.labels)throw Error('partition');
 return{schema:'qosha-pass-next-uncertain-audit/v1',timestampAsiaBaku:x.timestampAsiaBaku,engine:x.engine,rules:x.rules,
  seedStart:start,seedEnd:start+count-1,deals:count,baselineRounds:x.baselineRounds,
  finishes:x.finishes,blocks:x.blocks,unresolved:x.unresolved,meanRoundTurns:x.meanRoundTurns,blockRate:x.blockRate,
  minusFinishes:x.minusFinishes,selectedPositions:x.selectedPositions,actionOutcomes:x.actionOutcomes,
  forcedHiddenWorldContinuations:0,strategies:x.strategies,opponentMixes:x.opponentMixes,baseline:x.baseline,
  summary:s,rows,design:'Publicly selected position per deal; two counterfactual next-opponent pass labels; exact combinatorial posterior; disjoint seed halves, Brier cluster CI by position; policy-mix sensitivity (NOT policy-choice weighted).',
  limitations:'Informative-pass selection bias; opponent action-choice likelihood ignored; correlated counterfactual actions; small BOTH-pass stratum; provisional branch number-lock; block winner/loneZero/bust/101 not validated; exploratory uncorrected intervals; next-pass is not match win.',
  nextAction:'Record public prior chosen actions and test explicitly policy-choice-weighted hidden allocations on new seeds; authenticate branch locking and blocked winner.'};
}
function test(){
 const a=run(1584340,8),b=run(1584340,8);delete a.timestampAsiaBaku;delete b.timestampAsiaBaku;
 if(JSON.stringify(a)!==JSON.stringify(b)||a.baselineRounds!==48||a.summary.all.labels!==a.actionOutcomes)throw Error('replay/accounting');
 return{passed:true,checks:4,pilotDeals:8,positions:a.selectedPositions};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1584340),+(a[1]||3600)),null,2));}
module.exports={run,test,stats,uncertain};