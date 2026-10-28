'use strict';
// Rule-invariant midgame exact pass / own-mobility audit. Node 22.
// node qosha-research/simulator/midgame-end-collapse-exact.js 2697200 12000
function run(start,count){
 const fail=(p,m)=>{if(!p)throw Error(m)};
 const deck=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)deck.push([a,b]);
 const key=t=>t.join('-'),has=(t,n)=>t[0]===n||t[1]===n;
 const history=[[[1,2],0],[[2,2],0],[[1,3],1],[[1,4],2],[[4,4],2],[[3,4],2],[[1,5],3],[[5,5],3],[[3,5],3],[[3,3],1]];
 const played=[[1,1],...history.map(x=>x[0])],used=new Set(played.map(key));
 fail(used.size===11,'public tile duplication');
 const branchModels={};
 for(const model of ['global-ever-open','all-current-only']){
  const ends=[1,1,1,1],locked=[false,false,false,false],opened=new Set([1]);
  for(const [t,side] of history){
   const [a,b]=t,from=ends[side];
   if(a===b){fail(a===from,'double placement');opened.add(a);for(let s=0;s<4;s++)if(ends[s]===a)locked[s]=false;}
   else{fail(!locked[side]&&(a===from||b===from),'ordinary placement');
    const to=a===from?b:a;ends[side]=to;locked[side]=model==='global-ever-open'?!opened.has(to):true;}
  }
  fail(ends.join()==='2,3,3,3'&&locked.every(x=>!x),'not open under both models');
  branchModels[model]={ends,locked,opened:[...opened].sort()};
 }
 const candidate=[2,3],remaining=deck.filter(t=>!used.has(key(t))),base=remaining.filter(t=>key(t)!=='2-3');
 fail(remaining.length===17&&base.length===16,'pool size');
 const choose=(n,k)=>{if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v)};
 const state=other=>{
  const known=new Set([key(candidate),...other.map(key)]);
  const unknown=remaining.filter(t=>!known.has(key(t)));
  fail(known.size===5&&unknown.length===12,'focal/hidden conservation');
  const c=unknown.filter(t=>!has(t,3)).length,s=unknown.filter(t=>!has(t,2)&&!has(t,3)).length;
  return{unknown,pc:choose(c,6)/924,ps:choose(s,6)/924,
   mc:other.filter(t=>has(t,3)).length,ms:other.filter(t=>has(t,2)||has(t,3)).length};
 };
 const rows=[],ix=[];
 function combinations(i){
  if(ix.length===4){const other=ix.map(j=>base[j]),x=state(other);rows.push({other:other.map(key),pc:x.pc,ps:x.ps,mc:x.mc,ms:x.ms});return;}
  for(let j=i;j<=base.length-(4-ix.length);j++){ix.push(j);combinations(j+1);ix.pop();}
 }
 combinations(0);fail(rows.length===1820,'enumeration count');
 const avg=(rs,k)=>rs.length?rs.reduce((s,x)=>s+x[k],0)/rs.length:null;
 const strata={};
 for(const [name,pred] of Object.entries({noOwn3:r=>r.mc===0,oneOwn3:r=>r.mc===1,twoOwn3:r=>r.mc===2,atLeastOneOwn3:r=>r.mc>0})){
  const rs=rows.filter(pred);strata[name]={hands:rs.length,passCollapse:avg(rs,'pc'),passSpread:avg(rs,'ps'),
   ownPlayableCollapse:avg(rs,'mc'),ownPlayableSpread:avg(rs,'ms')};
 }
 const exact={hands:1820,partitionsPerHand:924,passCollapse:avg(rows,'pc'),passSpread:avg(rows,'ps'),
  passGain:avg(rows,'pc')-avg(rows,'ps'),strictGainHands:rows.filter(x=>x.pc>x.ps).length,
  equalHands:rows.filter(x=>x.pc===x.ps).length,ownPlayableCollapse:avg(rows,'mc'),ownPlayableSpread:avg(rows,'ms'),
  ownNoPlayCollapse:rows.filter(x=>x.mc===0).length,ownNoPlaySpread:rows.filter(x=>x.ms===0).length,strata};
 fail(exact.strictGainHands===1819&&exact.equalHands===1,'pass monotonicity');
 const brute=[];
 for(const idx of [0,910,1819]){
  const r=rows[idx],x=state(r.other.map(k=>k.split('-').map(Number))),take=[];
  let n=0,pc=0,ps=0;
  function rec(i){
   if(take.length===6){n++;const h=take.map(j=>x.unknown[j]);pc+=+(!h.some(t=>has(t,3)));ps+=+(!h.some(t=>has(t,2)||has(t,3)));return;}
   for(let j=i;j<=12-(6-take.length);j++){take.push(j);rec(j+1);take.pop();}
  }
  rec(0);fail(n===924&&pc/924===r.pc&&ps/924===r.ps,'exact brute check');
  brute.push({hand:['2-3',...r.other],partitions:n,passCollapse:pc,passSpread:ps});
 }
 const mix=z=>{z=(z>>>0)+0x9e3779b9;z=Math.imul(z^(z>>>16),0x21f0aaad);z=Math.imul(z^(z>>>15),0x735a2d97);return(z^(z>>>15))>>>0};
 const rand=seed=>{let z=mix(seed)||0x9e3779b9;return()=>{z^=z<<13;z^=z>>>17;z^=z<<5;return(z>>>0)/4294967296}};
 const shuffle=(a,seed)=>{const x=a.slice(),r=rand(seed);for(let i=x.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x};
 fail(JSON.stringify(shuffle(base,start))===JSON.stringify(shuffle(base,start)),'seed replay');
 let oc=0,os=0,ec=0,es=0,variance=0;
 for(let i=0;i<count;i++){
  const seed=start+i,other=shuffle(base,seed).slice(0,4),x=state(other);
  const hidden=shuffle(x.unknown,mix(seed^0xa53b91ef)),h1=hidden.slice(0,6),h2=hidden.slice(6);
  fail(new Set([...played,candidate,...other,...h1,...h2].map(key)).size===28,'world conservation');
  const c=+(!h1.some(t=>has(t,3))),s=+(!h1.some(t=>has(t,2)||has(t,3)));
  fail(c>=s,'paired pass monotonicity');
  oc+=c;os+=s;ec+=x.pc;es+=x.ps;const p=x.pc-x.ps;variance+=p*(1-p);
 }
 const observed={worlds:count,seedRange:[start,start+count-1],collapsePasses:oc,spreadPasses:os,
  collapseRate:oc/count,spreadRate:os/count,pairedGain:(oc-os)/count,
  expectedCollapse:ec/count,expectedSpread:es/count,expectedGain:(ec-es)/count,
  calibrationZ:((oc-os)-(ec-es))/Math.sqrt(variance)};
 fail(Math.abs(observed.calibrationZ)<5,'MC calibration');
 return{schema:'qosha-midgame-end-collapse-exact/v1',
  timestampAsiaBaku:new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04:00',
  engine:'qosa-research-0.5.3 + standalone midgame-end-collapse-1.0',
  rules:'recovered qosa-1.0.0 3x9; both provisional branch models agree in this window',
  publicTrace:['1-1',...history.map(x=>key(x[0]))],playedTiles:11,branchModels,
  knownFocalTile:'2-3',focalHandSize:5,opponentHandSizes:[6,6],stock:0,
  actions:['up: 2-3 on 2 => ends 3,3,3,3','left: 2-3 on 3 => ends 2,2,3,3'],
  exact,brute,observed,fullRounds:0,forcedContinuations:0,hiddenAllocations:count,
  strategies:['same tile, collapse ends','same tile, retain two values'],
  finding:'Immediate opponent pass probability improves by collapsing ends, but own follow-up mobility often disappears.',
  confidence:'Exact 1820 known hands x 924 hidden allocations; seeded Monte Carlo calibration; identical tile/pips.',
  limitations:['Synthetic chronological public trace, not physically authenticated.','Uniform hidden worlds; no pass/choice-history conditioning.','No two-opponent rollout or finish-first/match win/score claims.','Blocked ties, loneZero, bust and 101 scoring unresolved.'],
  nextAction:'Matched two-opponent midgame continuation and focal-return mobility, both provisional branch models, then authentic branch and block-tie fixtures.'};
}
if(typeof module!=='undefined')module.exports={run};
if(typeof require!=='undefined'&&require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(run(+(a[0]||2697200),+(a[1]||12000)),null,2));}
