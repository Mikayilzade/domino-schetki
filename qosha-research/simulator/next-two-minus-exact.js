'use strict';
// Exact next-opponent-two-tile risk, independent of continuation bots.
// Reproduce: node qosha-research/simulator/next-two-minus-exact.js 2000000 2450000 12
// Each next hand is an unordered pair from the unknown pool; all pairs are enumerated.
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner');
const {actionKey}=require('./decision-regret'),{hiddenPool}=require('./hidden-world');
const {eligible}=require('./double-connector-urgency-holdout');
const TARGETS=[0,2,4];
const sum=a=>a.reduce((s,x)=>s+x,0),mean=a=>a.length?sum(a)/a.length:null;
function positionCI(a){
 const m=mean(a),sd=a.length>1?Math.sqrt(sum(a.map(x=>(x-m)**2))/(a.length-1)):0;
 const h=1.96*sd/Math.sqrt(a.length);
 return{n:a.length,mean:m,ci95ExploratoryNormal:[m-h,m+h]};
}
function findPosition(seed){
 let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
 if(s.kind!=='ready')return null;
 while(!s.outcome&&s.turns<100){
  const choices=eligible(s);
  if(choices.length){
   if(s.hands[(s.currentPlayer+1)%3].length!==2)return null;
   return{seed,state:r.cloneRoundState(s),choices};
  }
  s=r.stepRound(s,(opts,st)=>chooseBy('closed-branch-control',opts,{seed,turns:st.turns,player:st.currentPlayer}));
 }
 return null;
}
function collect(start,end,quota){
 const byTarget=Object.fromEntries(TARGETS.map(x=>[x,[]]));
 let scanned=0,eligibleNextTwo=0;
 for(let seed=start;seed<end;seed++){
  if(seed%17!==0)continue;scanned++;
  const pos=findPosition(seed);if(!pos)continue;eligibleNextTwo++;
  const c=pos.choices.find(c=>byTarget[c.x].length<quota);
  if(c)byTarget[c.x].push({seed:pos.seed,state:pos.state,choice:c});
  if(TARGETS.every(x=>byTarget[x].length>=quota))break;
 }
 const positions=TARGETS.flatMap(x=>byTarget[x]);
 if(positions.length!==TARGETS.length*quota)throw Error('insufficient positions: '+JSON.stringify(Object.fromEntries(TARGETS.map(x=>[x,byTarget[x].length]))));
 return{positions,scanned,eligibleNextTwo,selectedSeedsByTarget:Object.fromEntries(TARGETS.map(x=>[x,byTarget[x].map(p=>p.seed)]))};
}
function forced(s,key){
 return r.stepRound(s,opts=>{
  const a=opts.actions.find(a=>actionKey(a)===key);
  if(!a)throw Error('forced candidate missing');return a;
 });
}
function immediateMinus(s){
 if(s.outcome)return[];
 const hand=s.hands[s.currentPlayer],opts=d.turnOptions(s.branchState,s.openingState,hand,s.stock);
 if(opts.phase!=='play')return[];
 return opts.actions.filter(a=>{
  const tiles=a.tiles||[a.tile].filter(Boolean);
  if(tiles.length!==hand.length)return false;
  const last=a.type==='mixed-finish'?a.finishDoubles:a.type==='double-sequence'?a.tiles:[];
  return e.finishMinus(last)<0;
 }).map(a=>({type:a.type,minus:e.finishMinus(a.type==='mixed-finish'?a.finishDoubles:a.tiles),tiles:(a.tiles||[a.tile]).map(e.tileKey)}));
}
function analyze(pos){
 const {seed,state:s,choice:c}=pos,f=s.currentPlayer,next=(f+1)%3,other=(f+2)%3;
 if(s.hands[next].length!==2||s.stock.length)throw Error('next-two/empty-stock gate');
 const before=JSON.stringify(s),unknown=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
 const known=e.createDoubleSixDeck().filter(t=>!unknown.has(e.tileKey(t)));
 const pool=hiddenPool({focalHand:s.hands[f],knownTiles:known});
 if(pool.length!==s.hands[next].length+s.hands[other].length)throw Error('unknown pool mismatch');
 const counts={total:0,doubleMinus:0,connectorMinus:0,doubleOnly:0,connectorOnly:0,both:0,mixedMinus:0,minus20:0};
 const examples=[];
 for(let i=0;i<pool.length;i++)for(let j=i+1;j<pool.length;j++){
  const w=r.cloneRoundState(s);
  w.hands[next]=[pool[i],pool[j]];
  w.hands[other]=pool.filter((_,k)=>k!==i&&k!==j);
  const afterDouble=forced(w,c.doubleKey),afterConnector=forced(w,c.connectorKey);
  if(afterDouble.currentPlayer!==next||afterConnector.currentPlayer!==next)throw Error('turn-order mismatch');
  const da=immediateMinus(afterDouble),ca=immediateMinus(afterConnector);
  const a=da.length>0,b=ca.length>0;counts.total++;
  counts.doubleMinus+=+a;counts.connectorMinus+=+b;counts.doubleOnly+=+(a&&!b);
  counts.connectorOnly+=+(!a&&b);counts.both+=+(a&&b);
  counts.mixedMinus+=+(da.some(z=>z.type==='mixed-finish'));
  counts.minus20+=+(da.some(z=>z.minus===-20));
  if((a!==b)&&examples.length<5)examples.push({nextHand:[e.tileKey(pool[i]),e.tileKey(pool[j])],afterDouble:da,afterConnector:ca});
 }
 if(counts.total!==pool.length*(pool.length-1)/2)throw Error('not exhaustive');
 if(JSON.stringify(s)!==before)throw Error('source state mutated');
 return{seed,target:c.x,turn:s.turns,focal:f,hand:s.hands[f].map(e.tileKey),handSize:c.handSize,
  opponentSizes:c.opponentSizes,ends:e.SIDES.map(side=>s.branchState.branches[side].end),
  opened:[...s.openingState.openedNumbers].sort((a,b)=>a-b),connector:c.connector,
  hiddenPoolSize:pool.length,knownTileCount:known.length,counts,
  exactNextHandMinusRiskDouble:counts.doubleMinus/counts.total,
  exactNextHandMinusRiskConnector:counts.connectorMinus/counts.total,
  exactRiskDifference:(counts.doubleMinus-counts.connectorMinus)/counts.total,examples};
}
function selfTest(){
 const p=findPosition(2000271);
 if(!p||!p.choices.some(c=>c.x===0))throw Error('fixture selection');
 const row=analyze({seed:p.seed,state:p.state,choice:p.choices.find(c=>c.x===0)});
 if(row.counts.total!==10||row.counts.doubleOnly!==2||row.counts.connectorOnly!==0||row.counts.mixedMinus!==2)throw Error('exact fixture mismatch');
 return{passed:true,seed:2000271,enumerated:row.counts.total,doubleOnly:row.counts.doubleOnly};
}
function run(start=2000000,end=2450000,quota=12){
 if(![start,end,quota].every(Number.isInteger)||end<=start||quota<1)throw Error('bad parameters');
 const test=selfTest(),col=collect(start,end,quota),rows=col.positions.map(analyze),total=sum(rows.map(x=>x.counts.total));
 const byTarget=Object.fromEntries(TARGETS.map(x=>[x,positionCI(rows.filter(z=>z.target===x).map(z=>z.exactRiskDifference))]));
 return{schema:'qosa-exact-next-two-minus/v1',
  timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',seedStart:start,seedEndExclusive:end,
  seedFilter:'seed%17===0; first eligible reachable position per seed; next clockwise player exactly two stones',
  discoveryPolicy:'closed-branch-control',comparison:'force unopened X-X versus legal X-Y connector to unopened X',
  continuationPolicies:'none: exact next-turn legal action enumeration, not rollout',
  quotaPerTarget:quota,selectedSeedsByTarget:col.selectedSeedsByTarget,scannedDealSeeds:col.scanned,
  eligibleNextTwoSeedsSeen:col.eligibleNextTwo,positions:rows.length,fullStrategyRounds:0,
  exactNextHandAllocations:total,matchedForcedFirstActions:2*total,
  totals:{doubleOnly:sum(rows.map(x=>x.counts.doubleOnly)),connectorOnly:sum(rows.map(x=>x.counts.connectorOnly)),
   doubleMinus:sum(rows.map(x=>x.counts.doubleMinus)),connectorMinus:sum(rows.map(x=>x.counts.connectorMinus)),
   mixedMinus:sum(rows.map(x=>x.counts.mixedMinus)),minus20:sum(rows.map(x=>x.counts.minus20)),
   positionsWithExtraRisk:rows.filter(x=>x.exactRiskDifference>0).length,
   positionsWithLessRisk:rows.filter(x=>x.exactRiskDifference<0).length,
   positionsWithNoChange:rows.filter(x=>x.exactRiskDifference===0).length,
   pooledExactDifference:sum(rows.map(x=>x.counts.doubleOnly-x.counts.connectorOnly))/total},
  equalPositionRiskDifference:positionCI(rows.map(x=>x.exactRiskDifference)),byTarget,
  validation:test,rows,previousCumulative:{matchedStrategyRounds:180000,creditedHiddenWorlds:98490},
  limitations:['Exact only conditional on each fixed visible position and uniform unknown next-two subset; selected positions not representative of all games',
   'Next-hand allocations are marginal combinations, NOT independent full hidden worlds and are not added to historical hidden-world totals',
   'Assumed branch locking/opening from recovered qosa-1.0.0; 5-player and loneZero unvalidated',
   'First-eligible position/seed%17/target quota bias; exploratory position-level CI, not causal inference',
   'No continuation policy, official block winner or future-turn strategy inference; V8 CommonJS harness, Node CLI pending'],
  nextHypothesis:'Prove or falsify immediate legal-action inclusion for X-X vs X-Y in all reachable states; then test whether early double opening can improve longer-run win rate despite nonnegative immediate minus exposure on disjoint matched seeds.'};
}
if(require.main===module){
 const [start=2000000,end=2450000,quota=12]=process.argv.slice(2).map(Number);
 console.log(JSON.stringify(run(start,end,quota),null,2));
}
module.exports={findPosition,collect,immediateMinus,analyze,selfTest,run};
