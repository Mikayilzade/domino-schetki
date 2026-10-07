'use strict';
const e=require('./engine');
function isDoubleOf(t,n){return t[0]===n&&t[1]===n;}
function touches(t,n){return t[0]===n||t[1]===n;}
function playedTiles(a){return Array.isArray(a.tiles)?a.tiles:(Array.isArray(a.tile)?[a.tile]:[]);}
function targets(hand){
  const out=[];
  for(let n=0;n<=6;n++){
    const xs=hand.filter(t=>touches(t,n));
    const connectors=xs.filter(t=>!isDoubleOf(t,n));
    if(xs.length>=3&&xs.some(t=>isDoubleOf(t,n))&&connectors.length)out.push({number:n,tileCount:xs.length,connectorCount:connectors.length});
  }
  return out;
}
function classify(hand,action,n){
  const played=playedTiles(action),left=hand.map(t=>[...t]);
  for(const t of played){const k=e.tileKey(t),i=left.findIndex(x=>e.tileKey(x)===k);if(i>=0)left.splice(i,1);}
  return{
    usesDouble:played.some(t=>isDoubleOf(t,n)),
    usesConnector:played.some(t=>touches(t,n)&&!isDoubleOf(t,n)),
    keepsPair:left.some(t=>isDoubleOf(t,n))&&left.some(t=>touches(t,n)&&!isDoubleOf(t,n))
  };
}
function comparableChoices(hand,actions){
  return targets(hand).map(target=>{
    const choices=actions.map((action,index)=>({index,action,...classify(hand,action,target.number)}));
    return{...target,spendDouble:choices.filter(x=>x.usesDouble),preservePair:choices.filter(x=>x.keepsPair&&!x.usesDouble)};
  }).filter(x=>x.spendDouble.length&&x.preservePair.length);
}
module.exports={targets,classify,comparableChoices};
