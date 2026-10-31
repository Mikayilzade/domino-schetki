'use strict';
// Independent finite 3x9 next-return oracle; no app or simulator dependencies.
// node qosha-research/simulator/return-dominance-contract.js
const assert=require('node:assert/strict');
const deck=[];for(let a=0;a<7;a++)for(let b=a;b<7;b++)deck.push([a,b]);
const key=t=>t.join('-');
const core=[[0,1],[1,3],[1,4],[1,5],[1,6],[2,2]];
const hands=[['baseline',[[0,2],[2,3]]],['zero-and-bridge',[[0,0],[2,3]]],
 ['three-four-bridge',[[2,3],[3,4]]],['four-rich',[[0,4],[2,4]]],
 ['three-rich',[[0,3],[2,3]]],['zero-pair',[[0,0],[0,2]]]];
function mobility(hand,ends,opened){return hand.filter(([a,b])=>a===b?
 (!opened.has(a)&&ends.includes(a)):ends.some(x=>opened.has(x)&&(x===a||x===b))).length;}
function evaluate(focal,s1,s2,c,policy){
 const n=c?4:3,ends=[2,n,1,1],open=new Set([1,n]);
 const firstPass=!!c&&!s1.some(t=>key(t)==='4-4');
 const seat2Open=firstPass?new Set([1]):open;
 const replies=[];
 for(const t of s2){const [a,b]=t;
  if(a===b){if(!seat2Open.has(a)&&ends.includes(a))replies.push({tile:t,to:a,dbl:true});}
  else if(seat2Open.has(n)&&(a===n||b===n))replies.push({tile:t,to:a===n?b:a,dbl:false});
 }
 if(!replies.length)replies.push({tile:[-1,-1],to:n,dbl:false});
 replies.sort((x,y)=>{
  const p=x.tile[0]+x.tile[1],q=y.tile[0]+y.tile[1];
  return (policy==='high'?q-p:p-q)||key(x.tile).localeCompare(key(y.tile));
 });
 const chosen=replies[0],after=ends.slice(),opened=new Set(open);
 if(chosen.dbl)opened.add(chosen.to);
 else if(chosen.tile[0]>=0)after[1]=chosen.to;
 const remaining=focal.filter(t=>key(t)!=='1-'+n);
 return {mobility:mobility(remaining,after,opened),firstPass};
}
function run(){
 const rows=[];
 for(const [name,extras] of hands){
  const focal=[...core,...extras],used=new Set(['1-1','1-2',...focal.map(key)]);
  assert.equal(focal.length,8);assert.equal(used.size,10);
  const pool=deck.filter(t=>!used.has(key(t))&&key(t)!=='3-3');assert.equal(pool.length,17);
  const totals=Object.fromEntries(['high','low'].map(p=>[p,{a:0,b:0,bBetter:0,aBetter:0,tie:0,aReturnPass:0,bReturnPass:0,seat1PassB:0}]));
  let worlds=0;
  for(let mask=0;mask<131072;mask++){
   let bits=0;for(let m=mask;m;m&=m-1)bits++;if(bits!==8)continue;
   const s1=[[3,3]],s2=[];
   for(let i=0;i<17;i++)(mask&(1<<i)?s1:s2).push(pool[i]);
   assert.equal(s1.length,9);assert.equal(s2.length,9);
   if(worlds===0)assert.equal(new Set([[1,1],[1,2],...focal,...s1,...s2].map(key)).size,28);
   for(const p of ['high','low']){
    const a=evaluate(focal,s1,s2,0,p),b=evaluate(focal,s1,s2,1,p),r=totals[p];
    r.a+=a.mobility;r.b+=b.mobility;r.seat1PassB+=+b.firstPass;
    r.aReturnPass+=+(a.mobility===0);r.bReturnPass+=+(b.mobility===0);
    r[a.mobility===b.mobility?'tie':a.mobility<b.mobility?'bBetter':'aBetter']++;
   }
   worlds++;
  }
  assert.equal(worlds,24310);
  for(const r of Object.values(totals)){
   assert.equal(r.seat1PassB,12870);assert.equal(r.bBetter+r.aBetter+r.tie,worlds);
   assert.equal(r.aReturnPass,0);assert.equal(r.bReturnPass,0);
  }
  if(name==='baseline')assert.deepEqual([totals.high.a,totals.high.b],[122265,121550]);
  if(name==='four-rich')assert.deepEqual([totals.high.a,totals.high.b],[121550,148720]);
  rows.push({name,extras:extras.map(key),worlds,policies:totals});
 }
 return {schema:'qosha-return-dominance-contract/v1',rules:'qosa-1.0.0 3x9; PROVISIONAL global-ever-open',
  exactOverlappingWorlds:145860,seedSet:null,newDeals:0,newRandomWorlds:0,newCompleteRounds:0,
  candidates:['1-3 left','1-4 left'],knownSeat1:'3-3',policies:['high','low'],rows};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,evaluate};
