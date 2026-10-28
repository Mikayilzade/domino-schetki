'use strict';
// Reproducible first-round 3x9 two-opponent response window. Node 22, no dependencies.
// Does not establish full-game win rates or authenticate late-arrival branch semantics.
const run=function run(dealStart=2300000,dealCount=50000,worldStart=2350000,worldsPerPosition=32,positionLimit=500){
 const deck=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)deck.push([a,b]);
 const key=t=>t[0]+"-"+t[1],other=t=>t[0]===1?t[1]:t[0],pips=t=>t[0]+t[1];
 const C=(n,k)=>{if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x=x*(n-i+1)/i;return Math.round(x);};
 const randGen=seed=>{let z=(seed>>>0)+0x9e3779b9;z=Math.imul(z^(z>>>16),0x21f0aaad);z=Math.imul(z^(z>>>15),0x735a2d97);z=(z^(z>>>15))>>>0||0x9e3779b9;return()=>{z^=z<<13;z^=z>>>17;z^=z<<5;return(z>>>0)/4294967296;};};
 const shuffle=(arr,seed)=>{const a=arr.slice(),r=randGen(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const deal=seed=>{const a=shuffle(deck,seed);return{hands:[a.slice(0,9),a.slice(9,18),a.slice(18,27)],stock:a[27]};};
 const init=x=>({ends:[x,1,1,1],locks:[true,false,false,false],opened:[1]});
 function actions(b,hand){
  const a=[];for(let i=0;i<hand.length;i++){const t=hand[i],dbl=t[0]===t[1];
   for(let s=0;s<4;s++){const end=b.ends[s];if(dbl){if(t[0]===end)a.push({i,s,to:end,double:true,t});}
    else if(!b.locks[s]&&(t[0]===end||t[1]===end))a.push({i,s,to:t[0]===end?t[1]:t[0],double:false,t});}}
  return a;
 }
 function apply(b,a,global){
  const n={ends:b.ends.slice(),locks:b.locks.slice(),opened:b.opened.slice()};
  if(a.double){n.locks[a.s]=false;if(!n.opened.includes(a.to))n.opened.push(a.to);}
  else{n.ends[a.s]=a.to;n.locks[a.s]=!(global&&n.opened.includes(a.to));}
  return n;
 }
 function choose(acts,policy){
  if(!acts.length)return null;
  return acts.slice().sort((x,y)=>{const diff=pips(x.t)-pips(y.t);return(policy==="high"?-diff:diff)||key(x.t).localeCompare(key(y.t))||x.s-y.s;})[0];
 }
 function window(x,focal,opp1,opp2,policy,global,multi){
  let b=init(x),played=0,firstPass=0,secondPass=0,oppPips=0,oppDouble=0,extraDouble=0;
  const h=[opp1.slice(),opp2.slice()];
  for(let seat=0;seat<2;seat++){
   let a=choose(actions(b,h[seat]),policy);
   if(!a){if(seat===0)firstPass=1;else secondPass=1;continue;}
   let count=0;
   while(a){
    b=apply(b,a,global);h[seat].splice(a.i,1);
    played++;oppPips+=pips(a.t);oppDouble+=+a.double;
    if(count>0)extraDouble++;
    count++;
    if(!multi||!a.double||count>=4)break;
    // Optional multi-double continuation: never append a double to an ordinary move.
    a=choose(actions(b,h[seat]).filter(q=>q.double&&!b.opened.includes(q.t[0])),policy);
   }
  }
  return{firstPass,secondPass,bothPass:firstPass&&secondPass?1:0,oppMoves:played,oppPips,oppDouble,extraDouble,returnLegal:new Set(actions(b,focal).map(a=>a.i)).size,remainingOneEnds:b.ends.filter((n,i)=>n===1&&!b.locks[i]).length};
 }
 function testGeometry(){
  let b=init(2);let a=actions(b,[[0,2],[2,2],[1,5]]);
  if(a.some(x=>key(x.t)==="0-2")||!a.some(x=>key(x.t)==="2-2")||!a.some(x=>key(x.t)==="1-5"))throw Error("initial locked branch legal mismatch");
  b=apply(b,a.find(x=>key(x.t)==="2-2"),false);
  if(b.locks[0]||!b.opened.includes(2)||!actions(b,[[0,2]]).length)throw Error("double unlock mismatch");
  let g=init(2),p=actions(g,[[1,3]]).find(a=>a.s===1);g=apply(g,p,false);
  if(!g.locks[1]||g.ends[1]!==3||actions(g,[[3,6]]).length)throw Error("new side lock mismatch");
  const g2=apply(init(2),actions(init(2),[[2,2]])[0],true),arriving=actions(g2,[[1,2]]).find(a=>a.s===1);
  if(!arriving||apply(g2,arriving,true).locks[1]||!apply(g2,arriving,false).locks[1])throw Error("branch model distinction mismatch");
 }
 testGeometry();
 function testChain(){
  let b=init(2);
  b=apply(b,actions(b,[[1,3]]).find(q=>q.s===1),true);
  const h=[[2,2],[3,3]];let n=0;
  while(n<4){
   const a=choose(actions(b,h).filter(q=>q.double&&!b.opened.includes(q.t[0])),"high");
   if(!a)break;
   b=apply(b,a,true);h.splice(a.i,1);n++;
  }
  if(n!==2||h.length||b.locks[0]||b.locks[1]||!b.opened.includes(2)||!b.opened.includes(3))throw Error("optional two-double chain fixture");
  const chain=window(2,[],[[1,3]],[[2,2],[3,3]],"high",true,true);
  const single=window(2,[],[[1,3]],[[2,2],[3,3]],"high",true,false);
  if(chain.oppMoves!==3||chain.extraDouble!==1||single.oppMoves!==2)throw Error("chain versus single turn");
  const noOrdinaryAppend=window(2,[],[[1,3],[2,2]],[],"low",true,true);
  if(noOrdinaryAppend.oppMoves!==1||noOrdinaryAppend.extraDouble!==0)throw Error("ordinary+double illegally chained");
 }
 testChain();
 if(!Number.isInteger(dealCount)||dealCount<positionLimit*2||!Number.isInteger(worldsPerPosition)||worldsPerPosition<1)throw Error("invalid sample size");
 const positions=[];let reshuffles=0,valid=0,paired=0,forcedPass=0;
 for(let seed=dealStart;seed<dealStart+dealCount;seed++){
  const d=deal(seed);
  if(new Set(d.hands.flat().concat([d.stock]).map(key)).size!==28)throw Error("28-tile conservation");
  if(key(d.stock)==="1-1"){reshuffles++;continue;}
  const starter=d.hands.find(h=>h.some(t=>key(t)==="1-1"));if(!starter)throw Error("starter missing");
  const hand=starter.filter(t=>key(t)!=="1-1").concat([d.stock]),ks=new Set(hand.map(key));
  if(hand.length!==9||ks.size!==9)throw Error("starter hand conservation");
  valid++;
  const con=hand.filter(t=>t[0]===1||t[1]===1);if(!con.length){forcedPass++;continue;}
  const own=con.map(other).filter(x=>ks.has(x+"-"+x)).sort((a,b)=>a-b),unowned=con.map(other).filter(x=>!ks.has(x+"-"+x)).sort((a,b)=>a-b);
  if(!own.length||!unowned.length)continue;
  paired++;
  if(positions.length<positionLimit){
   const pool=deck.filter(t=>key(t)!=="1-1"&&!ks.has(key(t)));
   if(pool.length!==18)throw Error("hidden pool");
   positions.push({seed,c:con.length,own:own[0],unowned:unowned[0],hand,pool});
  }
 }
 if(positions.length!==positionLimit)throw Error("insufficient paired hands");
 const exactChecks=[];
 for(const pos of positions.slice(0,4)){
  let n=0,passOwn=0,passUnowned=0;const pick=[];
  function visit(start){
   if(pick.length===9){n++;const h=pick.map(i=>pos.pool[i]);passOwn+=+(!actions(init(pos.own),h).length);passUnowned+=+(!actions(init(pos.unowned),h).length);return;}
   for(let i=start;i<=18-(9-pick.length);i++){pick.push(i);visit(i+1);pick.pop();}
  }
  visit(0);
  if(n!==48620||passOwn!==C(18-(6-pos.c),9)||passUnowned!==C(18-(7-pos.c),9))throw Error("brute pass check mismatch");
  exactChecks.push({seed:pos.seed,partitions:n,passOwn,passUnowned});
 }
 for(let i=0;i<100;i++)if(JSON.stringify(deal(dealStart+i))!==JSON.stringify(deal(dealStart+i))||JSON.stringify(shuffle(deck,worldStart+i))!==JSON.stringify(shuffle(deck,worldStart+i)))throw Error("seed replay");
 const metrics=["firstPass","secondPass","bothPass","oppMoves","oppPips","oppDouble","extraDouble","returnLegal","remainingOneEnds"],result={};
 for(const policy of ["high-single","high-chain","low-single","low-chain"]){
  const p=policy.startsWith("high")?"high":"low",multi=policy.endsWith("chain");
  const sums={own:{},unowned:{},delta:{}};
  for(const m of metrics){sums.own[m]=0;sums.unowned[m]=0;sums.delta[m]=0;}
  const posDeltas=[];let modelDisagreements=0,modelAbsReturnDelta=0,nonNested=0;
  for(let pi=0;pi<positions.length;pi++){
   const pos=positions[pi],local={};for(const m of metrics)local[m]=0;
   for(let j=0;j<worldsPerPosition;j++){
    const seed=worldStart+pi*worldsPerPosition+j,unknown=shuffle(pos.pool,seed),h1=unknown.slice(0,9),h2=unknown.slice(9);
    if(new Set(h1.concat(h2).map(key)).size!==18)throw Error("hidden conservation");
    const ownHand=pos.hand.filter(t=>key(t)!=="1-"+pos.own),unHand=pos.hand.filter(t=>key(t)!=="1-"+pos.unowned);
    const own=window(pos.own,ownHand,h1,h2,p,true,multi),un=window(pos.unowned,unHand,h1,h2,p,true,multi);
    const ownSide=window(pos.own,ownHand,h1,h2,p,false,multi),unSide=window(pos.unowned,unHand,h1,h2,p,false,multi);
    if(own.firstPass<un.firstPass)nonNested++;
    if(own.firstPass!==ownSide.firstPass||un.firstPass!==unSide.firstPass||own.oppMoves!==ownSide.oppMoves||un.oppMoves!==unSide.oppMoves)throw Error("two opponent turns unexpectedly branch sensitive");
    const diff=Math.abs(own.returnLegal-ownSide.returnLegal)+Math.abs(un.returnLegal-unSide.returnLegal);
    modelDisagreements+=+(diff>0);modelAbsReturnDelta+=diff;
    for(const m of metrics){sums.own[m]+=own[m];sums.unowned[m]+=un[m];const d=own[m]-un[m];sums.delta[m]+=d;local[m]+=d;}
   }
   for(const m of metrics)local[m]/=worldsPerPosition;
   posDeltas.push({...local,c:pos.c,pipDiff:pos.own-pos.unowned});
  }
  const n=positions.length*worldsPerPosition,means={},ci95={};
  for(const m of metrics){
   means[m]={own:sums.own[m]/n,unowned:sums.unowned[m]/n,delta:sums.delta[m]/n};
   const avg=means[m].delta,v=posDeltas.reduce((acc,p)=>acc+(p[m]-avg)**2,0)/(positions.length-1);
   ci95[m]=[avg-1.96*Math.sqrt(v/positions.length),avg+1.96*Math.sqrt(v/positions.length)];
  }
  if(nonNested)throw Error("owned next-pass nestedness violated");
  const strata={};
  const groupDefs={connectors2:q=>q.c===2,connectors3:q=>q.c===3,connectors4plus:q=>q.c>=4,ownedLowerPip:q=>q.pipDiff<0,ownedHigherPip:q=>q.pipDiff>0};
  for(const [name,predicate] of Object.entries(groupDefs)){
   const rows=posDeltas.filter(predicate);
   strata[name]={positions:rows.length,oppMovesDelta:rows.length?rows.reduce((a,q)=>a+q.oppMoves,0)/rows.length:null,returnLegalDelta:rows.length?rows.reduce((a,q)=>a+q.returnLegal,0)/rows.length:null,firstPassDelta:rows.length?rows.reduce((a,q)=>a+q.firstPass,0)/rows.length:null};
  }
  result[policy]={means,pairedClusterCI95:ci95,strata,branchReturnModelDisagreementWorlds:modelDisagreements,branchReturnAbsLegalTileDifference:modelAbsReturnDelta/n,nonNested};
 }
 const n=positions.length*worldsPerPosition;
 return{schema:"qosha-opening-two-opponent-chain/v1",timestampAsiaBaku:"2026-10-28T10:57:39.752+04:00",engine:"qosa-research-0.5.3 deal kernel + opening-two-opponent-chain-1.0",rules:"recovered qosa-1.0.0, first-round 3x9 opening; 1-X starts locked X branch, X-X unlocks; two opponent turns, optional consecutive double series (max four)",dealSeeds:[dealStart,dealStart+dealCount-1],worldSeeds:[worldStart,worldStart+n-1],deals:dealCount,valid,reshuffles,forcedPass,paired,positions:positions.length,worldsPerPosition,hiddenAllocations:n,fullModelRounds:0,forcedFullContinuations:0,strategies:["owned X-X: lowest X candidate 1-X","unowned Y-Y: lowest Y candidate 1-Y"],opponentPolicies:["high/low-pip first legal action with deterministic tie break","single: one stone per opponent turn","chain: after choosing a double, greedily add any legal unopened doubles, max four stones"],metrics:result,tests:{geometry:true,multiDoubleFixture:true,independentExactBrute:exactChecks,deterministicReplays:100,dealConservation:dealCount,hiddenConservation:n,branchModels:"global-ever-open and side-local, both provisional"},limitations:["Not full-game win or minus statistics; blocked winner/ties unresolved","Greedy optional multi-double chain is a policy assumption, not exhaustive optimal action enumeration","Uniform unknown allocations conditional on focal starter hand; no observed opponent behavior or historical pass evidence","1000 first eligible paired hands, 40 worlds each; position-cluster confidence intervals descriptive","Late-arrival branch rule affects return mobility, so global vs side-local not pooled there"],nextAction:"Audit optional double-chain legality against authentic traces; compare balanced equal-pip controls and later-turn finish rates after validating branch and block rules."};
};
if(typeof require!=='undefined'&&require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?run(2300000,3000,2350000,8,30):run(+(a[0]||2300000),+(a[1]||50000),+(a[2]||2350000),+(a[3]||32),+(a[4]||500)),null,2));}
if(typeof module!=='undefined')module.exports={run};
