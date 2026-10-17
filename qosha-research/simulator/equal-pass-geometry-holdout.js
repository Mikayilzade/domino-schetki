'use strict';
// Equal-exact-next-pass geometry control, reproducible 3x9.
// node qosha-research/simulator/equal-pass-geometry-holdout.js test
// node qosha-research/simulator/equal-pass-geometry-holdout.js 920000 940000 48 32
const {collect}=require('./two-opponent-conditional-holdout');
const {evaluate}=require('./exact-next-pass-hypergeom');
const {sampleWorld}=require('./hidden-world');
const {actionKey}=require('./decision-regret');
const {rollout}=require('./pass-outcome-holdout');
const d=require('./turn-dispatcher');
const e=require('./engine');
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const avg=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
function stats(xs){
 if(!xs.length)return{n:0,mean:null,exploratoryCI95:null};
 const m=avg(xs),sd=xs.length>1?Math.sqrt(xs.reduce((a,b)=>a+(b-m)**2,0)/(xs.length-1)):0;
 return{n:xs.length,mean:m,exploratoryCI95:xs.length>1?[m-1.96*sd/Math.sqrt(xs.length),m+1.96*sd/Math.sqrt(xs.length)]:null};
}
function geometryDiff(a,b){return a.ends.some((x,i)=>x!==b.ends[i])||JSON.stringify(a.opened)!==JSON.stringify(b.opened);}
function run(start=920000,end=940000,limit=48,n=32){
 if(!(Number.isInteger(start)&&Number.isInteger(end)&&end>start&&Number.isInteger(limit)&&limit>0&&Number.isInteger(n)&&n>0))throw Error('invalid arguments');
 const found=collect(start,end,limit),rows=[];let ties=0,same=0,continuations=0,worlds=0;
 for(const p of found.out){
  const x=evaluate(p);
  if(Math.abs(x.passDelta)>1e-12)continue;
  ties++;
  if(!geometryDiff(x.connector,x.unrelated)){same++;continue;}
  if(x.connector.legalUnknown!==x.unrelated.legalUnknown)throw Error('equal pass but different legal count');
  const s=p.state,f=s.currentPlayer,next=(f+1)%3;
  const opts=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock).actions;
  const keys=[p.pair.connector,p.pair.other];
  const boards=keys.map(key=>{const a=opts.find(v=>actionKey(v)===key);if(!a||a.type!=='single')throw Error('missing candidate');return d.applyTurn(s.branchState,s.openingState,s.hands[f],s.stock,a);});
  const spec={focalPlayer:f,focalHand:s.hands[f],knownTiles:p.known,hiddenHandSizes:s.hands.map(h=>h.length),stockSize:0,visibleState:s};
  const deltas=Object.fromEntries(policies.map(k=>[k,{win:[],pips:[],minus:[]}]));
  let passConnector=0,passUnrelated=0,passFlips=0;
  for(let j=0;j<n;j++){
   const seed=(1900000000+Math.imul(p.seed,109)+j)>>>0;
   const w=sampleWorld(spec,seed);worlds++;
   const pass=boards.map(b=>!d.actionsForHand(b.branchState,b.openingState,w.hands[next]).length);
   passConnector+=+pass[0];passUnrelated+=+pass[1];passFlips+=+(pass[0]!==pass[1]);
   for(const policy of policies){
    const a=rollout(w,keys[0],policy,seed),b=rollout(w,keys[1],policy,seed);
    continuations+=2;
    for(const metric of ['win','pips','minus'])deltas[policy][metric].push(a[metric]-b[metric]);
   }
  }
  rows.push({seed:p.seed,turn:p.turn,exactPass:x.connector.pass,legalUnknown:x.connector.legalUnknown,
   nextHandSize:x.nextHandSize,endsConnector:x.connector.ends,endsUnrelated:x.unrelated.ends,
   openedConnector:x.connector.opened,openedUnrelated:x.unrelated.opened,
   observedPassDelta:(passConnector-passUnrelated)/n,observedPassFlipRate:passFlips/n,
   byPolicy:Object.fromEntries(policies.map(k=>[k,Object.fromEntries(['win','pips','minus'].map(m=>[m,avg(deltas[k][m])]))]))});
 }
 return{schema:'qosa-equal-pass-geometry-holdout/v1',timestampAsiaBaku:new Date(Date.now()+4*3600000).toISOString().slice(0,19)+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',seedRange:[start,end-1],
  scannedDeals:found.scanned,eligiblePositions:found.out.length,equalPassPositions:ties,equalPassSameGeometry:same,
  comparedPositions:rows.length,hiddenWorlds:worlds,continuations,worldsPerPosition:n,
  worldSeedFormula:'(1900000000+Math.imul(dealSeed,109)+worldIndex)>>>0',
  discoveryPolicy:'min-hand-pips',continuationPolicies:policies,comparison:'connector minus unrelated equal-pip single; EXACT equal immediate next-opponent pass probability, DIFFERENT resulting four-end/opened geometry',
  summary:{observedPassDelta:stats(rows.map(r=>r.observedPassDelta)),passFlipRate:stats(rows.map(r=>r.observedPassFlipRate)),
   byPolicy:Object.fromEntries(policies.map(k=>[k,Object.fromEntries(['win','pips','minus'].map(m=>[m,stats(rows.map(r=>r.byPolicy[k][m]))]))]))},
  limitations:'Exact pass ties imply equal marginal probability, not identical pass outcome for each hidden world. Different tile identities, ends and downstream actions remain confounded; not a causal estimate of geometry. First eligible positions, uniform unconditioned hidden allocations, provisional branch semantics, fixed bots, no block winner; position-normal CIs exploratory.',
  rows};
}
function test(){
 const x=run(920000,940000,3,2),y=run(920000,940000,3,2);
 if(x.eligiblePositions!==3||JSON.stringify(x.rows)!==JSON.stringify(y.rows))throw Error('non-deterministic');
 if(x.rows.some(r=>r.observedPassFlipRate<0||r.observedPassFlipRate>1))throw Error('invalid pass flips');
 return{passed:true,selected:x.eligiblePositions,equalPass:x.equalPassPositions,compared:x.comparedPositions};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||920000),+(a[1]||940000),+(a[2]||48),+(a[3]||32)),null,2));}
module.exports={run,test,stats,geometryDiff};
