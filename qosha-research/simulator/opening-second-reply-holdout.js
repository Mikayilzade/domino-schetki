'use strict';
// Independent deterministic, stratified opening holdout, 3x9, first-round 1-1.
// Uses the previously validated exhaustive two-opponent-turn evaluator.
// Run: node qosha-research/simulator/opening-second-reply-holdout.js
// No full-round or match-scoring claim; opponent single-tile policies only.
const assert=require('assert');
const {shuffledDeck,mixSeed32,tileKey}=require('./engine');
const {analyseFixture}=require('./opening-second-reply-exact');

function selectFixtures(dealStart=2904520,dealCount=20000,perStratum=2){
  const buckets={};let validDeals=0,eligibleDeals=0;
  for(let seed=dealStart;seed<dealStart+dealCount;seed++){
    const d=shuffledDeck(seed),idx=d.findIndex(t=>t[0]===1&&t[1]===1);
    if(idx===27)continue;
    validDeals++;
    const from=9*Math.floor(idx/9);
    const hand=d.slice(from,from+9).filter(t=>!(t[0]===1&&t[1]===1));
    hand.push(d[27]);
    assert.equal(hand.length,9);
    assert.equal(new Set(hand.map(tileKey)).size,9);
    const connectors=hand.filter(t=>t[0]!==t[1]&&t.includes(1)).map(t=>t[0]===1?t[1]:t[0]);
    const c=connectors.length;
    if(c<2||c>4)continue;
    const owned=connectors.filter(x=>hand.some(t=>t[0]===x&&t[1]===x));
    const unowned=connectors.filter(y=>!hand.some(t=>t[0]===y&&t[1]===y));
    if(!owned.length||!unowned.length)continue;
    eligibleDeals++;
    const best={};
    for(const x of owned)for(const y of unowned){
      const gap=Math.abs(y-x);
      const stratum='c'+c+'-'+(gap<=2?'small':'large')+'-'+(y>x?'Y>X':'Y<X');
      const priority=mixSeed32((seed^(x<<8)^(y<<16)^(c<<24)^0x51af29e3)>>>0);
      if(!best[stratum]||priority<best[stratum].priority)
        best[stratum]={name:'holdout-'+seed+'-'+x+'-'+y,seed,hand,x,y,c,stratum,priority};
    }
    for(const f of Object.values(best))(buckets[f.stratum]??=[]).push(f);
  }
  const used=new Set(),selected=[];
  for(const stratum of Object.keys(buckets).sort()){
    buckets[stratum].sort((a,b)=>a.priority-b.priority||a.seed-b.seed||a.x-b.x||a.y-b.y);
    let count=0;
    for(const f of buckets[stratum])if(!used.has(f.seed)){
      selected.push(f);used.add(f.seed);
      if(++count===perStratum)break;
    }
    assert.equal(count,perStratum,'insufficient stratum: '+stratum);
  }
  assert.equal(selected.length,24);
  assert.equal(new Set(selected.map(f=>f.seed)).size,24);
  return {selected,validDeals,eligibleDeals};
}

function run(){
  const dealStart=2904520,dealCount=20000;
  const {selected,validDeals,eligibleDeals}=selectFixtures(dealStart,dealCount);
  const fixtures=selected.map(analyseFixture);
  const metrics=['firstPass','secondPass','bothPass','shed','moves','firstDouble','secondDouble'];
  const totals={};
  for(const policy of ['high','low']){
    const delta={};
    for(const m of metrics)delta[m]=fixtures.reduce((sum,f)=>sum+f.results[policy].delta[m],0)/fixtures.length;
    const immediatePipDifference=selected.reduce((sum,f)=>sum+f.x-f.y,0)/selected.length;
    totals[policy]={n:fixtures.length*48620,delta,
      immediatePipDifference,netPipProxyDelta:immediatePipDifference-delta.shed};
    assert(Math.abs(delta.firstPass-0.07352941176470588)<1e-12);
    for(const f of fixtures)assert.equal(f.results[policy].modelDisagreements,0);
  }
  // Independent pure-JS calculation (same fixture selection, separate action evaluator)
  // produced these regression targets before this wrapper was committed.
  assert(Math.abs(totals.high.delta.secondPass-0.0512186343068696)<1e-10);
  assert(Math.abs(totals.low.delta.secondPass-0.04236425339366516)<1e-10);
  assert(Math.abs(totals.high.delta.shed+2.8097362196626903)<1e-10);
  assert(Math.abs(totals.low.delta.shed-0.11149132730015084)<1e-10);
  const counts={};for(const f of selected)counts[f.stratum]=(counts[f.stratum]||0)+1;
  assert.equal(Object.keys(counts).length,12);
  assert(Object.values(counts).every(n=>n===2));
  return {schema:'qosha-opening-second-reply-holdout/v1',
    timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',
    engine:'qosa-research-0.5.3 + opening-second-reply-holdout-1.0',
    rules:'recovered qosa-1.0.0, first-round 3x9 opening; optional multi-double declined; late-arrival branch models provisional',
    dealSeeds:[dealStart,dealStart+dealCount-1],newSeededDeals:dealCount,validDeals,eligibleDeals,
    selectedHands:selected.length,selectedSeeds:selected.map(f=>f.seed),strata:counts,
    exactOpponentPartitions:selected.length*48620,newRandomHiddenAllocations:0,
    newCompleteRounds:0,newForcedContinuations:0,
    strategies:['1-X retaining owned X-X','1-Y with Y-Y unowned'],
    opponentPolicies:['high-pip legal single tile','low-pip legal single tile'],
    totals,fixtures,
    validation:'C(18,9) exact opponent partitions per hand; independent first-pass combinatorial formula and second-legal mask; both provisional branch models evaluated exhaustively; 28-tile conservation; deterministic seed and priority holdout selection; independent regression targets.',
    limitations:['Balanced 24 selected hands are not population-weighted','Different connector pips and branch geometry confound ownership','Two opponent turns only, no actual win, minus, block or full-game regret','Human policies, late-arrival branch unlocking, blocked ties, loneZero, 101 scoring unverified'],
    nextAction:'Study reversal cases and third-turn return mobility on these same hands; authenticate physical late-arrival and block-tie fixtures before full-round rankings.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={selectFixtures,run};
