'use strict';
// Exact robust pass inference across TWO UNVERIFIED late-arrival branch models.
// node qosha-research/simulator/branch-robust-pass-audit.js test
// node qosha-research/simulator/branch-robust-pass-audit.js 2090000 10000
const ab=require('./branch-pass-ablation'),post=require('./midgame-exact-posterior');
const key=t=>t.slice().sort((a,b)=>a-b).join('-');
function ok(x,m){if(!x)throw Error('robust-pass: '+m);}
function exact(p){
 ok(p.caps[2]===0&&p.known.every(h=>!h.length),'no stock or known opponents');
 const pick=[],worlds=new Set(),counts=Object.fromEntries(p.pool.map(t=>[key(t),0]));
 let valid=0,unrestricted=0;
 function rec(start){
  if(pick.length===p.caps[0]){
   unrestricted++;const chosen=new Set(pick);
   if(p.pool.some((t,i)=>!p.allow[i][chosen.has(i)?0:1]))return;
   valid++;const tiles=pick.map(i=>key(p.pool[i])).sort();
   worlds.add(tiles.join('|'));tiles.forEach(k=>counts[k]++);return;
  }
  for(let i=start;i<=p.pool.length-(p.caps[0]-pick.length);i++){
   pick.push(i);rec(i+1);pick.pop();
  }
 }
 rec(0);ok(BigInt(valid)===p.total&&worlds.size===valid,'DP vs independent enumeration');
 return {valid,unrestricted,worlds,counts};
}
function prepare(){
 const a=ab.prepare(),g=exact(a.gp),c=exact(a.cp);
 ok(g.valid===120&&c.valid===330&&g.unrestricted===3432&&c.unrestricted===3432,'baseline changed');
 const marginals=a.gp.pool.map(key).sort().map(tile=>{
  const p=g.counts[tile]/g.valid,q=c.counts[tile]/c.valid;
  return {tile,globalCount:g.counts[tile],currentCount:c.counts[tile],
   globalProbability:p,currentProbability:q,robustLower:Math.min(p,q),robustUpper:Math.max(p,q)};
 });
 const certainties=marginals.filter(m=>m.robustLower===1).map(m=>m.tile);
 const overlap=[...g.worlds].filter(w=>c.worlds.has(w)).length,tv=1-overlap/c.valid;
 ok(JSON.stringify(certainties)==='["1-5","1-6","4-4"]','certain tiles');
 ok(overlap===120&&Math.abs(tv-7/11)<1e-12,'TV overlap');
 ok(Math.abs(marginals.reduce((a,m)=>a+m.globalProbability,0)-7)<1e-9,'global capacity');
 ok(Math.abs(marginals.reduce((a,m)=>a+m.currentProbability,0)-7)<1e-9,'current capacity');
 return {a,g,c,marginals,certainties,overlap,tv};
}
function test(){
 const x=prepare();ok(ab.test().passed,'previous audit regression');
 for(let i=0;i<120;i++)for(const p of [x.a.gp,x.a.cp]){
  const a=post.samplePrepared(p,2090000+i),b=post.samplePrepared(p,2090000+i);
  post.assertWorld(p,a);ok(JSON.stringify(a)===JSON.stringify(b),'determinism');
  ok(x.certainties.every(k=>a.hands[1].some(t=>key(t)===k)),'robust tile missing');
 }
 return {passed:true,exactUnrestricted:3432,compatible:[120,330],overlap:x.overlap,
  robustSeat1Tiles:x.certainties,seedReplaysPerModel:120};
}
function run(start=2090000,count=10000){
 ok(Number.isInteger(start)&&start>=0&&Number.isInteger(count)&&count>=1000,'seeds');
 const x=prepare(),tests=test(),sampled={};
 for(const [name,p,ex] of [['global',x.a.gp,x.g],['allCurrent',x.a.cp,x.c]]){
  const hits=Object.fromEntries(x.marginals.map(m=>[m.tile,0])),distinct=new Set();
  for(let i=0;i<count;i++){
   const w=post.samplePrepared(p,start+i);post.assertWorld(p,w);
   const tiles=w.hands[1].map(key).sort();distinct.add(tiles.join('|'));
   tiles.forEach(k=>hits[k]++);
  }
  let maxAbsZ=0;
  for(const k of Object.keys(hits)){
   const p0=ex.counts[k]/ex.valid,rate=hits[k]/count;
   if(p0===0||p0===1)ok(hits[k]===count*p0,'certain tile sampling');
   else maxAbsZ=Math.max(maxAbsZ,Math.abs((rate-p0)/Math.sqrt(p0*(1-p0)/count)));
  }
  ok(maxAbsZ<5,'calibration >5sigma');
  sampled[name]={allocations:count,distinctWorlds:distinct.size,maxAbsZ,
   seat1Has26:hits['2-6'],seat1Has26Rate:hits['2-6']/count,
   robustTileHits:Object.fromEntries(x.certainties.map(k=>[k,hits[k]]))};
 }
 return {schema:'qosha-branch-robust-pass/v1',
  timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',
  engine:'qosa-research-0.5.3+branch-robust-pass-audit-1.0',
  rules:'recovered qosa-1.0.0 3x9; BOTH branch models PROVISIONAL',
  seeds:[start,start+count-1],matchedSeedSetAcrossModels:true,
  deals:0,modelRounds:0,forcedContinuations:0,hiddenAllocations:count*2,
  strategies:'none; exact conditional posterior and seeded calibration',
  exact:{unrestricted:3432,globalCompatible:x.g.valid,currentCompatible:x.c.valid,
   overlap:x.overlap,totalVariation:x.tv,robustSeat1Certainties:x.certainties,
   sensitiveTiles:x.marginals.filter(m=>Math.abs(m.globalProbability-m.currentProbability)>1e-12).length,
   marginals:x.marginals},
  sampled,tests,
  finding:'Synthetic observed no-stock seat-2 pass forces seat 1 to hold 1-5, 1-6, 4-4 under BOTH branch models; 2-6 probability spans 36.36%-100%.',
  confidence:'Exact exhaustive combinatorics, deterministic paired-seed samples; not real-game evidence',
  limitations:['Unverified late-arrival branch rule','Synthetic trace, not authenticated human game',
   'Uniform hidden-world posterior ignores opponent policy','No block tie or 101 scoring','No winning tactic confirmed'],
  nextAction:'Obtain authentic late-arrival example; compare double/connector decisions only on legal moves common to both models.'};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2090000),+(a[1]||10000)),null,2));}
module.exports={exact,prepare,test,run};