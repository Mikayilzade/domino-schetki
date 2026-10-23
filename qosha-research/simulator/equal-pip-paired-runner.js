'use strict';
// Reproducible 3x9 equal-pip ordinary-single vs single-double paired counterfactuals.
// Deterministic hashed pair selection prevents lexicographic first-pair bias.
// node qosha-research/simulator/pass-choice-regret-runner.js test
// node qosha-research/simulator/pass-choice-regret-runner.js 1303640 450 18 64
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner');
const {select}=require('./joint-pass-memory-runner'),{actionKey}=require('./decision-regret');
const deck=e.createDoubleSixDeck(),profiles=['min-hand-pips','closed-branch-control'];
const keys=a=>a.map(e.tileKey),tiles=a=>a.type==='single'?[a.tile]:(a.tiles||[]);
function playableKeys(b,o){return new Set(deck.filter(t=>d.actionsForHand(b,o,[t]).length).map(e.tileKey));}
function shuffle(a,seed){const b=a.slice();let x=e.mixSeed32(seed)||0x9e3779b9;
  const rng=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};
  for(let i=b.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function conditionalWorld(pos,seed){
  const s=r.cloneRoundState(pos.state),f=pos.seat,n=(f+1)%3,o=(f+2)%3;
  if(s.currentPlayer!==f||s.stock.length)throw Error('requires focal turn, no stock');
  const visible=[...pos.known,...s.hands[f]],used=new Set(keys(visible));
  if(visible.length!==used.size)throw Error('duplicate known tile');
  const pool=deck.filter(t=>!used.has(e.tileKey(t))),mandatoryN=[],mandatoryO=[],flex=[];
  for(const t of pool){const k=e.tileKey(t),a=pos.forbidden[n].includes(k),b=pos.forbidden[o].includes(k);
    if(a&&b)throw Error('impossible pass posterior');
    if(a)mandatoryO.push(t);else if(b)mandatoryN.push(t);else flex.push(t);}
  const countN=s.hands[n].length,countO=s.hands[o].length,need=countN-mandatoryN.length;
  if(need<0||need>flex.length||mandatoryO.length+flex.length-need!==countO)throw Error('posterior count mismatch');
  const shuffled=shuffle(flex,seed);
  s.hands[n]=mandatoryN.concat(shuffled.slice(0,need));
  s.hands[o]=mandatoryO.concat(shuffled.slice(need));
  const all=[...visible,...s.hands[n],...s.hands[o]];
  if(all.length!==28||new Set(keys(all)).size!==28)throw Error('28-tile integrity');
  for(const p of [n,o])for(const t of s.hands[p])if(pos.forbidden[p].includes(e.tileKey(t)))throw Error('pass constraint violation');
  return s;
}

function equalPipPairs(opts){
  if(opts.phase!=='play')return [];
  const singles=opts.actions.filter(a=>a.type==='single').sort((a,b)=>actionKey(a).localeCompare(actionKey(b)));
  const doubles=opts.actions.filter(a=>a.type==='double-sequence'&&a.tiles.length===1).sort((a,b)=>actionKey(a).localeCompare(actionKey(b)));
  const pairs=[];
  for(const a of singles)for(const b of doubles)
    if(e.pipSum([a.tile])===e.pipSum(b.tiles))pairs.push({single:actionKey(a),double:actionKey(b),pips:e.pipSum([a.tile])});
  return pairs;
}
function selectPair(opts,seed,seat,turn,profile,mode='hashed'){
  const pairs=equalPipPairs(opts);
  if(!pairs.length)return null;
  const salt=profile==='min-hand-pips'?0x17b7a41d:0x45d9f3b;
  const h=e.mixSeed32((seed^Math.imul(seat+1,0x85ebca6b)^Math.imul(turn+1,0xc2b2ae35)^salt)>>>0);
  return pairs[mode==='lexicographic'?0:h%pairs.length];
}
function collect(start,count,limit,mode='hashed'){
  const positions=[],scanned={},trajectories={};
  for(const profile of profiles){let found=0,played=0,seen=0;
    outer:for(let seed=start;seed<start+count;seed++){
      const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
      if(base.kind!=='ready')throw Error('initializer unresolved');
      seen++;
      for(let seat=0;seat<3;seat++){played++;
        let state=r.cloneRoundState(base),selected=false;
        const live=new Set([...base.hands.flat(),...base.stock].map(e.tileKey));
        const known=deck.filter(t=>!live.has(e.tileKey(t)));
        const forbidden=Array.from({length:3},()=>new Set());
        while(!state.outcome&&state.turns<200){
          const p=state.currentPlayer,opts=d.turnOptions(state.branchState,state.openingState,state.hands[p],state.stock);
          if(opts.phase==='pass'&&!state.stock.length){
            for(const k of playableKeys(state.branchState,state.openingState))forbidden[p].add(k);
            for(const t of state.hands[p])if(forbidden[p].has(e.tileKey(t)))throw Error('actual pass contradiction');
          }
          let action=null;
          if(opts.phase==='play'){
            if(p===seat){
              const pair=selectPair(opts,seed,seat,state.turns,profile,mode);
              if(!selected&&pair){
                positions.push({profile,seed,seat,turn:state.turns,state:r.cloneRoundState(state),
                  known:known.map(t=>t.slice()),forbidden:forbidden.map(x=>[...x]),
                  single:pair.single,double:pair.double,pips:pair.pips,
                  pairCount:equalPipPairs(opts).length});
                found++;selected=true;
              }
              action=select(opts,state,known,forbidden,'a20-one').action;
            }else action=chooseBy(profile,opts);
          }
          state=r.stepRound(state,()=>action);
          if(action)known.push(...tiles(action));
        }
        if(!state.outcome)throw Error('discovery unresolved');
        if(found>=limit)break outer;
      }
    }
    scanned[profile]=seen;trajectories[profile]=played;
  }
  return {positions,scanned,trajectories};
}

function rollout(world,key,profile,seed,seat){
  const opts=d.turnOptions(world.branchState,world.openingState,world.hands[seat],world.stock);
  const choice=opts.actions.find(a=>actionKey(a)===key);
  if(!choice)throw Error('candidate mismatch');
  const after=r.stepRound(world,()=>choice);
  const nextOpts=after.outcome?null:d.turnOptions(after.branchState,after.openingState,
    after.hands[after.currentPlayer],after.stock);
  const nextPass=nextOpts?+(nextOpts.phase==='pass'):null;
  const nextPlayableTiles=nextOpts?after.hands[after.currentPlayer].filter(t=>
    d.actionsForHand(after.branchState,after.openingState,[t]).length>0).length:null;
  const end=after.outcome?after:r.runRound(after,(o,s)=>chooseBy(profile,o,{
    seed,turns:s.turns,player:s.currentPlayer}),{maxTurns:200});
  if(!end.outcome||end.outcome.kind==='unresolved')throw Error('rollout unresolved');
  return {win:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===seat),
    pips:e.pipSum(end.hands[seat]),
    minus:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===seat&&end.outcome.minus<0),
    block:+(end.outcome.kind==='block'),nextPass,nextPlayableTiles};
}
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;

function run(start=1311890,count=400,limit=30,worlds=48,mode='hashed'){
  if(![start,count,limit,worlds].every(Number.isInteger)||count<1||limit<1||worlds<1||
     !['hashed','lexicographic'].includes(mode))throw Error('bad arguments');
  const discovery=collect(start,count,limit,mode),rows=[];
  for(const pos of discovery.positions){
    const before=JSON.stringify(pos.state),samples={single:[],double:[]},strata={unlock:[],unchanged:[],blocks:[]};
    for(let i=0;i<worlds;i++){
      const seed=e.mixSeed32((pos.seed^Math.imul(pos.turn+1,0x9e3779b9)^Math.imul(pos.seat+1,0x85ebca6b)^Math.imul(i+1,0xc2b2ae35))>>>0);
      const world=conditionalWorld(pos,seed);
      const a=rollout(world,pos.single,pos.profile,seed,pos.seat),b=rollout(world,pos.double,pos.profile,seed,pos.seat);
      samples.single.push(a);samples.double.push(b);
      const category=a.nextPass===1&&b.nextPass===0?'unlock':a.nextPass===0&&b.nextPass===1?'blocks':'unchanged';
      strata[category].push(b.win-a.win);
    }
    if(JSON.stringify(pos.state)!==before)throw Error('visible state mutated');
    const a=samples.single,b=samples.double,delta=k=>mean(b.map(x=>x[k]))-mean(a.map(x=>x[k]));
    rows.push({profile:pos.profile,seed:pos.seed,turn:pos.turn,seat:pos.seat,
      hand:keys(pos.state.hands[pos.seat]),opponentSizes:pos.state.hands.map(h=>h.length),
      opened:[...pos.state.openingState.openedNumbers].sort(),forbiddenSizes:pos.forbidden.map(x=>x.length),
      single:pos.single,double:pos.double,discardedPips:pos.pips,pairCount:pos.pairCount,
      singleWin:mean(a.map(x=>x.win)),doubleWin:mean(b.map(x=>x.win)),
      winDelta:delta('win'),remainderDelta:delta('pips'),minusFinishDelta:delta('minus'),
      blockDelta:delta('block'),nextPassDelta:delta('nextPass'),
      nextPlayableTileDelta:delta('nextPlayableTiles'),
      unlockWorlds:strata.unlock.length,unchangedWorlds:strata.unchanged.length,blocksWorlds:strata.blocks.length,
      unlockWinDeltaSum:strata.unlock.reduce((s,x)=>s+x,0),
      unchangedWinDeltaSum:strata.unchanged.reduce((s,x)=>s+x,0),
      blocksWinDeltaSum:strata.blocks.reduce((s,x)=>s+x,0)});
  }
  const summaries=profiles.map(profile=>{
    const a=rows.filter(x=>x.profile===profile),sum=k=>a.reduce((s,x)=>s+x[k],0);
    const n=a.length,unlock=sum('unlockWorlds'),unchanged=sum('unchangedWorlds'),blocks=sum('blocksWorlds');
    return {profile,positions:n,worldsPerPosition:worlds,continuations:2*n*worlds,
      doubleMinusSingleWinPP:n?100*mean(a.map(x=>x.winDelta)):null,
      doubleMinusSinglePips:n?mean(a.map(x=>x.remainderDelta)):null,
      doubleMinusSingleMinusPP:n?100*mean(a.map(x=>x.minusFinishDelta)):null,
      doubleMinusSingleBlockPP:n?100*mean(a.map(x=>x.blockDelta)):null,
      doubleMinusSingleNextPassPP:n?100*mean(a.map(x=>x.nextPassDelta)):null,
      doubleMinusSingleNextPlayableTiles:n?mean(a.map(x=>x.nextPlayableTileDelta)):null,
      unlockWorlds:unlock,unchangedWorlds:unchanged,blocksWorlds:blocks,
      winDeltaUnlockPP:unlock?100*sum('unlockWinDeltaSum')/unlock:null,
      winDeltaUnchangedPP:unchanged?100*sum('unchangedWinDeltaSum')/unchanged:null,
      winDeltaBlocksPP:blocks?100*sum('blocksWinDeltaSum')/blocks:null,
      doubleBetter:a.filter(x=>x.winDelta>1e-12).length,
      singleBetter:a.filter(x=>x.winDelta< -1e-12).length,
      tied:a.filter(x=>Math.abs(x.winDelta)<=1e-12).length};
  });
  return {schema:'qosa-equal-pip-paired/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
    mode:'3x9',startSeed:start,endSeed:start+count-1,scanCount:count,
    scanned:discovery.scanned,discoveryTrajectories:discovery.trajectories,
    sampleRule:'first eligible equal-pip single/double position per focal trajectory; deterministic hashed pair selection',
    pairMode:mode,worldsPerPosition:worlds,positions:rows.length,
    counterfactualContinuations:2*rows.length*worlds,policies:profiles,
    comparison:'one legal ordinary single vs one legal 1-tile double-sequence, same pip sum, same hidden worlds, same bot policy',
    assumptions:'Uniform hidden allocations conditional on observed no-stock passes; no opponent policy-choice likelihood. Provisional branch opening.',
    limitations:'Next-opponent mobility strata are post-action descriptive, not causal mediation; first-eligible trajectories; no block winner; finish-first not match win; correlated worlds; no multiple-test correction.',
    summaries,rows};
}

function test(){
  const basic=(()=>{const focal=[[1,2],[1,3]],known=deck.filter(t=>!focal.some(z=>e.tileKey(z)===e.tileKey(t))).slice(0,10);
    const unseen=deck.filter(t=>!focal.concat(known).some(z=>e.tileKey(z)===e.tileKey(t)));
    const state={branchState:e.createBranchState([1,1]),openingState:e.createOpeningState([1]),
      hands:[focal,unseen.slice(0,8),unseen.slice(8)],stock:[],currentPlayer:0,
      consecutivePasses:0,turns:10,outcome:null};
    const pos={state,seat:0,known,forbidden:[[],[e.tileKey(unseen[0])],[e.tileKey(unseen[1])]]};
    const a=conditionalWorld(pos,777),b=conditionalWorld(pos,777);
    if(JSON.stringify(a)!==JSON.stringify(b))throw Error('sampler replay');
    return true;})();
  const a=run(1311290,30,2,3),b=run(1311290,30,2,3);
  if(JSON.stringify(a)!==JSON.stringify(b)||a.positions!==4)throw Error('equal-pip runner replay');
  for(const row of a.rows)if(!Number.isInteger(row.discardedPips)||row.discardedPips<0||
    row.unlockWorlds+row.unchangedWorlds+row.blocksWorlds!==3)throw Error('pair/strata regression');
  return {passed:true,sampler:basic,positions:a.positions,continuations:a.counterfactualContinuations};
}

if(require.main===module){
  const a=process.argv.slice(2);
  console.log(JSON.stringify(a[0]==='test'?test():
    run(+(a[0]||1311890),+(a[1]||400),+(a[2]||30),+(a[3]||48),a[4]||'hashed'),null,2));
}

module.exports={conditionalWorld,equalPipPairs,selectPair,collect,run,test};
