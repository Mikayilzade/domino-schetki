'use strict';
// 3x9 pass-conditioned, paired one-vs-joint changed-choice regret.
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
function collect(start,count,limit){
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
              const one=select(opts,state,known,forbidden,'a20-one').action;
              const joint=select(opts,state,known,forbidden,'a20-joint').action;
              if(!selected&&opts.actions.length>1&&actionKey(one)!==actionKey(joint)){
                positions.push({profile,seed,seat,turn:state.turns,state:r.cloneRoundState(state),
                  known:known.map(t=>t.slice()),forbidden:forbidden.map(x=>[...x]),
                  one:actionKey(one),joint:actionKey(joint)});
                found++;selected=true;
              }
              action=one;
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
  const nextPass=after.outcome?null:d.turnOptions(after.branchState,after.openingState,
    after.hands[after.currentPlayer],after.stock).phase==='pass';
  const end=after.outcome?after:r.runRound(after,(o,s)=>chooseBy(profile,o,{
    seed,turns:s.turns,player:s.currentPlayer}),{maxTurns:200});
  if(!end.outcome||end.outcome.kind==='unresolved')throw Error('rollout unresolved');
  return {win:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===seat),
    pips:e.pipSum(end.hands[seat]),
    minus:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===seat&&end.outcome.minus<0),
    block:+(end.outcome.kind==='block'),nextPass:nextPass===null?null:+nextPass};
}
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
function run(start=1303640,count=450,limit=18,worlds=64){
  if(![start,count,limit,worlds].every(Number.isInteger)||count<1||limit<1||worlds<1)throw Error('bad arguments');
  const discovery=collect(start,count,limit),rows=[];
  for(const pos of discovery.positions){
    const before=JSON.stringify(pos.state),samples={one:[],joint:[]};
    for(let i=0;i<worlds;i++){
      const seed=e.mixSeed32((pos.seed^Math.imul(pos.turn+1,0x9e3779b9)^Math.imul(pos.seat+1,0x85ebca6b)^Math.imul(i+1,0xc2b2ae35))>>>0);
      const world=conditionalWorld(pos,seed);
      for(const kind of ['one','joint'])samples[kind].push(rollout(world,pos[kind],pos.profile,seed,pos.seat));
    }
    if(JSON.stringify(pos.state)!==before)throw Error('visible state mutated');
    const a=samples.one,b=samples.joint,delta=k=>mean(b.map(x=>x[k]))-mean(a.map(x=>x[k]));
    rows.push({profile:pos.profile,seed:pos.seed,turn:pos.turn,seat:pos.seat,
      hand:keys(pos.state.hands[pos.seat]),opponentSizes:pos.state.hands.map(h=>h.length),
      branchEnds:Object.fromEntries(Object.entries(pos.state.branchState.branches).map(([k,v])=>[k,v.end])),
      opened:[...pos.state.openingState.openedNumbers].sort(),
      forbiddenSizes:pos.forbidden.map(x=>x.length),one:pos.one,joint:pos.joint,
      oneWin:mean(a.map(x=>x.win)),jointWin:mean(b.map(x=>x.win)),
      winDelta:delta('win'),remainderDelta:delta('pips'),minusFinishDelta:delta('minus'),
      blockDelta:delta('block'),nextPassDelta:delta('nextPass')});
  }
  const summaries=profiles.map(profile=>{
    const a=rows.filter(x=>x.profile===profile);
    return {profile,positions:a.length,worldsPerPosition:worlds,continuations:2*a.length*worlds,
      jointMinusOneWinPP:a.length?100*mean(a.map(x=>x.winDelta)):null,
      jointMinusOnePips:a.length?mean(a.map(x=>x.remainderDelta)):null,
      jointMinusOneMinusPP:a.length?100*mean(a.map(x=>x.minusFinishDelta)):null,
      jointMinusOneBlockPP:a.length?100*mean(a.map(x=>x.blockDelta)):null,
      jointMinusOneNextPassPP:a.length?100*mean(a.map(x=>x.nextPassDelta)):null,
      jointBetter:a.filter(x=>x.winDelta>1e-12).length,
      oneBetter:a.filter(x=>x.winDelta< -1e-12).length,
      tied:a.filter(x=>Math.abs(x.winDelta)<=1e-12).length};
  });
  return {schema:'qosa-pass-choice-regret/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
    mode:'3x9',startSeed:start,endSeed:start+count-1,scanCount:count,
    discoveryTrajectories:discovery.trajectories,scanned:discovery.scanned,
    sampleRule:'first joint-vs-one alpha20 changed choice per focal trajectory; first N per profile in ascending seeds',
    worldsPerPosition:worlds,positions:rows.length,counterfactualContinuations:2*rows.length*worlds,
    policies:profiles,comparison:'a20-joint minus a20-one; forced moves, identical hidden worlds, fixed continuation policy',
    assumptions:'Uniform hidden allocations conditional on observed no-stock passes for both opponents, ignoring policy-choice likelihood. Branch-opening semantics provisional.',
    limitations:'Targeted positions from a20-one trajectories; deterministic bots, no block winner, finish-first not match win; counterfactual continuations not independent full-deal baselines.',
    summaries,rows};
}
function test(){
  const focal=[[1,2],[1,3]],known=deck.filter(t=>!focal.some(z=>e.tileKey(z)===e.tileKey(t))).slice(0,10);
  const unseen=deck.filter(t=>!focal.concat(known).some(z=>e.tileKey(z)===e.tileKey(t)));
  const state={branchState:e.createBranchState([1,1]),openingState:e.createOpeningState([1]),
    hands:[focal,unseen.slice(0,8),unseen.slice(8)],stock:[],currentPlayer:0,
    consecutivePasses:0,turns:10,outcome:null};
  const pos={state,seat:0,known,forbidden:[[],[e.tileKey(unseen[0])],[e.tileKey(unseen[1])]]};
  const a=conditionalWorld(pos,777),b=conditionalWorld(pos,777);
  if(JSON.stringify(a)!==JSON.stringify(b)||a.hands[1].some(t=>pos.forbidden[1].includes(e.tileKey(t)))||
    a.hands[2].some(t=>pos.forbidden[2].includes(e.tileKey(t))))throw Error('sampler regression');
  return {passed:true,deterministic:true,hiddenCount:16};
}
if(require.main===module){
  const a=process.argv.slice(2);
  console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1303640),+(a[1]||450),+(a[2]||18),+(a[3]||64)),null,2));
}
module.exports={conditionalWorld,collect,run,test};
