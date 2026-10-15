'use strict';
// Matched hidden-world equal-pip control: connector X-Y vs unrelated tile.
// Run: node qosha-research/simulator/connector-equal-pip-runner.js 20000 40000 25 40
// Test: node qosha-research/simulator/connector-equal-pip-runner.js test
const e=require('./engine'),d=require('./turn-dispatcher'),init=require('./initializer');
const r=require('./round-driver'),{chooseBy}=require('./strategy-runner');
const {actionKey}=require('./decision-regret'),{sampleWorld}=require('./hidden-world');
const {matches}=require('./connector-other-matches');
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'];
function mean(a){return a.reduce((x,y)=>x+y,0)/a.length;}
function summary(a){if(!a.length)return null;const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;return {mean:m,ci95Exploratory:[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)]};}
function discover(startSeed,endSeed,positionLimit){
 const found=[];let scanned=0;
 for(let seed=startSeed;seed<endSeed&&found.length<positionLimit;seed++){
  scanned++;
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;
  while(!s.outcome&&s.turns<100){
   const ms=matches(s);
   if(ms.length){
    const group=ms[0],pair=group.pairs[0];
    const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
    const knownTiles=e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t)));
    found.push({seed,turn:s.turns,focal:s.currentPlayer,target:group.x,pair,
      visibleState:r.cloneRoundState(s),knownTiles});
    break;
   }
   s=r.stepRound(s,(opts,state)=>chooseBy('closed-branch-control',opts,
      {seed,turns:state.turns,player:state.currentPlayer}));
  }
 }
 return {scanned,positions:found};
}
function force(world,key,policy,worldSeed){
 let first=true;
 const chooser=(opts,state)=>{
  if(first){first=false;const a=opts.actions.find(a=>actionKey(a)===key);
   if(!a)throw Error('forced action not legal: '+key);return a;}
  return chooseBy(policy,opts,{seed:worldSeed,turns:state.turns,player:state.currentPlayer});
 };
 const initial=r.stepRound(world,(opts)=>{const a=opts.actions.find(a=>actionKey(a)===key);
  if(!a)throw Error('missing action');return a;});
 const next=initial.outcome?null:d.turnOptions(initial.branchState,initial.openingState,
    initial.hands[initial.currentPlayer],initial.stock);
 const result=r.runRound(world,chooser,{maxTurns:200});
 if(result.outcome.kind==='unresolved')throw Error('unresolved continuation');
 const p=world.currentPlayer;
 return {finish:+(result.outcome.kind==='finish'&&result.outcome.playerIndex===p),
  remainder:e.pipSum(result.hands[p]),
  minus:+(result.outcome.kind==='finish'&&result.outcome.playerIndex===p&&result.outcome.minus<0),
  block:+(result.outcome.kind==='block'),turns:result.turns,
  nextPass:next?+(next.phase==='pass'):null,
  nextLegal:next?(next.phase==='play'?next.actions.length:0):null};
}
function analyzePosition(pos,worlds,policies=POLICIES,worldSeedBase=25000000){
 const s=pos.visibleState,p=pos.focal;
 const spec={focalPlayer:p,focalHand:s.hands[p],knownTiles:pos.knownTiles,
  hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 const keys=[pos.pair.connector,pos.pair.other];
 const aggregates=Object.fromEntries(policies.map(policy=>[policy,[]]));
 const before=JSON.stringify(s);
 for(let i=0;i<worlds;i++){
  const worldSeed=worldSeedBase+pos.seed*1000+i;
  const world=sampleWorld(spec,worldSeed);
  const opts=d.turnOptions(world.branchState,world.openingState,world.hands[p],world.stock);
  for(const key of keys)if(!opts.actions.some(a=>actionKey(a)===key))throw Error('candidate mismatch');
  for(const policy of policies){
   const a=force(world,keys[0],policy,worldSeed),b=force(world,keys[1],policy,worldSeed);
   aggregates[policy].push(Object.fromEntries(Object.keys(a).map(k=>[k,a[k]===null||b[k]===null?null:a[k]-b[k]])));
  }
 }
 if(JSON.stringify(s)!==before)throw Error('source state mutated');
 return {seed:pos.seed,turn:pos.turn,focal:p,target:pos.target,
  hand:s.hands[p].map(e.tileKey),handSizes:s.hands.map(h=>h.length),
  branchEnds:e.SIDES.map(side=>s.branchState.branches[side].end),
  openedNumbers:[...s.openingState.openedNumbers].sort((a,b)=>a-b),
  pair:pos.pair,worldSeedStart:worldSeedBase+pos.seed*1000,worlds,
  deltaConnectorMinusOther:Object.fromEntries(policies.map(policy=>[policy,
   Object.fromEntries(['finish','remainder','minus','block','turns','nextPass','nextLegal']
     .map(k=>[k,summary(aggregates[policy].map(x=>x[k]).filter(x=>x!==null))]))]))};
}
function run({startSeed=20000,endSeed=40000,positionLimit=25,worlds=40}={}){
 const {scanned,positions}=discover(startSeed,endSeed,positionLimit);
 const rows=positions.map(p=>analyzePosition(p,worlds));
 const agg=Object.fromEntries(POLICIES.map(policy=>[policy,
  Object.fromEntries(['finish','remainder','minus','block','turns','nextPass','nextLegal']
   .map(k=>[k,summary(rows.map(x=>x.deltaConnectorMinusOther[policy][k].mean))]))]));
 return {schema:'qosa-equal-pip-control/v1',engine:'qosa-research-0.5.3',
  rules:'recovered qosa-1.0.0; unresolved branch semantics assumption-labelled',
  timestampBaku:'2026-10-15 08:45 +04:00',mode:'3x9',startSeed,endSeed,
  scannedDealSeeds:scanned,positionLimit,positionCount:rows.length,
  worldsPerPosition:worlds,hiddenWorldCount:rows.length*worlds,
  candidateContinuations:rows.length*worlds*POLICIES.length*2,
  newFullStrategyRounds:0,selectedSeeds:rows.map(x=>x.seed),
  worldSeedFormula:'25000000 + 1000*dealSeed + worldIndex',
  positionSelection:'first eligible reachable position, first matching target/pair, closed-branch-control discovery',
  comparison:'two legal single moves with equal discarded pip sum; connector X-Y vs unrelated tile, both keep X-X and another connector',
  policies:POLICIES,aggregateEqualPositionWeight:agg,positions:rows,
  limitations:'nonrandom first-eligible selection; actions generally on different branch ends; 40 Monte Carlo worlds per position; repeated worlds possible; unobserved opponent history not conditioned; bot policies; exploratory CI; block has no winner; branch rules provisional'};
}
function test(){
 const x=discover(20000,20500,2);if(x.positions.length!==2)throw Error('fixture discovery');
 const p=x.positions[0],a=analyzePosition(p,2,['closed-branch-control']);
 const b=analyzePosition(p,2,['closed-branch-control']);
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('non-deterministic');
 if(e.pipSum([e.createDoubleSixDeck().find(t=>e.tileKey(t)===p.pair.connector.split('|').at(-1))])!==p.pair.pips)throw Error('pip mismatch');
 return {passed:true,seeds:x.positions.map(p=>p.seed),twoWorldReplay:true};
}
if(require.main===module){
 const args=process.argv.slice(2);
 console.log(JSON.stringify(args[0]==='test'?test():run({startSeed:Number(args[0]||20000),
  endSeed:Number(args[1]||40000),positionLimit:Number(args[2]||25),worlds:Number(args[3]||40)}),null,2));
}
module.exports={POLICIES,discover,force,analyzePosition,run,test};