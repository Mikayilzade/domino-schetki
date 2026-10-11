'use strict';
// Equal-pip legal-action controls: both moves retain X-X and another X-Y.
// The connector action touches X; the unrelated action does not.
const e=require('./engine');
const d=require('./turn-dispatcher');
const {actionKey}=require('./decision-regret');
function matches(s){
 const p=s.currentPlayer,hand=s.hands[p],next=(p+1)%3;
 if(hand.length<3||hand.length>6||s.stock.length||s.hands[next].length>2)return [];
 const o=d.turnOptions(s.branchState,s.openingState,hand,s.stock);
 if(o.phase!=='play'||o.drawn)return [];
 const singles=o.actions.filter(a=>a.type==='single'),out=[];
 for(let x=0;x<=6;x++){
  if(!hand.some(t=>t[0]===x&&t[1]===x))continue;
  const connectors=hand.filter(t=>t[0]!==t[1]&&t.includes(x));
  if(connectors.length<2)continue;
  const pairs=[];
  for(const a of singles.filter(a=>a.tile.includes(x))){
   if(!connectors.some(t=>e.tileKey(t)!==e.tileKey(a.tile)))continue;
   for(const b of singles.filter(b=>!b.tile.includes(x)))
    if(e.pipSum([a.tile])===e.pipSum([b.tile]))
     pairs.push({connector:actionKey(a),other:actionKey(b),pips:e.pipSum([a.tile])});
  }
  if(pairs.length)out.push({x,pairs});
 }
 return out;
}
module.exports={matches};
