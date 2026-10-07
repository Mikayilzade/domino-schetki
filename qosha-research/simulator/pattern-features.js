'use strict';

const e=require('./engine');

function isDouble(t){return t[0]===t[1];}

function numberCounts(hand){
  const counts=Array(7).fill(0);
  for(const [a,b] of hand){
    counts[a]++;
    if(b!==a)counts[b]++;
  }
  return counts;
}

function doubleNumbers(hand){
  return hand.filter(isDouble).map(t=>t[0]).sort((a,b)=>a-b);
}

function connectorPairs(hand){
  return hand.filter(t=>!isDouble(t)).map(t=>e.canonicalTile(t[0],t[1]));
}

function repeatedNumberStructures(hand){
  const counts=numberCounts(hand),doubles=new Set(doubleNumbers(hand));
  const connectors=connectorPairs(hand);
  const out=[];
  for(let x=0;x<=6;x++){
    if(counts[x]<3||!doubles.has(x))continue;
    const linked=connectors.filter(([a,b])=>a===x||b===x);
    out.push({
      number:x,
      tileCount:counts[x],
      connectorCount:linked.length,
      connectors:linked.map(e.tileKey).sort()
    });
  }
  return out;
}

function doubleChains(hand){
  const doubles=new Set(doubleNumbers(hand)),out=[];
  for(const [a,b] of connectorPairs(hand)){
    if(doubles.has(a)&&doubles.has(b))out.push({a,b,connector:e.tileKey([a,b])});
  }
  return out.sort((x,y)=>x.a-y.a||x.b-y.b);
}

function branchEnds(branchState){
  return e.SIDES.filter(s=>branchState.branches[s].active).map(s=>branchState.branches[s].end);
}

function controllableEnds(hand,branchState,openingState){
  const ends=branchEnds(branchState),seen=new Set();
  for(const tile of hand){
    for(const n of tile){
      if(!e.isNumberOpened(openingState,n))continue;
      if(ends.includes(n))seen.add(n);
    }
  }
  return [...seen].sort((a,b)=>a-b);
}

function stateFeatures(state,playerIndex=state.currentPlayer){
  const hand=state.hands[playerIndex];
  return {
    playerIndex,
    handSize:hand.length,
    opponentHandSizes:state.hands.map((h,i)=>i===playerIndex?null:h.length),
    handPips:e.pipSum(hand),
    doubleCount:hand.filter(isDouble).length,
    doubleNumbers:doubleNumbers(hand),
    numberCounts:numberCounts(hand),
    repeatedNumberStructures:repeatedNumberStructures(hand),
    doubleChains:doubleChains(hand),
    branchEnds:branchEnds(state.branchState),
    openedNumbers:[...state.openingState.openedNumbers].sort((a,b)=>a-b),
    controllableEnds:controllableEnds(hand,state.branchState,state.openingState),
    consecutivePasses:state.consecutivePasses||0,
    turns:state.turns||0
  };
}

module.exports={numberCounts,doubleNumbers,repeatedNumberStructures,doubleChains,branchEnds,controllableEnds,stateFeatures};
