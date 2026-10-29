'use strict';
// Matched hidden-world test: play a legal double or an ordinary tile on the
// starter's return, then let each opponent reply once. No full-game win claim.
// node qosha-research/simulator/opening-double-followup.js [test|8192]
const assert=require('assert');
const {createDoubleSixDeck,tileKey}=require('./engine');
const {selectFixtures}=require('./opening-second-reply-holdout');
const deck=createDoubleSixDeck(),key=tileKey,pips=t=>t[0]+t[1];
function mixSeed32(seed){let z=(seed>>>0)+0x9e3779b9;z=Math.imul(z^(z>>>16),0x21f0aaad);z=Math.imul(z^(z>>>15),0x735a2d97);return(z^(z>>>15))>>>0;}
function rng(seed){let s=mixSeed32(seed);if(s===0)s=0x9e3779b9;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/0x100000000;};}
function split(pool,seed){const d=pool.slice(),r=rng(seed);for(let i=d.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return[d.slice(0,9),d.slice(9)];}
const init=x=>({ends:[x,1,1,1],locks:[true,false,false,false],opened:[1]});
function actions(b,h){const out=[];for(let i=0;i<h.length;i++){const t=h[i],dbl=t[0]===t[1];for(let side=0;side<4;side++){const end=b.ends[side];if(dbl){if(t[0]===end&&!b.opened.includes(end))out.push({i,side,t,dbl,to:end});}else if(!b.locks[side]&&(t[0]===end||t[1]===end))out.push({i,side,t,dbl,to:t[0]===end?t[1]:t[0]});}}return out;}
function apply(b,a,model){const n={ends:b.ends.slice(),locks:b.locks.slice(),opened:b.opened.slice()};if(a.dbl){n.locks[a.side]=false;n.opened.push(a.to);}else{n.ends[a.side]=a.to;n.locks[a.side]=!(model==='global'&&n.opened.includes(a.to));}return n;}
function choose(acts,policy){let best=null;for(const a of acts){if(!best){best=a;continue;}const d=pips(a.t)-pips(best.t);if((policy==='high'?d>0:d<0)||(d===0&&(key(a.t)<key(best.t)||(key(a.t)===key(best.t)&&a.side<best.side))))best=a;}return best;}
function turn(b,h,policy,model){const a=choose(actions(b,h),policy);return a?{b:apply(b,a,model),h:h.filter((_,i)=>i!==a.i),a}:{b,h,a:null};}
function mobility(b,h){const a=actions(b,h);return{tiles:new Set(a.map(z=>z.i)).size,ordinary:new Set(a.filter(z=>!z.dbl).map(z=>z.i)).size,doubles:new Set(a.filter(z=>z.dbl).map(z=>z.i)).size};}
function follow(b,h1,h2,focal,move,policy,model){const next=apply(b,move,model),f=focal.filter((_,i)=>i!==move.i);assert.equal(f.length,7);const p1=turn(next,h1,policy,model),p2=turn(p1.b,h2,policy,model),m=mobility(p2.b,f),op=(p1.a?pips(p1.a.t):0)+(p2.a?pips(p2.a.t):0);return{opponentMoves:+!!p1.a + +!!p2.a,opponentPips:op,starterPips:pips(move.t),returnTiles:m.tiles,returnOrdinary:m.ordinary,returnDoubles:m.doubles,firstPass:+!p1.a,secondPass:+!p2.a,margin:pips(move.t)-op};}
const metrics=['opponentMoves','opponentPips','starterPips','returnTiles','returnOrdinary','returnDoubles','firstPass','secondPass','margin'];
function zero(){return{worlds:0,bothOptions:0,doubleOnly:0,ordinaryOnly:0,neither:0,delta:Object.fromEntries(metrics.map(m=>[m,0])),perHand:[]};}
function experiment(worldsPerHand=8192){
 assert(Number.isInteger(worldsPerHand)&&worldsPerHand>0&&worldsPerHand<=100000);
 const {selected,validDeals,eligibleDeals}=selectFixtures(2904520,20000,2);assert.equal(selected.length,24);assert.equal(validDeals,19241);assert.equal(eligibleDeals,7103);
 const totals={};for(const choice of ['own','unowned'])for(const policy of ['high','low'])for(const model of ['global','current'])totals[[choice,policy,model].join('-')]=zero();
 let worlds=0;const worldSeedStart=2924520;
 for(let fi=0;fi<selected.length;fi++){const f=selected[fi],known=new Set(['1-1',...f.hand.map(key)]),pool=deck.filter(t=>!known.has(key(t)));assert.equal(known.size,10);assert.equal(pool.length,18);
  const local={};for(const k of Object.keys(totals))local[k]=zero();
  for(let wi=0;wi<worldsPerHand;wi++){const seed=worldSeedStart+fi*worldsPerHand+wi,[h1,h2]=split(pool,seed);assert.equal(new Set([...known,...h1.map(key),...h2.map(key)]).size,28);worlds++;
   for(const choice of ['own','unowned']){const x=choice==='own'?f.x:f.y,removeKey=key([Math.min(1,x),Math.max(1,x)]),focal=f.hand.filter(t=>key(t)!==removeKey);assert.equal(focal.length,8);
    for(const policy of ['high','low'])for(const model of ['global','current']){const k=[choice,policy,model].join('-'),g=totals[k],l=local[k];let b=init(x);const p1=turn(b,h1,policy,model),p2=turn(p1.b,h2,policy,model);b=p2.b;const a=actions(b,focal),d=choose(a.filter(z=>z.dbl),'high'),o=choose(a.filter(z=>!z.dbl),'high');g.worlds++;l.worlds++;
     if(d&&o){g.bothOptions++;l.bothOptions++;const dv=follow(b,p1.h,p2.h,focal,d,policy,model),ov=follow(b,p1.h,p2.h,focal,o,policy,model);for(const m of metrics){g.delta[m]+=dv[m]-ov[m];l.delta[m]+=dv[m]-ov[m];}}
     else if(d){g.doubleOnly++;l.doubleOnly++;}else if(o){g.ordinaryOnly++;l.ordinaryOnly++;}else{g.neither++;l.neither++;}
    }
   }
  }
  for(const k of Object.keys(totals)){const r=local[k];totals[k].perHand.push({seed:f.seed,x:f.x,y:f.y,c:f.c,worlds:r.worlds,bothOptions:r.bothOptions,doubleOnly:r.doubleOnly,ordinaryOnly:r.ordinaryOnly,neither:r.neither,marginDelta:r.bothOptions?r.delta.margin/r.bothOptions:null,opponentMovesDelta:r.bothOptions?r.delta.opponentMoves/r.bothOptions:null,ordinaryMobilityDelta:r.bothOptions?r.delta.returnOrdinary/r.bothOptions:null,firstPassDelta:r.bothOptions?r.delta.firstPass/r.bothOptions:null});}
 }
 assert.equal(worlds,selected.length*worldsPerHand);
 const summaries={},handIntervals={};
 for(const [k,g] of Object.entries(totals)){assert.equal(g.worlds,g.bothOptions+g.doubleOnly+g.ordinaryOnly+g.neither);const deltas={};for(const m of metrics)deltas[m]=g.bothOptions?g.delta[m]/g.bothOptions:null;summaries[k]={worlds:g.worlds,bothOptions:g.bothOptions,doubleOnly:g.doubleOnly,ordinaryOnly:g.ordinaryOnly,neither:g.neither,conditionalDeltaDoubleMinusOrdinary:deltas,handsWithBoth:g.perHand.filter(z=>z.bothOptions>0).length};
  const active=g.perHand.filter(z=>z.bothOptions>0);handIntervals[k]={hands:active.length};for(const m of ['marginDelta','opponentMovesDelta','ordinaryMobilityDelta','firstPassDelta']){const a=active.map(z=>z[m]),mean=a.reduce((x,y)=>x+y,0)/a.length,variance=a.reduce((x,y)=>x+(y-mean)**2,0)/(a.length-1);handIntervals[k][m]={mean,ci95Normal:[mean-1.96*Math.sqrt(variance/a.length),mean+1.96*Math.sqrt(variance/a.length)],positiveHands:a.filter(v=>v>0).length,negativeHands:a.filter(v=>v<0).length};}
 }
 const modelDisagreements={};for(const choice of ['own','unowned'])for(const policy of ['high','low']){const a=summaries[[choice,policy,'global'].join('-')],b=summaries[[choice,policy,'current'].join('-')];modelDisagreements[choice+'-'+policy]={bothOptions:a.bothOptions-b.bothOptions,marginDelta:a.conditionalDeltaDoubleMinusOrdinary.margin-b.conditionalDeltaDoubleMinusOrdinary.margin,opponentMovesDelta:a.conditionalDeltaDoubleMinusOrdinary.opponentMoves-b.conditionalDeltaDoubleMinusOrdinary.opponentMoves};}
 return{schema:'qosha-double-followup-matched/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',engine:'qosa-research-0.5.3+opening-double-followup-1.0',rules:'3x9 first-round 1-1; two provisional late-arrival models; optional multi-double declined; one tile per turn',reusedDealSeeds:[2904520,2924519],selectedHands:24,worldSeedRange:[worldSeedStart,worldSeedStart+worlds-1],worldsPerHand,newRandomHiddenWorlds:worlds,newFullRounds:0,newForcedFullGameContinuations:0,strategies:['highest-pip legal double on focal return','highest-pip legal ordinary tile on focal return'],opponentPolicies:['high','low'],summaries,handIntervals,modelDisagreements,limitations:['selected balanced hands, not population-weighted','double-vs-ordinary pip and geometry confounded','late-arrival branch models unconfirmed','no multi-double chains, blocks, first-place, minus, or 101 match score']};
}
function test(){const b=init(2);assert.equal(actions(b,[[0,2]]).length,0);const d=actions(b,[[2,2]])[0];assert(d&&d.dbl);assert(actions(apply(b,d,'global'),[[0,2]]).length>0);const r=experiment(2),again=experiment(2);delete r.timestampAsiaBaku;delete again.timestampAsiaBaku;assert.deepStrictEqual(r,again);assert.equal(r.newRandomHiddenWorlds,48);for(const x of Object.values(r.summaries))assert.equal(x.worlds,48);return{passed:true,selected:24,smallWorlds:48,deterministicReplay:true};}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():experiment(process.argv[2]?Number(process.argv[2]):8192),null,2));
module.exports={experiment,test};
