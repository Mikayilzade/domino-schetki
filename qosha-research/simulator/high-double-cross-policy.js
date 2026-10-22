'use strict';
// Independent 3-3 / 5-5 pass-conditioned holdout with crossed continuation bots.
// node qosha-research/simulator/high-double-cross-policy.js test
// node qosha-research/simulator/high-double-cross-policy.js 1313840 1600 20 64
const e=require('./engine'),p=require('./high-double-paired');
const u=require('./high-double-unique-holdout'),{hidden}=require('./pass-choice-outlier-audit');
const profiles=['min-hand-pips','closed-branch-control'],numbers=[3,5];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function ciBySeed(rows) {
  const n=rows.length,m=mean(rows.map(x=>x.winDelta)),groups=new Map();
  for(const x of rows){const a=groups.get(x.seed)||[];a.push(x.winDelta);groups.set(x.seed,a);}
  const g=groups.size;
  if(g<2)return null;
  let sq=0;for(const a of groups.values()){const z=a.reduce((s,v)=>s+v-m,0);sq+=z*z;}
  const se=Math.sqrt(g/(g-1)*sq/(n*n));
  return [100*(m-2.735*se),100*(m+2.735*se)];
}
function run(start=1313840,count=1600,cap=20,worldLimit=64){
 if(![start,count,cap,worldLimit].every(Number.isInteger)||count<1||cap<1||worldLimit<1)throw Error('args');
 const found=p.collect(start,count,cap),positions=found.positions.filter(x=>numbers.includes(x.number));
 const rows=[];let uniqueWorlds=0,exactPositions=0;
 for(const x of positions){
  const frozen=JSON.stringify(x.state),c=hidden(x),exact=c.support<=worldLimit;
  const ws=exact?u.exactWorlds(x,c):u.sampleUnique(x,c,worldLimit);
  uniqueWorlds+=ws.length;if(exact)exactPositions++;
  const connector=x.state.hands[x.seat].filter(t=>t[0]!==t[1]&&t.includes(x.number)).map(e.tileKey);
  const spent=x.defer.split('|')[4].split(',');const retained=connector.some(k=>!spent.includes(k));
  const acc=Object.fromEntries(profiles.map(z=>[z,{win:[],pips:[],minus:[],block:[]}]));
  for(const w of ws){
   u.check(x,c,w);
   for(const policy of profiles){
    const a=p.rollout(w,x.open,policy,x.seat),b=p.rollout(w,x.defer,policy,x.seat);
    for(const k of ['win','pips','minus','block'])acc[policy][k].push(b[k]-a[k]);
   }
  }
  if(JSON.stringify(x.state)!==frozen)throw Error('visible state mutated');
  for(const policy of profiles)rows.push({
   discoveryProfile:x.profile,number:x.number,continuationPolicy:policy,
   seed:x.seed,seat:x.seat,turn:x.turn,hand:x.state.hands[x.seat].map(e.tileKey),
   open:x.open,defer:x.defer,connectorCount:connector.length,retainsConnector:retained,
   exact,support:c.support,uniqueWorlds:ws.length,
   winDelta:mean(acc[policy].win),pipsDelta:mean(acc[policy].pips),
   minusDelta:mean(acc[policy].minus),blockDelta:mean(acc[policy].block)
  });
 }
 const summaries=[];
 for(const discoveryProfile of profiles)for(const number of numbers)for(const continuationPolicy of profiles){
  const a=rows.filter(x=>x.discoveryProfile===discoveryProfile&&x.number===number&&x.continuationPolicy===continuationPolicy);
  if(a.length!==cap)throw Error('not enough positions for '+discoveryProfile+'/'+number);
  const stratum=v=>{const b=a.filter(x=>x.retainsConnector===v);return {n:b.length,winDeltaPP:b.length?100*mean(b.map(x=>x.winDelta)):null};};
  summaries.push({discoveryProfile,number,continuationPolicy,positions:a.length,distinctSeeds:new Set(a.map(x=>x.seed)).size,
   winDeltaPP:100*mean(a.map(x=>x.winDelta)),seedClusterBonferroni95PP:ciBySeed(a),
   pipsDelta:mean(a.map(x=>x.pipsDelta)),minusDeltaPP:100*mean(a.map(x=>x.minusDelta)),
   blockDeltaPP:100*mean(a.map(x=>x.blockDelta)),
   better:a.filter(x=>x.winDelta>1e-12).length,worse:a.filter(x=>x.winDelta< -1e-12).length,
   tied:a.filter(x=>Math.abs(x.winDelta)<=1e-12).length,
   retainsConnector:stratum(true),noRetainedConnector:stratum(false)});
 }
 return {schema:'qosa-high-double-cross-policy/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9',startSeed:start,endSeed:start+count-1,scanned:found.scanned,
  selectedPositions:positions.length,exactPositions,uniqueHiddenWorlds:uniqueWorlds,
  continuationPolicies:profiles,forcedCounterfactualContinuations:uniqueWorlds*2*profiles.length,
  worldLimit,capPerDoubleAndDiscoveryProfile:cap,
  assumptions:'Same fixed visible state, pass constraints, unique hidden worlds for both forced actions and both continuation policies. First eligible alpha20-joint high double after an observed no-stock pass. Uniform hidden allocations; exact if support <= worldLimit.',
  limitations:'Selected positions, model-specific bots, provisional branch semantics, no block winner, no opponent prior-choice likelihood, seed-cluster intervals exploratory and do not include hidden-world sampling error. Connector strata post hoc.',
  summaries,rows};
}
function test(){const a=run(1313840,100,2,8),b=run(1313840,100,2,8);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.selectedPositions!==8||a.summaries.length!==8||
 a.forcedCounterfactualContinuations!==a.uniqueHiddenWorlds*4||a.rows.some(x=>!Number.isFinite(x.winDelta)))
 throw Error('cross-policy replay/paired invariant');
 return {passed:true,positions:a.selectedPositions,worlds:a.uniqueHiddenWorlds};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1313840),+(a[1]||1600),+(a[2]||20),+(a[3]||64)),null,2));}
module.exports={run,test,ciBySeed};