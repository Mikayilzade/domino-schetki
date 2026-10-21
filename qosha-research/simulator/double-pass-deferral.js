'use strict';
// Deterministic 3x9 optional-double deferral after observed no-stock passes.
// Run: node qosha-research/simulator/double-pass-deferral.js test
// Run: node qosha-research/simulator/double-pass-deferral.js 1309490 250
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner'),j=require('./joint-pass-memory-runner');
const deck=e.createDoubleSixDeck(),profiles=['min-hand-pips','closed-branch-control'];
const variants=['a20-one','a20-joint','joint-defer-either','joint-defer-both'];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const median=a=>{const z=[...a].sort((x,y)=>x-y),k=z.length/2;return z.length%2?z[Math.floor(k)]:(z[k-1]+z[k])/2;};
const tiles=a=>a.type==='single'?[a.tile]:(a.tiles||[]);
function legalKeys(branch,opening){return new Set(deck.filter(t=>d.actionsForHand(branch,opening,[t]).length).map(e.tileKey));}
function shouldDefer(mode,action,options,forbidden,seat){
  if(!mode.startsWith('joint-defer-')||action.type!=='double-sequence'||!options.actions.some(a=>a.type==='single'||a.type==='mixed-finish'))return false;
  const next=forbidden[(seat+1)%3].size>0,other=forbidden[(seat+2)%3].size>0;
  return mode==='joint-defer-either'?(next||other):(next&&other);
}
function play(base,seat,profile,variant){
  let state=r.cloneRoundState(base);
  const live=new Set([...base.hands.flat(),...base.stock].map(e.tileKey));
  const known=deck.filter(t=>!live.has(e.tileKey(t)));
  const forbidden=Array.from({length:3},()=>new Set());
  const counts={choices:0,bothPassChoices:0,eitherPassChoices:0,doubleOpenings:0,
    doubleAfterEither:0,doubleAfterBoth:0,deferrals:0,deferralsBoth:0,passEvents:0};
  while(!state.outcome&&state.turns<200){
    const p=state.currentPlayer,opts=d.turnOptions(state.branchState,state.openingState,state.hands[p],state.stock);
    let action=null;
    if(opts.phase==='pass'&&!state.stock.length){
      for(const z of legalKeys(state.branchState,state.openingState))forbidden[p].add(z);
      for(const t of state.hands[p])if(forbidden[p].has(e.tileKey(t)))throw Error('pass contradicts hand');
      counts.passEvents++;
    }
    if(opts.phase==='play'){
      if(p===seat){
        const next=forbidden[(p+1)%3].size>0,other=forbidden[(p+2)%3].size>0;
        if(opts.actions.length>1){counts.choices++;if(next||other)counts.eitherPassChoices++;if(next&&other)counts.bothPassChoices++;}
        const mode=variant==='a20-one'?'a20-one':'a20-joint';
        action=j.select(opts,state,known,forbidden,mode).action;
        if(shouldDefer(variant,action,opts,forbidden,p)){
          action=j.select({...opts,actions:opts.actions.filter(a=>a.type!=='double-sequence')},
            state,known,forbidden,'a20-joint').action;
          counts.deferrals++;if(next&&other)counts.deferralsBoth++;
        }
        if(action.type==='double-sequence'){
          counts.doubleOpenings++;if(next||other)counts.doubleAfterEither++;if(next&&other)counts.doubleAfterBoth++;
        }
      }else action=chooseBy(profile,opts);
    }
    state=r.stepRound(state,()=>action);
    if(action)known.push(...tiles(action));
  }
  const o=state.outcome||{kind:'unresolved'};
  return {...counts,win:+(o.kind==='finish'&&o.playerIndex===seat),
    pips:e.pipSum(state.hands[seat]),block:+(o.kind==='block'),
    unresolved:+(o.kind==='unresolved'),turns:state.turns,
    minus:o.kind==='finish'&&o.playerIndex===seat?o.minus:0};
}
function run(start=1309490,count=250){
  if(!Number.isInteger(start)||!Number.isInteger(count)||count<2)throw Error('bad seeds');
  const report={schema:'qosa-double-pass-deferral/v1',engine:'qosa-research-0.5.3',
    rules:'qosa-1.0.0',mode:'3x9',startSeed:start,endSeed:start+count-1,deals:count,
    variants,fullRounds:0,profiles:[],
    hypothesis:'Opening optional doubles after recorded no-stock passes may hurt alpha20 joint policy.',
    assumptions:'Same initial deal and fixed opponent policies; optional double is deferred only if a non-double action is legal. Either/both refers to no-stock pass histories.',
    limitations:'Provisional branch rules, fixed deterministic opponents, no block winner, initial 1-1 already removed, trajectories diverge; exploratory seed-cluster CI, post-treatment pass strata descriptive.'};
  for(const profile of profiles){
    const sums=variants.map(()=>({wins:0,pips:[],blocks:0,unresolved:0,turns:0,
      minus:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0},
      choices:0,bothPassChoices:0,eitherPassChoices:0,doubleOpenings:0,
      doubleAfterEither:0,doubleAfterBoth:0,deferrals:0,deferralsBoth:0,passEvents:0}));
    const bySeed=variants.map(()=>[]),byDoubles={zero:[],one:[],twoPlus:[]};
    for(let seed=start;seed<start+count;seed++){
      const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
      if(base.kind!=='ready')throw Error('initializer unresolved '+seed);
      const wins=variants.map(()=>[]);
      for(let seat=0;seat<3;seat++){
        const dbl=base.hands[seat].filter(t=>t[0]===t[1]).length;
        const outcomes=variants.map(v=>play(base,seat,profile,v));
        const group=dbl===0?'zero':dbl===1?'one':'twoPlus';
        byDoubles[group].push({seed,seat,initialDoubles:dbl,delta:outcomes[1].win-outcomes[0].win,
          deferEitherDelta:outcomes[2].win-outcomes[1].win,
          deferBothDelta:outcomes[3].win-outcomes[1].win});
        for(let i=0;i<variants.length;i++){
          const o=outcomes[i],s=sums[i];s.wins+=o.win;s.pips.push(o.pips);
          for(const f of ['blocks','unresolved','turns','choices','bothPassChoices','eitherPassChoices','doubleOpenings','doubleAfterEither','doubleAfterBoth','deferrals','deferralsBoth','passEvents'])
            s[f]+=f==='blocks'?o.block:o[f];
          s.minus[String(o.minus)]++;wins[i].push(o.win);report.fullRounds++;
        }
      }
      for(let i=0;i<variants.length;i++)bySeed[i].push(mean(wins[i]));
    }
    const rows=variants.map((v,i)=>{
      const s=sums[i],ref=i===0?0:i===1?0:1,ds=bySeed[i].map((x,k)=>x-bySeed[ref][k]);
      const mu=mean(ds),sd=Math.sqrt(ds.reduce((a,x)=>a+(x-mu)**2,0)/(count-1)),ci=1.96*sd/Math.sqrt(count);
      return {variant:v,reference:variants[ref],rounds:count*3,finishFirstRate:s.wins/(count*3),
        deltaFinishFirst:mu,exploratorySeedCI95:[mu-ci,mu+ci],
        meanPips:mean(s.pips),medianPips:median(s.pips),blockRate:s.blocks/(count*3),
        meanTurns:s.turns/(count*3),minus:s.minus,unresolved:s.unresolved,
        choices:s.choices,bothPassChoices:s.bothPassChoices,eitherPassChoices:s.eitherPassChoices,
        doubleOpenings:s.doubleOpenings,doubleAfterEither:s.doubleAfterEither,
        doubleAfterBoth:s.doubleAfterBoth,deferrals:s.deferrals,deferralsBoth:s.deferralsBoth};
    });
    const initialDoubleStrata=Object.fromEntries(Object.entries(byDoubles).map(([name,arr])=>[name,{
      seats:arr.length,jointMinusOne:arr.length?mean(arr.map(x=>x.delta)):null,
      deferEitherMinusJoint:arr.length?mean(arr.map(x=>x.deferEitherDelta)):null,
      deferBothMinusJoint:arr.length?mean(arr.map(x=>x.deferBothDelta)):null}]));
    report.profiles.push({profile,rows,initialDoubleStrata});
  }
  return report;
}
function test(){
  const a=run(1309490,5),b=run(1309490,5);
  if(JSON.stringify(a)!==JSON.stringify(b)||a.fullRounds!==120||
    a.profiles.some(p=>p.rows.some(x=>x.unresolved)))throw Error('replay or unresolved');
  const single={type:'single'},dbl={type:'double-sequence'},opts={actions:[single,dbl]};
  const f=[new Set(),new Set(['1-2']),new Set()];
  if(!shouldDefer('joint-defer-either',dbl,opts,f,0)||
      shouldDefer('joint-defer-both',dbl,opts,f,0))throw Error('one-pass gate');
  f[2].add('0-2');
  if(!shouldDefer('joint-defer-both',dbl,opts,f,0)||
      shouldDefer('a20-joint',dbl,opts,f,0)||
      shouldDefer('joint-defer-both',single,opts,f,0))throw Error('both-pass gate');
  return {passed:true,fullRounds:a.fullRounds};
}
if(require.main===module){
  const a=process.argv.slice(2);
  console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1309490),+(a[1]||250)),null,2));
}
module.exports={run,test,play,shouldDefer};
