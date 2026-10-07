'use strict';
// Reproducible pattern-vs-control paired hidden-world comparison.
// node qosha-research/simulator/pattern-control-runner.js 100 400 12 40
const e=require('./engine'), d=require('./turn-dispatcher'), r=require('./round-driver');
const init=require('./initializer'), {chooseBy}=require('./strategy-runner');
const {actionKey}=require('./decision-regret'), {runHiddenWorlds}=require('./hidden-world');
const {numberCounts}=require('./pattern-features');
function avg(a){return a.reduce((s,x)=>s+x,0)/a.length;}
function summary(a){if(!a.length)return null;const m=avg(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0,half=a.length>1?1.96*sd/Math.sqrt(a.length):null;return {n:a.length,mean:m,ci95NormalApprox:half===null?null:[m-half,m+half]};}
function groups(state){
 const hand=state.hands[state.currentPlayer];
 if(hand.length<4||hand.length>8||state.stock.length)return [];
 const o=d.turnOptions(state.branchState,state.openingState,hand,state.stock);
 if(o.phase!=='play'||o.drawn)return [];
 const counts=numberCounts(hand),out=[];
 for(let x=0;x<=6;x++){
  if(!hand.some(t=>t[0]===x&&t[1]===x))continue;
  const connectors=hand.filter(t=>(t[0]===x||t[1]===x)&&t[0]!==t[1]);
  if(!connectors.length)continue;
  const spend=o.actions.filter(a=>a.type==='double-sequence'&&a.tiles.length===1&&a.tiles[0][0]===x).map(actionKey);
  const preserve=o.actions.filter(a=>{
   if(a.type!=='single')return false;
   const remaining=hand.filter((_,i)=>i!==a.handIndex);
   return remaining.some(t=>t[0]===x&&t[1]===x)&&remaining.some(t=>t[0]!==t[1]&&(t[0]===x||t[1]===x));
  }).map(actionKey);
  if(spend.length&&preserve.length)out.push({number:x,xTiles:counts[x],connectors:connectors.length,
    kind:counts[x]>=3?'pattern3plus':'control2',spend,preserve});
 }
 return out;
}
function collect(start,end,limit){
 const found={pattern3plus:[],control2:[]};
 for(let seed=start;seed<end;seed++){
  if(Object.values(found).every(a=>a.length>=limit))break;
  let state=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(state.kind!=='ready')continue;
  while(!state.outcome&&state.turns<100){
   const gs=groups(state);
   for(const kind of ['pattern3plus','control2']){
    if(found[kind].length>=limit||found[kind].some(p=>p.seed===seed))continue;
    const g=gs.find(x=>x.kind===kind);
    if(!g)continue;
    const hidden=new Set([...state.hands.flat(),...state.stock].map(e.tileKey));
    found[kind].push({seed,turn:state.turns,focal:state.currentPlayer,group:g,
      state:r.cloneRoundState(state),knownTiles:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t)))});
   }
   if(Object.values(found).every(a=>a.length>=limit))break;
   state=r.stepRound(state,(opts,s)=>chooseBy('closed-branch-control',opts,{seed,turns:s.turns,player:s.currentPlayer}));
  }
 }
 return found;
}
function analyze(pos,worlds,policy){
 const s=pos.state;
 const spec={focalPlayer:pos.focal,focalHand:s.hands[pos.focal],knownTiles:pos.knownTiles,
   hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 const startSeed=980000+pos.seed*1000;
 const data=runHiddenWorlds(spec,{count:worlds,startSeed,continuationStrategy:policy,maxTurns:200});
 const deltas=[];
 for(const world of data.results){
  const map=new Map(world.candidates.map(x=>[x.actionKey,x]));
  const metric=(keys,f)=>{
   const rows=keys.map(k=>map.get(k));
   if(rows.some(x=>!x||x.outcome==='unresolved'))throw new Error('unresolved/missing candidate');
   return avg(rows.map(f));
  };
  deltas.push({
   finishFirst:metric(pos.group.preserve,x=>+x.focalFinishedFirst)-metric(pos.group.spend,x=>+x.focalFinishedFirst),
   remainderPips:metric(pos.group.preserve,x=>x.focalRemainder)-metric(pos.group.spend,x=>x.focalRemainder),
   minusFinish:metric(pos.group.preserve,x=>+(x.focalMinus<0))-metric(pos.group.spend,x=>+(x.focalMinus<0))
  });
 }
 const means=Object.fromEntries(['finishFirst','remainderPips','minusFinish'].map(m=>[m,avg(deltas.map(x=>x[m]))]));
 return {seed:pos.seed,turn:pos.turn,seat:pos.focal,target:pos.group.number,
  xTiles:pos.group.xTiles,connectorCount:pos.group.connectors,
  handSize:s.hands[pos.focal].length,opponentHandSizes:s.hands.map((h,i)=>i===pos.focal?null:h.length),
  branchEnds:e.SIDES.map(side=>s.branchState.branches[side].end),recentPasses:s.consecutivePasses,
  spendKeys:pos.group.spend,preserveKeys:pos.group.preserve,
  hiddenWorldStart:startSeed,worlds,deltaPreserveMinusSpend:means};
}
function run({startSeed=100,endSeed=400,limit=12,worlds=40}={}){
 const positions=collect(startSeed,endSeed,limit),out={};
 for(const kind of ['pattern3plus','control2']){
  out[kind]={};
  for(const policy of ['closed-branch-control','min-hand-pips']){
   const rows=positions[kind].map(p=>analyze(p,worlds,policy));
   out[kind][policy]={positionCount:rows.length,hiddenWorlds:rows.length*worlds,
    metrics:Object.fromEntries(['finishFirst','remainderPips','minusFinish'].map(m=>[m,summary(rows.map(x=>x.deltaPreserveMinusSpend[m]))])),positions:rows};
  }
 }
 const contrast={};
 for(const policy of ['closed-branch-control','min-hand-pips']){
  contrast[policy]={};
  for(const m of ['finishFirst','remainderPips','minusFinish']){
   const a=out.pattern3plus[policy].metrics[m],b=out.control2[policy].metrics[m];
   contrast[policy][m]=a&&b?a.mean-b.mean:null;
  }
 }
 return {schema:'qosa-pattern-control/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9',startSeed,endSeed,limit,worldsPerPosition:worlds,
  seedFormula:'980000 + 1000*dealSeed + worldIndex',policies:['closed-branch-control','min-hand-pips'],
  selection:'first reachable eligible state per kind per seed, stock empty, hand 4..8, rollout closed-branch-control',
  comparison:'one legal X-X opening vs equally weighted legal singles preserving X-X plus X-Y; pattern has >=3 X tiles, control exactly 2 X tiles',
  outcomes:'paired identical hidden worlds for each candidate and policy, equal position weights, position-level approximate CI',
  newCompletedStrategyRounds:0,hiddenWorldCount:Object.values(out).reduce((n,group)=>n+Object.values(group).reduce((a,p)=>a+p.hiddenWorlds,0),0),
  groupContrastPatternMinusControl:contrast,groups:out,
  limitations:'not random treatment; control and pattern are different states; first-eligible selection; one deterministic discovery policy; small position samples; branch semantics assumption-labelled; cannot infer causality'};
}
if(require.main===module){
 const [startSeed=100,endSeed=400,limit=12,worlds=40]=process.argv.slice(2).map(Number);
 console.log(JSON.stringify(run({startSeed,endSeed,limit,worlds}),null,2));
}
module.exports={groups,collect,analyze,run};