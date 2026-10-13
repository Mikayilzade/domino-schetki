'use strict';
// node qosha-research/simulator/consecutive-pass-policy-runner.js 2940000 2950000 30 40
const d=require('./turn-dispatcher'),hw=require('./hidden-world'),dr=require('./decision-regret');
const {chooseBy}=require('./strategy-runner'),{capture,passProb}=require('./consecutive-pass-forecast-runner');
const policies=['closed-branch-control','min-hand-pips'];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function run(start=2940000,end=2950000,limit=30,count=40){
 if(![start,end,limit,count].every(Number.isInteger)||start>=end||limit<1||count<1)throw Error('args');
 const rows=[];let scanned=0,eligible=0,terminal=0,noDisagreement=0;
 for(let seed=start;seed<end&&rows.length<limit;seed++){
  scanned++;const pos=capture(seed);if(!pos)continue;
  const spec=pos.spec,before=JSON.stringify(spec.visibleState),next=(spec.focalPlayer+1)%3;
  const forecasts=pos.actions.map(a=>{
   const tr=d.applyTurn(spec.visibleState.branchState,spec.visibleState.openingState,spec.focalHand,[],a);
   const finish=tr.hand.length===0;
   const k=finish?null:pos.pool.filter(t=>d.actionsForHand(tr.branchState,tr.openingState,[t]).length>0).length;
   return{key:dr.actionKey(a),finish,k,pass:finish?null:passProb(pos.pool.length,k,spec.hiddenHandSizes[next])};
  });
  if(forecasts.some(x=>x.finish)){terminal++;continue;}
  eligible++;
  const selections={};
  for(const policy of policies){
   const ctx={seed,turns:pos.turn,player:spec.focalPlayer};
   const baseline=chooseBy(policy,{actions:pos.actions,hand:spec.focalHand},ctx);
   const baseKey=dr.actionKey(baseline),base=forecasts.find(x=>x.key===baseKey);
   const maxPass=Math.max(...forecasts.map(x=>x.pass));
   const ties=pos.actions.filter(a=>Math.abs(forecasts.find(x=>x.key===dr.actionKey(a)).pass-maxPass)<1e-12);
   const chosen=ties.some(a=>dr.actionKey(a)===baseKey)?baseline:
      chooseBy(policy,{actions:ties,hand:spec.focalHand},ctx);
   const preferredKey=dr.actionKey(chosen),pref=forecasts.find(x=>x.key===preferredKey);
   selections[policy]={baseKey,preferredKey,basePass:base.pass,preferredPass:pref.pass,
     baseK:base.k,preferredK:pref.k,changed:baseKey!==preferredKey};
  }
  if(policies.every(p=>!selections[p].changed)){noDisagreement++;continue;}
  const worldSeedStart=(820000000+Math.imul(seed,401))>>>0;
  const worlds=Array.from({length:count},(_,i)=>hw.sampleWorld(spec,(worldSeedStart+i)>>>0));
  const byPolicy={};
  for(const policy of policies){
   const s=selections[policy],v={first:0,pips:0,minus:0,minusPoints:0,block:0,unresolved:0};
   for(let i=0;i<count;i++){
    const result=dr.evaluateDecisionInWorld(worlds[i],{focalPlayer:spec.focalPlayer,
       continuationStrategy:policy,seed:(worldSeedStart+i)>>>0,maxTurns:200});
    if(result.kind!=='paired-world')throw Error('paired choice missing');
    const m=new Map(result.candidates.map(x=>[x.actionKey,x]));
    const a=m.get(s.baseKey),b=m.get(s.preferredKey);
    if(!a||!b)throw Error('candidate missing');
    v.first+=(+b.focalFinishedFirst)-(+a.focalFinishedFirst);
    v.pips+=b.focalRemainder-a.focalRemainder;
    v.minus+=(+(b.focalMinus<0))-(+(a.focalMinus<0));
    v.minusPoints+=b.focalMinus-a.focalMinus;
    v.block+=(+(b.outcome==='block'))-(+(a.outcome==='block'));
    v.unresolved+=+(a.outcome==='unresolved'||b.outcome==='unresolved');
   }
   byPolicy[policy]={...s,worlds:count,unresolved:v.unresolved,deltaFirst:v.first/count,
      deltaPips:v.pips/count,deltaMinus:v.minus/count,deltaMinusPoints:v.minusPoints/count,
      deltaBlock:v.block/count};
  }
  if(JSON.stringify(spec.visibleState)!==before)throw Error('visible state mutated');
  rows.push({seed,turn:pos.turn,focal:spec.focalPlayer,handSizes:spec.hiddenHandSizes,
    nUnknown:pos.pool.length,actions:pos.actions.length,worldSeedStart,byPolicy});
 }
 const summary={};
 for(const policy of policies){
  const a=rows.map(x=>x.byPolicy[policy]);
  const ci=metric=>{const xs=a.map(x=>x[metric]),m=mean(xs);
    const se=xs.length>1?Math.sqrt(xs.reduce((s,x)=>s+(x-m)**2,0)/(xs.length*(xs.length-1))):null;
    return{mean:m,exploratory95:se===null?null:[m-1.96*se,m+1.96*se]};};
  summary[policy]={positions:a.length,changed:a.filter(x=>x.changed).length,
    baselineMeanPass:mean(a.map(x=>x.basePass)),preferredMeanPass:mean(a.map(x=>x.preferredPass)),
    deltaFirst:ci('deltaFirst'),deltaPips:ci('deltaPips'),deltaMinus:ci('deltaMinus'),
    deltaBlock:ci('deltaBlock'),unresolved:a.reduce((s,x)=>s+x.unresolved,0)};
 }
 return{schema:'qosa-consecutive-pass-policy-matched/v1',timestampAsiaBaku:'2026-10-13 21:46 +04',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',start,end,limit,worldCount:count,
  scannedDeals:scanned,eligibleWithoutTerminal:eligible,skippedTerminal:terminal,
  skippedNoDifference:noDisagreement,selectedPositions:rows.length,hiddenWorlds:rows.length*count,
  seedFormula:'(820000000+Math.imul(dealSeed,401)+worldIndex)>>>0',policies,summary,rows,
  newFullStrategyRounds:0,verifiedPriorFullStrategyRounds:180000,
  limitations:'Selected first eligible disagreement positions only; uniform fixed-visible worlds, deterministic bots, assumed branch rules, block winner unassigned, unadjusted position intervals.',
  next:'Fresh disjoint-seed holdout on first-place and minus effects; audit nonconsecutive pass histories.'};
}
function test(){
 const a=run(2940000,2943000,2,10),b=run(2940000,2943000,2,10);
 if(a.selectedPositions!==2||JSON.stringify(a.rows)!==JSON.stringify(b.rows)||a.hiddenWorlds!==20||
    Object.values(a.summary).some(x=>x.unresolved!==0))throw Error('deterministic test failed');
 return{passed:true,seeds:a.rows.map(x=>x.seed),worlds:a.hiddenWorlds};
}
if(require.main===module){
 const args=process.argv.slice(2);
 console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||2940000),+(args[1]||2950000),+(args[2]||30),+(args[3]||40)),null,2));
}
module.exports={run,test};