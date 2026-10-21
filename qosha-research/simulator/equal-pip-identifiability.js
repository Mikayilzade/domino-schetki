'use strict';
// Equal-pip double vs ordinary: audit matched next/focal legal sets and geometry.
// Reproduce: node qosha-research/simulator/equal-pip-identifiability.js test
// node qosha-research/simulator/equal-pip-identifiability.js 1336000 1340000 100 48
const e=require('./engine'),r=require('./round-driver'),d=require('./turn-dispatcher');
const base=require('./equal-pip-double-mobility'),sampler=require('./pass-conditioned-sampler');
const {chooseCanonical,signature}=require('../runs/2026-10-20-2352-canonical-geometry');
const policies=['min-hand-pips','closed-branch-control','fast-doubles'];
const avg=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
const key=e.tileKey;
function stat(xs){if(!xs.length)return {n:0};const mean=avg(xs);
 const sd=xs.length>1?Math.sqrt(xs.reduce((s,x)=>s+(x-mean)**2,0)/(xs.length-1)):0;
 return {n:xs.length,mean,ci95:[mean-1.96*sd/Math.sqrt(xs.length),mean+1.96*sd/Math.sqrt(xs.length)]};}
function actionTiles(a){return a.type==='single'?[a.tile]:(a.tiles||[]);}
function choose(policy,opts,s){
 if(policy!=='fast-doubles')return chooseCanonical(policy,opts,s);
 return [...opts.actions].sort((a,b)=>{
  const finish=+(b.type==='mixed-finish')-+(a.type==='mixed-finish');
  if(finish)return finish;
  const doubles=x=>actionTiles(x).filter(t=>t[0]===t[1]).length;
  const delta=doubles(b)-doubles(a);if(delta)return delta;
  const p=e.pipSum(actionTiles(b))-e.pipSum(actionTiles(a));if(p)return p;
  return signature(s,a).localeCompare(signature(s,b));
 })[0];
}
function legal(state,player){
 const o=d.turnOptions(state.branchState,state.openingState,state.hands[player],state.stock);
 const tiles=[...new Set(o.actions.flatMap(actionTiles).map(key))].sort();
 const actionClasses=[...new Set(o.actions.map(a=>a.type+':'+actionTiles(a).map(key).sort().join('+')))].sort();
 return {tiles,actionClasses};
}
function ends(s){return e.SIDES.map(x=>{const b=s.branchState.branches[x];return b.active?b.end:-1;}).sort((a,b)=>a-b).join(',');}
function continuation(s,f,policy){
 const o=r.runRound(s,(opts,st)=>choose(policy,opts,st),{maxTurns:200});
 if(o.outcome.kind==='unresolved')throw Error('unresolved continuation');
 return {win:+(o.outcome.kind==='finish'&&o.outcome.playerIndex===f),
 pips:e.pipSum(o.hands[f]),minus:+(o.outcome.kind==='finish'&&o.outcome.playerIndex===f&&o.outcome.minus<0),
 block:+(o.outcome.kind==='block')};
}
function analyze(p,worlds){
 const s=p.state,snapshot=JSON.stringify(s),f=p.focal,n=p.next;
 const forbidden=[new Set(),new Set(),new Set()];
 const a={nextMobility:[],focalMobility:[],sameNext:0,sameNextActions:0,sameFocal:0,bothSame:0,sameGeometry:0,
  sameNextWin:Object.fromEntries(policies.map(x=>[x,[]])),
  bothSameWin:Object.fromEntries(policies.map(x=>[x,[]])),
  outcomes:Object.fromEntries(policies.map(x=>[x,{win:[],pips:[],minus:[],block:[]}]))};
 for(let j=0;j<worlds;j++){
  const seed=e.mixSeed32((p.seed+Math.imul(j+1,0x9e3779b9))>>>0);
  const w=sampler.sample(s,p.known,forbidden,seed);
  const da=r.stepRound(w,()=>p.pair.double),sa=r.stepRound(w,()=>p.pair.single);
  if(da.outcome||sa.outcome)throw Error('unexpected immediate finish');
  const dn=legal(da,n),sn=legal(sa,n),df=legal(da,f),sf=legal(sa,f);
  const eq=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
  const sameNext=eq(dn.tiles,sn.tiles),sameFocal=eq(df.tiles,sf.tiles);
  a.nextMobility.push(dn.tiles.length-sn.tiles.length);
  a.focalMobility.push(df.tiles.length-sf.tiles.length);
  a.sameNext+=+sameNext;a.sameNextActions+=+(eq(dn.actionClasses,sn.actionClasses));
  a.sameFocal+=+sameFocal;a.bothSame+=+(sameNext&&sameFocal);
  a.sameGeometry+=+(ends(da)===ends(sa));
  for(const policy of policies){
   const x=continuation(da,f,policy),y=continuation(sa,f,policy);
   for(const metric of ['win','pips','minus','block'])a.outcomes[policy][metric].push(x[metric]-y[metric]);
   if(sameNext)a.sameNextWin[policy].push(x.win-y.win);
   if(sameNext&&sameFocal)a.bothSameWin[policy].push(x.win-y.win);
  }
 }
 if(JSON.stringify(s)!==snapshot)throw Error('source state mutated');
 const x=p.pair.double.numbers[0];
 const support=s.hands[f].filter(t=>t[0]!==t[1]&&t.includes(x)).length;
 return {seed:p.seed,turn:p.turn,discovery:p.discovery,doubleNumber:x,support,focalHand:s.hands[f].length,
  nextHand:s.hands[n].length,worlds,counts:Object.fromEntries(['sameNext','sameNextActions','sameFocal','bothSame','sameGeometry'].map(k=>[k,a[k]])),
  nextMobility:avg(a.nextMobility),focalMobility:avg(a.focalMobility),
  outcomes:Object.fromEntries(policies.map(policy=>[policy,Object.fromEntries(
   ['win','pips','minus','block'].map(m=>[m,avg(a.outcomes[policy][m])]))])),
  sameNextWin:Object.fromEntries(policies.map(policy=>[policy,a.sameNextWin[policy].length?avg(a.sameNextWin[policy]):null])),
  bothSameWin:Object.fromEntries(policies.map(policy=>[policy,a.bothSameWin[policy].length?avg(a.bothSameWin[policy]):null]))};
}
function summarize(rows){
 const total=(key)=>rows.reduce((s,x)=>s+x.counts[key],0);
 const groups={all:rows,support0:rows.filter(x=>x.support===0),support1:rows.filter(x=>x.support===1),
 support2plus:rows.filter(x=>x.support>=2),sameNextObserved:rows.filter(x=>x.counts.sameNext>0),
 bothObserved:rows.filter(x=>x.counts.bothSame>0)};
 return {positions:rows.length,worlds:rows.reduce((s,x)=>s+x.worlds,0),
 counts:Object.fromEntries(['sameNext','sameNextActions','sameFocal','bothSame','sameGeometry'].map(k=>[k,total(k)])),
 nextMobility:stat(rows.map(x=>x.nextMobility)),focalMobility:stat(rows.map(x=>x.focalMobility)),
 groups:Object.fromEntries(Object.entries(groups).map(([g,rr])=>[g,{
 positions:rr.length,win:Object.fromEntries(policies.map(p=>[p,stat(rr.map(x=>x.outcomes[p].win))])),
 pips:Object.fromEntries(policies.map(p=>[p,stat(rr.map(x=>x.outcomes[p].pips))]))}])),
 sameNextConditional:Object.fromEntries(policies.map(p=>[p,stat(rows.filter(x=>x.counts.sameNext).map(x=>x.sameNextWin[p]))])),
 bothConditional:Object.fromEntries(policies.map(p=>[p,stat(rows.filter(x=>x.counts.bothSame).map(x=>x.bothSameWin[p]))])),
 positiveAllThree:rows.filter(x=>policies.every(p=>x.outcomes[p].win>0)).map(x=>({seed:x.seed,turn:x.turn,double:x.doubleNumber,support:x.support,
 deltas:policies.map(p=>x.outcomes[p].win)})).slice(0,15),
 negativeAllThree:rows.filter(x=>policies.every(p=>x.outcomes[p].win<0)).length};
}
function run(minStart=1336000,branchStart=1340000,limit=100,worlds=48){
 if(!Number.isInteger(minStart)||!Number.isInteger(branchStart)||limit<2||worlds<2)throw Error('bad arguments');
 const first=base.collect(minStart,minStart+3000,Math.ceil(limit/2),'min-hand-pips');
 const second=base.collect(branchStart,branchStart+3000,Math.floor(limit/2),'closed-branch-control');
 const positions=[...first.positions,...second.positions],rows=positions.map(p=>analyze(p,worlds));
 if(new Set(rows.map(x=>x.seed)).size!==rows.length)throw Error('overlapping seeds');
 return {schema:'qosa-equal-pip-identifiability/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
 mode:'3x9',seedSets:{minPips:[minStart,minStart+first.scanned],branchControl:[branchStart,branchStart+second.scanned]},
 dealsScanned:first.scanned+second.scanned,positions:rows.length,worldsPerPosition:worlds,
 hiddenAllocations:rows.length*worlds,candidateContinuations:rows.length*worlds*policies.length*2,
 unresolved:0,fullStrategyRoundsAdded:0,policies,worldSeedFormula:'mixSeed32((dealSeed + imul(worldIndex+1,0x9e3779b9)) >>> 0)',
 comparison:'Same reachable state, equal discarded pips, forced double X-X vs ordinary A-B, same hidden worlds and canonical continuation bots.',
 legalSets:'distinct playable tile keys for immediate next opponent and focal hand on each post-action board; action classes are type+played tile multiset, branch side ignored',
 limitations:'Exploratory position-level CIs, overlap selected on post-action variables, not causal; branch rules provisional; uniform hidden worlds without opponent-choice likelihood; first eligible position; blocks have no winner; finish-first not match win.',
 summary:summarize(rows),rows};
}
function test(){
 const x=run(1336000,1340000,4,3),y=run(1336000,1340000,4,3);
 if(JSON.stringify(x)!==JSON.stringify(y)||x.positions!==4||x.candidateContinuations!==72)throw Error('deterministic replay');
 if(x.summary.counts.sameGeometry!==0)throw Error('non-double changed same end multiset');
 if(x.summary.counts.sameNext>x.hiddenAllocations||x.summary.counts.bothSame>x.summary.counts.sameNext)throw Error('invalid counts');
 return {passed:true,positions:x.positions,continuations:x.candidateContinuations,counts:x.summary.counts};
}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1336000),+(a[1]||1340000),+(a[2]||100),+(a[3]||48)),null,2));}
module.exports={run,test,analyze,legal,choose};