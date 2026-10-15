'use strict';
// Exhaustive equal-pip connector vs unrelated single, 3x9; branch semantics provisional.
// Test: node qosha-research/simulator/connector-exact-response-runner.js test
// Run: node qosha-research/simulator/connector-exact-response-runner.js 181000 200000 30
const e=require('./engine'),r=require('./round-driver');
const {hiddenPool}=require('./hidden-world');
const {discover,force,POLICIES}=require('./connector-equal-pip-runner');
function* combinations(n,k,start=0,a=[]){if(!k){yield a;return;}for(let i=start;i<=n-k;i++)yield* combinations(n,k-1,i+1,[...a,i]);}
function worlds(pos){
 const s=pos.visibleState,p=pos.focal,opp=[0,1,2].filter(i=>i!==p);
 if(s.stock.length)throw Error('stock must be empty');
 const pool=hiddenPool({focalHand:s.hands[p],knownTiles:pos.knownTiles}).sort((a,b)=>e.tileKey(a).localeCompare(e.tileKey(b)));
 if(pool.length!==s.hands[opp[0]].length+s.hands[opp[1]].length)throw Error('pool mismatch');
 const out=[];
 for(const ids of combinations(pool.length,s.hands[opp[0]].length)){
  const selected=new Set(ids),w=r.cloneRoundState(s);
  w.hands[opp[0]]=ids.map(i=>pool[i].slice());
  w.hands[opp[1]]=pool.filter((_,i)=>!selected.has(i)).map(t=>t.slice());
  const keys=[...w.hands.flat(),...w.stock,...pos.knownTiles].map(e.tileKey);
  if(keys.length!==28||new Set(keys).size!==28)throw Error('deck invariant');
  out.push(w);
 }
 return out;
}
function mean(xs){return xs.reduce((a,b)=>a+b,0)/xs.length;}
function stat(xs){if(!xs.length)return null;const m=mean(xs),sd=xs.length>1?Math.sqrt(xs.reduce((s,x)=>s+(x-m)**2,0)/(xs.length-1)):0;return{mean:m,ci95Exploratory:[m-1.96*sd/Math.sqrt(xs.length),m+1.96*sd/Math.sqrt(xs.length)]};}
function run(start=181000,end=200000,limit=30){
 const found=discover(start,end,limit),rows=[];
 for(const pos of found.positions){
  const ww=worlds(pos),deltas=Object.fromEntries(POLICIES.map(p=>[p,[]]));
  const s=pos.visibleState,preEnds=e.SIDES.map(side=>s.branchState.branches[side].end);
  const before=JSON.stringify({hands:s.hands,branches:s.branchState,opened:[...s.openingState.openedNumbers]});
  for(let i=0;i<ww.length;i++){
   const seed=42000000+pos.seed*1000+i;
   for(const policy of POLICIES){
    const a=force(ww[i],pos.pair.connector,policy,seed);
    const b=force(ww[i],pos.pair.other,policy,seed);
    deltas[policy].push({finish:a.finish-b.finish,remainder:a.remainder-b.remainder,
      minus:a.minus-b.minus,nextPass:a.nextPass-b.nextPass,block:a.block-b.block});
   }
  }
  if(before!==JSON.stringify({hands:s.hands,branches:s.branchState,opened:[...s.openingState.openedNumbers]}))throw Error('source mutated');
  rows.push({seed:pos.seed,turn:pos.turn,worlds:ww.length,
   nextHand:s.hands[(pos.focal+1)%3].length,preEnds,uniqueEnds:new Set(preEnds).size,pair:pos.pair,
   policy:Object.fromEntries(POLICIES.map(p=>[p,Object.fromEntries(['finish','remainder','minus','nextPass','block']
    .map(k=>[k,mean(deltas[p].map(x=>x[k]))]))]))});
 }
 if(!rows.length)throw Error('no eligible positions');
 const aggregate=Object.fromEntries(POLICIES.map(p=>[p,Object.fromEntries(['finish','remainder','minus','nextPass','block']
   .map(k=>[k,stat(rows.map(x=>x.policy[p][k]))]))]));
 const strata={};for(const x of rows){const key=x.uniqueEnds+'-ends-next-'+x.nextHand;(strata[key]||=[]).push(x);}
 return{schema:'qosa-exact-equal-pip/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}),
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0, branch rules provisional',mode:'3x9',
  start,end,scanned:found.scanned,positions:rows.length,allocations:rows.reduce((n,x)=>n+x.worlds,0),
  continuations:rows.reduce((n,x)=>n+x.worlds,0)*2*POLICIES.length,
  newFullStrategyRounds:0,verifiedPriorFullStrategyRounds:180000,
  continuationSeedFormula:'42000000 + 1000*dealSeed + allocationIndex',
  discoveryPolicy:'closed-branch-control',policies:POLICIES,aggregate,
  preActionStrata:Object.fromEntries(Object.entries(strata).map(([k,xs])=>[k,{n:xs.length,
   finish:stat(xs.map(x=>x.policy['closed-branch-control'].finish)),
   nextPass:stat(xs.map(x=>x.policy['closed-branch-control'].nextPass))}])),
  selectedSeeds:rows.map(x=>x.seed),rows,
  limitations:'uniform hidden allocations ignore opponent history; first eligible position and pair; bots; provisional branch semantics; no block winner; exploratory CIs; next-pass is post-action moderator'};
}
function test(){const x=discover(90000,92500,1).positions[0];if(!x||x.seed!==90179)throw Error('fixture');const w=worlds(x);if(w.length!==15||JSON.stringify(w)!==JSON.stringify(worlds(x)))throw Error('exact enumeration');return{passed:true,seed:x.seed,worlds:w.length};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(Number(a[0]||181000),Number(a[1]||200000),Number(a[2]||30)),null,2));}
module.exports={combinations,worlds,run,test};
