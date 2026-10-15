'use strict';
// Reproduce: node qosha-research/simulator/pass-choice-regret-runner.js test
// Run: node qosha-research/simulator/pass-choice-regret-runner.js 770000 780000 30
const {discover,compatible}=require('./pass-history-persistent-runner');
const {worlds}=require('./connector-exact-response-runner');
const {force,POLICIES}=require('./connector-equal-pip-runner');
const {actionKey}=require('./decision-regret');
const d=require('./turn-dispatcher'),e=require('./engine');
const metrics=['finish','remainder','minus'];
function compare(a,b){
 if(Math.abs(a.finish-b.finish)>1e-10)return Math.sign(a.finish-b.finish);
 if(Math.abs(a.remainder-b.remainder)>1e-10)return Math.sign(b.remainder-a.remainder);
 if(Math.abs(a.minus-b.minus)>1e-10)return Math.sign(a.minus-b.minus);
 return 0;
}
function best(scores){return Object.keys(scores).sort((a,b)=>compare(scores[b],scores[a])||a.localeCompare(b))[0];}
function sameHands(a,b){return a.every((h,i)=>h.map(e.tileKey).sort().join(',')===b[i].map(e.tileKey).sort().join(','));}
function evaluate(pos){
 const snap=JSON.stringify(pos.visibleState),w=worlds(pos);
 const legacy=pos.evidence.filter(x=>!x.playedAfter.length);
 const old=w.map(x=>compatible(x,legacy)),post=w.map(x=>compatible(x,pos.evidence));
 const nOld=old.filter(Boolean).length,nPost=post.filter(Boolean).length;
 if(!nPost||nPost>nOld||!compatible(pos.visibleState,pos.evidence))throw Error('posterior invalid');
 const opts=d.turnOptions(pos.visibleState.branchState,pos.visibleState.openingState,pos.visibleState.hands[pos.focal],pos.visibleState.stock);
 if(opts.phase!=='play'||opts.actions.length<2)throw Error('no legal choice');
 const keys=opts.actions.map(actionKey);
 if(new Set(keys).size!==keys.length)throw Error('duplicate action keys');
 const actual=w.findIndex(x=>sameHands(x.hands,pos.visibleState.hands));
 if(actual<0||!post[actual])throw Error('actual deal missing');
 const policy={};
 for(const name of POLICIES){
  const sums=Object.fromEntries(keys.map(k=>[k,{old:[0,0,0],post:[0,0,0]}])),truth={};
  for(let i=0;i<w.length;i++)for(const k of keys){
   const v=force(w[i],k,name,61000000+1000*pos.seed+i);
   if(i===actual)truth[k]=v;
   if(old[i])metrics.forEach((m,j)=>sums[k].old[j]+=v[m]);
   if(post[i])metrics.forEach((m,j)=>sums[k].post[j]+=v[m]);
  }
  const averages={old:{},post:{}};
  for(const k of keys)for(const kind of ['old','post']){
   const n=kind==='old'?nOld:nPost;
   averages[kind][k]=Object.fromEntries(metrics.map((m,j)=>[m,sums[k][kind][j]/n]));
  }
  const before=best(averages.old),after=best(averages.post);
  const maxFinish=Math.max(...keys.map(k=>truth[k].finish));
  const minPips=Math.min(...keys.map(k=>truth[k].remainder));
  const maxMinus=Math.max(...keys.map(k=>truth[k].minus));
  const regret=k=>({finish:maxFinish-truth[k].finish,remainder:truth[k].remainder-minPips,minus:maxMinus-truth[k].minus});
  policy[name]={before,after,changed:before!==after,
   strictReversal:before!==after&&compare(averages.old[before],averages.old[after])>0&&compare(averages.post[after],averages.post[before])>0,
   actualImprovement:{finish:truth[after].finish-truth[before].finish,remainder:truth[before].remainder-truth[after].remainder,minus:truth[after].minus-truth[before].minus},
   oracleRegretBefore:regret(before),oracleRegretAfter:regret(after)};
 }
 if(JSON.stringify(pos.visibleState)!==snap)throw Error('source mutation');
 return{seed:pos.seed,turn:pos.turn,focal:pos.focal,handSizes:pos.visibleState.hands.map(x=>x.length),
  hiddenAllocations:w.length,legacyAllocations:nOld,conditionedAllocations:nPost,legalActions:keys.length,
  actualWorldIndex:actual,observedPasses:pos.evidence.map(x=>({player:x.player,turn:x.turn,playedAfter:x.playedAfter.map(e.tileKey)})),policy};
}
function run(start=770000,end=780000,limit=30){
 const found=discover(start,end,limit),rows=found.positions.map(evaluate);
 const stats=Object.fromEntries(POLICIES.map(p=>[p,{recommendationChanges:rows.filter(x=>x.policy[p].changed).length,
  strictReversals:rows.filter(x=>x.policy[p].strictReversal).length,
  actualImprovement:Object.fromEntries(metrics.map(m=>[m,rows.reduce((s,x)=>s+x.policy[p].actualImprovement[m],0)])),
  changedSeeds:rows.filter(x=>x.policy[p].changed).map(x=>x.seed)}]));
 return{schema:'qosa-pass-choice-regret/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}),
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0, branch opening provisional',mode:'3x9',
  seedRange:[start,end-1],scannedDeals:found.scanned,positions:rows.length,
  hiddenAllocations:rows.reduce((s,x)=>s+x.hiddenAllocations,0),
  candidateContinuations:rows.reduce((s,x)=>s+x.hiddenAllocations*x.legalActions*POLICIES.length,0),
  posteriorChangedPositions:rows.filter(x=>x.legacyAllocations!==x.conditionedAllocations).length,
  newFullStrategyRounds:0,verifiedCumulativeFullStrategyRounds:180000,
  policies:POLICIES,selection:'first eligible reachable state with pass and equal-pip pair; evaluate ALL legal actions',
  continuationSeed:'61000000+1000*dealSeed+lexicographicAllocationIndex',
  ranking:'finish-first desc; remainder asc; minus finish desc; actionKey tie break',
  stats,selectedSeeds:rows.map(x=>x.seed),rows,
  limitations:'uniform hidden allocations, no voluntary play likelihood, first-eligible selection, few posterior changes, deterministic bots, provisional branch opening, unassigned block winner; actual world used only for retrospective oracle regret'};
}
function test(){
 const p=discover(773582,773583,1).positions[0];
 if(!p)throw Error('fixture not found');
 const a=evaluate(p),b=evaluate(p);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.hiddenAllocations!==21||a.conditionedAllocations!==6||
  a.legalActions!==5||!a.policy['closed-branch-control'].strictReversal||
  a.policy['closed-branch-control'].actualImprovement.remainder!==2)throw Error('fixture mismatch');
 return{passed:true,seed:a.seed,allocations:a.hiddenAllocations,posterior:a.conditionedAllocations};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(
 Number(a[0]||770000),Number(a[1]||780000),Number(a[2]||30)),null,2));}
module.exports={compare,best,evaluate,run,test};
