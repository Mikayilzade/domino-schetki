'use strict';
// Paired matched-K hidden-world outcomes. Same reachable visible state, equal discarded pips
// and K (number of distinct playable unknown stones); single vs one double opening.
// Node: node qosha-research/simulator/matched-k-outcome-runner.js test
// Node: node qosha-research/simulator/matched-k-outcome-runner.js 3620000 3630000 30 20
const e=require('./engine'),d=require('./turn-dispatcher'),init=require('./initializer');
const rd=require('./round-driver'),hidden=require('./hidden-world');
const {playableKeys}=require('./exact-playable-audit');
const {actionKey}=require('./decision-regret'),{chooseBy}=require('./strategy-runner');
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'];
function choosePair(s){
 const opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
 if(opts.phase!=='play')return null;
 const pool=s.hands.flatMap((h,p)=>p===s.currentPlayer?[]:h).concat(s.stock),rows=[];
 for(const a of opts.actions){
  if(a.type!=='single'&&!(a.type==='double-sequence'&&a.tiles.length===1))continue;
  const t=d.applyTurn(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock,a);
  if(!t.hand.length)continue;
  rows.push({a,key:actionKey(a),pips:e.pipSum(a.tiles||[a.tile]),n:t.hand.length,
   dc:t.hand.filter(x=>x[0]===x[1]).length,playable:playableKeys(t,pool)});
 }
 const pairs=[];
 for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
  let a=rows[i],b=rows[j];
  if(a.a.type===b.a.type||a.pips!==b.pips||a.n!==b.n||a.dc===b.dc||a.playable.length!==b.playable.length)continue;
  if(a.a.type!=='single'){const tmp=a;a=b;b=tmp;}
  pairs.push({single:a.key,double:b.key,K:a.playable.length,overlap:a.playable.filter(k=>b.playable.includes(k)).length});
 }
 pairs.sort((a,b)=>(a.single+'|'+a.double).localeCompare(b.single+'|'+b.double));
 return pairs[0]||null;
}
function discover(start,end,limit){
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||end<=start||!Number.isInteger(limit)||limit<1)throw Error('bad discovery arguments');
 const positions=[];let scanned=0;
 for(let seed=start;seed<end&&positions.length<limit;seed++){
  scanned++;
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;
  let passed=!!s.openingPassed;
  while(!s.outcome&&s.turns<25){
   if(s.consecutivePasses)passed=true;
   if(s.turns>=4&&!passed){
    const pair=choosePair(s);
    if(pair){positions.push({seed,turn:s.turns,phase:s.turns<=7?'early':s.turns<=14?'mid':'late',focal:s.currentPlayer,
      state:rd.cloneRoundState(s),pair});break;}
   }
   s=rd.stepRound(s,(opts,t)=>chooseBy('closed-branch-control',opts,{seed,turns:t.turns,player:t.currentPlayer}));
  }
 }
 return {scanned,positions};
}
function replyCount(world,key){
 const options=d.turnOptions(world.branchState,world.openingState,world.hands[world.currentPlayer],world.stock);
 const action=options.actions.find(a=>actionKey(a)===key);
 if(!action)throw Error('missing forced action');
 const after=d.applyTurn(world.branchState,world.openingState,world.hands[world.currentPlayer],world.stock,action);
 const next=(world.currentPlayer+1)%3;
 return d.turnOptions(after.branchState,after.openingState,world.hands[next],after.stock).actions.length;
}
function continuation(world,key,policy,seed){
 let first=true;
 const end=rd.runRound(world,(opts,s)=>{
  if(first){first=false;const action=opts.actions.find(a=>actionKey(a)===key);if(!action)throw Error('candidate changed');return action;}
  return chooseBy(policy,opts,{seed,turns:s.turns,player:s.currentPlayer});
 },{maxTurns:200});
 if(end.outcome.kind==='unresolved')throw Error('unresolved continuation');
 const focal=world.currentPlayer;
 return {win:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===focal),
  pips:e.pipSum(end.hands[focal]),
  minus:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===focal&&(end.outcome.minus||0)<0),
  block:+(end.outcome.kind==='block')};
}
function summarize(xs){
 const n=xs.length,mean=n?xs.reduce((a,b)=>a+b,0)/n:null;
 const sd=n>1?Math.sqrt(xs.reduce((a,b)=>a+(b-mean)**2,0)/(n-1)):0;
 return {n,mean,exploratoryPositionCI95:n>1?[mean-1.96*sd/Math.sqrt(n),mean+1.96*sd/Math.sqrt(n)]:null};
}
function run(start=3620000,end=3630000,limit=30,worlds=20,policies=POLICIES){
 if(!Number.isInteger(worlds)||worlds<1||worlds>1000||!Array.isArray(policies)||!policies.length)throw Error('bad worlds/policies');
 const discovery=discover(start,end,limit);
 const all=[],global={singleRestricts:0,doubleRestricts:0,equal:0,passFlips:0,bothPlay:0,bothPass:0,
  singleActions:0,doubleActions:0,uniqueAllocations:0,worlds:0,continuations:0};
 const byPolicy=Object.fromEntries(policies.map(p=>[p,{win:[],pips:[],minus:[],block:[],byMobility:{singleRestricts:[],doubleRestricts:[],equal:[]}}]));
 for(const pos of discovery.positions){
  const s=pos.state,original=JSON.stringify(s),used=new Set(s.hands.flat().concat(s.stock).map(e.tileKey));
  const spec={focalPlayer:pos.focal,focalHand:s.hands[pos.focal],
   knownTiles:e.createDoubleSixDeck().filter(t=>!used.has(e.tileKey(t))),
   hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
  const local={seed:pos.seed,turn:pos.turn,phase:pos.phase,focal:pos.focal,pair:pos.pair,
   uniqueAllocations:0,immediate:{singleRestricts:0,doubleRestricts:0,equal:0,passFlips:0,
    singleActions:0,doubleActions:0},metrics:{}};
  const allocations=new Set(),values=Object.fromEntries(policies.map(p=>[p,{win:[],pips:[],minus:[],block:[]}]));
  const expected=JSON.stringify(hidden.candidateKeys(s));
  for(let k=0;k<worlds;k++){
   const worldSeed=(1500000000+Math.imul(pos.seed,73)+k)>>>0;
   const w=hidden.sampleWorld(spec,worldSeed);
   allocations.add(JSON.stringify(w.hands.map((h,i)=>i===pos.focal?[]:h.map(e.tileKey).sort()).concat([w.stock.map(e.tileKey).sort()])));
   if(JSON.stringify(hidden.candidateKeys(w))!==expected)throw Error('candidate set changed');
   const a=replyCount(w,pos.pair.single),b=replyCount(w,pos.pair.double);
   const cat=a<b?'singleRestricts':a>b?'doubleRestricts':'equal';
   global[cat]++;local.immediate[cat]++;global.singleActions+=a;global.doubleActions+=b;
   local.immediate.singleActions+=a;local.immediate.doubleActions+=b;
   if((a>0)!==(b>0)){global.passFlips++;local.immediate.passFlips++;}
   else if(a>0)global.bothPlay++;else global.bothPass++;
   for(const policy of policies){
    const x=continuation(w,pos.pair.single,policy,worldSeed),y=continuation(w,pos.pair.double,policy,worldSeed);
    global.continuations+=2;
    const v=values[policy],g=byPolicy[policy];
    for(const metric of ['win','pips','minus','block'])v[metric].push(x[metric]-y[metric]);
    g.byMobility[cat].push(x.win-y.win);
   }
   global.worlds++;
  }
  local.uniqueAllocations=allocations.size;global.uniqueAllocations+=allocations.size;
  for(const policy of policies){
   local.metrics[policy]=Object.fromEntries(Object.entries(values[policy]).map(([metric,v])=>[metric,summarize(v).mean]));
   const v=values[policy],g=byPolicy[policy];
   for(const metric of ['win','pips','minus','block'])g[metric].push(summarize(v[metric]).mean);
  }
  if(JSON.stringify(s)!==original)throw Error('source state mutated');
  all.push(local);
 }
 const metrics=Object.fromEntries(policies.map(p=>{
  const g=byPolicy[p];
  return [p,{positionWeighted:Object.fromEntries(['win','pips','minus','block'].map(m=>[m,summarize(g[m])])),
   byNextMobility:Object.fromEntries(Object.entries(g.byMobility).map(([k,v])=>[k,summarize(v)])),
   winPositivePositions:g.win.filter(x=>x>0).length,winNegativePositions:g.win.filter(x=>x<0).length,
   winTiedPositions:g.win.filter(x=>x===0).length}];
 }));
 return {schema:'qosa-matched-k-outcomes/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  discoverySeeds:[start,end-1],scannedDeals:discovery.scanned,selectedPositions:all.length,
  selection:'first eligible state and lexicographically first single-vs-one-double pair per deal; turns 4..24, no earlier pass; equal discarded pips, remaining hand size, and distinct playable unknown stone count K',
  worldsPerPosition:worlds,worldSeedFormula:'(1500000000 + Math.imul(dealSeed,73) + worldIndex) >>> 0',
  policies,global,metrics,positions:all,
  verifiedPriorFullStrategyRounds:180000,newFullStrategyRounds:0,
  limitations:'Matched K is not matched tile identities or branch geometry. Uniform hidden allocations with replacement and no opponent-history conditioning; deterministic bots, assumed double opening, no block winner; post-action mobility is descriptive mediator, not causal adjustment. Position-level exploratory normal intervals are not pre-registered.',
  next:'Independent seed/policy replication and stratification by playable-identity overlap and next-opponent action multiplicity; verify Node CLI and branch semantics before human strategy claim.'};
}
function test(){
 const a=run(3603084,3603085,1,3,['closed-branch-control']);
 const b=run(3603084,3603085,1,3,['closed-branch-control']);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.selectedPositions!==1||a.global.worlds!==3||a.global.continuations!==6)throw Error('deterministic fixture failed');
 if(a.global.singleRestricts+a.global.doubleRestricts+a.global.equal!==3)throw Error('mobility partition failed');
 return {passed:true,fixture:3603084,worlds:3};
}
if(require.main===module){
 const args=process.argv.slice(2);
 console.log(JSON.stringify(args[0]==='test'?test():run(
  Number(args[0]||3620000),Number(args[1]||3630000),Number(args[2]||30),Number(args[3]||20)),null,2));
}
module.exports={choosePair,discover,run,test};
