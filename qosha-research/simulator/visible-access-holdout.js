'use strict';
// Visible-only opponent access for matched same-tile, different-branch placements.
// Run: node qosha-research/simulator/visible-access-holdout.js test
// Run: node qosha-research/simulator/visible-access-holdout.js 1316840 650 60 48
// The estimator does not inspect hidden hands or continuation outcomes.
const e=require('./engine'),d=require('./turn-dispatcher'),g=require('./same-tile-geometry-runner');
const {actionKey}=require('./decision-regret');
const deck=e.createDoubleSixDeck(),profiles=['min-hand-pips','closed-branch-control'];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function noPlayableProbability(N,K,n){
  if(!Number.isInteger(N)||!Number.isInteger(K)||!Number.isInteger(n)||n<0||n>N||K<0||K>N)throw Error('invalid hypergeom');
  let p=1;for(let i=0;i<n;i++)p*=Math.max(0,N-K-i)/(N-i);return p;
}
function visibleRisk(pos){
  const s=pos.state,p=pos.seat,next=(p+1)%3,own=s.hands[p];
  const known=new Set([...pos.known,...own].map(e.tileKey));
  const unseen=deck.filter(t=>!known.has(e.tileKey(t))),N=unseen.length,n=s.hands[next].length;
  if(N!==s.hands[next].length+s.hands[(p+2)%3].length+s.stock.length)throw Error('unseen accounting');
  const opts=d.turnOptions(s.branchState,s.openingState,own,s.stock);
  const get=k=>opts.actions.find(a=>actionKey(a)===k),hi=get(pos.high),lo=get(pos.low);
  if(!hi||!lo||hi.type!=='single'||lo.type!=='single'||e.tileKey(hi.tile)!==e.tileKey(lo.tile))throw Error('candidate mismatch');
  function access(action){
    const br=e.applySinglePlacement(s.branchState,action);
    const K=unseen.filter(t=>d.actionsForHand(br,s.openingState,[t]).length>0).length;
    return {K,expected:n*K/N,canPlay:1-noPlayableProbability(N,K,n)};
  }
  const a=access(hi),b=access(lo);
  return {unseen:N,nextHand:n,highPlayableUnseen:a.K,lowPlayableUnseen:b.K,
    predictedOpponentPlayableDelta:a.expected-b.expected,
    predictedOpponentCanPlayDelta:a.canPlay-b.canPlay};
}
function summarize(rows){
  if(!rows.length)return {n:0};
  const avg=k=>mean(rows.map(x=>x[k])),n=rows.length,m=avg('winDelta');
  const hw=n>1?1.96*Math.sqrt(rows.reduce((s,x)=>s+(x.winDelta-m)**2,0)/(n-1)/n):null;
  return {n,finishFirstDeltaPP:100*m,exploratory95HalfWidthPP:hw===null?null:100*hw,
    remainderDelta:avg('pipsDelta'),minusFinishDeltaPP:100*avg('minusDelta'),
    predictedNextPlayableDelta:avg('predictedOpponentPlayableDelta'),
    actualNextPlayableDelta:avg('nextPlayableDelta'),
    positive:rows.filter(x=>x.winDelta>1e-12).length,
    negative:rows.filter(x=>x.winDelta< -1e-12).length,
    ties:rows.filter(x=>Math.abs(x.winDelta)<=1e-12).length};
}
function profileSummary(rows){
  const risk=rows.filter(x=>x.predictedOpponentPlayableDelta>1e-12),safe=rows.filter(x=>x.predictedOpponentPlayableDelta<=1e-12);
  const pm=mean(rows.map(x=>x.predictedOpponentPlayableDelta)),om=mean(rows.map(x=>x.nextPlayableDelta));
  const cov=mean(rows.map(x=>(x.predictedOpponentPlayableDelta-pm)*(x.nextPlayableDelta-om)));
  const pv=mean(rows.map(x=>(x.predictedOpponentPlayableDelta-pm)**2));
  const ov=mean(rows.map(x=>(x.nextPlayableDelta-om)**2));
  return {overall:summarize(rows),visibleOpponentMoreAccess:summarize(risk),
    visibleOpponentNotMoreAccess:summarize(safe),
    exploratorySubgroupDifferencePP:risk.length&&safe.length?
      100*(mean(risk.map(x=>x.winDelta))-mean(safe.map(x=>x.winDelta))):null,
    predictedVsSampledMobilityCorrelation:pv>0&&ov>0?cov/Math.sqrt(pv*ov):null};
}
function run(start=1316840,count=650,limit=60,worlds=48){
  if(![start,count,limit,worlds].every(Number.isInteger)||count<1||limit<1||worlds<1)throw Error('invalid args');
  const disc=g.collect(start,count,limit),raw=g.run(start,count,limit,worlds);
  if(disc.positions.length!==raw.positions)throw Error('discovery replay');
  const rows=raw.rows.map((r,i)=>{
    const p=disc.positions[i];
    if(r.profile!==p.profile||r.seed!==p.seed||r.seat!==p.seat||r.turn!==p.turn||r.high!==p.high||r.low!==p.low)throw Error('position mismatch');
    const original=JSON.stringify(p.state),v=visibleRisk(p);
    if(original!==JSON.stringify(p.state))throw Error('mutated');
    return {profile:r.profile,seed:r.seed,seat:r.seat,turn:r.turn,tile:r.tile,high:r.high,low:r.low,
      ownMobilityGap:r.ownMobilityGap,focalHandSize:r.focalHandSize,opponentSizes:r.opponentSizes,
      winDelta:r.winDelta,pipsDelta:r.pipsDelta,minusDelta:r.minusDelta,
      nextPlayableDelta:r.nextPlayableDelta,nextPassDelta:r.nextPassDelta,...v};
  });
  return {schema:'qosa-visible-opponent-access/v1',engine:'qosa-research-0.5.3',
    rules:'recovered qosa-1.0.0; branch semantics provisional',mode:'3x9',
    seedRange:[start,start+count-1],scanned:raw.scanned,positions:rows.length,
    hiddenWorlds:rows.length*worlds,pairedContinuations:2*rows.length*worlds,
    worldsPerPosition:worlds,strategies:profiles,
    method:'From known played stones plus focal hand, remove visible tiles from double-six deck. For each action, K of N unseen stones can play; expected next playable count n*K/N; chance next player has >=1 playable stone 1-C(N-K,n)/C(N,n). Classify expected high-minus-low >0 versus <=0 before hidden-world rollouts.',
    summaries:Object.fromEntries(profiles.map(p=>[p,profileSummary(rows.filter(x=>x.profile===p))])),rows};
}
function test(){
  if(Math.abs(noPlayableProbability(10,4,2)-(6/10)*(5/9))>1e-12||noPlayableProbability(10,9,2)!==0)throw Error('hypergeom');
  const t=g.test(),x=run(1316840,25,2,3),y=run(1316840,25,2,3);
  if(!t.passed||x.positions!==4||JSON.stringify(x)!==JSON.stringify(y))throw Error('deterministic replay');
  return {passed:true,geometryFixture:t.geometryFixture,positions:x.positions,pairedContinuations:x.pairedContinuations};
}
if(require.main===module){
  const a=process.argv.slice(2);
  console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1316840),+(a[1]||650),+(a[2]||60),+(a[3]||48)),null,2));
}
module.exports={noPlayableProbability,visibleRisk,summarize,profileSummary,run,test};
