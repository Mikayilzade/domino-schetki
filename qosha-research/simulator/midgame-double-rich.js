'use strict';
// Fixed physically plausible 3x9 public trace: p0 opens 1-1, draws stock and plays 0-1;
// clockwise p1,p2,p0,p1,p2,p0,p1. Next to act: p2 (7 stones).
// Both branch-unlock interpretations are PROVISIONAL.
// node qosha-research/simulator/midgame-double-rich.js test
// node qosha-research/simulator/midgame-double-rich.js 2773200 6000 6000
const assert=(x,m)=>{if(!x)throw Error(m);};
const key=t=>t.join('-'),has=(t,n)=>t[0]===n||t[1]===n,pips=t=>t[0]+t[1];
const deck=[];for(let i=0;i<=6;i++)for(let j=i;j<=6;j++)deck.push([i,j]);
const history=[
 {tile:[0,1],side:0,player:0},{tile:[1,6],side:1,player:1},
 {tile:[1,2],side:2,player:2},{tile:[2,2],side:2,player:0},
 {tile:[1,3],side:3,player:1},{tile:[3,3],side:3,player:2},
 {tile:[2,4],side:2,player:0},{tile:[4,4],side:2,player:1}
];
const focal=[[0,0],[6,6],[0,2],[1,4],[3,5],[4,5],[5,6]];
const played=[[1,1],...history.map(e=>e.tile)];
const used=new Set([...played,...focal].map(key));
const pool=deck.filter(t=>!used.has(key(t)));
function init(model){
 assert(['global-ever-open','all-current-only'].includes(model),'model');
 const b={model,ends:[1,1,1,1],locks:[false,false,false,false],global:new Set([1]),bySide:Array.from({length:4},()=>new Set([1]))};
 for(const e of history){
  assert(e.tile[0]===e.tile[1]||!b.locks[e.side],'public locked move');
  place(b,{t:e.tile,s:e.side,dbl:e.tile[0]===e.tile[1]});
 }
 assert(b.ends.join(',')==='0,6,4,3'&&b.locks.join(',')==='true,true,false,false','trace ends/locks');
 return b;
}
function clone(b){return{model:b.model,ends:b.ends.slice(),locks:b.locks.slice(),global:new Set(b.global),bySide:b.bySide.map(s=>new Set(s))};}
function openDouble(b,n){b.global.add(n);for(let s=0;s<4;s++)if(b.ends[s]===n){b.locks[s]=false;b.bySide[s].add(n);}}
function place(b,a){
 const n=b.ends[a.s];assert(has(a.t,n),'tile does not touch end');
 if(a.dbl){assert(a.t[0]===n,'double mismatch');openDouble(b,n);}
 else{assert(!b.locks[a.s],'locked side');const to=a.t[0]===n?a.t[1]:a.t[0];b.ends[a.s]=to;
  b.locks[a.s]=b.model==='global-ever-open'?!b.global.has(to):!b.bySide[a.s].has(to);}
}
function legal(b,hand){
 const out=[];for(let i=0;i<hand.length;i++)for(let s=0;s<4;s++){
  const t=hand[i],n=b.ends[s],dbl=t[0]===t[1];
  if(dbl? t[0]===n:!b.locks[s]&&has(t,n))out.push({i,s,t,dbl});
 }return out;
}
function focalAction(model,kind){
 const b=init(model),h=focal.slice();
 const order=kind==='single0'?[0]:kind==='single6'?[6]:kind==='chain06'?[0,6]:kind==='chain60'?[6,0]:null;
 assert(order,'action kind');
 for(const n of order){
  const a=legal(b,h).find(x=>x.dbl&&x.t[0]===n);
  assert(a,'focal double illegal');place(b,a);h.splice(a.i,1);
 }
 return{b,h,played:order.length};
}
function choose(b,h,policy){
 const moves=legal(b,h);if(!moves.length)return null;
 moves.sort((a,b)=>{
  if(policy==='double-first'&&a.dbl!==b.dbl)return a.dbl?-1:1;
  const d=policy==='low'?pips(a.t)-pips(b.t):pips(b.t)-pips(a.t);
  return d||key(a.t).localeCompare(key(b.t))||a.s-b.s;
 });return moves[0];
}
function opponentTurn(b,hand,policy){
 const h=hand.slice();let a=choose(b,h,policy);
 if(!a)return{stones:0,pass:1,doubles:0,extra:0};
 const chain=a.dbl;let stones=0,doubles=0;
 while(a){
  place(b,a);h.splice(a.i,1);stones++;doubles+=+a.dbl;
  if(!chain||stones>=4)break;
  const d=legal(b,h).filter(x=>x.dbl);
  if(!d.length)break;
  d.sort((x,y)=>pips(y.t)-pips(x.t)||key(x.t).localeCompare(key(y.t))||x.s-y.s);
  a=d[0];
 }
 return{stones,pass:0,doubles,extra:Math.max(0,stones-1)};
}
function simulate(model,kind,w,policy){
 const a=focalAction(model,kind),b=a.b;
 const o0=opponentTurn(b,w.h0,policy),o1=opponentTurn(b,w.h1,policy);
 const ownLegal=new Set(legal(b,a.h).map(x=>x.i)).size;
 return{opponentStones:o0.stones+o1.stones,opponentPasses:o0.pass+o1.pass,
  opponentExtraDoubles:o0.extra+o1.extra,ownLegal,ownPass:+(ownLegal===0),
  ownRemaining:a.h.length,ownPips:a.h.reduce((s,t)=>s+pips(t),0),
  ends:b.ends.join(','),locks:b.locks.join(',')};
}
function mix(z){z=(z>>>0)+0x9e3779b9;z=Math.imul(z^(z>>>16),0x21f0aaad);z=Math.imul(z^(z>>>15),0x735a2d97);return(z^(z>>>15))>>>0;}
function shuffle(src,seed){const a=src.slice();let z=mix(seed)||0x9e3779b9;
 for(let i=a.length-1;i>0;i--){z^=z<<13;z^=z>>>17;z^=z<<5;const j=Math.floor((z>>>0)/4294967296*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function world(seed){const x=shuffle(pool,seed);return{h0:x.slice(0,6),h1:x.slice(6)};}
function exactWorlds(){
 const a=[];function rec(start,idx){if(idx.length===6){const s=new Set(idx);a.push({h0:idx.map(i=>pool[i]),h1:pool.filter((_,i)=>!s.has(i))});return;}
  for(let i=start;i<=pool.length-(6-idx.length);i++)rec(i+1,idx.concat(i));}
 rec(0,[]);return a;
}
function summarize(rows){
 const n=rows.length,metrics=['opponentStones','opponentPasses','opponentExtraDoubles','ownLegal','ownPass'];
 const out={n};for(const m of metrics){
  const vals=rows.map(x=>x[m]),avg=vals.reduce((s,v)=>s+v,0)/n;out[m]=avg;
 }return out;
}
function aggregate(worlds,model,policy){
 const rows={};for(const k of ['single0','single6','chain06','chain60'])rows[k]=[];
 let orderMismatch=0,ownConservation=0;
 for(const w of worlds){
  const v={};for(const k of Object.keys(rows)){v[k]=simulate(model,k,w,policy);rows[k].push(v[k]);}
  if(JSON.stringify(v.chain06)!==JSON.stringify(v.chain60))orderMismatch++;
  if(v.chain06.ownRemaining!==5||v.single0.ownRemaining!==6)ownConservation++;
 }
 const summaries=Object.fromEntries(Object.entries(rows).map(([k,r])=>[k,summarize(r)]));
 const deltas={};
 for(const single of ['single0','single6']){
  deltas['chain06-minus-'+single]={};
  for(const m of ['opponentStones','opponentPasses','opponentExtraDoubles','ownLegal','ownPass'])
   deltas['chain06-minus-'+single][m]=summaries.chain06[m]-summaries[single][m];
 }
 return{summaries,deltas,orderMismatch,ownConservation};
}
function test(){
 assert(played.length===9&&pool.length===12&&used.size===16,'tile conservation');
 assert(new Set([...played,...focal,...pool].map(key)).size===28,'28 unique tiles');
 assert(history.map(x=>x.player).join(',')==='0,1,2,0,1,2,0,1','clockwise history');
 for(const model of ['global-ever-open','all-current-only']){
  const b=init(model),options=legal(b,focal).filter(x=>x.dbl).map(x=>x.t[0]);
  assert(options.includes(0)&&options.includes(6),'two simultaneous legal doubles');
  const c=focalAction(model,'chain06'),d=focalAction(model,'chain60');
  assert(c.h.length===5&&c.b.locks[0]===false&&c.b.locks[1]===false,'double chain unlock');
  assert(c.b.ends.join(',')===d.b.ends.join(',')&&c.b.locks.join(',')===d.b.locks.join(','),'chain commutation');
  assert(focalAction(model,'single0').b.locks[1]===true,'optional stop leaves six locked');
  const w=world(2773200);assert(JSON.stringify(w)===JSON.stringify(world(2773200)),'seed replay');
  for(const policy of ['high','low','double-first']){
   const x=simulate(model,'chain06',w,policy),y=simulate(model,'chain60',w,policy);
   assert(JSON.stringify(x)===JSON.stringify(y),'chain order invariance');
  }
 }
 const ex=exactWorlds();assert(ex.length===924,'exact 12 choose 6');
 assert(new Set(ex.map(w=>w.h0.map(key).join(','))).size===924,'unique partitions');
 for(let i=0;i<100;i++){
  const w=world(2773200+i);
  assert(new Set([...played,...focal,...w.h0,...w.h1].map(key)).size===28,'sample conservation');
 }
 return{passed:true,exactPartitions:924,deterministicReplays:100,models:2,simultaneousDoubles:[0,6],historyPlayerCounts:[3,3,2]};
}
function run(start=2773200,n1=6000,n2=6000){
 assert(Number.isInteger(start)&&start>=2773200&&Number.isInteger(n1)&&n1>=1000&&Number.isInteger(n2)&&n2>=1000,'seed args');
 const checks=test(),exact=exactWorlds(),modes={};
 const samples1=Array.from({length:n1},(_,i)=>world(start+i)),samples2=Array.from({length:n2},(_,i)=>world(start+n1+i));
 for(const model of ['global-ever-open','all-current-only'])for(const policy of ['high','low','double-first']){
  const k=model+'/'+policy,full=aggregate(exact,model,policy),a=aggregate(samples1,model,policy),b=aggregate(samples2,model,policy);
  assert(full.orderMismatch===0&&a.orderMismatch===0&&b.orderMismatch===0,'double order mismatch');
  assert(full.ownConservation===0&&a.ownConservation===0&&b.ownConservation===0,'focal stone count');
  modes[k]={exact:full,cohort1:a,cohort2:b};
 }
 return{schema:'qosha-midgame-double-rich/v1',timestampAsiaBaku:'2026-10-28 18:50 +04:00',
  engine:'qosa-research-0.5.3 + midgame-double-rich-1.0',rules:'recovered qosa-1.0.0 3x9; both branch models provisional',
  publicTrace:history,initialPlayed:'1-1 by p0; p0 draws stock then 0-1 followup',focalPlayer:2,
  focalHand:focal,handSizesBefore:[6,6,7],boardBefore:{ends:[0,6,4,3],locks:[true,true,false,false]},
  seedRange:[start,start+n1+n2-1],cohorts:[[start,start+n1-1],[start+n1,start+n1+n2-1]],
  newHiddenAllocations:n1+n2,exactPartitions:exact.length,completeRounds:0,forcedFullGameContinuations:0,
  strategies:['high pip','low pip','double-first'],actions:['single0','single6','chain06','chain60'],checks,modes,
  confidence:'exact over all 924 opponent partitions conditional on fixed public history/focal hand; conditional hidden hands uniform and not filtered by prior choices',
  limitations:['synthetic public history, not independently authenticated from human game','both branch unlock models provisional','focal chain two doubles vs one has different immediate hand size and opens two numbers; no win-rate/score/finish-minus conclusion','opponent policies simplified, no full-history posterior','block winner/tie and 101 scoring unresolved'],
  nextAction:'Use a real public trace with 0-0 and 6-6 both held to validate branch unlocking and multi-double; then test full continuation only after blocked ties and scoring confirmed'};
}
if(require.main===module){
 const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2773200),+(a[1]||6000),+(a[2]||6000)),null,2));
}
module.exports={history,focal,init,legal,place,focalAction,world,exactWorlds,test,run};
