'use strict';
// Derived decomposition of exact return-mobility results; NO new hidden worlds.
// Reproduce: node qosha-research/simulator/opening-ordinary-mobility-audit.js [test]
// Full mode reruns the previously selected 24 x C(18,9) exact partitions.
const assert=require('assert');
const {run:originalRun}=require('./opening-third-return-exact');
const approx=(a,b,tol=0.00015)=>Math.abs(a-b)<tol;
function smoke(){
  const fixtures=[
    {tiles:4,doubles:1,ordinary:3},
    {tiles:2,doubles:2,ordinary:0},
    {tiles:0,doubles:0,ordinary:0}
  ];
  for(const f of fixtures)assert.equal(f.tiles-f.doubles,f.ordinary);
  assert(approx(0.7611-1.0096,-0.2485));
  assert(approx(0.7306-1.0073,-0.2767));
  return {passed:true,scope:'algebra and published four-decimal checkpoint only; run full command for independent recomputation'};
}
function audit(){
  const prior=originalRun();
  assert.equal(prior.exactPartitions,1166880);
  assert.equal(prior.selectedHands,24);
  const results={};
  for(const policy of ['high','low']){
    const g=prior.results[policy+'-global'],c=prior.results[policy+'-current'];
    assert.equal(g.n,24*48620);
    const ordinary={
      own:g.own.legalTiles-g.own.legalDoubles,
      unowned:g.unowned.legalTiles-g.unowned.legalDoubles,
      delta:g.delta.legalTiles-g.delta.legalDoubles
    };
    assert(ordinary.own>=0&&ordinary.unowned>=0);
    assert(approx(ordinary.delta,policy==='high'?-0.2485:-0.2767));
    assert(approx(g.delta.legalDoubles,policy==='high'?1.0096:1.0073));
    for(const m of ['legalTiles','legalDoubles','legalActions','firstPass','secondPass'])
      assert(Math.abs(g.delta[m]-c.delta[m])<1e-12,'provisional model mismatch: '+policy+'/'+m);
    const perHand=g.perHand.map(f=>({
      seed:f.seed,c:f.c,x:f.x,y:f.y,
      ordinaryDelta:f.legalTiles-f.legalDoubles,
      doubleDelta:f.legalDoubles,totalLegalTileDelta:f.legalTiles,
      secondOpponentPassDelta:f.secondPass
    }));
    for(const f of perHand)
      assert(Math.abs(f.ordinaryDelta+f.doubleDelta-f.totalLegalTileDelta)<1e-12);
    const avg=perHand.reduce((s,f)=>s+f.ordinaryDelta,0)/perHand.length;
    assert(Math.abs(avg-ordinary.delta)<1e-12);
    results[policy]={
      nConditionalPartitions:g.n,selectedHands:perHand.length,
      distinctPlayableTilesDelta:g.delta.legalTiles,
      playableDoubleTilesDelta:g.delta.legalDoubles,
      playableOrdinaryTilesDelta:ordinary.delta,
      ordinaryMeanByArm:{ownedDoubleConnector:ordinary.own,unownedDoubleConnector:ordinary.unowned},
      hands:{ordinaryPositive:perHand.filter(f=>f.ordinaryDelta>1e-12).length,
        ordinaryNegative:perHand.filter(f=>f.ordinaryDelta< -1e-12).length,
        ordinaryTied:perHand.filter(f=>Math.abs(f.ordinaryDelta)<=1e-12).length},
      perHand
    };
  }
  return {
    schema:'qosha-opening-ordinary-return-decomposition/v1',
    timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',
    engine:'qosa-research-0.5.3+ordinary-return-decomposition-1.0',
    rules:'recovered qosa-1.0.0 3x9 first-round 1-1; late-arrival models PROVISIONAL',
    reusedDealSeeds:[2904520,2924519],reusedSelectedHands:24,
    reusedExactPartitions:1166880,newSeededDeals:0,newRandomHiddenWorlds:0,
    newCompleteRounds:0,newForcedContinuations:0,
    comparedMoves:['1-X retaining owned X-X','1-Y with Y-Y unowned'],
    opponentPolicies:['highest-pip legal single tile','lowest-pip legal single tile'],
    results,
    finding:'The reported positive distinct-tile return mobility is entirely due to playable doubles; ordinary non-double tile mobility decreases on average.',
    limitations:['Reanalysis of existing exact partitions, not new samples','24 selected hands, not population-weighted','Provisional branch models and artificial opponent policies','No first-place, minus, block or decision-regret evidence'],
    nextAction:'Measure conditional consequences of playing the newly available double versus a legal ordinary move on matched worlds; first authenticate late-arrival and blocked ties.'
  };
}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?smoke():audit(),null,2));
module.exports={smoke,audit};
