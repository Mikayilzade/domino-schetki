'use strict';
// node qosha-research/simulator/mobility-full.js test
// node qosha-research/simulator/mobility-full.js 1353840 800
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),choose=require('./strategy-runner').chooseBy;
const bots=['min-hand-pips','closed-branch-control'];
function after(s,a){const t=d.applyTurn(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock,a);return t.hand.filter(x=>d.actionsForHand(t.branchState,t.openingState,[x]).length).length;}
function mobilityChoice(o,s,c){
 const base=choose('min-hand-pips',o);if(base.type!=='single')return base;
 const h=o.hand,ds=new Set(h.filter(t=>t[0]===t[1]).map(t=>t[0])),old=after(s,base);
 let best=null;
 for(const a of o.actions){if(a.type!=='single'||a.side!==base.side||e.tileKey(a.tile)===e.tileKey(base.tile))continue;
  for(const n of new Set(a.tile)){
   if(!ds.has(n)||base.tile.includes(n)||h.filter(t=>t[0]!==t[1]&&t.includes(n)).length<2)continue;
   if(!o.actions.some(t=>t.type==='double-sequence'&&t.numbers.includes(n)))continue;
   if(e.pipSum([base.tile])-e.pipSum([a.tile])>2)continue;
   c.opportunities++;const gain=after(s,a)-old;
   if(gain>0&&(!best||gain>best.gain))best={a,gain};
  }
 }
 if(best){c.overrides++;return best.a;}return base;
}
function run(start=1353840,count=800){
 const rows=[];
 for(let seed=start;seed<start+count;seed++){
  const deal=e.dealThreeByNine(seed),tiles=[...deal.hands.flat(),...deal.stock].map(e.tileKey);
  if(tiles.length!==28||new Set(tiles).size!==28)throw Error('deck');
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('init');
  for(const bot of bots)for(let seat=0;seat<3;seat++){
   const x=[];
   for(const variant of ['base','mobility']){
    const c={overrides:0,opportunities:0};
    const end=r.runRound(base,(o,s)=>s.currentPlayer!==seat?choose(bot,o):
     variant==='base'?choose('min-hand-pips',o):mobilityChoice(o,s,c),{maxTurns:200});
    if(!end.outcome||end.outcome.kind==='unresolved')throw Error('unresolved '+seed);
    x.push({win:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===seat),
     pips:e.pipSum(end.hands[seat]),minus:end.outcome.minus||0,block:+(end.outcome.kind==='block'),
     turns:end.turns,remainingDoubles:end.hands[seat].filter(t=>t[0]===t[1]).length,...c});
   }
   rows.push({seed,bot,seat,base:x[0],mobility:x[1]});
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
   baselineBlocks:a.reduce((s,x)=>s+x.base.block,0),mobilityBlocks:a.reduce((s,x)=>s+x.mobility.block,0)};
 }
 return{engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',seedStart:start,seedEnd:start+count-1,
  deals:count,continuations:rows.length*2,summary};
}
function test(){const a=run(1353840,80),b=run(1353840,80);if(JSON.stringify(a)!==JSON.stringify(b)||a.continuations!==960)throw Error('replay');return{passed:true};}
if(require.main===module){const x=process.argv.slice(2);console.log(JSON.stringify(x[0]==='test'?test():run(+(x[0]||1353840),+(x[1]||800)),null,2));}
module.exports={run,test,mobilityChoice};
