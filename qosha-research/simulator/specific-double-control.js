'use strict';
const e=require('./engine');
const r=require('./round-driver');
const init=require('./initializer');
const {chooseBy}=require('./strategy-runner');

const STRATEGIES=['min-hand-pips','moderate-double-hold','closed-branch-control'];
const DOUBLE_KEYS=[0,1,2,3,4,5,6].map(n=>n+'-'+n);

function rawFeatures(seed){
  const deal=e.dealThreeByNine(seed);
  const owner={};
  for(let seat=0;seat<3;seat++){
    const keys=new Set(deal.hands[seat].map(e.tileKey));
    owner[seat]={
      doubleCount:DOUBLE_KEYS.filter(k=>keys.has(k)).length,
      doubles:Object.fromEntries(DOUBLE_KEYS.map(k=>[k,keys.has(k)])),
      starter:keys.has('1-1')
    };
  }
  return owner;
}
function bucket(){return{n:0,wins:0,pips:0};}
function add(b,win,pips){b.n++;if(win)b.wins++;b.pips+=pips;}
function runControlled({startSeed=30000,count=10000,maxTurns=200}={}){
  const out={timestamp:new Date().toISOString(),engine:'qosa-research-0.5.3',seeds:`${startSeed}..${startSeed+count-1}`,rounds:0,finishes:0,blocks:0,unresolved:0,strategies:STRATEGIES,byStrategy:{}};
  for(const s of STRATEGIES)out.byStrategy[s]={strata:{},specific:{}};
  for(let seed=startSeed;seed<startSeed+count;seed++){
    const features=rawFeatures(seed);
    const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
    if(base.kind!=='ready'){out.unresolved++;continue;}
    for(let rotation=0;rotation<3;rotation++){
      const seatStrategy=[0,1,2].map(seat=>STRATEGIES[(seat+rotation)%3]);
      const chooser=(opts,state)=>chooseBy(seatStrategy[state.currentPlayer],opts,{seed,rotation,turns:state.turns,player:state.currentPlayer});
      const end=r.runRound(base,chooser,{maxTurns});
      out.rounds++;
      let winner=null;
      if(end.outcome.kind==='finish'){out.finishes++;winner=end.outcome.playerIndex;}
      else if(end.outcome.kind==='block')out.blocks++; else out.unresolved++;
      for(let seat=0;seat<3;seat++){
        const s=seatStrategy[seat],f=features[seat],pips=e.pipSum(end.hands[seat]),win=winner===seat;
        const sk=`d${f.doubleCount}|starter:${f.starter?1:0}`;
        if(!out.byStrategy[s].strata[sk])out.byStrategy[s].strata[sk]=bucket();
        add(out.byStrategy[s].strata[sk],win,pips);
        for(const dk of DOUBLE_KEYS){
          const key=`${sk}|owns:${f.doubles[dk]?1:0}`;
          if(!out.byStrategy[s].specific[dk])out.byStrategy[s].specific[dk]={};
          if(!out.byStrategy[s].specific[dk][key])out.byStrategy[s].specific[dk][key]=bucket();
          add(out.byStrategy[s].specific[dk][key],win,pips);
        }
      }
    }
  }
  for(const s of STRATEGIES){
    for(const group of [out.byStrategy[s].strata,...Object.values(out.byStrategy[s].specific)]){
      for(const b of Object.values(group)){b.finishRate=b.n?b.wins/b.n:null;b.meanPips=b.n?b.pips/b.n:null;}
    }
  }
  return out;
}
if(require.main===module){const count=Number(process.argv[2]||10000),startSeed=Number(process.argv[3]||30000);console.log(JSON.stringify(runControlled({startSeed,count}),null,2));}
module.exports={rawFeatures,runControlled};
