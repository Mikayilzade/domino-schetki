'use strict';
// Independent min-hand-pips discovery; exact hidden allocations; 3 vs 4 distinct
// pre-action ends, next opponent has 2 stones. Assumed branch rules remain provisional.
// CLI: node qosha-research/simulator/connector-minpips-pass-runner.js test
//      node qosha-research/simulator/connector-minpips-pass-runner.js 225000 275000 20
const e=require('./engine'),d=require('./turn-dispatcher'),init=require('./initializer');
const r=require('./round-driver'),{chooseBy}=require('./strategy-runner');
const {matches}=require('./connector-other-matches');
const {worlds}=require('./connector-exact-response-runner');
const {force,POLICIES}=require('./connector-equal-pip-runner');
const {actionKey}=require('./decision-regret');
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function stats(a){if(!a.length)return null;const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;return{n:a.length,mean:m,ci95Exploratory:a.length>1?[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)]:null};}
function ends(s){return e.SIDES.map(k=>s.branchState.branches[k].end);}
function select(start=225000,end=275000,quota=20){
 const groups={3:[],4:[]};let scanned=0,eligible=0;
 for(let seed=start;seed<end&&(groups[3].length<quota||groups[4].length<quota);seed++){
  scanned++;let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;
  while(!s.outcome&&s.turns<100){
   const m=matches(s);
   if(m.length){
    eligible++;
    const distinct=new Set(ends(s)).size,nextSize=s.hands[(s.currentPlayer+1)%3].length;
    if(nextSize===2&&groups[distinct]&&groups[distinct].length<quota){
     const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
     groups[distinct].push({seed,turn:s.turns,focal:s.currentPlayer,target:m[0].x,pair:m[0].pairs[0],
      visibleState:r.cloneRoundState(s),knownTiles:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t)))});
    }
    break;
   }
   s=r.stepRound(s,(opts,state)=>chooseBy('min-hand-pips',opts,{seed,turns:state.turns,player:state.currentPlayer}));
  }
 }
 if(groups[3].length!==quota||groups[4].length!==quota)throw Error('not enough positions: '+groups[3].length+'/'+groups[4].length);
 return{scanned,eligible,positions:[...groups[3],...groups[4]]};
}
// Proof-specific regression: two distinct legal non-double single actions cannot
// produce identical full post-action branch-end vectors. Every placement changes
// exactly one branch end; same-side equal endpoint implies the same tile.
function auditPostEnds(s){
 const acts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock).actions.filter(a=>a.type==='single');
 let pairs=0;
 for(let i=0;i<acts.length;i++)for(let j=i+1;j<acts.length;j++){
  if(actionKey(acts[i])===actionKey(acts[j]))continue;
  pairs++;
  const aa=e.SIDES.map(k=>e.applySinglePlacement(s.branchState,acts[i]).branches[k].end).join(',');
  const bb=e.SIDES.map(k=>e.applySinglePlacement(s.branchState,acts[j]).branches[k].end).join(',');
  if(aa===bb)throw Error('unexpected post-action geometry match');
 }
 return pairs;
}
function run(start=225000,end=275000,quota=20){
 const selected=select(start,end,quota),rows=[];let geometryPairs=0;
 for(const pos of selected.positions){
  const s=pos.visibleState,before=JSON.stringify(s),ww=worlds(pos);
  geometryPairs+=auditPostEnds(s);
  const vals=Object.fromEntries(POLICIES.map(k=>[k,{finish:[],remainder:[],minus:[],nextPass:[],nextLegal:[],block:[],turns:[]}]));
  const signs={morePass:0,fewerPass:0,samePass:0};
  for(let i=0;i<ww.length;i++){
   const seed=55000000+1000*pos.seed+i;
   for(const policy of POLICIES){
    const a=force(ww[i],pos.pair.connector,policy,seed),b=force(ww[i],pos.pair.other,policy,seed);
    for(const key of Object.keys(vals[policy])){
     if(a[key]==null||b[key]==null)throw Error('missing metric '+key);
     vals[policy][key].push(a[key]-b[key]);
    }
    if(policy===POLICIES[0])signs[a.nextPass>b.nextPass?'morePass':a.nextPass<b.nextPass?'fewerPass':'samePass']++;
   }
  }
  if(JSON.stringify(s)!==before)throw Error('source state mutated');
  rows.push({seed:pos.seed,turn:pos.turn,distinctEnds:new Set(ends(s)).size,preEnds:ends(s),target:pos.target,
   nextHand:2,worlds:ww.length,pair:pos.pair,immediatePassWorldCounts:signs,
   policy:Object.fromEntries(POLICIES.map(k=>[k,Object.fromEntries(Object.entries(vals[k]).map(([metric,v])=>[metric,mean(v)]))]))});
 }
 const strata={};for(const n of [3,4]){const xs=rows.filter(x=>x.distinctEnds===n);strata[n+'-ends-next-2']={n:xs.length,allocations:xs.reduce((a,x)=>a+x.worlds,0),policy:Object.fromEntries(POLICIES.map(k=>[k,Object.fromEntries(['finish','remainder','minus','nextPass','nextLegal','block','turns'].map(metric=>[metric,stats(xs.map(x=>x.policy[k][metric]))]))]))};}
 const contrast=Object.fromEntries(POLICIES.map(k=>[k,Object.fromEntries(['finish','remainder','minus','nextPass','nextLegal','block','turns'].map(m=>[m,strata['4-ends-next-2'].policy[k][m].mean-strata['3-ends-next-2'].policy[k][m].mean]))]));
 return{schema:'qosa-minpips-preaction-pass/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}),
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0; branch-opening semantics provisional',mode:'3x9',
  start,end,quota,scanned:selected.scanned,eligible:selected.eligible,positions:rows.length,
  allocations:rows.reduce((a,x)=>a+x.worlds,0),continuations:rows.reduce((a,x)=>a+x.worlds,0)*2*POLICIES.length,
  auditedDistinctSingleActionPairs:geometryPairs,postActionEndMatches:0,newFullStrategyRounds:0,verifiedPriorFullStrategyRounds:180000,
  continuationSeedFormula:'55000000 + 1000*dealSeed + allocationIndex',discovery:'min-hand-pips, first eligible state and lexicographically first equal-pip connector-vs-unrelated pair',
  policies:POLICIES,strata,contrastFourMinusThree:contrast,selectedSeeds:rows.map(x=>x.seed),rows,
  limitations:'uniform hidden allocations not conditioned on opponent history; first-eligible selection; only 20 positions per stratum; bots; assumed branch opening; no block winner; unadjusted exploratory intervals; nextPass is post-treatment mediator and cannot be interpreted as independent causal treatment'};
}
function test(){const a=run(225000,230000,2),b=run(225000,230000,2);
 delete a.timestampAsiaBaku;delete b.timestampAsiaBaku;
 if(JSON.stringify(a)!==JSON.stringify(b)||a.positions!==4||a.auditedDistinctSingleActionPairs<4)throw Error('deterministic regression');
 return{passed:true,seeds:a.selectedSeeds,allocations:a.allocations,continuations:a.continuations,auditedPairs:a.auditedDistinctSingleActionPairs};}
if(require.main===module){const args=process.argv.slice(2);console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||225000),+(args[1]||275000),+(args[2]||20)),null,2));}
module.exports={select,auditPostEnds,run,test};
