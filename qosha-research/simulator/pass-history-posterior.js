'use strict';
// Only same-round, empty-stock observed passes by the target opponent.
// Other players' pass histories require joint hidden-hand enumeration.
const e=require('./engine'),d=require('./turn-dispatcher');
const {passChance}=require('./pass-chance-math');
function legalKeys(board,opening,tiles){
 return new Set(tiles.filter(t=>d.actionsForHand(board,opening,[t]).length>0).map(e.tileKey));
}
function forecast({unseen,handSize,target,board,opening,passes=[]}){
 if(!Array.isArray(unseen)||!Array.isArray(passes)||!Number.isInteger(handSize)||handSize<1||handSize>unseen.length)throw Error('invalid pool/hand');
 if(!Number.isInteger(target)||target<0||target>2)throw Error('invalid target');
 if(new Set(unseen.map(e.tileKey)).size!==unseen.length)throw Error('duplicate tile');
 const forbidden=new Set();
 for(const p of passes){
  if(!p||p.observed!==true||p.sameRound!==true||p.stockSize!==0||p.player!==target||!p.board||!p.opening)throw Error('unsafe pass witness');
  for(const k of legalKeys(p.board,p.opening,unseen))forbidden.add(k);
 }
 const allowed=unseen.filter(t=>!forbidden.has(e.tileKey(t)));
 if(allowed.length<handSize)throw Error('inconsistent history');
 const playable=legalKeys(board,opening,unseen);
 const l=allowed.filter(t=>playable.has(e.tileKey(t))).length;
 return {probability:passChance(allowed.length,l,handSize),
  unconditional:passChance(unseen.length,playable.size,handSize),
  eligible:allowed.length,legal:l,excluded:unseen.length-allowed.length,
  witnessCount:passes.length};
}
module.exports={legalKeys,forecast};
