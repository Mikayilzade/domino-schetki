'use strict';
// Reproduce: node qosha-research/simulator/reachable-pass-heldout-runner.js 2800000 2820000 30 160
// Every pass is generated in a reachable 3x9 round and is the immediately preceding turn.
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner');
const hw=require('./hidden-world'),post=require('./observed-pass-posterior'),reg=require('./decision-regret');
const policies=['closed-branch-control','min-hand-pips'];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function stat(a){if(!a.length)return null;const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;return{n:a.length,mean:m,exploratoryCI95:a.length>1?[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)]:null};}
function capture(seed,proposalCount=160){
 let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
 if(s.kind!=='ready')return null;
 const known=[[1,1]];if(s.openingFollowup)known.push(s.openingFollowup.tile);
 while(!s.outcome&&s.turns<100){
  const passer=s.currentPlayer,before=s,options=d.turnOptions(s.branchState,s.openingState,s.hands[passer],s.stock);
  let chosen=null;s=r.stepRound(s,(opts,st)=>{chosen=chooseBy('min-hand-pips',opts,{seed,turns:st.turns,player:st.currentPlayer});return chosen;});
  if(chosen)known.push(...(chosen.tiles||[chosen.tile]));
  if(options.phase!=='pass'||before.stock.length||s.outcome)continue;
  const focal=s.currentPlayer,o=d.turnOptions(s.branchState,s.openingState,s.hands[focal],s.stock);
  if(o.phase!=='play'||o.actions.length<2||o.actions.length>10)continue;
  const visible=r.cloneRoundState(s);visible.hands=visible.hands.map((h,i)=>i===focal?h:[]);
  const spec={focalPlayer:focal,focalHand:s.hands[focal].map(t=>t.slice()),knownTiles:known.map(t=>t.slice()),hiddenHandSizes:s.hands.map(h=>h.length),stockSize:0,visibleState:visible};
  const observation={kind:'observed-pass',playerIndex:passer,turn:before.turns,stockSizeAtPass:0,handSizeAtPass:before.hands[passer].length,branchState:e.cloneBranchState(before.branchState),openingState:e.cloneOpeningState(before.openingState),evidence:{passObserved:true,snapshotVerified:true,fullTurnLogVerified:true},eventsSincePass:[]};
  post.validatePass(spec,observation);
  if(d.actionsForHand(observation.branchState,observation.openingState,before.hands[passer]).length)throw Error('not an actual pass');
  const startSeed=(350000000+seed*257)>>>0;
  let posterior;
  try{posterior=post.samplePosterior(spec,[observation],{startSeed,count:proposalCount});}
  catch(err){if(String(err.message).includes('zero posterior support'))continue;throw err;}
  const acceptedTrain=posterior.acceptedIndices.filter(i=>i%2===0),acceptedTest=posterior.acceptedIndices.filter(i=>i%2===1);
  if(posterior.accepted>=16&&posterior.accepted<proposalCount&&acceptedTrain.length>=6&&acceptedTest.length>=6)
   return{seed,turn:s.turns,passer,focal,spec,observation,posterior,startSeed,proposalCount,actions:o.actions.length,known:known.length,handSizes:s.hands.map(h=>h.length)};
 }
 return null;
}
function summarize(xs){return{win:mean(xs.map(x=>x.win)),pips:mean(xs.map(x=>x.pips)),minus:mean(xs.map(x=>x.minus))};}
function best(scores){return [...scores].sort((a,b)=>b.win-a.win||a.pips-b.pips||a.key.localeCompare(b.key))[0];}
function analyze(p){
 const original=JSON.stringify(p.spec.visibleState),worlds=Array.from({length:p.proposalCount},(_,j)=>hw.sampleWorld(p.spec,p.startSeed+j));
 const accepted=new Set(p.posterior.acceptedIndices),train=worlds.map((_,i)=>i).filter(i=>i%2===0),trainAccepted=train.filter(i=>accepted.has(i)),testAccepted=worlds.map((_,i)=>i).filter(i=>i%2===1&&accepted.has(i));
 const candidateKeys=hw.candidateKeys(worlds[0]),results={},f=p.focal;let continuations=0;
 for(const policy of policies){
  const records=worlds.map((w,i)=>{
   if(JSON.stringify(hw.candidateKeys(w))!==JSON.stringify(candidateKeys))throw Error('candidate drift');
   const ev=reg.evaluateDecisionInWorld(w,{focalPlayer:f,continuationStrategy:policy,seed:(59000000+1000*p.seed+i)>>>0,maxTurns:200});
   if(ev.kind!=='paired-world'||ev.candidates.length!==candidateKeys.length||ev.candidates.some(x=>x.outcome==='unresolved'))throw Error('invalid continuation');
   continuations+=ev.candidates.length;
   return Object.fromEntries(ev.candidates.map(x=>[x.actionKey,{win:+x.focalFinishedFirst,pips:x.focalRemainder,minus:+(x.focalMinus<0)}]));
  });
  function actionStats(ids){return candidateKeys.map(key=>({key,...summarize(ids.map(i=>records[i][key]))}));}
  const prior=best(actionStats(train)),conditional=best(actionStats(trainAccepted));
  const test=actionStats(testAccepted),by=new Map(test.map(x=>[x.key,x])),a=by.get(prior.key),b=by.get(conditional.key),oracle=best(test);
  results[policy]={priorChoice:prior.key,posteriorChoice:conditional.key,changed:prior.key!==conditional.key,
   priorTrain:{win:prior.win,pips:prior.pips},posteriorTrain:{win:conditional.win,pips:conditional.pips},
   heldoutPrior:a,heldoutPosterior:b,heldoutDelta:{win:b.win-a.win,pips:b.pips-a.pips,minus:b.minus-a.minus},
   heldoutRegret:{prior:oracle.win-a.win,posterior:oracle.win-b.win}};
 }
 if(JSON.stringify(p.spec.visibleState)!==original)throw Error('source state mutated');
 return{seed:p.seed,turn:p.turn,passer:p.passer,focal:p.focal,actions:p.actions,knownTiles:p.known,handSizes:p.handSizes,proposals:p.proposalCount,
  accepted:p.posterior.accepted,acceptedTrain:trainAccepted.length,acceptedTest:testAccepted.length,acceptanceRate:p.posterior.acceptanceRate,
  worldSeedStart:p.startSeed,continuations,policy:results};
}
function run(start=2800000,end=2820000,limit=30,proposalCount=160){
 if(!Number.isInteger(start)||!Number.isInteger(end)||end<=start||!Number.isInteger(limit)||limit<1||!Number.isInteger(proposalCount)||proposalCount<32)throw Error('invalid args');
 const rows=[];let scanned=0;
 for(let seed=start;seed<end&&rows.length<limit;seed++){scanned++;const p=capture(seed,proposalCount);if(p)rows.push(analyze(p));}
 const summary={};
 for(const policy of policies){const ps=rows.map(x=>x.policy[policy]);summary[policy]={changed:ps.filter(x=>x.changed).length,
  heldoutWinAdv:stat(ps.map(x=>x.heldoutDelta.win)),heldoutPipsDelta:stat(ps.map(x=>x.heldoutDelta.pips)),
  heldoutMinusDelta:stat(ps.map(x=>x.heldoutDelta.minus)),changedOnlyWinAdv:stat(ps.filter(x=>x.changed).map(x=>x.heldoutDelta.win)),
  priorRegret:stat(ps.map(x=>x.heldoutRegret.prior)),posteriorRegret:stat(ps.map(x=>x.heldoutRegret.posterior))};}
 return{schema:'qosa-reachable-observed-pass-heldout/v1',timestampAsiaBaku:new Date(Date.now()+14400000).toISOString().slice(0,19)+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',start,end,limit,proposalCount,scannedDeals:scanned,
  positions:rows.length,selectedSeeds:rows.map(x=>x.seed),priorWorldProposals:rows.length*proposalCount,
  posteriorAcceptedProposals:rows.reduce((n,x)=>n+x.accepted,0),heldoutPosteriorWorlds:rows.reduce((n,x)=>n+x.acceptedTest,0),
  candidateContinuations:rows.reduce((n,x)=>n+x.continuations,0),newFullStrategyRounds:0,verifiedPriorFullStrategyRounds:180000,
  worldSeedFormula:'(350000000 + dealSeed * 257 + proposalIndex) >>> 0',
  continuationSeedFormula:'(59000000 + 1000 * dealSeed + proposalIndex) >>> 0',
  split:'even proposal indices train, odd accepted proposal indices posterior holdout; both choices selected without seeing holdout outcomes',
  selection:'first reachable immediate stock-empty opponent pass followed by focal 2..10 legal actions; 16..N-1 accepted proposals and >=6 per split; min-hand-pips discovery',
  policies,summary,rows,
  limitations:'Pass is generated by min-hand-pips bots; uniform allocation proposal conditioned only on observed empty-stock pass (not other opponent actions); no independent human-game validation. Assumed branch semantics, first eligible selection, selected acceptance band, deterministic continuation bots, repeated sampled worlds, no block winner; exploratory position CIs.',
  next:'Replicate on disjoint seeds; stratify posterior choice changes by pass severity/branch endpoints; test multiple observed passes with verified hand stability.'};
}
function test(){const a=run(2800000,2801000,2,60),b=run(2800000,2801000,2,60);
 if(a.positions!==2||JSON.stringify(a.rows)!==JSON.stringify(b.rows))throw Error('non-deterministic');
 return{passed:true,seeds:a.selectedSeeds,accepted:a.posteriorAcceptedProposals};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2800000),+(a[1]||2820000),+(a[2]||30),+(a[3]||160)),null,2));}
module.exports={capture,analyze,run,test};