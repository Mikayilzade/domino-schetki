'use strict';
// Independent pre-action 3-vs-4 distinct ends, next opponent has exactly 2 stones.
// Exact conditional allocations; equal-pip connector vs unrelated single.
// Usage: node qosha-research/simulator/connector-balanced-ends-runner.js test
//        node qosha-research/simulator/connector-balanced-ends-runner.js 200000 225000 20
const e=require('./engine');
const {discover,force,POLICIES}=require('./connector-equal-pip-runner');
const {worlds}=require('./connector-exact-response-runner');
function mean(a){return a.reduce((s,x)=>s+x,0)/a.length;}
function stats(a){if(!a.length)return null;const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;return{n:a.length,mean:m,ci95Exploratory:[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)]};}
function select(start=200000,end=225000,quota=20){
 const d=discover(start,end,100000),buckets={'3':[],'4':[]};
 for(const p of d.positions){
  const s=p.visibleState,ends=new Set(e.SIDES.map(k=>s.branchState.branches[k].end)).size;
  if(s.hands[(p.focal+1)%3].length===2&&buckets[ends]&&buckets[ends].length<quota)buckets[ends].push(p);
 }
 if(buckets['3'].length!==quota||buckets['4'].length!==quota)throw Error('insufficient eligible strata: '+JSON.stringify(Object.fromEntries(Object.entries(buckets).map(([k,v])=>[k,v.length]))));
 return{scanned:d.scanned,eligible:d.positions.length,positions:[...buckets['3'],...buckets['4']]};
}
function run(start=200000,end=225000,quota=20){
 const selected=select(start,end,quota),rows=[];
 for(const pos of selected.positions){
  const s=pos.visibleState,pre=JSON.stringify(s),ww=worlds(pos);
  const ends=new Set(e.SIDES.map(k=>s.branchState.branches[k].end)).size;
  const by=Object.fromEntries(POLICIES.map(p=>[p,{finish:[],remainder:[],minus:[],nextPass:[],block:[]}]));
  for(let i=0;i<ww.length;i++){
   const seed=54000000+1000*pos.seed+i;
   for(const policy of POLICIES){
    const a=force(ww[i],pos.pair.connector,policy,seed),b=force(ww[i],pos.pair.other,policy,seed);
    for(const k of Object.keys(by[policy]))by[policy][k].push(a[k]-b[k]);
   }
  }
  if(JSON.stringify(s)!==pre)throw Error('source mutated');
  rows.push({seed:pos.seed,turn:pos.turn,ends,nextHand:2,worlds:ww.length,
   pair:pos.pair,policy:Object.fromEntries(POLICIES.map(p=>[p,Object.fromEntries(Object.entries(by[p]).map(([k,v])=>[k,mean(v)]))]))});
 }
 const strata={};for(const ends of [3,4]){const group=rows.filter(r=>r.ends===ends);strata[ends+'-ends-next-2']={n:group.length,allocations:group.reduce((s,x)=>s+x.worlds,0),policy:Object.fromEntries(POLICIES.map(p=>[p,Object.fromEntries(['finish','remainder','minus','nextPass','block'].map(k=>[k,stats(group.map(x=>x.policy[p][k]))]))]))};}
 const contrast=Object.fromEntries(POLICIES.map(p=>[p,Object.fromEntries(['finish','remainder','minus','nextPass','block'].map(k=>[k,strata['4-ends-next-2'].policy[p][k].mean-strata['3-ends-next-2'].policy[p][k].mean]))]));
 return{schema:'qosa-balanced-preaction-ends/v1',engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0; branch opening provisional',mode:'3x9',
  timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}),start,end,quota,scanned: selected.scanned,eligible: selected.eligible,
  positions:rows.length,allocations:rows.reduce((s,x)=>s+x.worlds,0),continuations:rows.reduce((s,x)=>s+x.worlds,0)*2*POLICIES.length,
  newFullStrategyRounds:0,verifiedPriorFullStrategyRounds:180000,
  continuationSeedFormula:'54000000 + 1000*dealSeed + allocationIndex',
  discovery:'first eligible reachable position/pair per deal under closed-branch-control; quota-balanced by pre-action unique ends (3/4) with next opponent hand=2',
  policies:POLICIES,strata,contrastFourMinusThree:contrast,selectedSeeds:rows.map(x=>x.seed),rows,
  limitations:'exact uniform allocations conditional on known stones, not history-conditioned posterior; first-eligible selection; provisional branch semantics; bots; no block winner; unadjusted exploratory intervals; stratification is pre-action but not random treatment'};
}
function test(){const a=run(200000,203000,1),b=run(200000,203000,1);delete a.timestampAsiaBaku;delete b.timestampAsiaBaku;if(JSON.stringify(a)!==JSON.stringify(b))throw Error('replay');if(a.positions!==2||a.strata['3-ends-next-2'].n!==1||a.strata['4-ends-next-2'].n!==1)throw Error('strata');return{passed:true,seeds:a.selectedSeeds,allocations:a.allocations,continuations:a.continuations};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(Number(a[0]||200000),Number(a[1]||225000),Number(a[2]||20)),null,2));}
module.exports={select,run,test};
