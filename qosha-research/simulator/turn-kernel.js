'use strict';
const e=require('./engine');

// Assumption-labelled kernel for draw=one_then_play_or_pass.
// This layer intentionally handles ordinary single-tile play only.
// Double-opening remains a separate action family until full turn integration is validated.
function ordinaryTurnOptions(branchState,hand,stock){
  const inHand=e.legalSinglesForHand(branchState,hand);
  if(inHand.length)return{phase:'play',drawn:false,hand:[...hand],stock:[...stock],legal:inHand};
  if(!stock.length)return{phase:'pass',drawn:false,hand:[...hand],stock:[],legal:[]};
  const drawnTile=stock[0];
  const nextHand=[...hand,drawnTile];
  const nextStock=stock.slice(1);
  const legal=e.legalSinglePlacements(branchState,drawnTile).map(p=>({handIndex:nextHand.length-1,...p}));
  if(legal.length)return{phase:'play',drawn:true,drawnTile:[...drawnTile],hand:nextHand,stock:nextStock,legal};
  return{phase:'pass',drawn:true,drawnTile:[...drawnTile],hand:nextHand,stock:nextStock,legal:[]};
}
function applyOrdinaryTurn(branchState,hand,stock,choice=null){
  const options=ordinaryTurnOptions(branchState,hand,stock);
  if(options.phase==='pass'){
    if(choice!==null)throw new Error('cannot choose placement on pass');
    return{branchState:e.cloneBranchState(branchState),hand:options.hand,stock:options.stock,played:null,passed:true,drawn:options.drawn,drawnTile:options.drawnTile||null};
  }
  if(!choice)throw new Error('placement required');
  const legal=options.legal.find(x=>x.handIndex===choice.handIndex&&x.side===choice.side&&x.to===choice.to&&e.tileKey(x.tile)===e.tileKey(choice.tile));
  if(!legal)throw new Error('illegal turn placement');
  const nextBranch=e.applySinglePlacement(branchState,legal);
  const nextHand=options.hand.filter((_,i)=>i!==legal.handIndex);
  return{branchState:nextBranch,hand:nextHand,stock:options.stock,played:legal,passed:false,drawn:options.drawn,drawnTile:options.drawnTile||null};
}
function nextPassCount(previousPassCount,turnResult){return turnResult.passed?previousPassCount+1:0;}
function isBlocked({stock,consecutivePasses,players=3}){
  if(!Number.isInteger(players)||players<2)throw new Error('players must be >=2');
  return stock.length===0&&consecutivePasses>=players;
}
function blockRemainders(hands){return hands.map(e.pipSum);}
module.exports={ordinaryTurnOptions,applyOrdinaryTurn,nextPassCount,isBlocked,blockRemainders};
