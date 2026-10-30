'use strict';
// Exact four-destination ownership marginals from externally VERIFIED pass masks.
// Branch opening and scoring are NOT inferred. No random worlds or games simulated.
// Usage: node qosha-research/simulator/public-pass-ownership.js test
const assert=require('node:assert/strict');
const feasibility=require('./public-pass-feasibility');
const DECK=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)DECK.push(a+'-'+b);
const VALID=new Set(DECK);
const canonical=t=>{
 if(Array.isArray(t)&&t.length===2&&t.every(n=>Number.isInteger(n)&&n>=0&&n<=6))return Math.min(...t)+'-'+Math.max(...t);
 if(typeof t==='string'&&VALID.has(t))return t;
 throw Error('invalid tile');
};
const LABELS=['seat0','seat1','seat2','stock'];
const decimal=(n,d)=>(n*1000000n/d/1000000n).toString()+'.'+String(n*1000000n/d%1000000n).padStart(6,'0');
function analyzeOwnership(spec,requested){
 const base=feasibility.analyze(spec),total=BigInt(base.compatibleWorlds);
 if(total===0n)return {possible:false,compatibleWorlds:'0',marginals:null,reason:base.reason};
 const known=[0,1,2,3].map(i=>(spec.known?.[i]||[]).map(canonical));
 const played=new Set(spec.played.map(canonical));
 const all=requested===undefined?DECK.filter(t=>!played.has(t)):requested.map(canonical);
 assert.equal(new Set(all).size,all.length,'duplicate requested tiles');
 assert(all.every(t=>!played.has(t)),'cannot assign a played tile');
 const caps=[...spec.handSizes,spec.stockSize].map((n,i)=>n-known[i].length);
 const masks=[0,1,2].map(i=>new Set((spec.passMasks?.[i]||[]).flat().map(canonical)));
 const marginals={};
 for(const t of all){
  const knownOwner=known.findIndex(h=>h.includes(t));
  const nums=[0n,0n,0n,0n];
  if(knownOwner>=0)nums[knownOwner]=total;
  else{
   const eligible=LABELS.map((_,i)=>i).filter(i=>caps[i]>0&&(i===3||!masks[i].has(t)));
   assert(eligible.length>0,'positive worlds require an owner');
   let assigned=0n;
   for(const i of eligible.slice(0,-1)){
    const withKnown=known.map(h=>h.slice());withKnown[i].push(t);
    const n=BigInt(feasibility.analyze({...spec,known:withKnown}).compatibleWorlds);
    nums[i]=n;assigned+=n;
   }
   nums[eligible[eligible.length-1]]=total-assigned;
   assert(nums.every(n=>n>=0n),'marginal count underflow');
  }
  assert.equal(nums.reduce((a,b)=>a+b,0n),total,'tile ownership not conserved');
  marginals[t]={numerators:Object.fromEntries(LABELS.map((s,i)=>[s,String(nums[i])])),
   probability:Object.fromEntries(LABELS.map((s,i)=>[s,decimal(nums[i],total)])),
   certain:nums.includes(total)?LABELS[nums.findIndex(n=>n===total)]:null};
 }
 if(requested===undefined){
  for(let i=0;i<4;i++){
   const sum=Object.values(marginals).reduce((v,m)=>v+BigInt(m.numerators[LABELS[i]]),0n);
   assert.equal(sum,total*BigInt([ ...spec.handSizes,spec.stockSize][i]),'seat capacity marginal mismatch');
  }
 }
 return {version:'public-pass-ownership/v1',possible:true,compatibleWorlds:String(total),
  rules:'recovered qosa-1.0.0, 3x9; externally verified pass masks only; branch interpretation NOT inferred',
  marginals,limitations:'Uniform compatible assignments, not human-play probabilities. Masks must be verified forced passes with no intervening acquisition; later branch legality and block ties unverified.'};
}
function choose(n,k){let a=1n;for(let i=1;i<=k;i++)a=a*BigInt(n-i+1)/BigInt(i);return a;}
function bruteTiny(spec){
 const played=new Set(spec.played),pool=DECK.filter(t=>!played.has(t));
 const bans=[0,1,2].map(i=>new Set((spec.passMasks?.[i]||[]).flat()));
 const counts=Object.fromEntries(pool.map(t=>[t,[0n,0n,0n,0n]]));let total=0n;
 function rec(i,cap){if(i===pool.length)return 1n;
  let sum=0n;
  for(let seat=0;seat<4;seat++)if(cap[seat]&&(seat===3||!bans[seat].has(pool[i]))){
   cap[seat]--;const child=rec(i+1,cap);cap[seat]++;counts[pool[i]][seat]+=child;sum+=child;
  }return sum;}
 total=rec(0,[...spec.handSizes,spec.stockSize]);return {total,counts};
}
function test(){
 const connectors=DECK.filter(t=>t!=='1-1'&&t.split('-').includes('1'));
 const base={played:['1-1'],handSizes:[9,9,9],stockSize:0};
 const two={...base,passMasks:{0:[connectors],2:[connectors]}};
 const r=analyzeOwnership(two);
 assert.equal(BigInt(r.compatibleWorlds),choose(21,3)*choose(18,9));
 for(const t of connectors){assert.equal(r.marginals[t].certain,'seat1');}
 const ordinary='0-0';
 assert.equal(BigInt(r.marginals[ordinary].numerators.seat0)*7n,BigInt(r.compatibleWorlds)*3n);
 assert.equal(BigInt(r.marginals[ordinary].numerators.seat1)*7n,BigInt(r.compatibleWorlds));
 assert.equal(BigInt(r.marginals[ordinary].numerators.seat2)*7n,BigInt(r.compatibleWorlds)*3n);
 const stock=analyzeOwnership({...two,handSizes:[8,9,9],stockSize:1});
 const stockConnectorWorlds=6n*choose(21,4)*choose(17,8);
 const stockOtherWorlds=21n*choose(20,3)*choose(17,8);
 assert.equal(BigInt(stock.compatibleWorlds),stockConnectorWorlds+stockOtherWorlds);
 for(const t of connectors){
  assert.equal(BigInt(stock.marginals[t].numerators.seat1)*10n,BigInt(stock.compatibleWorlds)*9n);
  assert.equal(BigInt(stock.marginals[t].numerators.stock)*10n,BigInt(stock.compatibleWorlds));
 }
 const triple=analyzeOwnership({...base,passMasks:{0:[connectors],1:[connectors],2:[connectors]}});
 assert.equal(triple.compatibleWorlds,'0');
 const unknown=['0-0','0-1','0-2','0-3'];
 const tiny={played:DECK.filter(t=>!unknown.includes(t)),handSizes:[1,1,1],stockSize:1,
  passMasks:{0:[['0-0']],1:[['0-1']],2:[['0-2']]}};
 const exact=analyzeOwnership(tiny),brute=bruteTiny(tiny);
 assert.equal(brute.total,11n);assert.equal(BigInt(exact.compatibleWorlds),brute.total);
 for(const t of unknown)for(let i=0;i<4;i++)assert.equal(BigInt(exact.marginals[t].numerators[LABELS[i]]),brute.counts[t][i]);
 const known=analyzeOwnership({...tiny,known:{3:['0-3']}});
 assert.equal(known.marginals['0-3'].certain,'stock');
 assert.throws(()=>analyzeOwnership(base,['1-1']),/played/);
 assert.throws(()=>analyzeOwnership(base,['0-0','0-0']),/duplicate/);
 return {passed:true,scenarios:5,negativeGuards:2,bruteTinyWorlds:String(brute.total),
  twoPassWorlds:r.compatibleWorlds,twoPassCertainConnectors:6,
  oneStockConnectorSeat1:'9/10',oneStockConnectorStock:'1/10',
  newSeededDeals:0,newHiddenAllocations:0,newFullRounds:0};
}
if(require.main===module)console.log(JSON.stringify(test(),null,2));
module.exports={analyzeOwnership,test};