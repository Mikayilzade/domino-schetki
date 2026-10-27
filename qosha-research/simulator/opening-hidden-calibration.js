'use strict';
// Conditional hidden opening-world sampler for confirmed first-round 3x9 mechanics.
// Node: node qosha-research/simulator/opening-hidden-calibration.js test
// Node: node qosha-research/simulator/opening-hidden-calibration.js 1662940 100000 20000 100000
// No branch unlocking, bot strategy, block winner or full-round simulation.
const TILES=[];
for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)if(!(a===1&&b===1))TILES.push([a,b]);
const KEY=t=>t[0]+'-'+t[1];
const CONNECT=TILES.filter(t=>t[0]===1||t[1]===1);
const OTHER=TILES.filter(t=>t[0]!==1&&t[1]!==1);
const EXACT={
 hands:[293930,1220940,1744200,1085280,305235,35910,1330],
 bridges:[178435,573660,578475,225100,33525,1620,15]
};
function mixSeed(seed){
 let x=Number(seed)>>>0;
 x=(x+0x9e3779b9)>>>0;
 x=Math.imul(x^(x>>>16),0x21f0aaad)>>>0;
 x=Math.imul(x^(x>>>15),0x735a2d97)>>>0;
 return(x^(x>>>15))>>>0;
}
function rng(seed){
 let x=mixSeed(seed)||0x9e3779b9;
 return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};
}
function choose(n,k){
 if(!Number.isInteger(k)||k<0||k>n)return 0;
 k=Math.min(k,n-k);let x=1;
 for(let i=1;i<=k;i++)x=x*(n-i+1)/i;
 return Math.round(x);
}
function draw(pool,k,r){
 if(k<0||k>pool.length)throw Error('draw out of range');
 const a=pool.slice();
 for(let i=0;i<k;i++){
  const j=i+Math.floor(r()*(a.length-i));
  [a[i],a[j]]=[a[j],a[i]];
 }
 return{picked:a.slice(0,k),rest:a.slice(k)};
}
function connectorCount(hand){return hand.filter(t=>t[0]===1||t[1]===1).length;}
function hasBridge(hand){
 const s=new Set(hand.map(KEY));
 for(let x=0;x<=6;x++)if(s.has(x+'-'+x))
  for(let y=x+1;y<=6;y++)if(s.has(y+'-'+y)&&s.has(x+'-'+y))return true;
 return false;
}
function pickConnectorCount(r,condition){
 if(Number.isInteger(condition)&&condition>=0&&condition<=6)return condition;
 if(condition!=='atLeastTwo')throw Error('condition must be 0..6, atLeastTwo or null');
 const total=EXACT.hands.slice(2).reduce((a,b)=>a+b,0);
 let u=Math.floor(r()*total);
 for(let c=2;c<=6;c++){u-=EXACT.hands[c];if(u<0)return c;}
 throw Error('weighted stratum selection failed');
}
function sampleOpeningWorld(seed,condition=null){
 const r=rng(seed);
 let starter,unknown;
 if(condition===null){
  const z=draw(TILES,9,r);starter=z.picked;unknown=z.rest;
 }else{
  const c=pickConnectorCount(r,condition);
  const a=draw(CONNECT,c,r),b=draw(OTHER,9-c,r);
  starter=a.picked.concat(b.picked);
  unknown=a.rest.concat(b.rest);
 }
 const split=draw(unknown,9,r);
 return{played:[[1,1]],starterHand:starter,opponents:[split.picked,split.rest],
  stock:[],oneConnectors:connectorCount(starter),bridge:hasBridge(starter)};
}
function checkWorld(w){
 const all=w.played.concat(w.starterHand,...w.opponents,w.stock);
 if(w.played.length!==1||KEY(w.played[0])!=='1-1'||w.starterHand.length!==9||
    w.opponents.length!==2||w.opponents.some(h=>h.length!==9)||w.stock.length!==0||
    all.length!==28||new Set(all.map(KEY)).size!==28)throw Error('tile conservation failed');
 if(w.oneConnectors!==connectorCount(w.starterHand)||w.bridge!==hasBridge(w.starterHand))
  throw Error('feature inconsistency');
}
function test(){
 if(TILES.length!==27||CONNECT.length!==6||OTHER.length!==21)throw Error('deck partition');
 if(EXACT.hands.reduce((a,b)=>a+b,0)!==choose(27,9)||
    EXACT.bridges.reduce((a,b)=>a+b,0)!==1590830)throw Error('exact baseline mismatch');
 for(let c=0;c<=6;c++)if(EXACT.hands[c]!==choose(6,c)*choose(21,9-c))
  throw Error('stratum combinatorics mismatch');
 const cases=[null,'atLeastTwo',0,1,2,3,4,5,6];
 for(let i=0;i<cases.length;i++)for(let k=0;k<30;k++){
  const seed=1662940+i*100+k,a=sampleOpeningWorld(seed,cases[i]);
  checkWorld(a);
  if(JSON.stringify(a)!==JSON.stringify(sampleOpeningWorld(seed,cases[i])))
   throw Error('seed replay mismatch');
  if(Number.isInteger(cases[i])&&a.oneConnectors!==cases[i])throw Error('conditional count');
  if(cases[i]==='atLeastTwo'&&a.oneConnectors<2)throw Error('atLeastTwo constraint');
 }
 return{passed:true,fixtureWorlds:270,checks:['uniform conditional combinatorial weights',
 '28 unique tiles','1-1 played','starter and opponents 9 each','deterministic replay',
 '0..6 exact connector conditioning','atLeastTwo conditioning','bridge feature']};
}
function summarize(count,bridges,exactP){
 const p=bridges/count,standardError=Math.sqrt(exactP*(1-exactP)/count);
 return{n:count,bridgeCount:bridges,observedBridgeRate:p,exactBridgeRate:exactP,
  differencePercentagePoints:100*(p-exactP),z:(p-exactP)/standardError};
}
function run(startSeed=1662940,unconditionalN=100000,perStratumN=20000,atLeastTwoN=100000){
 if(![startSeed,unconditionalN,perStratumN,atLeastTwoN].every(Number.isInteger)||
  startSeed<0||unconditionalN<100||perStratumN<100||atLeastTwoN<100)
  throw Error('invalid sample sizes');
 const sum=a=>a.reduce((x,y)=>x+y,0);
 const total=sum(EXACT.hands),allBridge=sum(EXACT.bridges);
 const counts=Array(7).fill(0),uncondBridges=Array(7).fill(0);
 let n=0,br=0;
 for(let i=0;i<unconditionalN;i++){
  const w=sampleOpeningWorld(startSeed+i);
  counts[w.oneConnectors]++;uncondBridges[w.oneConnectors]+=+w.bridge;
  br+=+w.bridge;n++;
 }
 const byConnector=[];
 let cursor=startSeed+unconditionalN;
 for(let c=0;c<=6;c++){
  let b=0;
  for(let i=0;i<perStratumN;i++){
   const w=sampleOpeningWorld(cursor+i,c);
   if(w.oneConnectors!==c)throw Error('stratum sampler violated');
   b+=+w.bridge;
  }
  byConnector.push({...summarize(perStratumN,b,EXACT.bridges[c]/EXACT.hands[c]),
   connectorCount:c,seedStart:cursor,seedEnd:cursor+perStratumN-1});
  cursor+=perStratumN;
 }
 let ge2Bridges=0;
 for(let i=0;i<atLeastTwoN;i++){
  const w=sampleOpeningWorld(cursor+i,'atLeastTwo');
  if(w.oneConnectors<2)throw Error('ge2 sampler violated');
  ge2Bridges+=+w.bridge;
 }
 const ge2Exact=sum(EXACT.bridges.slice(2))/sum(EXACT.hands.slice(2));
 const unconditional=summarize(unconditionalN,br,allBridge/total);
 const ge2={...summarize(atLeastTwoN,ge2Bridges,ge2Exact),
  seedStart:cursor,seedEnd:cursor+atLeastTwoN-1};
 const distribution=counts.map((k,c)=>({c,count:k,observed:k/unconditionalN,
  exact:EXACT.hands[c]/total}));
 const maxAbsZ=Math.max(Math.abs(unconditional.z),Math.abs(ge2.z),
  ...byConnector.map(x=>Math.abs(x.z)));
 if(maxAbsZ>5)throw Error('calibration outside five-sigma gate: '+maxAbsZ);
 return{schema:'qosha-opening-hidden-calibration/v1',
  engine:'qosa-research-0.5.3 hidden-world mixSeed + opening-hidden-calibration-1.0',
  rules:'recovered qosa-1.0.0; confirmed first-round 3x9 starter after 1-1 + stock draw',
  seedStart:startSeed,seedEnd:cursor+atLeastTwoN-1,
  openingWorlds:unconditionalN+7*perStratumN+atLeastTwoN,
  deals:0,modelRounds:0,forcedContinuationRollouts:0,
  policies:'none; uniform combinatorial hidden allocations only',
  unconditional:{...unconditional,seedStart:startSeed,seedEnd:startSeed+unconditionalN-1,
   connectorDistribution:distribution},
  stratified:byConnector,atLeastTwo:ge2,maxAbsCalibrationZ:maxAbsZ,
  confidence:'Monte Carlo frequencies compared with exact exhaustive combinatorial targets; z based on binomial independent seed worlds, exploratory five-sigma validation gate',
  limitations:['These are synthetic complete hidden allocations after the confirmed opening, not observed real matches or strategy rollouts',
  'Condition c=0 models a starter forced pass immediately after the 1-1 draw; not arbitrary later-round passes',
  'Condition >=2 is a mathematical hand-composition stratum, not necessarily publicly observable',
  'No opponent-choice likelihood, branch unlock, block winner, loneZero, bust, 101 scoring or minus tactics validated'],
  nextAction:'Extend posterior conditioning to actual public pass histories and known focal stones; authenticate late-branch unlock and block-tie convention before bridge tactical advice'};
}
if(typeof require!=='undefined'&&require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1662940),
 +(a[1]||100000),+(a[2]||20000),+(a[3]||100000)),null,2));
}
module.exports={sampleOpeningWorld,checkWorld,hasBridge,connectorCount,test,run};
