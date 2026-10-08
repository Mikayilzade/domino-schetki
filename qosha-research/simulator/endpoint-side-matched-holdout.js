'use strict';
// Reproduce: node qosha-research/simulator/endpoint-side-matched-holdout.js 32 25
// Observational, not causal. Each position's hidden worlds share identical candidate policies.
const e=require('./engine'),i=require('./initializer'),r=require('./round-driver');
const {chooseBy}=require('./strategy-runner'),base=require('./connector-gap-pressure');
const discovery=[['closed-branch-control',134000,136000],['min-hand-pips',136000,138000]];
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const metrics=['finish','pips','residualPips','minus'];
function stats(xs){const n=xs.length,m=xs.reduce((a,b)=>a+b,0)/n,
 sd=n>1?Math.sqrt(xs.reduce((a,b)=>a+(b-m)**2,0)/(n-1)):0,h=1.96*sd/Math.sqrt(n);
 return{n,mean:m,ci95NormalApprox:[m-h,m+h]};}
function hash(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return e.mixSeed32(h>>>0);}
function scan(policy,start,end){
 const rows=[];
 for(let seed=start;seed<end;seed++){
  let s=i.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;
  while(!s.outcome&&s.turns<100){
   const c=base.eligible(s);
   if(c){
    const focal=s.currentPlayer,hand=s.hands[focal].length,
      oppMin=Math.min(...s.hands.filter((h,j)=>j!==focal).map(h=>h.length)),
      hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
    rows.push({seed,focal,state:r.cloneRoundState(s),known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t))),
      choice:c,oppMin,hand,x:c.x,gap:c.high-c.low,pressure:oppMin<=3?'late':'early',endpoint:c.high>=5?'high':'low'});
    break;
   }
   s=r.stepRound(s,(o,st)=>chooseBy(policy,o,{seed,turns:st.turns,player:st.currentPlayer}));
  }
 }
 return rows;
}
function match(rows,limit){
 const groups={};
 for(const p of rows){
  const key=[p.x,p.gap,p.hand,p.pressure,p.choice.side].join(':'),g=groups[key]||(groups[key]={high:[],low:[]});
  g[p.endpoint].push(p);
 }
 const keys=Object.keys(groups).filter(k=>groups[k].high.length&&groups[k].low.length)
  .sort((a,b)=>hash(a)-hash(b)||a.localeCompare(b));
 const pairs=[];
 for(let index=0;pairs.length<limit;index++){
  let any=false;
  for(const key of keys){
   const g=groups[key];
   if(g.high[index]&&g.low[index]){
    any=true;pairs.push({key,high:g.high[index],low:g.low[index]});
    if(pairs.length===limit)break;
   }
  }
  if(!any)break;
 }
 if(pairs.length!==limit)throw Error('insufficient exact matches');
 for(const p of pairs){
  for(const k of ['x','gap','hand','pressure'])if(p.high[k]!==p.low[k])throw Error('mismatch '+k);
  if(p.high.choice.high<5||p.low.choice.high>=5||p.high.seed===p.low.seed||p.high.choice.side!==p.low.choice.side)throw Error('endpoint/seed mismatch');
 }
 return{pairs,available:keys.reduce((n,k)=>n+Math.min(groups[k].high.length,groups[k].low.length),0),strata:keys.length};
}
function run(limit=32,worlds=25){
 const output={schema:'qosa-endpoint-side-exact-match-holdout/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',
 engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
 newFullStrategyRounds:0,cumulativeFullStrategyRounds:180000,historicalFullRoundsSeparate:4000,
 priorFixedVisibleWorlds:45210,worldsPerPosition:worlds,discovery,policies,
 matchKeys:['exact branch X','exact gap','hand size','opponent pressure <=3 vs >=4','exact branch side'],
 comparison:'high-endpoint >=5 context minus low-endpoint <=4 context, on within-position keep-HIGH minus keep-LOW deltas',
 worldSeedFormula:'6100000+1000*dealSeed+worldIndex',
 confidence:'exploratory 95% normal CI across matched position PAIRS, no multiple testing adjustment',
 limitations:['assumption-labelled branch and multi-double rules','deterministic handcrafted bots','first-eligible selection',
 'other tiles and exact opponent hand-size vector not matched','observational not causal','block winner unassigned',
 'hidden worlds within position correlated','residualPips mechanically subtracts gap'],
 scans:{},summary:{},pairs:{},candidateContinuations:0,policyWorldEvaluations:0,newHiddenWorlds:0};
 for(const [discoveryPolicy,start,end] of discovery){
  const all=scan(discoveryPolicy,start,end),selected=match(all,limit);
  const pairs=selected.pairs;output.scans[discoveryPolicy]={seedRange:[start,end-1],eligiblePositions:all.length,
   availableMatchedPairs:selected.available,matchedStrata:selected.strata,selectedSeeds:pairs.map(p=>[p.high.seed,p.low.seed]),
   xCounts:Object.fromEntries([...new Set(pairs.map(p=>p.high.x))].sort((a,b)=>a-b).map(x=>[x,pairs.filter(p=>p.high.x===x).length]))};
  output.newHiddenWorlds+=2*limit*worlds;output.summary[discoveryPolicy]={};output.pairs[discoveryPolicy]={};
  for(const continuation of policies){
   const records=[];
   for(const pair of pairs){
    const a=base.analyze(pair.high,worlds,continuation),b=base.analyze(pair.low,worlds,continuation);
    records.push({stratum:pair.key,seedHigh:pair.high.seed,seedLow:pair.low.seed,
     x:pair.high.x,gap:pair.high.gap,hand:pair.high.hand,pressure:pair.high.pressure,
     endpointsHigh:[pair.high.choice.low,pair.high.choice.high],
     endpointsLow:[pair.low.choice.low,pair.low.choice.high],
     high:a.keepHighMinusLow,low:b.keepHighMinusLow,
     diff:Object.fromEntries(metrics.map(k=>[k,a.keepHighMinusLow[k]-b.keepHighMinusLow[k]])),
     continuations:a.continuations+b.continuations});
    output.candidateContinuations+=a.continuations+b.continuations;
    output.policyWorldEvaluations+=2*worlds;
   }
   output.pairs[discoveryPolicy][continuation]=records;
   output.summary[discoveryPolicy][continuation]=Object.fromEntries(metrics.map(k=>[k,{
    high:stats(records.map(x=>x.high[k])),low:stats(records.map(x=>x.low[k])),
    matchedDifference:stats(records.map(x=>x.diff[k]))}]));
  }
 }
 output.cumulativeFixedVisibleWorlds=output.priorFixedVisibleWorlds+output.newHiddenWorlds;
 output.finding='Exploratory side-matched endpoint comparison; interpret paired position confidence intervals and do not promote a universal rule without fresh replication.';
 output.nextHypothesis='Repeat on fresh seeds 138000..141999 matching the full two-opponent hand-size vector and branch side; examine counterconditions and independent policies.';
 return output;
}
function selfTest(){
 const selection=match(scan('min-hand-pips',132000,132250),2),p=selection.pairs[0].high;
 const before=JSON.stringify(p.state),a=base.analyze(p,2,'min-hand-pips'),b=base.analyze(p,2,'min-hand-pips');
 if(before!==JSON.stringify(p.state)||JSON.stringify(a)!==JSON.stringify(b))throw Error('replay or mutation');
 return{passed:true,matchedPairs:2,pairedWorlds:2};
}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?selfTest():run(Number(process.argv[2]||32),Number(process.argv[3]||25)),null,2));
module.exports={scan,match,run,selfTest};
