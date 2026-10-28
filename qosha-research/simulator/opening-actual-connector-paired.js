'use strict';
// Paired ACTUAL legal first-round connector choices; no unvalidated full-game scoring.
function study(ds=2432000,dn=50000,ws=2482000,wpp=32,npos=500){
 const deck=[];for(let a=0;a<7;a++)for(let b=a;b<7;b++)deck.push([a,b]);
 const key=t=>Math.min(t[0],t[1])+'-'+Math.max(t[0],t[1]),pip=t=>t[0]+t[1],other=t=>t[0]===1?t[1]:t[0];
 const rng=seed=>{let s=(seed>>>0)+0x9e3779b9;s=Math.imul(s^(s>>>16),0x21f0aaad);s=Math.imul(s^(s>>>15),0x735a2d97);s=(s^(s>>>15))>>>0||0x9e3779b9;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};};
 const shuffle=(src,seed)=>{const a=src.slice(),r=rng(seed);for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const C=(n,m)=>{if(m<0||m>n)return 0;let a=1;for(let i=1;i<=m;i++)a=a*(n-i+1)/i;return Math.round(a);};
 const init=x=>({ends:[x,1,1,1],locks:[true,false,false,false],opened:[1]});
 function legal(b,h){const out=[];for(let i=0;i<h.length;i++)for(let side=0;side<4;side++){const t=h[i],v=b.ends[side],dbl=t[0]===t[1];if(dbl&&t[0]===v)out.push({i,side,t,dbl,to:v});else if(!dbl&&!b.locks[side]&&(t[0]===v||t[1]===v))out.push({i,side,t,dbl,to:t[0]===v?t[1]:t[0]});}return out;}
 function apply(b,a,global){const n={ends:b.ends.slice(),locks:b.locks.slice(),opened:b.opened.slice()};if(a.dbl){if(!n.opened.includes(a.to))n.opened.push(a.to);if(global){for(let s=0;s<4;s++)if(n.ends[s]===a.to)n.locks[s]=false;}else n.locks[a.side]=false;}else{n.ends[a.side]=a.to;n.locks[a.side]=!(global&&n.opened.includes(a.to));}return n;}
 const choose=(as,pol)=>as.slice().sort((a,b)=>(pol==='high'?pip(b.t)-pip(a.t):pip(a.t)-pip(b.t))||key(a.t).localeCompare(key(b.t))||a.side-b.side)[0];
 function window(x,focal,h1,h2,pol,chain,global){let b=init(x),moves=0,extra=0,pass1=0,pass2=0;for(const [seat,hand] of [h1,h2].entries()){const h=hand.slice();let a=choose(legal(b,h),pol);if(!a){if(seat===0)pass1=1;else pass2=1;continue;}let count=0;while(a){b=apply(b,a,global);h.splice(a.i,1);moves++;if(count>0)extra++;count++;if(!chain||!a.dbl||count>=4)break;a=choose(legal(b,h).filter(q=>q.dbl&&!b.opened.includes(q.to)),pol);}}return{moves,extra,pass1,pass2,returnLegal:new Set(legal(b,focal).map(a=>a.i)).size};}
 if(key([1,0])!=='0-1'||[[0,1],[0,0],[1,4]].filter(t=>key(t)!==key([1,0])).length!==2)throw Error('canonical 0-1 removal');
 if(legal(init(2),[[0,2]]).length||!legal(init(2),[[2,2]]).length)throw Error('locked branch');
 if(window(2,[],[[1,3]],[[2,2],[3,3]],'high',true,true).moves!==3||window(2,[],[[1,3]],[[2,2],[3,3]],'high',false,true).moves!==2)throw Error('double chain');
 if(window(2,[],[[1,3],[2,2]],[],'low',true,true).moves!==1)throw Error('ordinary append');
 if(npos%2||dn<npos*4||wpp<1)throw Error('parameters');
 const groups=[[],[]];let reshuffles=0,valid=0,eligible=0;
 for(let seed=ds;seed<ds+dn;seed++){
  const d=shuffle(deck,seed);if(new Set(d.map(key)).size!==28)throw Error('deal conservation');
  if(key(d[27])==='1-1'){reshuffles++;continue;}valid++;
  const hands=[d.slice(0,9),d.slice(9,18),d.slice(18,27)],starter=hands.find(h=>h.some(t=>key(t)==='1-1'));
  const hand=starter.filter(t=>key(t)!=='1-1').concat([d[27]]),known=new Set(hand.map(key));
  if(hand.length!==9||known.size!==9)throw Error('starter');
  const con=hand.filter(t=>t.includes(1)).map(other),own=con.filter(x=>known.has(x+'-'+x)),not=con.filter(y=>!known.has(y+'-'+y));
  const candidates=[];for(const x of own)for(const y of not)if(x!==y)candidates.push({x,y,gap:Math.abs(x-y),c:con.length});
  if(!candidates.length)continue;eligible++;candidates.sort((a,b)=>a.gap-b.gap||a.x-b.x||a.y-b.y);
  const q=candidates.find(q=>groups[q.x>q.y?0:1].length<npos/2);if(!q)continue;
  const pool=deck.filter(t=>key(t)!=='1-1'&&!known.has(key(t)));if(pool.length!==18)throw Error('pool');
  groups[q.x>q.y?0:1].push({seed,hand,pool,...q});
 }
 if(groups.some(g=>g.length!==npos/2))throw Error('insufficient sign balance');
 const positions=groups.flat().sort((a,b)=>a.seed-b.seed);
 const legalHiddenCount=(p,z)=>p.pool.filter(t=>t.includes(1)).length+Number(p.pool.some(t=>key(t)===z+'-'+z));
 const exact=[];for(const p of [positions[0],positions[positions.length-1]]){
  const picks=[];let total=0,px=0,py=0;function visit(start){if(picks.length===9){total++;const h=picks.map(i=>p.pool[i]);px+=+(!legal(init(p.x),h).length);py+=+(!legal(init(p.y),h).length);return;}for(let i=start;i<=18-(9-picks.length);i++){picks.push(i);visit(i+1);picks.pop();}}visit(0);
  if(total!==48620||px!==C(18-legalHiddenCount(p,p.x),9)||py!==C(18-legalHiddenCount(p,p.y),9))throw Error('exact pass mismatch');
  exact.push({seed:p.seed,partitions:total,passOwned:px,passUnowned:py,hiddenLegalOwned:legalHiddenCount(p,p.x),hiddenLegalUnowned:legalHiddenCount(p,p.y)});
 }
 const fields=['moves','extra','pass1','pass2','returnLegal'],modes={};
 for(const mode of ['high-single','high-chain','low-single','low-chain']){
  const pol=mode.startsWith('high')?'high':'low',chain=mode.endsWith('chain'),sums={},per=[];
  for(const f of fields)sums[f]={owned:0,unowned:0,delta:0};
  let firstModelDifferences=0,secondModelDifferences=0,returnModelDifferences=0,expectedPass=0,passVariance=0;
  for(let i=0;i<positions.length;i++){
   const p=positions[i],hx=p.hand.filter(t=>key(t)!==key([1,p.x])),hy=p.hand.filter(t=>key(t)!==key([1,p.y]));
   if(hx.length!==8||hy.length!==8||!hx.some(t=>key(t)===p.x+'-'+p.x)||hy.some(t=>key(t)===p.y+'-'+p.y))throw Error('actual legal alternatives');
   const row={seed:p.seed,gap:p.gap,sign:p.x>p.y?'ownedHigher':'ownedLower',c:p.c};for(const f of fields)row[f]=0;
   const px=C(18-legalHiddenCount(p,p.x),9)/48620,py=C(18-legalHiddenCount(p,p.y),9)/48620;
   expectedPass+=(px-py)*wpp;passVariance+=wpp*(px*(1-px)+py*(1-py));
   for(let j=0;j<wpp;j++){
    const u=shuffle(p.pool,ws+i*wpp+j),h1=u.slice(0,9),h2=u.slice(9);
    if(new Set(p.hand.concat(u,[[1,1]]).map(key)).size!==28)throw Error('hidden conservation');
    const a=window(p.x,hx,h1,h2,pol,chain,true),b=window(p.y,hy,h1,h2,pol,chain,true);
    const aa=window(p.x,hx,h1,h2,pol,chain,false),bb=window(p.y,hy,h1,h2,pol,chain,false);
    firstModelDifferences+=+(a.pass1!==aa.pass1||b.pass1!==bb.pass1);
    secondModelDifferences+=+(a.moves!==aa.moves||b.moves!==bb.moves||a.pass2!==aa.pass2||b.pass2!==bb.pass2);
    returnModelDifferences+=+(a.returnLegal!==aa.returnLegal||b.returnLegal!==bb.returnLegal);
    for(const f of fields){sums[f].owned+=a[f];sums[f].unowned+=b[f];sums[f].delta+=a[f]-b[f];row[f]+=(a[f]-b[f])/wpp;}
   }per.push(row);
  }
  const N=npos*wpp,means={},ci95={},by={};
  for(const f of fields){const delta=sums[f].delta/N,sem=Math.sqrt(per.reduce((a,r)=>a+(r[f]-delta)**2,0)/(npos-1)/npos);means[f]={owned:sums[f].owned/N,unowned:sums[f].unowned/N,delta};ci95[f]=[delta-1.96*sem,delta+1.96*sem];}
  for(const [name,fn] of Object.entries({ownedHigher:r=>r.sign==='ownedHigher',ownedLower:r=>r.sign==='ownedLower',gap1:r=>r.gap===1,gap2:r=>r.gap===2,gap3plus:r=>r.gap>=3,connectors2:r=>r.c===2,connectors3:r=>r.c===3,connectors4plus:r=>r.c>=4})){
   const rows=per.filter(fn);by[name]={positions:rows.length,movesDelta:rows.length?rows.reduce((a,r)=>a+r.moves,0)/rows.length:null,pass1Delta:rows.length?rows.reduce((a,r)=>a+r.pass1,0)/rows.length:null,returnLegalDelta:rows.length?rows.reduce((a,r)=>a+r.returnLegal,0)/rows.length:null};
  }
  const passZ=(sums.pass1.delta-expectedPass)/Math.sqrt(passVariance);
  if(Math.abs(passZ)>5||firstModelDifferences)throw Error('pass calibration or branch model');
  modes[mode]={means,ci95,strata:by,exactFirstPassDelta:expectedPass/N,passZ,firstModelDifferences,secondModelDifferences,returnModelDifferences};
 }
 for(let i=0;i<100;i++)if(JSON.stringify(shuffle(deck,ds+i))!==JSON.stringify(shuffle(deck,ds+i)))throw Error('replay');
 return {schema:'qosha-opening-actual-connector-paired/v1',timestampAsiaBaku:'2026-10-28T12:49:36+04:00',engine:'qosa-research-0.5.3 + actual-connector-paired-1.0',rules:'recovered qosa-1.0.0; confirmed first-round 1-1 draw, provisional branch model',dealSeeds:[ds,ds+dn-1],worldSeeds:[ws,ws+npos*wpp-1],deals:dn,valid,reshuffles,eligible,positions:npos,signBalance:{ownedHigher:npos/2,ownedLower:npos/2},worldsPerPosition:wpp,hiddenAllocations:npos*wpp,fullModelRounds:0,forcedContinuations:0,strategies:['legal 1-X connector with own X-X retained','legal 1-Y connector with Y-Y not held'],opponentPolicies:['highest/lowest pip deterministic legal','one tile or greedy optional consecutive doubles (max four)'],metrics:modes,tests:{canonical01:true,lock:true,multiDouble:true,noOrdinaryAppend:true,exact48k:exact,seedReplay:100,conservation:dn+npos*wpp,passCalibration:true},finding:'Actual legal opening choice paired on same hands/worlds; sign/gap strata necessary. No full-game win-rate or proven strategy.',confidence:'Deterministic paired hidden worlds, exact first-pass enumeration, position-cluster exploratory intervals.',limitations:['Different 1-X and 1-Y have unequal pip costs, and different branch geometry; cannot isolate double-retention effect.','First eligible position per seed until sign quotas fill; not random representative sample.','Late-arrival branch semantics, block ties, loneZero, bust and match scoring unverified.','No complete games, wins, minus frequencies or regret measured.','Opponent continuation policies are simple deterministic models, not real opponents.'],nextAction:'Audit earlier X=0 focal return mobility with corrected canonical tile key; authenticate late-arrival branch and block ties; only then test full-game winning regret on matched seeds.'};
}
if(typeof module!=='undefined')module.exports={study};
if(typeof require!=='undefined'&&require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?study(2432000,2000,2482000,8,20):study(+(a[0]||2432000),+(a[1]||50000),+(a[2]||2482000),+(a[3]||32),+(a[4]||500)),null,2));}