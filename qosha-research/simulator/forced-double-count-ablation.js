'use strict';
// Controlled forced-double-count ablation; four-branch number-lock semantics PROVISIONAL.
// node qosha-research/simulator/forced-double-count-ablation.js test
// node qosha-research/simulator/forced-double-count-ablation.js 1400840 2400
const e=require('./engine'),init=require('./initializer'),round=require('./round-driver'),base=require('./strategy-runner'),d=require('./turn-dispatcher');
const FEW='pip-late-fewest-forced-doubles',MANY='pip-late-max-pips-forced-doubles';
const PROFILES=['min-hand-pips','closed-branch-control','random-legal'];
const pips=a=>e.pipSum(a.type==='single'?[a.tile]:(a.tiles||[]));
const key=a=>[a.type,(a.numbers||[]).join(','),a.side||'',a.to??'',e.tileKey(a.tile||[0,0])].join(':');
const best=actions=>[...actions].sort((a,b)=>pips(b)-pips(a)||key(a).localeCompare(key(b)))[0];
const mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
function median(xs){const s=[...xs].sort((a,b)=>a-b),n=s.length;return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2;}
function choose(name,opts,ctx={}){
 if(name!==FEW&&name!==MANY)return base.chooseBy(name,opts,ctx);
 const mixed=opts.actions.filter(a=>a.type==='mixed-finish');
 if(mixed.length)return best(mixed);
 const singles=opts.actions.filter(a=>a.type==='single');
 if(singles.length)return best(singles); // both delay number opening when ordinary move exists
 const doubles=opts.actions.filter(a=>a.type==='double-sequence');
 if(!doubles.length)throw Error('unexpected empty legal action set');
 if(name===MANY)return best(doubles);
 const minCount=Math.min(...doubles.map(a=>a.tiles.length));
 return best(doubles.filter(a=>a.tiles.length===minCount));
}
function stats(){return{appearances:0,finishes:0,finalPips:[],actions:0,forcedDoubleTurns:0,variableCountOpportunities:0,selectedTilesAtVariableCount:0,doubleActions:0,doubleTiles:0,minus:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0}};}
function ci(xs){const m=mean(xs),v=xs.reduce((s,x)=>s+(x-m)**2,0)/(xs.length-1);return{estimate:m,halfWidth95:2.07*Math.sqrt(v/xs.length),clusters:xs.length};}
function run(startSeed=1400840,count=2400,maxTurns=200){
 if(!Number.isInteger(startSeed)||!Number.isInteger(count)||count<=0||count%100)throw Error('startSeed integer and count positive multiple of 100');
 const out={schema:'qosha-forced-double-count-ablation/v1',timestampBaku:'2026-10-24 16:48 (+04)',engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0, 3x9, provisional four-branch number-lock model',startSeed,endSeed:startSeed+count-1,uniqueDeals:count,continuations:0,hiddenWorldContinuations:0,profiles:{},hypothesis:'Given no legal ordinary tile, prefer opening the fewest possible doubles versus maximizing removed pips; both otherwise delay double opening and use identical pip/tie-break priorities.',limitations:'finish-first only; block winner, loneZero, bust and 101 match unresolved; provisional branch locking; simple opponents; same deals reused across profiles and seat rotations; synthetic previous winner when 1-1 in stock'};
 for(const opponent of PROFILES){
  const names=[FEW,MANY,opponent],s=Object.fromEntries(names.map(n=>[n,stats()]));
  const clusters=Array.from({length:count/100},()=>({fewWins:0,manyWins:0,fewPips:0,manyPips:0,rounds:0}));
  let rounds=0,finishes=0,blocks=0,unresolved=0,turnTotal=0;
  for(let seed=startSeed;seed<startSeed+count;seed++){
   const state=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(state.kind!=='ready')throw Error('initializer unresolved '+seed);
   const cluster=clusters[Math.floor((seed-startSeed)/100)];
   for(let rotation=0;rotation<3;rotation++){
    const seats=[0,1,2].map(i=>names[(i+rotation)%3]);
    const chooser=(opts,turn)=>{
     const name=seats[turn.currentPlayer],m=s[name];m.actions++;
     const singles=opts.actions.some(a=>a.type==='single'),mixed=opts.actions.some(a=>a.type==='mixed-finish');
     const doubles=opts.actions.filter(a=>a.type==='double-sequence');
     const forced=!singles&&!mixed&&doubles.length>0;
     if(forced)m.forcedDoubleTurns++;
     const variable=forced&&new Set(doubles.map(a=>a.tiles.length)).size>1;
     if(variable)m.variableCountOpportunities++;
     const action=choose(name,opts,{seed,rotation,turns:turn.turns,player:turn.currentPlayer});
     if(variable)m.selectedTilesAtVariableCount+=action.tiles.length;
     if(action.type==='double-sequence'){m.doubleActions++;m.doubleTiles+=action.tiles.length;}
     return action;
    };
    const result=round.runRound(state,chooser,{maxTurns});
    rounds++;turnTotal+=result.turns;cluster.rounds++;
    if(result.outcome.kind==='finish'){
     finishes++;const name=seats[result.outcome.playerIndex];s[name].finishes++;s[name].minus[String(result.outcome.minus||0)]++;
     if(name===FEW)cluster.fewWins++;if(name===MANY)cluster.manyWins++;
    }else if(result.outcome.kind==='block')blocks++;
    else unresolved++;
    for(let seat=0;seat<3;seat++){
     const name=seats[seat],m=s[name],remaining=e.pipSum(result.hands[seat]);m.appearances++;m.finalPips.push(remaining);
     if(name===FEW)cluster.fewPips+=remaining;if(name===MANY)cluster.manyPips+=remaining;
    }
   }
  }
  const byStrategy={};
  for(const name of names){const m=s[name];byStrategy[name]={appearances:m.appearances,finishFirstCount:m.finishes,finishFirstRate:m.finishes/m.appearances,meanFinalPips:mean(m.finalPips),medianFinalPips:median(m.finalPips),actions:m.actions,forcedDoubleTurns:m.forcedDoubleTurns,variableCountOpportunities:m.variableCountOpportunities,meanSelectedTilesAtVariableCount:m.variableCountOpportunities?m.selectedTilesAtVariableCount/m.variableCountOpportunities:null,doubleActions:m.doubleActions,doubleTiles:m.doubleTiles,minusFinishes:m.minus};}
  out.profiles[opponent]={strategies:names,rounds,finishes,blocks,unresolved,meanTurns:turnTotal/rounds,byStrategy,pairedFewMinusMany:{finishFirstPP:ci(clusters.map(c=>100*(c.fewWins-c.manyWins)/c.rounds)),meanFinalPips:ci(clusters.map(c=>(c.fewPips-c.manyPips)/c.rounds))},clusterSizeDeals:100,confidence:'exploratory uncorrected seed-cluster t(23), no multiple-comparison correction'};
  out.continuations+=rounds;
 }
 return out;
}
function test(){
 const single={type:'single',tile:[1,5],side:'up',to:5};
 const one={type:'double-sequence',tiles:[[2,2]],numbers:[2]};
 const two={type:'double-sequence',tiles:[[2,2],[3,3]],numbers:[2,3]};
 const mixed={type:'mixed-finish',tiles:[[1,2],[2,2]],numbers:[2]};
 const opts=actions=>({actions,hand:[[1,5],[2,2],[3,3]]});
 if(choose(FEW,opts([one,two]))!==one||choose(MANY,opts([one,two]))!==two)throw Error('forced count contrast');
 if(choose(FEW,opts([single,one,two]))!==single||choose(MANY,opts([single,one,two]))!==single)throw Error('late opening invariant');
 if(choose(FEW,opts([single,one,mixed]))!==mixed||choose(MANY,opts([single,one,mixed]))!==mixed)throw Error('mixed finish priority');
 if(choose(FEW,opts([one]))!==choose(MANY,opts([one])))throw Error('no-count-choice equivalence');
 let board=e.createBranchState([1,1]),opening=e.createOpeningState([1]);
 for(const [side,n] of [['up',2],['left',3]])board=e.applySinglePlacement(board,{side,tile:[1,n],to:n});
 const hand=[[2,2],[3,3]],options=d.turnOptions(board,opening,hand,[]);
 if(!options.actions.every(a=>a.type==='double-sequence')||options.actions.some(a=>a.tiles.length!==2))throw Error('all-doubles finish must be full series');
 const replayA=run(1400840,100),replayB=run(1400840,100);
 if(JSON.stringify(replayA)!==JSON.stringify(replayB)||replayA.continuations!==900||Object.values(replayA.profiles).some(p=>p.unresolved))throw Error('deterministic replay');
 return{passed:true,checks:['forced variable-count','late-opening equality','mixed finish precedence','no-count-choice equality','all-doubles finish mandatory','100-seed deterministic replay'],continuations:900};
}
if(require.main===module){const args=process.argv.slice(2);console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||1400840),+(args[1]||2400)),null,2));}
module.exports={choose,run,test,FEW,MANY,PROFILES};