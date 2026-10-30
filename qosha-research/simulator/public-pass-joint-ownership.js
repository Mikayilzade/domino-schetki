'use strict';
// Exact pairwise tile-owner probabilities conditional on externally VERIFIED pass masks.
// Does NOT assume independent tile marginals or authenticate physical branch rules.
// Usage: node qosha-research/simulator/public-pass-joint-ownership.js test
const assert=require('node:assert/strict');
const feasibility=require('./public-pass-feasibility');
const DECK=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)DECK.push(a+'-'+b);
const VALID=new Set(DECK),LABELS=['seat0','seat1','seat2','stock'];
function canonical(t){
 if(Array.isArray(t)&&t.length===2&&t.every(n=>Number.isInteger(n)&&n>=0&&n<=6))
  return Math.min(...t)+'-'+Math.max(...t);
 if(typeof t==='string'&&VALID.has(t))return t;
 throw Error('invalid double-six tile');
}
function analyzeJoint(spec,a,b){
 const x=canonical(a),y=canonical(b);
 assert.notEqual(x,y,'two distinct tiles required');
 const played=new Set(spec.played.map(canonical));
 assert(!played.has(x)&&!played.has(y),'played tiles have no hidden owner');
 const known=[0,1,2,3].map(i=>(spec.known?.[i]||[]).map(canonical));
 const fixed=t=>known.findIndex(hand=>hand.includes(t));
 const fx=fixed(x),fy=fixed(y);
 const total=BigInt(feasibility.analyze(spec).compatibleWorlds);
 if(total===0n)return {possible:false,compatibleWorlds:'0',reason:'no compatible allocations'};
 const matrix=Array.from({length:4},()=>Array(4).fill(0n));
 for(let i=0;i<4;i++)for(let j=0;j<4;j++){
  if((fx>=0&&fx!==i)||(fy>=0&&fy!==j))continue;
  const injected=known.map(h=>h.slice());
  if(fx<0)injected[i].push(x);
  if(fy<0)injected[j].push(y);
  if(injected.some((h,k)=>h.length>(k===3?spec.stockSize:spec.handSizes[k])))continue;
  matrix[i][j]=BigInt(feasibility.analyze({...spec,known:injected}).compatibleWorlds);
 }
 assert.equal(matrix.flat().reduce((s,n)=>s+n,0n),total,'joint ownership mass must sum to one');
 const rows=matrix.map(row=>row.reduce((s,n)=>s+n,0n));
 const cols=LABELS.map((_,j)=>matrix.reduce((s,row)=>s+row[j],0n));
 const countMap=Object.fromEntries(LABELS.map((owner,i)=>[owner,
  Object.fromEntries(LABELS.map((other,j)=>[other,String(matrix[i][j])]))]));
 const ratio=n=>Number(n)/Number(total);
 return {version:'public-pass-joint-ownership/v1',possible:true,
  rules:'recovered qosa-1.0.0 3x9; externally verified forced-pass masks only',
  tiles:[x,y],compatibleWorlds:String(total),jointNumerators:countMap,
  marginals:{[x]:Object.fromEntries(LABELS.map((k,i)=>[k,ratio(rows[i])])),
   [y]:Object.fromEntries(LABELS.map((k,i)=>[k,ratio(cols[i])]))},
  sameOwnerProbability:ratio(LABELS.reduce((s,_,i)=>s+matrix[i][i],0n)),
  limitations:'Uniform compatible full assignments, not independent tile probabilities or human-play likelihood. Physical branch reopening and block scoring remain unverified.'};
}
function bruteTiny(spec,x,y){
 const played=new Set(spec.played.map(canonical));
 const known=[0,1,2,3].map(i=>(spec.known?.[i]||[]).map(canonical));
 const used=new Set([...played,...known.flat()]);
 const unknown=DECK.filter(t=>!used.has(t));
 assert(unknown.length<=8,'independent brute limited to at most eight unknown tiles');
 const cap=[...spec.handSizes,spec.stockSize].map((n,i)=>n-known[i].length);
 const bans=[0,1,2].map(i=>new Set((spec.passMasks?.[i]||[]).flat().map(canonical)));
 const fixed=Object.fromEntries(known.flatMap((h,i)=>h.map(t=>[t,i])));
 const matrix=Array.from({length:4},()=>Array(4).fill(0n));let total=0n;
 const assignment={...fixed};
 function rec(i){
  if(i===unknown.length){
   if(cap.some(n=>n!==0))return;
   total++;matrix[assignment[x]][assignment[y]]++;return;
  }
  const t=unknown[i];
  for(let owner=0;owner<4;owner++)if(cap[owner]>0&&(owner===3||!bans[owner].has(t))){
   cap[owner]--;assignment[t]=owner;rec(i+1);cap[owner]++;delete assignment[t];
  }
 }
 rec(0);return {total,matrix};
}
function test(){
 const connectors=DECK.filter(t=>t!=='1-1'&&t.split('-').includes('1'));
 const opening={played:['1-1'],handSizes:[8,9,9],stockSize:1,
  passMasks:{0:[connectors],2:[connectors]}};
 const a=analyzeJoint(opening,'1-2','1-3');
 const n=BigInt(a.compatibleWorlds),m=a.jointNumerators;
 assert.equal(BigInt(m.seat1.seat1)*5n,n*4n,'P(both seat1)=80%');
 assert.equal(BigInt(m.seat1.stock)*10n,n,'P(first seat1, second stock)=10%');
 assert.equal(BigInt(m.stock.seat1)*10n,n,'P(first stock, second seat1)=10%');
 assert.equal(m.stock.stock,'0','one stock tile cannot hold two connectors');
 assert.equal(a.marginals['1-2'].seat1,0.9);
 assert.equal(a.marginals['1-3'].seat1,0.9);
 assert.equal(a.sameOwnerProbability,0.8);
 const unknown=['0-0','0-1','0-2','0-3','0-4'];
 const tiny={played:DECK.filter(t=>!unknown.includes(t)),handSizes:[1,2,1],stockSize:1,
  passMasks:{0:[['0-0','0-1']],1:[['0-2']],2:[['0-3']]}};
 let cases=0,bruteWorlds=0n;
 for(const spec of [tiny,{...tiny,known:{2:['0-4']}}]){
  for(const [x,y] of [['0-0','0-2'],['0-1','0-4'],['0-3','0-0']]){
   const exact=analyzeJoint(spec,x,y),brute=bruteTiny(spec,x,y);
   assert.equal(BigInt(exact.compatibleWorlds),brute.total);
   for(let i=0;i<4;i++)for(let j=0;j<4;j++)
    assert.equal(BigInt(exact.jointNumerators[LABELS[i]][LABELS[j]]),brute.matrix[i][j]);
   cases++;bruteWorlds+=brute.total;
  }
 }
 const impossible={...tiny,passMasks:{0:[unknown],1:[unknown],2:[unknown]}};
 assert.equal(analyzeJoint(impossible,'0-0','0-1').possible,false);
 assert.throws(()=>analyzeJoint(tiny,'0-0','0-0'),/distinct/);
 assert.throws(()=>analyzeJoint(tiny,'1-1','0-0'),/played/);
 assert.throws(()=>analyzeJoint(tiny,'7-7','0-0'),/invalid/);
 return {passed:true,independentTinyCases:cases,bruteWorlds:String(bruteWorlds),
  openingJointWorlds:String(n),connectorMarginalStock:'10%',
  connectorPairBothSeat1:'80%',connectorPairBothStock:'0%',
  independentMarginalProductWouldBe:'81% (incorrect)',
  negativeGuards:4,newSeededDeals:0,newHiddenWorlds:0,newCompleteRounds:0};
}
if(require.main===module)console.log(JSON.stringify(test(),null,2));
module.exports={analyzeJoint,test};
