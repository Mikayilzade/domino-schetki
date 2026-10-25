'use strict';
// Exploratory retained X-X/X-Y connector strata for legal equal-pip single vs opening-double.
// Node: node qosha-research/simulator/branch-legal-structure.js test
//       node qosha-research/simulator/branch-legal-structure.js 1499540 3000 10 32
// Four-branch number locking remains PROVISIONAL.
const e=require('./engine'),d=require('./turn-dispatcher'),base=require('./branch-legal-equal-pip');
const key=e.tileKey;
const ak=a=>[a.type,(a.numbers||[]).join(','),a.side||'',a.to??'',key(a.tile||[0,0])].join(':');
const connectors=(hand,n)=>hand.filter(t=>t[0]!==t[1]&&(t[0]===n||t[1]===n)).length;
const playable=(bs,os,hand)=>hand.filter(t=>d.actionsForHand(bs,os,[t]).length>0).length;
function ci(rows,k,mult=1){const xs=rows.map(x=>mult*x[k]);if(!xs.length)return{n:0,mean:null,halfWidth95:null};const mean=xs.reduce((a,b)=>a+b,0)/xs.length,v=xs.length>1?xs.reduce((s,x)=>s+(x-mean)**2,0)/(xs.length-1):0;return{n:xs.length,mean,halfWidth95:xs.length>1?1.96*Math.sqrt(v/xs.length):null};}
function summarize(rows){return{positions:rows.length,doubleMinusSingleFinishFirstPP:ci(rows,'winDelta',100),doubleMinusSingleImmediateNextFinishPP:ci(rows,'immediateNextFinishDelta',100),doubleMinusSingleNextPlayable:ci(rows,'nextPlayableDelta'),doubleMinusSingleRemainderPips:ci(rows,'pipsDelta'),doubleMinusSingleMinusFinishPP:ci(rows,'minusDelta',100),signs:{doubleBetter:rows.filter(x=>x.winDelta>0).length,singleBetter:rows.filter(x=>x.winDelta<0).length,ties:rows.filter(x=>x.winDelta===0).length}};}
function run(start=1499540,count=3000,quota=10,worlds=32){
 const data=base.run(start,count,quota,worlds),disc=base.collect(start,count,quota);
 if(data.rows.length!==disc.positions.length||data.fullRoundDiscoveryContinuations!==disc.fullRounds)throw Error('discovery replay mismatch');
 const rows=data.rows.map((row,i)=>{
  const pos=disc.positions[i],s=pos.state,p=s.currentPlayer,n=(p+1)%3;
  if(pos.seed!==row.seed||pos.seat!==row.seat||pos.turn!==row.turn)throw Error('position replay mismatch');
  const opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
  const single=opts.actions.find(a=>ak(a)===pos.single),dbl=opts.actions.find(a=>ak(a)===pos.double);
  if(!single||!dbl||single.type!=='single'||dbl.type!=='double-sequence'||dbl.tiles.length!==1)throw Error('not legal');
  if(e.pipSum([single.tile])!==e.pipSum(dbl.tiles))throw Error('pip mismatch');
  const sd=d.applyTurn(s.branchState,s.openingState,s.hands[p],s.stock,single),dd=d.applyTurn(s.branchState,s.openingState,s.hands[p],s.stock,dbl),x=dbl.numbers[0];
  if(!sd.hand.some(t=>key(t)===x+'-'+x)||dd.hand.some(t=>key(t)===x+'-'+x))throw Error('retained double invariant');
  return {...row,connectorsBefore:connectors(s.hands[p],x),connectorsAfterSingle:connectors(sd.hand,x),
   singleTouchesDoubleNumber:single.tile.includes(x),otherDoublesBefore:s.hands[p].filter(t=>t[0]===t[1]).length-1,
   ownPlayableAfterSingle:playable(sd.branchState,sd.openingState,sd.hand),
   ownPlayableAfterDouble:playable(dd.branchState,dd.openingState,dd.hand),
   actualNextPlayableAfterSingle:playable(sd.branchState,sd.openingState,s.hands[n]),
   actualNextPlayableAfterDouble:playable(dd.branchState,dd.openingState,s.hands[n])};
 });
 const by={all:rows,nextOne:rows.filter(x=>x.nextHandSize===1),nextTwoToFour:rows.filter(x=>x.nextHandSize>=2),
  noConnector:rows.filter(x=>x.connectorsAfterSingle===0),withConnector:rows.filter(x=>x.connectorsAfterSingle>=1),
  nextOneNoConnector:rows.filter(x=>x.nextHandSize===1&&x.connectorsAfterSingle===0),
  nextOneWithConnector:rows.filter(x=>x.nextHandSize===1&&x.connectorsAfterSingle>=1),
  singleTouchesX:rows.filter(x=>x.singleTouchesDoubleNumber),singleNotX:rows.filter(x=>!x.singleTouchesDoubleNumber),
  nextAccessDeltaSmall:rows.filter(x=>Math.abs(x.nextPlayableDelta)<=0.125),
  nextAccessDeltaLarge:rows.filter(x=>x.nextPlayableDelta>0.125)};
 return {...data,schema:'qosha-legal-equal-pip-structure/v1',rows,structureSummary:Object.fromEntries(Object.entries(by).map(([k,v])=>[k,summarize(v)])),
  limitations:data.limitations+' Connector strata observational and selected; post-action access is an outcome, not pre-action adjustment. Retained X-X vs spent X-X differs by tile identity.'};
}
function test(){const a=run(1487540,200,1,3),b=run(1487540,200,1,3);delete a.timestampBaku;delete b.timestampBaku;
 if(!a.positions||JSON.stringify(a)!==JSON.stringify(b)||a.discoveryUnresolved)throw Error('deterministic structure replay');return{passed:true,positions:a.positions,forced:a.forcedCounterfactualContinuations};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1499540),+(a[1]||3000),+(a[2]||10),+(a[3]||32)),null,2));}
module.exports={run,test,summarize};