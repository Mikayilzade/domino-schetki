'use strict';
// Reproduce: node qosha-research/simulator/connector-response-geometry-runner.js 610000 620000 30 25
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const {collect}=require('./connector-mobility-runner');
const {force}=require('./connector-equal-pip-runner');
const {sampleWorld}=require('./hidden-world');
const {actionKey}=require('./decision-regret');
const {chooseBy}=require('./strategy-runner');
const P=['closed-branch-control','min-hand-pips','fast-doubles'];
const avg=a=>a.reduce((s,v)=>s+v,0)/a.length;
function stat(a){if(!a.length)return null;const m=avg(a),sd=a.length>1?Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1)):0;return{n:a.length,mean:m,exploratoryCI95:a.length>1?[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)]:null};}
function geometry(s,key){
 const f=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock);
 const a=opts.actions.find(z=>actionKey(z)===key);if(!a||a.type!=='single')throw Error('illegal action');
 const t=d.applyTurn(s.branchState,s.openingState,s.hands[f],s.stock,a);
 const ends=e.SIDES.map(side=>({side,active:t.branchState.branches[side].active,end:t.branchState.branches[side].end}));
 const opened=[...t.openingState.openedNumbers].sort((a,b)=>a-b);
 return{ends,opened,accessibleEnds:ends.filter(z=>z.active&&opened.includes(z.end)).length};
}
function nextResponse(w,key,policy,seed){
 const s=r.stepRound(w,opts=>{const a=opts.actions.find(z=>actionKey(z)===key);if(!a)throw Error('candidate missing');return a;});
 if(s.outcome)return{phase:'end',tile:'end',action:'end',playable:0};
 const o=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
 if(o.phase==='pass')return{phase:'pass',tile:'pass',action:'pass',playable:0};
 const a=chooseBy(policy,o,{seed,turns:s.turns,player:s.currentPlayer});
 const playable=new Set(o.actions.flatMap(z=>(z.tiles||[z.tile].filter(Boolean)).map(e.tileKey)));
 return{phase:'play',tile:(a.tiles||[a.tile].filter(Boolean)).map(e.tileKey).join(','),action:actionKey(a),playable:playable.size};
}
function run(start=610000,end=620000,limit=30,worlds=25){
 const found=collect(start,end,limit),rows=[];let continuations=0;
 for(const pos of found.positions){
  const s=pos.state,f=s.currentPlayer,before=JSON.stringify(s);
  const spec={focalPlayer:f,focalHand:s.hands[f],knownTiles:pos.known,
   hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
  const ca=geometry(s,pos.pair.connector),oa=geometry(s,pos.pair.other);
  const changedSides=e.SIDES.filter((side,i)=>ca.ends[i].end!==oa.ends[i].end);
  const values=Object.fromEntries(P.map(k=>[k,[]]));
  for(let j=0;j<worlds;j++){
   const seed=63000000+1000*pos.seed+j,w=sampleWorld(spec,seed);
   for(const policy of P){
    const c=force(w,pos.pair.connector,policy,seed),o=force(w,pos.pair.other,policy,seed);
    const cr=nextResponse(w,pos.pair.connector,policy,seed),or=nextResponse(w,pos.pair.other,policy,seed);
    continuations+=2;
    values[policy].push({finish:c.finish-o.finish,remainder:c.remainder-o.remainder,minus:c.minus-o.minus,
     nextPlayable:cr.playable-or.playable,nextPass:+(cr.phase==='pass')- +(or.phase==='pass'),
     sameResponse:+(cr.tile===or.tile),sameAction:+(cr.action===or.action)});
   }
  }
  if(JSON.stringify(s)!==before)throw Error('state mutated');
  rows.push({seed:pos.seed,turn:pos.turn,x:pos.x,handSizes:s.hands.map(h=>h.length),
   before:{ends:e.SIDES.map(side=>s.branchState.branches[side].end),opened:[...s.openingState.openedNumbers].sort((a,b)=>a-b)},
   afterConnector:ca,afterUnrelated:oa,changedSides,accessibleEndsDelta:ca.accessibleEnds-oa.accessibleEnds,
   policy:Object.fromEntries(P.map(k=>[k,Object.fromEntries(['finish','remainder','minus','nextPlayable','nextPass','sameResponse','sameAction'].map(m=>[m,avg(values[k].map(v=>v[m]))]))]))});
 }
 const groups={all:rows,zero:rows.filter(v=>v.x===0),nonzero:rows.filter(v=>v.x!==0),
  fewerAccessibleEnds:rows.filter(v=>v.accessibleEndsDelta<0),sameAccessibleEnds:rows.filter(v=>v.accessibleEndsDelta===0),
  moreAccessibleEnds:rows.filter(v=>v.accessibleEndsDelta>0)};
 const summary=Object.fromEntries(Object.entries(groups).map(([name,rs])=>[name,{positions:rs.length,
  accessibleEndsDelta:stat(rs.map(v=>v.accessibleEndsDelta)),
  policy:Object.fromEntries(P.map(k=>[k,Object.fromEntries(['finish','remainder','minus','nextPlayable','nextPass','sameResponse','sameAction'].map(m=>[m,stat(rs.map(v=>v.policy[k][m]))]))]))}]));
 return{schema:'qosa-connector-response-geometry/v1',timestampAsiaBaku:new Date(Date.now()+14400000).toISOString().slice(0,19)+' +04:00',
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0',mode:'3x9',start,end,limit,scannedDeals:found.scanned,
  positions:rows.length,worldsPerPosition:worlds,hiddenWorlds:rows.length*worlds,candidateContinuations:continuations,
  newFullStrategyRounds:0,confirmedPriorFullStrategyRounds:186000,selectedSeeds:rows.map(v=>v.seed),
  worldSeedFormula:'63000000+1000*dealSeed+worldIndex',discovery:'closed-branch-control, first eligible per deal',
  comparison:'equal-pip connector versus unrelated legal single; both retain X-X and another connector; paired hidden worlds',
  policies:P,summary,rows,
  limitations:'post-action geometry and next response are descriptive, not causal; first-eligible selection, bots, provisional branch rules, uniform hidden worlds, unassigned block winner, exploratory intervals',
  next:'Node CLI replay, fresh holdout with alternate discovery policy and same-geometry next-response analysis'};
}
function selfTest(){const a=run(35245,35600,2,2),b=run(35245,35600,2,2);
 if(a.positions!==2||a.hiddenWorlds!==4||a.candidateContinuations!==24||JSON.stringify(a.rows)!==JSON.stringify(b.rows))throw Error('replay');
 if(a.rows.some(v=>v.changedSides.length!==2))throw Error('geometry');return{passed:true,seeds:a.selectedSeeds};}
if(require.main===module){const args=process.argv.slice(2);console.log(JSON.stringify(args[0]==='test'?selfTest():run(...args.map(Number)),null,2));}
module.exports={geometry,nextResponse,run,selfTest};
