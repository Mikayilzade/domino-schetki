'use strict';
// Matched legal branch-opening-double vs ordinary-single comparison.
// Hidden worlds are fixed across both actions and deduplicated per visible state.
// Branch number-unlock geometry is provisional; this is not a pure one-variable ablation.
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),policy=require('./strategy-runner'),sym=require('./branch-label-symmetric-tiebreak');
const abl=require('./branch-unlock-delay-ablation');
const DECK=e.createDoubleSixDeck(),PROFILES=['min-hand-pips','closed-branch-control'],HAND_SIZES=[1,2,3,4];
const key=e.tileKey;
function check(x,m){if(!x)throw Error(m||'assertion failed');}
function tilesFor(a){return a.type==='single'?[a.tile]:(a.tiles||[]);}
function actionKey(a){return[a.type,(a.numbers||[]).join(','),a.side||'',a.to??'',key(a.tile||[0,0])].join(':');}
function pips(a){return e.pipSum(tilesFor(a));}
function actionOrbitKey(a,s){
 const sf=a.side==null?null:{active:!!s.branches[a.side].active,end:s.branches[a.side].end};
 return JSON.stringify({type:a.type,handIndex:a.handIndex??null,sideFeature:sf,from:a.from??null,to:a.to??null,
  tile:a.tile?key(a.tile):null,tiles:a.tiles?a.tiles.map(key):null,numbers:a.numbers||[],
  finishDoubles:a.finishDoubles?a.finishDoubles.map(key):null});
}
function rng32(seed){let s=e.mixSeed32(seed>>>0);if(!s)s=0x9e3779b9;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/0x100000000;};}
function ctxSeed(c){return e.mixSeed32(((c.seed||0)^Math.imul((c.seat||0)+1,0x9e3779b9)^Math.imul((c.turn||0)+1,0x85ebca6b)^Math.imul((c.profileIndex||0)+1,0xc2b2ae35)^0x27d4eb2f)>>>0);}
function pairFor(opts,opening,ctx){
 if(opts.phase!=='play'||opts.drawn||opts.actions.some(a=>a.type==='mixed-finish'))return null;
 const singles=opts.actions.filter(a=>a.type==='single');
 const doubles=opts.actions.filter(a=>a.type==='double-sequence'&&a.tiles.length===1&&!opening.openedNumbers.has(a.numbers[0]));
 const pairs=[];
 for(const single of singles)for(const dbl of doubles)pairs.push({single,double:dbl,absDiff:Math.abs(pips(dbl)-pips(single))});
 if(!pairs.length)return null;
 const minGap=Math.min(...pairs.map(x=>x.absDiff)),best=pairs.filter(x=>x.absDiff===minGap),orbits=new Map();
 for(const x of best){const k=actionOrbitKey(x.double,ctx.branchState)+'||'+actionOrbitKey(x.single,ctx.branchState);if(!orbits.has(k))orbits.set(k,[]);orbits.get(k).push(x);}
 const orbitKeys=[...orbits.keys()].sort(),rng=rng32(ctxSeed(ctx)),group=orbits.get(orbitKeys[Math.floor(rng()*orbitKeys.length)]);
 const chosen=group[Math.floor(rng()*group.length)];
 return{...chosen,pairTieCount:best.length,pairOrbitCount:orbitKeys.length};
}
function playable(s){return new Set(DECK.filter(t=>d.actionsForHand(s.branchState,s.openingState,[t]).length).map(key));}
function fingerprint(w){return w.hands.map(h=>h.map(key).sort().join(',')).join('|')+'#'+w.stock.map(key).sort().join(',');}
function dealFingerprint(x){return x.hands.map(h=>h.map(key).sort().join(',')).join('|')+'#'+x.stock.map(key).sort().join(',');}
function openingSideSelector(seed){return choices=>choices[(seed>>>0)%choices.length];}
function auditWorld(pos,w){
 const all=[...pos.known,...w.hands.flat(),...w.stock].map(key);
 check(all.length===28&&new Set(all).size===28,'hidden-world tile conservation');
 check(w.hands.every((h,i)=>h.length===pos.state.hands[i].length),'hidden hand-size mismatch');
 check(w.stock.length===pos.state.stock.length,'hidden stock-size mismatch');
}
function collect(start,count,quota){
 if(![start,count,quota].every(Number.isInteger)||count<2||count%2||quota<1)throw Error('scan args');
 const positions=[],scan={},seenDeals=new Map(),duplicateDealPairs=[];
 let dealDraws=0,uniqueDeals=0,tileChecks=0,shapeChecks=0,fullRounds=0,finishes=0,blocks=0,unresolved=0;
 for(let pi=0;pi<PROFILES.length;pi++){
  const profile=PROFILES[pi],begin=start+pi*count/2,end=begin+count/2;
  const selected=Object.fromEntries(HAND_SIZES.map(n=>[n,0]));
  let dealsScanned=0,trajectories=0,eligible=0,last=begin-1;
  for(let seed=begin;seed<end&&HAND_SIZES.some(n=>selected[n]<quota);seed++){
   dealsScanned++;last=seed;dealDraws++;
   const deal=e.dealThreeByNine(seed);
   check(deal.hands.length===3&&deal.hands.every(h=>h.length===9)&&deal.stock.length===1,'deal shape '+seed);
   const all=[...deal.hands.flat(),...deal.stock].map(key);
   check(all.length===28&&new Set(all).size===28,'deal conservation '+seed);
   tileChecks++;shapeChecks++;
   const fp=dealFingerprint(deal);
   if(seenDeals.has(fp)){duplicateDealPairs.push({seed,duplicateOfSeed:seenDeals.get(fp),profile});continue;}
   seenDeals.set(fp,seed);uniqueDeals++;
   const initial=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3,chooseFollowupSide:openingSideSelector(seed)});
   check(initial.kind==='ready','initializer '+seed);
   const targetSeat=(seed+1)%3;
   let s=r.cloneRoundState(initial),chosen=false;
   const live=new Set([...initial.hands.flat(),...initial.stock].map(key));
   const known=DECK.filter(t=>!live.has(key(t))).map(t=>t.slice());
   const forbidden=[new Set(),new Set(),new Set()];
   if(initial.openingPassed)for(const k of playable(s))forbidden[initial.starter].add(k);
   while(!s.outcome&&s.turns<200){
    const p=s.currentPlayer,n=(p+1)%3,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
    if(opts.phase==='pass'&&!s.stock.length){
     for(const k of playable(s))forbidden[p].add(k);
     if(s.hands[p].some(t=>forbidden[p].has(key(t))))throw Error('pass contradiction');
    }
    const nextSize=s.hands[n].length;
    if(!chosen&&p===targetSeat&&HAND_SIZES.includes(nextSize)&&selected[nextSize]<quota&&opts.phase==='play'&&!opts.drawn&&
       !s.stock.length&&s.hands[p].length>=3&&!opts.actions.some(a=>a.type==='mixed-finish')){
     eligible++;
     const pair=pairFor(opts,s.openingState,{seed,seat:p,turn:s.turns,profileIndex:pi,branchState:s.branchState});
     if(pair){
      positions.push({profile,profileIndex:pi,seed,seat:p,turn:s.turns,nextHandSize:nextSize,focalHandSize:s.hands[p].length,
       state:r.cloneRoundState(s),known:known.map(t=>t.slice()),forbidden:forbidden.map(x=>[...x]),
       double:actionKey(pair.double),single:actionKey(pair.single),doublePips:pips(pair.double),singlePips:pips(pair.single),
       pipGap:pair.absDiff,openedNumber:pair.double.numbers[0],pairTieCount:pair.pairTieCount,pairOrbitCount:pair.pairOrbitCount,
       startingDoubles:s.hands[p].filter(t=>t[0]===t[1]).length});
      selected[nextSize]++;chosen=true;
     }
    }
    const a=opts.phase==='play'?sym.chooseSymmetric(profile,opts,{seed,rotation:0,turns:s.turns,player:p,branchState:s.branchState,salt:pi+1},'orbit'):null;
    s=r.stepRound(s,()=>a);
    if(a)known.push(...tilesFor(a).map(t=>t.slice()));
   }
   trajectories++;fullRounds++;
   if(!s.outcome||s.outcome.kind==='unresolved')unresolved++;
   else if(s.outcome.kind==='finish')finishes++;else blocks++;
  }
  scan[profile]={seedStart:begin,seedEnd:last,dealsScanned,trajectories,eligible,selected,quotaMet:HAND_SIZES.every(n=>selected[n]===quota)};
 }
 return{positions,scan,allocationAudit:{seedDealDraws:dealDraws,uniqueCompleteAllocations:uniqueDeals,duplicateAllocations:duplicateDealPairs.length,
  duplicateDealPairs,tileConservationChecks:tileChecks,dealShapeChecks:shapeChecks},
  fullRounds,finishes,blocks,unresolved};
}
function rollout(world,pos,wanted,profile,seed){
 const p=pos.seat,n=(p+1)%3,base=r.cloneRoundState(world);
 const opts=d.turnOptions(base.branchState,base.openingState,base.hands[p],base.stock);
 const action=opts.actions.find(a=>actionKey(a)===wanted);
 if(!action)throw Error('candidate not legal in sampled world');
 let s=r.stepRound(base,()=>action);
 if(s.outcome)throw Error('forced candidate unexpectedly ended round');
 const nextOpts=d.turnOptions(s.branchState,s.openingState,s.hands[n],s.stock);
 const nextPlayable=s.hands[n].filter(t=>d.actionsForHand(s.branchState,s.openingState,[t]).length).length;
 const nextPass=+(nextOpts.phase==='pass');
 const nextAction=nextOpts.phase==='play'?sym.chooseSymmetric(profile,nextOpts,{seed,rotation:0,turns:s.turns,player:n,branchState:s.branchState,salt:pos.profileIndex+1},'orbit'):null;
 s=r.stepRound(s,()=>nextAction);
 const immediateNextFinish=+(s.outcome?.kind==='finish'&&s.outcome.playerIndex===n);
 const end=r.runRound(s,(o,cur)=>sym.chooseSymmetric(profile,o,{seed,rotation:0,turns:cur.turns,player:cur.currentPlayer,branchState:cur.branchState,salt:pos.profileIndex+1},'orbit'),{maxTurns:200});
 if(!end.outcome||end.outcome.kind==='unresolved')throw Error('unresolved continuation');
 const focalFinish=end.outcome.kind==='finish'&&end.outcome.playerIndex===p;
 const minusCode=focalFinish?String(end.outcome.minus||0):'none';
 return{nextPlayable,nextPass,immediateNextFinish,focalFinish:+focalFinish,focalPips:e.pipSum(end.hands[p]),
  focalMinus:+(focalFinish&&end.outcome.minus<0),minusLoss:focalFinish?Math.abs(end.outcome.minus||0):0,minusCode,
  block:+(end.outcome.kind==='block'),turns:end.turns-world.turns,
  remainingDoubles:end.hands[p].filter(t=>t[0]===t[1]).length};
}
function ci(xs){if(!xs.length)return{n:0,mean:null,halfWidth95:null};const m=xs.reduce((a,b)=>a+b,0)/xs.length;
 const v=xs.length>1?xs.reduce((s,x)=>s+(x-m)**2,0)/(xs.length-1):0;
 return{n:xs.length,mean:m,halfWidth95:xs.length>1?1.96*Math.sqrt(v/xs.length):null};}
function mean(xs){return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;}
const METRICS=['nextPlayable','nextPass','immediateNextFinish','focalFinish','focalPips','focalMinus','minusLoss','block','turns','remainingDoubles'];
function run(start=3418620,count=2400,quota=12,worlds=48){
 if(![start,count,quota,worlds].every(Number.isInteger)||count<2||count%2||quota<1||worlds<1||worlds>128)throw Error('run args');
 const disc=collect(start,count,quota),rows=[],duplicateWorldPairs=[];
 if(disc.unresolved)throw Error('unresolved discovery trajectory');
 let worldDraws=0,uniqueWorlds=0,duplicateWorlds=0,essTotal=0,pairedContinuations=0,minUnique=Infinity,maxUnique=0;
 for(const pos of disc.positions){
  const before=JSON.stringify(pos.state),counts=new Map(),seen=new Map();
  for(let i=0;i<worlds;i++){
   const ws=(4020000000+(pos.seed-start)*1024+pos.seat*128+i)>>>0,w=abl.sample(pos,ws);
   auditWorld(pos,w);const fp=fingerprint(w);worldDraws++;counts.set(fp,(counts.get(fp)||0)+1);
   if(!seen.has(fp))seen.set(fp,{world:w,seed:ws,index:i});
   else{const first=seen.get(fp);duplicateWorldPairs.push({visibleSeed:pos.seed,profile:pos.profile,seat:pos.seat,
    firstIndex:first.index,duplicateIndex:i,firstSeed:first.seed,duplicateSeed:ws});}
  }
  const items=[...seen.values()],n=items.length,sumSq=[...counts.values()].reduce((s,c)=>s+c*c,0),ess=worlds*worlds/sumSq;
  uniqueWorlds+=n;duplicateWorlds+=worlds-n;essTotal+=ess;minUnique=Math.min(minUnique,n);maxUnique=Math.max(maxUnique,n);
  const arms={double:Object.fromEntries(METRICS.map(k=>[k,0])),single:Object.fromEntries(METRICS.map(k=>[k,0]))};
  const minusCounts={double:{},single:{}},regret={double:{finishFirst:0,remainderPips:0,minusLoss:0},single:{finishFirst:0,remainderPips:0,minusLoss:0}};
  for(const item of items){
   const x=rollout(item.world,pos,pos.double,pos.profile,item.seed),y=rollout(item.world,pos,pos.single,pos.profile,item.seed);
   for(const k of METRICS){arms.double[k]+=x[k]/n;arms.single[k]+=y[k]/n;}
   for(const [arm,v] of [['double',x],['single',y]])minusCounts[arm][v.minusCode]=(minusCounts[arm][v.minusCode]||0)+1;
   const bestFinish=Math.max(x.focalFinish,y.focalFinish),bestPips=Math.min(x.focalPips,y.focalPips),bestLoss=Math.min(x.minusLoss,y.minusLoss);
   regret.double.finishFirst+=(bestFinish-x.focalFinish)/n;regret.single.finishFirst+=(bestFinish-y.focalFinish)/n;
   regret.double.remainderPips+=(x.focalPips-bestPips)/n;regret.single.remainderPips+=(y.focalPips-bestPips)/n;
   regret.double.minusLoss+=(x.minusLoss-bestLoss)/n;regret.single.minusLoss+=(y.minusLoss-bestLoss)/n;
   pairedContinuations+=2;
  }
  const delta=Object.fromEntries(METRICS.map(k=>[k,arms.double[k]-arms.single[k]]));
  if(JSON.stringify(pos.state)!==before)throw Error('visible state mutated');
  rows.push({seed:pos.seed,profile:pos.profile,seat:pos.seat,turn:pos.turn,nextHandSize:pos.nextHandSize,focalHandSize:pos.focalHandSize,
   openedNumber:pos.openedNumber,double:pos.double,single:pos.single,doublePips:pos.doublePips,singlePips:pos.singlePips,pipGap:pos.pipGap,
   samePips:pos.pipGap===0,pairTieCount:pos.pairTieCount,pairOrbitCount:pos.pairOrbitCount,startingDoubles:pos.startingDoubles,
   seedWorldDraws:worlds,uniqueWorlds:n,duplicateDraws:worlds-n,drawEss:ess,arms,delta,regret,minusCounts});
 }
 function summarize(sub){
  const s=(k,scale=1)=>ci(sub.map(x=>scale*x.delta[k]));
  const armCi=(arm,k,scale=1)=>ci(sub.map(x=>scale*x.arms[arm][k]));
  const reg=(arm,k)=>ci(sub.map(x=>x.regret[arm][k]));
  const codeCounts=arm=>Object.fromEntries(['none','0','-10','-20','-30','-40'].map(code=>[code,sub.reduce((z,x)=>z+(x.minusCounts[arm][code]||0),0)]));
  return{positions:sub.length,uniqueHiddenWorlds:sub.reduce((z,x)=>z+x.uniqueWorlds,0),hiddenWorldDraws:sub.reduce((z,x)=>z+x.seedWorldDraws,0),
   duplicateWorldDraws:sub.reduce((z,x)=>z+x.duplicateDraws,0),meanUniqueWorldsPerPosition:mean(sub.map(x=>x.uniqueWorlds)),
   meanDrawEss:mean(sub.map(x=>x.drawEss)),meanAbsolutePipGap:ci(sub.map(x=>x.pipGap)),
   double:{nextOpponentFinishPP:armCi('double','immediateNextFinish',100),focalFinishFirstPP:armCi('double','focalFinish',100),
    focalRemainderPips:armCi('double','focalPips'),focalMinusFinishPP:armCi('double','focalMinus',100),
    expectedMinusLoss:armCi('double','minusLoss'),blockPP:armCi('double','block',100),meanTurns:armCi('double','turns')},
   single:{nextOpponentFinishPP:armCi('single','immediateNextFinish',100),focalFinishFirstPP:armCi('single','focalFinish',100),
    focalRemainderPips:armCi('single','focalPips'),focalMinusFinishPP:armCi('single','focalMinus',100),
    expectedMinusLoss:armCi('single','minusLoss'),blockPP:armCi('single','block',100),meanTurns:armCi('single','turns')},
   doubleMinusSingle:{nextOpponentFinishPP:s('immediateNextFinish',100),nextPassPP:s('nextPass',100),nextPlayableTiles:s('nextPlayable'),
    focalFinishFirstPP:s('focalFinish',100),focalRemainderPips:s('focalPips'),focalMinusFinishPP:s('focalMinus',100),
    expectedMinusLoss:s('minusLoss'),blockPP:s('block',100),turns:s('turns'),endingDoubles:s('remainingDoubles')},
   pairwiseHindsightOracleRegret:{double:{finishFirst:reg('double','finishFirst'),remainderPips:reg('double','remainderPips'),minusLoss:reg('double','minusLoss')},
    single:{finishFirst:reg('single','finishFirst'),remainderPips:reg('single','remainderPips'),minusLoss:reg('single','minusLoss')}},
   focalMinusOutcomeCounts:{double:codeCounts('double'),single:codeCounts('single')}};
 }
 const summaries={};
 for(const profile of PROFILES){summaries[profile]={};for(const size of HAND_SIZES){summaries[profile][size]={};
  for(const cls of ['all','same-pips','different-pips']){const sub=rows.filter(x=>x.profile===profile&&x.nextHandSize===size&&(cls==='all'||(cls==='same-pips')===x.samePips));
   summaries[profile][size][cls]=summarize(sub);}}}
 const byDoubleNumber={};
 for(let n=0;n<=6;n++){const sub=rows.filter(x=>x.openedNumber===n);if(sub.length)byDoubleNumber[n]={positions:sub.length,
  nextOpponentFinishDeltaPP:ci(sub.map(x=>100*x.delta.immediateNextFinish)),focalFinishFirstDeltaPP:ci(sub.map(x=>100*x.delta.focalFinish)),
  focalRemainderPipsDelta:ci(sub.map(x=>x.delta.focalPips)),minusLossDelta:ci(sub.map(x=>x.delta.minusLoss)),meanPipGap:ci(sub.map(x=>x.pipGap))};}
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-legal-branch-opening-double-vs-single-strata-dedup/v1',timestampAsiaBaku:stamp,engine:'qosha-research-0.5.3',rules:'recovered qosa-1.0.0 3x9 + stock; global number-unlock/branch geometry PROVISIONAL',
  startSeed:start,reservedEndSeed:start+count-1,profileWindows:disc.scan,allocationAudit:disc.allocationAudit,
  discoveryRounds:disc.fullRounds,discoveryFinishes:disc.finishes,discoveryBlocks:disc.blocks,discoveryUnresolved:disc.unresolved,
  positions:rows.length,quotaPerNextHandSizePerProfile:quota,nextHandSizes:HAND_SIZES,profiles:PROFILES,
  hiddenWorldDraws:worldDraws,uniqueHiddenWorldAssignmentsWithinVisibleStates:uniqueWorlds,duplicateWorldDraws:duplicateWorlds,
  duplicateWorldSeedPairs:duplicateWorldPairs,meanUniqueWorldsPerPosition:rows.length?uniqueWorlds/rows.length:null,
  minUniqueWorldsPerPosition:rows.length?minUnique:null,maxUniqueWorldsPerPosition:rows.length?maxUnique:null,
  meanDrawEss:rows.length?essTotal/rows.length:null,postDedupPairedContinuations:pairedContinuations,
  worldsRequestedPerPosition:worlds,worldSeedFormula:'(4020000000+(dealSeed-startSeed)*1024+seat*128+worldIndex)>>>0',
  selection:'One position per scanned seed/profile, focal seat=(seed+1) mod 3; exact next-opponent hand-size strata 1,2,3,4; candidate pair minimizes absolute pip gap. Profile seed windows are disjoint.',
  candidatePair:'Both actions are legal from the same visible state: one unopened-number double-sequence (one double) versus one ordinary single. Tied minimum-gap pairs are selected by symmetric action-orbit then member sampling; same-pip pairs are reported separately.',
  continuation:'Same profile policy and symmetric action-orbit tie-break for both candidate arms; same hidden allocation and continuation seed within each pair.',
  summaries,byDoubleNumber,rows,
  limitations:'This is not a pure unlock ablation: different tile identity/hand remainder and often pip gap remain. The double opens a number only under the provisional global-unlock model. Hidden worlds condition on observed no-stock pass exclusions but not opponent action-choice likelihood. Synthetic previous winner, two simple continuation policies, exploratory position-cluster CIs, no authenticated block winner/loneZero/bust/101 match scoring.',
  interpretation:'Paired mechanism/decision diagnostic only. Pairwise hindsight oracle regret is over these two candidate actions and sampled worlds, not an executable perfect-information policy. No strategy promotion without independent holdout and physical rule authentication.',
  exactNextAction:'Replicate on fresh seeds starting '+(start+count)+', expand the equal-pip candidate stratum, and seek an authentic table trace/ruling for global-vs-local number opening and block scoring.'};
}
function test(){
 const x=run(3418620,400,1,2),y=run(3418620,400,1,2);
 const a={...x};delete a.timestampAsiaBaku;const b={...y};delete b.timestampAsiaBaku;
 check(JSON.stringify(a)===JSON.stringify(b),'deterministic replay');
 check(x.positions>0&&x.discoveryUnresolved===0,'nonempty resolved cohort');
 check(x.uniqueHiddenWorldAssignmentsWithinVisibleStates+x.duplicateWorldDraws===x.hiddenWorldDraws,'dedup accounting');
 check(x.duplicateWorldSeedPairs.length===x.duplicateWorldDraws,'duplicate pairs');
 check(x.allocationAudit.uniqueCompleteAllocations+x.allocationAudit.duplicateAllocations===x.allocationAudit.seedDealDraws,'deal dedup accounting');
 check(x.rows.every(z=>z.uniqueWorlds>0&&z.pipGap>=0),'row invariants');
 return{passed:true,assertions:6,positions:x.positions,worldDraws:x.hiddenWorldDraws,uniqueWorlds:x.uniqueHiddenWorldAssignmentsWithinVisibleStates,
  duplicates:x.duplicateWorldDraws,discoveryDeals:x.allocationAudit.uniqueCompleteAllocations};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||3418620),+(a[1]||2400),+(a[2]||12),+(a[3]||48)),null,2));}
module.exports={run,test,pairFor,collect,rollout};
