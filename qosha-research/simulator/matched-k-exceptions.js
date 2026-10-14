'use strict';
// Independent matched-K double-opening counterexample study.
// node qosha-research/simulator/matched-k-exceptions.js test
// node qosha-research/simulator/matched-k-exceptions.js 4200000 4300000 70 25
const base=require('./matched-k-outcome-runner');
const engine=require('./engine');
const dispatch=require('./turn-dispatcher');
const {actionKey}=require('./decision-regret');
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'];
function stat(a){const n=a.length,m=n?a.reduce((s,x)=>s+x,0)/n:null,sd=n>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(n-1)):0;return{n,mean:m,exploratoryPositionCI95:n>1?[m-1.96*sd/Math.sqrt(n),m+1.96*sd/Math.sqrt(n)]:null};}
function group(rows){return{positions:rows.length,policies:Object.fromEntries(POLICIES.map(p=>{const x=rows.map(r=>r.metrics[p].win);return[p,{singleMinusDoubleFinishPp:stat(x.map(v=>100*v)),openDoubleBetter:x.filter(v=>v<0).length,preserveDoubleBetter:x.filter(v=>v>0).length,ties:x.filter(v=>v===0).length,singleMinusDoublePips:stat(rows.map(r=>r.metrics[p].pips))}]}))};}
function analyze(raw,found){
 if(raw.selectedPositions!==found.positions.length)throw Error('count mismatch');
 const rows=raw.positions.map((r,i)=>{
  const p=found.positions[i],s=p.state;
  if(r.seed!==p.seed||r.turn!==p.turn||r.pair.single!==p.pair.single||r.pair.double!==p.pair.double)throw Error('discovery replay mismatch');
  const actions=dispatch.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock).actions;
  const single=actions.find(a=>actionKey(a)===p.pair.single),double=actions.find(a=>actionKey(a)===p.pair.double);
  if(!single||!double||double.tiles.length!==1)throw Error('candidate mismatch');
  const x=double.tiles[0][0],hand=s.hands[s.currentPlayer];
  return {...r,doubleNumber:x,connectors:hand.filter(t=>t[0]!==t[1]&&(t[0]===x||t[1]===x)).length,singleTouchesDoubleNumber:single.tile.includes(x),nextOpponentStones:s.hands[(s.currentPlayer+1)%3].length,hand:hand.map(engine.tileKey).sort(),board:Object.fromEntries(engine.SIDES.map(side=>[side,{end:s.branchState.branches[side].end,active:s.branchState.branches[side].active}]))};
 });
 const groups={all:rows,connector0:rows.filter(r=>r.connectors===0),connector1:rows.filter(r=>r.connectors===1),connector2plus:rows.filter(r=>r.connectors>=2),singleTouchesX:rows.filter(r=>r.singleTouchesDoubleNumber),singleUnrelated:rows.filter(r=>!r.singleTouchesDoubleNumber),next1to2:rows.filter(r=>r.nextOpponentStones<=2),next3to4:rows.filter(r=>r.nextOpponentStones>=3&&r.nextOpponentStones<=4),next5plus:rows.filter(r=>r.nextOpponentStones>=5),early:rows.filter(r=>r.phase==='early'),mid:rows.filter(r=>r.phase==='mid'),late:rows.filter(r=>r.phase==='late')};
 for(let x=0;x<=6;x++)groups['double'+x]=rows.filter(r=>r.doubleNumber===x);
 if(groups.connector0.length+groups.connector1.length+groups.connector2plus.length!==rows.length||groups.singleTouchesX.length+groups.singleUnrelated.length!==rows.length)throw Error('partition mismatch');
 const counterexamples=rows.filter(r=>r.metrics['closed-branch-control'].win<0).sort((a,b)=>a.metrics['closed-branch-control'].win-b.metrics['closed-branch-control'].win).slice(0,10).map(r=>({seed:r.seed,turn:r.turn,hand:r.hand,board:r.board,pair:r.pair,connectors:r.connectors,nextOpponentStones:r.nextOpponentStones,winDeltaPp:Object.fromEntries(POLICIES.map(p=>[p,100*r.metrics[p].win])),pipDelta:Object.fromEntries(POLICIES.map(p=>[p,r.metrics[p].pips])),passFlips:r.immediate.passFlips,uniqueAllocations:r.uniqueAllocations}));
 return{method:'first eligible matched-K pair; post-selection groups are descriptive, not causal',byGroup:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,group(v)])),openDoubleBetterAllThree:rows.filter(r=>POLICIES.every(p=>r.metrics[p].win<0)).length,openDoubleBetterAtLeastTwo:rows.filter(r=>POLICIES.filter(p=>r.metrics[p].win<0).length>=2).length,counterexamples,rows};
}
function run(start=4200000,end=4300000,limit=70,worlds=25){
 const raw=base.run(start,end,limit,worlds,POLICIES,'min-hand-pips');
 if(raw.selectedPositions!==limit)throw Error('insufficient positions');
 return{...raw,schema:'qosa-matched-k-exceptions/v1',analysis:analyze(raw,base.discover(start,end,limit,'min-hand-pips')),next:'Replicate double-favorable positions with fresh hidden-world seeds; test connectors and four-end geometry.'};
}
function test(){const a=run(3650080,3650081,1,2),b=run(3650080,3650081,1,2);if(JSON.stringify(a)!==JSON.stringify(b)||a.global.continuations!==12||a.analysis.byGroup.all.positions!==1)throw Error('fixture');return{passed:true,fixture:3650080};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||4200000),+(a[1]||4300000),+(a[2]||70),+(a[3]||25)),null,2));}
module.exports={run,test,analyze};
