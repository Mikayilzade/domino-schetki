'use strict';
// Equal-primary-score different-tile first disagreement: links, geometry, opponent stage.
// node qosha-research/simulator/first-tile-link-controls.js test
// node qosha-research/simulator/first-tile-link-controls.js run 824000 2000
const e=require('./engine'),init=require('./initializer'),round=require('./round-driver');
const first=require('./first-tile-disagreement'),links=require('./first-tile-link-strata');
const prior=require('./tiebreak-priority-holdout'),canonical=require('./canonical-multiset-holdout');
function blank(){return{n:0,wH:0,wL:0,minusH:0,minusL:0,blockH:0,blockL:0,pH:0,pL:0,discordH:0,discordL:0,seeds:{}};}
function add(g,h,l,seed){
 g.n++;g.wH+=Number(h.finishFirst);g.wL+=Number(l.finishFirst);
 g.minusH+=Number(h.minus<0);g.minusL+=Number(l.minus<0);
 g.blockH+=Number(h.outcome==='block');g.blockL+=Number(l.outcome==='block');
 g.pH+=h.remainder;g.pL+=l.remainder;
 g.discordH+=Number(h.finishFirst&&!l.finishFirst);g.discordL+=Number(!h.finishFirst&&l.finishFirst);
 const x=g.seeds[seed]||(g.seeds[seed]={n:0,d:0});x.n++;x.d+=Number(h.finishFirst)-Number(l.finishFirst);
}
function finish(g){
 if(!g.n)return{n:0};
 const n=g.n,d=(g.wH-g.wL)/n,rows=Object.values(g.seeds),N=rows.length;
 const se=N>1?Math.sqrt(N/(N-1)*rows.reduce((s,x)=>s+(x.d-d*x.n)**2,0)/(n*n)):null;
 return{n,seeds:N,finishHigh:g.wH/n,finishLow:g.wL/n,finishDelta:d,
  cluster95:se===null?null:[d-1.96*se,d+1.96*se],
  meanPipsHigh:g.pH/n,meanPipsLow:g.pL/n,minusHigh:g.minusH/n,minusLow:g.minusL/n,
  blockHigh:g.blockH/n,blockLow:g.blockL/n,discordHigh:g.discordH,discordLow:g.discordL};
}
function endSignature(s){
 const opened=s.openingState.openedNumbers;
 return e.SIDES.filter(k=>s.branchState.branches[k].active)
  .map(k=>s.branchState.branches[k].end).filter(n=>opened.has(n))
  .sort((a,b)=>a-b).join(',');
}
function directedInvariant(){
 const deck=e.createDoubleSixDeck().filter(t=>t[0]!==t[1]);
 const moves=deck.flatMap(t=>[
  {tile:e.tileKey(t),from:t[0],to:t[1],pips:t[0]+t[1]},
  {tile:e.tileKey(t),from:t[1],to:t[0],pips:t[0]+t[1]}]);
 let checked=0;
 const delta=x=>Array.from({length:7},(_,k)=>Number(k===x.to)-Number(k===x.from)).join(',');
 for(let i=0;i<moves.length;i++)for(let j=i+1;j<moves.length;j++){
  const a=moves[i],b=moves[j];
  if(a.tile===b.tile||a.pips!==b.pips)continue;
  checked++;
  if(delta(a)===delta(b))throw Error('distinct equal-pip tiles yield same end multiset');
 }
 return{distinctEqualPipDirectedPairs:checked,sameEndMultisetEffects:0};
}
function run({startSeed=824000,count=2000,withBaseline=true}={}){
 const keys=['all','sameDiversity','sameNextActions','sameBoth','nextOpp1to2','nextOpp3to5','nextOpp6plus',
  'ownHand1to3','ownHand4to6','ownHand7plus','highLinks2plus','highLinks1',
  ...prior.POLICIES.map(p=>'policy_'+p)];
 const groups=Object.fromEntries(keys.map(k=>[k,blank()]));
 const meta={scanned:0,firstDisagreements:0,linkDifferent:0,exactEndMultisetSame:0,
  sourceMutations:0,primaryScoreMismatches:0,examples:[]};
 for(let seed=startSeed;seed<startSeed+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('init '+seed);
  for(let rotation=0;rotation<3;rotation++){
   meta.scanned++;
   const f=first.firstDisagreement(base,seed,rotation);if(!f)continue;
   meta.firstDisagreements++;
   if(prior.cmpPrimary(f.policy,f.legacy,f.tileFirst)!==0)meta.primaryScoreMismatches++;
   const l1=links.linkCount(links.afterHand(f.state,f.legacy));
   const l2=links.linkCount(links.afterHand(f.state,f.tileFirst));
   if(l1===l2)continue;
   meta.linkDifferent++;
   const original=JSON.stringify(f.state);
   const a=first.forced(f,f.legacy),b=first.forced(f,f.tileFirst);
   if(JSON.stringify(f.state)!==original)meta.sourceMutations++;
   const sa=round.stepRound(f.state,()=>f.legacy),sb=round.stepRound(f.state,()=>f.tileFirst);
   const da=links.accessibleEndDiversity(sa),db=links.accessibleEndDiversity(sb);
   if(endSignature(sa)===endSignature(sb))meta.exactEndMultisetSame++;
   const ma=a.immediate?a.immediate.actions:null,mb=b.immediate?b.immediate.actions:null;
   const h=l1>l2?a:b,l=l1>l2?b:a;
   const opp=f.state.hands[(f.state.currentPlayer+1)%3].length;
   const own=f.state.hands[f.state.currentPlayer].length;
   const record=k=>add(groups[k],h,l,seed);
   record('all');record('policy_'+f.policy);
   if(da===db)record('sameDiversity');
   if(ma!==null&&ma===mb)record('sameNextActions');
   if(da===db&&ma!==null&&ma===mb)record('sameBoth');
   record(opp<=2?'nextOpp1to2':opp<=5?'nextOpp3to5':'nextOpp6plus');
   record(own<=3?'ownHand1to3':own<=6?'ownHand4to6':'ownHand7plus');
   record(Math.max(l1,l2)>=2?'highLinks2plus':'highLinks1');
   if(meta.examples.length<8&&h.finishFirst!==l.finishFirst)
    meta.examples.push({seed,rotation,turn:f.turn,policy:f.policy,
     highTile:e.tileKey(l1>l2?f.legacy.tile:f.tileFirst.tile),
     lowTile:e.tileKey(l1>l2?f.tileFirst.tile:f.legacy.tile),
     highLinks:Math.max(l1,l2),lowLinks:Math.min(l1,l2),own,opp,
     sameDiversity:da===db,sameNextActions:ma===mb,highWon:h.finishFirst,lowWon:l.finishFirst});
  }
 }
 if(meta.sourceMutations||meta.primaryScoreMismatches||meta.exactEndMultisetSame)
  throw Error('invariants '+JSON.stringify(meta));
 const result={schema:'qosa-link-geometry-controls/v1',engine:'qosa-research-0.5.3',
  rules:'qosa-1.0.0',mode:'3x9',seedRange:startSeed+'..'+(startSeed+count-1),
  deals:count,rotations:3,strategies:prior.POLICIES,
  forcedContinuations:meta.linkDifferent*2,meta,combinatorial:directedInvariant(),
  groups:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,finish(v)])),
  limits:'Equal-primary-score different-tile first disagreement; fully observed deterministic forced continuation, not a hidden-world posterior. Observational strata and exploratory seed-cluster intervals; assumed branch rules, block winner unassigned.'};
 if(withBaseline){
  const x=canonical.run({startSeed,count}),b=x.byMode['canonical-multiset'];
  if(b.rounds!==count*3||b.unresolved)throw Error('baseline invalid');
  result.baseline={rounds:b.rounds,finishes:b.finishes,blocks:b.blocks,
   meanTurns:b.meanTurns,byStrategy:b.byStrategy};
 }
 return result;
}
function test(){
 const a=run({startSeed:859000,count:16,withBaseline:false});
 const b=run({startSeed:859000,count:16,withBaseline:false});
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('not deterministic');
 if(a.meta.scanned!==48||a.meta.linkDifferent!==4||a.forcedContinuations!==8)
  throw Error('accounting regression');
 if(a.combinatorial.sameEndMultisetEffects!==0)throw Error('geometry invariant');
 return{passed:true,seeds:a.seedRange,positions:a.meta.linkDifferent,
  directedEqualPipPairs:a.combinatorial.distinctEqualPipDirectedPairs};
}
if(require.main===module){
 const mode=process.argv[2]||'test';
 console.log(JSON.stringify(mode==='test'?test():run({
  startSeed:Number(process.argv[3]||824000),count:Number(process.argv[4]||2000)}),null,2));
}
module.exports={run,test,directedInvariant,endSignature};
