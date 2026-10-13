'use strict';
// Matched-pip / matched-newly-playable-count double retention study.
// Reproduce: node qosha-research/simulator/matched-double-retention-runner.js 2985000 3065000 30 60
const e=require('./engine'),d=require('./turn-dispatcher'),hw=require('./hidden-world');
const dr=require('./decision-regret'),{capture}=require('./consecutive-pass-forecast-runner');
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function describe(pos){
 const {spec,pool}=pos;
 return pos.actions.map(action=>{
  const tr=d.applyTurn(spec.visibleState.branchState,spec.visibleState.openingState,spec.focalHand,[],action);
  return{key:dr.actionKey(action),discardPips:e.pipSum(action.tiles||[action.tile]),
   k:pool.filter(t=>d.actionsForHand(tr.branchState,tr.openingState,[t]).length>0).length,
   remaining:tr.hand.length,doublesRetained:tr.hand.filter(t=>t[0]===t[1]).length,after:tr.hand};
 });
}
function matchedPair(rows){
 for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
  const a=rows[i],b=rows[j];
  if(a.remaining>0&&b.remaining>0&&a.k===b.k&&a.discardPips===b.discardPips&&
     a.remaining===b.remaining&&a.doublesRetained!==b.doublesRetained)
   return a.doublesRetained>b.doublesRetained?[a,b]:[b,a];
 }
 return null;
}
function ci(xs){
 const m=mean(xs),se=xs.length>1?Math.sqrt(xs.reduce((s,x)=>s+(x-m)**2,0)/(xs.length*(xs.length-1))):null;
 return{mean:m,exploratory95:se===null?null:[m-1.96*se,m+1.96*se],
  positive:xs.filter(x=>x>0).length,negative:xs.filter(x=>x<0).length,tied:xs.filter(x=>x===0).length};
}
function run(start=2985000,end=3065000,limit=30,worldCount=60){
 if(![start,end,limit,worldCount].every(Number.isInteger)||start>=end||limit<1||worldCount<1)throw Error('bad arguments');
 const rows=[];let scanned=0,eligiblePositions=0,unresolved=0;
 for(let seed=start;seed<end&&rows.length<limit;seed++){
  scanned++;const pos=capture(seed);if(!pos)continue;eligiblePositions++;
  const spec=pos.spec,pair=matchedPair(describe(pos));if(!pair)continue;
  const [keep,spend]=pair,next=(spec.focalPlayer+1)%3,worldSeedStart=(930000000+Math.imul(seed,677))>>>0;
  const before=JSON.stringify(spec.visibleState);
  const retainedNumbers=keep.after.filter(t=>t[0]===t[1]).map(t=>t[0]);
  const connectorDoubles=retainedNumbers.filter(x=>keep.after.some(t=>t[0]!==t[1]&&(t[0]===x||t[1]===x))).length;
  const totals=Object.fromEntries(policies.map(p=>[p,{first:0,pips:0,minus:0,minusSeverity:0,block:0,turns:0,unresolved:0}]));
  for(let wi=0;wi<worldCount;wi++){
   const wseed=(worldSeedStart+wi)>>>0,world=hw.sampleWorld(spec,wseed);
   for(const policy of policies){
    const res=dr.evaluateDecisionInWorld(world,{focalPlayer:spec.focalPlayer,continuationStrategy:policy,seed:wseed,maxTurns:200});
    if(res.kind!=='paired-world')throw Error('bad paired world');
    const byKey=new Map(res.candidates.map(x=>[x.actionKey,x])),a=byKey.get(keep.key),b=byKey.get(spend.key);
    if(!a||!b)throw Error('missing candidate');
    const v=totals[policy];
    v.first+=(+a.focalFinishedFirst)-(+b.focalFinishedFirst);
    v.pips+=a.focalRemainder-b.focalRemainder;
    v.minus+=(+(a.focalMinus<0))-(+(b.focalMinus<0));
    v.minusSeverity+=a.focalMinus-b.focalMinus;
    v.block+=(+(a.outcome==='block'))-(+(b.outcome==='block'));
    v.turns+=a.turns-b.turns;
    v.unresolved+=+(a.outcome==='unresolved'||b.outcome==='unresolved');
   }
  }
  if(JSON.stringify(spec.visibleState)!==before)throw Error('source state mutated');
  unresolved+=policies.reduce((s,p)=>s+totals[p].unresolved,0);
  rows.push({seed,turn:pos.turn,focal:spec.focalPlayer,nextHand:spec.hiddenHandSizes[next],
   hand:spec.focalHand,k:keep.k,discardPips:keep.discardPips,remaining:keep.remaining,
   keepDoubles:keep.doublesRetained,spendDoubles:spend.doublesRetained,connectorDoubles,
   keepAction:keep.key,spendAction:spend.key,worldSeedStart,
   metrics:Object.fromEntries(policies.map(p=>[p,Object.fromEntries(Object.entries(totals[p]).map(([k,v])=>[k,v/worldCount]))]))});
 }
 const summary=Object.fromEntries(policies.map(p=>{
  const withConnector=rows.filter(r=>r.connectorDoubles>0),withoutConnector=rows.filter(r=>r.connectorDoubles===0);
  return[p,{positions:rows.length,first:ci(rows.map(r=>r.metrics[p].first)),
   pips:ci(rows.map(r=>r.metrics[p].pips)),minus:ci(rows.map(r=>r.metrics[p].minus)),
   block:ci(rows.map(r=>r.metrics[p].block)),
   withConnector:{n:withConnector.length,first:withConnector.length?mean(withConnector.map(r=>r.metrics[p].first)):null},
   withoutConnector:{n:withoutConnector.length,first:withoutConnector.length?mean(withoutConnector.map(r=>r.metrics[p].first)):null}}];
 }));
 return{schema:'qosa-matched-double-retention/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9',start,end,limit,worldCount,scanned,eligiblePositions,selectedPositions:rows.length,
  hiddenWorlds:rows.length*worldCount,policyWorldEvaluations:rows.length*worldCount*policies.length,
  unresolved,worldSeedFormula:'(930000000+Math.imul(dealSeed,677)+worldIndex)>>>0',
  selection:'first pair of nonterminal legal actions with equal removed pip sum, K, remaining hand size, different remaining double count; retain-more minus retain-fewer',
  policies,summary,rows,newFullStrategyRounds:0,verifiedPriorFullStrategyRounds:180000,
  limitations:'first eligible after two passes; first qualifying pair; K count not exact post-action branch geometry; uniform hidden worlds, deterministic bots, assumed branch rules, block winner unassigned, exploratory position intervals; not a causal effect of doubles.'};
}
function test(){
 const a=run(2985000,2995000,2,10),b=run(2985000,2995000,2,10);
 if(a.selectedPositions!==2||a.unresolved||JSON.stringify(a.rows)!==JSON.stringify(b.rows))throw Error('deterministic replay');
 for(const row of a.rows)if(row.keepDoubles<=row.spendDoubles)throw Error('double ordering');
 return{passed:true,seeds:a.rows.map(r=>r.seed),worlds:a.hiddenWorlds};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2985000),+(a[1]||3065000),+(a[2]||30),+(a[3]||60)),null,2));
}
module.exports={describe,matchedPair,run,test};
