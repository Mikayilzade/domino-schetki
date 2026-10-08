'use strict';
// Reproduce: node qosha-research/simulator/endpoint-mobility-holdout.js 24 25
// Pre-registered, disjoint-seed within-position mobility hypothesis.
// Do not pool world-level observations as independent: CI uses positions.
const e=require('./engine');
const old=require('./endpoint-side-matched-holdout');
const base=require('./connector-gap-pressure');
const DISCOVERY=[
  ['closed-branch-control',142000,144000],
  ['min-hand-pips',144000,146000]
];
const CONTINUATION=['closed-branch-control','min-hand-pips','fast-doubles'];
const GROUPS=['low-more','high-more','equal'];
const METRICS=['finish','pips','minus'];
const PRIOR_WORLDS=51610;
const FULL_ROUNDS=180000;
function mobility(pos){
  const h=pos.state.hands[pos.focal],c=pos.choice;
  const lowKey=e.tileKey([c.x,c.low]),highKey=e.tileKey([c.x,c.high]);
  if(lowKey===highKey)throw Error('candidate tiles must differ');
  if(h.filter(t=>e.tileKey(t)===lowKey).length!==1||
     h.filter(t=>e.tileKey(t)===highKey).length!==1)throw Error('candidate tile absent');
  // Count OTHER stones still touching the new endpoint after each legal move.
  // X-LOW is spent for LOW, X-HIGH for HIGH; both choices share one board side.
  const low=h.filter(t=>e.tileKey(t)!==lowKey&&t.includes(c.low)).length;
  const high=h.filter(t=>e.tileKey(t)!==highKey&&t.includes(c.high)).length;
  return{low,high,group:low>high?'low-more':low<high?'high-more':'equal'};
}
function seedRank(seed){return e.mixSeed32(seed^0x051eadef);}
function select(policy,start,end,quota){
  const rows=old.scan(policy,start,end).map(p=>({...p,mobility:mobility(p)}));
  const groups=Object.fromEntries(GROUPS.map(g=>[g,[]]));
  for(const p of rows)groups[p.mobility.group].push(p);
  const available=Object.fromEntries(GROUPS.map(g=>[g,groups[g].length]));
  const selected=[];
  for(const g of GROUPS){
    if(groups[g].length<quota)throw Error('insufficient '+policy+'/'+g);
    groups[g].sort((a,b)=>seedRank(a.seed)-seedRank(b.seed)||a.seed-b.seed);
    selected.push(...groups[g].slice(0,quota).map(p=>({...p,discoveryPolicy:policy})));
  }
  return{selected,available,eligible:rows.length,range:[start,end-1]};
}
function stat(xs){
  if(!xs.length)return null;
  const n=xs.length,mean=xs.reduce((a,b)=>a+b,0)/n;
  const sd=n>1?Math.sqrt(xs.reduce((a,b)=>a+(b-mean)**2,0)/(n-1)):0;
  const half=1.96*sd/Math.sqrt(n);
  return{n,mean,ci95NormalApprox:[mean-half,mean+half]};
}
function aggregate(rows){
  const out={};
  for(const policy of CONTINUATION){
    out[policy]={};
    for(const group of GROUPS){
      const r=rows.filter(x=>x.mobility.group===group);
      out[policy][group]=Object.fromEntries(METRICS.map(k=>[k,stat(r.map(x=>x.policies[policy].keepHighMinusLow[k]))]));
    }
    const aligned=rows.filter(x=>x.mobility.group!=='equal');
    out[policy].alignedWithMoreRemainingConnectors=Object.fromEntries(METRICS.map(k=>[k,stat(aligned.map(x=>{
      const sign=Math.sign(x.mobility.low-x.mobility.high);
      return sign*x.policies[policy].keepHighMinusLow[k];
    }))]));
  }
  return out;
}
function run(quota=24,worlds=25){
  if(!Number.isInteger(quota)||quota<1||!Number.isInteger(worlds)||worlds<1)throw Error('positive integer quota/worlds');
  const selections=DISCOVERY.map(([policy,start,end])=>({policy,...select(policy,start,end,quota)}));
  const positions=selections.flatMap(s=>s.selected);
  const seen=new Set();
  for(const p of positions){if(seen.has(p.seed))throw Error('duplicate deal seed');seen.add(p.seed);}
  const rows=positions.map(p=>({
    seed:p.seed,discoveryPolicy:p.discoveryPolicy,turn:p.state.turns,focal:p.focal,
    hand:p.state.hands[p.focal].map(e.tileKey),
    handSizesClockwise:[p.state.hands[p.focal].length,p.state.hands[(p.focal+1)%3].length,p.state.hands[(p.focal+2)%3].length],
    side:p.choice.side,x:p.choice.x,low:p.choice.low,high:p.choice.high,
    mobility:p.mobility,worldStart:6100000+1000*p.seed,
    candidateKeys:[p.choice.spendLow,p.choice.spendHigh],policies:{}
  }));
  let continuations=0;
  for(const policy of CONTINUATION){
    for(let k=0;k<positions.length;k++){
      const result=base.analyze(positions[k],worlds,policy);
      continuations+=result.continuations;
      rows[k].policies[policy]={keepHighMinusLow:result.keepHighMinusLow,continuations:result.continuations};
    }
  }
  const summary=aggregate(rows);
  const ranked=rows.filter(x=>x.mobility.group!=='equal').map(x=>{
    const sign=Math.sign(x.mobility.low-x.mobility.high);
    return{seed:x.seed,discoveryPolicy:x.discoveryPolicy,hand:x.hand,side:x.side,
      endpoints:[x.low,x.high],mobility:x.mobility,
      meanAlignedFinishDelta:CONTINUATION.reduce((a,p)=>a+sign*x.policies[p].keepHighMinusLow.finish,0)/CONTINUATION.length};
  }).sort((a,b)=>a.meanAlignedFinishDelta-b.meanAlignedFinishDelta);
  return{schema:'qosa-endpoint-mobility-holdout/v1',
    timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',
    engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
    newFullStrategyRounds:0,cumulativeFullStrategyRounds:FULL_ROUNDS,
    historicalFullRoundsSeparate:4000,
    seedRanges:DISCOVERY.map(([,a,z])=>[a,z-1]),
    discoveryPolicies:DISCOVERY.map(x=>x[0]),continuationPolicies:CONTINUATION,
    quotaPerDiscoveryAndMobilityGroup:quota,worldsPerPosition:worlds,
    selectedSeeds:rows.map(x=>x.seed),
    scanAudit:Object.fromEntries(selections.map(s=>[s.policy,{seedRange:s.range,eligible:s.eligible,available:s.available,selected:s.selected.length}])),
    positionCount:rows.length,newHiddenWorlds:rows.length*worlds,
    priorHiddenWorlds:PRIOR_WORLDS,cumulativeHiddenWorlds:PRIOR_WORLDS+rows.length*worlds,
    policyWorldEvaluations:rows.length*worlds*CONTINUATION.length,
    candidateContinuations:continuations,
    worldSeedFormula:'6100000 + 1000 * dealSeed + worldIndex',
    hypothesis:'Exposing an endpoint touched by more OTHER remaining hand tiles improves finish-first probability.',
    mobilityDefinition:'After spending X-LOW or X-HIGH on the SAME branch side, count other remaining hand tiles containing LOW or HIGH, respectively.',
    comparison:'keepHighMinusLow = spend X-LOW minus spend X-HIGH. Aligned = choose endpoint with more remaining matching tiles minus choose endpoint with fewer.',
    selection:'First eligible reachable both-open X position per seed, stratified 24 per mobility group per discovery policy; seeded hash rank within group.',
    ciMethod:'Unadjusted normal 95% approximation across independent selected deal-seed POSITIONS; hidden worlds not treated as independent.',
    summary,exampleCounterexamples:ranked.slice(0,5),exampleSuccesses:ranked.slice(-5).reverse(),
    limitations:['Assumption-labelled opening/locked-branch rules','Only 3 deterministic handcrafted continuation bots','No block winner','First-eligible selection and quota stratification','Within-position paired actions, but mobility not randomized independently of hand composition','Unadjusted exploratory CIs and 3 policies','Not a validated universal human rule'],
    nextHypothesis:'Independently replicate endpoint mobility with fresh seeds 146000..149999, then stratify by both opponent hand sizes and alternative open ends before promoting practical advice.',
    positions:rows};
}
function selfTest(){
  const p=old.scan('min-hand-pips',142000,142030)[0];
  if(!p)throw Error('no fixture');
  const before=JSON.stringify(p.state),m=mobility(p);
  const a=base.analyze(p,2,'closed-branch-control');
  const b=base.analyze(p,2,'closed-branch-control');
  if(JSON.stringify(p.state)!==before||JSON.stringify(a)!==JSON.stringify(b))throw Error('mutation or non-determinism');
  if(!GROUPS.includes(m.group)||!Number.isInteger(m.low)||!Number.isInteger(m.high))throw Error('invalid mobility');
  if(p.choice.spendLow===p.choice.spendHigh)throw Error('identical candidate actions');
  return{passed:true,seed:p.seed,mobility:m,pairedWorlds:2};
}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?selfTest():run(Number(process.argv[2]||24),Number(process.argv[3]||25)),null,2));
module.exports={mobility,select,stat,aggregate,run,selfTest};
