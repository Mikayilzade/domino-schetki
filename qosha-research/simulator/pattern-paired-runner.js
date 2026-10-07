'use strict';
// Deterministic, reachable-state, fixed-visible paired pattern experiment.
// Run: node qosha-research/simulator/pattern-paired-runner.js 0 30 10 100
// Holdout: node qosha-research/simulator/pattern-paired-runner.js 30 80 10 100
// The four arguments are startSeed, endSeedExclusive, positionLimit, worldsPerPosition.
const e=require('./engine');
const d=require('./turn-dispatcher');
const r=require('./round-driver');
const init=require('./initializer');
const {chooseBy}=require('./strategy-runner');
const {actionKey}=require('./decision-regret');
const {runHiddenWorlds}=require('./hidden-world');
const {comparableChoices}=require('./pattern-choice-classifier');

function eligibleGroups(state){
  const hand=state.hands[state.currentPlayer];
  if(hand.length<4||hand.length>8||state.stock.length!==0)return [];
  const opts=d.turnOptions(state.branchState,state.openingState,hand,state.stock);
  if(opts.phase!=='play'||opts.drawn)return [];
  return comparableChoices(hand,opts.actions).map(g=>({
    number:g.number,
    // Isolate one X-X from multi-double tempo; compare only against legal singles
    // that retain X-X and at least one X-Y connector.
    spend:g.spendDouble.filter(x=>x.action.type==='double-sequence'&&x.action.tiles.length===1)
      .map(x=>actionKey(x.action)),
    preserve:g.preservePair.filter(x=>x.action.type==='single')
      .map(x=>actionKey(x.action))
  })).filter(g=>g.spend.length&&g.preserve.length);
}

function firstEligible(seed){
  let state=init.initializeThreePlayerRound({
    seed,isFirstRound:false,previousWinnerIndex:seed%3
  });
  if(state.kind!=='ready')return null;
  while(!state.outcome&&state.turns<100){
    const groups=eligibleGroups(state);
    if(groups.length){
      // In a simulated round we know the actual played tiles. In a real
      // position they MUST instead be supplied from visible move history.
      const hidden=new Set([...state.hands.flat(),...state.stock].map(e.tileKey));
      const knownTiles=e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t)));
      return {seed,turn:state.turns,focal:state.currentPlayer,
        state:r.cloneRoundState(state),knownTiles,group:groups[0]};
    }
    state=r.stepRound(state,(opts,s)=>chooseBy('closed-branch-control',opts,{
      seed,turns:s.turns,player:s.currentPlayer
    }));
  }
  return null;
}
function mean(xs){return xs.reduce((a,b)=>a+b,0)/xs.length;}
function summary(xs){
  const m=mean(xs),sd=xs.length>1?
    Math.sqrt(xs.reduce((a,x)=>a+(x-m)*(x-m),0)/(xs.length-1)):0;
  const half=1.96*sd/Math.sqrt(xs.length);
  return {mean:m,ci95NormalApprox:[m-half,m+half]};
}
function analyzePosition(pos,{worldsPerPosition=100,worldSeedBase=700000,maxTurns=200}={}){
  const s=pos.state;
  const spec={focalPlayer:pos.focal,focalHand:s.hands[pos.focal],
    knownTiles:pos.knownTiles,hiddenHandSizes:s.hands.map(x=>x.length),
    stockSize:s.stock.length,visibleState:s};
  const worldStart=worldSeedBase+pos.seed*1000;
  const out=runHiddenWorlds(spec,{count:worldsPerPosition,startSeed:worldStart,
    continuationStrategy:'closed-branch-control',maxTurns});
  const paired=out.results.map(world=>{
    const byKey=new Map(world.candidates.map(row=>[row.actionKey,row]));
    const avg=(keys,metric)=>mean(keys.map(key=>{
      const row=byKey.get(key);
      if(!row||row.outcome==='unresolved')throw new Error('missing/unresolved candidate '+key);
      return metric(row);
    }));
    return {
      finishFirst:avg(pos.group.preserve,x=>+x.focalFinishedFirst)
        -avg(pos.group.spend,x=>+x.focalFinishedFirst),
      remainderPips:avg(pos.group.preserve,x=>x.focalRemainder)
        -avg(pos.group.spend,x=>x.focalRemainder),
      minusFinish:avg(pos.group.preserve,x=>+(x.focalMinus<0))
        -avg(pos.group.spend,x=>+(x.focalMinus<0))
    };
  });
  return {seed:pos.seed,turn:pos.turn,focal:pos.focal,target:pos.group.number,
    hand:s.hands[pos.focal].map(e.tileKey),handSizes:s.hands.map(x=>x.length),
    knownCount:pos.knownTiles.length,worldStart,worlds:out.worldCount,
    spendKeys:pos.group.spend,preserveKeys:pos.group.preserve,
    deltaPreserveMinusSpend:{
      finishFirst:summary(paired.map(x=>x.finishFirst)),
      remainderPips:summary(paired.map(x=>x.remainderPips)),
      minusFinish:summary(paired.map(x=>x.minusFinish))
    }};
}
function runExperiment({startSeed=0,endSeed=30,positionLimit=10,
  worldsPerPosition=100,worldSeedBase=700000,maxTurns=200}={}){
  const positions=[];
  for(let seed=startSeed;seed<endSeed&&positions.length<positionLimit;seed++){
    const pos=firstEligible(seed);
    if(pos)positions.push(analyzePosition(pos,{worldsPerPosition,worldSeedBase,maxTurns}));
  }
  const agg={};
  for(const metric of ['finishFirst','remainderPips','minusFinish']){
    agg[metric]=positions.length?
      summary(positions.map(p=>p.deltaPreserveMinusSpend[metric].mean)):null;
  }
  return {schema:'qosa-pattern-paired/v1',engine:'qosa-research-0.5.3',
    recoveredRules:'qosa-1.0.0',mode:'3x9',startSeed,endSeed,positionLimit,
    selectedSeeds:positions.map(x=>x.seed),positionCount:positions.length,
    newCompletedStrategyRounds:0,hiddenWorldCount:positions.length*worldsPerPosition,
    worldSeedFormula:'700000 + 1000 * dealSeed + worldIndex',
    stateSelection:'first eligible reachable state per deal seed; hand 4..8; stock empty',
    comparison:'one legal X-X double vs equally weighted legal single moves preserving X-X plus X-Y',
    continuationStrategy:'closed-branch-control',maxTurns,
    aggregateEqualPositionWeight:agg,positions,
    limitations:'one deterministic opponent policy; state selection biased toward first eligible; class averages are not optimized policies; normal CI approximate and positions limited; not a causal pattern-specific effect'};
}
if(require.main===module){
  const [startSeed=0,endSeed=30,positionLimit=10,worldsPerPosition=100]=
    process.argv.slice(2).map(Number);
  console.log(JSON.stringify(runExperiment({startSeed,endSeed,positionLimit,
    worldsPerPosition}),null,2));
}
module.exports={eligibleGroups,firstEligible,analyzePosition,runExperiment};
