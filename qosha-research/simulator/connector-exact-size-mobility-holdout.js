'use strict';
// Exact focal/next hand-size matched held-connector holdout, with post-move mobility.
// node qosha-research/simulator/connector-exact-size-mobility-holdout.js test
// node qosha-research/simulator/connector-exact-size-mobility-holdout.js 1343840 10000 120 128 15
const c=require('./connector-lock-control');
const d=require('./turn-dispatcher');
const r=require('./round-driver');
const e=require('./engine');
const POLICIES=['min-hand-pips','closed-branch-control','fast-doubles'];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const focalSize=p=>p.state.hands[p.seat].length;
const nextSize=p=>p.state.hands[(p.seat+1)%3].length;
const thirdSize=p=>p.state.hands[(p.seat+2)%3].length;
const group=p=>[p.profile,p.number,p.pipGap,focalSize(p),nextSize(p)].join('|');
function select(positions,perSign){
 const groups=new Map(),available={negative:0,positive:0},pairs=[];
 for(const p of positions){
  const k=group(p);
  if(!groups.has(k))groups.set(k,{held:[],none:[]});
  groups.get(k)[p.remainingConnectors>0?'held':'none'].push(p);
 }
 for(const [k,g] of groups){
  const h=g.held.sort((a,b)=>a.seed-b.seed||a.seat-b.seat);
  const n=g.none.slice();
  for(const a of h){
   if(!n.length)break;
   n.sort((x,y)=>Math.abs(thirdSize(a)-thirdSize(x))*10+Math.abs(a.turn-x.turn)-
     (Math.abs(thirdSize(a)-thirdSize(y))*10+Math.abs(a.turn-y.turn))||
     x.seed-y.seed||x.seat-y.seat);
   const b=n.shift(),sign=a.pipGap<0?'negative':'positive';
   pairs.push({held:a,none:b,sign,group:k,
    thirdSizeGap:Math.abs(thirdSize(a)-thirdSize(b)),turnGap:Math.abs(a.turn-b.turn)});
   available[sign]++;
  }
 }
 pairs.sort((a,b)=>a.thirdSizeGap-b.thirdSizeGap||a.turnGap-b.turnGap||
   a.held.seed-b.held.seed||a.none.seed-b.none.seed);
 const counts={negative:0,positive:0},chosen=[];
 for(const p of pairs)if(counts[p.sign]<perSign){chosen.push(p);counts[p.sign]++;}
 return{pairs:chosen,counts,available};
}
function playableAfter(p,actionKey){
 const opts=d.turnOptions(p.state.branchState,p.state.openingState,p.state.hands[p.seat],p.state.stock);
 const action=opts.actions.find(a=>c.rollout&&
  [a.type,a.side||'',a.to??'',(a.numbers||[]).join(','),
   (a.tiles||[a.tile].filter(Boolean)).map(e.tileKey).join(',')].join('|')===actionKey);
 if(!action)throw Error('missing action for mobility');
 const after=r.stepRound(p.state,()=>action);
 const hand=after.hands[p.seat];
 return hand.filter(t=>d.actionsForHand(after.branchState,after.openingState,[t]).length>0).length;
}
function summarize(rows){
 if(!rows.length)return null;
 const fields=['win','pass','pips','minus','block','nextActions','ownPlayable'];
 const o={n:rows.length,uniqueSeeds:new Set(rows.map(x=>x.seed??x.heldSeed)).size};
 for(const field of fields)o[field+'Mean']=mean(rows.map(x=>x[field]));
 const m=o.winMean,ss=rows.reduce((s,x)=>s+(x.win-m)**2,0);
 const se=rows.length>1?Math.sqrt(ss/(rows.length*(rows.length-1))):null;
 o.winGainPP=100*m;
 o.exploratory3SEPP=se===null?null:[100*(m-3*se),100*(m+3*se)];
 return o;
}
function run(start=1343840,count=10000,cap=120,worldLimit=128,perSign=15){
 const found=c.collect(start,count,cap),sel=select(found.positions,perSign);
 if(sel.counts.negative!==perSign||sel.counts.positive!==perSign)
  throw Error('insufficient exact hand-size matches: '+JSON.stringify(sel.available));
 const rows=[],pairRows=[];let allocations=0,exact=0;
 for(let i=0;i<sel.pairs.length;i++){
  const pair=sel.pairs[i],values={};
  for(const label of ['held','none']){
   const p=pair[label],frozen=JSON.stringify(p.state),w=c.worlds(p,worldLimit);
   allocations+=w.states.length;exact+=+w.exact;values[label]={};
   const ownPlayable=playableAfter(p,p.connector)-playableAfter(p,p.nonconnector);
   for(const policy of POLICIES){
    const sums={win:0,pass:0,pips:0,minus:0,block:0,nextActions:0};
    for(const state of w.states){
     const a=c.rollout(state,p.connector,policy,p.seat);
     const b=c.rollout(state,p.nonconnector,policy,p.seat);
     sums.win+=a.win-b.win;sums.pass+=a.nextPass-b.nextPass;
     sums.pips+=a.pips-b.pips;sums.minus+=a.minus-b.minus;
     sums.block+=a.block-b.block;sums.nextActions+=a.nextActions-b.nextActions;
    }
    const v=Object.fromEntries(Object.entries(sums).map(([k,n])=>[k,n/w.states.length]));
    v.ownPlayable=ownPlayable;values[label][policy]=v;
    rows.push({pair:i,sign:pair.sign,group:pair.group,retained:label==='held',
     seed:p.seed,seat:p.seat,profile:p.profile,double:p.number,pipGap:p.pipGap,
     focalHandSize:focalSize(p),nextHandSize:nextSize(p),thirdHandSize:thirdSize(p),
     otherConnectors:p.remainingConnectors,worlds:w.states.length,exact:w.exact,policy,...v});
   }
   if(JSON.stringify(p.state)!==frozen)throw Error('visible state mutated');
  }
  for(const policy of POLICIES){
   const h=values.held[policy],n=values.none[policy];
   const delta=Object.fromEntries(Object.keys(h).map(k=>[k,h[k]-n[k]]));
   pairRows.push({pair:i,sign:pair.sign,group:pair.group,policy,
    heldSeed:pair.held.seed,noneSeed:pair.none.seed,
    thirdSizeGap:pair.thirdSizeGap,turnGap:pair.turnGap,...delta});
  }
 }
 const summary={};
 for(const policy of POLICIES){
  const a=rows.filter(x=>x.policy===policy),b=pairRows.filter(x=>x.policy===policy);
  summary[policy]={held:summarize(a.filter(x=>x.retained)),
   noExtra:summarize(a.filter(x=>!x.retained)),
   matchedDifference:summarize(b),
   negative:summarize(b.filter(x=>x.sign==='negative')),
   positive:summarize(b.filter(x=>x.sign==='positive'))};
 }
 return{schema:'qosa-connector-exact-size-mobility/v1',
  timestampAsiaBaku:new Date(Date.now()+4*3600000).toISOString().slice(0,19)+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  seedStart:start,seedEnd:start+count-1,discoveryCap:cap,worldLimit,
  scanned:found.scanned,discoveredPositions:found.positions.length,
  availablePairs:sel.available,selectedPairs:sel.pairs.length,
  selectedPositions:sel.pairs.length*2,signCounts:sel.counts,
  selectedSeeds:new Set(rows.map(x=>x.seed)).size,hiddenAllocations:allocations,
  exactPositions:exact,forcedContinuations:allocations*2*POLICIES.length,
  fullStrategyRoundsAdded:0,policies:POLICIES,
  matching:'Exact discovery policy, double number, signed pip gap, focal hand size and next clockwise opponent hand size. Greedy minimal third hand-size/turn gap, balanced signs; selection before rollout.',
  ownPlayableDefinition:'Difference in number of distinct tiles in focal hand immediately playable on resulting board after forced move; NOT actual future-turn mobility.',
  limitations:'Observational matched DIFFERENT positions and hidden allocations; not causal. Third-player size/turn/history/hand content and endpoint geometry not exactly matched. Within-position worlds paired, but between-position worlds not. Branch rules provisional, no block winner, fixed bots, uniform pass-compatible worlds ignore action likelihood; exploratory pair 3SE without multiplicity correction.',
  next:'Independent full-deal test of a policy that preserves own immediately playable connectors only when it improves own mobility; matched seeds and opponents; run Node CLI.',
  summary,rows,pairRows};
}
function test(){
 const a=run(1343840,6500,60,2,2),b=run(1343840,6500,60,2,2);
 delete a.timestampAsiaBaku;delete b.timestampAsiaBaku;
 if(JSON.stringify(a)!==JSON.stringify(b)||a.selectedPairs!==4||
 a.forcedContinuations!==a.hiddenAllocations*6||
 a.rows.some(x=>!Number.isFinite(x.win)||!Number.isFinite(x.ownPlayable)))throw Error('replay');
 for(const p of a.pairRows){
  const pair=a.rows.filter(x=>x.pair===p.pair&&x.policy===p.policy);
  if(pair.length!==2||pair[0].focalHandSize!==pair[1].focalHandSize||
   pair[0].nextHandSize!==pair[1].nextHandSize||
   pair[0].pipGap!==pair[1].pipGap||pair[0].double!==pair[1].double||
   pair[0].profile!==pair[1].profile)throw Error('exact matching');
 }
 return{passed:true,pairs:a.selectedPairs,allocations:a.hiddenAllocations};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1343840),
  +(a[1]||10000),+(a[2]||120),+(a[3]||128),+(a[4]||15)),null,2));
}
module.exports={run,test,select,playableAfter};