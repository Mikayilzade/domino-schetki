'use strict';
// Stratified X-X vs connector holdout, 3x9, next clockwise opponent <=2.
// node qosha-research/simulator/late-double-number-control-runner.js 74000 76000 50 50
const e=require('./engine'),init=require('./initializer'),r=require('./round-driver');
const {chooseBy}=require('./strategy-runner'),late=require('./late-double-threat-runner');
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function stats(a){if(!a.length)return null;const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0,h=1.96*sd/Math.sqrt(a.length);return{n:a.length,mean:m,exploratoryCI95:[m-h,m+h],positive:a.filter(x=>x>0).length,negative:a.filter(x=>x<0).length,zero:a.filter(x=>x===0).length};}
function collect(start=74000,end=76000,limit=50,discovery='closed-branch-control'){
 const buckets={zero:[],nonzero:[]};let scanned=0;
 for(let seed=start;seed<end&&(buckets.zero.length<limit||buckets.nonzero.length<limit);seed++){
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});if(s.kind!=='ready')continue;scanned++;
  while(!s.outcome&&s.turns<100){
   const next=(s.currentPlayer+1)%3,gs=s.hands[next].length<=2?late.strict(s):[];
   if(gs.length){const g=gs[0],label=g.x===0?'zero':'nonzero';
    if(buckets[label].length<limit){const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
     buckets[label].push({seed,turn:s.turns,focal:s.currentPlayer,next,state:r.cloneRoundState(s),known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t))),group:g});}
    break;
   }
   s=r.stepRound(s,(o,st)=>chooseBy(discovery,o,{seed,turns:st.turns,player:st.currentPlayer}));
  }
 }
 return{buckets,scanned};
}
function run({start=74000,end=76000,limit=50,worlds=50,discovery='closed-branch-control'}={}){
 const {buckets,scanned}=collect(start,end,limit,discovery),rows={};
 for(const [k,ps] of Object.entries(buckets))rows[k]=ps.map(p=>late.analyze(p,worlds));
 const summary={};
 for(const [k,rs] of Object.entries(rows)){
  summary[k]={n:rs.length,targets:rs.reduce((o,x)=>(o[x.x]=(o[x.x]||0)+1,o),{}),
   nextCounts:rs.reduce((o,x)=>(o[x.handSizes[x.next]]=(o[x.handSizes[x.next]]||0)+1,o),{}),
   immediateThreat:Object.fromEntries(['finish','minus10','anyMinus'].map(m=>[m,stats(rs.map(x=>x.immediateOpenMinusKeep[m]))]))};
  for(const policy of policies)summary[k][policy]=Object.fromEntries(['finish','pips','minus'].map(m=>[m,stats(rs.map(x=>x.preserveMinusOpen[policy][m]))]));
 }
 const all=Object.values(rows).flat();
 return{schema:'qosa-late-double-number-stratified/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  start,end,limit,worlds,discovery,policies,scannedDeals:scanned,positions:all.length,hiddenAllocations:all.length*worlds,
  candidateContinuations:all.reduce((s,x)=>s+x.continuations,0),worldSeedFormula:'14000000+1000*dealSeed+worldIndex',
  selection:'first eligible strict position per deal; next opponent <=2; X=0 versus X>0 quotas (not prevalence weighted)',summary,rows};
}
function selfTest(){const c=collect(74000,74120,2);if(c.buckets.zero.length!==2||c.buckets.nonzero.length!==2)throw Error('missing strata');
 for(const [k,ps] of Object.entries(c.buckets))for(const p of ps)if((p.group.x===0)!==(k==='zero')||p.next!==(p.focal+1)%3)throw Error('bad stratum');
 const a=late.analyze(c.buckets.nonzero[0],2),b=late.analyze(c.buckets.nonzero[0],2);
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('nondeterministic');return{passed:true};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?selfTest():run({start:+(a[0]||74000),end:+(a[1]||76000),limit:+(a[2]||50),worlds:+(a[3]||50)}),null,2));}
module.exports={collect,run,selfTest};
