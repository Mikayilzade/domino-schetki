'use strict';
// Reproduce: node qosha-research/simulator/discovery-policy-holdout.js 80000 90000 8 25
// Discovery-policy variation only; same game rules, same legal actions and
// identical hidden-world continuations for each pair of forced candidate moves.
const e=require('./engine'),r=require('./round-driver'),i=require('./initializer');
const {chooseBy}=require('./strategy-runner');
const base=require('./connector-gap-pressure');
const DISCOVERY=['closed-branch-control','min-hand-pips'];
const CONTINUATION=['closed-branch-control','min-hand-pips','fast-doubles'];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function stats(a){
 if(!a.length)return null;
 const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0,h=1.96*sd/Math.sqrt(a.length);
 return{n:a.length,mean:m,ci95NormalApprox:[m-h,m+h]};
}
function collect(start,end,quota,policy){
 const cells={},positions=[];let lastScanned=start-1;
 for(let seed=start;seed<end;seed++){
  lastScanned=seed;
  let s=i.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;
  while(!s.outcome&&s.turns<100){
   const c=base.eligible(s);
   if(c){
    const size=s.hands[s.currentPlayer].length;
    const oppMin=Math.min(...s.hands.filter((h,j)=>j!==s.currentPlayer).map(h=>h.length));
    const cell=size+':'+(oppMin<=3?'late':'early')+':'+(c.high-c.low<=2?'narrow':'wide');
    if((cells[cell]||0)<quota){
     const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
     positions.push({seed,focal:s.currentPlayer,state:r.cloneRoundState(s),known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t))),choice:c,cell,oppMin});
     cells[cell]=(cells[cell]||0)+1;
    }
    break;
   }
   s=r.stepRound(s,(o,st)=>chooseBy(policy,o,{seed,turns:st.turns,player:st.currentPlayer}));
  }
  if(Object.keys(cells).length===8&&Object.values(cells).every(n=>n>=quota))break;
 }
 return{cells,positions,lastScanned};
}
function summarize(rows){
 const groups={all:rows,late:rows.filter(r=>r.opponentMinHand<=3),early:rows.filter(r=>r.opponentMinHand>=4),
 narrow:rows.filter(r=>r.gap<=2),wide:rows.filter(r=>r.gap>=3)};
 return Object.fromEntries(Object.entries(groups).map(([group,rs])=>[group,
  Object.fromEntries(['finish','pips','residualPips','minus'].map(k=>[k,stats(rs.map(x=>x.keepHighMinusLow[k]))]))]));
}
function run(start=80000,end=90000,quota=8,worlds=25){
 const summary={},rows={},selectedSeeds={},scan={},cells={};let continuations=0;
 for(const discovery of DISCOVERY){
  const selection=collect(start,end,quota,discovery);
  if(selection.positions.length!==8*quota)throw Error('incomplete 8-cell quota: '+discovery);
  selectedSeeds[discovery]=selection.positions.map(p=>p.seed);
  scan[discovery]=[start,selection.lastScanned];
  cells[discovery]=selection.cells;
  rows[discovery]={};summary[discovery]={};
  for(const policy of CONTINUATION){
   const records=selection.positions.map(p=>base.analyze(p,worlds,policy));
   rows[discovery][policy]=records;
   summary[discovery][policy]=summarize(records);
   continuations+=records.reduce((s,x)=>s+x.continuations,0);
  }
 }
 return{schema:'qosa-discovery-policy-holdout/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  seedRangeRequested:[start,end-1],scan,quota,worlds,discoveryPolicies:DISCOVERY,continuationPolicies:CONTINUATION,
  cells,selectedSeeds,positionCount:DISCOVERY.length*quota*8,newHiddenWorlds:DISCOVERY.length*quota*8*worlds,
  policyWorldEvaluations:DISCOVERY.length*quota*8*worlds*CONTINUATION.length,candidateContinuations:continuations,
  priorFullRounds:180000,newFullRounds:0,priorHiddenWorlds:31090,cumulativeHiddenWorlds:31090+DISCOVERY.length*quota*8*worlds,
  worldSeedFormula:'6100000+1000*dealSeed+worldIndex',comparison:'keep HIGH minus keep LOW = spend LOW minus spend HIGH; positive pips worse',
  caveats:'Exploratory position-level normal intervals; balanced quota not population-weighted; assumption-labelled branches; deterministic bots; no block winner; cross-discovery comparisons are not randomized.',
  summary,rows};
}
function selfTest(){
 const a=collect(80000,80400,1,'closed-branch-control'),b=collect(80000,80400,1,'min-hand-pips');
 if(a.positions.length!==8||b.positions.length!==8)throw Error('missing fixture cells');
 const p=a.positions[0],before=JSON.stringify(p.state),x=base.analyze(p,2,'min-hand-pips'),y=base.analyze(p,2,'min-hand-pips');
 if(before!==JSON.stringify(p.state)||JSON.stringify(x)!==JSON.stringify(y))throw Error('paired replay/mutation');
 return{passed:true,fixturePositions:16,pairedWorlds:2};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?selfTest():run(Number(a[0]||80000),Number(a[1]||90000),Number(a[2]||8),Number(a[3]||25)),null,2));
}
module.exports={collect,run,selfTest};
