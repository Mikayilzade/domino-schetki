'use strict';
// Uniform fixed-visible hidden allocation conditioned on no-stock pass histories.
// For 3x9 after the opening draw, when the stock is empty.
const e=require('./engine'),r=require('./round-driver'),deck=e.createDoubleSixDeck(),key=e.tileKey;
function sample(state,known,forbidden,seed){
 const f=state.currentPlayer,n=(f+1)%3,o=(f+2)%3;
 if(state.stock.length)throw Error('stock must be empty');
 const used=new Set([...known,...state.hands[f]].map(key));
 if(used.size!==known.length+state.hands[f].length)throw Error('known overlap');
 const unknown=deck.filter(t=>!used.has(key(t)));
 if(unknown.length!==state.hands[n].length+state.hands[o].length)throw Error('hidden count');
 const next=[],other=[],flex=[];
 for(const t of unknown){
  const a=forbidden[n].has(key(t)),b=forbidden[o].has(key(t));
  if(a&&b)throw Error('inconsistent pass history');
  if(b)next.push(t);else if(a)other.push(t);else flex.push(t);
 }
 const count=state.hands[n].length-next.length;
 if(count<0||count>flex.length||other.length+flex.length-count!==state.hands[o].length)throw Error('impossible hand sizes');
 // A uniformly shuffled full deck restricted to flexible tiles is a uniform
 // permutation of those tiles, independent of the fixed forced allocations.
 const flexKeys=new Set(flex.map(key)),shuffled=e.shuffledDeck(seed).filter(t=>flexKeys.has(key(t)));
 const out=r.cloneRoundState(state);
 out.hands[n]=next.concat(shuffled.slice(0,count));
 out.hands[o]=other.concat(shuffled.slice(count));
 for(const p of [n,o])for(const t of out.hands[p])if(forbidden[p].has(key(t)))throw Error('forbidden tile sampled');
 if(new Set([...known,...out.hands.flat()].map(key)).size!==28)throw Error('deck integrity');
 return out;
}
function test(){
 const init=require('./initializer');
 const state=init.initializeThreePlayerRound({seed:1303100,isFirstRound:false,previousWinnerIndex:1});
 if(state.kind!=='ready')throw Error('fixture not ready');
 const f=state.currentPlayer,n=(f+1)%3,o=(f+2)%3;
 const live=new Set(state.hands.flat().map(key));
 const known=deck.filter(t=>!live.has(key(t)));
 const forbidden=[new Set(),new Set(),new Set()];
 forbidden[n].add(key(state.hands[o][0]));forbidden[o].add(key(state.hands[n][0]));
 const worlds=Array.from({length:25},(_,i)=>sample(state,known,forbidden,700+i));
 if(JSON.stringify(worlds[0])!==JSON.stringify(sample(state,known,forbidden,700)))throw Error('not deterministic');
 if(new Set(worlds.map(w=>JSON.stringify(w.hands))).size!==25)throw Error('allocation diversity');
 if(worlds.some(w=>!w.hands[n].some(t=>key(t)===key(state.hands[n][0]))||!w.hands[o].some(t=>key(t)===key(state.hands[o][0]))))throw Error('forced tile missing');
 return {passed:true,distinctAllocations:25};
}
if(require.main===module)console.log(JSON.stringify(test()));
module.exports={sample,test};
