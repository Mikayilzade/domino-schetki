'use strict';
// Exact per-opponent-turn chain-policy mixture on previously counted 24x2048 hidden worlds.
// Each opponent independently chooses SINGLE or GREEDY-CHAIN for their whole turn.
// No new deals/worlds; late-arrival branch models are PROVISIONAL.
// node qosha-research/simulator/multi-double-turn-mixture.js [test|2048]
const {select,shuffled,DECK,key,init,actions,apply,choose,turn}=require('./opening-double-followup-new-hands');
const check=(v,m)=>{if(!v)throw Error(m||'assertion failed');};
function reply(board,hand,policy,model,greedy){
  let a=choose(actions(board,hand),policy),b=board,h=hand,n=0,extra=0;
  if(!a)return {b,h,first:0,extra:0,stones:0};
  const firstDouble=a.dbl;
  while(a){
    check(a.i>=0&&a.i<h.length,'illegal action index');
    b=apply(b,a,model);h=h.filter((_,i)=>i!==a.i);n++;
    if(!greedy||!firstDouble||n>=4)break;
    a=choose(actions(b,h).filter(z=>z.dbl),policy);
  }
  extra=n-1;
  return {b,h,first:1,extra,stones:n};
}
function follow(b,h1,h2,move,policy,model,firstGreedy,secondGreedy){
  const a=reply(apply(b,move,model),h1,policy,model,firstGreedy);
  const c=reply(a.b,h2,policy,model,secondGreedy);
  return {stones:a.stones+c.stones,first1:a.first,first2:c.first,extra:a.extra+c.extra};
}
function solveThreshold(d){
  const at=p=>d[0]*(1-p)*(1-p)+(d[1]+d[2])*p*(1-p)+d[3]*p*p;
  if(at(0)===0)return 0;
  if(at(0)*at(1)>0)return null;
  let lo=0,hi=1;
  for(let i=0;i<60;i++){const mid=(lo+hi)/2;if(at(lo)*at(mid)<=0)hi=mid;else lo=mid;}
  return (lo+hi)/2;
}
function experiment(worldsPerHand=2048){
  check(Number.isInteger(worldsPerHand)&&worldsPerHand>0&&worldsPerHand<=2048,'worldsPerHand');
  const {selected,valid,eligible}=select(3121128,30000);
  const expected=[3121692,3135571,3141679,3134869,3141013,3138271,3123759,3145162,3137447,3141340,3121458,3133903,3127986,3122552,3123394,3123650,3128804,3143502,3144208,3124572,3134351,3132763,3134503,3135438];
  check(JSON.stringify(selected.map(x=>x.seed))===JSON.stringify(expected),'starter fixture changed');
  check(valid===28920&&eligible===10612,'deal census changed');
  const raw={};
  for(const policy of ['high','low'])for(const model of ['global','current']){
    raw[policy+'-'+model]={combos:Array.from({length:4},()=>({stones:0,first1:0,first2:0,extra:0})),nonzeroInteractions:0,positiveInteractions:0,negativeInteractions:0,maxAbsInteraction:0};
  }
  let worlds=0;
  for(let fi=0;fi<selected.length;fi++){
    const f=selected[fi],known=new Set(['1-1',...f.hand.map(key)]);
    const pool=DECK.filter(t=>!known.has(key(t)));
    const focal=f.hand.filter(t=>key(t)!==key([Math.min(1,f.x),Math.max(1,f.x)]));
    check(known.size===10&&pool.length===18&&focal.length===8,'tile conservation');
    for(let wi=0;wi<worldsPerHand;wi++){
      const seed=3151128+fi*2048+wi,d=shuffled(seed,pool),h1=d.slice(0,9),h2=d.slice(9);
      check(new Set([...known,...h1.map(key),...h2.map(key)]).size===28,'world duplicate tile');
      worlds++;
      for(const policy of ['high','low'])for(const model of ['global','current']){
        const first=turn(init(f.x),h1,policy,model);
        const second=turn(first.b,h2,policy,model);
        const acts=actions(second.b,focal);
        const dbl=choose(acts.filter(x=>x.dbl),'high');
        const ord=choose(acts.filter(x=>!x.dbl),'high');
        check(dbl&&ord,'paired candidate missing');
        const cell=raw[policy+'-'+model],arr=cell.combos,local=[];
        for(let combo=0;combo<4;combo++){
          const c1=!!(combo&1),c2=!!(combo&2);
          const a=follow(second.b,first.h,second.h,dbl,policy,model,c1,c2);
          const b=follow(second.b,first.h,second.h,ord,policy,model,c1,c2);
          const g=arr[combo];local.push(a.stones-b.stones);
          for(const metric of ['stones','first1','first2','extra'])g[metric]+=a[metric]-b[metric];
        }
        const interaction=local[3]-local[1]-local[2]+local[0];
        if(interaction){cell.nonzeroInteractions++;if(interaction>0)cell.positiveInteractions++;else cell.negativeInteractions++;}
        cell.maxAbsInteraction=Math.max(cell.maxAbsInteraction,Math.abs(interaction));
      }
    }
  }
  const summary={};
  for(const [k,cell] of Object.entries(raw)){
    const arr=cell.combos;
    for(const g of arr)check(g.stones===g.first1+g.first2+g.extra,'decomposition '+k);
    const d=arr.map(g=>g.stones/worlds);
    const root=solveThreshold(d);
    summary[k]={
      deltaOpponentStonesByTurnPolicy:{
        neitherGreedy:d[0],firstOnlyGreedy:d[1],secondOnlyGreedy:d[2],bothGreedy:d[3]},
      exactDeltaNumerators:arr.map(g=>g.stones),
      secondOpponentFirstMoveNumerators:arr.map(g=>g.first2),
      extraDoubleNumerators:arr.map(g=>g.extra),
      firstOpponentFirstMoveNumerators:arr.map(g=>g.first1),
      perTurnMixturePolynomial:{
        constant:d[0],linear:d[1]+d[2]-2*d[0],quadratic:d[0]-d[1]-d[2]+d[3]},
      perTurnBreakEven:root,
      wholeWorldBreakEven:d[0]/(d[0]-d[3]),
      nonzeroInteractionWorlds:cell.nonzeroInteractions,
      positiveInteractionWorlds:cell.positiveInteractions,
      negativeInteractionWorlds:cell.negativeInteractions,
      maxAbsWorldInteraction:cell.maxAbsInteraction,
      expectedAtQuarter:(9*d[0]+3*d[1]+3*d[2]+d[3])/16,
      expectedAtHalf:(d[0]+d[1]+d[2]+d[3])/4,
      expectedAtThreeQuarters:(d[0]+3*d[1]+3*d[2]+9*d[3])/16
    };
  }
  return {schema:'qosha-multi-double-per-turn-mixture/v1',
    engine:'qosa-research-0.5.3 + multi-double-turn-mixture-1.0',
    rules:'recovered qosa-1.0.0 3x9; both branch models PROVISIONAL; no mixed finish',
    reusedDealSeedRange:[3121128,3151127],
    reusedWorldSeedFormula:'3151128 + fixtureIndex*2048 + worldIndex',
    selectedHands:24,worldsPerHand,reusedHiddenWorlds:worlds,
    newDeals:0,newHiddenWorlds:0,newCompleteRounds:0,newForcedContinuations:0,
    compared:'focal double minus ordinary; high/low opponents; independently choose greedy chain or single at start of each opponent turn',
    policyMixture:'each opponent TURN independently greedy with probability p; greedy means all available double-only follow-ups, capped at four; NOT independent per-double stop',
    summary,
    limitations:['reuses prior worlds, not an independent holdout','24 balanced hands, not a population sample',
      'simple opponent policies, human greedy-turn probability unknown','late-arrival branches and blocked ties provisional',
      'no full-round win, minus, block or regret claim']};
}
function test(){
  const a=experiment(2),b=experiment(2);
  check(JSON.stringify(a)===JSON.stringify(b),'deterministic replay');
  check(a.reusedHiddenWorlds===48,'smoke world count');
  for(const s of Object.values(a.summary))check(s.exactDeltaNumerators.length===4,'four combinations');
  const full=experiment(2048);
  for(const model of ['global','current']){
    const h=full.summary['high-'+model],l=full.summary['low-'+model];
    check(h.exactDeltaNumerators[0]===3853&&h.exactDeltaNumerators[3]===-11911,'high old endpoints');
    check(l.exactDeltaNumerators[0]===7205&&l.exactDeltaNumerators[3]===-7947,'low old endpoints');
    check(Math.abs(h.wholeWorldBreakEven-0.24441766049226085)<1e-12,'high old root');
    check(Math.abs(l.wholeWorldBreakEven-0.47551478352692717)<1e-12,'low old root');
    check(h.nonzeroInteractionWorlds===0&&l.nonzeroInteractionWorlds===0,'turn-policy interaction must be zero on every world');
    check(Math.abs(h.perTurnBreakEven-h.wholeWorldBreakEven)<1e-12&&Math.abs(l.perTurnBreakEven-l.wholeWorldBreakEven)<1e-12,'per-turn and whole-world break-even consistency');
  }
  return {passed:true,smokeWorlds:48,fullReusedWorlds:49152,deterministic:true,highPerTurnRoot:full.summary['high-global'].perTurnBreakEven,lowPerTurnRoot:full.summary['low-global'].perTurnBreakEven};
}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():experiment(process.argv[2]?Number(process.argv[2]):2048),null,2));
module.exports={experiment,test,reply,follow,solveThreshold};