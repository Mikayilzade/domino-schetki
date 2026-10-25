'use strict';
// Same-state legal X-X vs X-Y connector, next opponent has one stone.
// Provisional four-branch number-lock semantics; not a causal opening estimate.
// node qosha-research/simulator/connector-pip-gap-runner.js test
// node qosha-research/simulator/connector-pip-gap-runner.js 1502540 2400 45 48
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const legal=require('./branch-legal-choice'),abl=require('./branch-unlock-delay-ablation');
const key=e.tileKey,PROFILES=['min-hand-pips','closed-branch-control'];
const ak=a=>[a.type,(a.numbers||[]).join(','),a.side||'',a.to??'',key(a.tile||[0,0])].join(':');
const pip=a=>e.pipSum(a.type==='single'?[a.tile]:a.tiles);
const connectors=(hand,n)=>hand.filter(t=>t[0]!==t[1]&&t.includes(n)).length;
function connectorPair(opts,opening){
 if(opts.phase!=='play'||opts.drawn||opts.actions.some(a=>a.type==='mixed-finish'))return null;
 const singles=opts.actions.filter(a=>a.type==='single');
 const doubles=opts.actions.filter(a=>a.type==='double-sequence'&&a.tiles.length===1&&!opening.openedNumbers.has(a.numbers[0]));
 const pairs=[];
 for(const dbl of doubles)for(const single of singles){
  const x=dbl.numbers[0],t=single.tile;
  if(t[0]===t[1]||!t.includes(x))continue;
  const y=t[0]===x?t[1]:t[0];
  const gap=pip(dbl)-pip(single);
  if(gap!==x-y)throw Error('pip-gap identity failed');
  pairs.push({double:dbl,single,x,y,gap,sort:ak(dbl)+'|'+ak(single)});
 }
 pairs.sort((a,b)=>Math.abs(a.gap)-Math.abs(b.gap)||a.sort.localeCompare(b.sort));
 return pairs[0]||null;
}
function collect(start,count,quota){
 const source=legal.collect(start,count,quota),positions=[];
 if(source.unresolved)throw Error('unresolved discovery');
 for(const pos of source.positions){
  const s=pos.state,p=pos.seat;
  const opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
  const pair=connectorPair(opts,s.openingState);
  if(!pair)continue;
  const ds=d.applyTurn(s.branchState,s.openingState,s.hands[p],s.stock,pair.double);
  const ss=d.applyTurn(s.branchState,s.openingState,s.hands[p],s.stock,pair.single);
  if(ds.hand.some(t=>key(t)===pair.x+'-'+pair.x)||!ss.hand.some(t=>key(t)===pair.x+'-'+pair.x))
   throw Error('retained X-X invariant');
  positions.push({...pos,double:ak(pair.double),single:ak(pair.single),number:pair.x,
   connectorOtherPip:pair.y,pipGap:pair.gap,doublePips:pip(pair.double),singlePips:pip(pair.single),
   connectorsBefore:connectors(s.hands[p],pair.x),
   connectorsAfterSingle:connectors(ss.hand,pair.x),
   connectorsAfterDouble:connectors(ds.hand,pair.x)});
 }
 return{source,positions};
}
function ci(xs){if(!xs.length)return{n:0,mean:null,halfWidth95:null};
 const mean=xs.reduce((a,b)=>a+b,0)/xs.length;
 const variance=xs.length>1?xs.reduce((s,x)=>s+(x-mean)**2,0)/(xs.length-1):0;
 return{n:xs.length,mean,halfWidth95:xs.length>1?1.96*Math.sqrt(variance/xs.length):null};
}
function summarize(rows){
 return{positions:rows.length,pipGap:ci(rows.map(x=>x.pipGap)),
  focalFinishFirstDeltaPP:ci(rows.map(x=>100*x.winDelta)),
  immediateOpponentFinishDeltaPP:ci(rows.map(x=>100*x.immediateNextFinishDelta)),
  nextOpponentPlayableDelta:ci(rows.map(x=>x.nextPlayableDelta)),
  focalRemainderPipsDelta:ci(rows.map(x=>x.pipsDelta)),
  focalMinusFinishDeltaPP:ci(rows.map(x=>100*x.minusDelta)),
  blockDeltaPP:ci(rows.map(x=>100*x.blockDelta)),
  roundLengthDelta:ci(rows.map(x=>x.turnsDelta)),
  signs:{doubleBetter:rows.filter(x=>x.winDelta>0).length,connectorBetter:rows.filter(x=>x.winDelta<0).length,ties:rows.filter(x=>x.winDelta===0).length}};
}
function run(start=1502540,count=2400,quota=45,worlds=48){
 if(![start,count,quota,worlds].every(Number.isInteger)||count<2||count%2||quota<1||worlds<1||worlds>128)throw Error('invalid args');
 const discovery=collect(start,count,quota),rows=[];
 const keys=['win','pips','minus','block','nextPass','nextPlayable','immediateNextFinish','turns','remainingDoubles'];
 for(const pos of discovery.positions){
  const before=JSON.stringify(pos.state),sums=Object.fromEntries(keys.map(k=>[k,0]));
  const minusCounts={double:{},connector:{}};
  for(let i=0;i<worlds;i++){
   const ws=(3970000000+(pos.seed-start)*512+pos.seat*128+i)>>>0;
   const world=abl.sample(pos,ws);
   const a=legal.rollout(world,pos,pos.double,pos.profile,ws);
   const b=legal.rollout(world,pos,pos.single,pos.profile,ws);
   for(const k of keys)sums[k]+=(a[k]-b[k])/worlds;
   for(const [arm,z] of [['double',a],['connector',b]])minusCounts[arm][z.minusCode]=(minusCounts[arm][z.minusCode]||0)+1;
  }
  if(JSON.stringify(pos.state)!==before)throw Error('source mutation');
  rows.push({seed:pos.seed,seat:pos.seat,turn:pos.turn,profile:pos.profile,number:pos.number,
   connectorOtherPip:pos.connectorOtherPip,connectorTile:key([pos.number,pos.connectorOtherPip]),
   doubleTile:key([pos.number,pos.number]),doubleAction:pos.double,connectorAction:pos.single,
   pipGap:pos.pipGap,doublePips:pos.doublePips,connectorPips:pos.singlePips,
   connectorsBefore:pos.connectorsBefore,connectorsAfterSingle:pos.connectorsAfterSingle,
   connectorsAfterDouble:pos.connectorsAfterDouble,focalHandSize:pos.focalHandSize,nextHandSize:1,
   ...Object.fromEntries(Object.entries(sums).map(([k,v])=>[k+'Delta',v])),minusCounts});
 }
 const strata={all:rows};
 for(const profile of PROFILES)strata[profile]=rows.filter(x=>x.profile===profile);
 for(const label of ['gap-negative','gap-positive','abs-gap-1','abs-gap-2-3','abs-gap-4-6',
  'retained-connector-0','retained-connector-1plus']){
  strata[label]=rows.filter(x=>label==='gap-negative'?x.pipGap<0:
   label==='gap-positive'?x.pipGap>0:
   label==='abs-gap-1'?Math.abs(x.pipGap)===1:
   label==='abs-gap-2-3'?Math.abs(x.pipGap)>=2&&Math.abs(x.pipGap)<=3:
   label==='abs-gap-4-6'?Math.abs(x.pipGap)>=4:
   label==='retained-connector-0'?x.connectorsAfterSingle===0:x.connectorsAfterSingle>=1);
 }
 const summaries=Object.fromEntries(Object.entries(strata).map(([k,v])=>[k,summarize(v)]));
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',
  hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-same-number-double-vs-connector-pip-gap/v1',timestampBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0, 3x9; number-lock PROVISIONAL',
  seedStart:start,seedReservedEnd:start+count-1,seedSets:discovery.source.scan,
  uniqueDealsScanned:Object.values(discovery.source.scan).reduce((n,x)=>n+x.dealsScanned,0),
  fullRoundDiscoveryContinuations:discovery.source.fullRounds,discoveryUnresolved:discovery.source.unresolved,
  positions:rows.length,matchedHiddenWorldAllocations:rows.length*worlds,
  forcedCounterfactualContinuations:rows.length*worlds*2,worldsPerPosition:worlds,
  strategies:PROFILES,summary:summaries,rows,
  seedFormula:'(3970000000+(dealSeed-seedStart)*512+seat*128+worldIndex)>>>0',
  selection:'Among first one-stone-next-opponent legal single-vs-double choice per deal/seat, retain only positions where a legal X-Y single and unopened X-X double are both available; choose smallest |X-Y| gap, lexical tie-break. At most one per deal.',
  comparison:'Both actions legal under provisional kernel; same position and pass-conditioned hidden worlds, same continuation policy. Double X-X vs ordinary X-Y sharing X, removed pip difference X-Y, X-X retained only by connector arm.',
  limitations:'NOT a causal estimate of branch unlocking or connector retention: pip gap, tile identity, opened number, and remaining hand differ. One-stone enriched sample; position-cluster exploratory CIs, correlated worlds, first eligible selection; pass-conditioned posterior ignores opponent earlier choice likelihood. Number locking and block winner/loneZero/bust/101-point match unvalidated. Finish-first is not match win.',
  nextAction:'Replicate in disjoint seed holdout, match or reweight exact pip gaps and retained connector count; seek authentic four-branch opening fixture.'};
}
function test(){
 const opts={phase:'play',drawn:false,actions:[
  {type:'single',tile:[2,5],side:'up',to:2},{type:'single',tile:[1,6],side:'left',to:6},
  {type:'double-sequence',tiles:[[2,2]],numbers:[2]},{type:'double-sequence',tiles:[[3,3]],numbers:[3]}]};
 const p=connectorPair(opts,e.createOpeningState([1]));
 if(!p||p.x!==2||p.y!==5||p.gap!==-3)throw Error('connector pair selection');
 const a=run(1502540,300,2,3),b=run(1502540,300,2,3);
 delete a.timestampBaku;delete b.timestampBaku;
 if(!a.positions||JSON.stringify(a)!==JSON.stringify(b)||a.discoveryUnresolved||
  a.forcedCounterfactualContinuations!==a.positions*6||
  a.rows.some(x=>x.pipGap!==x.number-x.connectorOtherPip||x.connectorsAfterSingle!==x.connectorsBefore-1))
  throw Error('deterministic paired regression');
 return{passed:true,positions:a.positions,forced:a.forcedCounterfactualContinuations};
}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1502540),+(a[1]||2400),+(a[2]||45),+(a[3]||48)),null,2));}
module.exports={connectorPair,collect,run,test,summarize};
