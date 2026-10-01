'use strict';
const e=require('./engine');
const t=require('./turn-kernel');
function isDouble(tile){return tile[0]===tile[1];}
function ordinaryActions(branchState,hand){return e.legalSinglesForHand(branchState,hand).filter(x=>!isDouble(x.tile)).map(x=>({type:'single',...x}));}
function doubleActions(branchState,openingState,hand){return e.enumerateDoubleOpeningSequences(branchState,openingState,hand).map(sequence=>({type:'double-sequence',sequence,tiles:sequence.map(x=>x.tile),numbers:sequence.map(x=>x.number)}));}
function actionsForHand(branchState,openingState,hand){return[...ordinaryActions(branchState,hand),...doubleActions(branchState,openingState,hand)];}
function turnOptions(branchState,openingState,hand,stock){
  let workingHand=[...hand],workingStock=[...stock],drawn=false,drawnTile=null;
  let actions=actionsForHand(branchState,openingState,workingHand);
  if(actions.length)return{phase:'play',drawn,drawnTile,hand:workingHand,stock:workingStock,actions};
  if(workingStock.length){drawnTile=workingStock[0];workingHand=[...workingHand,drawnTile];workingStock=workingStock.slice(1);drawn=true;actions=actionsForHand(branchState,openingState,workingHand);if(actions.length)return{phase:'play',drawn,drawnTile:[...drawnTile],hand:workingHand,stock:workingStock,actions};}
  return{phase:'pass',drawn,drawnTile:drawnTile?[...drawnTile]:null,hand:workingHand,stock:workingStock,actions:[]};
}
function removeTileOnce(hand,tile){const key=e.tileKey(tile);const i=hand.findIndex(x=>e.tileKey(x)===key);if(i<0)throw new Error('played tile missing from hand');return hand.filter((_,idx)=>idx!==i);}
function sameSingle(a,b){return a&&b&&a.type==='single'&&b.type==='single'&&a.handIndex===b.handIndex&&a.side===b.side&&a.to===b.to&&e.tileKey(a.tile)===e.tileKey(b.tile);}
function sameDoubleAction(a,b){return a&&b&&a.type==='double-sequence'&&b.type==='double-sequence'&&a.numbers.join(',')===b.numbers.join(',');}
function applyTurn(branchState,openingState,hand,stock,choice=null){
  const options=turnOptions(branchState,openingState,hand,stock);
  if(options.phase==='pass'){
    if(choice!==null)throw new Error('cannot choose action on pass');
    return{branchState:e.cloneBranchState(branchState),openingState:e.cloneOpeningState(openingState),hand:options.hand,stock:options.stock,passed:true,drawn:options.drawn,drawnTile:options.drawnTile,playedTiles:[],action:null};
  }
  if(!choice)throw new Error('turn action required');
  const legal=options.actions.find(a=>sameSingle(a,choice)||sameDoubleAction(a,choice));
  if(!legal)throw new Error('illegal turn action');
  if(legal.type==='single'){
    const nextBranch=e.applySinglePlacement(branchState,legal);
    const nextHand=options.hand.filter((_,i)=>i!==legal.handIndex);
    return{branchState:nextBranch,openingState:e.cloneOpeningState(openingState),hand:nextHand,stock:options.stock,passed:false,drawn:options.drawn,drawnTile:options.drawnTile,playedTiles:[legal.tile],action:legal};
  }
  const opened=e.applyDoubleOpeningSequence(branchState,openingState,legal.sequence);
  let nextHand=options.hand;
  for(const tile of legal.tiles)nextHand=removeTileOnce(nextHand,tile);
  return{branchState:opened.branchState,openingState:opened.openingState,hand:nextHand,stock:options.stock,passed:false,drawn:options.drawn,drawnTile:options.drawnTile,playedTiles:legal.tiles.map(x=>[...x]),action:legal};
}
function detectMixedFinishAmbiguity(branchState,openingState,hand){
  const doubles=hand.filter(isDouble),ordinary=hand.filter(x=>!isDouble(x));
  if(ordinary.length!==1||!doubles.length)return null;
  const placements=e.legalSinglePlacements(branchState,ordinary[0]);
  for(const placement of placements){
    const nextBranch=e.applySinglePlacement(branchState,placement);
    const seqs=e.enumerateDoubleOpeningSequences(nextBranch,openingState,doubles);
    const full=seqs.find(seq=>seq.length===doubles.length);
    if(full)return{ordinaryTile:[...ordinary[0]],placement,doubleTiles:doubles.map(x=>[...x]),doubleSequence:full};
  }
  return null;
}
function roundOutcome({hands,stock,consecutivePasses,lastPlayerIndex,lastTurnResult,players=3}){
  if(lastTurnResult&&!lastTurnResult.passed&&hands[lastPlayerIndex].length===0){return{kind:'finish',playerIndex:lastPlayerIndex,minus:e.finishMinus(lastTurnResult.playedTiles),remainders:hands.map(e.pipSum)};}
  if(t.isBlocked({stock,consecutivePasses,players}))return{kind:'block',playerIndex:null,minus:0,remainders:t.blockRemainders(hands)};
  return null;
}
module.exports={isDouble,ordinaryActions,doubleActions,actionsForHand,turnOptions,applyTurn,detectMixedFinishAmbiguity,roundOutcome};
