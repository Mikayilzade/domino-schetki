'use strict';
// Optional opponent multi-double chains on exactly the previously counted 24x2048 worlds.
// node qosha-research/simulator/multi-double-response-sensitivity.js [test|2048]
const {select,shuffled,DECK,key,pips,init,actions,apply,choose,turn}=require('./opening-double-followup-new-hands');
function check(ok,msg){if(!ok)throw Error(msg||'assertion failed');}
function opponentTurn(board,hand,policy,model,chain){
  const first=choose(actions(board,hand),policy);
  if(!first)return{b:board,h:hand,stones:0,extra:0};
  let b=board,h=hand,a=first,n=0;
  while(a){
    check(a.i>=0&&a.i<h.length,'legal index');
    b=apply(b,a,model);h=h.filter((_,i)=>i!==a.i);n++;
    if(!chain||!first.dbl||n===4)break;
    a=choose(actions(b,h).filter(x=>x.dbl),policy);
  }
  check(n<=4,'chain length');
  return{b,h,stones:n,extra:n-1};
}
function follow(board,h1,h2,focal,move,policy,model,chain){
  const a=opponentTurn(apply(board,move,model),h1,policy,model,chain);
  const b=opponentTurn(a.b,h2,policy,model,chain);
  const remaining=focal.filter((_,i)=>i!==move.i);
  return{stones:a.stones+b.stones,extra:a.extra+b.extra,
    ordinary:new Set(actions(b.b,remaining).filter(x=>!x.dbl).map(x=>x.i)).size};
}
function experiment(worldsPerHand=2048){
  check(Number.isInteger(worldsPerHand)&&worldsPerHand>0&&worldsPerHand<=2048,'worldsPerHand 1..2048');
  const {selected,valid,eligible}=select(3121128,30000);
  const expected=[3121692,3135571,3141679,3134869,3141013,3138271,3123759,3145162,3137447,3141340,3121458,3133903,3127986,3122552,3123394,3123650,3128804,3143502,3144208,3124572,3134351,3132763,3134503,3135438];
  check(JSON.stringify(selected.map(x=>x.seed))===JSON.stringify(expected),'selected seeds changed');
  check(valid===28920&&eligible===10612,'deal fixture count changed');
  const stats={};
  for(const policy of ['high','low'])for(const model of ['global','current'])
    stats[policy+'-'+model]={n:0,chainDouble:0,chainOrdinary:0,singleDelta:0,chainDelta:0,mobilityDouble:0,mobilityOrdinary:0,perHand:[]};
  for(let fi=0;fi<selected.length;fi++){
    const f=selected[fi],known=new Set(['1-1',...f.hand.map(key)]);
    const pool=DECK.filter(t=>!known.has(key(t)));
    const focal=f.hand.filter(t=>key(t)!==key([Math.min(1,f.x),Math.max(1,f.x)]));
    check(known.size===10&&pool.length===18&&focal.length===8,'28 tile conservation');
    const local={};for(const k of Object.keys(stats))local[k]={d:0,o:0};
    for(let wi=0;wi<worldsPerHand;wi++){
      const seed=3151128+fi*2048+wi,d=shuffled(seed,pool),h1=d.slice(0,9),h2=d.slice(9);
      check(new Set([...known,...h1.map(key),...h2.map(key)]).size===28,'world uniqueness');
      for(const policy of ['high','low'])for(const model of ['global','current']){
        const k=policy+'-'+model,g=stats[k],l=local[k];
        const a=turn(init(f.x),h1,policy,model),b=turn(a.b,h2,policy,model);
        const moves=actions(b.b,focal),dbl=choose(moves.filter(x=>x.dbl),'high'),ord=choose(moves.filter(x=>!x.dbl),'high');
        check(dbl&&ord,'both choices must be legal');
        const ds=follow(b.b,a.h,b.h,focal,dbl,policy,model,false),os=follow(b.b,a.h,b.h,focal,ord,policy,model,false);
        const dc=follow(b.b,a.h,b.h,focal,dbl,policy,model,true),oc=follow(b.b,a.h,b.h,focal,ord,policy,model,true);
        g.n++;g.chainDouble+=dc.extra;g.chainOrdinary+=oc.extra;l.d+=dc.extra;l.o+=oc.extra;
        g.singleDelta+=ds.stones-os.stones;g.chainDelta+=dc.stones-oc.stones;
        g.mobilityDouble+=dc.ordinary-ds.ordinary;g.mobilityOrdinary+=oc.ordinary-os.ordinary;
      }
    }
    for(const k of Object.keys(stats))stats[k].perHand.push({seed:f.seed,x:f.x,extraAfterDouble:local[k].d,extraAfterOrdinary:local[k].o});
  }
  const summary={};
  for(const [k,g] of Object.entries(stats)){
    check(g.n===24*worldsPerHand,'sample count');
    summary[k]={worlds:g.n,extraDoubleTiles:g.chainDouble,extraOrdinaryTiles:g.chainOrdinary,
      extraTilesPerWorldAfterDouble:g.chainDouble/g.n,extraTilesPerWorldAfterOrdinary:g.chainOrdinary/g.n,
      deltaOpponentStonesSingle:g.singleDelta/g.n,deltaOpponentStonesChain:g.chainDelta/g.n,
      ordinaryMobilityChangeAfterDouble:g.mobilityDouble/g.n,ordinaryMobilityChangeAfterOrdinary:g.mobilityOrdinary/g.n,
      handsWithChainAfterDouble:g.perHand.filter(x=>x.extraAfterDouble>0).length,
      handsWithChainAfterOrdinary:g.perHand.filter(x=>x.extraAfterOrdinary>0).length};
  }
  return{schema:'qosha-multi-double-response-sensitivity/v1',
    engine:'qosa-research-0.5.3 + multi-double-response-sensitivity-1.0',
    rules:'3x9 first-round 1-1; global/current branch models provisional; greedy optional double-only chains, cap four',
    reusedDealSeeds:[3121128,3151127],worldSeedFormula:'3151128 + fixtureIndex*2048 + worldIndex',
    selectedHands:24,worldsPerHand,reusedHiddenWorlds:24*worldsPerHand,newDeals:0,newHiddenWorlds:0,newFullRounds:0,
    opponentPolicies:['high','low'],summary,
    limitations:['same selected hands and hidden worlds; no cumulative sample increase',
      'optional aggressive chain policy is not observed human play','pip cost and geometry confounded',
      'late-arrival branch reopening and blocked ties unconfirmed','no full-round win/minus/regret claim']};
}
function test(){
 const a=experiment(2),b=experiment(2);check(JSON.stringify(a)===JSON.stringify(b),'deterministic replay');
 check(a.reusedHiddenWorlds===48,'smoke worlds');
 const c=experiment(2048);
 check(Math.abs(c.summary['high-global'].deltaOpponentStonesSingle-0.07838948567708333)<1e-12,'prior high regression');
 check(Math.abs(c.summary['low-global'].deltaOpponentStonesSingle-0.14658610026041666)<1e-12,'prior low regression');
 check(c.summary['high-global'].deltaOpponentStonesChain<0&&c.summary['low-global'].deltaOpponentStonesChain<0,'chain sensitivity');
 return{passed:true,smokeWorlds:48,fullReusedWorlds:49152,deterministic:true};
}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():experiment(process.argv[2]?Number(process.argv[2]):2048),null,2));
module.exports={experiment,test};
