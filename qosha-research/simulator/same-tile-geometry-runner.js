'use strict';
// Same-tile, different-side paired geometry experiment for 3x9 Qoşa.
// Reproduce: node qosha-research/simulator/same-tile-geometry-runner.js test
// node qosha-research/simulator/same-tile-geometry-runner.js 1312940 650 60 48
// Every comparison discards the IDENTICAL non-double stone: only its placement differs.
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner');
const {actionKey}=require('./decision-regret'),{conditionalWorld}=require('./equal-pip-paired-runner');
const profiles=['min-hand-pips','closed-branch-control'],deck=e.createDoubleSixDeck();
const keys=xs=>xs.map(e.tileKey),mean=xs=>xs.reduce((s,x)=>s+x,0)/xs.length;
function individualMobility(branch,opening,hand){
  return hand.filter(tile=>d.actionsForHand(branch,opening,[tile]).length>0).length;
}
function geometryPairs(opts,state){
  if(opts.phase!=='play'||state.hands[state.currentPlayer].length<3)return [];
  const groups=new Map();
  for(const a of opts.actions)if(a.type==='single'){
    const key=e.tileKey(a.tile);
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(a);
  }
  const out=[];
  for(const [tile,acts] of groups){
    const byFrom=new Map();
    for(const a of acts)if(!byFrom.has(a.from))byFrom.set(a.from,a);
    const choices=[...byFrom.values()].sort((a,b)=>a.from-b.from);
    for(let i=0;i<choices.length;i++)for(let j=i+1;j<choices.length;j++){
      const a=choices[i],b=choices[j];
      const remaining=state.hands[state.currentPlayer].filter((_,k)=>k!==a.handIndex);
      const ma=individualMobility(e.applySinglePlacement(state.branchState,a),state.openingState,remaining);
      const mb=individualMobility(e.applySinglePlacement(state.branchState,b),state.openingState,remaining);
      if(ma===mb)continue;
      out.push({tile,high:ma>mb?a:b,low:ma>mb?b:a,highMob:Math.max(ma,mb),lowMob:Math.min(ma,mb)});
    }
  }
  return out;
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
        let state=r.cloneRoundState(base),selected=false;
        const live=new Set([...base.hands.flat(),...base.stock].map(e.tileKey));
        const known=deck.filter(t=>!live.has(e.tileKey(t)));
        const forbidden=[new Set(),new Set(),new Set()];
        while(!state.outcome&&state.turns<200){
          const p=state.currentPlayer,opts=d.turnOptions(state.branchState,state.openingState,state.hands[p],state.stock);
          if(opts.phase==='pass'&&!state.stock.length){
            for(const tile of deck)if(d.actionsForHand(state.branchState,state.openingState,[tile]).length)
              forbidden[p].add(e.tileKey(tile));
            for(const tile of state.hands[p])if(forbidden[p].has(e.tileKey(tile)))throw Error('pass contradiction');
          }
          if(p===seat&&!selected&&opts.phase==='play'){
            const pairs=geometryPairs(opts,state);
            if(pairs.length){
              const h=e.mixSeed32((seed^Math.imul(seat+1,0x85ebca6b)^Math.imul(state.turns+1,0xc2b2ae35))>>>0);
              const pair=pairs[h%pairs.length];
              positions.push({profile,seed,seat,turn:state.turns,state:r.cloneRoundState(state),
                known:known.map(t=>t.slice()),forbidden:forbidden.map(x=>[...x]),
                high:actionKey(pair.high),low:actionKey(pair.low),
                highMob:pair.highMob,lowMob:pair.lowMob,tile:pair.tile,pairCount:pairs.length});
              selected=true;found++;
            }
          }
          const action=opts.phase==='play'?chooseBy(profile,opts,{seed,turns:state.turns,player:p}):null;
          state=r.stepRound(state,()=>action);
          if(action)known.push(...(action.type==='single'?[action.tile]:(action.tiles||[])));
        }
        if(!state.outcome||state.outcome.kind==='unresolved')throw Error('discovery unresolved');
        if(found>=limit)break outer;
      }
    }
    scanned[profile]=seen;
  }
  return {positions,scanned};
}
function rollout(world,key,profile,seed,seat){
  const opts=d.turnOptions(world.branchState,world.openingState,world.hands[seat],world.stock);
  const choice=opts.actions.find(a=>actionKey(a)===key);
  if(!choice||choice.type!=='single')throw Error('candidate mismatch');
  const after=r.stepRound(world,()=>choice),n=after.currentPlayer;
  if(after.outcome)throw Error('unexpected one-stone finish');
  const nextOpts=d.turnOptions(after.branchState,after.openingState,after.hands[n],after.stock);
  const nextPlayable=individualMobility(after.branchState,after.openingState,after.hands[n]);
  const end=r.runRound(after,(o,s)=>chooseBy(profile,o,{seed,turns:s.turns,player:s.currentPlayer}),{maxTurns:200});
  if(!end.outcome||end.outcome.kind==='unresolved')throw Error('rollout unresolved');
  return {win:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===seat),
    pips:e.pipSum(end.hands[seat]),
    minus:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===seat&&end.outcome.minus<0),
    block:+(end.outcome.kind==='block'),nextPass:+(nextOpts.phase==='pass'),nextPlayable};
}
function summary(rows,profile,worlds){
  const a=rows.filter(x=>x.profile===profile),n=a.length;
  const avg=k=>n?mean(a.map(x=>x[k])):null;
  const interval=k=>{if(n<2)return null;const m=avg(k);
    const sd=Math.sqrt(a.reduce((s,x)=>s+(x[k]-m)**2,0)/(n-1));
    return 1.96*sd/Math.sqrt(n);};
  return {profile,positions:n,worldsPerPosition:worlds,continuations:2*n*worlds,
    highMinusLowFinishFirstPP:avg('winDelta')===null?null:100*avg('winDelta'),
    exploratoryPositionCluster95HalfWidthPP:interval('winDelta')===null?null:100*interval('winDelta'),
    highMinusLowRemainderPips:avg('pipsDelta'),
    highMinusLowMinusFinishPP:avg('minusDelta')===null?null:100*avg('minusDelta'),
    highMinusLowBlockPP:avg('blockDelta')===null?null:100*avg('blockDelta'),
    highMinusLowNextPassPP:avg('nextPassDelta')===null?null:100*avg('nextPassDelta'),
    highMinusLowNextPlayableTiles:avg('nextPlayableDelta'),
    highBetter:a.filter(x=>x.winDelta>1e-12).length,
    lowBetter:a.filter(x=>x.winDelta< -1e-12).length,
    tied:a.filter(x=>Math.abs(x.winDelta)<=1e-12).length,
    ownMobilityGapMean:avg('ownMobilityGap'),
    earlyHandAtLeast5:a.filter(x=>x.focalHandSize>=5).length};
}
function run(start=1312940,count=650,limit=60,worlds=48){
  if(![start,count,limit,worlds].every(Number.isInteger)||count<1||limit<1||worlds<1)throw Error('invalid args');
  const disc=collect(start,count,limit),rows=[];
  for(const pos of disc.positions){
    const sum={win:0,pips:0,minus:0,block:0,nextPass:0,nextPlayable:0};
    const before=JSON.stringify(pos.state);
    for(let i=0;i<worlds;i++){
      const seed=e.mixSeed32((pos.seed^Math.imul(pos.turn+1,0x9e3779b9)^Math.imul(pos.seat+1,0x85ebca6b)^Math.imul(i+1,0xc2b2ae35))>>>0);
      const world=conditionalWorld(pos,seed);
      const low=rollout(world,pos.low,pos.profile,seed,pos.seat),high=rollout(world,pos.high,pos.profile,seed,pos.seat);
      for(const k of Object.keys(sum))sum[k]+=(high[k]-low[k])/worlds;
    }
    if(JSON.stringify(pos.state)!==before)throw Error('source mutated');
    rows.push({profile:pos.profile,seed:pos.seed,seat:pos.seat,turn:pos.turn,tile:pos.tile,
      high:pos.high,low:pos.low,highMob:pos.highMob,lowMob:pos.lowMob,
      ownMobilityGap:pos.highMob-pos.lowMob,focalHandSize:pos.state.hands[pos.seat].length,
      opponentSizes:pos.state.hands.map(h=>h.length),
      opened:[...pos.state.openingState.openedNumbers].sort(),pairCount:pos.pairCount,
      ...Object.fromEntries(Object.entries(sum).map(([k,v])=>[k+'Delta',v]))});
  }
  return {schema:'qosa-same-tile-geometry/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
    mode:'3x9',startSeed:start,endSeed:start+count-1,scanCount:count,scanned:disc.scanned,
    positions:rows.length,worldsPerPosition:worlds,counterfactualContinuations:2*rows.length*worlds,
    policies:profiles,selection:'first reachable eligible per focal trajectory; hashed among different-from placements of same ordinary tile with unequal own individual-tile mobility; at least 3 focal tiles',
    worldSeedFormula:'mixSeed32(seed xor imul(turn+1,0x9e3779b9) xor imul(seat+1,0x85ebca6b) xor imul(worldIndex+1,0xc2b2ae35))',
    comparison:'high vs low own individually playable remaining tile count; exactly same discarded tile/pips/hand and opened-number state, differing only in chosen branch end',
    assumptions:'Uniform unseen tiles conditional on observed no-stock passes, no prior policy-choice likelihood. Branch-opening semantics provisional.',
    limitations:'First-eligible selection, simplistic fixed continuation bots, no block winner, finish-first not match win, exploratory CIs without multiple-testing correction.',
    summaries:profiles.map(p=>summary(rows,p,worlds)),rows};
}
function test(){
  const branch=e.createBranchState([1,1]),opening=e.createOpeningState([1,2,3,4]);
  [1,2,3,4].forEach((v,i)=>{branch.branches[e.SIDES[i]].end=v;});
  const hand=[[1,2],[1,5],[1,6]],state={branchState:branch,openingState:opening,hands:[hand],currentPlayer:0};
  const pairs=geometryPairs(d.turnOptions(branch,opening,hand,[]),state);
  const pair=pairs.find(x=>x.tile==='1-2');
  if(!pair||pair.highMob!==2||pair.lowMob!==0)throw Error('geometry mobility fixture');
  const a=d.applyTurn(branch,opening,hand,[],pair.high),b=d.applyTurn(branch,opening,hand,[],pair.low);
  if(JSON.stringify(a.hand)!==JSON.stringify(b.hand)||e.pipSum(a.playedTiles)!==e.pipSum(b.playedTiles)||
    JSON.stringify([...a.openingState.openedNumbers])!==JSON.stringify([...b.openingState.openedNumbers])||
    JSON.stringify(a.branchState)===JSON.stringify(b.branchState))throw Error('same-tile geometry invariant');
  const x=run(1312940,20,2,3),y=run(1312940,20,2,3);
  if(JSON.stringify(x)!==JSON.stringify(y)||x.positions!==4)throw Error('replay');
  return {passed:true,geometryFixture:true,positions:x.positions,continuations:x.counterfactualContinuations};
}
if(require.main===module){
  const a=process.argv.slice(2);
  console.log(JSON.stringify(a[0]==='test'?test():
    run(+(a[0]||1312940),+(a[1]||650),+(a[2]||60),+(a[3]||48)),null,2));
}
module.exports={geometryPairs,collect,run,test};
