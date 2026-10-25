'use strict';
// Positive-gap same-X double X-X vs connector X-Y, X>Y. Provisional geometry.
// node qosha-research/simulator/connector-positive-gap-runner.js test
// node qosha-research/simulator/connector-positive-gap-runner.js 1504940 6000 32
const e=require('./engine'),d=require('./turn-dispatcher'),legal=require('./branch-legal-choice'),abl=require('./branch-unlock-delay-ablation');
const key=e.tileKey,ak=a=>[a.type,(a.numbers||[]).join(','),a.side||'',a.to??'',key(a.tile||[0,0])].join(':');
function ci(xs){if(!xs.length)return{n:0,mean:null,halfWidth95:null};const m=xs.reduce((a,b)=>a+b,0)/xs.length,v=xs.length>1?xs.reduce((a,x)=>a+(x-m)**2,0)/(xs.length-1):0;return{n:xs.length,mean:m,halfWidth95:xs.length>1?1.96*Math.sqrt(v/xs.length):null};}
function pair(pos){
 const s=pos.state,p=pos.seat,o=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock),all=[];
 if(o.phase!=='play'||o.drawn||o.actions.some(a=>a.type==='mixed-finish'))return null;
 for(const a of o.actions.filter(a=>a.type==='double-sequence'&&a.tiles.length===1&&!s.openingState.openedNumbers.has(a.numbers[0])))
 for(const b of o.actions.filter(a=>a.type==='single')){
  const x=a.numbers[0];if(!b.tile.includes(x))continue;const y=b.tile[0]===x?b.tile[1]:b.tile[0];if(y===x)continue;
  const gap=x-y;if(gap!==2*x-b.tile[0]-b.tile[1])throw Error('pip identity');
  const after=d.applyTurn(s.branchState,s.openingState,s.hands[p],s.stock,b).hand;
  all.push({double:ak(a),single:ak(b),x,y,gap,connectorsAfter:after.filter(t=>t[0]!==t[1]&&t.includes(x)).length});
 }
 all.sort((a,b)=>Number(b.gap>0)-Number(a.gap>0)||Math.abs(a.gap)-Math.abs(b.gap)||a.double.localeCompare(b.double)||a.single.localeCompare(b.single));
 return all[0]||null;
}
function summary(rows){return{n:rows.length,gap:ci(rows.map(r=>r.gap)),immediateNextFinishDeltaPP:ci(rows.map(r=>100*r.immediateNextFinishDelta)),nextPlayableDelta:ci(rows.map(r=>r.nextPlayableDelta)),focalFinishFirstDeltaPP:ci(rows.map(r=>100*r.winDelta)),focalRemainderDelta:ci(rows.map(r=>r.pipsDelta)),focalMinusFinishDeltaPP:ci(rows.map(r=>100*r.minusDelta)),blockDeltaPP:ci(rows.map(r=>100*r.blockDelta)),signs:{doubleBetter:rows.filter(r=>r.winDelta>0).length,connectorBetter:rows.filter(r=>r.winDelta<0).length,ties:rows.filter(r=>r.winDelta===0).length}};}
function run(start=1504940,count=6000,worlds=32){
 if(![start,count,worlds].every(Number.isInteger)||count<2||count%2||worlds<1||worlds>128)throw Error('args');
 const disc=legal.collect(start,count,count*3);if(disc.unresolved)throw Error('unresolved');
 const positives=[],negatives=[];
 for(const pos of disc.positions){const p=pair(pos);if(!p)continue;(p.gap>0?positives:negatives).push({...pos,...p});}
 const unused=new Set(negatives.map((_,i)=>i)),controls=[],matches=[];
 for(const p of positives){let best=-1,score=Infinity;
  for(const i of unused){const n=negatives[i];if(n.profile!==p.profile)continue;
   const z=100*Math.abs(Math.abs(n.gap)-p.gap)+20*Number(Boolean(n.connectorsAfter)!==Boolean(p.connectorsAfter))+Math.abs(n.focalHandSize-p.focalHandSize);
   if(z<score){score=z;best=i;}}
  if(best>=0){unused.delete(best);const n=negatives[best];controls.push(n);matches.push({positiveSeed:p.seed,negativeSeed:n.seed,profile:p.profile,absGapMatch:Math.abs(n.gap)===p.gap,connectorClassMatch:Boolean(n.connectorsAfter)===Boolean(p.connectorsAfter)});}
 }
 const rows=[],metrics=['win','pips','minus','block','nextPass','nextPlayable','immediateNextFinish','turns','remainingDoubles'];
 for(const p of [...positives,...controls]){
  const before=JSON.stringify(p.state),sums=Object.fromEntries(metrics.map(k=>[k,0]));
  for(let i=0;i<worlds;i++){const ws=(3971000000+(p.seed-start)*512+p.seat*128+i)>>>0,w=abl.sample(p,ws);
   const a=legal.rollout(w,p,p.double,p.profile,ws),b=legal.rollout(w,p,p.single,p.profile,ws);
   for(const k of metrics)sums[k]+=(a[k]-b[k])/worlds;}
  if(JSON.stringify(p.state)!==before)throw Error('state mutated');
  rows.push({seed:p.seed,seat:p.seat,profile:p.profile,turn:p.turn,x:p.x,y:p.y,gap:p.gap,
   doubleAction:p.double,connectorAction:p.single,connectorsAfter:p.connectorsAfter,focalHandSize:p.focalHandSize,
   ...Object.fromEntries(Object.entries(sums).map(([k,v])=>[k+'Delta',v]))});
 }
 const positiveRows=rows.filter(x=>x.gap>0),negativeRows=rows.filter(x=>x.gap<0);
 return{schema:'qosha-positive-gap-v1',timestampBaku:new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04',
 engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0, 3x9; number locking PROVISIONAL',
 seedStart:start,seedEnd:start+count-1,scan:disc.scan,uniqueDealsScanned:Object.values(disc.scan).reduce((a,x)=>a+x.dealsScanned,0),
 fullRoundDiscoveryContinuations:disc.fullRounds,discoveryUnresolved:disc.unresolved,
 initialLegalChoicePositions:disc.positions.length,connectorEligible:positives.length+negatives.length,
 positivePositions:positives.length,negativeMatchedPositions:controls.length,worldsPerPosition:worlds,
 hiddenWorldAllocations:rows.length*worlds,forcedCounterfactualContinuations:rows.length*worlds*2,
 strategies:['min-hand-pips','closed-branch-control'],matching:matches,summary:{positive:summary(positiveRows),negativeMatched:summary(negativeRows),
 minPipsPositive:summary(positiveRows.filter(x=>x.profile==='min-hand-pips')),branchControlPositive:summary(positiveRows.filter(x=>x.profile==='closed-branch-control'))},rows,
 seedFormula:'(3971000000+(dealSeed-seedStart)*512+seat*128+worldIndex)>>>0',
 selection:'First legal single-vs-double position with next opponent 1 stone per deal/seat; select positive X>Y connector pair if present, smallest |gap|, else smallest negative |gap|. Greedy one-to-one same-profile negative-position controls by |gap|, connector class, focal hand size.',
 limitations:'Both actions legal only under provisional number locks. Positive vs negative control positions are observational and not causal; within each position arms change discarded tile, remaining double and branch state. Correlated worlds within positions, exploratory uncorrected cluster intervals, selected late positions, pass-conditioned uniform posterior omits action likelihood, unvalidated block winner/loneZero/bust/101-point match. Finish-first != match win.',
 nextAction:'Independent holdout and X/|gap|/connector stratification; authenticate real-table four-branch locking and block winner.'};
}
function test(){const bs=e.createBranchState([1,1]);bs.branches.up.end=2;
 const fixture={state:{branchState:bs,openingState:e.createOpeningState([1]),hands:[[[1,2],[2,2],[0,1]],[],[]],stock:[]},seat:0};
 const p=pair(fixture);if(!p||p.x!==2||p.y!==1||p.gap!==1)throw Error('positive fixture');
 const a=run(1504940,300,2),b=run(1504940,300,2);delete a.timestampBaku;delete b.timestampBaku;
 if(JSON.stringify(a)!==JSON.stringify(b)||a.discoveryUnresolved||a.forcedCounterfactualContinuations!==(a.positivePositions+a.negativeMatchedPositions)*4)throw Error('replay');
 return{passed:true,positive:a.positivePositions,forced:a.forcedCounterfactualContinuations};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1504940),+(a[1]||6000),+(a[2]||32)),null,2));}
module.exports={pair,run,test,summary};