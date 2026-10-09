'use strict';
// Independent conditional endpoint-mobility holdout: 3x9, paired hidden worlds.
// Reproduce: node qosha-research/simulator/endpoint-mobility-urgency-holdout.js 10 25
const e=require('./engine'),old=require('./endpoint-side-matched-holdout'),base=require('./connector-gap-pressure');
const DISCOVERY=[['closed-branch-control',150000,152000],['min-hand-pips',152000,154000]];
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles','moderate-double-hold','random-legal'];
const GROUPS=['urgent:two','urgent:many','normal:two','normal:many'];
function mobility(p){
 const h=p.state.hands[p.focal],c=p.choice,lo=e.tileKey([c.x,c.low]),hi=e.tileKey([c.x,c.high]);
 const low=h.filter(t=>e.tileKey(t)!==lo&&t.includes(c.low)).length;
 const high=h.filter(t=>e.tileKey(t)!==hi&&t.includes(c.high)).length;
 return {low,high,alignedSign:Math.sign(low-high)};
}
function classify(p){
 const opponents=[p.state.hands[(p.focal+1)%3].length,p.state.hands[(p.focal+2)%3].length];
 const openedSides=e.SIDES.filter(side=>e.isNumberOpened(p.state.openingState,p.state.branchState.branches[side].end));
 return {opponents,openedSides,openCount:openedSides.length,urgency:Math.min(...opponents)<=2?'urgent':'normal',
   openness:openedSides.length===2?'two':'many'};
}
function select(policy,start,end,quota){
 const groups=Object.fromEntries(GROUPS.map(g=>[g,[]]));
 let scanned=0,nonTie=0;
 for(const p of old.scan(policy,start,end)){
  scanned++;
  const m=mobility(p),c=classify(p);
  if(m.alignedSign===0||c.openCount<2)continue;
  nonTie++;
  groups[c.urgency+':'+c.openness].push({...p,mobility:m,context:c,discoveryPolicy:policy});
 }
 const available=Object.fromEntries(GROUPS.map(g=>[g,groups[g].length]));
 const selected=[];
 for(const g of GROUPS){
  if(groups[g].length<quota)throw Error('insufficient non-tie positions '+policy+' '+g+' '+groups[g].length+' < '+quota);
  groups[g].sort((a,b)=>e.mixSeed32(a.seed^0x20261009)-e.mixSeed32(b.seed^0x20261009)||a.seed-b.seed);
  selected.push(...groups[g].slice(0,quota));
 }
 return {selected,scanned,nonTie,available};
}
function stat(xs){
 const n=xs.length;if(!n)return null;
 const mean=xs.reduce((a,b)=>a+b,0)/n;
 const sd=n>1?Math.sqrt(xs.reduce((a,b)=>a+(b-mean)**2,0)/(n-1)):0;
 const se=sd/Math.sqrt(n);
 return {n,mean,ci95NormalApprox:[mean-1.96*se,mean+1.96*se],se};
}
function summarize(rows){
 const out={};
 for(const policy of POLICIES){
  const signed=r=>r.mobility.alignedSign*r.policies[policy].finish;
  const subset=rs=>({finish:stat(rs.map(signed)),pips:stat(rs.map(r=>r.mobility.alignedSign*r.policies[policy].pips)),
    minus:stat(rs.map(r=>r.mobility.alignedSign*r.policies[policy].minus)),
    negativeCases:rs.filter(r=>signed(r)<0).length,zeroCases:rs.filter(r=>signed(r)===0).length});
  const urgent=rows.filter(r=>r.context.urgency==='urgent'),normal=rows.filter(r=>r.context.urgency==='normal');
  const u=stat(urgent.map(signed)),n=stat(normal.map(signed));
  const diff=u.mean-n.mean,half=1.96*Math.sqrt(u.se*u.se+n.se*n.se);
  out[policy]={all:subset(rows),urgent:subset(urgent),normal:subset(normal),
    urgencyDifference:{mean:diff,ci95NormalApprox:[diff-half,diff+half]},
    byOpenCount:{two:subset(rows.filter(r=>r.context.openness==='two')),
      many:subset(rows.filter(r=>r.context.openness==='many'))},
    byCell:Object.fromEntries(GROUPS.map(g=>[g,subset(rows.filter(r=>r.context.urgency+':'+r.context.openness===g))]))};
 }
 return out;
}
function run(quota=10,worlds=25){
 if(!Number.isInteger(quota)||quota<1||!Number.isInteger(worlds)||worlds<1||worlds>1000)throw Error('invalid quota/worlds');
 const selections=DISCOVERY.map(([policy,start,end])=>({policy,range:[start,end-1],...select(policy,start,end,quota)}));
 const positions=selections.flatMap(s=>s.selected);
 if(new Set(positions.map(p=>p.seed)).size!==positions.length)throw Error('duplicate deal seeds');
 const rows=positions.map(p=>({seed:p.seed,discoveryPolicy:p.discoveryPolicy,focal:p.focal,turn:p.state.turns,
  hand:p.state.hands[p.focal].map(e.tileKey),side:p.choice.side,x:p.choice.x,low:p.choice.low,high:p.choice.high,
  context:p.context,mobility:p.mobility,candidates:[p.choice.spendLow,p.choice.spendHigh],
  worldStart:6100000+1000*p.seed,policies:{}}));
 let continuations=0;
 for(const policy of POLICIES){
  for(let k=0;k<positions.length;k++){
   const before=JSON.stringify(positions[k].state);
   const a=base.analyze(positions[k],worlds,policy);
   if(before!==JSON.stringify(positions[k].state))throw Error('source mutated');
   if(a.continuations<2*worlds)throw Error('incomplete candidates');
   rows[k].policies[policy]=a.keepHighMinusLow;
   continuations+=a.continuations;
  }
 }
 const ranked=rows.map(r=>({...r,alignedFinishAverage:POLICIES.reduce((s,p)=>s+r.mobility.alignedSign*r.policies[p].finish,0)/POLICIES.length}))
  .sort((a,b)=>a.alignedFinishAverage-b.alignedFinishAverage);
 const examples=rs=>rs.map(r=>({seed:r.seed,hand:r.hand,opponents:r.context.opponents,openCount:r.context.openCount,
  side:r.side,x:r.x,low:r.low,high:r.high,mobility:r.mobility,alignedFinishAverage:r.alignedFinishAverage}));
 return {schema:'qosa-endpoint-mobility-urgency-independent-holdout/v1',
  timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  seedRanges:DISCOVERY.map(([,a,b])=>[a,b-1]),worldSeedFormula:'6100000+1000*dealSeed+worldIndex',
  quotaPerDiscoveryAndCell:quota,worldsPerPosition:worlds,positionCount:rows.length,newHiddenWorlds:rows.length*worlds,
  previousHiddenWorlds:58810,cumulativeHiddenWorlds:58810+rows.length*worlds,
  newFullStrategyRounds:0,cumulativeFullStrategyRounds:180000,historicalRoundsSeparate:4000,
  policyWorldEvaluations:rows.length*worlds*POLICIES.length,candidateContinuations:continuations,
  discoveryPolicies:DISCOVERY.map(x=>x[0]),continuationPolicies:POLICIES,
  selection:'First eligible reachable same-side X-LOW/X-HIGH, both endpoints opened, focal hand 4/5; non-tie mobility, quota by min opponent <=2 vs >=3 and 2 vs 3-4 playable branch sides; independent deal seeds.',
  comparison:'Positive aligned delta: choose endpoint touched by MORE other own tiles rather than fewer; identical hidden worlds and policy for both moves.',
  scanAudit:Object.fromEntries(selections.map(s=>[s.policy,{range:s.range,scannedEligible:s.scanned,nonTie:s.nonTie,available:s.available,selected:s.selected.length}])),
  summary:summarize(rows),counterexamples:examples(ranked.slice(0,8)),successes:examples(ranked.slice(-8).reverse()),
  confidence:'Exploratory unadjusted 95% normal CI across distinct deal-seed positions, not hidden worlds. Multiple subgroup and policy comparisons; do not treat as confirmatory.',
  limitations:['Assumption-labelled branch opening rules','First-eligible position selection','Non-random mobility from hand composition','Handcrafted continuation bots including two newly tested policies','Block winner unassigned','Hidden worlds correlated within positions','No multiple-testing correction','Quota sample not prevalence weighted'],
  exactNextAction:'Re-run with disjoint seeds 154000..157999 and larger quotas; isolate same-hand branch-side alternatives and test regret for opponent with exactly 1 tile.',
  rows};
}
function selfTest(){
 const p=select('closed-branch-control',150000,152000,1).selected[0];
 const before=JSON.stringify(p.state),a=base.analyze(p,2,'random-legal'),b=base.analyze(p,2,'random-legal');
 if(JSON.stringify(a)!==JSON.stringify(b)||JSON.stringify(p.state)!==before)throw Error('replay/mutation regression');
 if(p.mobility.alignedSign===0||p.context.openCount<2)throw Error('selection regression');
 return {passed:true,seed:p.seed,pairedWorlds:2};
}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?selfTest():run(Number(process.argv[2]||10),Number(process.argv[3]||25)),null,2));
module.exports={run,selfTest,select,mobility,classify,stat,summarize};
