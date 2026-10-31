'use strict';
// Standalone exact 3x9 return-mobility audit; no scoreboard dependency.
// Reproduce: node qosha-research/simulator/reachable-return-policy-exact.js
const assert=require('node:assert/strict');
const deck=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)deck.push([a,b]);
const key=t=>t.join('-');
const core=[[0,1],[1,3],[1,4],[1,5],[1,6],[2,2]];
const variants=[
 ['baseline',[[0,2],[2,3]]],
 ['zero-and-bridge',[[0,0],[2,3]]],
 ['three-four-bridge',[[2,3],[3,4]]],
 ['four-rich',[[0,4],[2,4]]],
 ['three-rich',[[0,3],[2,3]]],
 ['zero-pair',[[0,0],[0,2]]]
];
const bits=n=>{let c=0;while(n){n&=n-1;c++;}return c;};
function focalAccess(hand,ends,opened){
 let stones=0,actions=0;
 for(const t of hand){
  const [a,b]=t;
  if(a===b){if(!opened.has(a)&&ends.includes(a)){stones++;actions++;}}
  else {let n=0;for(const x of ends)if(opened.has(x)&&(x===a||x===b))n++;
   if(n){stones++;actions+=n;}}
 }
 return {stones,actions};
}
function seat2Replies(hand,ends,opened){
 const out=[];
 for(const t of hand){const [a,b]=t;
  if(a===b){if(!opened.has(a)&&ends.includes(a))out.push({tile:t,to:a,kind:'double'});}
  else if(opened.has(ends[1])&&(a===ends[1]||b===ends[1])){
   out.push({tile:t,to:a===ends[1]?b:a,kind:'single'});
  }
 }
 return out.length?out:[{tile:null,to:ends[1],kind:'pass'}];
}
function evaluate(focal,s1,s2,candidate,policy){
 const number=candidate===0?3:4;
 const remain=focal.filter(t=>key(t)!=='1-'+number);
 const ends=[2,number,1,1],opened=new Set([1,number]);
 // Seat1 opens 3-3 after A, or 4-4 after B if owned; otherwise passes.
 const seat1Pass=candidate===1&&!s1.some(t=>key(t)==='4-4');
 // If seat1 passes after B, seat2 necessarily owns 4-4 and must open it.
 const replies=seat2Replies(s2,ends,seat1Pass?new Set([1]):opened);
 const outcomes=replies.map(r=>{
  const next=ends.slice();if(r.kind==='single')next[1]=r.to;
  const op=new Set(opened);if(r.kind==='double')op.add(r.to);
  return {reply:r,access:focalAccess(remain,next,op)};
 });
 let chosen;
 if(policy==='worst')chosen=outcomes.reduce((x,y)=>y.access.stones<x.access.stones?y:x);
 else if(policy==='best')chosen=outcomes.reduce((x,y)=>y.access.stones>x.access.stones?y:x);
 else {
  const sorted=outcomes.slice().sort((x,y)=>{
   const px=x.reply.tile?x.reply.tile[0]+x.reply.tile[1]:-1;
   const py=y.reply.tile?y.reply.tile[0]+y.reply.tile[1]:-1;
   return (policy==='high'?py-px:px-py)||key(x.reply.tile||[0,0]).localeCompare(key(y.reply.tile||[0,0]));
  });chosen=sorted[0];
 }
 return {seat1Pass,seat2Pass:chosen.reply.kind==='pass',...chosen.access,options:outcomes.length};
}
function run(){
 const rows=[];
 for(const [name,extras] of variants){
  const focal=[...core,...extras];assert.equal(focal.length,8);
  const known=new Set(['1-1','1-2',...focal.map(key)]);assert.equal(known.size,10);
  const pool=deck.filter(t=>!known.has(key(t))&&key(t)!=='3-3');assert.equal(pool.length,17);
  const policies=['high','low','worst','best'];
  const stats=Object.fromEntries(policies.map(p=>[p,{n:0,aStones:0,bStones:0,aActions:0,bActions:0,positive:0,negative:0,tie:0,aPass2:0,bPass2:0,seat1PassB:0,seat2ChoicesA:0,seat2ChoicesB:0}]));
  let n=0;
  for(let mask=0;mask<1<<17;mask++){
   if(bits(mask)!==8)continue;
   const s1=[[3,3]],s2=[];
   for(let i=0;i<17;i++)(mask&(1<<i)?s1:s2).push(pool[i]);
   assert.equal(s1.length,9);assert.equal(s2.length,9);
   if(n===0)assert.equal(new Set([[1,1],[1,2],...focal,...s1,...s2].map(key)).size,28);
   for(const p of policies){
    const a=evaluate(focal,s1,s2,0,p),b=evaluate(focal,s1,s2,1,p),s=stats[p];
    s.n++;s.aStones+=a.stones;s.bStones+=b.stones;
    s.aActions+=a.actions;s.bActions+=b.actions;
    s[a.stones===b.stones?'tie':a.stones<b.stones?'positive':'negative']++;
    s.aPass2+=+a.seat2Pass;s.bPass2+=+b.seat2Pass;
    s.seat1PassB+=+b.seat1Pass;s.seat2ChoicesA+=a.options;s.seat2ChoicesB+=b.options;
   }
   n++;
  }
  assert.equal(n,24310);
  for(const p of policies){const s=stats[p];assert.equal(s.n,n);assert.equal(s.positive+s.negative+s.tie,n);assert.equal(s.seat1PassB,12870);}
  rows.push({name,extraFocal:extras.map(key),worlds:n,policies:stats});
 }
 return {schema:'qosha-reachable-return-policy-exact/v1',engine:'independent standalone exact combinatorial oracle',rules:'qosa-1.0.0 3x9, PROVISIONAL global-ever-open branch kernel',seeds:null,newSeededWorlds:0,newCompleteRounds:0,exactOverlappingWorlds:rows.length*24310,policies:['high','low','worst','best'],rows};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,evaluate,focalAccess,seat2Replies};
