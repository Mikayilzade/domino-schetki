'use strict';
// Independent opening-4-4 exception retest. Does not alter gameplay code.
// node qosha-research/simulator/open44-exception-retest.js test
// node qosha-research/simulator/open44-exception-retest.js
const e=require('./engine'), d=require('./turn-dispatcher'), rd=require('./round-driver');
const hidden=require('./hidden-world'), base=require('./matched-k-outcome-runner');
const {actionKey}=require('./decision-regret'), {chooseBy}=require('./strategy-runner');
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles','random-legal'];
const EXCEPTIONS=[4401931,4407745], CONTROLS=[4402067,4405689];
function mean(a){return a.reduce((x,y)=>x+y,0)/a.length;}
function summary(a){const n=a.length,m=mean(a);const sd=n>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(n-1)):0;return {n,mean:m,exploratoryWorldCI95:n>1?[m-1.96*sd/Math.sqrt(n),m+1.96*sd/Math.sqrt(n)]:null};}
function forced(w,key,policy,seed){
 let first=true;
 const end=rd.runRound(w,(opts,s)=>{
  if(first){first=false;const action=opts.actions.find(a=>actionKey(a)===key);if(!action)throw Error('forced candidate missing');return action;}
  return chooseBy(policy,opts,{seed,turns:s.turns,player:s.currentPlayer});
 },{maxTurns:200});
 if(end.outcome.kind==='unresolved')throw Error('unresolved continuation');
 const focal=w.currentPlayer;
 return {win:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===focal),
  pips:e.pipSum(end.hands[focal]),
  minus:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===focal&&(end.outcome.minus||0)<0),
  block:+(end.outcome.kind==='block'),turns:end.turns};
}
function run({seeds=[...EXCEPTIONS,...CONTROLS],startWorldIndex=1000,worlds=200}={}){
 if(!Number.isInteger(startWorldIndex)||startWorldIndex<0||!Number.isInteger(worlds)||worlds<1||worlds>1000)throw Error('bad world indices');
 const out={schema:'qosa-open44-independent-retest/v1',engine:'qosa-research-0.5.3',
  rules:'recovered qosa-1.0.0',mode:'3x9',seeds,exceptionSeeds:EXCEPTIONS,controlSeeds:CONTROLS,
  discoveryPolicy:'closed-branch-control',worldIndexRange:[startWorldIndex,startWorldIndex+worlds-1],
  worldSeedFormula:'(1500000000 + Math.imul(dealSeed,73) + worldIndex) >>> 0',
  policies:POLICIES,worldsPerPosition:worlds,hiddenWorlds:0,continuations:0,
  newFullStrategyRounds:0,verifiedPriorFullStrategyRounds:180000,positions:[]};
 for(const dealSeed of seeds){
  const discovered=base.discover(dealSeed,dealSeed+1,1,'closed-branch-control');
  if(discovered.positions.length!==1)throw Error('position missing '+dealSeed);
  const pos=discovered.positions[0],s=pos.state;
  if(!pos.pair.double.endsWith('|4-4'))throw Error('double choice changed '+dealSeed);
  const initial=JSON.stringify(s),candidateKeys=JSON.stringify(hidden.candidateKeys(s));
  const used=new Set(s.hands.flat().concat(s.stock).map(e.tileKey));
  const spec={focalPlayer:pos.focal,focalHand:s.hands[pos.focal],
   knownTiles:e.createDoubleSixDeck().filter(t=>!used.has(e.tileKey(t))),
   hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
  const acts=d.turnOptions(s.branchState,s.openingState,s.hands[pos.focal],s.stock).actions;
  const a=acts.find(x=>actionKey(x)===pos.pair.single),b=acts.find(x=>actionKey(x)===pos.pair.double);
  if(!a||!b||e.pipSum(a.tiles||[a.tile])!==e.pipSum(b.tiles||[b.tile]))throw Error('invalid pair');
  const postA=d.applyTurn(s.branchState,s.openingState,s.hands[pos.focal],s.stock,a);
  const postB=d.applyTurn(s.branchState,s.openingState,s.hands[pos.focal],s.stock,b);
  const ownActions=[postA,postB].map(x=>d.actionsForHand(x.branchState,x.openingState,x.hand).length);
  const connectors=[postA,postB].map(x=>x.hand.filter(t=>t[0]!==t[1]&&(t[0]===4||t[1]===4)).map(e.tileKey));
  const immediate={singleRestricts:0,doubleRestricts:0,equal:0,passFlips:0,
   nextActionsSingle:0,nextActionsDouble:0};
  const vals=Object.fromEntries(POLICIES.map(p=>[p,{win:[],pips:[],minus:[],block:[],turns:[]}]));
  const unique=new Set();
  for(let k=startWorldIndex;k<startWorldIndex+worlds;k++){
   const worldSeed=(1500000000+Math.imul(dealSeed,73)+k)>>>0;
   const w=hidden.sampleWorld(spec,worldSeed);
   if(JSON.stringify(hidden.candidateKeys(w))!==candidateKeys)throw Error('candidate keys changed');
   unique.add(JSON.stringify(w.hands.map((h,i)=>i===pos.focal?[]:h.map(e.tileKey).sort()).concat([w.stock.map(e.tileKey).sort()])));
   const next=(pos.focal+1)%3;
   const nA=d.turnOptions(postA.branchState,postA.openingState,w.hands[next],postA.stock).actions.length;
   const nB=d.turnOptions(postB.branchState,postB.openingState,w.hands[next],postB.stock).actions.length;
   immediate[nA<nB?'singleRestricts':nA>nB?'doubleRestricts':'equal']++;
   immediate.nextActionsSingle+=nA;immediate.nextActionsDouble+=nB;
   if((nA>0)!==(nB>0))immediate.passFlips++;
   for(const policy of POLICIES){
    const x=forced(w,pos.pair.single,policy,worldSeed),y=forced(w,pos.pair.double,policy,worldSeed);
    for(const metric of Object.keys(vals[policy]))vals[policy][metric].push(x[metric]-y[metric]);
    out.continuations+=2;
   }
   out.hiddenWorlds++;
  }
  if(JSON.stringify(s)!==initial)throw Error('source state mutated');
  out.positions.push({dealSeed,cohort:EXCEPTIONS.includes(dealSeed)?'exception':'control',
   turn:pos.turn,focal:pos.focal,hand:s.hands[pos.focal].map(e.tileKey),
   pair:pos.pair,ownActionsAfter:[...ownActions],fourConnectorsAfter:connectors,
   uniqueHiddenAllocations:unique.size,immediate,
   metrics:Object.fromEntries(POLICIES.map(p=>[p,Object.fromEntries(Object.keys(vals[p]).map(m=>[m,summary(vals[p][m])]))]))});
 }
 out.limitations='Selected exceptions and two nonrandom controls; 200 independent-seed draws per position, but allocations can repeat. Position selection based on previous results, so effect estimates have winner selection bias. Uniform hidden allocations not conditioned on opponent play history; fixed deterministic policies; assumed branch-opening semantics; block winner unassigned; exploratory CIs are per-world and do not imply population generalization. Immediate legal-action count is post-action descriptive mediator.';
 out.next='If exceptions replicate, compare 4-connector identities and post-action four-end geometry with matched fresh non-exception positions; preregister a new unselected discovery holdout before promoting any human rule.';
 return out;
}
function test(){const a=run({seeds:[4401931],startWorldIndex:1000,worlds:3}),b=run({seeds:[4401931],startWorldIndex:1000,worlds:3});
 if(JSON.stringify(a)!==JSON.stringify(b)||a.hiddenWorlds!==3||a.continuations!==24)throw Error('determinism regression');
 if(a.positions[0].pair.double!=='double-sequence|||4|4-4')throw Error('fixture changed');
 return {passed:true,seed:4401931,worldIndexRange:[1000,1002]};}
module.exports={run,test,POLICIES,EXCEPTIONS,CONTROLS};
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():run(),null,2));
