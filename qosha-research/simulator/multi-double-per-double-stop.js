'use strict';
// Exact optional stop-after-each-double experiment; 24 previously counted hands x 2048 worlds.
// Late-arrival branch models are PROVISIONAL; no full-round or win-rate inference.
// node qosha-research/simulator/multi-double-per-double-stop.js [test|2048]
const {select,shuffled,DECK,key,init,actions,apply,choose,turn}=require('./opening-double-followup-new-hands');
const check=(v,m)=>{if(!v)throw Error(m||'assertion failed');};
const zeros=()=>Array(8).fill(0);
function paths(board,hand,policy,model){
  let a=choose(actions(board,hand),policy),b=board,h=hand,n=0,k=0;
  if(!a)return [{b,h,n:0,k:0,stop:0}];
  const firstDouble=a.dbl,out=[];
  while(a){
    check(a.i>=0&&a.i<h.length,'legal action index');
    b=apply(b,a,model);h=h.filter((_,i)=>i!==a.i);n++;
    const next=firstDouble&&n<4?choose(actions(b,h).filter(x=>x.dbl),policy):null;
    if(!next){out.push({b,h,n,k,stop:0});break;}
    out.push({b,h,n,k,stop:1});
    a=next;k++;
  }
  return out;
}
function add(poly,value,k,stops){
  check(k+stops<poly.length,'degree overflow');
  poly[k]+=value;
  if(stops===1)poly[k+1]-=value;
  else if(stops===2){poly[k+1]-=2*value;poly[k+2]+=value;}
  else check(stops===0,'more than two stop factors');
}
function response(board,h1,h2,move,policy,model){
  const poly=zeros();
  for(const a of paths(apply(board,move,model),h1,policy,model))
    for(const b of paths(a.b,h2,policy,model))
      add(poly,a.n+b.n,a.k+b.k,a.stop+b.stop);
  return poly;
}
function evaluate(poly,p){let v=0;for(let i=poly.length-1;i>=0;i--)v=v*p+poly[i];return v;}
function root(poly){
  let a=0,b=1,fa=evaluate(poly,a),fb=evaluate(poly,b);
  if(fa===0)return 0;if(fa*fb>0)return null;
  for(let i=0;i<55;i++){const m=(a+b)/2,fm=evaluate(poly,m);if(fa*fm<=0)b=m;else{a=m;fa=fm;}}
  return (a+b)/2;
}
function experiment(worldsPerHand=2048){
  check(Number.isInteger(worldsPerHand)&&worldsPerHand>0&&worldsPerHand<=2048,'worldsPerHand');
  const {selected,valid,eligible}=select(3121128,30000);
  const expected=[3121692,3135571,3141679,3134869,3141013,3138271,3123759,3145162,3137447,3141340,3121458,3133903,3127986,3122552,3123394,3123650,3128804,3143502,3144208,3124572,3134351,3132763,3134503,3135438];
  check(JSON.stringify(selected.map(x=>x.seed))===JSON.stringify(expected),'fixture seeds');
  check(valid===28920&&eligible===10612,'deal census');
  const stats={};
  for(const policy of ['high','low'])for(const model of ['global','current'])
    stats[policy+'-'+model]={coeff:zeros(),hands:[],nonlinearWorlds:0};
  let worlds=0;
  for(let fi=0;fi<selected.length;fi++){
    const f=selected[fi],known=new Set(['1-1',...f.hand.map(key)]);
    const pool=DECK.filter(t=>!known.has(key(t)));
    const focal=f.hand.filter(t=>key(t)!==key([Math.min(1,f.x),Math.max(1,f.x)]));
    check(known.size===10&&pool.length===18&&focal.length===8,'tile conservation');
    const local={};for(const k of Object.keys(stats))local[k]=zeros();
    for(let wi=0;wi<worldsPerHand;wi++){
      const seed=3151128+fi*2048+wi,d=shuffled(seed,pool),h1=d.slice(0,9),h2=d.slice(9);
      check(new Set([...known,...h1.map(key),...h2.map(key)]).size===28,'hidden-world duplicate');
      worlds++;
      for(const policy of ['high','low'])for(const model of ['global','current']){
        const a=turn(init(f.x),h1,policy,model),b=turn(a.b,h2,policy,model);
        const moves=actions(b.b,focal),dbl=choose(moves.filter(x=>x.dbl),'high'),ord=choose(moves.filter(x=>!x.dbl),'high');
        check(dbl&&ord,'paired candidates');
        const pd=response(b.b,a.h,b.h,dbl,policy,model),po=response(b.b,a.h,b.h,ord,policy,model);
        const cell=stats[policy+'-'+model],l=local[policy+'-'+model];
        let nonlinear=false;
        for(let j=0;j<8;j++){const delta=pd[j]-po[j];cell.coeff[j]+=delta;l[j]+=delta;if(j>=2&&delta)nonlinear=true;}
        if(nonlinear)cell.nonlinearWorlds++;
      }
    }
    for(const [k,cell] of Object.entries(stats))cell.hands.push({seed:f.seed,coeff:local[k]});
  }
  const summary={};
  for(const [k,cell] of Object.entries(stats)){
    const coeff=cell.coeff,values={};
    for(const p of [0,0.1,0.25,0.5,0.75,1])values[String(p)]=evaluate(coeff,p)/worlds;
    const means=cell.hands.map(x=>evaluate(x.coeff,0.5)/worldsPerHand);
    const avg=means.reduce((a,b)=>a+b,0)/24;
    const variance=means.reduce((a,b)=>a+(b-avg)**2,0)/23;
    summary[k]={numeratorPolynomial:coeff,meanPolynomial:coeff.map(x=>x/worlds),
      deltaOpponentStonesByContinueProbability:values,breakEvenContinueProbability:root(coeff),
      nonlinearWorlds:cell.nonlinearWorlds,
      halfContinueExploratoryHandCI95:[avg-1.96*Math.sqrt(variance/24),avg+1.96*Math.sqrt(variance/24)],
      positiveHandsAtHalf:means.filter(x=>x>0).length,negativeHandsAtHalf:means.filter(x=>x<0).length};
  }
  return {schema:'qosha-multi-double-per-double-stop/v1',
    engine:'qosa-research-0.5.3 + multi-double-per-double-stop-1.0',
    rules:'recovered qosa-1.0.0 3x9; global/current late-arrival models PROVISIONAL; no mixed finish',
    reusedDealSeedRange:[3121128,3151127],worldSeedFormula:'3151128 + fixtureIndex*2048 + worldIndex',
    selectedHands:24,worldsPerHand,reusedHiddenWorlds:worlds,
    newDeals:0,newHiddenWorlds:0,newCompleteRounds:0,newForcedContinuations:0,
    compared:'focal highest-pip double minus highest-pip ordinary, high/low opponents',
    probabilityMeaning:'p is probability to CONTINUE after EACH double if another legal double exists, independently at every stop opportunity; max four; ordinary-first never chains',
    summary,limitations:['same 24 balanced hands and previously counted worlds','human per-double continuation probability unknown',
      'provisional late-arrival branches and blocked ties','no complete-round win/minus/regret claim']};
}
function test(){
  const b={ends:[2,3,4,5],locks:[true,true,true,true],opened:[1]},h=[[2,2],[3,3],[4,4],[5,5]];
  const q=paths(b,h,'high','global');check(q.length===4&&q[0].n===1&&q[0].stop===1&&q[3].n===4&&q[3].k===3,'four optional stops');
  const p=zeros();for(const x of q)add(p,x.n,x.k,x.stop);
  check(evaluate(p,0)===1&&evaluate(p,1)===4&&Math.abs(evaluate(p,0.5)-1.875)<1e-12,'path probability');
  check(paths(b,[[0,4],[2,2]],'low','global').length===1,'ordinary-first never chains');
  const a=experiment(2),c=experiment(2);check(JSON.stringify(a)===JSON.stringify(c),'smoke replay');
  const full=experiment(2048);
  for(const model of ['global','current']){
    const hi=full.summary['high-'+model],lo=full.summary['low-'+model];
    check(hi.numeratorPolynomial[0]===3853&&evaluate(hi.numeratorPolynomial,1)===-11911,'high endpoints');
    check(lo.numeratorPolynomial[0]===7205&&evaluate(lo.numeratorPolynomial,1)===-7947,'low endpoints');
    check(hi.numeratorPolynomial[2]===-2034&&lo.numeratorPolynomial[2]===-2555,'nonlinear coefficients');
  }
  return {passed:true,smokeWorlds:48,reusedWorlds:49152,highRoot:full.summary['high-global'].breakEvenContinueProbability,lowRoot:full.summary['low-global'].breakEvenContinueProbability};
}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():experiment(process.argv[2]?Number(process.argv[2]):2048),null,2));
module.exports={experiment,test,paths,response,evaluate,root};