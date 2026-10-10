'use strict';
// Exact fixed-visible hidden-world enumeration, late-game 3x9.
// node qosha-research/simulator/exact-late-double-runner.js test
// node qosha-research/simulator/exact-late-double-runner.js 74000 76000 50
const e=require('./engine'),r=require('./round-driver'),d=require('./turn-dispatcher');
const hw=require('./hidden-world'),reg=require('./decision-regret');
const late=require('./late-double-threat-runner'),num=require('./late-double-number-control-runner');
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
function combinations(n,k){let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);}
function exactWorlds(p){
 const s=p.state,f=p.focal;if(s.stock.length)throw Error('stock must be empty');
 const opp=[0,1,2].filter(i=>i!==f);
 const pool=hw.hiddenPool({focalHand:s.hands[f],knownTiles:p.known});
 const k=s.hands[opp[0]].length,n=pool.length,worlds=[],seen=new Set();
 if(n!==k+s.hands[opp[1]].length)throw Error('hidden count mismatch');
 function emit(ids){
  const used=new Set(ids),w=r.cloneRoundState(s);
  w.hands[opp[0]]=ids.map(i=>pool[i].slice());
  w.hands[opp[1]]=pool.filter((t,i)=>!used.has(i)).map(t=>t.slice());
  const signature=opp.map(i=>w.hands[i].map(e.tileKey).sort().join(',')).join('|');
  if(seen.has(signature))throw Error('duplicate allocation');seen.add(signature);
  const all=[...w.hands.flat(),...p.known].map(e.tileKey);
  if(all.length!==28||new Set(all).size!==28)throw Error('deck integrity');
  worlds.push(w);
 }
 function rec(i,ids){
  if(ids.length===k){emit(ids);return;}
  for(let j=i;j<=n-(k-ids.length);j++)rec(j+1,[...ids,j]);
 }
 rec(0,[]);
 if(worlds.length!==combinations(n,k))throw Error('world count mismatch');
 return worlds;
}
function analyze(p){
 const s=p.state,before=JSON.stringify(s),worlds=exactWorlds(p);
 const opts=d.turnOptions(s.branchState,s.openingState,s.hands[p.focal],s.stock);
 const actionMap=new Map(opts.actions.map(a=>[reg.actionKey(a),a]));
 const open=p.group.open,keep=p.group.keep,keys=[...new Set([...open,...keep])];
 if(!open.length||!keep.length)throw Error('empty class');
 for(const key of keys)if(!actionMap.has(key))throw Error('missing action');
 const expected=hw.candidateKeys(s).join('|'),samples={},threats=[];
 for(const policy of policies)samples[policy]=[];
 let continuations=0;
 function classMean(map,ks,fn){return mean(ks.map(key=>fn(map.get(key))));}
 for(let i=0;i<worlds.length;i++){
  const w=worlds[i];
  if(hw.candidateKeys(w).join('|')!==expected)throw Error('candidate drift');
  const t=new Map(keys.map(key=>[key,late.threat(w,actionMap.get(key),p.next)]));
  threats.push({finish:classMean(t,open,x=>x.finish)-classMean(t,keep,x=>x.finish),
    minus10:classMean(t,open,x=>x.minus10)-classMean(t,keep,x=>x.minus10)});
  for(const policy of policies){
   const ev=reg.evaluateDecisionInWorld(w,{focalPlayer:p.focal,continuationStrategy:policy,
    seed:14000000+1000*p.seed+i,maxTurns:200});
   if(ev.kind!=='paired-world')throw Error('not a choice');
   continuations+=ev.candidates.length;
   const m=new Map(ev.candidates.map(c=>[c.actionKey,c]));
   for(const key of keys)if(!m.has(key)||m.get(key).outcome==='unresolved')throw Error('missing/unresolved');
   samples[policy].push({
    finish:classMean(m,keep,x=>+x.focalFinishedFirst)-classMean(m,open,x=>+x.focalFinishedFirst),
    pips:classMean(m,keep,x=>x.focalRemainder)-classMean(m,open,x=>x.focalRemainder),
    minus:classMean(m,keep,x=>+(x.focalMinus<0))-classMean(m,open,x=>+(x.focalMinus<0)),
    block:classMean(m,keep,x=>+(x.outcome==='block'))-classMean(m,open,x=>+(x.outcome==='block'))
   });
  }
 }
 if(JSON.stringify(s)!==before)throw Error('state mutated');
 const delta={};
 for(const policy of policies){
  delta[policy]={};
  for(const metric of ['finish','pips','minus','block'])delta[policy][metric]=mean(samples[policy].map(x=>x[metric]));
 }
 return{seed:p.seed,turn:p.turn,focal:p.focal,next:p.next,target:p.group.x,
  hand:s.hands[p.focal].map(e.tileKey),handSizes:s.hands.map(h=>h.length),
  ends:e.SIDES.map(side=>s.branchState.branches[side].end),
  opened:[...s.openingState.openedNumbers].sort(),open,keep,
  exactAllocations:worlds.length,continuations,
  immediateOpenMinusKeep:{finish:mean(threats.map(x=>x.finish)),minus10:mean(threats.map(x=>x.minus10))},
  preserveMinusOpen:delta};
}
function stats(a){
 if(!a.length)return null;
 const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;
 return{n:a.length,mean:m,exploratoryPositionCI95:[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)],
  positive:a.filter(x=>x>0).length,negative:a.filter(x=>x<0).length,zero:a.filter(x=>x===0).length};
}
function summarize(rows){
 const groups={all:rows,zero:rows.filter(x=>x.target===0),nonzero:rows.filter(x=>x.target!==0)},out={};
 for(const [name,rs] of Object.entries(groups)){
  const cell={positions:rs.length,exactAllocations:rs.reduce((s,x)=>s+x.exactAllocations,0)};
  for(const policy of policies){
   cell[policy]={};
   for(const metric of ['finish','pips','minus','block'])cell[policy][metric]=stats(rs.map(x=>x.preserveMinusOpen[policy][metric]));
  }
  cell.immediateThreat={finish:stats(rs.map(x=>x.immediateOpenMinusKeep.finish)),
   minus10:stats(rs.map(x=>x.immediateOpenMinusKeep.minus10))};
  out[name]=cell;
 }
 return out;
}
function run({start=74000,end=76000,quota=50}={}){
 const {buckets,scanned}=num.collect(start,end,quota,'closed-branch-control');
 const rows=[...buckets.zero,...buckets.nonzero].map(analyze);
 return{schema:'qosa-exact-late-double/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9',start,end,quota,scannedDeals:scanned,positions:rows.length,
  exactHiddenAllocations:rows.reduce((s,x)=>s+x.exactAllocations,0),
  candidateContinuations:rows.reduce((s,x)=>s+x.continuations,0),
  newFullStrategyRounds:0,policies,
  selection:'first strict eligible position per deal, quotas 50 X=0 and 50 X>0, not prevalence weighted',
  weighting:'all distinct allocations of unseen tiles to opponent hands, equal weight; stock empty',
  continuationSeedFormula:'14000000+1000*dealSeed+lexicographicAllocationIndex',
  comparison:'connector retaining X-X vs opening X-X; equal action-class and position weights',
  limitations:'Uniform hidden allocations ignore information from opponents previous decisions; bot continuations, assumed branch semantics, block winner unassigned, exploratory position CI.',
  summary:summarize(rows),rows};
}
function selfTest(){
 for(const [seed,n] of [[74212,10],[75135,6]]){
  const p=late.collect(seed,seed+1,1).positions[0];
  if(!p||exactWorlds(p).length!==n)throw Error('regression count '+seed);
  if(JSON.stringify(analyze(p))!==JSON.stringify(analyze(p)))throw Error('non-deterministic');
 }
 return{passed:true,seeds:[74212,75135],exactWorlds:[10,6]};
}
if(require.main===module){
 const [a,b,c]=process.argv.slice(2);
 console.log(JSON.stringify(a==='test'?selfTest():run({start:+(a||74000),end:+(b||76000),quota:+(c||50)}),null,2));
}
module.exports={combinations,exactWorlds,analyze,stats,summarize,run,selfTest};