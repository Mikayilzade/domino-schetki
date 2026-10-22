'use strict';
// node qosha-research/simulator/mobility-broad-full.js test
// node qosha-research/simulator/mobility-full.js 1354640 2000
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),choose=require('./strategy-runner').chooseBy;
const bots=['min-hand-pips','closed-branch-control'];
function describe(s,a){
 const t=d.applyTurn(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock,a);
 const playable=t.hand.filter(x=>d.actionsForHand(t.branchState,t.openingState,[x]).length).length;
 let pairs=0;for(const [n,m] of t.hand)if(n===m){const k=t.hand.filter(x=>x[0]!==x[1]&&x.includes(n)).length;if(k)pairs+=k;}
 return{playable,pairs};
}
function mobilityChoice(o,s,c){
 const base=choose('min-hand-pips',o);if(base.type!=='single')return base;
 const b=describe(s,base);let best=null;
 for(const a of o.actions){
  if(a.type!=='single'||e.tileKey(a.tile)===e.tileKey(base.tile))continue;
  const cost=e.pipSum([base.tile])-e.pipSum([a.tile]);if(cost>4)continue;
  const f=describe(s,a);if(!f.pairs)continue;
  const mobilityGain=f.playable-b.playable,pairGain=f.pairs-b.pairs;
  if(mobilityGain<0||!(mobilityGain>0||pairGain>0))continue;
  c.opportunities++;
  const score=3*mobilityGain+1.5*pairGain-.15*Math.max(0,cost)-(a.side===base.side?0:.1);
  if(score>0&&(!best||score>best.score))best={a,score,crossSide:a.side!==base.side};
 }
 if(best){c.overrides++;if(best.crossSide)c.crossSide++;else c.sameSide++;return best.a;}
 return base;
}
function median(xs){const a=[...xs].sort((x,y)=>x-y),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;}
function run(start=1354640,count=2000){
 const rows=[];
 for(let seed=start;seed<start+count;seed++){
  const deal=e.dealThreeByNine(seed),tiles=[...deal.hands.flat(),...deal.stock].map(e.tileKey);
  if(tiles.length!==28||new Set(tiles).size!==28)throw Error('deck');
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('init');
  for(const bot of bots)for(let seat=0;seat<3;seat++){
   const x=[];
   for(const variant of ['base','mobility']){
    const c={overrides:0,opportunities:0,sameSide:0,crossSide:0};
    const end=r.runRound(base,(o,s)=>s.currentPlayer!==seat?choose(bot,o):
     variant==='base'?choose('min-hand-pips',o):mobilityChoice(o,s,c),{maxTurns:200});
    if(!end.outcome||end.outcome.kind==='unresolved')throw Error('unresolved '+seed);
    x.push({win:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===seat),
     pips:e.pipSum(end.hands[seat]),minus:end.outcome.minus||0,block:+(end.outcome.kind==='block'),
     turns:end.turns,remainingDoubles:end.hands[seat].filter(t=>t[0]===t[1]).length,...c});
   }
   rows.push({seed,bot,seat,base:x[0],mobility:x[1],
     startingDoubles:deal.hands[seat].filter(t=>t[0]===t[1]).length,
     startingDoubleKeys:deal.hands[seat].filter(t=>t[0]===t[1]).map(e.tileKey)});
  }
 }
 const summary={};
 for(const bot of bots){
  const a=rows.filter(x=>x.bot===bot),avg=f=>a.reduce((s,x)=>s+f(x),0)/a.length;
  const bySeed=[];for(let seed=start;seed<start+count;seed++){
   const z=a.filter(x=>x.seed===seed);bySeed.push(z.reduce((s,x)=>s+x.mobility.win-x.base.win,0)/3);
  }
  const m=bySeed.reduce((s,x)=>s+x,0)/count,se=Math.sqrt(bySeed.reduce((s,x)=>s+(x-m)**2,0)/(count*(count-1)));
  summary[bot]={pairedSeats:a.length,baselineWin:avg(x=>x.base.win),mobilityWin:avg(x=>x.mobility.win),
   winDeltaPP:100*m,exploratory3SEPP:[100*(m-3*se),100*(m+3*se)],
   remainderDelta:avg(x=>x.mobility.pips-x.base.pips),
   baselineMeanRemainder:avg(x=>x.base.pips),mobilityMeanRemainder:avg(x=>x.mobility.pips),
   changedSeatRounds:a.filter(x=>x.mobility.overrides).length,
   overrides:a.reduce((s,x)=>s+x.mobility.overrides,0),
   opportunities:a.reduce((s,x)=>s+x.mobility.opportunities,0),
   sameSide:a.reduce((s,x)=>s+x.mobility.sameSide,0),crossSide:a.reduce((s,x)=>s+x.mobility.crossSide,0),
   baselineBlocks:a.reduce((s,x)=>s+x.base.block,0),mobilityBlocks:a.reduce((s,x)=>s+x.mobility.block,0),
   medianRemainder:{base:median(a.map(x=>x.base.pips)),mobility:median(a.map(x=>x.mobility.pips))},
   meanTurns:{base:avg(x=>x.base.turns),mobility:avg(x=>x.mobility.turns)},
   meanStartingDoubles:avg(x=>x.startingDoubles),
   meanEndingDoubles:{base:avg(x=>x.base.remainingDoubles),mobility:avg(x=>x.mobility.remainingDoubles)},
   minusFinish:Object.fromEntries([-10,-20,-30,-40].map(n=>[n,{base:a.filter(x=>x.base.win&&x.base.minus===n).length,mobility:a.filter(x=>x.mobility.win&&x.mobility.minus===n).length}])),
   startingDoubleFinishRate:Object.fromEntries(Array.from({length:7},(_,n)=>{const z=a.filter(x=>x.startingDoubleKeys.includes(n+'-'+n));return[n+'-'+n,{n:z.length,base:z.reduce((s,x)=>s+x.base.win,0)/z.length,mobility:z.reduce((s,x)=>s+x.mobility.win,0)/z.length}];}))};
 }
 return{engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',policy:'broad-connector-mobility-v1',seedStart:start,seedEnd:start+count-1,
  deals:count,continuations:rows.length*2,summary};
}
function test(){const a=run(1354640,80),b=run(1354640,80);if(JSON.stringify(a)!==JSON.stringify(b)||a.continuations!==960)throw Error('replay');return{passed:true};}
if(require.main===module){const x=process.argv.slice(2);console.log(JSON.stringify(x[0]==='test'?test():run(+(x[0]||1353840),+(x[1]||800)),null,2));}
module.exports={run,test,mobilityChoice};
