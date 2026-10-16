'use strict';
// Reproduce: node qosha-research/simulator/minpips-response-replay.js test
// node qosha-research/simulator/minpips-response-replay.js replay
// node qosha-research/simulator/minpips-response-replay.js equal
const {collect}=require('./two-opponent-conditional-holdout');
const {geometry,nextResponse}=require('./connector-response-geometry-runner');
const {force}=require('./connector-equal-pip-runner');
const {sampleWorld}=require('./hidden-world');
const P=['closed-branch-control','min-hand-pips','fast-doubles'];
const REPLAY=[650140,650218,650730,651314,652154,652428,652688,652861,653021,653053,653058,653707,653873,654059,654288,654322,654760,655263,655970,656061,656378,656583,656741,656956];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function position(seed,n,base){
 const f=collect(seed,seed+1,1);if(f.out.length!==1)throw Error('missing eligible position '+seed);
 const p=f.out[0],s=p.state,player=s.currentPlayer,before=JSON.stringify(s);
 const c=geometry(s,p.pair.connector),o=geometry(s,p.pair.other);
 const spec={focalPlayer:player,focalHand:s.hands[player],knownTiles:p.known,
  hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 const rows=[];
 for(let i=0;i<n;i++){
  const worldSeed=base+1000*seed+i,w=sampleWorld(spec,worldSeed),r=[i];
  for(const policy of P){
   const a=force(w,p.pair.connector,policy,worldSeed),b=force(w,p.pair.other,policy,worldSeed);
   const ar=nextResponse(w,p.pair.connector,policy,worldSeed),br=nextResponse(w,p.pair.other,policy,worldSeed);
   r.push([a.finish-b.finish,a.remainder-b.remainder,a.minus-b.minus,a.block-b.block,
    +(ar.phase==='pass')- +(br.phase==='pass'),ar.playable-br.playable,+(ar.tile===br.tile)]);
  }
  rows.push(r);
 }
 if(JSON.stringify(s)!==before)throw Error('visible state mutated');
 const metrics=['finish','pips','minus','block','nextPass','nextPlayable','sameNextTile'];
 return{seed,turn:p.turn,x:p.x,handSizes:s.hands.map(h=>h.length),pair:p.pair,
  accessibleEndsDelta:c.accessibleEnds-o.accessibleEnds,afterConnector:c,afterUnrelated:o,
  metricsOrder:metrics,policyMeans:Object.fromEntries(P.map((k,j)=>[k,Object.fromEntries(metrics.map((m,i)=>[m,mean(rows.map(r=>r[j+1][i]))]))])),
  rawWorldDeltas:rows};
}
function run(seeds,n=25,base=67000000,discovery='min-hand-pips'){
 const rows=seeds.map(s=>position(s,n,base));
 const metrics=['finish','pips','minus','block','nextPass','nextPlayable','sameNextTile'];
 return{schema:'qosa-minpips-response-replay/v1',engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0',
  timestampAsiaBaku:new Date(Date.now()+14400000).toISOString().slice(0,19)+' +04:00',
  mode:'3x9',discovery,seeds,worldSeedFormula:base+'+1000*dealSeed+worldIndex',
  worldsPerPosition:n,hiddenWorlds:rows.length*n,forcedContinuations:rows.length*n*6,
  newFullRounds:0,confirmedPriorFullRounds:186000,
  summary:{positions:rows.length,equalAccessible:rows.filter(r=>r.accessibleEndsDelta===0).length,
   policy:Object.fromEntries(P.map(k=>[k,Object.fromEntries(metrics.map(m=>[m,mean(rows.map(r=>r.policyMeans[k][m]))]))]))},
  limitations:'provisional branch semantics, unconditioned hidden worlds, first eligible per deal, deterministic bots, unassigned block winner, post-action geometry confounding',rows};
}
function scanEqual(start=690000,end=715000,limit=8){
 const seeds=[];let eligible=0,scanned=0;
 for(let seed=start;seed<end&&seeds.length<limit;seed++){
  scanned++;const f=collect(seed,seed+1,1);if(!f.out.length)continue;eligible++;
  const p=f.out[0],c=geometry(p.state,p.pair.connector),o=geometry(p.state,p.pair.other);
  if(c.accessibleEnds===o.accessibleEnds)seeds.push(seed);
 }
 return{start,end,scanned,eligible,seeds};
}
function test(){const a=position(650140,2,67000000),b=position(650140,2,67000000);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.accessibleEndsDelta!==-1)throw Error('fixture mismatch');
 return{passed:true,seed:650140};}
if(require.main===module){
 const a=process.argv.slice(2),cmd=a[0]||'test';
 const out=cmd==='test'?test():cmd==='replay'?run(REPLAY,+(a[1]||25)):
 cmd==='equal'?(()=>{const scan=scanEqual(+(a[1]||690000),+(a[2]||715000),+(a[3]||8));
  return{scan,...run(scan.seeds,+(a[4]||25),71000000,'fresh equal accessible min-hand-pips')};})():null;
 if(!out)throw Error('use test|replay|equal');console.log(JSON.stringify(out,null,2));
}
module.exports={REPLAY,position,run,scanEqual,test};
