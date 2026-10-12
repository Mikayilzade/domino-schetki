'use strict';
// Post-action geometry and return-access diagnostic for equal-pip connector choices.
// Reproduce: node qosha-research/simulator/post-action-geometry-runner.js 900000 1000000 200 25 20
const e=require('./engine'),d=require('./turn-dispatcher'),hold=require('./two-opponent-conditional-holdout');
const hw=require('./hidden-world'),reg=require('./decision-regret');
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function stats(a){
 if(!a.length)return null;
 const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;
 return {n:a.length,mean:m,exploratoryCI95:a.length>1?[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)]:null,
   positive:a.filter(x=>x>0).length,zero:a.filter(x=>x===0).length,negative:a.filter(x=>x<0).length};
}
function post(s,a,x){
 const f=s.currentPlayer,t=d.applyTurn(s.branchState,s.openingState,s.hands[f],s.stock,a);
 const keys=new Set(d.actionsForHand(t.branchState,t.openingState,t.hand).flatMap(z=>z.tiles||[z.tile].filter(Boolean)).map(e.tileKey));
 return {ends:e.SIDES.map(side=>t.branchState.branches[side].end),
  opened:[...t.openingState.openedNumbers].sort((a,b)=>a-b),
  playable:keys.size,connectors:t.hand.filter(z=>z[0]!==z[1]&&z.includes(x)).length,
  pips:e.pipSum(t.hand)};
}
function run(start=900000,end=1000000,scanLimit=200,quota=25,n=20){
 const found=hold.collect(start,end,scanLimit);
 const selected=[...found.out.filter(p=>p.x===0).slice(0,quota),...found.out.filter(p=>p.x!==0).slice(0,quota)];
 if(!selected.length)throw Error('no positions');
 const rows=[];let continuations=0,unresolved=0;
 for(const p of selected){
  const s=p.state,original=JSON.stringify(s),f=s.currentPlayer;
  const o=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock);
  const by=new Map(o.actions.map(a=>[reg.actionKey(a),a]));
  const ca=by.get(p.pair.connector),oa=by.get(p.pair.other);
  if(!ca||!oa||ca.type!=='single'||oa.type!=='single'||e.pipSum([ca.tile])!==e.pipSum([oa.tile]))throw Error('not legal equal-pip pair');
  const cp=post(s,ca,p.x),op=post(s,oa,p.x);
  if(cp.pips!==op.pips||cp.connectors!==op.connectors-1)throw Error('post-action invariant');
  const diffSides=e.SIDES.filter((_,i)=>cp.ends[i]!==op.ends[i]);
  const spec={focalPlayer:f,focalHand:s.hands[f],knownTiles:p.known,
   hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
  const values=Object.fromEntries(policies.map(k=>[k,[]]));
  for(let j=0;j<n;j++){
   const seed=42000000+1000*p.seed+j,w=hw.sampleWorld(spec,seed);
   if(hw.candidateKeys(w).join('|')!==hw.candidateKeys(s).join('|'))throw Error('candidate drift');
   for(const k of policies){
    const ev=reg.evaluateDecisionInWorld(w,{focalPlayer:f,continuationStrategy:k,seed,maxTurns:200});
    if(ev.kind!=='paired-world')throw Error('no paired result');
    continuations+=ev.candidates.length;
    const m=new Map(ev.candidates.map(z=>[z.actionKey,z])),a=m.get(p.pair.connector),b=m.get(p.pair.other);
    if(!a||!b||a.outcome==='unresolved'||b.outcome==='unresolved'){unresolved++;throw Error('unresolved candidate');}
    const cAccess=hold.access(w,ca,p.x,k,seed),oAccess=hold.access(w,oa,p.x,k,seed);
    values[k].push({finish:+a.focalFinishedFirst- +b.focalFinishedFirst,
      remainder:a.focalRemainder-b.focalRemainder,minus:+(a.focalMinus<0)- +(b.focalMinus<0),
      returnAccess:cAccess.access-oAccess.access,returnPlayable:cAccess.available-oAccess.available,
      returnRate:cAccess.returned-oAccess.returned});
   }
  }
  if(JSON.stringify(s)!==original)throw Error('source mutated');
  rows.push({seed:p.seed,turn:p.turn,x:p.x,focal:f,handSizes:s.hands.map(h=>h.length),
   pair:{connector:p.pair.connector,unrelated:p.pair.other},sides:[ca.side,oa.side],
   afterConnector:cp,afterUnrelated:op,changedSides:diffSides,
   ownPlayableDelta:cp.playable-op.playable,
   policy:Object.fromEntries(policies.map(k=>[k,Object.fromEntries(['finish','remainder','minus','returnAccess','returnPlayable','returnRate'].map(metric=>[metric,mean(values[k].map(z=>z[metric]))]))]))});
 }
 const groups={all:rows,zero:rows.filter(x=>x.x===0),nonzero:rows.filter(x=>x.x!==0),
  ownPlayLess:rows.filter(x=>x.ownPlayableDelta<0),ownPlaySame:rows.filter(x=>x.ownPlayableDelta===0),
  ownPlayMore:rows.filter(x=>x.ownPlayableDelta>0)};
 const summary={};
 for(const [name,rs] of Object.entries(groups)){
  summary[name]={positions:rs.length,ownPlayableDelta:stats(rs.map(z=>z.ownPlayableDelta)),
   changedSideCounts:Object.fromEntries([0,1,2,3,4].map(i=>[i,rs.filter(z=>z.changedSides.length===i).length])),
   policies:Object.fromEntries(policies.map(k=>[k,Object.fromEntries(['finish','remainder','minus','returnAccess','returnPlayable','returnRate'].map(m=>[m,stats(rs.map(z=>z.policy[k][m]))]))]))};
 }
 return{schema:'qosa-post-action-geometry/v1',timestampAsiaBaku:new Date(Date.now()+4*3600000).toISOString().slice(0,19)+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  start,end,scanLimit,scannedDeals:found.scanned,eligiblePositions:found.out.length,quota,
  selectedSeeds:rows.map(x=>x.seed),positions:rows.length,worldsPerPosition:n,
  hiddenWorlds:rows.length*n,candidateContinuations:continuations,unresolved,newFullStrategyRounds:0,
  confirmedPriorFullStrategyRounds:180000,worldSeedFormula:'42000000+1000*dealSeed+worldIndex',
  discovery:'min-hand-pips, first eligible per deal; quota X=0 vs X>0',
  comparison:'connector X-Y minus unrelated equal-pip legal single; both keep X-X; fixed visible states and identical hidden allocations',
  policies,summary,rows,
  limitations:'post-action own mobility and end vector are mediators/descriptors, not matched causal controls; quota/first-eligible selection; small per-group n; branch rules assumed; hidden allocations unconditioned on observed opponent play; deterministic bots; block winner not assigned; exploratory intervals',
  next:'replicate playability strata on independent seeds and test opponent first-response choices conditioned on each exact four-end vector'};
}
function selfTest(){const a=run(900000,910000,12,2,2),b=run(900000,910000,12,2,2);if(!a.positions||a.unresolved||JSON.stringify(a.rows)!==JSON.stringify(b.rows))throw Error('replay');return{passed:true,positions:a.positions,selectedSeeds:a.selectedSeeds};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?selfTest():run(...a.map(Number)),null,2));}
module.exports={run,selfTest,post,stats};
