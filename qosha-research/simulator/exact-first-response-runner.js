'use strict';
// Exact hidden-allocation first-opponent reply audit, equal-pip connector vs unrelated.
// Run: node qosha-research/simulator/exact-first-response-runner.js test
// Run: node qosha-research/simulator/exact-first-response-runner.js 1100000 1180000 30
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const hold=require('./two-opponent-conditional-holdout');
const exact=require('./exact-late-double-runner');
const reg=require('./decision-regret');
const choose=require('./strategy-runner').chooseBy;
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function stats(a){
 if(!a.length)return null;
 const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;
 return {n:a.length,mean:m,exploratoryPositionCI95:a.length>1?[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)]:null,
 positive:a.filter(x=>x>0).length,zero:a.filter(x=>x===0).length,negative:a.filter(x=>x<0).length};
}
function firstResponse(world,action,policy,seed){
 const f=world.currentPlayer,next=(f+1)%3;
 const afterFocal=r.stepRound(world,opts=>opts.actions.find(a=>reg.actionKey(a)===reg.actionKey(action)));
 if(afterFocal.outcome)return {kind:'no-reply',finished:+(afterFocal.outcome.kind==='finish'&&afterFocal.outcome.playerIndex===next),available:0};
 if(afterFocal.currentPlayer!==next)throw Error('next player mismatch');
 const options=d.turnOptions(afterFocal.branchState,afterFocal.openingState,afterFocal.hands[next],afterFocal.stock);
 const a=options.phase==='play'?choose(policy,options,{seed,turns:afterFocal.turns,player:next}):null;
 const result=r.stepRound(afterFocal,()=>a);
 return {kind:a?a.type:'pass',tileKeys:a?(a.tiles||[a.tile]).map(e.tileKey).sort().join(','):'',
 side:a?(a.side||''):'',actionKey:a?reg.actionKey(a):'pass',available:options.actions.length,
 finished:+!!(result.outcome&&result.outcome.kind==='finish'&&result.outcome.playerIndex===next)};
}
function category(a,b){
 if(a.kind==='no-reply'||b.kind==='no-reply')return 'no-reply';
 if(a.kind==='pass'&&b.kind==='pass')return 'both-pass';
 if(a.kind==='pass'||b.kind==='pass')return 'pass-flip';
 if(a.kind!==b.kind)return 'action-type-change';
 if(a.tileKeys!==b.tileKeys)return 'different-tile';
 if(a.side!==b.side)return 'same-tile-different-side';
 return a.actionKey===b.actionKey?'same-action':'same-tile-other-placement';
}
function analyze(p){
 const s=p.state,f=s.currentPlayer,before=JSON.stringify(s);
 if(s.stock.length)throw Error('exact experiment requires empty stock');
 const opts=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock);
 const actions=new Map(opts.actions.map(a=>[reg.actionKey(a),a]));
 const ca=actions.get(p.pair.connector),oa=actions.get(p.pair.other);
 if(!ca||!oa||ca.type!=='single'||oa.type!=='single'||e.pipSum([ca.tile])!==e.pipSum([oa.tile]))throw Error('bad comparison');
 const worlds=exact.exactWorlds({...p,focal:f});
 const data=Object.fromEntries(policies.map(k=>[k,[]]));
 let continuations=0;
 for(let i=0;i<worlds.length;i++){
  const w=worlds[i],seed=49000000+1000*p.seed+i;
  for(const policy of policies){
   const cr=firstResponse(w,ca,policy,seed),or=firstResponse(w,oa,policy,seed);
   const ev=reg.evaluateDecisionInWorld(w,{focalPlayer:f,continuationStrategy:policy,seed,maxTurns:200});
   if(ev.kind!=='paired-world')throw Error('no paired evaluation');
   continuations+=ev.candidates.length;
   const map=new Map(ev.candidates.map(z=>[z.actionKey,z])),c=map.get(p.pair.connector),o=map.get(p.pair.other);
   if(!c||!o||c.outcome==='unresolved'||o.outcome==='unresolved')throw Error('missing or unresolved candidate');
   data[policy].push({category:category(cr,or),firstOpponentFinish:cr.finished-or.finished,
    nextAvailable:cr.available-or.available,finish:+c.focalFinishedFirst- +o.focalFinishedFirst,
    pips:c.focalRemainder-o.focalRemainder,minus:+(c.focalMinus<0)- +(o.focalMinus<0),
    block:+(c.outcome==='block')- +(o.outcome==='block')});
  }
 }
 if(JSON.stringify(s)!==before)throw Error('visible state mutated');
 const metrics=['finish','pips','minus','block','firstOpponentFinish','nextAvailable'];
 return {seed:p.seed,turn:p.turn,x:p.x,focal:f,handSizes:s.hands.map(h=>h.length),
  sides:[ca.side,oa.side],fourEnds:e.SIDES.map(side=>s.branchState.branches[side].end),
  pair:p.pair,exactAllocations:worlds.length,continuations,
  policy:Object.fromEntries(policies.map(k=>[k,{...Object.fromEntries(metrics.map(m=>[m,mean(data[k].map(v=>v[m]))])),
    responseCategories:Object.fromEntries([...new Set(data[k].map(v=>v.category))].sort().map(cat=>[cat,data[k].filter(v=>v.category===cat).length])),
    changedRate:mean(data[k].map(v=>+(v.category!=='same-action'&&v.category!=='both-pass'))),
    passFlipRate:mean(data[k].map(v=>+(v.category==='pass-flip'))),
    differentTileRate:mean(data[k].map(v=>+(v.category==='different-tile')))}]))};
}
function summarize(rows){
 const out={};
 for(const [name,group] of Object.entries({all:rows,zero:rows.filter(x=>x.x===0),nonzero:rows.filter(x=>x.x!==0)})){
  out[name]={positions:group.length,exactAllocations:group.reduce((s,x)=>s+x.exactAllocations,0)};
  for(const policy of policies){
   const metrics=['finish','pips','minus','block','firstOpponentFinish','nextAvailable','changedRate','passFlipRate','differentTileRate'];
   out[name][policy]=Object.fromEntries(metrics.map(m=>[m,stats(group.map(x=>x.policy[policy][m]))]));
   const counts={};
   for(const row of group)for(const [cat,n] of Object.entries(row.policy[policy].responseCategories))counts[cat]=(counts[cat]||0)+n;
   out[name][policy].responseCategories=counts;
  }
 }
 return out;
}
function run({start=1100000,end=1180000,limit=30}={}){
 const found=hold.collect(start,end,limit),rows=found.out.map(analyze);
 if(!rows.length)throw Error('no eligible positions');
 return {schema:'qosa-exact-first-response/v1',
  timestampAsiaBaku:new Date(Date.now()+14400000).toISOString().slice(0,19)+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',start,end,limit,
  scannedDeals:found.scanned,positions:rows.length,selectedSeeds:rows.map(x=>x.seed),
  exactHiddenAllocations:rows.reduce((s,x)=>s+x.exactAllocations,0),
  candidateContinuations:rows.reduce((s,x)=>s+x.continuations,0),newFullStrategyRounds:0,
  priorVerifiedFullStrategyRounds:180000,continuationSeedFormula:'49000000+1000*dealSeed+lexicographicAllocationIndex',
  selection:'min-hand-pips discovery; first eligible per deal; equal-pip connector X-Y vs unrelated legal single, both keep X-X',
  comparison:'connector minus unrelated in identical exhaustive hidden worlds, 3 continuation policies',
  weighting:'uniform allocations within each visible position, then equal weight per position; no stock',
  policies,summary:summarize(rows),rows,
  limitations:'Response categories are post-action mediators and not causal controls. Hidden allocation uniformity ignores earlier observed opponent choices; model-only bot continuations; assumed branch opening; block winner unassigned; first-eligible selection; position CIs exploratory.',
  next:'independent-seed replication and category-conditioned finish analysis, especially forced passes vs changed reply tiles; inspect four-end changes without assuming causal independence.'};
}
function selfTest(){
 const a=run({start:1100000,end:1120000,limit:2});
 const b=run({start:1100000,end:1120000,limit:2});
 if(a.positions!==2||JSON.stringify(a.rows)!==JSON.stringify(b.rows))throw Error('deterministic replay failed');
 if(a.rows.some(x=>x.exactAllocations<1))throw Error('empty exact worlds');
 return {passed:true,seeds:a.selectedSeeds,allocations:a.exactHiddenAllocations};
}
if(require.main===module){
 const [a,b,c]=process.argv.slice(2);
 console.log(JSON.stringify(a==='test'?selfTest():run({start:+(a||1100000),end:+(b||1180000),limit:+(c||30)}),null,2));
}
module.exports={firstResponse,category,analyze,summarize,run,selfTest};