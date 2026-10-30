'use strict';
// Standalone exact conditional-ownership audit; synthetic 3x9 after 1-1.
// Seat0 has eight known non-1 stones. Seat2 is assumed to have made a
// VERIFIED no-acquisition forced pass forbidding six 1-X connectors.
// The physical branch/pass interpretation and scoring are NOT validated.
const assert=require('node:assert/strict');
const CONNECTORS=['0-1','1-2','1-3','1-4','1-5','1-6'];
const FOCAL=['0-0','0-2','0-3','0-4','0-5','0-6','2-2','2-3'];
const C='1-3',D='3-3'; // Matching double must not be in the known focal hand.
const deck=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)deck.push(a+'-'+b);
const remaining=deck.filter(t=>t!=='1-1'&&!FOCAL.includes(t));
const non=remaining.filter(t=>!CONNECTORS.includes(t));
assert.equal(remaining.length,19);assert.equal(non.length,13);
function choose(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);}
function combinations(items,k,cb,start=0,acc=[]){
 if(acc.length===k){cb(acc);return;}
 for(let i=start;i<=items.length-(k-acc.length);i++){
  acc.push(items[i]);combinations(items,k,cb,i+1,acc);acc.pop();
 }
}
function worlds(){
 const out=[];
 for(const stock of remaining){
  const connectors=CONNECTORS.filter(t=>t!==stock);
  const rest=non.filter(t=>t!==stock);
  combinations(rest,9-connectors.length,chosen=>{
   const hand=new Set([...connectors,...chosen]);
   assert.equal(hand.size,9);assert(!hand.has(stock));
   assert(CONNECTORS.every(t=>hand.has(t)||t===stock));
   out.push({stock,hand});
  });
 }
 return out;
}
function seededIndex(seed,n){
 // 32-bit seed mixing with rejection to avoid modulo bias.
 let x=seed>>>0;
 for(;;){
  x=(x+0x9e3779b9)>>>0;
  let z=x;z=Math.imul(z^(z>>>16),0x85ebca6b)>>>0;
  z=Math.imul(z^(z>>>13),0xc2b2ae35)>>>0;z=(z^(z>>>16))>>>0;
  const limit=Math.floor(4294967296/n)*n;
  if(z<limit)return z%n;
 }
}
function run(start=3312200,count=32768){
 assert(Number.isSafeInteger(start)&&start>=0&&Number.isSafeInteger(count)&&count>=128);
 const all=worlds(),exact={connector:0,double:0,both:0,stockConnector:0};
 const measure=(w,dst)=>{
  const c=w.hand.has(C),d=w.hand.has(D);
  if(c)dst.connector++;if(d)dst.double++;if(c&&d)dst.both++;
  if(CONNECTORS.includes(w.stock))dst.stockConnector++;
 };
 for(const w of all)measure(w,exact);
 assert.equal(all.length,7150,'7150 feasible worlds');
 assert.deepEqual(exact,{connector:6435,double:1980,both:1760,stockConnector:4290});
 // Independent closed-form counts, separate from world enumeration.
 assert.equal(all.length,6*choose(13,4)+13*choose(12,3));
 assert.equal(exact.both,5*choose(12,3)+12*choose(11,2));
 assert.equal(exact.double,6*choose(12,3)+12*choose(11,2));
 const sampled={connector:0,double:0,both:0,stockConnector:0},unique=new Set();
 for(let i=0;i<count;i++){
  const index=seededIndex(start+i,all.length);
  if(i<64)assert.equal(index,seededIndex(start+i,all.length),'seed replay');
  measure(all[index],sampled);unique.add(index);
 }
 const calibration={};
 for(const name of Object.keys(exact)){
  const expected=exact[name]/all.length,observed=sampled[name]/count;
  const z=(observed-expected)/Math.sqrt(expected*(1-expected)/count);
  assert(Math.abs(z)<5,'sampler calibration '+name+' z='+z);
  calibration[name]={exact:expected,observed,z};
 }
 const conditional=exact.both/exact.connector;
 assert(conditional<8/18);
 return {schema:'qosha-connector-double-conditional/v1',
  engine:'standalone-connector-double-conditional/v1; recovered qosa-1.0.0 capacities',
  seedRange:[start,start+count-1],deals:0,hiddenWorldAllocations:count,
  completeRounds:0,forcedContinuations:0,strategies:'none; uniform compatible hidden allocations',
  syntheticKnownFocalHand:FOCAL,forcedPassMask:CONNECTORS,targets:[C,D],
  exactWorlds:all.length,exactCounts:exact,sampledCounts:sampled,
  distinctSampledWorlds:unique.size,calibration,
  prior:{pConnectorAtSeat1:9/19,pDoubleAtSeat1:9/19,
   pDoubleGivenConnectorAtSeat1:8/18,pBothAtSeat1:9*8/(19*18)},
  posterior:{pConnectorAtSeat1:exact.connector/all.length,
   pDoubleAtSeat1:exact.double/all.length,
   pDoubleGivenConnectorAtSeat1:conditional,pBothAtSeat1:exact.both/all.length},
  finding:'Pass evidence concentrates 1-X connectors at seat1, but conditional on 1-3 there the matching 3-3 is LESS likely because connectors consume hand capacity.',
  confidence:'exact 7150-world enumeration, independent combinatorial counts, seeded calibration',
  limitations:'Synthetic pass, fixed focal hand; no physical branch/tie validation, natural frequency, win rate or action regret.',
  nextAction:'Cross-check a real chronological pass and the existing posterior sampler; then matched-world move regret under authenticated branch/tie rules.'};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(run(a[0]==='test'?3312200:Number(a[0]||3312200),
  a[0]==='test'?512:Number(a[1]||32768)),null,2));
}
module.exports={worlds,run,seededIndex};
