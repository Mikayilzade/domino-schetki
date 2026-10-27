'use strict';
// Conservative public-history-only opponent-choice mismatch guard.
// Four-side number-lock remains PROVISIONAL.
// node qosha-research/simulator/pass-choice-mismatch-guard.js test
// node qosha-research/simulator/pass-choice-mismatch-guard.js 1595740 1200 64
const out=require('./pass-choice-outfamily');
const ok=(v,m)=>{if(!v)throw Error('mismatch-guard: '+m);};
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const uncertain=a=>a.passOnly>1e-12&&a.passOnly<1-1e-12;
const CANDIDATES=[
 {id:'pass-only',w:0,minESS:0,minEvents:0},
 {id:'quarter-shrink',w:0.25,minESS:0,minEvents:0},
 {id:'half-shrink',w:0.5,minESS:0,minEvents:0},
 {id:'full-history',w:1,minESS:0,minEvents:0},
 {id:'half-ess80',w:0.5,minESS:0.8,minEvents:0},
 {id:'half-ess90',w:0.5,minESS:0.9,minEvents:0},
 {id:'half-3events',w:0.5,minESS:0,minEvents:3}
];
function predict(row,a,c){
 const w=row.blindESSFraction>=c.minESS&&row.choiceEvents>=c.minEvents?c.w:0;
 const p=a.passOnly+w*(a.choiceBlind-a.passOnly);
 ok(p>=-1e-10&&p<=1+1e-10,'probability');
 return Math.min(1,Math.max(0,p));
}
function score(rows,c){
 const clusters=[],base=[],pred=[];let changed=0;
 for(const row of rows){
  const acts=row.actions.filter(uncertain);if(!acts.length)continue;
  const diffs=[];
  for(const a of acts){
   const p=predict(row,a,c),b=(a.passOnly-a.actual)**2,v=(p-a.actual)**2;
   base.push(b);pred.push(v);diffs.push(b-v);
   if(Math.abs(p-a.passOnly)>1e-12)changed++;
  }
  clusters.push(avg(diffs));
 }
 const n=clusters.length,m=avg(clusters);
 const se=n>1?Math.sqrt(clusters.reduce((s,x)=>s+(x-m)**2,0)/(n*(n-1))):null;
 return{positions:n,labels:base.length,baselineBrier:avg(base),guardedBrier:avg(pred),
  clusterGain:m,clusterHalfWidth95:se===null?null:1.96*se,
  clusterHalfWidth99:se===null?null:2.576*se,changedLabels:changed};
}
function choose(discovery){
 const trials=CANDIDATES.map(c=>({id:c.id,stats:score(discovery,c)}));
 const viable=trials.slice(1).filter(x=>x.stats.positions>=80&&x.stats.clusterGain>x.stats.clusterHalfWidth99+0.003);
 viable.sort((a,b)=>(b.stats.clusterGain-b.stats.clusterHalfWidth99)-(a.stats.clusterGain-a.stats.clusterHalfWidth99));
 const selected=CANDIDATES.find(x=>x.id===(viable[0]?.id||'pass-only'));
 return{selected,trials,rule:'At least 80 non-certain discovery position clusters and 99% cluster lower bound >+0.003 Brier units. Otherwise exact pass-only. Gate never sees actual outcomes or opponent labels.'};
}
function run(start=1595740,count=1200,worlds=64){
 ok(Number.isInteger(start)&&Number.isInteger(count)&&count>=8&&count%2===0,'seed args');
 const raw=out.run(start,count,worlds),split=start+count/2;
 const disc=raw.rows.filter(x=>x.seed<split),hold=raw.rows.filter(x=>x.seed>=split);
 const training=choose(disc),c=training.selected;
 return{...raw,schema:'qosha-pass-choice-mismatch-guard/v1',
  guard:{selected:c.id,selectionRule:training.rule,discoveryTrials:training.trials,
   discoverySelected:score(disc,c),holdoutSelected:score(hold,c),
   holdoutCandidates:CANDIDATES.map(x=>({id:x.id,stats:score(hold,x)})),
   allSelected:score(raw.rows,c),
   holdoutByOpponentMix:raw.opponentMixes.map((pair,i)=>({pair,stats:score(hold.filter(x=>x.mix===i),c)})),
   holdoutBothPass:score(hold.filter(x=>x.both),c),
   holdoutOnePass:score(hold.filter(x=>!x.both),c),
   discoverySeeds:[start,split-1],untouchedHoldoutSeeds:[split,start+count-1]},
  design:raw.design+' Public-history-only predeclared shrinkage/ESS/event guard. Selection uses only first-half labels; untouched second-half holdout. No oracle opponent labels in gate. Exact combinatorial pass-only baseline.',
  limitations:raw.limitations+' Training comparisons use a conservative 99% per-candidate cluster bound and margin, not a family-wise guarantee. No human-policy inference. Brier is not game-win rate.',
  nextAction:'Retain exact pass-only if mismatch guard does not improve untouched holdout. Authenticate real branch opening/locking and blocked-round winner; then evaluate paired move regret.'};
}
function test(){
 const a={passOnly:0.4,choiceBlind:0.8,actual:0},row={blindESSFraction:0.95,choiceEvents:4,actions:[a]};
 ok(Math.abs(predict(row,a,CANDIDATES[2])-0.6)<1e-12,'half shrink');
 const p=predict(row,a,CANDIDATES[2]);a.actual=1;
 ok(p===predict(row,a,CANDIDATES[2]),'no outcome leakage');
 ok(predict({...row,blindESSFraction:0.1},a,CANDIDATES[4])===a.passOnly,'low ESS fallback');
 const x=run(1595740,8,8),y=run(1595740,8,8);
 delete x.timestampAsiaBaku;delete y.timestampAsiaBaku;
 ok(JSON.stringify(x)===JSON.stringify(y),'deterministic replay');
 ok(x.baselineRounds===96&&x.guard.selected==='pass-only','small sample fallback');
 ok(x.guard.holdoutSelected.labels<=2*x.selectedPositions,'accounting');
 return{passed:true,checks:6,pilotDeals:8};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1595740),+(a[1]||1200),+(a[2]||64)),null,2));
}
module.exports={run,test,predict,score,choose,CANDIDATES};