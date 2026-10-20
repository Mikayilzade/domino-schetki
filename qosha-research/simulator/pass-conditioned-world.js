'use strict';
const e=require('./engine'),r=require('./round-driver'),deck=e.createDoubleSixDeck();
function sample(s,focal,known,forbidden,seed){
 if(s.stock.length)throw Error('stock');
 const a=(focal+1)%3,b=(focal+2)%3,used=new Set([...known,...s.hands[focal]].map(e.tileKey));
 const pool=deck.filter(t=>!used.has(e.tileKey(t))),fa=[],fb=[],flex=[];
 for(const t of pool){
  const k=e.tileKey(t),x=forbidden[a].has(k),y=forbidden[b].has(k);
  if(x&&y)throw Error('inconsistent');
  (y?fa:x?fb:flex).push(t);
 }
 const n=s.hands[a].length-fa.length;
 if(n<0||n>flex.length||fb.length+flex.length-n!==s.hands[b].length)throw Error('sizes');
 const order=new Map(e.shuffledDeck(seed).map((t,i)=>[e.tileKey(t),i]));
 flex.sort((x,y)=>order.get(e.tileKey(x))-order.get(e.tileKey(y)));
 const w=r.cloneRoundState(s);
 w.hands[a]=fa.concat(flex.slice(0,n));w.hands[b]=fb.concat(flex.slice(n));
 const keys=[...known,...w.hands.flat()].map(e.tileKey);
 if(keys.length!==28||new Set(keys).size!==28)throw Error('tiles');
 return w;
}
module.exports={sample};
