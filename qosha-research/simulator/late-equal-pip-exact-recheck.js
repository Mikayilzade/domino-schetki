'use strict';
// Exhaustive recheck of late-game equal-pip X-X opening exceptions.
// node qosha-research/simulator/late-equal-pip-exact-recheck.js test
// node qosha-research/simulator/late-equal-pip-exact-recheck.js
const e=require('./engine'),r=require('./round-driver'),d=require('./turn-dispatcher');
const late=require('./late-equal-pip-holdout'),id=require('./equal-pip-identifiability');
const {chooseCanonical}=require('../runs/2026-10-20-2352-canonical-geometry');
const {chooseBy}=require('./strategy-runner');
const deck=e.createDoubleSixDeck(),key=e.tileKey;
const policies=['min-hand-pips','closed-branch-control','fast-doubles','moderate-double-hold'];
const originalExceptions=[1345275,1345728,1350085,1350420];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function combinations(n,k){let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);}
function exactWorlds(p){
 const s=p.state,f=p.focal,n=p.next,o=(f+2)%3;
 if(s.stock.length||n===o)throw Error('requires empty stock and 3 players');
 const visible=[...p.known,...s.hands[f]].map(key);
 if(new Set(visible).size!==visible.length)throw Error('duplicate known tiles');
 const used=new Set(visible),pool=deck.filter(t=>!used.has(key(t)));
 const k=s.hands[n].length,worlds=[],seen=new Set();
 if(pool.length!==k+s.hands[o].length)throw Error('hidden count mismatch');
 function emit(ids){
  const picked=new Set(ids),w=r.cloneRoundState(s);
  w.hands[n]=ids.map(i=>pool[i].slice());
  w.hands[o]=pool.filter((t,i)=>!picked.has(i)).map(t=>t.slice());
  const sig=w.hands[n].map(key).sort().join(',');
  if(seen.has(sig))throw Error('duplicate world');
  seen.add(sig);
  const all=[...p.known,...w.hands.flat()].map(key);
  if(all.length!==28||new Set(all).size!==28)throw Error('deck conservation');
  worlds.push(w);
 }
 function rec(start,ids){
  if(ids.length===k){emit(ids);return;}
  for(let j=start;j<=pool.length-(k-ids.length);j++)rec(j+1,[...ids,j]);
 }
 rec(0,[]);
 if(worlds.length!==combinations(pool.length,k))throw Error('wrong combination count');
 return worlds;
}
function actionTiles(a){return a.type==='single'?[a.tile]:(a.tiles||[]);}
function legalTypes(state,player){
 const o=d.turnOptions(state.branchState,state.openingState,state.hands[player],state.stock);
 return new Set(o.actions.flatMap(actionTiles).map(key));
}
function choose(policy,opts,s){
 if(policy==='fast-doubles')return id.choose(policy,opts,s);
 if(policy==='moderate-double-hold')return chooseBy(policy,opts,{seed:0,turns:s.turns,player:s.currentPlayer});
 return chooseCanonical(policy,opts,s);
}
function outcome(state,f,policy){
 const z=r.runRound(state,(opts,s)=>choose(policy,opts,s),{maxTurns:200});
 if(!z.outcome||z.outcome.kind==='unresolved')throw Error('unresolved continuation');
 return {win:+(z.outcome.kind==='finish'&&z.outcome.playerIndex===f),
  pips:e.pipSum(z.hands[f]),minus:+(z.outcome.kind==='finish'&&z.outcome.playerIndex===f&&z.outcome.minus<0),
  block:+(z.outcome.kind==='block'),turns:z.turns};
}
function analyze(p){
 const original=JSON.stringify(p.state),f=p.focal,n=p.next;
 const worlds=exactWorlds(p),diffs=Object.fromEntries(policies.map(policy=>[policy,[]]));
 const counts=Object.fromEntries(policies.map(policy=>[policy,{openingOnly:0,singleOnly:0,both:0,neither:0}]));
 let sameNext=0,nextMobility=0,focalMobility=0;
 for(const w of worlds){
  const a=r.stepRound(w,()=>p.pair.double),b=r.stepRound(w,()=>p.pair.single);
  if(a.outcome||b.outcome)throw Error('unexpected immediate finish');
  const an=legalTypes(a,n),bn=legalTypes(b,n);
  nextMobility+=an.size-bn.size;
  sameNext+=+(an.size===bn.size&&[...an].every(t=>bn.has(t)));
  focalMobility+=legalTypes(a,f).size-legalTypes(b,f).size;
  for(const policy of policies){
   const x=outcome(a,f,policy),y=outcome(b,f,policy),c=counts[policy];
   c[x.win?(y.win?'both':'openingOnly'):(y.win?'singleOnly':'neither')]++;
   diffs[policy].push(Object.fromEntries(Object.keys(x).map(k=>[k,x[k]-y[k]])));
  }
 }
 if(JSON.stringify(p.state)!==original)throw Error('source mutated');
 const x=p.pair.double.numbers[0],s=p.state;
 return {seed:p.seed,turn:p.turn,discovery:p.discovery,focal:f,next:n,
  hand:s.hands[f].map(key),handSizes:s.hands.map(h=>h.length),
  branchEnds:e.SIDES.map(side=>s.branchState.branches[side].end),
  openedNumbers:[...s.openingState.openedNumbers].sort((a,b)=>a-b),
  doubleNumber:x,single:key(p.pair.single.tile),equalRemovedPips:e.pipSum(p.pair.double.tiles),
  support:s.hands[f].filter(t=>t[0]!==t[1]&&t.includes(x)).length,
  exactAllocations:worlds.length,nextMobility:nextMobility/worlds.length,
  focalMobility:focalMobility/worlds.length,sameNextLegalAllocations:sameNext,
  policies:Object.fromEntries(policies.map(policy=>[policy,{
   ...Object.fromEntries(['win','pips','minus','block','turns'].map(k=>[k,mean(diffs[policy].map(x=>x[k]))])),
   ...counts[policy]}]))};
}
function stat(rows,policy,metric){
 const a=rows.map(x=>x.policies[policy][metric]),m=mean(a);
 const sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;
 return {n:a.length,mean:m,exploratoryPositionCI95:[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)]};
}
function summarize(rows){
 const ex=rows.filter(x=>originalExceptions.includes(x.seed));
 const positive3=x=>policies.slice(0,3).every(p=>x.policies[p].win>0);
 const positive4=x=>policies.every(p=>x.policies[p].win>0);
 return {positions:rows.length,exactAllocations:rows.reduce((s,x)=>s+x.exactAllocations,0),
  continuations:rows.reduce((s,x)=>s+x.exactAllocations*policies.length*2,0),
  originalExceptionSeeds:originalExceptions,
  originalExceptionsStillPositiveAllThree:ex.filter(positive3).map(x=>x.seed),
  originalExceptionsStillPositiveAllFour:ex.filter(positive4).map(x=>x.seed),
  allPositiveThree:rows.filter(positive3).map(x=>x.seed),
  allNegativeThree:rows.filter(x=>policies.slice(0,3).every(p=>x.policies[p].win<0)).length,
  nextMobility:mean(rows.map(x=>x.nextMobility)),
  focalMobility:mean(rows.map(x=>x.focalMobility)),
  policies:Object.fromEntries(policies.map(p=>[p,{win:stat(rows,p,'win'),pips:stat(rows,p,'pips'),minus:stat(rows,p,'minus'),block:stat(rows,p,'block')}])),
  exceptions:ex};
}
function collect(){
 const a=late.collectLate(1345000,30,'min-hand-pips');
 const b=late.collectLate(1350000,30,'closed-branch-control');
 if(a.positions.length!==30||b.positions.length!==30||a.scanned!==1067||b.scanned!==606)
  throw Error('position discovery drift');
 const positions=[...a.positions,...b.positions];
 if(new Set(positions.map(p=>p.seed)).size!==60)throw Error('duplicate seed');
 return {positions,seedSets:{minPips:[1345000,1345000+a.scanned],branchControl:[1350000,1350000+b.scanned]},
  scannedDeals:a.scanned+b.scanned};
}
function run(){
 const {positions,seedSets,scannedDeals}=collect();
 const rows=positions.map(analyze),summary=summarize(rows);
 return {schema:'qosa-late-equal-pip-exact-recheck/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9',seedSets,scannedDeals,positions:rows.length,exactHiddenAllocations:summary.exactAllocations,
  candidateContinuations:summary.continuations,newFullStrategyRounds:0,unresolved:0,policies,
  weighting:'Every distinct allocation of the fixed unseen pool to the two opponent hands, equally weighted within position; then equal weight per position',
  comparison:'same late reachable state, X-X opening vs equal-pip single, 3 canonical continuations plus moderate-double-hold; no MC allocation noise',
  limitations:'Uniform allocation ignores observed opponent move choices and earlier passes; original four exceptions were selected on 32 random worlds; first eligible state selection; provisional branch rules, different post-action geometry, no block winner, bot-only; exploratory position CI, no causal human rule',
  summary,rows};
}
function test(){
 const expected={1345275:20,1345728:10,1350085:20,1350420:35};
 for(const seed of originalExceptions){
  const discovery=seed<1350000?'min-hand-pips':'closed-branch-control';
  const p=late.collectLate(seed,1,discovery,1).positions[0];
  if(!p||exactWorlds(p).length!==expected[seed])throw Error('exact count regression '+seed);
  const a=analyze(p),b=analyze(p);
  if(JSON.stringify(a)!==JSON.stringify(b)||a.equalRemovedPips!==2*a.doubleNumber)throw Error('replay/pip '+seed);
 }
 return {passed:true,exceptionSeeds:originalExceptions,worldCounts:Object.values(expected)};
}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():run(),null,2));
module.exports={exactWorlds,analyze,collect,summarize,run,test};
