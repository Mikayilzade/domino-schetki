'use strict';
// Exact, branch-invariant immediate-pass audit for a known starter hand.
// Node 22: node qosha-research/simulator/opening-next-pass-exact.js test
// Node 22: node qosha-research/simulator/opening-next-pass-exact.js 2100000 20000
// Only one-ply legal-move availability is measured, NOT win probability.
const FOCAL=[[1,2],[1,5],[1,3],[0,0],[0,2],[2,2],[3,4],[4,5],[5,6]];
const CANDIDATES=[2,3,5];
const key=t=>[Math.min(...t),Math.max(...t)].join('-');
function deck(){const d=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)d.push([a,b]);return d;}
function pool(){const fixed=new Set(['1-1',...FOCAL.map(key)]);return deck().filter(t=>!fixed.has(key(t)));}
function comb(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);}
// Following starter 1-X, three 1-ends remain open and the new X-end is
// locked for ordinary tiles until X-X. The X-X itself is playable.
function canReply(hand,n){return hand.some(([a,b])=>a===1||b===1||(a===n&&b===n));}
function sample(seed){
 let z=((seed>>>0)+0x9e3779b9)>>>0;
 z=Math.imul(z^(z>>>16),0x21f0aaad)>>>0;
 z=Math.imul(z^(z>>>15),0x735a2d97)>>>0;
 z=(z^(z>>>15))>>>0||0x9e3779b9;
 const rand=()=>{z^=z<<13;z^=z>>>17;z^=z<<5;return(z>>>0)/4294967296;};
 const p=pool();
 for(let i=p.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[p[i],p[j]]=[p[j],p[i]];}
 return{opp:p.slice(0,9),other:p.slice(9)};
}
function exact(){
 const p=pool(),picked=[];
 const out={partitions:0,pass:{'2':0,'3':0,'5':0},passBoth35:0,paired2pass3plays:0,paired3pass2plays:0};
 function visit(s){
  if(picked.length===9){
   out.partitions++;
   const h=picked.map(i=>p[i]),a=CANDIDATES.map(n=>!canReply(h,n));
   CANDIDATES.forEach((n,i)=>{if(a[i])out.pass[n]++;});
   if(a[1]&&a[2])out.passBoth35++;
   if(a[0]&&!a[1])out.paired2pass3plays++;
   if(a[1]&&!a[0])out.paired3pass2plays++;
   return;
  }
  for(let i=s;i<=p.length-(9-picked.length);i++){picked.push(i);visit(i+1);picked.pop();}
 }
 visit(0);return out;
}
function test(){
 const p=pool(),all=['1-1',...FOCAL.map(key),...p.map(key)];
 if(p.length!==18||new Set(all).size!==28)throw Error('28-tile conservation');
 const e=exact();
 if(e.partitions!==comb(18,9)||e.pass[2]!==comb(15,9)||
    e.pass[3]!==comb(14,9)||e.pass[5]!==comb(14,9)||
    e.passBoth35!==comb(13,9)||e.paired2pass3plays!==3003||
    e.paired3pass2plays!==0)throw Error('exact/closed-form mismatch');
 for(let i=0;i<100;i++){
  const a=sample(2100000+i),b=sample(2100000+i);
  if(JSON.stringify(a)!==JSON.stringify(b)||
     new Set([...a.opp,...a.other].map(key)).size!==18)throw Error('determinism/conservation');
 }
 return{passed:true,exactPartitions:e.partitions,formulaChecks:7,deterministicSeedReplays:100};
}
function run(start=2100000,count=20000){
 if(!Number.isInteger(start)||!Number.isInteger(count)||start<0||count<1000)throw Error('bad seeds');
 const t=test(),e=exact(),hits={'2':0,'3':0,'5':0};
 const paired={pass2Play3:0,pass3Play2:0,pass3And5:0};
 for(let i=0;i<count;i++){
  const h=sample(start+i).opp,a=CANDIDATES.map(n=>!canReply(h,n));
  CANDIDATES.forEach((n,j)=>{if(a[j])hits[n]++;});
  if(a[0]&&!a[1])paired.pass2Play3++;
  if(a[1]&&!a[0])paired.pass3Play2++;
  if(a[1]&&a[2])paired.pass3And5++;
 }
 const rates={};let maxAbsZ=0;
 for(const n of CANDIDATES){
  const p=e.pass[n]/e.partitions,z=(hits[n]/count-p)/Math.sqrt(p*(1-p)/count);
  rates[n]={passCount:hits[n],rate:hits[n]/count,exactCount:e.pass[n],exactRate:p,z};
  maxAbsZ=Math.max(maxAbsZ,Math.abs(z));
 }
 if(maxAbsZ>5)throw Error('sample calibration '+maxAbsZ);
 return{
  schema:'qosha-opening-next-pass/v1',
  timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',
  engine:'qosa-research-0.5.3 + opening-next-pass-exact-1.0',
  rules:'recovered qosa-1.0.0; confirmed first-round 1-1, opened/locked branches before any later double',
  seeds:[start,start+count-1],deals:0,modelRounds:0,forcedContinuations:0,hiddenAllocations:count,
  strategies:'none; matched one-ply candidate comparison on uniform hidden worlds',
  fixture:{played:['1-1'],focalHand:FOCAL.map(key),unknownPool:pool().map(key),
   opponentHandSize:9,stock:0,candidates:['1-2','1-3','1-5'],
   assumption:'After starter plays one 1-X on an unused 1 branch, three 1 ends remain open; new X end is locked until X-X, which is itself playable.'},
  exact:{partitions:e.partitions,passCounts:e.pass,passBoth35:e.passBoth35,
   paired2pass3plays:e.paired2pass3plays,paired3pass2plays:e.paired3pass2plays,
   closedForm:{passAfter12:'C(15,9)/C(18,9)',passAfter13or15:'C(14,9)/C(18,9)',
    both13and15:'C(13,9)/C(18,9)'}},
  sampled:{rates,paired,maxAbsZ},tests:t,
  finding:'For this known starter hand, 1-2 leaves next opponent unable to move in 10.2941% of worlds versus 4.1176% after 1-3 or 1-5; difference is the opponent-available X-X.',
  confidence:'Exact independent 48,620-hand enumeration, closed-form combinatorics and 20,000 matched seeded hidden worlds',
  limitations:['Synthetic starter hand; not representative of all games','Next-turn availability only; no win-rate inference',
   'Stock empty after opening; no later double has yet been played','Future branch semantics, block ties and 101 scoring unvalidated'],
  nextAction:'Extend to deterministic dealt starter hands; stratify by owned X-X vs opponent-available X-X; validate late-arrival branch rule before full-game win comparisons.'
 };
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2100000),+(a[1]||20000)),null,2));}
module.exports={FOCAL,CANDIDATES,pool,canReply,sample,exact,test,run};
