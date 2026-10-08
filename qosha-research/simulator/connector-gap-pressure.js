'use strict';
// Reproduce: node qosha-research/simulator/connector-gap-pressure.js
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),i=require('./initializer');
const {chooseBy}=require('./strategy-runner'),{actionKey}=require('./decision-regret'),{runHiddenWorlds}=require('./hidden-world');
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'];
const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;
function stats(a){if(!a.length)return null;const m=avg(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0,h=1.96*sd/Math.sqrt(a.length);return{n:a.length,mean:m,ci95:[m-h,m+h]};}
function eligible(s){
 const hand=s.hands[s.currentPlayer];if(s.stock.length||![4,5].includes(hand.length))return null;
 const opts=d.turnOptions(s.branchState,s.openingState,hand,s.stock);if(opts.phase!=='play'||opts.drawn)return null;
 for(const side of e.SIDES){
  const b=s.branchState.branches[side];if(!b.active||!e.isNumberOpened(s.openingState,b.end))continue;
  const x=b.end,cs=hand.filter(t=>t[0]!==t[1]&&t.includes(x)).map(tile=>({tile,to:tile[0]===x?tile[1]:tile[0]})).sort((a,b)=>a.to-b.to);
  if(cs.length!==2||cs[0].to===cs[1].to||cs.some(c=>!e.isNumberOpened(s.openingState,c.to)))continue;
  const acts=cs.map(c=>opts.actions.filter(a=>a.type==='single'&&a.side===side&&a.from===x&&a.to===c.to&&e.tileKey(a.tile)===e.tileKey(c.tile)));
  if(acts.some(a=>a.length!==1))continue;
  return{side,x,low:cs[0].to,high:cs[1].to,spendLow:actionKey(acts[0][0]),spendHigh:actionKey(acts[1][0])};
 }return null;
}
function collect(start=51000,end=61000,quota=10){
 const cells={},observed={},positions=[];let lastScanned=start-1;
 for(let seed=start;seed<end;seed++){
  lastScanned=seed;
  let s=i.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;
  while(!s.outcome&&s.turns<100){
   const c=eligible(s);
   if(c){
    const handSize=s.hands[s.currentPlayer].length,oppMin=Math.min(...s.hands.filter((h,j)=>j!==s.currentPlayer).map(h=>h.length));
    const cell=handSize+':'+(oppMin<=3?'late':'early')+':'+(c.high-c.low<=2?'narrow':'wide');
    observed[cell]=(observed[cell]||0)+1;
    if((cells[cell]||0)<quota){
     const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
     positions.push({seed,focal:s.currentPlayer,state:r.cloneRoundState(s),known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t))),choice:c,cell,oppMin});
     cells[cell]=(cells[cell]||0)+1;
    }break;
   }
   s=r.stepRound(s,(o,st)=>chooseBy('min-hand-pips',o,{seed,turns:st.turns,player:st.currentPlayer}));
  }
  if(Object.keys(cells).length===8&&Object.values(cells).every(n=>n>=quota))break;
 }
 return{positions,cells,observed,lastScanned};
}
function analyze(p,worlds,policy){
 const s=p.state,c=p.choice,spec={focalPlayer:p.focal,focalHand:s.hands[p.focal],knownTiles:p.known,hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 const worldStart=6100000+1000*p.seed;
 const out=runHiddenWorlds(spec,{count:worlds,startSeed:worldStart,continuationStrategy:policy,maxTurns:200});
 const ds=out.results.map(w=>{
  const by=new Map(w.candidates.map(x=>[x.actionKey,x])),lo=by.get(c.spendLow),hi=by.get(c.spendHigh);
  if(!lo||!hi||lo.outcome==='unresolved'||hi.outcome==='unresolved')throw Error('unresolved paired candidate');
  const pips=lo.focalRemainder-hi.focalRemainder;
  return{finish:(+lo.focalFinishedFirst)-(+hi.focalFinishedFirst),pips,residualPips:pips-(c.high-c.low),minus:(+(lo.focalMinus<0))-(+(hi.focalMinus<0))};
 });
 return{seed:p.seed,cell:p.cell,side:c.side,x:c.x,low:c.low,high:c.high,gap:c.high-c.low,handSize:s.hands[p.focal].length,opponentMinHand:p.oppMin,turn:s.turns,worldStart,continuations:out.results.reduce((n,w)=>n+w.candidates.length,0),keepHighMinusLow:Object.fromEntries(['finish','pips','residualPips','minus'].map(k=>[k,avg(ds.map(x=>x[k]))]))};
}
function run({start=51000,end=61000,quota=10,worlds=25}={}){
 const sel=collect(start,end,quota),rows={},summary={};let continuations=0;
 for(const policy of POLICIES){
  rows[policy]=sel.positions.map(p=>analyze(p,worlds,policy));
  continuations+=rows[policy].reduce((n,p)=>n+p.continuations,0);
  summary[policy]={};
  for(const cell of Object.keys(sel.cells).sort()){
   const subset=rows[policy].filter(p=>p.cell===cell);
   summary[policy][cell]=Object.fromEntries(['finish','pips','residualPips','minus'].map(k=>[k,stats(subset.map(x=>x.keepHighMinusLow[k]))]));
  }
  summary[policy].all=Object.fromEntries(['finish','pips','residualPips','minus'].map(k=>[k,stats(rows[policy].map(x=>x.keepHighMinusLow[k]))]));
 }
 return{schema:'qosa-connector-gap-pressure/v1',timestampAsiaBaku:'2026-10-08 16:47 +04:00',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  seedScan:[start,sel.lastScanned],seedRangeRequested:[start,end-1],discoveryPolicy:'min-hand-pips',cells:sel.cells,observed:sel.observed,selectedSeeds:sel.positions.map(p=>p.seed),
  selection:'first eligible both-open same-side X connectors per seed; hand 4/5; 8 handSize x opponentMinHand x connectorGap quota cells',positionCount:sel.positions.length,worldsPerPosition:worlds,
  newHiddenWorlds:sel.positions.length*worlds,policyWorldEvaluations:sel.positions.length*worlds*POLICIES.length,candidateContinuations:continuations,
  worldSeedFormula:'6100000 + 1000*dealSeed + worldIndex',policies:POLICIES,
  metricDirection:'keep HIGH minus keep LOW = spend LOW minus spend HIGH; positive pips is worse; residual pips subtracts immediate high-low gap',
  newFullStrategyRounds:0,priorFullRounds:180000,priorHiddenWorlds:23810,cumulativeHiddenWorlds:23810+sel.positions.length*worlds,
  confidence:'exploratory position-level normal 95% CI; no multiple-testing adjustment',
  limitations:'assumption-labelled branch opening; deterministic bots; first-eligible/quota selection not population-weighted; block winner unassigned',
  summary,rows};
}
function selfTest(){
 const x=collect(51000,51300,2);if(x.positions.length<4)throw Error('too few fixtures');
 for(const p of x.positions){
  const acts=d.turnOptions(p.state.branchState,p.state.openingState,p.state.hands[p.focal],p.state.stock).actions;
  const lo=acts.find(a=>actionKey(a)===p.choice.spendLow),hi=acts.find(a=>actionKey(a)===p.choice.spendHigh);
  if(!lo||!hi||lo.side!==hi.side||lo.from!==hi.from||lo.to>=hi.to||!e.isNumberOpened(p.state.openingState,lo.to)||!e.isNumberOpened(p.state.openingState,hi.to))throw Error('same-side both-open invariant');
 }
 const p=x.positions[0],before=JSON.stringify(p.state),a=analyze(p,2,'min-hand-pips'),b=analyze(p,2,'min-hand-pips');
 if(JSON.stringify(a)!==JSON.stringify(b)||before!==JSON.stringify(p.state))throw Error('non-deterministic/mutated source');
 return{passed:true,fixtureSeeds:x.positions.map(p=>p.seed),pairedWorlds:2};
}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?selfTest():run(),null,2));
module.exports={eligible,collect,analyze,run,selfTest};
