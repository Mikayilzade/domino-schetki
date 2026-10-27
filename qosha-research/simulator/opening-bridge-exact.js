'use strict';
// Rule-invariant exact enumeration of 9-stone double-six hands and starter post-draw hands.
// No branch-unlock, block-scoring, or opponent-policy assumption.
// node qosha-research/simulator/opening-bridge-exact.js test
// node qosha-research/simulator/opening-bridge-exact.js exact
const assert=require('node:assert/strict');
function choose(n,k){
 if(!Number.isInteger(n)||!Number.isInteger(k)||k<0||k>n)return 0;
 k=Math.min(k,n-k);let v=1;
 for(let i=1;i<=k;i++)v=v*(n-i+1)/i;
 return Math.round(v);
}
const sum=(n,fn)=>Array.from({length:n+1},(_,i)=>fn(i)).reduce((a,b)=>a+b,0);
function analytic(){
 // A bridge is X-X, Y-Y and X-Y, with X != Y. For d selected loops,
 // a bridge-free hand cannot contain any of C(d,2) connecting non-loop tiles.
 const all=choose(28,9);
 const allNo=sum(7,d=>choose(7,d)*choose(21-choose(d,2),9-d));
 // Starter after 1-1 is laid and the stock tile is drawn: a uniform 9-subset
 // of the other 27 tiles. It contains 6 possible loops and 21 non-loop tiles.
 const starter=choose(27,9);
 const starterNo=sum(6,d=>choose(6,d)*choose(21-choose(d,2),9-d));
 // c of six 1-X tiles; remaining non-loop tiles are the 15 edges on {0,2,3,4,5,6}.
 const byConnector=Array.from({length:7},(_,c)=>{
  const count=choose(6,c)*choose(21,9-c);
  const noBridge=choose(6,c)*sum(6,d=>choose(6,d)*choose(15-choose(d,2),9-c-d));
  return {oneConnectors:c,hands:count,bridgeHands:count-noBridge,
   bridgeRate:(count-noBridge)/count};
 });
 assert.equal(byConnector.reduce((a,x)=>a+x.hands,0),starter);
 assert.equal(byConnector.reduce((a,x)=>a+x.bridgeHands,0),starter-starterNo);
 const ge2=byConnector.slice(2);
 return {schema:'qosha-opening-bridge-exact/v1',hand:{count:all,bridge:all-allNo,
  bridgeRate:(all-allNo)/all},starter:{count:starter,bridge:starter-starterNo,
  bridgeRate:(starter-starterNo)/starter,byOneConnectors:byConnector,
  forcedPassBridgeRate:byConnector[0].bridgeRate,
  twoPlusConnectorsBridgeRate:ge2.reduce((a,x)=>a+x.bridgeHands,0)/
   ge2.reduce((a,x)=>a+x.hands,0)}};
}
function exhaustive(){
 // Independent check: enumerate all 28 choose 9 bitmasks. Loops occupy bits 0..6,
 // then non-loops in ascending (a,b) order. Bit 1 represents 1-1.
 const edges=[];let bit=7;
 for(let a=0;a<=6;a++)for(let b=a+1;b<=6;b++)edges.push({a,b,mask:1<<bit++});
 const connectorMask=edges.filter(e=>e.a===1||e.b===1).reduce((m,e)=>m|e.mask,0);
 const pop=x=>{let n=0;while(x){x&=x-1;n++;}return n;};
 let count=0,bridges=0,starterCount=0,starterBridges=0;
 const by=Array.from({length:7},(_,c)=>({oneConnectors:c,hands:0,bridgeHands:0}));
 let mask=(1<<9)-1;const limit=1<<28;
 while(mask<limit){
  count++;
  const loops=mask&127;let bridge=false;
  if(pop(loops)>1)for(const e of edges){
   if((mask&e.mask)&&(loops&(1<<e.a))&&(loops&(1<<e.b))){bridge=true;break;}
  }
  if(bridge)bridges++;
  if(!(mask&(1<<1))){
   starterCount++;if(bridge)starterBridges++;
   const c=pop(mask&connectorMask);by[c].hands++;if(bridge)by[c].bridgeHands++;
  }
  const lowest=mask&-mask,next=mask+lowest;
  mask=(((next^mask)>>>2)/lowest)|next;
 }
 return {count,bridges,starterCount,starterBridges,byConnector:by};
}
function test(){
 const a=analytic(),b=exhaustive();
 assert.equal(a.hand.count,b.count);assert.equal(a.hand.bridge,b.bridges);
 assert.equal(a.starter.count,b.starterCount);assert.equal(a.starter.bridge,b.starterBridges);
 for(let c=0;c<=6;c++){
  assert.equal(a.starter.byOneConnectors[c].hands,b.byConnector[c].hands);
  assert.equal(a.starter.byOneConnectors[c].bridgeHands,b.byConnector[c].bridgeHands);
 }
 assert.equal(choose(28,9),6906900);
 return {passed:true,exhaustivelyCheckedHands:b.count,
  starterSubset:b.starterCount,independentAnalyticAndEnumerationAgree:true};
}
if(require.main===module){
 const mode=process.argv[2]||'exact';
 if(mode!=='exact'&&mode!=='test')throw new Error('Use exact or test');
 console.log(JSON.stringify(mode==='test'?test():analytic(),null,2));
}
module.exports={choose,analytic,exhaustive,test};
