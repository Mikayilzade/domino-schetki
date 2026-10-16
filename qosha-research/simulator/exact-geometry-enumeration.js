'use strict';
// Exhaustive fixed-visible allocations, NOT conditioned on opponents' earlier choices.
// node qosha-research/simulator/exact-geometry-enumeration.js test
// node qosha-research/simulator/exact-geometry-enumeration.js [seed ...]
const e=require('./engine'),{collect}=require('./two-opponent-conditional-holdout');
const {hiddenPool}=require('./hidden-world'),{cloneRoundState}=require('./round-driver');
const {geometry,nextResponse}=require('./connector-response-geometry-runner');
const {force}=require('./connector-equal-pip-runner');
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'];
const METRICS=['finish','pips','minus','block','nextPass','nextPlayable','sameNextTile'];
const DEFAULT_SEEDS=[703612,704026,709028,715654,733993,747376];
function choose(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-k+i)/i;return Math.round(v);}
function combinations(xs,k,visit){function go(at,arr){if(arr.length===k){visit(arr);return;}for(let i=at;i<=xs.length-(k-arr.length);i++)go(i+1,[...arr,xs[i]]);}go(0,[]);}
function enumerate(spec,visit,maxAllocations=10000){
 const pool=hiddenPool(spec),f=spec.focalPlayer,others=[0,1,2].filter(i=>i!==f);
 const [a,b]=others.map(i=>spec.hiddenHandSizes[i]),stock=spec.stockSize;
 if(a+b+stock!==pool.length)throw Error('hidden size mismatch');
 const expected=choose(pool.length,a)*choose(pool.length-a,b);
 if(expected>maxAllocations)throw Error('too many allocations: '+expected);
 let n=0,keys=pool.map(e.tileKey);
 combinations(keys,a,firstKeys=>{
  const first=new Set(firstKeys),remaining=pool.filter(t=>!first.has(e.tileKey(t)));
  combinations(remaining.map(e.tileKey),b,secondKeys=>{
   const second=new Set(secondKeys),w=cloneRoundState(spec.visibleState);
   w.hands[others[0]]=pool.filter(t=>first.has(e.tileKey(t))).map(t=>[...t]);
   w.hands[others[1]]=remaining.filter(t=>second.has(e.tileKey(t))).map(t=>[...t]);
   w.stock=remaining.filter(t=>!second.has(e.tileKey(t))).map(t=>[...t]);
   const all=[...spec.knownTiles,...w.hands.flat(),...w.stock].map(e.tileKey);
   if(all.length!==28||new Set(all).size!==28)throw Error('tile conservation');
   visit(w,n,others);n++;
  });
 });
 if(n!==expected)throw Error('enumeration count mismatch');
 return n;
}
function signature(g){
 const perSide=g.ends.map(z=>({side:z.side,active:z.active,end:z.end,accessible:z.active&&g.opened.includes(z.end)}));
 return{opened:[...g.opened],perSide,accessibleCount:perSide.filter(z=>z.accessible).length,
  accessibleNumbers:perSide.filter(z=>z.accessible).map(z=>z.end).sort((a,b)=>a-b)};
}
function runCase(seed){
 const p=collect(seed,seed+1,1).out[0];if(!p||p.seed!==seed)throw Error('position not found '+seed);
 const s=p.state,f=s.currentPlayer,before=JSON.stringify(s);
 const spec={focalPlayer:f,focalHand:s.hands[f],knownTiles:p.known,
  hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 const connector=signature(geometry(s,p.pair.connector)),other=signature(geometry(s,p.pair.other));
 const rawWorlds=[];
 const n=enumerate(spec,(world,index,opponents)=>{
  const continuationSeed=73000000+1000*seed+index,policies={};
  for(const policy of POLICIES){
   const a=force(world,p.pair.connector,policy,continuationSeed);
   const b=force(world,p.pair.other,policy,continuationSeed);
   const ar=nextResponse(world,p.pair.connector,policy,continuationSeed);
   const br=nextResponse(world,p.pair.other,policy,continuationSeed);
   policies[policy]=[a.finish-b.finish,a.remainder-b.remainder,a.minus-b.minus,
    a.block-b.block,+(ar.phase==='pass')- +(br.phase==='pass'),
    ar.playable-br.playable,+(ar.tile===br.tile)];
  }
  rawWorlds.push({index,opponents:opponents.map(i=>({seat:i,tiles:world.hands[i].map(e.tileKey)})),
   stock:world.stock.map(e.tileKey),policies});
 });
 if(JSON.stringify(s)!==before)throw Error('source state mutated');
 const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
 const policyMeans=Object.fromEntries(POLICIES.map(pol=>[pol,
  Object.fromEntries(METRICS.map((m,j)=>[m,mean(rawWorlds.map(w=>w.policies[pol][j]))]))]));
 const finishCounts=Object.fromEntries(POLICIES.map(pol=>[pol,{
  connectorBetter:rawWorlds.filter(w=>w.policies[pol][0]>0).length,
  otherBetter:rawWorlds.filter(w=>w.policies[pol][0]<0).length,
  tied:rawWorlds.filter(w=>w.policies[pol][0]===0).length}]));
 return{seed,turn:p.turn,x:p.x,focal:f,handSizes:spec.hiddenHandSizes,
  knownTiles:spec.knownTiles.map(e.tileKey),focalHand:spec.focalHand.map(e.tileKey),
  pair:p.pair,connector,other,
  equalAccessibleCount:connector.accessibleCount===other.accessibleCount,
  equalAccessibleNumberIdentity:JSON.stringify(connector.accessibleNumbers)===JSON.stringify(other.accessibleNumbers),
  hiddenAllocations:n,forcedContinuations:n*POLICIES.length*2,policyMeans,finishCounts,rawWorlds};
}
function run(seeds=DEFAULT_SEEDS){
 const rows=seeds.map(runCase),mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
 return{schema:'qosa-exact-geometry-enumeration/v1',
  timestampAsiaBaku:new Date(Date.now()+14400000).toISOString().slice(0,19)+' +04:00',
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0',mode:'3x9',
  selection:'first eligible equal-pip connector vs unrelated position under min-hand-pips discovery',
  seeds,continuationSeedFormula:'73000000+1000*dealSeed+allocationIndex',
  allocationOrder:'lexicographic combinations of sorted double-six hidden pool; opponents in ascending seat order',
  policies:POLICIES,metricsOrder:METRICS,positions:rows.length,
  hiddenAllocations:rows.reduce((s,r)=>s+r.hiddenAllocations,0),
  forcedContinuations:rows.reduce((s,r)=>s+r.forcedContinuations,0),
  newFullStrategyRounds:0,confirmedPriorFullStrategyRounds:186000,
  equalAccessibleNumberIdentityPositions:rows.filter(r=>r.equalAccessibleNumberIdentity).length,
  equalPositionWeightFinishDelta:Object.fromEntries(POLICIES.map(pol=>[pol,mean(rows.map(r=>r.policyMeans[pol].finish))])),
  confidence:'exact allocation enumeration under uniform hidden allocations; not exact real-play posterior',
  limitations:'six position clusters; opponent history ignored; deterministic bots; provisional branch opening; block winner unassigned; first-eligible bias; actions change different end numbers',
  next:'find independent same-accessible-number-identity controls and test alternative opponent-history priors',
  rows};
}
function test(){
 const a=runCase(715654),b=runCase(715654);
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('non-deterministic');
 if(a.hiddenAllocations!==21||a.forcedContinuations!==126)throw Error('allocation count');
 if(!a.equalAccessibleCount||a.equalAccessibleNumberIdentity)throw Error('geometry identity');
 if(a.connector.accessibleNumbers.join(',')!=='2'||a.other.accessibleNumbers.join(',')!=='5')throw Error('end numbers');
 if(a.finishCounts['closed-branch-control'].otherBetter!==15||
    a.finishCounts['min-hand-pips'].otherBetter!==15||
    a.finishCounts['min-hand-pips'].connectorBetter!==1)throw Error('exact outcome');
 if(new Set(a.rawWorlds.map(w=>JSON.stringify(w.opponents))).size!==21)throw Error('duplicate allocations');
 return{passed:true,seed:715654,allocations:21,continuations:126,
  finishDelta:a.policyMeans['closed-branch-control'].finish};
}
if(require.main===module){const args=process.argv.slice(2);
 console.log(JSON.stringify(args[0]==='test'?test():run(args.length?args.map(Number):DEFAULT_SEEDS),null,2));}
module.exports={POLICIES,METRICS,DEFAULT_SEEDS,choose,enumerate,signature,runCase,run,test};
