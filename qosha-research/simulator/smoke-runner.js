'use strict';
const init=require('./initializer');
const r=require('./round-driver');

function firstAction(opts){return opts.actions[0];}

function runSmoke({startSeed=0,count=1000,maxTurns=200,laterRound=true}={}){
  const summary={
    engine:'qosa-research-0.5.3',
    startSeed,count,maxTurns,laterRound,
    attempted:0,ready:0,redeal:0,initUnresolved:0,
    finish:0,block:0,roundUnresolved:0,
    minus:{'-10':0,'-20':0,'-30':0,'-40':0,'0':0},
    turnTotal:0,turnMin:null,turnMax:null,
    problemSeeds:[]
  };
  for(let seed=startSeed;seed<startSeed+count;seed++){
    summary.attempted++;
    const st=init.initializeThreePlayerRound({
      seed,
      isFirstRound:!laterRound,
      previousWinnerIndex:laterRound?(seed%3):null
    });
    if(st.kind==='redeal'){summary.redeal++;continue;}
    if(st.kind!=='ready'){summary.initUnresolved++;summary.problemSeeds.push({seed,stage:'init',kind:st.kind,reason:st.reason||null});continue;}
    summary.ready++;
    const out=r.runRound(st,firstAction,{maxTurns});
    if(out.outcome.kind==='finish'){
      summary.finish++;
      const k=String(out.outcome.minus||0);
      if(Object.prototype.hasOwnProperty.call(summary.minus,k))summary.minus[k]++;
      else summary.minus[k]=1;
    }else if(out.outcome.kind==='block'){
      summary.block++;
      summary.minus['0']++;
    }else{
      summary.roundUnresolved++;
      summary.problemSeeds.push({seed,stage:'round',kind:out.outcome.kind,reason:out.outcome.reason||null,turns:out.turns});
    }
    summary.turnTotal+=out.turns;
    summary.turnMin=summary.turnMin===null?out.turns:Math.min(summary.turnMin,out.turns);
    summary.turnMax=summary.turnMax===null?out.turns:Math.max(summary.turnMax,out.turns);
  }
  summary.turnMean=summary.ready?summary.turnTotal/summary.ready:null;
  return summary;
}

if(require.main===module){
  const startSeed=Number(process.argv[2]||0);
  const count=Number(process.argv[3]||1000);
  console.log(JSON.stringify(runSmoke({startSeed,count}),null,2));
}
module.exports={runSmoke};
