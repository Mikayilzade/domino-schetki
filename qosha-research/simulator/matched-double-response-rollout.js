'use strict';
// Reproduce: node qosha-research/simulator/matched-double-response-rollout.js test
// Reproduce: node qosha-research/simulator/matched-double-response-rollout.js 40
const e=require('./engine'),d=require('./turn-dispatcher'),hw=require('./hidden-world'),dr=require('./decision-regret');
const {capture}=require('./consecutive-pass-forecast-runner'),{describe,matchedPair}=require('./matched-double-retention-runner');
const seeds=[3147315,3148251,3150395,3153250,3154001,3154153,3157113,3157675,3157696,3158507,3158948,3159510,3160473,3160598,3162540,3162948,3165876,3171721,3175574,3176263];
const policies=['closed-branch-control','min-hand-pips','fast-doubles'],cats=['both-play','both-pass','keep-only-pass','spend-only-pass'];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const stat=a=>{const m=mean(a),se=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length*(a.length-1))):null;return{positions:a.length,mean:m,exploratory95:se===null?null:[m-1.96*se,m+1.96*se]};};
function run(count=40,selected=seeds){
 if(!Number.isInteger(count)||count<1||!selected.length)throw Error('bad arguments');
 const rows=[];let unresolved=0;
 for(const seed of selected){
  const pos=capture(seed);if(!pos)throw Error('not reachable '+seed);
  const pair=matchedPair(describe(pos));if(!pair)throw Error('not matched '+seed);
  const [keep,spend]=pair,next=(pos.spec.focalPlayer+1)%3,by=new Map(pos.actions.map(a=>[dr.actionKey(a),a]));
  const state=pair.map(row=>d.applyTurn(pos.spec.visibleState.branchState,pos.spec.visibleState.openingState,pos.spec.focalHand,[],by.get(row.key)));
  const sets=state.map(s=>new Set(pos.pool.filter(t=>d.actionsForHand(s.branchState,s.openingState,[t]).length).map(e.tileKey)));
  const shared=[...sets[0]].filter(k=>sets[1].has(k)).length;
  if(sets[0].size!==sets[1].size||sets[0].size!==keep.k||keep.discardPips!==spend.discardPips||keep.remaining!==spend.remaining||keep.doublesRetained<=spend.doublesRetained)throw Error('matching failed');
  const snapshot=JSON.stringify(pos.spec.visibleState),worldSeedStart=(1120000000+Math.imul(seed,71))>>>0;
  const categoryCounts=Object.fromEntries(cats.map(c=>[c,0]));
  const metrics=Object.fromEntries(policies.map(p=>[p,Object.fromEntries(['all',...cats].map(c=>[c,{n:0,first:0,pips:0,minus:0,block:0,turns:0}]))]));
  for(let wi=0;wi<count;wi++){
   const wseed=(worldSeedStart+wi)>>>0,w=hw.sampleWorld(pos.spec,wseed);
   const can=state.map(s=>d.actionsForHand(s.branchState,s.openingState,w.hands[next]).length>0);
   const cat=can[0]?(can[1]?'both-play':'spend-only-pass'):(can[1]?'keep-only-pass':'both-pass');
   categoryCounts[cat]++;
   for(const p of policies){
    const res=dr.evaluateDecisionInWorld(w,{focalPlayer:pos.spec.focalPlayer,continuationStrategy:p,seed:wseed,maxTurns:200});
    if(res.kind!=='paired-world')throw Error('not paired');
    const actions=new Map(res.candidates.map(r=>[r.actionKey,r])),a=actions.get(keep.key),b=actions.get(spend.key);
    if(!a||!b)throw Error('lost action');
    if(a.outcome==='unresolved'||b.outcome==='unresolved')unresolved++;
    const diff={first:(+a.focalFinishedFirst)-(+b.focalFinishedFirst),pips:a.focalRemainder-b.focalRemainder,
      minus:(+(a.focalMinus<0))-(+(b.focalMinus<0)),block:(+(a.outcome==='block'))-(+(b.outcome==='block')),turns:a.turns-b.turns};
    for(const bucket of [metrics[p].all,metrics[p][cat]]){bucket.n++;for(const k in diff)bucket[k]+=diff[k];}
   }
  }
  if(JSON.stringify(pos.spec.visibleState)!==snapshot)throw Error('mutation');
  rows.push({seed,turn:pos.turn,nextHand:pos.spec.hiddenHandSizes[next],keepAction:keep.key,spendAction:spend.key,
   keepDoubles:keep.doublesRetained,spendDoubles:spend.doublesRetained,discardPips:keep.discardPips,k:keep.k,
   sharedPlayable:shared,worldSeedStart,categoryCounts,metrics});
 }
 const summary=Object.fromEntries(policies.map(p=>[p,{
  all:Object.fromEntries(['first','pips','minus','block','turns'].map(k=>[k,stat(rows.map(r=>r.metrics[p].all[k]/count))])),
  categories:Object.fromEntries(cats.map(c=>[c,{worlds:rows.reduce((s,r)=>s+r.metrics[p][c].n,0),
   first:stat(rows.filter(r=>r.metrics[p][c].n).map(r=>r.metrics[p][c].first/r.metrics[p][c].n)),
   pips:stat(rows.filter(r=>r.metrics[p][c].n).map(r=>r.metrics[p][c].pips/r.metrics[p][c].n))}])),
  overlap:Object.fromEntries(['zero','positive'].map(g=>[g,stat(rows.filter(r=>g==='zero'?r.sharedPlayable===0:r.sharedPlayable>0).map(r=>r.metrics[p].all.first/count))]))
 }]));
 return{schema:'qosa-matched-double-response-rollout/v1',timestampBaku:'2026-10-14 03:46 +04:00',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  selectedSeeds:selected,seedSetOrigin:'previous independent 2026-10-14 geometry audit; new hidden-world seeds, no newly selected deals',
  worldSeedFormula:'(1120000000+Math.imul(dealSeed,71)+worldIndex)>>>0',worldsPerPosition:count,positions:rows.length,
  hiddenWorlds:rows.length*count,policyWorldEvaluations:rows.length*count*policies.length,unresolved,
  newFullStrategyRounds:0,verifiedPriorFullStrategyRounds:180000,policies,summary,rows,
  limitations:'Two-pass-selected first eligible matched pair, K/pips matched but exact branch geometry differs; uniform hidden allocations, deterministic bots, assumed opening semantics, block winner unassigned; immediate pass category is post-action mediator and not causal isolation of double retention.',
  next:'Independent earlier-game matched-geometry controls and history-conditioned opponent hidden worlds; do not promote double-retention as causal rule.'};
}
function test(){const a=run(3,seeds.slice(0,2)),b=run(3,seeds.slice(0,2));if(a.unresolved||JSON.stringify(a.rows)!==JSON.stringify(b.rows))throw Error('determinism');for(const r of a.rows)if(cats.reduce((s,c)=>s+r.categoryCounts[c],0)!==3)throw Error('partition');return{passed:true,positions:2,worlds:6};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||40)),null,2));}
module.exports={run,test,seeds};
