'use strict';
const e=require('./engine'),init=require('./initializer');
const sample=require('./pass-conditioned-world').sample;
function test(){
 const base=init.initializeThreePlayerRound({seed:1303100,isFirstRound:false,previousWinnerIndex:0});
 if(base.kind!=='ready')throw Error('init');
 const focal=base.currentPlayer,next=(focal+1)%3,other=(focal+2)%3;
 const deck=e.createDoubleSixDeck(),live=new Set(base.hands.flat().map(e.tileKey));
 const known=deck.filter(t=>!live.has(e.tileKey(t)));
 const forbidden=[new Set(),new Set(),new Set()];
 const inNext=e.tileKey(base.hands[next][0]),inOther=e.tileKey(base.hands[other][0]);
 forbidden[other].add(inNext);forbidden[next].add(inOther);
 const worlds=new Set();
 for(let seed=700;seed<725;seed++){
  const w=sample(base,focal,known,forbidden,seed);
  if(!w.hands[next].some(t=>e.tileKey(t)===inNext)||!w.hands[other].some(t=>e.tileKey(t)===inOther))throw Error('forced ownership');
  const all=[...known,...w.hands.flat()].map(e.tileKey);
  if(all.length!==28||new Set(all).size!==28)throw Error('conservation');
  const fingerprint=w.hands[next].map(e.tileKey).sort().join(',')+'|'+w.hands[other].map(e.tileKey).sort().join(',');
  worlds.add(fingerprint);
  if(JSON.stringify(w)!==JSON.stringify(sample(base,focal,known,forbidden,seed)))throw Error('replay');
 }
 if(worlds.size!==25)throw Error('insufficient allocation diversity: '+worlds.size);
 return {passed:true,distinctWorlds:worlds.size};
}
if(require.main===module)console.log(JSON.stringify(test()));
module.exports={test};
