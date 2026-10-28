'use strict';
// Both candidate 1-X and 1-Y connectors have their doubles owned by focal player.
// Node 22; deterministic seeds; first two opponents only, not full-round scoring.
const study=function study(ds=2618000,dn=60000,ws=2678000,wpp=32,npos=600){
 const deck=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)deck.push([a,b]);
 const key=t=>Math.min(t[0],t[1])+'-'+Math.max(t[0],t[1]),pip=t=>t[0]+t[1],other=t=>t[0]===1?t[1]:t[0];
 const rng=seed=>{let s=(seed>>>0)+0x9e3779b9;s=Math.imul(s^(s>>>16),0x21f0aaad);s=Math.imul(s^(s>>>15),0x735a2d97);s=(s^(s>>>15))>>>0||0x9e3779b9;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};};
 const shuffle=(src,seed)=>{const a=src.slice(),r=rng(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const C=(n,m)=>{if(m<0||m>n)return 0;let a=1;for(let i=1;i<=m;i++)a=a*(n-i+1)/i;return Math.round(a);};
 const init=x=>({ends:[x,1,1,1],locks:[true,false,false,false],opened:[1]});
 function legal(b,h){const out=[];for(let i=0;i<h.length;i++)for(let side=0;side<4;side++){const t=h[i],v=b.ends[side],dbl=t[0]===t[1];if(dbl&&t[0]===v)out.push({i,side,t,dbl,to:v});else if(!dbl&&!b.locks[side]&&(t[0]===v||t[1]===v))out.push({i,side,t,dbl,to:t[0]===v?t[1]:t[0]});}return out;}
 function apply(b,a,global){const n={ends:b.ends.slice(),locks:b.locks.slice(),opened:b.opened.slice()};if(a.dbl){if(!n.opened.includes(a.to))n.opened.push(a.to);if(global){for(let s=0;s<4;s++)if(n.ends[s]===a.to)n.locks[s]=false;}else n.locks[a.side]=false;}else{n.ends[a.side]=a.to;n.locks[a.side]=!(global&&n.opened.includes(a.to));}return n;}
 const choose=(as,pol)=>as.slice().sort((a,b)=>(pol==='high'?pip(b.t)-pip(a.t):pip(a.t)-pip(b.t))||key(a.t).localeCompare(key(b.t))||a.side-b.side)[0];
 function window(x,focal,h1,h2,pol,chain,global){let b=init(x),moves=0,extra=0,pass1=0,pass2=0;for(const [seat,hand] of [h1,h2].entries()){const h=hand.slice();let a=choose(legal(b,h),pol);if(!a){if(seat===0)pass1=1;else pass2=1;continue;}let count=0;while(a){b=apply(b,a,global);h.splice(a.i,1);moves++;if(count>0)extra++;count++;if(!chain||!a.dbl||count>=4)break;a=choose(legal(b,h).filter(q=>q.dbl&&!b.opened.includes(q.to)),pol);}}return{moves,extra,pass1,pass2,returnLegal:new Set(legal(b,focal).map(a=>a.i)).size};}
 if(key([1,0])!=='0-1'||legal(init(2),[[0,2]]).length||!legal(init(2),[[2,2]]).length)throw Error('canonical key/locked branch');
 if(window(2,[],[[1,3]],[[2,2],[3,3]],'high',true,true).moves!==3||window(2,[],[[1,3]],[[2,2],[3,3]],'high',false,true).moves!==2)throw Error('double chain');
 if(window(2,[],[[1,3],[2,2]],[],'low',true,true).moves!==1)throw Error('ordinary plus double');
 if(dn<1000||npos<10||wpp<1||ds+dn>ws||npos*wpp>100000)throw Error('parameters');
 let valid=0,reshuffles=0,eligible=0,positions=[];
 for(let seed=ds;seed<ds+dn;seed++){
  const d=shuffle(deck,seed);if(new Set(d.map(key)).size!==28)throw Error('deal conservation');
  if(key(d[27])==='1-1'){reshuffles++;continue;}valid++;
  const h=[d.slice(0,9),d.slice(9,18),d.slice(18,27)].find(h=>h.some(t=>key(t)==='1-1'));
  if(!h)throw Error('starter');
  const hand=h.filter(t=>key(t)!=='1-1').concat([d[27]]),known=new Set(hand.map(key));
  if(hand.length!==9||known.size!==9)throw Error('hand conservation');
  const con=hand.filter(t=>t.includes(1)).map(other).sort((a,b)=>a-b);
  const owned=con.filter(x=>known.has(x+'-'+x));
  if(owned.length<2)continue;
  eligible++;
  const pairs=[];for(let i=0;i<owned.length;i++)for(let j=i+1;j<owned.length;j++)pairs.push([owned[i],owned[j]]);
  pairs.sort((a,b)=>(a[1]-a[0])-(b[1]-b[0])||a[0]-b[0]);
  const [x,y]=pairs[0];
  if(positions.length<npos){
   const pool=deck.filter(t=>key(t)!=='1-1'&&!known.has(key(t)));
   if(pool.length!==18)throw Error('unknown pool');
   positions.push({seed,hand,pool,x,y,c:con.length,gap:y-x,ownedCount:owned.length});
  }
 }
 if(positions.length!==npos)throw Error('insufficient positions '+positions.length);
 const exact=[];
 for(const p of [positions[0],positions[Math.floor(npos/2)],positions[npos-1]]){
  let n=0,passX=0,passY=0;const ix=[];
  function rec(start){if(ix.length===9){const h=ix.map(i=>p.pool[i]);n++;passX+=+(!legal(init(p.x),h).length);passY+=+(!legal(init(p.y),h).length);return;}for(let i=start;i<=18-(9-ix.length);i++){ix.push(i);rec(i+1);ix.pop();}}
  rec(0);const expected=C(18-(6-p.c),9);if(n!==48620||passX!==expected||passY!==expected)throw Error('exact first-pass tie');
  exact.push({seed:p.seed,partitions:n,passX,passY,expected});
 }
 const fields=['moves','extra','pass1','pass2','returnLegal'],modes={};
 for(const mode of ['high-single','high-chain','low-single','low-chain']){
  const pol=mode.startsWith('high')?'high':'low',chain=mode.endsWith('chain'),sums={},per=[],modelDiff={pass1:0,pass2:0,moves:0,returnLegal:0};
  for(const f of fields)sums[f]={lower:0,higher:0,delta:0};
  for(let i=0;i<npos;i++){
   const p=positions[i],hx=p.hand.filter(t=>key(t)!==key([1,p.x])),hy=p.hand.filter(t=>key(t)!==key([1,p.y]));
   if(hx.length!==8||hy.length!==8||!hx.some(t=>key(t)===p.x+'-'+p.x)||!hy.some(t=>key(t)===p.y+'-'+p.y))throw Error('both doubles owned');
   const row={seed:p.seed,gap:p.gap,c:p.c,ownedCount:p.ownedCount};for(const f of fields)row[f]=0;
   for(let j=0;j<wpp;j++){
    const u=shuffle(p.pool,ws+i*wpp+j),h1=u.slice(0,9),h2=u.slice(9);
    if(new Set(p.hand.concat(u,[[1,1]]).map(key)).size!==28)throw Error('hidden conservation');
    const a=window(p.x,hx,h1,h2,pol,chain,true),b=window(p.y,hy,h1,h2,pol,chain,true);
    const aa=window(p.x,hx,h1,h2,pol,chain,false),bb=window(p.y,hy,h1,h2,pol,chain,false);
    if(a.pass1!==b.pass1||aa.pass1!==bb.pass1)throw Error('first pass tie invariant');
    for(const f of ['pass1','pass2','moves','returnLegal'])modelDiff[f]+=+(a[f]!==aa[f]||b[f]!==bb[f]);
    for(const f of fields){sums[f].lower+=a[f];sums[f].higher+=b[f];sums[f].delta+=a[f]-b[f];row[f]+=(a[f]-b[f])/wpp;}
   }
   per.push(row);
  }
  const N=npos*wpp,means={},ci95={},strata={};
  for(const f of fields){const delta=sums[f].delta/N,sem=Math.sqrt(per.reduce((a,r)=>a+(r[f]-delta)**2,0)/(npos-1)/npos);means[f]={lower:sums[f].lower/N,higher:sums[f].higher/N,delta};ci95[f]=[delta-1.96*sem,delta+1.96*sem];}
  for(const [name,fn] of Object.entries({gap1:r=>r.gap===1,gap2:r=>r.gap===2,gap3plus:r=>r.gap>=3,connectors2:r=>r.c===2,connectors3:r=>r.c===3,connectors4plus:r=>r.c>=4,exactly2doubles:r=>r.ownedCount===2,threePlusDoubles:r=>r.ownedCount>=3})){
   const rows=per.filter(fn);strata[name]={positions:rows.length,movesDelta:rows.length?rows.reduce((a,r)=>a+r.moves,0)/rows.length:null,returnLegalDelta:rows.length?rows.reduce((a,r)=>a+r.returnLegal,0)/rows.length:null,pass2Delta:rows.length?rows.reduce((a,r)=>a+r.pass2,0)/rows.length:null};
  }
  modes[mode]={means,ci95,strata,modelDiff};
 }
 for(let i=0;i<100;i++)if(JSON.stringify(shuffle(deck,ds+i))!==JSON.stringify(shuffle(deck,ds+i)))throw Error('seed replay');
 return {schema:'qosha-opening-both-doubles-owned/v1',timestampAsiaBaku:'2026-10-28T14:48:34+04:00',engine:'qosa-research-0.5.3 + opening-both-doubles-owned-1.0',rules:'recovered qosa-1.0.0 first-round 3x9; both branch models provisional',dealSeeds:[ds,ds+dn-1],worldSeeds:[ws,ws+npos*wpp-1],deals:dn,valid,reshuffles,eligible,positions:npos,worldsPerPosition:wpp,hiddenAllocations:npos*wpp,fullModelRounds:0,forcedFullContinuations:0,strategies:['legal lower 1-X with own X-X','legal higher 1-Y with own Y-Y; closest owned pair'],opponentPolicies:['high/low pip deterministic legal','single vs optional greedy multi-double chain up to four'],metrics:modes,tests:{deck28:dn,hiddenConservation:npos*wpp,exact48620:exact,seedReplay:100,firstPassEqual:true,multiDouble:true,canonical01:true},finding:'Both candidate doubles are owned, so exact first-opponent pass probabilities are equal. Compare two-turn opponent tempo and return mobility without double-ownership confounding.',confidence:'Deterministic paired conditional worlds; exploratory position-cluster confidence intervals.',limitations:['First 600 eligible hands, closest owned pair selected; selection bias.','Lower versus higher connector changes pip cost and geometry; not causal effect of keeping doubles.','No full-game win, median pips, minus or decision regret; blocked ties and late-arrival rules unverified.','Return mobility may depend on provisional branch model; report model disagreements.','Opponent policies simplistic, not authenticated human play.'],nextAction:'If same-ownership early tempo has no reliable effect, isolate branch geometry and compare exact pip-matched midgame moves; validate late-arrival and block ties before win-rate claims.'};
};
if(typeof module!=='undefined')module.exports={study};
if(typeof require!=='undefined'&&require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?study(2618000,2000,2678000,4,20):study(+(a[0]||2618000),+(a[1]||60000),+(a[2]||2678000),+(a[3]||32),+(a[4]||600)),null,2));}
