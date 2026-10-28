'use strict';
// Same connector opening; counterfactual X-X/Y-Y ownership swap is NOT a legal move.
const study=function study(ds=2366000,dn=50000,ws=2416000,wpp=32,npos=500){
 const deck=[];for(let a=0;a<7;a++)for(let b=a;b<7;b++)deck.push([a,b]);
 const k=t=>Math.min(t[0],t[1])+"-"+Math.max(t[0],t[1]),pip=t=>t[0]+t[1],other=t=>t[0]===1?t[1]:t[0];
 const rng=seed=>{let s=(seed>>>0)+0x9e3779b9;s=Math.imul(s^(s>>>16),0x21f0aaad);s=Math.imul(s^(s>>>15),0x735a2d97);s=(s^(s>>>15))>>>0||0x9e3779b9;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};};
 const shuf=(src,seed)=>{const a=src.slice(),r=rng(seed);for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const choose=(as,pol)=>as.slice().sort((a,b)=>(pol==="high"?pip(b.t)-pip(a.t):pip(a.t)-pip(b.t))||k(a.t).localeCompare(k(b.t))||a.side-b.side)[0];
 const initial=x=>({ends:[x,1,1,1],locks:[true,false,false,false],opened:[1]});
 function legal(b,h){const out=[];for(let i=0;i<h.length;i++)for(let side=0;side<4;side++){const t=h[i],v=b.ends[side],dbl=t[0]===t[1];if(dbl&&t[0]===v)out.push({i,side,t,dbl,to:v});else if(!dbl&&!b.locks[side]&&(t[0]===v||t[1]===v))out.push({i,side,t,dbl,to:t[0]===v?t[1]:t[0]});}return out;}
 function apply(b,a,global){const n={ends:b.ends.slice(),locks:b.locks.slice(),opened:b.opened.slice()};if(a.dbl){if(!n.opened.includes(a.to))n.opened.push(a.to);if(global){for(let s=0;s<4;s++)if(n.ends[s]===a.to)n.locks[s]=false;}else n.locks[a.side]=false;}else{n.ends[a.side]=a.to;n.locks[a.side]=!(global&&n.opened.includes(a.to));}return n;}
 function response(x,own,opp1,opp2,pol,chain,global){let b=initial(x),moves=0,extra=0,pass1=0,pass2=0;for(const [seat,hand0] of [opp1,opp2].entries()){const h=hand0.slice();let a=choose(legal(b,h),pol);if(!a){if(seat===0)pass1=1;else pass2=1;continue;}let played=0;while(a){b=apply(b,a,global);h.splice(a.i,1);moves++;extra+=+(played>0);played++;if(!chain||!a.dbl||played===4)break;a=choose(legal(b,h).filter(q=>q.dbl&&!b.opened.includes(q.to)),pol);}}return{moves,extra,pass1,pass2,returnLegal:new Set(legal(b,own).map(a=>a.i)).size};}
 const C=(n,m)=>{let a=1;for(let i=1;i<=m;i++)a=a*(n-i+1)/i;return Math.round(a);};
 if(legal(initial(3),[[0,3]]).length||!legal(initial(3),[[3,3]]).length)throw Error("lock fixture");
 if(response(2,[],[[1,3]],[[2,2],[3,3]],"high",true,true).moves!==3||response(2,[],[[1,3]],[[2,2],[3,3]],"high",false,true).moves!==2)throw Error("multi-double fixture");
 if(response(2,[],[[1,3],[2,2]],[],"low",true,true).moves!==1)throw Error("ordinary+double illegal");
 if(npos%2||dn<npos*4)throw Error("parameters");
 const groups=[[],[]];let valid=0,eligible=0,reshuffles=0;
 for(let seed=ds;seed<ds+dn;seed++){
  const d=shuf(deck,seed);if(new Set(d.map(k)).size!==28)throw Error("deck");
  if(k(d[27])==="1-1"){reshuffles++;continue;}valid++;
  const hands=[d.slice(0,9),d.slice(9,18),d.slice(18,27)],starter=hands.find(h=>h.some(t=>k(t)==="1-1"));
  const hand=starter.filter(t=>k(t)!=="1-1").concat([d[27]]),known=new Set(hand.map(k)),c=hand.filter(t=>t.includes(1)).length;
  if(hand.length!==9||known.size!==9)throw Error("opening");
  const candidates=[];for(const t of hand.filter(t=>t.includes(1))){const x=other(t);if(!known.has(x+"-"+x))continue;for(let y=0;y<=6;y++)if(y!==1&&y!==x&&!known.has(y+"-"+y))candidates.push({x,y,gap:Math.abs(x-y)});}
  if(!candidates.length)continue;eligible++;candidates.sort((a,b)=>a.gap-b.gap||a.x-b.x||a.y-b.y);
  for(const q of candidates){const g=groups[q.x>q.y?0:1];if(g.length>=npos/2)continue;const pool=deck.filter(t=>k(t)!=="1-1"&&!known.has(k(t)));if(pool.length!==18||!pool.some(t=>k(t)===q.y+"-"+q.y))throw Error("hidden");g.push({seed,hand,pool,c,...q});break;}
 }
 if(groups.some(g=>g.length!==npos/2))throw Error("sign balance");
 const positions=groups.flat().sort((a,b)=>a.seed-b.seed);
 const exact=[];for(const p of [positions[0],positions[positions.length-1]]){
  const picks=[];let total=0,r=0,s=0;
  function visit(start){if(picks.length===9){total++;const h=picks.map(i=>p.pool[i]),sw=h.map(t=>k(t)===p.y+"-"+p.y?[p.x,p.x]:t);r+=+(!legal(initial(p.x),h).length);s+=+(!legal(initial(p.x),sw).length);return;}for(let i=start;i<=18-(9-picks.length);i++){picks.push(i);visit(i+1);picks.pop();}}
  visit(0);if(total!==48620||r!==C(18-(6-p.c),9)||s!==C(18-(7-p.c),9))throw Error("exact posterior");exact.push({seed:p.seed,partitions:total,retainPass:r,swapPass:s});
 }
 const fields=["moves","extra","pass1","pass2","returnLegal"],modes={};
 for(const mode of ["high-single","high-chain","low-single","low-chain"]){
  const pol=mode.startsWith("high")?"high":"low",chain=mode.endsWith("chain"),sums={},perPos=[],strata={xGreaterY:[],xLessY:[]};for(const f of fields)sums[f]={retain:0,swap:0,delta:0};
  let nestedViolations=0,firstBranchDisagreements=0,secondBranchDisagreements=0,returnBranchDisagreements=0,expectedRetain=0,expectedSwap=0,variance=0;
  for(let i=0;i<positions.length;i++){
   const p=positions[i],own=p.hand.filter(t=>k(t)!==k([1,p.x])),swapOwn=own.map(t=>k(t)===p.x+"-"+p.x?[p.y,p.y]:t),row={};for(const f of fields)row[f]=0;
   if(own.length!==8||swapOwn.length!==8)throw Error("focal connector removal");
   const pr=C(18-(6-p.c),9)/48620,ps=C(18-(7-p.c),9)/48620;expectedRetain+=pr*wpp;expectedSwap+=ps*wpp;variance+=(pr-ps)*(1-pr+ps)*wpp;
   for(let j=0;j<wpp;j++){
    const h=shuf(p.pool,ws+i*wpp+j),v=h.map(t=>k(t)===p.y+"-"+p.y?[p.x,p.x]:t);
    if(new Set(p.hand.concat(h,[[1,1]]).map(k)).size!==28||new Set(swapOwn.concat([[1,p.x]],v,[[1,1]]).map(k)).size!==28)throw Error("swap conservation");
    const a=response(p.x,own,h.slice(0,9),h.slice(9),pol,chain,true),b=response(p.x,swapOwn,v.slice(0,9),v.slice(9),pol,chain,true);
    const al=response(p.x,own,h.slice(0,9),h.slice(9),pol,chain,false),bl=response(p.x,swapOwn,v.slice(0,9),v.slice(9),pol,chain,false);
    nestedViolations+=+(a.pass1<b.pass1);firstBranchDisagreements+=+(a.pass1!==al.pass1||b.pass1!==bl.pass1);
    secondBranchDisagreements+=+(a.pass2!==al.pass2||b.pass2!==bl.pass2);
    returnBranchDisagreements+=+(a.returnLegal!==al.returnLegal||b.returnLegal!==bl.returnLegal);
    for(const f of fields){sums[f].retain+=a[f];sums[f].swap+=b[f];sums[f].delta+=a[f]-b[f];row[f]+=(a[f]-b[f])/wpp;}
   }
   perPos.push(row);strata[p.x>p.y?"xGreaterY":"xLessY"].push(row);
  }
  if(nestedViolations||firstBranchDisagreements)throw Error("first pass nestedness");
  const N=npos*wpp,means={},ci95={};for(const f of fields){const delta=sums[f].delta/N,sd=Math.sqrt(perPos.reduce((a,q)=>a+(q[f]-delta)**2,0)/(npos-1)/npos);means[f]={retain:sums[f].retain/N,swap:sums[f].swap/N,delta};ci95[f]=[delta-1.96*sd,delta+1.96*sd];}
  const zDelta=(sums.pass1.delta-(expectedRetain-expectedSwap))/Math.sqrt(variance);if(Math.abs(zDelta)>5)throw Error("pass calibration");
  const sub={};for(const [name,rows] of Object.entries(strata))sub[name]={positions:rows.length,movesDelta:rows.reduce((a,q)=>a+q.moves,0)/rows.length,passDelta:rows.reduce((a,q)=>a+q.pass1,0)/rows.length};
  modes[mode]={means,ci95,bySign:sub,exactPassDelta:(expectedRetain-expectedSwap)/N,zDelta,secondBranchDisagreements,returnBranchDisagreements};
 }
 for(let i=0;i<100;i++)if(JSON.stringify(shuf(deck,ds+i))!==JSON.stringify(shuf(deck,ds+i)))throw Error("replay");
 return{schema:"qosha-opening-fixed-connector-ownership/v1",timestampAsiaBaku:"2026-10-28T11:45:35+04:00",engine:"qosa-research-0.5.3 + fixed-connector-ownership-1.0",rules:"recovered qosa-1.0.0 3x9; first-round 1-1 draw; two provisional branch models",dealSeeds:[ds,ds+dn-1],worldSeeds:[ws,ws+npos*wpp-1],deals:dn,valid,reshuffles,eligible,positions:npos,signBalance:{xGreaterY:npos/2,xLessY:npos/2},worldsPerPosition:wpp,hiddenAllocations:npos*wpp,fullModelRounds:0,forcedContinuations:0,comparison:"Same 1-X connector played in both arms (same pip cost and geometry); synthetic swap focal X-X with unseen Y-Y, putting X-X into opponent hidden pool. NOT a legal move; hand pip totals change.",strategies:["focal owns X-X after 1-X","hypothetical focal Y-Y and opponent X-X after same 1-X"],opponentPolicies:["highest/lowest-pip first legal; deterministic ties","one tile or optional consecutive greedy doubles up to four"],metrics:modes,tests:{lock:true,doubleChain:true,noOrdinaryAppend:true,exact48k:exact,seedReplay:100,conservation:dn+npos*wpp,firstPassNestedness:true,passCalibration:true},finding:"Fixed connector and equal opening pips isolate synthetic X-X ownership; NOT a legal retention choice or a proven win advantage.",confidence:"Paired deterministic hidden worlds; two exact 48,620-way checks; exploratory position-cluster intervals.",limitations:["No full rounds, wins, blocks, minus or 101 scoring","Synthetic double ownership swap changes hand pip totals and is not a legal action","First 250 eligible per pip-difference sign, not random sample","Authentic branch locking, blocked ties, loneZero and bust unresolved","Prior opening-two-opponent-chain.js used noncanonical 1-0 removal for X=0 in focal return-mobility only; its opponent-move metrics do not use focal hand and are unaffected; return-mobility metrics for X=0 require audit."],nextAction:"Compare actual legal 1-X vs 1-Y choices by matched worlds and pip-gap strata; audit prior X=0 focal return-mobility; validate branch and blocked tie rules."};
};
if(typeof require!=='undefined'&&require.main===module){const a=process.argv.slice(2);const r=a[0]==='test'?study(2366000,2000,2416000,8,20):study(+(a[0]||2366000),+(a[1]||50000),+(a[2]||2416000),+(a[3]||32),+(a[4]||500));console.log(JSON.stringify(r,null,2));}
if(typeof module!=='undefined')module.exports={study};
