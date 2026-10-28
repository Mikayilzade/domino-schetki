'use strict';
// Exact first-round pass-only decision regret, independent of late-arrival branch rules.
const study=function study(ds=2498000,dn=100000,ws=2598000,wpp=40,npos=500){
 const deck=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)deck.push([a,b]);
 const key=t=>Math.min(...t)+'-'+Math.max(...t);
 const rng=seed=>{let s=(seed>>>0)+0x9e3779b9;s=Math.imul(s^(s>>>16),0x21f0aaad);s=Math.imul(s^(s>>>15),0x735a2d97);s=(s^(s>>>15))>>>0||0x9e3779b9;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};};
 const shuffle=(src,seed)=>{const a=src.slice(),r=rng(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const C=(n,k)=>{if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x=x*(n-i+1)/i;return Math.round(x);};
 const denom=C(18,9),sum=(a)=>a.reduce((x,y)=>x+y,0);
 if(dn<1000||npos<2||wpp<1||ds+dn>ws||npos*wpp>500000)throw Error('invalid parameters or overlapping seeds');
 let reshuffle=0,valid=0,forcedPass=0,multiChoice=0,mixedOwnership=0,strictRegret=0,strictMorePips=0;
 let sumBase=0,sumBest=0,sumRegret=0,sumExtraPips=0,regretAmongStrict=0,exactChecks=[];
 const byConnectors={},byGap={},bySign={};
 const selected=[];
 for(let seed=ds;seed<ds+dn;seed++){
  const d=shuffle(deck,seed);if(new Set(d.map(key)).size!==28)throw Error('deal duplicates');
  if(key(d[27])==='1-1'){reshuffle++;continue;}valid++;
  const h=[d.slice(0,9),d.slice(9,18),d.slice(18,27)].find(h=>h.some(t=>key(t)==='1-1'));
  if(!h)throw Error('missing starter');
  const hand=h.filter(t=>key(t)!=='1-1').concat([d[27]]),known=new Set(hand.map(key));
  if(hand.length!==9||known.size!==9)throw Error('starter conservation');
  const xs=hand.filter(t=>t.includes(1)).map(t=>t[0]===1?t[1]:t[0]).sort((a,b)=>a-b),c=xs.length;
  if(!c){forcedPass++;continue;}
  const options=xs.map(x=>{const owned=known.has(x+'-'+x),k=6-c+(owned?0:1);return{x,owned,k,p:C(18-k,9)/denom};});
  const base=options[0],best=options.slice().sort((a,b)=>b.p-a.p||a.x-b.x)[0],gain=best.p-base.p,extra=best.x-base.x;
  const own=options.filter(o=>o.owned),unowned=options.filter(o=>!o.owned);
  if(c>1)multiChoice++;
  if(own.length&&unowned.length)mixedOwnership++;
  if(gain>1e-12){strictRegret++;regretAmongStrict+=gain;if(extra>0)strictMorePips++;}
  sumBase+=base.p;sumBest+=best.p;sumRegret+=gain;sumExtraPips+=extra;
  const agg=(obj,k)=>obj[k]||(obj[k]={n:0,strict:0,regret:0,extraPips:0});
  for(const [o,k] of [[byConnectors,String(c)],[byGap,String(Math.abs(extra))],[bySign,extra>0?'best-higher-pip':extra<0?'best-lower-pip':'same-choice']]){
   const g=agg(o,k);g.n++;g.strict+=+(gain>1e-12);g.regret+=gain;g.extraPips+=extra;
  }
  if(gain>1e-12&&selected.length<npos){
   const pool=deck.filter(t=>key(t)!=='1-1'&&!known.has(key(t)));
   if(pool.length!==18||!best.owned||base.owned)throw Error('strict choice consistency');
   selected.push({seed,hand,pool,c,base,best});
  }
 }
 if(selected.length!==npos)throw Error('insufficient strict-regret positions');
 function firstPass(hand,x){return !hand.some(t=>t.includes(1)||(t[0]===x&&t[1]===x));}
 for(const pos of [selected[0],selected[1],selected[npos-1]]){
  const picked=[];let n=0,basePass=0,bestPass=0;
  function visit(start){if(picked.length===9){const h=picked.map(i=>pos.pool[i]);n++;basePass+=+firstPass(h,pos.base.x);bestPass+=+firstPass(h,pos.best.x);return;}for(let i=start;i<=18-(9-picked.length);i++){picked.push(i);visit(i+1);picked.pop();}}
  visit(0);
  if(n!==denom||basePass!==C(18-pos.base.k,9)||bestPass!==C(18-pos.best.k,9))throw Error('independent exact brute mismatch');
  exactChecks.push({seed:pos.seed,partitions:n,basePass,bestPass});
 }
 let observed=0,expected=0,variance=0,nonnested=0,basePass=0,bestPass=0;
 const positionStrata={};
 for(let i=0;i<npos;i++){
  const p=selected[i],pr=p.best.p-p.base.p;
  const g=positionStrata[p.c]||(positionStrata[p.c]={positions:0,observed:0,expected:0});
  g.positions++;g.expected+=wpp*pr;
  expected+=wpp*pr;variance+=wpp*pr*(1-pr);
  for(let j=0;j<wpp;j++){
   const h=shuffle(p.pool,ws+i*wpp+j).slice(0,9);
   const a=+firstPass(h,p.base.x),b=+firstPass(h,p.best.x);
   if(a>b)nonnested++;
   observed+=b-a;basePass+=a;bestPass+=b;g.observed+=b-a;
  }
 }
 const z=(observed-expected)/Math.sqrt(variance);
 if(nonnested||Math.abs(z)>5)throw Error('nested pass or calibration mismatch: '+z);
 for(let i=0;i<100;i++)if(JSON.stringify(shuffle(deck,ds+i))!==JSON.stringify(shuffle(deck,ds+i)))throw Error('seed replay');
 const normalize=obj=>Object.fromEntries(Object.entries(obj).map(([k,v])=>[k,{...v,meanRegret:v.regret/v.n,meanExtraPips:v.extraPips/v.n}]));
 return {schema:'qosha-opening-first-pass-exact-regret/v1',timestampAsiaBaku:'2026-10-28T13:47:15+04:00',
 engine:'qosa-research-0.5.3 + opening-first-pass-exact-regret-1.0',rules:'recovered qosa-1.0.0 confirmed first-round 3x9 opening only; no late-arrival assumption',
 dealSeeds:[ds,ds+dn-1],worldSeeds:[ws,ws+npos*wpp-1],deals:dn,valid,reshuffle,forcedPass,
 playable:valid-forcedPass,multiChoice,mixedOwnership,strictRegret,strictMorePips,
 strategies:['min-pip first legal 1-X','maximize exact first-opponent forced-pass probability, then min-pip'],
 exactFormula:'P(pass | c connectors, chosen X) = C(18-[6-c+I(X-X not in focal hand)],9) / C(18,9); first opponent has nine of 18 unknown stones',
 exactMeans:{minPipPass:sumBase/(valid-forcedPass),maxPass:sumBest/(valid-forcedPass),gain:sumRegret/(valid-forcedPass),gainStrict:regretAmongStrict/strictRegret,extraPips:sumExtraPips/(valid-forcedPass)},
 byConnectors:normalize(byConnectors),byPipGap:normalize(byGap),bySign:normalize(bySign),
 sample:{positions:npos,worldsPerPosition:wpp,hiddenAllocations:npos*wpp,basePass,bestPass,observedImprovement:observed,expectedImprovement:expected,z,nonNestedViolations:nonnested,byConnectors:positionStrata},
 tests:{deck28:dn,exact48620:exactChecks,seedReplay:100,calibrationZ:z,nested:true},
 fullModelRounds:0,forcedFullContinuations:0,
 finding:'Exact first-opponent pass advantage for own X-X connector is structural: it removes X-X from unknown opponent tiles. All owned-double connector choices tie on this single objective at fixed c. This is not a full-game strategy or proof that retaining X-X wins.',
 limitations:['Only first clockwise opponent forced pass, not second turn or full game.','Uniform hidden distribution conditional on known starter hand, not behavioral opponent posterior.','Optimizing forced pass can require playing a higher-pip connector, so win/score regret is unmeasured.','Late-arrival branch unlocking, block tie, loneZero/bust, 101 scoring remain unvalidated.','First 500 strict-regret positions sampled for Monte Carlo; exact all-deal means use all playable seeded hands.'],
 nextAction:'On disjoint seeds, compare equal ownership connector choices (same first-pass probability) on two-turn tempo and future mobility; seek authentic late-arrival and block-tie trace before full-game ranking.'};
};
if(typeof module!=='undefined')module.exports={study};
if(typeof require!=='undefined'&&require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?study(2498000,5000,2598000,8,20):study(+(a[0]||2498000),+(a[1]||100000),+(a[2]||2598000),+(a[3]||40),+(a[4]||500)),null,2));}
