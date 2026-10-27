'use strict';
// Branch-rule-invariant 3x9 first-round hand analysis.
// node qosha-research/simulator/opening-pattern-baseline.js test
// node qosha-research/simulator/opening-pattern-baseline.js 1602940 60000
const assert=require('node:assert/strict'),e=require('./engine');
const C=(n,k)=>{let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return v;};
const exact={stock11:1/28,starterZeroOneConnectors:C(21,9)/C(27,9),
 starterAtLeastTwoOneConnectors:1-(C(21,9)+6*C(21,8))/C(27,9),
 givenDoubleInNineAtLeastTwoConnectors:1-(C(21,8)+6*C(21,7))/C(27,8),
 specifiedDoubleDoubleBridgeInNine:C(25,6)/C(28,9)};
function features(hand){
 const s=new Set(hand.map(e.tileKey));assert.equal(s.size,hand.length);
 let double2=0,bridges=0;
 for(let x=0;x<=6;x++){if(!s.has(x+'-'+x))continue;
  let c=0;for(let y=0;y<=6;y++)if(x!==y&&s.has(Math.min(x,y)+'-'+Math.max(x,y)))c++;
  if(c>=2)double2++;
  for(let y=x+1;y<=6;y++)if(s.has(y+'-'+y)&&s.has(x+'-'+y))bridges++;
 }
 return{double2,bridges};
}
function run(startSeed=1602940,deals=60000){
 assert(Number.isInteger(startSeed)&&startSeed>=0&&Number.isInteger(deals)&&deals>0&&deals<=200000);
 const z={deals,hands:0,stock11:0,withDouble2:0,withBridge:0,withBoth:0,double2Count:0,
 bridgeCount:0,starterRounds:0,starterAfter2Ones:0,starterAfterBridge:0,
 starterAfterDouble2:0,starterAfterAtLeastOne1:0,starter1ConnectorSum:0,
 byStartConnector:[0,0,0,0,0,0,0]};
 for(let seed=startSeed;seed<startSeed+deals;seed++){
  const {hands,stock}=e.dealThreeByNine(seed);
  assert.equal(new Set(hands.flat().concat(stock).map(e.tileKey)).size,28);
  const stock11=e.tileKey(stock[0])==='1-1';z.stock11+=+stock11;
  for(const h of hands){const f=features(h);z.hands++;
   z.withDouble2+=+(f.double2>0);z.withBridge+=+(f.bridges>0);
   z.withBoth+=+(f.double2>0&&f.bridges>0);
   z.double2Count+=f.double2;z.bridgeCount+=f.bridges;
  }
  if(stock11)continue; // first round requires reshuffle
  const starter=hands.find(h=>h.some(t=>e.tileKey(t)==='1-1'));
  assert(starter);
  const after=starter.filter(t=>e.tileKey(t)!=='1-1').concat(stock);
  assert.equal(after.length,9);
  const f=features(after),n=after.filter(t=>t[0]===1||t[1]===1).length;
  z.starterRounds++;z.starterAfterBridge+=+(f.bridges>0);
  z.starterAfterDouble2+=+(f.double2>0);z.starterAfterAtLeastOne1+=+(n>=1);
  z.starterAfter2Ones+=+(n>=2);z.starter1ConnectorSum+=n;z.byStartConnector[n]++;
 }
 const rates={stock11:z.stock11/deals,handDouble2:z.withDouble2/z.hands,
  handBridge:z.withBridge/z.hands,starterZeroOneConnectors:z.byStartConnector[0]/z.starterRounds,
  starterAtLeastTwoOneConnectors:z.starterAfter2Ones/z.starterRounds,
  starterAfterBridge:z.starterAfterBridge/z.starterRounds,
  starterAfterDouble2:z.starterAfterDouble2/z.starterRounds};
 return{schema:'qosha-opening-pattern-baseline/v1',
  timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',
  engine:'qosa-research-0.5.3 deal kernel + opening-pattern-baseline-1.0',
  rules:'recovered qosa-1.0.0; confirmed first-round opening only',
  startSeed,endSeed:startSeed+deals-1,counts:z,rates,exact,
  strategies:'none; no full model rounds',modelRounds:0,
  limitations:['No branch-unlock or block-winner rule assumed','3 hands/deal are dependent',
   'Availability of a connector is not a winning strategy'],
  nextHypothesis:'Verify authentic starter pass; later compare preserving connectors on matched seeds only under validated branch rules'};
}
function test(){
 const f=features([[1,1],[1,2],[1,3],[2,2],[2,3]]);
 assert.equal(f.double2,2);assert.equal(f.bridges,1);
 assert.equal(features([[1,1],[0,0]]).bridges,0);
 assert.equal(e.createDoubleSixDeck().length,28);
 const a=run(1602940,20),b=run(1602940,20);
 delete a.timestampAsiaBaku;delete b.timestampAsiaBaku;
 assert.deepEqual(a,b);assert.equal(a.counts.hands,60);
 assert.equal(a.counts.byStartConnector.reduce((x,y)=>x+y,0),a.counts.starterRounds);
 return{passed:true,pilotDeals:20,fixtures:['features','deck conservation','starter count','seed replay']};
}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1602940),+(a[1]||60000)),null,2));}
module.exports={run,test,features,exact};
