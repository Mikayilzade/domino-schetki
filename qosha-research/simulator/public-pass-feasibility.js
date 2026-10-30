'use strict';
// Exact capacity/ownership feasibility for public Qoşa 3x9 pass histories.
// No branch model is chosen here: callers supply externally verified pass masks.
// Run: node qosha-research/simulator/public-pass-feasibility.js test
const assert=require('node:assert/strict');
const DECK=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)DECK.push(`${a}-${b}`);
const VALID=new Set(DECK);
const tile=t=>{
 if(Array.isArray(t)&&t.length===2&&t.every(n=>Number.isInteger(n)&&n>=0&&n<=6))
  return `${Math.min(...t)}-${Math.max(...t)}`;
 if(typeof t==='string'&&VALID.has(t))return t;
 throw Error('invalid canonical tile');
};
function analyze(spec){
 assert(spec&&Array.isArray(spec.played)&&Array.isArray(spec.handSizes)&&spec.handSizes.length===3,'played and three hand sizes required');
 const stockSize=spec.stockSize;
 assert(Number.isInteger(stockSize)&&stockSize>=0,'bad stock size');
 const sizes=[...spec.handSizes,stockSize];
 assert(sizes.every(n=>Number.isInteger(n)&&n>=0),'invalid capacities');
 const known=[0,1,2,3].map(i=>(spec.known?.[i]||[]).map(tile));
 const played=spec.played.map(tile);
 const all=[...played,...known.flat()];
 assert(all.every(k=>VALID.has(k))&&new Set(all).size===all.length,'duplicate/invalid known tile');
 assert.equal(played.length+sizes.reduce((a,b)=>a+b,0),28,'28-tile conservation');
 const capacities=sizes.map((n,i)=>n-known[i].length);
 assert(capacities.every(n=>n>=0),'known hand exceeds capacity');
 const bans=[0,1,2].map(i=>new Set((spec.passMasks?.[i]||[]).flat().map(tile)));
 const fixedConflict=[0,1,2].some(i=>known[i].some(k=>bans[i].has(k)));
 const used=new Set(all),pool=DECK.filter(k=>!used.has(k));
 assert.equal(pool.length,capacities.reduce((a,b)=>a+b,0),'unassigned capacities mismatch');
 if(fixedConflict)return {possible:false,compatibleWorlds:'0',unknownTiles:pool.length,reason:'known tile violates a verified pass mask'};
 const memo=new Map();
 function ways(i,r0,r1,r2){
  if(i===pool.length)return r0===0&&r1===0&&r2===0?1n:0n;
  const r3=pool.length-i-r0-r1-r2;
  if(r3<0||r3>capacities[3])return 0n;
  const k=`${i}:${r0}:${r1}:${r2}`;
  if(memo.has(k))return memo.get(k);
  const t=pool[i];let n=0n;
  if(r0&&!bans[0].has(t))n+=ways(i+1,r0-1,r1,r2);
  if(r1&&!bans[1].has(t))n+=ways(i+1,r0,r1-1,r2);
  if(r2&&!bans[2].has(t))n+=ways(i+1,r0,r1,r2-1);
  if(r3)n+=ways(i+1,r0,r1,r2);
  memo.set(k,n);return n;
 }
 const count=ways(0,capacities[0],capacities[1],capacities[2]);
 return {possible:count>0n,compatibleWorlds:String(count),unknownTiles:pool.length,
  reason:count?'compatible assignment exists':'all assignments violate capacities or pass masks'};
}
const choose=(n,k)=>{let r=1n;for(let i=1;i<=k;i++)r=r*BigInt(n-i+1)/BigInt(i);return r;};
function test(){
 const connectors=DECK.filter(k=>k!=='1-1'&&k.split('-').includes('1'));
 assert.equal(connectors.length,6);
 const base={played:['1-1'],handSizes:[9,9,9],stockSize:0};
 const noPass=analyze(base),expected=choose(27,9)*choose(18,9);
 assert.equal(BigInt(noPass.compatibleWorlds),expected);
 const two=analyze({...base,passMasks:{0:[connectors],2:[connectors]}});
 const expectedTwo=choose(21,3)*choose(18,9);
 assert.equal(BigInt(two.compatibleWorlds),expectedTwo);
 const three=analyze({...base,passMasks:{0:[connectors],1:[connectors],2:[connectors]}});
 assert.equal(three.compatibleWorlds,'0');
 const knownConflict=analyze({...base,known:{0:['1-2']},passMasks:{0:[connectors]}});
 assert.equal(knownConflict.compatibleWorlds,'0');
 const knownSeat1=analyze({...base,known:{1:['1-2']},passMasks:{0:[connectors],2:[connectors]}});
 assert.equal(knownSeat1.compatibleWorlds,two.compatibleWorlds);
 const stock={played:['1-1'],handSizes:[8,9,9],stockSize:1};
 const stockTriple=analyze({...stock,passMasks:{0:[connectors],1:[connectors],2:[connectors]}});
 assert.equal(stockTriple.compatibleWorlds,'0');
 const stockTwo=analyze({...stock,passMasks:{0:[connectors],2:[connectors]}});
 assert(stockTwo.possible);
 assert.throws(()=>analyze({...base,played:['1-1','1-1']}));
 assert.throws(()=>analyze({...base,passMasks:{0:[['7',2]]}}));
 return {passed:true,fixtures:7,negativeGuards:2,unconstrainedWorlds:noPass.compatibleWorlds,
  twoForcedPassesWorlds:two.compatibleWorlds,threeForcedPassesWorlds:three.compatibleWorlds,
  stockTriplePassWorlds:stockTriple.compatibleWorlds,stockTwoPassPossible:stockTwo.possible};
}
if(require.main===module)console.log(JSON.stringify(test(),null,2));
module.exports={analyze,test};
