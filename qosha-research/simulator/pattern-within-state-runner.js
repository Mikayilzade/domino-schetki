'use strict';
// Within-state paired control: both 3+ X and exactly-2 Y patterns are present
// in the SAME reachable position, with equal counts of active branch ends.
// Usage: node qosha-research/simulator/pattern-within-state-runner.js 1000 1600 20 40
const e=require('./engine'), r=require('./round-driver'), init=require('./initializer');
const {chooseBy}=require('./strategy-runner'), {groups}=require('./pattern-control-runner');
const {runHiddenWorlds}=require('./hidden-world');
function mean(a){return a.reduce((s,x)=>s+x,0)/a.length;}
function stat(a){
 if(!a.length)return null;
 const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;
 const half=a.length>1?1.96*sd/Math.sqrt(a.length):null;
 return {n:a.length,mean:m,ci95NormalApprox:half===null?null:[m-half,m+half],
   positive:a.filter(x=>x>0).length,negative:a.filter(x=>x<0).length,zero:a.filter(x=>x===0).length};
}
const METRICS=['finishFirst','remainderPips','minusFinish'];
function eligiblePair(s){
 const gs=groups(s),patterns=gs.filter(g=>g.kind==='pattern3plus');
 const controls=gs.filter(g=>g.kind==='control2');
 for(const p of patterns)for(const c of controls){
  const pn=e.sidesEndingIn(s.branchState,p.number).length;
  const cn=e.sidesEndingIn(s.branchState,c.number).length;
  if(pn>0&&pn===cn)return {pattern:p,control:c,matchedBranchEndCount:pn};
 }
 return null;
}
function collect(startSeed,endSeed,limit){
 const out=[];
 for(let seed=startSeed;seed<endSeed&&out.length<limit;seed++){
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;
  while(!s.outcome&&s.turns<100){
   const pair=eligiblePair(s);
   if(pair){
    const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
    out.push({seed,turn:s.turns,focal:s.currentPlayer,state:r.cloneRoundState(s),
      knownTiles:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t))),...pair});
    break;
   }
   s=r.stepRound(s,(opts,state)=>chooseBy('closed-branch-control',opts,
     {seed,turns:state.turns,player:state.currentPlayer}));
  }
 }
 return out;
}
function analyzePosition(pos,worlds,policy){
 const s=pos.state,worldStart=1300000+pos.seed*1000;
 const spec={focalPlayer:pos.focal,focalHand:s.hands[pos.focal],knownTiles:pos.knownTiles,
   hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 const data=runHiddenWorlds(spec,{count:worlds,startSeed:worldStart,
   continuationStrategy:policy,maxTurns:200});
 const byWorld=data.results.map(world=>{
  const lookup=new Map(world.candidates.map(x=>[x.actionKey,x]));
  function metric(keys,fn){
   return mean(keys.map(key=>{
    const row=lookup.get(key);
    if(!row||row.outcome==='unresolved')throw new Error('missing/unresolved candidate '+key);
    return fn(row);
   }));
  }
  const out={};
  for(const [name,g] of [['pattern',pos.pattern],['control',pos.control]]){
   out[name]={
    finishFirst:metric(g.preserve,x=>+x.focalFinishedFirst)-metric(g.spend,x=>+x.focalFinishedFirst),
    remainderPips:metric(g.preserve,x=>x.focalRemainder)-metric(g.spend,x=>x.focalRemainder),
    minusFinish:metric(g.preserve,x=>+(x.focalMinus<0))-metric(g.spend,x=>+(x.focalMinus<0))
   };
  }
  out.extraPattern=Object.fromEntries(METRICS.map(k=>[k,out.pattern[k]-out.control[k]]));
  return out;
 });
 const deltas=Object.fromEntries(['pattern','control','extraPattern'].map(g=>[
   g,Object.fromEntries(METRICS.map(m=>[m,mean(byWorld.map(x=>x[g][m]))]))]));
 const sharedPreserve=pos.pattern.preserve.filter(k=>pos.control.preserve.includes(k)).length;
 return {seed:pos.seed,turn:pos.turn,focal:pos.focal,handSize:s.hands[pos.focal].length,
   opponentHandSizes:s.hands.map((h,i)=>i===pos.focal?null:h.length),
   branchEnds:e.SIDES.map(side=>s.branchState.branches[side].end),
   matchedBranchEndCount:pos.matchedBranchEndCount,
   pattern:{target:pos.pattern.number,xTiles:pos.pattern.xTiles,connectors:pos.pattern.connectors,
     spend:pos.pattern.spend,preserve:pos.pattern.preserve},
   control:{target:pos.control.number,xTiles:pos.control.xTiles,connectors:pos.control.connectors,
     spend:pos.control.spend,preserve:pos.control.preserve},
   sharedPreserveActionKeys:sharedPreserve,hiddenWorldStart:worldStart,
   hiddenWorlds:worlds,candidateContinuations:data.results.reduce((n,w)=>n+w.candidates.length,0),
   deltas};
}
function run({startSeed=1000,endSeed=1600,limit=20,worlds=40,
 policies=['closed-branch-control','min-hand-pips','fast-doubles']}={}){
 const positions=collect(startSeed,endSeed,limit);
 const rows={};let continuations=0;
 for(const policy of policies){
  rows[policy]=positions.map(p=>analyzePosition(p,worlds,policy));
  continuations+=rows[policy].reduce((s,p)=>s+p.candidateContinuations,0);
 }
 const summary={};
 for(const policy of policies){
  const rs=rows[policy];
  summary[policy]={};
  for(const group of ['pattern','control','extraPattern']){
   summary[policy][group]=Object.fromEntries(METRICS.map(m=>[m,stat(rs.map(x=>x.deltas[group][m]))]));
  }
  summary[policy].pipValueStrata={};
  for(const label of ['patternTargetHigher','patternTargetLower']){
   const subset=rs.filter(x=>label==='patternTargetHigher'?
     x.pattern.target>x.control.target:x.pattern.target<x.control.target);
   summary[policy].pipValueStrata[label]={n:subset.length,
     extraFinishFirst:stat(subset.map(x=>x.deltas.extraPattern.finishFirst))};
  }
 }
 return {schema:'qosa-pattern-within-state/v1',engine:'qosa-research-0.5.3',
  rules:'qosa-1.0.0',mode:'3x9',startSeed,endSeed,limit,worldsPerPosition:worlds,
  selectedSeeds:positions.map(x=>x.seed),positionCount:positions.length,
  uniqueHiddenAllocations:positions.length*worlds,policyWorldEvaluations:positions.length*worlds*policies.length,
  candidateContinuations:continuations,newCompletedStrategyRounds:0,
  seedFormula:'1300000 + 1000*dealSeed + worldIndex',policies,
  matching:'same exact reachable state, focal hand, opponent counts, branch ends, passes, and equal number of active ends for target doubles',
  comparison:'difference of preserve-X-X+connector minus spend-X-X between 3+ X and exactly-2 Y targets in the same state; equal-weight legal single actions',
  limitations:'targets X and Y differ in pip value and connector structure; observational target comparison, first eligible per seed, assumption-labelled branch semantics, position-level normal CI, no proof of universal causal effect',
  summary,rows};
}
if(require.main===module){
 const [startSeed=1000,endSeed=1600,limit=20,worlds=40]=process.argv.slice(2).map(Number);
 console.log(JSON.stringify(run({startSeed,endSeed,limit,worlds}),null,2));
}
module.exports={eligiblePair,collect,analyzePosition,run};
