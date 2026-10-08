'use strict';
// Same-double connector choice: two X-Y/X-Z legal singles both leave X-X plus one connector.
// Usage: node qosha-research/simulator/connector-choice-runner.js 7000 9000 20 40
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),init=require('./initializer');
const {chooseBy}=require('./strategy-runner'),{actionKey}=require('./decision-regret'),{runHiddenWorlds}=require('./hidden-world');
function mean(a){return a.reduce((s,x)=>s+x,0)/a.length;}
function stat(a){if(!a.length)return null;const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0,h=a.length>1?1.96*sd/Math.sqrt(a.length):null;return{n:a.length,mean:m,ci95NormalApprox:h===null?null:[m-h,m+h],positive:a.filter(x=>x>0).length,negative:a.filter(x=>x<0).length,zero:a.filter(x=>x===0).length};}
function eligible(s){
 const hand=s.hands[s.currentPlayer];if(hand.length<4||hand.length>8||s.stock.length)return null;
 const opts=d.turnOptions(s.branchState,s.openingState,hand,s.stock);if(opts.phase!=='play'||opts.drawn)return null;
 for(let x=0;x<=6;x++){
  if(!hand.some(t=>t[0]===x&&t[1]===x))continue;
  const connectors=hand.filter(t=>t[0]!==t[1]&&t.includes(x));if(connectors.length!==2)continue;
  if(!opts.actions.some(a=>a.type==='double-sequence'&&a.tiles.length===1&&a.tiles[0][0]===x))continue;
  const sorted=connectors.map(t=>({tile:t,other:t[0]===x?t[1]:t[0]})).sort((a,b)=>a.other-b.other);
  const moves=sorted.map(c=>opts.actions.filter(a=>a.type==='single'&&e.tileKey(a.tile)===e.tileKey(c.tile)));
  if(moves.some(a=>!a.length))continue;
  return {x,low:sorted[0].other,high:sorted[1].other,
    spendLow:moves[0].map(actionKey),spendHigh:moves[1].map(actionKey)};
 }
 return null;
}
function collect(startSeed,endSeed,limit){
 const out=[];
 for(let seed=startSeed;seed<endSeed&&out.length<limit;seed++){
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});if(s.kind!=='ready')continue;
  while(!s.outcome&&s.turns<100){
   const choice=eligible(s);
   if(choice){const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
    out.push({seed,turn:s.turns,focal:s.currentPlayer,state:r.cloneRoundState(s),
      knownTiles:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t))),choice});break;}
   s=r.stepRound(s,(opts,state)=>chooseBy('closed-branch-control',opts,{seed,turns:state.turns,player:state.currentPlayer}));
  }
 }
 return out;
}
function analyze(pos,worlds,policy){
 const s=pos.state,c=pos.choice,worldStart=2200000+1000*pos.seed;
 const spec={focalPlayer:pos.focal,focalHand:s.hands[pos.focal],knownTiles:pos.knownTiles,
  hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 const data=runHiddenWorlds(spec,{count:worlds,startSeed:worldStart,continuationStrategy:policy,maxTurns:200});
 const deltas=data.results.map(world=>{
  const byKey=new Map(world.candidates.map(row=>[row.actionKey,row]));
  function avg(keys,fn){return mean(keys.map(k=>{const row=byKey.get(k);if(!row||row.outcome==='unresolved')throw Error('missing/unresolved '+k);return fn(row);}));}
  const highSpend=c.spendHigh,lowSpend=c.spendLow;
  // High connector spent => low connector retained. Positive finish means keep LOW is better.
  return {finishFirst:avg(highSpend,x=>+x.focalFinishedFirst)-avg(lowSpend,x=>+x.focalFinishedFirst),
   remainderPips:avg(highSpend,x=>x.focalRemainder)-avg(lowSpend,x=>x.focalRemainder),
   minusFinish:avg(highSpend,x=>+(x.focalMinus<0))-avg(lowSpend,x=>+(x.focalMinus<0))};
 });
 return {seed:pos.seed,turn:pos.turn,focal:pos.focal,handSize:s.hands[pos.focal].length,
  branchEnds:e.SIDES.map(side=>s.branchState.branches[side].end),x:c.x,low:c.low,high:c.high,gap:c.high-c.low,
  spendLow:c.spendLow,spendHigh:c.spendHigh,hiddenWorldStart:worldStart,worlds,
  continuations:data.results.reduce((n,w)=>n+w.candidates.length,0),
  deltaKeepLowMinusKeepHigh:Object.fromEntries(['finishFirst','remainderPips','minusFinish'].map(m=>[m,mean(deltas.map(v=>v[m]))]))};
}
function run({startSeed=7000,endSeed=9000,limit=20,worlds=40,
 policies=['closed-branch-control','min-hand-pips','fast-doubles']}={}){
 const positions=collect(startSeed,endSeed,limit),rows={},summary={};let continuations=0;
 for(const policy of policies){
  rows[policy]=positions.map(p=>analyze(p,worlds,policy));
  continuations+=rows[policy].reduce((n,p)=>n+p.continuations,0);
  summary[policy]=Object.fromEntries(['finishFirst','remainderPips','minusFinish'].map(m=>
   [m,stat(rows[policy].map(p=>p.deltaKeepLowMinusKeepHigh[m]))]));
  summary[policy].gapStrata=Object.fromEntries(['gap1to2','gap3plus'].map(label=>{
   const subset=rows[policy].filter(p=>label==='gap1to2'?p.gap<=2:p.gap>=3);
   return [label,stat(subset.map(p=>p.deltaKeepLowMinusKeepHigh.finishFirst))];
  }));
 }
 return {schema:'qosa-connector-choice/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9',startSeed,endSeed,limit,worldsPerPosition:worlds,
  selectedSeeds:positions.map(p=>p.seed),positionCount:positions.length,
  uniqueHiddenWorlds:positions.length*worlds,policyWorldEvaluations:positions.length*worlds*policies.length,
  candidateContinuations:continuations,newCompletedStrategyRounds:0,
  worldSeedFormula:'2200000 + 1000*dealSeed + worldIndex',policies,
  comparison:'Same reachable state, same X-X, exactly two X connectors X-low and X-high, both legal singles, X-X opening also legal; spending high retains low versus spending low retains high; each candidate forced in same hidden world, equal weighting by legal placements and by position',
  selection:'first eligible state per deal seed under closed-branch-control discovery; hand size 4..8; empty stock',
  caveats:'Not same-side or same-from: connector choices use different currently opened endpoints in this sample. Endpoint/branch geometry and remaining connector pip confounded; selection is rare, first-eligible and bot-policy-dependent. Assumption-labelled locked branches, block winner unassigned, position-normal CIs exploratory.',
  summary,rows};
}
function selfTest(){const p=collect(7000,7030,2);if(p.length!==2)throw Error('fixture count');for(const pos of p){
 const c=pos.choice;if(!(c.low<c.high&&c.spendLow.length&&c.spendHigh.length))throw Error('bad pair');
 const hand=pos.state.hands[pos.focal];if(hand.filter(t=>t.includes(c.x)&&t[0]!==t[1]).length!==2)throw Error('not exactly 2 connectors');
 if(!hand.some(t=>t[0]===c.x&&t[1]===c.x))throw Error('double missing');
 const before=JSON.stringify(pos.state.hands);
 const a=analyze(pos,2,'closed-branch-control');
 if(a.worlds!==2||JSON.stringify(pos.state.hands)!==before)throw Error('immutability');
 }return {passed:true,fixtures:p.map(x=>x.seed)};}
if(require.main===module){const args=process.argv.slice(2);if(args[0]==='test')console.log(JSON.stringify(selfTest()));else{
 const [startSeed=7000,endSeed=9000,limit=20,worlds=40]=args.map(Number);
 console.log(JSON.stringify(run({startSeed,endSeed,limit,worlds}),null,2));}}
module.exports={eligible,collect,analyze,run,selfTest};
