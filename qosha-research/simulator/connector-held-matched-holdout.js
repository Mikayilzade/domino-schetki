'use strict';
// Independent matched pre-action holdout: connector retained vs no extra connector.
// Usage: node qosha-research/simulator/connector-held-matched-holdout.js test
//        node qosha-research/simulator/connector-held-matched-holdout.js 1331840 9000 55 128 15
const c=require('./connector-lock-control');
const POLICIES=['min-hand-pips','closed-branch-control','fast-doubles'];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const next=p=>p.state.hands[(p.seat+1)%3].length;
const size=p=>p.state.hands[p.seat].length;
const group=p=>[p.profile,p.number,p.pipGap,size(p)<=5?'short':'long'].join('|');
function select(positions,perSign){
 const groups=new Map();
 for(const p of positions){const k=group(p);if(!groups.has(k))groups.set(k,{held:[],none:[]});groups.get(k)[p.remainingConnectors>0?'held':'none'].push(p);}
 const possible=[];
 for(const [k,g] of groups){
  const yes=g.held.slice().sort((a,b)=>a.seed-b.seed||a.seat-b.seat),no=g.none.slice();
  for(const h of yes){if(!no.length)break;
   const dist=n=>10*Math.abs(next(h)-next(n))+5*Math.abs(size(h)-size(n))+Math.abs(h.turn-n.turn);
   no.sort((a,b)=>dist(a)-dist(b)||a.seed-b.seed||a.seat-b.seat);
   const n=no.shift();
   possible.push({group:k,sign:h.pipGap<0?'negative':'positive',held:h,none:n,distance:dist(n)});
  }
 }
 possible.sort((a,b)=>a.distance-b.distance||a.held.seed-b.held.seed||a.none.seed-b.none.seed||a.group.localeCompare(b.group));
 const counts={negative:0,positive:0},pairs=[];
 for(const p of possible)if(counts[p.sign]<perSign){counts[p.sign]++;pairs.push(p);}
 return{pairs,counts,available:{negative:possible.filter(x=>x.sign==='negative').length,positive:possible.filter(x=>x.sign==='positive').length}};
}
function stats(a){
 if(!a.length)return null;
 const m=k=>mean(a.map(x=>x[k]));
 const interval=k=>{if(a.length<2)return null;const v=m(k),se=Math.sqrt(a.reduce((s,x)=>s+(x[k]-v)**2,0)/(a.length-1)/a.length);return[100*(v-3*se),100*(v+3*se)];};
 return{n:a.length,uniqueSeeds:new Set(a.map(x=>x.seed??x.heldSeed)).size,winGainPP:100*m('win'),win3SEPP:interval('win'),passGainPP:100*m('pass'),finalPipsDelta:m('pips'),minusGainPP:100*m('minus'),blockGainPP:100*m('block')};
}
function run(start=1331840,count=9000,cap=55,worldLimit=128,perSign=15){
 const discovered=c.collect(start,count,cap),chosen=select(discovered.positions,perSign);
 if(chosen.counts.negative!==perSign||chosen.counts.positive!==perSign)throw Error('sign quotas '+JSON.stringify(chosen));
 const rows=[],pairs=[];let allocations=0,exact=0;
 for(let i=0;i<chosen.pairs.length;i++){
  const pair=chosen.pairs[i],values={};
  for(const label of ['held','none']){
   const p=pair[label],before=JSON.stringify(p.state),w=c.worlds(p,worldLimit);
   allocations+=w.states.length;exact+=+w.exact;values[label]={};
   for(const policy of POLICIES){
    const sums={win:0,pass:0,pips:0,minus:0,block:0};
    for(const state of w.states){
     const a=c.rollout(state,p.connector,policy,p.seat),b=c.rollout(state,p.nonconnector,policy,p.seat);
     sums.win+=a.win-b.win;sums.pass+=a.nextPass-b.nextPass;
     sums.pips+=a.pips-b.pips;sums.minus+=a.minus-b.minus;sums.block+=a.block-b.block;
    }
    const v=Object.fromEntries(Object.entries(sums).map(([k,n])=>[k,n/w.states.length]));
    values[label][policy]=v;
    rows.push({pair:i,group:pair.group,sign:pair.sign,retained:label==='held',policy,
     seed:p.seed,seat:p.seat,turn:p.turn,number:p.number,pipGap:p.pipGap,
     focalHandSize:size(p),nextHandSize:next(p),remainingConnectors:p.remainingConnectors,
     worlds:w.states.length,exact:w.exact,...v});
   }
   if(JSON.stringify(p.state)!==before)throw Error('source mutation');
  }
  for(const policy of POLICIES){
   const h=values.held[policy],n=values.none[policy],delta=Object.fromEntries(Object.keys(h).map(k=>[k,h[k]-n[k]]));
   pairs.push({pair:i,group:pair.group,sign:pair.sign,policy,
    heldSeed:pair.held.seed,noneSeed:pair.none.seed,distance:pair.distance,...delta});
  }
 }
 const summary={};
 for(const policy of POLICIES){
  const a=rows.filter(x=>x.policy===policy),b=pairs.filter(x=>x.policy===policy);
  summary[policy]={held:stats(a.filter(x=>x.retained)),noExtra:stats(a.filter(x=>!x.retained)),
   matchedEffectDifference:stats(b),negative:stats(b.filter(x=>x.sign==='negative')),
   positive:stats(b.filter(x=>x.sign==='positive'))};
 }
 return{schema:'qosa-connector-held-matched-holdout/v1',
  timestampAsiaBaku:new Date(Date.now()+4*3600000).toISOString().slice(0,19)+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  seedStart:start,seedEnd:start+count-1,discoveryCap:cap,worldLimit,
  discoveredPositions:discovered.positions.length,scanned:discovered.scanned,
  selectedPairs:chosen.pairs.length,selectedPositions:2*chosen.pairs.length,
  signCounts:chosen.counts,availableSignPairs:chosen.available,
  distinctSelectedSeeds:new Set(rows.map(x=>x.seed)).size,hiddenAllocations:allocations,
  exactPositions:exact,forcedContinuations:allocations*2*POLICIES.length,newFullRounds:0,
  policies:POLICIES,
  matching:'Before rollout, match by discovery bot, double number, exact signed pip gap (determines alternative endpoint), focal hand size <=5/>5. Greedy closest next-hand-size, focal size and turn. Balance 15 negative and 15 positive sign pairs.',
  limitations:'Observational between-position matching, not causal. Paired hidden worlds only WITHIN each position. Different held/not-held hands and turns remain confounders. Assumed branch rules, block without winner, uniform pass-compatible worlds omit choice likelihood, fixed bots, first eligible positions; exploratory 3SE intervals do not correct for multiple comparisons or seed dependence.',
  next:'Repeat on independent seeds with tighter exact hand-size and next-player-size matching; focus on same-position tactical alternatives if matched connector effect remains unstable.',
  summary,pairs,rows};
}
function test(){
 const a=run(1331840,1000,15,2,1),b=run(1331840,1000,15,2,1);
 delete a.timestampAsiaBaku;delete b.timestampAsiaBaku;
 if(JSON.stringify(a)!==JSON.stringify(b)||a.selectedPairs!==2||a.forcedContinuations!==a.hiddenAllocations*6)
  throw Error('deterministic replay mismatch');
 return{passed:true,pairs:a.selectedPairs,allocations:a.hiddenAllocations};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():
 run(+(a[0]||1331840),+(a[1]||9000),+(a[2]||55),+(a[3]||128),+(a[4]||15)),null,2));}
module.exports={run,test,select};