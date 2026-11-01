'use strict';
const assert=require('assert');
const e=require('./engine');
const key=t=>e.tileKey(t);
const sortedKeys=h=>h.map(key).sort().join(',');
const allocationKey=w=>w.hands.map(sortedKeys).join('|')+'#'+sortedKeys(w.stock);
function choose(n,k){if(k<0||k>n)return 0;k=Math.min(k,n-k);let v=1;for(let i=1;i<=k;i++)v=v*(n-k+i)/i;return v;}
function stamp(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';}
function run(start=3413170,count=400){
 assert(Number.isInteger(start)&&Number.isInteger(count)&&count>0,'integer seed range');
 const unique=new Set(),hist=Array(8).fill(0),oneOne=[0,0,0,0],specific=Array(7).fill(0),deckKeys=new Set(e.createDoubleSixDeck().map(key));
 let tileConservationChecks=0,deterministicReplayChecks=0,totalDoubles=0,totalPips=0;
 for(let seed=start;seed<start+count;seed++){
  const a=e.dealThreeByNine(seed),b=e.dealThreeByNine(seed);
  assert.deepStrictEqual(a,b,'deterministic replay '+seed);deterministicReplayChecks++;
  assert.equal(a.hands.length,3);assert(a.hands.every(h=>h.length===9));assert.equal(a.stock.length,1);
  const all=a.hands.flat().concat(a.stock),keys=all.map(key),seen=new Set(keys);
  assert.equal(all.length,28);assert.equal(seen.size,28);assert.deepStrictEqual(seen,deckKeys);tileConservationChecks++;
  unique.add(allocationKey(a));
  for(let p=0;p<3;p++){
   const h=a.hands[p],doubles=h.filter(t=>t[0]===t[1]).length;hist[doubles]++;totalDoubles+=doubles;totalPips+=h.reduce((s,t)=>s+t[0]+t[1],0);
   for(const t of h)if(t[0]===t[1])specific[t[0]]++;
   if(h.some(t=>key(t)==='1-1'))oneOne[p]++;
  }
  if(a.stock.some(t=>key(t)==='1-1'))oneOne[3]++;
 }
 const handCount=count*3;
 const expected=Array.from({length:8},(_,k)=>handCount*choose(7,k)*choose(21,9-k)/choose(28,9));
 return{schema:'qosha-seed-preflight/v1',timestampAsiaBaku:stamp(),engine:'qosha-research-0.5.3',rules:'recovered qosa-1.0.0; 3 players x 9 + 1 stock; deal-level only',seedStart:start,seedEnd:start+count-1,deals:count,uniqueFullAllocations:unique.size,duplicateAllocations:count-unique.size,tileConservationChecks,deterministicReplayChecks,handCount,handDoubleCountHistogram:hist,expectedHandDoubleCountHistogram:expected,meanDoublesPerHand:totalDoubles/handCount,expectedMeanDoublesPerHand:9*7/28,meanPipsPerHand:totalPips/handCount,expectedMeanPipsPerHand:54,oneOneLocationCounts:{seat0:oneOne[0],seat1:oneOne[1],seat2:oneOne[2],stock:oneOne[3]},expectedOneOneLocationCounts:{eachSeat:count*9/28,stock:count/28},specificDoubleOwnershipCounts:specific,expectedOwnershipPerSpecificDouble:count*27/28,fullRoundSimulations:0,strategies:[],finding:'Seed/deal preflight only; no game outcomes or strategy labels were evaluated.'};
}
function test(){
 const x=run();
 assert.equal(x.uniqueFullAllocations,400);assert.equal(x.duplicateAllocations,0);
 assert.equal(x.tileConservationChecks,400);assert.equal(x.deterministicReplayChecks,400);
 assert.deepStrictEqual(x.handDoubleCountHistogram,[49,239,439,328,124,18,3,0]);
 assert.deepStrictEqual(x.oneOneLocationCounts,{seat0:117,seat1:128,seat2:142,stock:13});
 assert.deepStrictEqual(x.specificDoubleOwnershipCounts,[380,387,382,388,390,390,388]);
 return{passed:true,checks:7,seedStart:x.seedStart,seedEnd:x.seedEnd,deals:x.deals,uniqueFullAllocations:x.uniqueFullAllocations};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||3413170),+(a[1]||400)),null,2));}
module.exports={run,test};
