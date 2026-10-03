'use strict';
const e=require('./engine');
const r=require('./round-driver');
const init=require('./initializer');

const BUILTIN_STRATEGIES=['random-legal','min-hand-pips','fast-doubles','moderate-double-hold','closed-branch-control'];

function tilesFor(action){return action.type==='single'?[action.tile]:(action.tiles||[]);}
function removedPips(action){return e.pipSum(tilesFor(action));}
function removedDoubles(action){return tilesFor(action).filter(t=>t[0]===t[1]).length;}
function stableKey(action){return `${action.type}:${(action.numbers||[]).join(',')}:${action.side||''}:${action.to??''}:${e.tileKey(action.tile||[0,0])}`;}

function chooseBy(name,opts,ctx={}){
  const actions=opts.actions;
  if(name==='random-legal'){
    const salt=ctx.salt||0;
    const h=e.mixSeed32((ctx.seed ^ Math.imul((ctx.rotation||0)+1,0x9e3779b9) ^ Math.imul((ctx.turns||0)+1,0x85ebca6b) ^ Math.imul((ctx.player||0)+1,0xc2b2ae35) ^ salt)>>>0);
    return actions[h%actions.length];
  }
  return [...actions].sort((a,b)=>{
    const finishA=a.type==='mixed-finish'?1:0,finishB=b.type==='mixed-finish'?1:0;
    if(finishA!==finishB)return finishB-finishA;
    if(name==='fast-doubles'){
      const d=removedDoubles(b)-removedDoubles(a);if(d)return d;
      const p=removedPips(b)-removedPips(a);if(p)return p;
    }else if(name==='min-hand-pips'){
      const p=removedPips(b)-removedPips(a);if(p)return p;
    }else if(name==='moderate-double-hold'){
      const n=opts.hand.length;
      const sa=removedPips(a)-(n>4?3*removedDoubles(a):0);
      const sb=removedPips(b)-(n>4?3*removedDoubles(b):0);
      if(sa!==sb)return sb-sa;
    }else if(name==='closed-branch-control'){
      const oa=a.type==='double-sequence'?(a.numbers||[]).length:0;
      const ob=b.type==='double-sequence'?(b.numbers||[]).length:0;
      if(oa!==ob)return oa-ob;
      const p=removedPips(b)-removedPips(a);if(p)return p;
    }else throw new Error('unknown strategy '+name);
    return stableKey(a).localeCompare(stableKey(b));
  })[0];
}
function median(xs){const a=[...xs].sort((x,y)=>x-y),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;}

function runTournament({strategies,startSeed=0,count=1000,maxTurns=200,salt=0}){
  if(!Array.isArray(strategies)||strategies.length!==3)throw new Error('exactly 3 strategies required');
  const summary={engine:'qosa-research-0.5.3',startSeed,count,maxTurns,seeds:`${startSeed}..${startSeed+count-1}`,strategies:[...strategies],rounds:0,finishes:0,blocks:0,unresolved:0,turnTotal:0,openingPolicy:'initializer default; same deal/opening across rotations',blockWinnerPolicy:'not assigned',byStrategy:{}};
  for(const s of strategies)summary.byStrategy[s]={appearances:0,finishWins:0,finalPips:[],choicePoints:0,actions:0,actionTypes:{single:0,'double-sequence':0,'mixed-finish':0},minusWins:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0}};
  for(let seed=startSeed;seed<startSeed+count;seed++){
    const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
    if(base.kind!=='ready'){summary.unresolved++;continue;}
    for(let rotation=0;rotation<3;rotation++){
      const seatStrategy=[0,1,2].map(seat=>strategies[(seat+rotation)%3]);
      const chooser=(opts,state)=>{
        const name=seatStrategy[state.currentPlayer],m=summary.byStrategy[name];
        m.actions++;if(opts.actions.length>1)m.choicePoints++;
        const action=chooseBy(name,opts,{seed,rotation,turns:state.turns,player:state.currentPlayer,salt});
        m.actionTypes[action.type]=(m.actionTypes[action.type]||0)+1;
        return action;
      };
      const out=r.runRound(base,chooser,{maxTurns});
      summary.rounds++;summary.turnTotal+=out.turns;
      if(out.outcome.kind==='finish'){
        summary.finishes++;
        const name=seatStrategy[out.outcome.playerIndex],m=summary.byStrategy[name];
        m.finishWins++;
        const k=String(out.outcome.minus||0);m.minusWins[k]=(m.minusWins[k]||0)+1;
      }else if(out.outcome.kind==='block')summary.blocks++;
      else summary.unresolved++;
      for(let seat=0;seat<3;seat++){
        const m=summary.byStrategy[seatStrategy[seat]];
        m.appearances++;m.finalPips.push(e.pipSum(out.hands[seat]));
      }
    }
  }
  summary.meanTurns=summary.rounds?summary.turnTotal/summary.rounds:null;
  for(const name of strategies){
    const m=summary.byStrategy[name];
    m.finishWinRate=m.appearances?m.finishWins/m.appearances:null;
    m.meanFinalPips=m.finalPips.length?m.finalPips.reduce((a,b)=>a+b,0)/m.finalPips.length:null;
    m.medianFinalPips=m.finalPips.length?median(m.finalPips):null;
    m.choiceRate=m.actions?m.choicePoints/m.actions:null;
    delete m.finalPips;
  }
  return summary;
}
function runMatchedBaseline(opts={}){return runTournament({...opts,strategies:['random-legal','min-hand-pips','fast-doubles']});}
if(require.main===module){const count=Number(process.argv[2]||1000);console.log(JSON.stringify(runMatchedBaseline({count}),null,2));}
module.exports={BUILTIN_STRATEGIES,chooseBy,runTournament,runMatchedBaseline};
