'use strict';
// Pre-stratified, independent double-vs-connector holdout. No official block winner.
// Reproduce: node qosha-research/simulator/double-connector-hand-strata.js 606000 826000 6 30
const e=require('./engine'),r=require('./round-driver'),init=require('./initializer');
const {chooseBy}=require('./strategy-runner'),base=require('./double-connector-urgency-holdout');
const GROUPS=['urgent','near'],HANDS=[3,4,5],TARGETS=[0,2,4],POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function ci(a){if(!a.length)return null;const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0,h=1.96*sd/Math.sqrt(a.length);return {n:a.length,mean:m,ci95PositionNormalApprox:[m-h,m+h]};}
const key=(group,hand,x)=>group+'/hand'+hand+'/X'+x;
function collect(start,end,quota){
 const buckets=Object.fromEntries(GROUPS.flatMap(g=>HANDS.flatMap(h=>TARGETS.map(x=>[key(g,h,x),[]]))));
 let scanned=0,eligibleCount=0;
 for(let seed=start;seed<end;seed++){
  if(seed%17!==0)continue;scanned++;
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;
  while(!s.outcome&&s.turns<100){
   const candidates=base.eligible(s);
   if(candidates.length){
    eligibleCount++;
    // Fixed priority for rare high doubles; one first-eligible state per seed.
    const c=candidates.slice().sort((a,b)=>b.x-a.x).find(c=>{
     const g=c.minOpp<=2?'urgent':'near';return buckets[key(g,c.handSize,c.x)].length<quota;
    });
    if(c){
     const g=c.minOpp<=2?'urgent':'near',hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
     buckets[key(g,c.handSize,c.x)].push({seed,group:g,focal:s.currentPlayer,state:r.cloneRoundState(s),known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t))),choice:c});
    }
    break;
   }
   s=r.stepRound(s,(opts,st)=>chooseBy('closed-branch-control',opts,{seed,turns:st.turns,player:st.currentPlayer}));
  }
  if(Object.values(buckets).every(a=>a.length>=quota))break;
 }
 const positions=Object.values(buckets).flat();
 const missing=Object.entries(buckets).filter(([,v])=>v.length!==quota).map(([k,v])=>k+':'+v.length);
 if(missing.length)throw Error('missing preregistered cells: '+missing.join(', '));
 if(new Set(positions.map(p=>p.seed)).size!==positions.length)throw Error('seed overlap');
 return {positions,scanned,eligibleCount,selectedByCell:Object.fromEntries(Object.entries(buckets).map(([k,v])=>[k,v.map(p=>p.seed)]))};
}
function summarize(rows){
 const byHandUrgency={};
 for(const g of GROUPS)for(const h of HANDS){
  const sub=rows.filter(z=>z.group===g&&z.handSize===h),metrics={n:sub.length,worlds:sub.reduce((s,z)=>s+z.worlds,0),immediateNextOpponentFinishDiff:ci(sub.map(z=>z.immediateNextOpponentFinishDiff)),immediateNextOpponentMinusDiff:ci(sub.map(z=>z.immediateNextOpponentMinusDiff)),policies:{}};
  for(const p of POLICIES)metrics.policies[p]=Object.fromEntries(['first','pips','minus','block','turns'].map(k=>[k,ci(sub.map(z=>z.policyDiff[p][k]))]));
  byHandUrgency[g+'/hand'+h]=metrics;
 }
 const fullVectors={};
 for(const z of rows){
  const k=z.group+'/hand'+z.handSize+'/opp'+z.opponentSizes.join('-');
  (fullVectors[k]??=[]).push(z);
 }
 const vectorSummary=Object.fromEntries(Object.entries(fullVectors).sort().map(([k,v])=>[k,{n:v.length,worlds:v.reduce((s,z)=>s+z.worlds,0),seeds:v.map(z=>z.seed),fastDoublesFinishFirstDiff:ci(v.map(z=>z.policyDiff['fast-doubles'].first))}]));
 const urgent5=rows.filter(z=>z.group==='urgent'&&z.handSize===5);
 const sort=(a,b)=>a.policyDiff['fast-doubles'].first-b.policyDiff['fast-doubles'].first;
 const show=z=>({seed:z.seed,target:z.target,hand:z.hand,opponentSizes:z.opponentSizes,worlds:z.worlds,fastDoublesFinishFirstDiff:z.policyDiff['fast-doubles'].first,immediateNextOpponentFinishDiff:z.immediateNextOpponentFinishDiff});
 return {byHandUrgency,fullOpponentSizeVector:vectorSummary,urgentHand5Counterexamples:{bestForImmediateDouble:urgent5.slice().sort((a,b)=>sort(b,a)).slice(0,5).map(show),bestForConnector:urgent5.slice().sort(sort).slice(0,5).map(show)}};
}
function run(start=606000,end=826000,quota=6,worlds=30){
 if(![start,end,quota,worlds].every(Number.isInteger)||end<=start||quota<1||worlds<2)throw Error('bad arguments');
 const guard=base.selfTest(),c=collect(start,end,quota),rows=c.positions.map(p=>base.analyze(p,worlds));
 if(JSON.stringify(base.analyze(c.positions[0],worlds))!==JSON.stringify(rows[0]))throw Error('deterministic replay failed');
 const n=rows.reduce((s,z)=>s+z.worlds,0);
 return {schema:'qosa-double-connector-hand-strata/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',start,end,seedFilter:'seed%17===0',quotaPerUrgencyHandSizeAndTarget:quota,requestedWorldsPerPosition:worlds,positionCount:rows.length,newHiddenWorlds:n,pairedCandidateContinuations:n*POLICIES.length*2,newFullStrategyRounds:0,cumulativeCreditedHiddenWorlds:95423+n,cumulativeCreditedCompleteRounds:180000,scannedSeeds:c.scanned,eligibleFirstStates:c.eligibleCount,selectedByCell:c.selectedByCell,worldSeedFormula:'22000000+1000*dealSeed+attemptOffset; reject duplicate hidden allocations; per-position offsets persisted',policies:POLICIES.map(p=>'side-neutral-'+p),comparison:'X-X opening now minus X-Y connector exposing unopened X, identical focal state and hidden worlds',selection:'first eligible reachable state per seed, target priority X4 > X2 > X0, exactly quota per urgency x focal hand 3/4/5 x X 0/2/4',validation:{baseSelfTest:guard,distinctPositionSeeds:true,firstPositionExactReplay:true,allContinuationsResolved:true},summary:summarize(rows),rows,limitations:['Assumed branch locking/opening; 5-player/loneZero not validated','Full opponent size vector is reported, not quota-matched; sparse vector strata are descriptive only','Simple bots; block winner unassigned, finish-first excludes blocks','First-eligible and seed%17 selection; only X=0,2,4','Within-position hidden worlds correlated; CI uses positions as units; exploratory unadjusted 95% normal approximations','Distinct allocations capped by combinatorial maximum, so position world counts differ','V8 CommonJS replay; independent Node CLI still pending'],exactNextAction:'Investigate urgent focal-hand=5 exception with targeted opponent-size vector 2/4 vs 4/2, seed-disjoint matched-position holdout; compare immediate opponent finish and minus risk; do not promote universal double-retention advice.'};
}
if(require.main===module){const [a,b,c,w]=process.argv.slice(2).map(Number);console.log(JSON.stringify(run(a??606000,b??826000,c??6,w??30),null,2));}
module.exports={collect,summarize,run};