'use strict';
// node qosha-research/simulator/triple-choice-control-runner.js test
// node qosha-research/simulator/triple-choice-control-runner.js 90000 91500 25 91500 93000 25
const e=require('./engine'),i=require('./initializer'),r=require('./round-driver');
const d=require('./turn-dispatcher'),late=require('./late-double-threat-runner');
const ex=require('./exact-late-double-runner'),reg=require('./decision-regret');
const {chooseBy}=require('./strategy-runner');
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;
const pairs=[['connector','open'],['unrelated','open'],['connector','unrelated']];
const label=(a,b)=>a+'Minus'+b[0].toUpperCase()+b.slice(1);
function eligible(s){
 const f=s.currentPlayer,h=s.hands[f],next=(f+1)%3;
 if(s.stock.length||h.length<3||h.length>5||s.hands[next].length>2)return [];
 const o=d.turnOptions(s.branchState,s.openingState,h,s.stock);
 if(o.phase!=='play'||o.drawn)return [];
 return late.strict(s).map(g=>({...g,unrelated:o.actions.filter(a=>
 a.type==='single'&&!a.tile.includes(g.x)).map(reg.actionKey)})).filter(g=>g.open.length&&g.keep.length&&g.unrelated.length);
}
function collect(start,end,limit,policy){
 let scanned=0;const positions=[];
 for(let seed=start;seed<end&&positions.length<limit;seed++){
  let s=i.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;scanned++;
  while(!s.outcome&&s.turns<100){
   const g=eligible(s);
   if(g.length){
    const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
    positions.push({seed,turn:s.turns,focal:s.currentPlayer,next:(s.currentPlayer+1)%3,
     state:r.cloneRoundState(s),known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t))),
     group:g[0],discovery:policy});break;
   }
   s=r.stepRound(s,(o,st)=>chooseBy(policy,o,{seed,turns:st.turns,player:st.currentPlayer}));
  }
 }
 return{scanned,positions};
}
function analyze(p){
 const s=p.state,before=JSON.stringify(s),worlds=ex.exactWorlds(p);
 const o=d.turnOptions(s.branchState,s.openingState,s.hands[p.focal],s.stock);
 const actions=new Map(o.actions.map(a=>[reg.actionKey(a),a]));
 const classes={open:p.group.open,connector:p.group.keep,unrelated:p.group.unrelated};
 const keys=[...new Set(Object.values(classes).flat())];
 for(const k of keys)if(!actions.has(k))throw Error('missing action '+k);
 const classAvg=(map,k,fn)=>avg(classes[k].map(a=>fn(map.get(a))));
 const samples=Object.fromEntries(policies.map(p=>[p,[]]));const threats=[];let continuations=0;
 for(let j=0;j<worlds.length;j++){
  const w=worlds[j],th=new Map(keys.map(k=>[k,late.threat(w,actions.get(k),p.next)])),t={};
  for(const [a,b] of pairs)t[label(a,b)]=classAvg(th,a,x=>x.finish)-classAvg(th,b,x=>x.finish);
  threats.push(t);
  for(const policy of policies){
   const v=reg.evaluateDecisionInWorld(w,{focalPlayer:p.focal,continuationStrategy:policy,seed:15000000+1000*p.seed+j,maxTurns:200});
   if(v.kind!=='paired-world')throw Error('not paired');continuations+=v.candidates.length;
   const map=new Map(v.candidates.map(x=>[x.actionKey,x]));
   for(const k of keys)if(!map.has(k)||map.get(k).outcome==='unresolved')throw Error('unresolved');
   const z={};
   for(const [a,b] of pairs){
    z[label(a,b)]={};
    for(const [metric,fn] of Object.entries({finish:x=>+x.focalFinishedFirst,pips:x=>x.focalRemainder,
      minus:x=>+(x.focalMinus<0),block:x=>+(x.outcome==='block')}))
     z[label(a,b)][metric]=classAvg(map,a,fn)-classAvg(map,b,fn);
   }
   samples[policy].push(z);
  }
 }
 if(JSON.stringify(s)!==before)throw Error('state mutation');
 const contrasts={};
 for(const policy of policies){
  contrasts[policy]={};
  for(const [a,b] of pairs){
   const k=label(a,b);
   contrasts[policy][k]=Object.fromEntries(['finish','pips','minus','block'].map(m=>[m,avg(samples[policy].map(x=>x[k][m]))]));
  }
 }
 return{seed:p.seed,discovery:p.discovery,turn:p.turn,target:p.group.x,hand:s.hands[p.focal].map(e.tileKey),
  handSizes:s.hands.map(h=>h.length),classes,exactAllocations:worlds.length,continuations,contrasts,
  immediateFinishOpportunity:Object.fromEntries(pairs.map(([a,b])=>{
   const k=label(a,b);return[k,avg(threats.map(x=>x[k]))]}))};
}
function stats(a){if(!a.length)return null;const n=a.length,m=avg(a);
 const sd=n>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(n-1)):0;
 return{n,mean:m,exploratoryPositionCI95:[m-1.96*sd/Math.sqrt(n),m+1.96*sd/Math.sqrt(n)],
  positive:a.filter(x=>x>1e-10).length,negative:a.filter(x=>x< -1e-10).length,zero:a.filter(x=>Math.abs(x)<=1e-10).length};}
function summarize(rows){
 const groups={all:rows,minDiscovery:rows.filter(x=>x.discovery==='min-hand-pips'),
 closedDiscovery:rows.filter(x=>x.discovery==='closed-branch-control')},out={};
 for(const [group,rr] of Object.entries(groups)){
  const cell={positions:rr.length,exactAllocations:rr.reduce((n,x)=>n+x.exactAllocations,0)};
  for(const policy of policies){
   cell[policy]={};
   for(const [a,b] of pairs){
    const k=label(a,b);
    cell[policy][k]=Object.fromEntries(['finish','pips','minus','block']
      .map(m=>[m,stats(rr.map(x=>x.contrasts[policy][k][m]))]));
   }
  }
  cell.immediateFinishOpportunity=Object.fromEntries(pairs.map(([a,b])=>{
   const k=label(a,b);return[k,stats(rr.map(x=>x.immediateFinishOpportunity[k]))]}));
  out[group]=cell;
 }
 return out;
}
function run({minStart=90000,minEnd=91500,minLimit=25,closedStart=91500,closedEnd=93000,closedLimit=25}={}){
 const a=collect(minStart,minEnd,minLimit,'min-hand-pips');
 const b=collect(closedStart,closedEnd,closedLimit,'closed-branch-control');
 const rows=[...a.positions,...b.positions].map(analyze);
 return{schema:'qosa-exact-triple-choice-control/v1',
  timestampAsiaBaku:new Date(Date.now()+4*3600000).toISOString().slice(0,19)+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  seedSets:[{start:minStart,endExclusive:minEnd,limit:minLimit,discovery:'min-hand-pips',scanned:a.scanned},
   {start:closedStart,endExclusive:closedEnd,limit:closedLimit,discovery:'closed-branch-control',scanned:b.scanned}],
  policies,positions:rows.length,selectedSeeds:rows.map(x=>x.seed),
  exactHiddenAllocations:rows.reduce((n,x)=>n+x.exactAllocations,0),
  candidateContinuations:rows.reduce((n,x)=>n+x.continuations,0),newFullStrategyRounds:0,
  verifiedPreviousFullStrategyRounds:180000,priorExactLateGameAllocations:1337,
  comparison:'same-position open X-X vs X-Y connector retaining X-X and another X connector vs unrelated legal non-X single retaining X-X',
  weighting:'all distinct hidden opponent allocations equally weighted per position, equal action class and position weights',
  continuationSeedFormula:'15000000+1000*dealSeed+lexicographicAllocationIndex',
  selection:'first eligible state per deal, focal 3..5, next opponent 1..2, stock empty; discovery quotas',
  limitations:'assumed branch semantics; opponent history ignored in hidden posterior; block winner unassigned; first-eligible selection; exploratory CIs; not human causal advice',
  next:'replicate B vs C on fresh seeds controlling pip removal and next-opponent mobility',
  summary:summarize(rows),rows};
}
function selfTest(){
 const c=collect(90000,90030,1,'min-hand-pips');
 if(c.positions.length!==1||c.positions[0].seed!==90004)throw Error('fixture');
 const x=analyze(c.positions[0]),y=analyze(c.positions[0]);
 if(JSON.stringify(x)!==JSON.stringify(y)||x.exactAllocations!==6||x.continuations!==54)throw Error('replay/coverage');
 for(const policy of policies)for(const m of ['finish','pips','minus','block']){
  const v=x.contrasts[policy];
  if(Math.abs(v.connectorMinusOpen[m]-v.unrelatedMinusOpen[m]-v.connectorMinusUnrelated[m])>1e-9)throw Error('contrast');
 }
 return{passed:true,seed:x.seed,exactAllocations:x.exactAllocations,continuations:x.continuations};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?selfTest():run({
  minStart:Number(a[0]||90000),minEnd:Number(a[1]||91500),minLimit:Number(a[2]||25),
  closedStart:Number(a[3]||91500),closedEnd:Number(a[4]||93000),closedLimit:Number(a[5]||25)}),null,2));
}
module.exports={eligible,collect,analyze,stats,summarize,run,selfTest};
