'use strict';
// Conservative 3-seat forced-pass ownership inference; no branch-rule assumption.
// node qosha-research/simulator/forced-pass-inference.js test|fixture|input.json
// Input passMasks are externally VERIFIED legal tile IDs at each forced pass.
// No tile draw/transfer by the passing seats between observations and snapshot.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const DECK=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)DECK.push(`${a}-${b}`);
const valid=new Set(DECK);
const choose=(n,k)=>{if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);};
function subsets(items,k,visit){
 const picked=[];
 function go(i){if(picked.length===k){visit(picked.slice());return;}
  for(let j=i;j<=items.length-(k-picked.length);j++){picked.push(items[j]);go(j+1);picked.pop();}}
 go(0);
}
function validate(s){
 assert.equal(s.snapshotNoInterveningDraws,true,'pass history requires no intervening draws/transfers');
 const own=s.own||[],played=s.played||[],one=s.knownSeat1||[],two=s.knownSeat2||[],stock=s.knownStock||[];
 const all=[...own,...played,...one,...two,...stock];
 assert(all.every(t=>valid.has(t)),'canonical double-six tile IDs required');
 assert.equal(new Set(all).size,all.length,'known tiles must be unique');
 const counts=s.counts||{};
 for(const key of ['seat1','seat2','stock'])assert(Number.isInteger(counts[key])&&counts[key]>=0,'bad count '+key);
 assert(one.length<=counts.seat1&&two.length<=counts.seat2&&stock.length<=counts.stock);
 assert.equal(own.length+played.length+counts.seat1+counts.seat2+counts.stock,28,'28-tile conservation');
 const masks=s.passMasks||{};
 for(const key of ['seat1','seat2'])for(const mask of masks[key]||[]){
  assert(Array.isArray(mask)&&mask.every(t=>valid.has(t)),'pass mask must be canonical tile IDs');
 }
 return {own,played,one,two,stock,counts,masks};
}
function infer(input){
 const s=validate(input);
 const used=new Set([...s.own,...s.played,...s.one,...s.two,...s.stock]);
 const pool=DECK.filter(t=>!used.has(t));
 const need1=s.counts.seat1-s.one.length,need2=s.counts.seat2-s.two.length,needStock=s.counts.stock-s.stock.length;
 assert.equal(pool.length,need1+need2+needStock);
 const ban1=new Set((s.masks.seat1||[]).flat()),ban2=new Set((s.masks.seat2||[]).flat());
 const knownConflict=s.one.some(t=>ban1.has(t))||s.two.some(t=>ban2.has(t));
 const eligible1=pool.filter(t=>!ban1.has(t));
 assert(choose(eligible1.length,need1)<=2000000,'too many candidate seat1 subsets; narrow snapshot');
 const totals=Object.fromEntries(pool.map(t=>[t,{seat1:0,seat2:0,stock:0}]));
 let worlds=0,visited=0;
 if(!knownConflict)subsets(eligible1,need1,seat1=>{
  visited++;
  const a=new Set(seat1),remaining=pool.filter(t=>!a.has(t));
  const eligible2=remaining.filter(t=>!ban2.has(t));
  const weight=choose(eligible2.length,need2);
  if(!weight)return;
  worlds+=weight;
  for(const t of seat1)totals[t].seat1+=weight;
  const b=new Set(eligible2);
  const inSeat2=choose(eligible2.length-1,need2-1);
  for(const t of remaining){
   const n=b.has(t)?inSeat2:0;
   totals[t].seat2+=n;
   totals[t].stock+=weight-n;
  }
 });
 const probabilities=worlds?Object.fromEntries(pool.map(t=>[t,Object.fromEntries(
  ['seat1','seat2','stock'].map(k=>[k,totals[t][k]/worlds]))])):null;
 if(worlds){
  for(const t of pool)assert.equal(totals[t].seat1+totals[t].seat2+totals[t].stock,worlds);
  for(const k of ['seat1','seat2','stock'])assert.equal(pool.reduce((v,t)=>v+totals[t][k],0),worlds*({seat1:need1,seat2:need2,stock:needStock})[k]);
 }
 const certain=probabilities?Object.fromEntries(pool.filter(t=>Object.values(probabilities[t]).some(p=>p===1))
  .map(t=>[t,Object.keys(probabilities[t]).find(k=>probabilities[t][k]===1)])):{};
 return {version:'forced-pass-inference/v1',rules:'recovered qosa-1.0.0; masks supplied externally; branch models not inferred',
  compatibleWorlds:worlds,inconsistent:worlds===0,visitedSeat1Subsets:visited,unknownTiles:pool.length,
  probabilities,certain,counts:s.counts,passCount:{seat1:(s.masks.seat1||[]).length,seat2:(s.masks.seat2||[]).length},
  caveat:'Uniform unknown allocations conditional on exact forced-pass legal masks, unchanged passing hands, and explicit stock; not a human-policy or win-rate model.'};
}
function brute(input){
 const s=validate(input),used=new Set([...s.own,...s.played,...s.one,...s.two,...s.stock]);
 const pool=DECK.filter(t=>!used.has(t)),n1=s.counts.seat1-s.one.length,n2=s.counts.seat2-s.two.length;
 const b1=new Set((s.masks.seat1||[]).flat()),b2=new Set((s.masks.seat2||[]).flat());
 const counts=Object.fromEntries(pool.map(t=>[t,{seat1:0,seat2:0,stock:0}]));let worlds=0;
 subsets(pool,n1,a=>{
  if([...a,...s.one].some(t=>b1.has(t)))return;
  const aa=new Set(a),rest=pool.filter(t=>!aa.has(t));
  subsets(rest,n2,b=>{
   if([...b,...s.two].some(t=>b2.has(t)))return;
   const bb=new Set(b);worlds++;
   for(const t of pool)counts[t][aa.has(t)?'seat1':bb.has(t)?'seat2':'stock']++;
  });
 });return {worlds,counts};
}
const touches=(t,n)=>t.split('-').includes(String(n));
const prefix=['1-1','1-2','2-2','2-4','4-4','4-5','5-5','2-5'];
const own=['3-3','0-1','0-2','0-3','1-4','1-5'];
const witness=(model,stock=0)=>({snapshotNoInterveningDraws:true,own,played:prefix,
 counts:{seat1:7,seat2:7-stock,stock},
 passMasks:{seat1:[DECK.filter(t=>touches(t,1)||(model==='global'&&touches(t,2)))],seat2:[]}});
function test(){
 let checks=0,bruteWorlds=0;
 for(const model of ['current','global'])for(const stock of [0,1]){
  const s=witness(model,stock),r=infer(s),b=brute(s);checks++;
  assert.equal(r.compatibleWorlds,b.worlds);
  for(const t of Object.keys(b.counts))for(const k of ['seat1','seat2','stock'])
   assert.equal(r.probabilities?.[t]?.[k]??null,b.worlds?b.counts[t][k]/b.worlds:null);
  bruteWorlds+=b.worlds;
  assert.equal(r.probabilities['1-3'].seat1,0);
  assert.equal(r.probabilities['1-3'].seat2,stock?6/7:1);
  assert.equal(r.probabilities['1-3'].stock,stock?1/7:0);
 }
 const both=witness('current',0);both.passMasks.seat2=[['1-3']];
 assert.equal(infer(both).compatibleWorlds,0);checks++;
 const bothStock=witness('current',1);bothStock.passMasks.seat2=[['1-3']];
 const bs=infer(bothStock),bb=brute(bothStock);checks++;
 assert.equal(bs.compatibleWorlds,bb.worlds);
 assert.equal(bs.probabilities['1-3'].stock,1);
 const contradiction=witness('current',0);
 contradiction.knownSeat1=['1-3'];assert.equal(infer(contradiction).compatibleWorlds,0);checks++;
 assert.throws(()=>infer({...witness('current',0),snapshotNoInterveningDraws:false}));checks++;
 assert.throws(()=>infer({...witness('current',0),own:[...own,'1-1']}));checks++;
 return {passed:true,checks,bruteCompatibleWorlds:bruteWorlds,
  current:infer(witness('current',0)).compatibleWorlds,
  global:infer(witness('global',0)).compatibleWorlds,
  finding:'One forced pass excludes every verified playable tile from that seat. With empty stock and two unknown opponents it assigns such a tile to the other seat; with one unknown stock it may instead be stock. Two passes can make an observation inconsistent.'};
}
if(require.main===module){
 const arg=process.argv[2]||'test';
 const output=arg==='test'?test():arg==='fixture'?{test:test(),current:infer(witness('current',0)),global:infer(witness('global',0))}:infer(JSON.parse(fs.readFileSync(arg,'utf8')));
 console.log(JSON.stringify(output,null,2));
}
module.exports={infer,brute,test,witness};
