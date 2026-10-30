'use strict';
// Independent stock-stratified exact audit, with cross-checks against the
// existing repository posterior/ownership engines when run from a checkout.
// The pass mask is SYNTHETIC, not an authenticated physical-game observation.
const assert=require('node:assert/strict');
const CONNECTORS=['0-1','1-2','1-3','1-4','1-5','1-6'];
const FOCAL=['0-0','0-2','0-3','0-4','0-5','0-6','2-2','2-3'];
const C='1-3', D='3-3';
const DECK=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)DECK.push(a+'-'+b);
const POOL=DECK.filter(t=>t!=='1-1'&&!FOCAL.includes(t));
const NON=POOL.filter(t=>!CONNECTORS.includes(t));
const arr=s=>s.split('-').map(Number);
function choose(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);}
function combinations(xs,k,fn,start=0,acc=[]){
 if(acc.length===k){fn(acc);return;}
 for(let i=start;i<=xs.length-(k-acc.length);i++){
  acc.push(xs[i]);combinations(xs,k,fn,i+1,acc);acc.pop();
 }
}
function exactWorlds(){
 const worlds=[];
 for(const stock of POOL){
  const forced=CONNECTORS.filter(t=>t!==stock);
  const candidates=NON.filter(t=>t!==stock);
  combinations(candidates,9-forced.length,chosen=>{
   const seat1=new Set([...forced,...chosen]);
   assert.equal(seat1.size,9);
   assert(!seat1.has(stock));
   worlds.push({stock,seat1});
  });
 }
 return worlds;
}
function measure(worlds){
 const r={total:worlds.length,connector:0,double:0,both:0,stockConnector:0,
  cStockConnector:0,bothStockConnector:0,cStockNon:0,bothStockNon:0};
 for(const w of worlds){
  const c=w.seat1.has(C),d=w.seat1.has(D),s=CONNECTORS.includes(w.stock);
  r.connector+=+c;r.double+=+d;r.both+=+(c&&d);r.stockConnector+=+s;
  r.cStockConnector+=+(c&&s);r.bothStockConnector+=+(c&&d&&s);
  r.cStockNon+=+(c&&!s);r.bothStockNon+=+(c&&d&&!s);
 }
 return r;
}
function independentOracle(){
 assert.equal(DECK.length,28);assert.equal(POOL.length,19);assert.equal(NON.length,13);
 const exact=measure(exactWorlds());
 assert.deepEqual(exact,{total:7150,connector:6435,double:1980,both:1760,
  stockConnector:4290,cStockConnector:3575,bothStockConnector:1100,
  cStockNon:2860,bothStockNon:660});
 // These identities use independent capacity combinatorics, not enumeration.
 assert.equal(exact.total,6*choose(13,4)+13*choose(12,3));
 assert.equal(exact.cStockConnector,5*choose(13,4));
 assert.equal(exact.bothStockConnector,5*choose(12,3));
 assert.equal(exact.cStockNon,13*choose(12,3));
 assert.equal(exact.bothStockNon,12*choose(11,2));
 return exact;
}
function repoIntegration(exact){
 const posterior=require('./midgame-exact-posterior');
 const ownership=require('./public-pass-ownership');
 const base={focalHand:FOCAL.map(arr),playedTiles:[[1,1]],
  knownOpponentTiles:{1:[],2:[]},handSizes:[8,9,9],stockSize:1,
  passObservations:[{player:2,forbiddenTiles:CONNECTORS.map(arr),
   noInterveningDraw:true,source:'SYNTHETIC seat2 no-acquisition pass; NOT a real match'}]};
 const p=posterior.prepare(base);
 assert.equal(p.total,BigInt(exact.total));
 const withC=posterior.prepare({...base,knownOpponentTiles:{1:[arr(C)],2:[]}});
 const withBoth=posterior.prepare({...base,knownOpponentTiles:{1:[arr(C),arr(D)],2:[]}});
 assert.equal(withC.total,BigInt(exact.connector));
 assert.equal(withBoth.total,BigInt(exact.both));
 const o=ownership.analyzeOwnership({played:['1-1'],handSizes:[8,9,9],stockSize:1,
  known:{0:FOCAL,1:[],2:[],3:[]},passMasks:{2:[CONNECTORS]}},[C,D,...CONNECTORS.filter(t=>t!==C)]);
 assert.equal(BigInt(o.compatibleWorlds),p.total);
 assert.equal(Number(o.marginals[C].numerators.seat1),exact.connector);
 assert.equal(Number(o.marginals[D].numerators.seat1),exact.double);
 assert.equal(CONNECTORS.reduce((sum,t)=>sum+Number(o.marginals[t].numerators.stock),0),exact.stockConnector);
 for(let i=0;i<256;i++){
  const w=posterior.samplePrepared(p,3344968+i);
  posterior.assertWorld(p,w);
  assert.deepEqual(w,posterior.samplePrepared(p,3344968+i),'seeded replay');
 }
 return {passed:true,independentModules:2,exactChecks:7,seedReplay:256};
}
function mix32(seed){
 let x=(seed+0x9e3779b9)>>>0;
 x=Math.imul(x^(x>>>16),0x85ebca6b)>>>0;
 x=Math.imul(x^(x>>>13),0xc2b2ae35)>>>0;
 return (x^(x>>>16))>>>0;
}
function seededIndex(seed,n){
 const limit=Math.floor(4294967296/n)*n;
 for(let step=0;;step++){
  const x=mix32((seed+Math.imul(step,0x9e3779b9))>>>0);
  if(x<limit)return x%n;
 }
}
function run(start=3344968,count=32768,integrate=false){
 assert(Number.isSafeInteger(start)&&start>=0&&Number.isSafeInteger(count)&&count>=512);
 const exact=independentOracle(),worlds=exactWorlds(),sampled=measure([]),distinct=new Set();
 for(let i=0;i<count;i++){
  const idx=seededIndex(start+i,worlds.length);
  if(i<64)assert.equal(idx,seededIndex(start+i,worlds.length));
  const w=worlds[idx],c=w.seat1.has(C),d=w.seat1.has(D),s=CONNECTORS.includes(w.stock);
  sampled.total++;sampled.connector+=+c;sampled.double+=+d;sampled.both+=+(c&&d);
  sampled.stockConnector+=+s;sampled.cStockConnector+=+(c&&s);
  sampled.bothStockConnector+=+(c&&d&&s);sampled.cStockNon+=+(c&&!s);
  sampled.bothStockNon+=+(c&&d&&!s);distinct.add(idx);
 }
 const calibration={};
 for(const k of ['connector','double','both','stockConnector','cStockConnector','bothStockConnector','cStockNon','bothStockNon']){
  const p=exact[k]/exact.total,observed=sampled[k]/count;
  const z=(observed-p)/Math.sqrt(p*(1-p)/count);
  assert(Math.abs(z)<5,'calibration '+k+': '+z);
  calibration[k]={expected:p,observed,z};
 }
 return {schema:'qosha-connector-posterior-contract/v1',engine:'standalone stock-stratified exact oracle; recovered qosa-1.0.0 3x9 capacities',
  rules:'synthetic seat2 no-acquisition pass; physical late-arrival branch and block/tie unresolved',
  seeds:[start,start+count-1],deals:0,hiddenWorldAllocations:count,completeRounds:0,forcedContinuations:0,
  strategies:'none; uniform conditional hidden allocations',exact,seeded:sampled,
  distinctSeededWorlds:distinct.size,calibration,
  conditionalDoubleGivenConnector:{stockConnector:exact.bothStockConnector/exact.cStockConnector,
   stockNonConnector:exact.bothStockNon/exact.cStockNon,unconditionedStock:exact.both/exact.connector},
  repoIntegration:integrate?repoIntegration(exact):'NOT RUN (requires repo modules)',
  limitations:'synthetic fixed focal hand; nested worlds; not a win-rate, minus-risk or real-play probability',
  next:'authenticate a real no-acquisition pass, verify late-arrival branch/tie rules, then matched-world candidate-move regret'};
}
if(require.main===module){
 const a=process.argv.slice(2),integrate=a.includes('--integration');
 console.log(JSON.stringify(run(a.find(x=>/^\d+$/.test(x))?Number(a.find(x=>/^\d+$/.test(x))):3344968,
  a.filter(x=>/^\d+$/.test(x))[1]?Number(a.filter(x=>/^\d+$/.test(x))[1]):32768,integrate),null,2));
}
module.exports={run,independentOracle,repoIntegration};
