'use strict';
// Qoşa 3x9 pass-memory ablation; requires repository sibling modules.
// node qosha-research/simulator/pass-memory-ablation.js test
// node qosha-research/simulator/pass-memory-ablation.js 1300000 200
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner'),{pass}=require('./joint-pass-exact');
const deck=e.createDoubleSixDeck(), profiles=['min-hand-pips','closed-branch-control'];
const variants=['min-pips','a12-plain','a12-memory','a20-plain','a20-memory'];
const tiles=a=>a.type==='single'?[a.tile]:(a.tiles||[]);
const key=a=>[a.type,(a.numbers||[]).join(','),a.side||'',a.to??'',e.tileKey(a.tile||[0,0])].join(':');
function legalKeys(branch,opening){
  return deck.filter(tile=>d.actionsForHand(branch,opening,[tile]).length>0).map(e.tileKey);
}
function select(opts,state,known,forbidden,variant){
  if(variant==='min-pips')return chooseBy('min-hand-pips',opts);
  if(opts.actions.length===1)return opts.actions[0];
  if(state.stock.length)throw Error('3x9 research expects stock exhausted');
  const focal=state.currentPlayer,next=(focal+1)%3,k=state.hands[next].length;
  const used=new Set([...known,...state.hands[focal]].map(e.tileKey));
  const unseen=deck.filter(tile=>!used.has(e.tileKey(tile)));
  const memory=variant.endsWith('memory'),alpha=variant.startsWith('a20')?20:12;
  const allowed=memory?unseen.filter(tile=>!forbidden[next].has(e.tileKey(tile))):unseen;
  if(allowed.length<k)throw Error('pass-memory contradiction: next hand larger than allowed pool');
  const scored=opts.actions.map(a=>{
    const discarded=tiles(a);
    if(discarded.length===state.hands[focal].length)return {a,pips:e.pipSum(discarded),score:Infinity};
    const tr=d.applyTurn(state.branchState,state.openingState,state.hands[focal],state.stock,a);
    const m=allowed.filter(tile=>d.actionsForHand(tr.branchState,tr.openingState,[tile]).length).length;
    const pips=e.pipSum(discarded);
    return {a,pips,score:pips+alpha*pass(allowed.length,m,k)};
  });
  scored.sort((a,b)=>b.score-a.score||b.pips-a.pips||key(a.a).localeCompare(key(b.a)));
  return scored[0].a;
}
function play(base,seat,profile,variant){
  let state=r.cloneRoundState(base),passEvents=0,conditioned=0,changed=0,choices=0,posteriorChecks=0;
  const live=new Set([...base.hands.flat(),...base.stock].map(e.tileKey));
  const known=deck.filter(t=>!live.has(e.tileKey(t)));
  const forbidden=Array.from({length:3},()=>new Set());
  while(!state.outcome&&state.turns<200){
    const p=state.currentPlayer;
    const opts=d.turnOptions(state.branchState,state.openingState,state.hands[p],state.stock);
    let action=null;
    if(opts.phase==='pass'&&!state.stock.length){
      const newly=legalKeys(state.branchState,state.openingState);
      for(const k of newly)forbidden[p].add(k);
      for(const tile of state.hands[p])if(forbidden[p].has(e.tileKey(tile)))throw Error('observed pass excludes actual held tile');
      passEvents++;posteriorChecks++;
    }
    if(opts.phase==='play'){
      if(p===seat){
        if(opts.actions.length>1){
          choices++;
          if(forbidden[(p+1)%3].size>0)conditioned++;
        }
        action=select(opts,state,known,forbidden,variant);
        if(variant.endsWith('memory')&&opts.actions.length>1){
          const plain=variant.replace('-memory','-plain');
          if(key(action)!==key(select(opts,state,known,forbidden,plain)))changed++;
        }
      }else action=chooseBy(profile,opts);
    }
    state=r.stepRound(state,()=>action);
    if(action)known.push(...tiles(action));
  }
  const o=state.outcome||{kind:'unresolved'};
  return {win:+(o.kind==='finish'&&o.playerIndex===seat),pips:e.pipSum(state.hands[seat]),
    block:+(o.kind==='block'),unresolved:+(o.kind==='unresolved'),turns:state.turns,
    minus:o.kind==='finish'&&o.playerIndex===seat?o.minus:0,
    passEvents,posteriorChecks,conditioned,changed,choices};
}
function run(start=1300000,count=200){
  if(!Number.isInteger(start)||!Number.isInteger(count)||count<2)throw Error('bad seed/count');
  const report={schema:'qosa-pass-memory-ablation/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
    mode:'3x9',startSeed:start,endSeed:start+count-1,deals:count,variants,profiles:[],
    fullRounds:0,assumptions:'Only no-stock observed passes constrain that opponent hand; all their current stones must avoid any tile individually playable at each prior pass. Conditional pass formula uses a uniform subset of allowed unseen tiles; it does NOT condition on other opponent constraints or policy choices.',
    limitations:'Provisional branch rules, deterministic bots, no block winner, finish-first not match win, seed-cluster CIs exploratory, only selected alpha weights.'};
  for(const profile of profiles){
    const sums=variants.map(()=>({win:0,pips:0,block:0,unresolved:0,turns:0,passEvents:0,
      posteriorChecks:0,conditioned:0,changed:0,choices:0,minus:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0}}));
    const bySeed=variants.map(()=>[]);
    const pairs={};
    for(let seed=start;seed<start+count;seed++){
      const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
      if(base.kind!=='ready')throw Error('initializer unresolved '+seed);
      const seedOut=variants.map(()=>[]);
      for(let seat=0;seat<3;seat++){
        const outcomes=variants.map(v=>play(base,seat,profile,v));
        for(let i=0;i<variants.length;i++){
          const x=outcomes[i],sum=sums[i];
          for(const k of ['win','pips','block','unresolved','turns','passEvents','posteriorChecks','conditioned','changed','choices'])sum[k]+=x[k];
          sum.minus[String(x.minus)]++;
          seedOut[i].push(x.win);
          report.fullRounds++;
        }
        for(const alpha of [12,20]){
          const pi=variants.indexOf('a'+alpha+'-plain'),mi=variants.indexOf('a'+alpha+'-memory');
          const k='a'+alpha,p=pairs[k]||(pairs[k]={improved:0,worsened:0,tied:0});
          if(outcomes[mi].win>outcomes[pi].win)p.improved++;
          else if(outcomes[mi].win<outcomes[pi].win)p.worsened++;
          else p.tied++;
        }
      }
      for(let i=0;i<variants.length;i++)bySeed[i].push(seedOut[i].reduce((a,b)=>a+b,0)/3);
    }
    const rows=variants.map((variant,i)=>{
      const x=sums[i],ref=i===3?1:(i===2?1:(i===4?3:0));
      const deltas=bySeed[i].map((v,j)=>v-bySeed[ref][j]);
      const mean=deltas.reduce((a,b)=>a+b,0)/count;
      const sd=Math.sqrt(deltas.reduce((a,b)=>a+(b-mean)**2,0)/(count-1));
      const ci=1.96*sd/Math.sqrt(count);
      return {variant,rounds:count*3,winRate:x.win/(count*3),winDeltaVsReference:mean,
        referenceVariant:variants[ref],exploratorySeedCI95:[mean-ci,mean+ci],
        meanPips:x.pips/(count*3),blockRate:x.block/(count*3),meanTurns:x.turns/(count*3),
        passEvents:x.passEvents,posteriorChecks:x.posteriorChecks,conditionedDecisions:x.conditioned,
        directMemoryChanges:x.changed,choices:x.choices,minus:x.minus,unresolved:x.unresolved};
    });
    report.profiles.push({profile,rows,pairedMemoryVsPlain:pairs});
  }
  return report;
}
function test(){
  const a=run(1300000,3),b=run(1300000,3);
  if(JSON.stringify(a)!==JSON.stringify(b)||a.fullRounds!==90||
    a.profiles.some(p=>p.rows.some(x=>x.unresolved!==0)))throw Error('determinism or termination');
  if(Math.abs(pass(7,2,2)-10/21)>1e-12)throw Error('hypergeom formula regression');
  return {passed:true,fullRounds:a.fullRounds};
}
if(require.main===module){
  const a=process.argv.slice(2);
  console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1300000),+(a[1]||200)),null,2));
}
module.exports={legalKeys,select,play,run,test};