'use strict';
// Reproducible paired two-opponent window, synthetic public trace. Node >=18.
// node qosha-research/simulator/midgame-two-opponent-return.js test
// node qosha-research/simulator/midgame-two-opponent-return.js 2709200 20000 20000
// The two physical branch-unlocking interpretations are BOTH PROVISIONAL.
const assert=(x,m)=>{if(!x)throw Error(m);};
const key=t=>t[0]+'-'+t[1],pip=t=>t[0]+t[1],has=(t,n)=>t[0]===n||t[1]===n;
const deck=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)deck.push([a,b]);
const history=[[[1,2],0],[[2,2],0],[[1,3],1],[[1,4],2],[[4,4],2],[[3,4],2],[[1,5],3],[[5,5],3],[[3,5],3],[[3,3],1]];
const played=[[1,1],...history.map(x=>x[0])],used=new Set(played.map(key));
const candidate=[2,3],pool=deck.filter(t=>!used.has(key(t))&&key(t)!=='2-3');
assert(used.size===11&&pool.length===16,'public deck conservation');
function init(model){
 assert(model==='global-ever-open'||model==='all-current-only','unknown model');
 const b={model,ends:[1,1,1,1],locks:[false,false,false,false],global:new Set([1]),bySide:Array.from({length:4},()=>new Set([1]))};
 for(const [t,s] of history){
  if(t[0]===t[1]){const n=t[0];assert(b.ends[s]===n,'history double placement');openDouble(b,n);}
  else{const x=b.ends[s];assert(!b.locks[s]&&has(t,x),'history ordinary placement');place(b,{t,s,dbl:false,to:t[0]===x?t[1]:t[0]});}
 }
 assert(b.ends.join(',')==='2,3,3,3'&&b.locks.every(x=>!x),'pre-action ends/locks');
 return b;
}
function clone(b){return{model:b.model,ends:b.ends.slice(),locks:b.locks.slice(),global:new Set(b.global),bySide:b.bySide.map(x=>new Set(x))};}
function openDouble(b,n){
 b.global.add(n);
 for(let s=0;s<4;s++)if(b.ends[s]===n){b.locks[s]=false;b.bySide[s].add(n);}
}
function place(b,a){
 if(a.dbl){assert(b.ends[a.s]===a.to,'double end');openDouble(b,a.to);}
 else{assert(!b.locks[a.s]&&has(a.t,b.ends[a.s]),'illegal ordinary placement');b.ends[a.s]=a.to;
  b.locks[a.s]=b.model==='global-ever-open'?!b.global.has(a.to):!b.bySide[a.s].has(a.to);
 }
}
function legal(b,h){const out=[];for(let i=0;i<h.length;i++)for(let s=0;s<4;s++){
 const t=h[i],n=b.ends[s],dbl=t[0]===t[1];
 if(dbl){if(t[0]===n)out.push({i,s,t,to:n,dbl:true});}
 else if(!b.locks[s]&&has(t,n))out.push({i,s,t,to:t[0]===n?t[1]:t[0],dbl:false});
 }return out;
}
function action(b,kind){const c=clone(b);if(kind==='collapse')place(c,{t:candidate,s:0,to:3,dbl:false});
 else if(kind==='spread')place(c,{t:candidate,s:1,to:2,dbl:false});
 else throw Error('bad action');return c;}
function choose(actions,policy){if(!actions.length)return null;
 return actions.slice().sort((a,b)=>(policy==='high'?pip(b.t)-pip(a.t):pip(a.t)-pip(b.t))||key(a.t).localeCompare(key(b.t))||a.s-b.s)[0];}
function simulate(model,kind,h1,h2,focal,policy){
 const b=action(init(model),kind),passes=[],moves=[];
 for(const hand of [h1,h2]){
  const a=choose(legal(b,hand),policy);
  passes.push(!a);if(a){place(b,a);moves.push({tile:key(a.t),side:a.s,dbl:a.dbl});}
 }
 const returnLegal=new Set(legal(b,focal).map(x=>x.i)).size;
 return{passes,moves:moves.length,returnLegal,returnNoPlay:+(returnLegal===0),ends:b.ends,locks:b.locks};
}
function mix(z){z=(z>>>0)+0x9e3779b9;z=Math.imul(z^(z>>>16),0x21f0aaad);z=Math.imul(z^(z>>>15),0x735a2d97);return(z^(z>>>15))>>>0;}
function shuffle(src,seed){const x=src.slice();let z=mix(seed)||0x9e3779b9;for(let i=x.length-1;i>0;i--){z^=z<<13;z^=z>>>17;z^=z<<5;const j=Math.floor((z>>>0)/4294967296*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
function world(seed){const a=shuffle(pool,seed),focal=a.slice(0,4),other=shuffle(a.slice(4),mix(seed^0x1e0a75c3));
 assert(new Set([...played,candidate,...focal,...other].map(key)).size===28,'28-tile conservation');
 return{focal,h1:other.slice(0,6),h2:other.slice(6)};}
function selfTest(){
 assert(key([0,1])==='0-1'&&key([1,1])==='1-1','canonical key');
 for(const model of ['global-ever-open','all-current-only']){
  const b=init(model),c=action(b,'collapse'),s=action(b,'spread');
  assert(b.ends.join()==='2,3,3,3','source immutable');
  assert(c.ends.join()==='3,3,3,3'&&s.ends.join()==='2,2,3,3','candidate ends');
  assert(c.locks[0]===(model==='all-current-only')&&s.locks[1]===(model==='all-current-only'),'late-arrival locks');
  assert(legal(c,[[0,3]]).length>0&&legal(s,[[0,2]]).length>0,'legal post move');
  const d=clone(c);d.ends[0]=6;d.locks[0]=true;assert(legal(d,[[6,6]]).length>0,'locked double can open');
  place(d,legal(d,[[6,6]])[0]);assert(!d.locks[0],'double unlocked');
  assert(legal(c,[[0,2]]).length===0,'no 2 after collapse');
 }
 for(let i=0;i<100;i++){
  const w=world(2709200+i),w2=world(2709200+i);assert(JSON.stringify(w)===JSON.stringify(w2),'seed replay');
  for(const model of ['global-ever-open','all-current-only'])for(const policy of ['high','low']){
   const a=simulate(model,'collapse',w.h1,w.h2,w.focal,policy),b=simulate(model,'spread',w.h1,w.h2,w.focal,policy);
   assert(a.moves<=2&&b.moves<=2,'one stone per opponent');
  }
 }
 return{passed:true,replays:100,models:2,policies:2,conservation:100,lateArrivalLocks:true,lockedDouble:true};
}
function summary(rows){const n=rows.length,fields=['pass1','pass2','moves','returnLegal','returnNoPlay'];const result={worlds:n};
 for(const f of fields){const a=rows.map(r=>r[f][0]),b=rows.map(r=>r[f][1]),d=a.map((v,i)=>v-b[i]);
  const mean=x=>x.reduce((s,v)=>s+v,0)/n,delta=mean(d),variance=d.reduce((s,v)=>s+(v-delta)**2,0)/(n-1),se=Math.sqrt(variance/n);
  result[f]={collapse:mean(a),spread:mean(b),delta,exploratory95:[delta-1.96*se,delta+1.96*se]};}
 return result;}
function run(start=2709200,n1=20000,n2=20000){
 assert(Number.isInteger(start)&&start>=2709200&&Number.isInteger(n1)&&n1>=1000&&Number.isInteger(n2)&&n2>=1000,'seed params');
 const checks=selfTest(),modes={};let firstModelDifferences=0;
 for(const model of ['global-ever-open','all-current-only'])for(const policy of ['high','low']){
  const k=model+'/'+policy,rows=[[],[]],strata={own3:[[],[]],noOwn3:[[],[]]};
  for(let i=0;i<n1+n2;i++){
   const w=world(start+i),a=simulate(model,'collapse',w.h1,w.h2,w.focal,policy),b=simulate(model,'spread',w.h1,w.h2,w.focal,policy);
   const r={pass1:[+a.passes[0],+b.passes[0]],pass2:[+a.passes[1],+b.passes[1]],moves:[a.moves,b.moves],returnLegal:[a.returnLegal,b.returnLegal],returnNoPlay:[a.returnNoPlay,b.returnNoPlay]};
   rows[i<n1?0:1].push(r);strata[w.focal.some(t=>has(t,3))?'own3':'noOwn3'][i<n1?0:1].push(r);
  }
  modes[k]={cohort1:summary(rows[0]),cohort2:summary(rows[1]),overall:summary(rows[0].concat(rows[1])),strata:{own3:summary(strata.own3.flat()),noOwn3:summary(strata.noOwn3.flat())}};
 }
 for(const policy of ['high','low'])for(let i=0;i<1000;i++){
  const w=world(start+i),a=simulate('global-ever-open','collapse',w.h1,w.h2,w.focal,policy),b=simulate('all-current-only','collapse',w.h1,w.h2,w.focal,policy);
  const c=simulate('global-ever-open','spread',w.h1,w.h2,w.focal,policy),d=simulate('all-current-only','spread',w.h1,w.h2,w.focal,policy);
  firstModelDifferences+=+(a.passes[0]!==b.passes[0]||c.passes[0]!==d.passes[0]);
 }
 assert(firstModelDifferences===0,'first-pass branch-model divergence');
 for(const model of ['global-ever-open','all-current-only'])for(const policy of ['high','low'])for(const cohort of ['cohort1','cohort2']){
  const m=modes[model+'/'+policy][cohort],n=m.worlds;
  for(const [rate,exact] of [[m.pass1.collapse,.375],[m.pass1.spread,.0262237762237762]]){
   const z=(rate-exact)/Math.sqrt(exact*(1-exact)/n);assert(Math.abs(z)<5,'exact immediate-pass calibration');
  }
 }
 return{schema:'qosha-midgame-two-opponent-return/v1',timestampAsiaBaku:new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04:00',
  engine:'qosa-research-0.5.3 + midgame-two-opponent-return-1.0',rules:'recovered qosa-1.0.0 3x9; global-ever-open and all-current-only are provisional',
  seedRange:[start,start+n1+n2-1],cohorts:[[start,start+n1-1],[start+n1,start+n1+n2-1]],deals:0,completeRounds:0,forcedFullGameContinuations:0,hiddenAllocations:n1+n2,
  candidate:'same 2-3 tile, collapse ends vs preserve 2/3; same four-stone focal hand and two six-stone hidden opponent hands',
  policies:['highest pip legal one-stone opponent response','lowest pip legal one-stone opponent response'],
  modes,tests:{...checks,firstModelDifferences,immediatePassCalibration:true},
  finding:'Two-opponent tempo and focal-return mobility are measured on identical hidden worlds; this is not a full-round winning probability.',
  limitations:['Synthetic trace, no authenticated physical branch model','One-stone greedy response only, not real opponent policy or all multi-double sequences','Uniform unknown hands ignore prior choices/pass evidence','No block winner/ties, loneZero/bust, 101-match scoring, minus or win rates'],
  nextAction:'Audit counterexamples with focal 3 connector vs none; confirm physical late-arrival and block-tie rules before full-game paired regret.'};
}
if(typeof module!=='undefined')module.exports={run,selfTest,world,simulate};
if(typeof require!=='undefined'&&require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?selfTest():run(+(a[0]||2709200),+(a[1]||20000),+(a[2]||20000)),null,2));}
