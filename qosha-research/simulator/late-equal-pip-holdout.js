'use strict';
// Late-game matched-world equal-pip X-X opening vs ordinary tile.
// Usage: node qosha-research/simulator/late-equal-pip-holdout.js test
//        node qosha-research/simulator/late-equal-pip-holdout.js 1345000 1350000 60 32
const e=require('./engine'),init=require('./initializer'),r=require('./round-driver'),d=require('./turn-dispatcher');
const base=require('./equal-pip-double-mobility'),sampler=require('./pass-conditioned-sampler');
const {chooseCanonical}=require('../runs/2026-10-20-2352-canonical-geometry');
const {choose:chooseThird}=require('./equal-pip-identifiability');
const policies=['min-hand-pips','closed-branch-control','fast-doubles'];
const deck=e.createDoubleSixDeck(),key=e.tileKey;
function mean(xs){return xs.reduce((a,b)=>a+b,0)/xs.length;}
function stat(xs){if(!xs.length)return {n:0};const m=mean(xs),sd=xs.length>1?Math.sqrt(xs.reduce((a,b)=>a+(b-m)**2,0)/(xs.length-1)):0;
 return {n:xs.length,mean:m,ci95:[m-1.96*sd/Math.sqrt(xs.length),m+1.96*sd/Math.sqrt(xs.length)]};}
function choose(policy,opts,s){return policy==='fast-doubles'?chooseThird(policy,opts,s):chooseCanonical(policy,opts,s);}
function collectLate(start,limit,policy,maxScan=4000){
 const positions=[];let scanned=0,visited=0,eligible=0;
 for(let seed=start;seed<start+maxScan&&positions.length<limit;seed++){
  scanned++;let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')throw Error('initializer '+seed);
  while(!s.outcome&&s.turns<120){
   visited++;const f=s.currentPlayer,n=(f+1)%3,pair=base.pairAt(s);
   if(pair&&s.hands[f].length<=4&&s.hands[n].length<=3){
    eligible++;const live=new Set(s.hands.flat().map(key));
    const known=deck.filter(t=>!live.has(key(t)));
    positions.push({seed,turn:s.turns,focal:f,next:n,state:r.cloneRoundState(s),pair,known,discovery:policy});break;
   }
   s=r.stepRound(s,(opts,st)=>chooseCanonical(policy,opts,st));
  }
 }
 return {positions,scanned,visited,eligible};
}
function outcome(state,f,policy){
 const fin=r.runRound(state,(opts,s)=>choose(policy,opts,s),{maxTurns:200});
 if(fin.outcome.kind==='unresolved')throw Error('unresolved continuation');
 return {win:+(fin.outcome.kind==='finish'&&fin.outcome.playerIndex===f),
 pips:e.pipSum(fin.hands[f]),minus:+(fin.outcome.kind==='finish'&&fin.outcome.playerIndex===f&&fin.outcome.minus<0),
 block:+(fin.outcome.kind==='block'),turns:fin.turns};
}
function analyze(p,worlds){
 const s=p.state,snapshot=JSON.stringify(s),f=p.focal,n=p.next;
 const forbidden=[new Set(),new Set(),new Set()];
 const deltas=Object.fromEntries(policies.map(policy=>[policy,Object.fromEntries(['win','pips','minus','block','turns'].map(k=>[k,[]]))]));
 const mobility=[],nextSame=[];
 for(let j=0;j<worlds;j++){
  const seed=e.mixSeed32((p.seed+Math.imul(j+1,0x9e3779b9))>>>0);
  const w=sampler.sample(s,p.known,forbidden,seed);
  const a=r.stepRound(w,()=>p.pair.double),b=r.stepRound(w,()=>p.pair.single);
  if(a.outcome||b.outcome)throw Error('immediate finish invalid for selected pair');
  const types=z=>new Set(d.turnOptions(z.branchState,z.openingState,z.hands[n],z.stock).actions.flatMap(x=>(x.type==='single'?[x.tile]:(x.tiles||[])).map(key)));
  const at=types(a),bt=types(b);mobility.push(at.size-bt.size);
  nextSame.push(+(at.size===bt.size&&[...at].every(x=>bt.has(x))));
  for(const policy of policies){
   const x=outcome(a,f,policy),y=outcome(b,f,policy);
   for(const k of Object.keys(x))deltas[policy][k].push(x[k]-y[k]);
  }
 }
 if(JSON.stringify(s)!==snapshot)throw Error('mutated source');
 const x=p.pair.double.numbers[0];
 return {seed:p.seed,turn:p.turn,discovery:p.discovery,doubleNumber:x,
  focalHand:s.hands[f].length,nextHand:s.hands[n].length,
  support:s.hands[f].filter(t=>t[0]!==t[1]&&t.includes(x)).length,
  equalRemovedPips:e.pipSum(p.pair.double.tiles),single:key(p.pair.single.tile),worlds,
  nextMobility:mean(mobility),sameNextLegalWorlds:nextSame.reduce((a,b)=>a+b,0),
  outcomes:Object.fromEntries(policies.map(p=>[p,Object.fromEntries(Object.entries(deltas[p]).map(([k,v])=>[k,mean(v)]))]))};
}
function summary(rows){
 const groups={all:rows,focal3:rows.filter(x=>x.focalHand===3),focal4:rows.filter(x=>x.focalHand===4),
  next2:rows.filter(x=>x.nextHand===2),next3:rows.filter(x=>x.nextHand===3),
  support0:rows.filter(x=>x.support===0),support1plus:rows.filter(x=>x.support>=1),
  minDiscovery:rows.filter(x=>x.discovery==='min-hand-pips'),
  branchDiscovery:rows.filter(x=>x.discovery==='closed-branch-control')};
 const g=Object.fromEntries(Object.entries(groups).map(([name,rr])=>[name,{positions:rr.length,
  mobility:stat(rr.map(x=>x.nextMobility)),
  policies:Object.fromEntries(policies.map(p=>[p,Object.fromEntries(['win','pips','minus','block','turns'].map(k=>[k,stat(rr.map(x=>x.outcomes[p][k]))]))]))}]));
 return {groups:g,sameNextLegalWorlds:rows.reduce((s,x)=>s+x.sameNextLegalWorlds,0),
  positiveAllThree:rows.filter(x=>policies.every(p=>x.outcomes[p].win>0)).map(x=>({seed:x.seed,turn:x.turn,doubleNumber:x.doubleNumber,
   focalHand:x.focalHand,nextHand:x.nextHand,support:x.support,winDeltas:Object.fromEntries(policies.map(p=>[p,x.outcomes[p].win]))})),
  negativeAllThree:rows.filter(x=>policies.every(p=>x.outcomes[p].win<0)).length};
}
function run(minStart=1345000,branchStart=1350000,limit=60,worlds=32){
 if(limit<2||worlds<2)throw Error('invalid limits');
 const a=collectLate(minStart,Math.ceil(limit/2),'min-hand-pips');
 const b=collectLate(branchStart,Math.floor(limit/2),'closed-branch-control');
 const positions=[...a.positions,...b.positions];
 if(positions.length!==limit||new Set(positions.map(x=>x.seed)).size!==limit)throw Error('not enough distinct late positions');
 const rows=positions.map(p=>analyze(p,worlds));
 return {schema:'qosa-late-equal-pip-holdout/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9',seedSets:{minPips:[minStart,minStart+a.scanned],branchControl:[branchStart,branchStart+b.scanned]},
  scannedDeals:a.scanned+b.scanned,scannedStates:a.visited+b.visited,positions:rows.length,worldsPerPosition:worlds,
  hiddenAllocations:rows.length*worlds,candidateContinuations:rows.length*worlds*policies.length*2,
  fullStrategyRoundsAdded:0,unresolved:0,policies,
  comparison:'First late eligible state per deal: focal hand 3..4, next clockwise hand 2..3, equal discarded pips; force one double opening vs ordinary single, identical sampled hidden worlds, 3 canonical bots.',
  worldSeedFormula:'mixSeed32((dealSeed + imul(worldIndex+1,0x9e3779b9)) >>> 0)',
  limitations:'First late eligible selection, provisional branch semantics, bot-only, uniform hidden worlds not conditioned on opponent prior actions, no block winner, exploratory position intervals; post-action geometry differs, so not a causal double-opening estimate.',
  summary:summary(rows),rows};
}
function test(){
 const a=run(1345000,1350000,4,3),b=run(1345000,1350000,4,3);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.candidateContinuations!==72||a.unresolved!==0)throw Error('replay');
 if(a.rows.some(x=>x.focalHand>4||x.nextHand>3||x.focalHand<3||x.nextHand<2||
  x.equalRemovedPips!==2*x.doubleNumber))throw Error('selection/pip invariant');
 return {passed:true,positions:a.positions,continuations:a.candidateContinuations};
}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1345000),+(a[1]||1350000),+(a[2]||60),+(a[3]||32)),null,2));}
module.exports={collectLate,analyze,summary,run,test};
