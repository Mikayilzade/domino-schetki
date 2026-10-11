'use strict';
// Paired equal-pip connector vs unrelated move: immediate next-player mobility and outcome.
// node qosha-research/simulator/connector-mobility-runner.js test
// node qosha-research/simulator/connector-mobility-runner.js 80000 110000 30 40
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner');
const {matches}=require('./connector-other-matches'),{actionKey,evaluateDecisionInWorld}=require('./decision-regret');
const {sampleWorld}=require('./hidden-world');
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function collect(start,end,limit){
 const positions=[];let scanned=0;
 for(let seed=start;seed<end&&positions.length<limit;seed++){
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;scanned++;
  while(!s.outcome&&s.turns<100){
   const found=matches(s);
   if(found.length){
    const pair=found[0].pairs[0],o=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
    const acts=new Map(o.actions.map(a=>[actionKey(a),a]));
    const a=acts.get(pair.connector),b=acts.get(pair.other);
    if(!a||!b||a.type!=='single'||b.type!=='single'||e.pipSum([a.tile])!==e.pipSum([b.tile]))throw Error('invalid equal-pip pair');
    const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
    positions.push({seed,turn:s.turns,state:r.cloneRoundState(s),pair,x:found[0].x,
      known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t))),connectorSide:a.side,otherSide:b.side});break;
   }
   s=r.stepRound(s,(opts,st)=>chooseBy('closed-branch-control',opts,{seed,turns:st.turns,player:st.currentPlayer}));
  }
 }
 return {scanned,positions};
}
function mobility(w,action,next){
 const focal=w.currentPlayer;
 const after=d.applyTurn(w.branchState,w.openingState,w.hands[focal],w.stock,action);
 if(after.hand.length===0)return{playable:0,placements:0,canFinish:0};
 const opts=d.turnOptions(after.branchState,after.openingState,w.hands[next],after.stock);
 if(opts.phase!=='play')return{playable:0,placements:0,canFinish:0};
 const playable=new Set(),finishes=[];
 for(const a of opts.actions){
  for(const t of (a.tiles||[a.tile].filter(Boolean)))playable.add(e.tileKey(t));
  const nextMove=d.applyTurn(after.branchState,after.openingState,w.hands[next],after.stock,a);
  if(nextMove.hand.length===0)finishes.push(a);
 }
 return{playable:playable.size,placements:opts.actions.length,canFinish:+(finishes.length>0)};
}
function analyze(p,n=40){
 const s=p.state,before=JSON.stringify(s),f=s.currentPlayer,next=(f+1)%3;
 const spec={focalPlayer:f,focalHand:s.hands[f],knownTiles:p.known,hiddenHandSizes:s.hands.map(h=>h.length),
  stockSize:s.stock.length,visibleState:s};
 const opts=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock);
 const actions=new Map(opts.actions.map(a=>[actionKey(a),a]));
 const ca=actions.get(p.pair.connector),oa=actions.get(p.pair.other);
 const rows=[],metrics=Object.fromEntries(POLICIES.map(k=>[k,[]]));let continuations=0;
 for(let j=0;j<n;j++){
  const world=sampleWorld(spec,31000000+1000*p.seed+j);
  const cm=mobility(world,ca,next),om=mobility(world,oa,next);
  const mobilityDelta=om.playable-cm.playable;
  const cell={mobilityDelta,placementDelta:om.placements-cm.placements,
    finishOpportunityDelta:om.canFinish-cm.canFinish};
  rows.push(cell);
  for(const policy of POLICIES){
   const out=evaluateDecisionInWorld(world,{focalPlayer:f,continuationStrategy:policy,seed:31000000+1000*p.seed+j,maxTurns:200});
   if(out.kind!=='paired-world')throw Error('no paired choices');
   continuations+=out.candidates.length;
   const by=new Map(out.candidates.map(v=>[v.actionKey,v]));
   const a=by.get(p.pair.connector),b=by.get(p.pair.other);
   if(!a||!b||a.outcome==='unresolved'||b.outcome==='unresolved')throw Error('missing/unresolved candidate');
   metrics[policy].push({finish:+a.focalFinishedFirst- +b.focalFinishedFirst,
    pips:a.focalRemainder-b.focalRemainder,
    minus:+(a.focalMinus<0)- +(b.focalMinus<0),
    mobilityDelta});
  }
 }
 if(JSON.stringify(s)!==before)throw Error('visible state mutated');
 return{seed:p.seed,turn:p.turn,focal:f,next,x:p.x,handSizes:s.hands.map(h=>h.length),
  connectorSide:p.connectorSide,otherSide:p.otherSide,connectorKey:p.pair.connector,otherKey:p.pair.other,
  hiddenWorldSeedStart:31000000+1000*p.seed,worlds:n,continuations,
  immediateOtherMinusConnector:{playable:mean(rows.map(x=>x.mobilityDelta)),
   placements:mean(rows.map(x=>x.placementDelta)),finishOpportunity:mean(rows.map(x=>x.finishOpportunityDelta))},
  mobilityWorldCounts:{otherMore:rows.filter(x=>x.mobilityDelta>0).length,equal:rows.filter(x=>x.mobilityDelta===0).length,
   connectorMore:rows.filter(x=>x.mobilityDelta<0).length},
  policyConnectorMinusOther:Object.fromEntries(POLICIES.map(k=>[k,Object.fromEntries(['finish','pips','minus'].map(m=>[m,mean(metrics[k].map(v=>v[m]))]))])),
  byWorld:POLICIES.reduce((o,k)=>(o[k]=metrics[k],o),{})};
}
function stat(a){if(!a.length)return null;const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;
 return{n:a.length,mean:m,exploratoryCI95:[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)],
  positive:a.filter(x=>x>0).length,negative:a.filter(x=>x<0).length,zero:a.filter(x=>x===0).length};}
function run(start=80000,end=110000,limit=30,n=40){
 const found=collect(start,end,limit),rows=found.positions.map(p=>analyze(p,n));
 const summary={immediateOtherMinusConnector:Object.fromEntries(['playable','placements','finishOpportunity']
  .map(m=>[m,stat(rows.map(x=>x.immediateOtherMinusConnector[m]))]))};
 for(const policy of POLICIES){
  summary[policy]=Object.fromEntries(['finish','pips','minus'].map(m=>[m,stat(rows.map(x=>x.policyConnectorMinusOther[policy][m]))]));
  const flat=rows.flatMap(x=>x.byWorld[policy]);
  summary[policy].byMobilityWorld=Object.fromEntries(['otherMore','equal','connectorMore'].map(group=>{
   const a=flat.filter(x=>group==='otherMore'?x.mobilityDelta>0:group==='equal'?x.mobilityDelta===0:x.mobilityDelta<0);
   return[group,{n:a.length,finish:stat(a.map(x=>x.finish)),pips:stat(a.map(x=>x.pips))}];
  }));
 }
 return{schema:'qosa-equal-pip-next-mobility/v1',
  timestampAsiaBaku:new Date(Date.now()+4*3600000).toISOString().slice(0,19)+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  start,end,limit,scannedDeals:found.scanned,positions:rows.length,selectedSeeds:rows.map(x=>x.seed),
  hiddenWorlds:rows.length*n,policyWorldEvaluations:rows.length*n*POLICIES.length,
  candidateContinuations:rows.reduce((s,x)=>s+x.continuations,0),newFullStrategyRounds:0,
  previousVerifiedFullStrategyRounds:180000,policies:POLICIES,
  worldSeedFormula:'31000000+1000*dealSeed+worldIndex',
  comparison:'Same state, same discarded pip sum; connector X-Y spent vs unrelated non-X single; X-X and another connector retained after either; identical hidden worlds and continuation policies',
  mobility:'immediate next clockwise opponent distinct playable tiles (not duplicate placements), total legal actions, and availability of immediate finish; other minus connector',
  limitations:'Different target sides necessarily confound equal-pip distinct tile moves; selection first eligible state/deal, 40 random hidden worlds per position, no opponent history posterior, assumed branch rules, block winner unassigned; exploratory CIs and world strata correlated within positions. No causal proof.',
  next:'Hold out new seeds and analyze same-next-mobility worlds with position-cluster uncertainty; examine third-player mobility and connector future utility',
  summary,rows:rows.map(({byWorld,...rest})=>rest)};
}
function selfTest(){
 const found=collect(35245,35246,1);
 if(found.positions.length!==1||found.positions[0].seed!==35245)throw Error('fixture');
 const a=analyze(found.positions[0],2),b=analyze(found.positions[0],2);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.worlds!==2)throw Error('replay');
 if(a.mobilityWorldCounts.otherMore+a.mobilityWorldCounts.equal+a.mobilityWorldCounts.connectorMore!==2)throw Error('mobility partition');
 return{passed:true,seed:a.seed,worlds:a.worlds,continuations:a.continuations};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?selfTest():run(+(a[0]||80000),+(a[1]||110000),+(a[2]||30),+(a[3]||40)),null,2));}
module.exports={collect,mobility,analyze,run,selfTest};
