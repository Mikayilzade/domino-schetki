'use strict';
// Pre-action late (2-3 tiles) same-tile/all-side Monte Carlo; no opponent hand leakage.
// node qosha-research/simulator/late-side-mc.js test
// node qosha-research/simulator/late-side-mc.js 1380040 1800 24 64
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner');
const {actionKey}=require('./decision-regret'),{conditionalWorld}=require('./equal-pip-paired-runner');
const profiles=['min-hand-pips','closed-branch-control'],deck=e.createDoubleSixDeck(),key=e.tileKey;
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const median=a=>{if(!a.length)return null;const b=[...a].sort((x,y)=>x-y);return b.length%2?b[(b.length-1)/2]:(b[b.length/2-1]+b[b.length/2])/2;};
const half=a=>a.length<2?null:1.96*Math.sqrt(a.reduce((s,x)=>s+(x-mean(a))**2,0)/(a.length-1)/a.length);
function groups(opts,state){
 if(opts.phase!=='play'||state.hands[state.currentPlayer].length<2||state.hands[state.currentPlayer].length>3)return [];
 const map=new Map();
 for(const a of opts.actions)if(a.type==='single'){const k=key(a.tile);if(!map.has(k))map.set(k,[]);map.get(k).push(a);}
 return [...map.entries()].filter(([,a])=>a.length>=2)
  .map(([tile,actions])=>({tile,actions:actions.sort((a,b)=>actionKey(a).localeCompare(actionKey(b)))}));
}
function collect(start,count,limit){
 const positions=[],scanned={};
 for(const profile of profiles){
  let found=0,seen=0;
  outer:for(let seed=start;seed<start+count;seed++){
   const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(base.kind!=='ready')throw Error('initializer unresolved');
   seen++;
   for(let seat=0;seat<3;seat++){
    let state=r.cloneRoundState(base);
    const known=[ [1,1],...(base.openingFollowup?[base.openingFollowup.tile]:[]) ];
    const forbidden=[new Set(),new Set(),new Set()];
    while(!state.outcome&&state.turns<200){
     const p=state.currentPlayer,opts=d.turnOptions(state.branchState,state.openingState,state.hands[p],state.stock);
     if(opts.phase==='pass'&&!state.stock.length){
      for(const tile of deck)if(d.actionsForHand(state.branchState,state.openingState,[tile]).length)forbidden[p].add(key(tile));
      for(const tile of state.hands[p])if(forbidden[p].has(key(tile)))throw Error('observed pass contradiction');
     }
     if(p===seat){
      const candidates=groups(opts,state);
      if(candidates.length){
       const h=e.mixSeed32((seed^Math.imul(seat+1,0x85ebca6b)^Math.imul(state.turns+1,0xc2b2ae35))>>>0);
       const chosen=candidates[h%candidates.length];
       positions.push({profile,seed,seat,turn:state.turns,state:r.cloneRoundState(state),
        known:known.map(t=>[...t]),forbidden:forbidden.map(x=>[...x]),
        tile:chosen.tile,actions:chosen.actions.map(actionKey),
        initialDoubles:e.dealThreeByNine(seed).hands[seat].filter(t=>t[0]===t[1]).length});
       found++;break;
      }
     }
     const action=opts.phase==='play'?chooseBy(profile,opts,{seed,turns:state.turns,player:p}):null;
     state=r.stepRound(state,()=>action);
     if(action)for(const tile of action.type==='single'?[action.tile]:(action.tiles||[]))known.push([...tile]);
    }
    if(found>=limit)break outer;
   }
  }
  scanned[profile]=seen;
 }
 return{positions,scanned};
}
function individualMobility(branch,opening,hand){
 return hand.filter(t=>d.actionsForHand(branch,opening,[t]).length>0).length;
}
function candidateMeta(pos){
 const s=pos.state,f=pos.seat,n=(f+1)%3,opts=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock);
 const unseen=deck.filter(t=>!new Set([...pos.known,...s.hands[f]].map(key)).has(key(t)));
 if(unseen.length!==s.hands[n].length+s.hands[(f+2)%3].length)throw Error('visible pool mismatch');
 return pos.actions.map(k=>{
  const a=opts.actions.find(x=>actionKey(x)===k);if(!a)throw Error('action vanished');
  const b=e.applySinglePlacement(s.branchState,a);
  const remaining=s.hands[f].filter((_,i)=>i!==a.handIndex);
  const own=individualMobility(b,s.openingState,remaining);
  const playable=unseen.filter(t=>d.actionsForHand(b,s.openingState,[t]).length>0).length;
  return{key:k,side:a.side,from:a.from,to:a.to,own,expectedNextLegal:s.hands[n].length*playable/unseen.length};
 });
}
function rollout(world,action,profile,seed,seat){
 const opts=d.turnOptions(world.branchState,world.openingState,world.hands[seat],world.stock);
 const chosen=opts.actions.find(a=>actionKey(a)===action);
 if(!chosen||chosen.type!=='single')throw Error('forced action mismatch');
 const after=r.stepRound(world,()=>chosen);
 const next=(seat+1)%3,other=(seat+2)%3;
 const access=p=>individualMobility(after.branchState,after.openingState,after.hands[p]);
 const nextAccess=access(next),otherAccess=access(other);
 const end=after.outcome?after:r.runRound(after,(o,s)=>chooseBy(profile,o,{seed,turns:s.turns,player:s.currentPlayer}),{maxTurns:200});
 if(!end.outcome||end.outcome.kind==='unresolved')throw Error('unresolved');
 const win=+(end.outcome.kind==='finish'&&end.outcome.playerIndex===seat);
 return{win,pips:e.pipSum(end.hands[seat]),minus:+(win&&end.outcome.minus<0),
  minusValue:win?(end.outcome.minus||0):0,block:+(end.outcome.kind==='block'),
  turns:end.turns,nextAccess,otherAccess,endingDoubles:end.hands[seat].filter(t=>t[0]===t[1]).length};
}
function run(start=1380040,count=1800,limit=24,worlds=64){
 if(![start,count,limit,worlds].every(Number.isInteger)||count<1||limit<1||worlds<1)throw Error('bad args');
 const disc=collect(start,count,limit),rows=[];let continuations=0;
 for(const pos of disc.positions){
  const before=JSON.stringify(pos.state),meta=candidateMeta(pos),samples=Object.fromEntries(meta.map(m=>[m.key,[]]));
  for(let i=0;i<worlds;i++){
   const seed=e.mixSeed32((pos.seed^Math.imul(pos.turn+1,0x9e3779b9)^Math.imul(pos.seat+1,0x85ebca6b)^Math.imul(i+1,0xc2b2ae35)^(pos.profile===profiles[0]?0x1324:0x9876))>>>0);
   const world=conditionalWorld(pos,seed);
   for(const m of meta){samples[m.key].push(rollout(world,m.key,pos.profile,seed,pos.seat));continuations++;}
  }
  if(JSON.stringify(pos.state)!==before)throw Error('visible source mutated');
  const actionStats=meta.map(m=>({...m,
   ...Object.fromEntries(['win','pips','minus','block','turns','nextAccess','otherAccess','endingDoubles'].map(k=>[k,mean(samples[m.key].map(x=>x[k]))])),
   medianPips:median(samples[m.key].map(x=>x.pips)),
   minusCounts:Object.fromEntries([0,-10,-20,-30,-40].map(k=>[k,samples[m.key].filter(x=>x.win&&x.minusValue===k).length]))}));
  const own=[...actionStats].sort((a,b)=>b.own-a.own||a.key.localeCompare(b.key))[0];
  const risk=[...actionStats].sort((a,b)=>a.expectedNextLegal-b.expectedNextLegal||a.key.localeCompare(b.key))[0];
  const bestWin=Math.max(...actionStats.map(x=>x.win)),bestPips=Math.min(...actionStats.map(x=>x.pips));
  rows.push({profile:pos.profile,seed:pos.seed,seat:pos.seat,turn:pos.turn,hand:pos.state.hands[pos.seat].map(key),
   handSize:pos.state.hands[pos.seat].length,opponentSizes:pos.state.hands.map(x=>x.length),
   tile:pos.tile,opened:[...pos.state.openingState.openedNumbers].sort(),
   branchEnds:e.SIDES.map(s=>pos.state.branchState.branches[s].end),
   forbiddenCounts:pos.forbidden.map(x=>x.length),initialDoubles:pos.initialDoubles,
   actionStats,ownChoice:own.key,riskChoice:risk.key,disagree:own.key!==risk.key,
   ownMinusRiskWinPP:100*(own.win-risk.win),ownMinusRiskPips:own.pips-risk.pips,
   ownRegretWinPP:100*(bestWin-own.win),riskRegretWinPP:100*(bestWin-risk.win),
   ownRegretPips:own.pips-bestPips,riskRegretPips:risk.pips-bestPips,
   nextAccessDelta:own.nextAccess-risk.nextAccess,otherAccessDelta:own.otherAccess-risk.otherAccess});
 }
 const summaries=profiles.map(profile=>{
  const a=rows.filter(x=>x.profile===profile),diff=a.filter(x=>x.disagree);
  const ag=(x,k)=>mean(x.map(y=>y[k]));
    return{profile,positions:a.length,discordantPositions:diff.length,worldsPerPosition:worlds,
   all:{ownMinusRiskWinPP:ag(a,'ownMinusRiskWinPP'),exploratory95HalfWidthPP:half(a.map(x=>x.ownMinusRiskWinPP)),
    ownMinusRiskPips:ag(a,'ownMinusRiskPips'),ownMeanRegretWinPP:ag(a,'ownRegretWinPP'),
    riskMeanRegretWinPP:ag(a,'riskRegretWinPP')},
   discordant:{ownMinusRiskWinPP:ag(diff,'ownMinusRiskWinPP'),exploratory95HalfWidthPP:half(diff.map(x=>x.ownMinusRiskWinPP)),
    ownMinusRiskPips:ag(diff,'ownMinusRiskPips'),ownBetter:diff.filter(x=>x.ownMinusRiskWinPP>0).length,
    riskBetter:diff.filter(x=>x.ownMinusRiskWinPP<0).length,ties:diff.filter(x=>x.ownMinusRiskWinPP===0).length},
   byHandSize:Object.fromEntries([2,3].map(n=>[n,{positions:a.filter(x=>x.handSize===n).length,
    ownMinusRiskWinPP:ag(a.filter(x=>x.handSize===n),'ownMinusRiskWinPP')}])),
   allCandidateCount:a.reduce((s,x)=>s+x.actionStats.length,0)};
 });
 return{schema:'qosa-late-side-mc/v1',timestampBaku:'2026-10-24 08:47 (+04)',
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 (branch locking provisional)',mode:'3x9',
  seedRange:[start,start+count-1],dealsScanned:count,fullContinuations:0,
  matchedHiddenAllocations:rows.length*worlds,pairedHiddenWorldContinuations:continuations,
  worldsPerPosition:worlds,positions:rows.length,scanned:disc.scanned,profiles,
  selection:'First reachable pre-action hand size 2-3 with >=2 legal side placements of same ordinary tile, hashed tile group; at most one per focal trajectory. All legal sides of chosen tile evaluated.',
  comparison:'Highest own post-action individually playable stones vs lowest uniform-visible predicted next-opponent legal count; forced all candidate actions in identical pass-conditioned hidden allocations and same continuation bot.',
  assumptions:'Uniform unseen tiles conditioned on recorded no-stock passes; visible next-risk ignores pass history. Opponent prior-action likelihood omitted. Provisional branch-opening semantics.',
  limitations:'Selected rare geometry positions, correlated sampled worlds, two simple bot profiles, uncorrected position-cluster intervals, no block winner, finish-first not match win; actual opponent access used only after choice for audit.',
  summaries,rows,next:'Independent disjoint-seed holdout of discordant late positions; add authentic four-branch locking/opening fixture before human recommendation.'};
}
function test(){
 const a=run(1380040,35,2,3),b=run(1380040,35,2,3);
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('determinism');
 if(a.pairedHiddenWorldContinuations!==a.rows.reduce((s,x)=>s+x.actionStats.length*3,0))throw Error('continuation count');
 for(const row of a.rows){
  if(row.handSize<2||row.handSize>3||row.actionStats.length<2||row.actionStats.some(x=>x.own<0||x.own>=row.handSize))throw Error('late state invariant');
  if(row.actionStats.some(x=>x.minusCounts[-10]+x.minusCounts[-20]+x.minusCounts[-30]+x.minusCounts[-40]>3))throw Error('minus count');
 }
 return{passed:true,positions:a.positions,continuations:a.pairedHiddenWorldContinuations};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1380040),+(a[1]||1800),+(a[2]||24),+(a[3]||64)),null,2));}
module.exports={groups,collect,candidateMeta,rollout,run,test};