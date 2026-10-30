'use strict';
// Exhaustive synthetic 3x9 return-mobility audit, actual research dispatcher.
// Physical late-arrival branch semantics PROVISIONAL global-ever-open.
// node qosha-research/simulator/public-return-dispatcher-exact.js
const assert=require('node:assert/strict');
const e=require('./engine'),d=require('./turn-dispatcher');
const key=e.tileKey;
const played=[[1,1],[1,2]];
const focal=[[0,0],[0,1],[1,3],[1,4],[1,5],[1,6],[0,2],[2,3],[2,4]];
const used=new Set([...played,...focal].map(key));
assert.equal(used.size,11);
const unknown=e.createDoubleSixDeck().filter(t=>!used.has(key(t)));
assert.equal(unknown.length,17);
const branch=e.createBranchState([1,1]);branch.branches.up.end=2;
const opened=e.createOpeningState([1]);
const candidates=['1-3','1-4'].map(k=>d.actionsForHand(branch,opened,focal)
 .find(a=>a.type==='single'&&key(a.tile)===k&&a.side==='left'));
assert(candidates.every(Boolean));
const policies=['single-low','greedy-all'];
const scenarios=[['none',[]],['known-3-3',[[3,3]]],['known-4-4',[[4,4]]],
 ['both-known',[[3,3],[4,4]]]];
function choose(n,k){let v=1;for(let i=1;i<=k;i++)v=v*(n-k+i)/i;return Math.round(v);}
function access(hand,b,o){
 const actions=d.actionsForHand(b,o,hand);
 return {tiles:new Set(actions.flatMap(a=>a.tiles||[a.tile]).map(key)).size,
  actions:actions.length,canPlay:actions.length>0};
}
function seat1Reply(hand,b,policy){
 const actions=d.actionsForHand(b,opened,hand);
 assert(actions.every(a=>a.type==='double-sequence'),'unexpected ordinary seat1 reply');
 if(!actions.length)return d.applyTurn(b,opened,hand,[],null);
 const sorted=actions.slice().sort((a,z)=>a.numbers.length-z.numbers.length||
  a.numbers.join(',').localeCompare(z.numbers.join(',')));
 const action=policy==='single-low'?sorted[0]:sorted[sorted.length-1];
 return d.applyTurn(b,opened,hand,[],action);
}
function evaluate(seat1,seat2,j,policy){
 const b=e.applySinglePlacement(branch,candidates[j]);
 const first=seat1Reply(seat1,b,policy);
 const replies=d.actionsForHand(first.branchState,first.openingState,seat2);
 const focalHand=focal.filter(t=>key(t)!==key(candidates[j].tile));
 const possibilities=(replies.length?replies:[null]).map(action=>{
  const r=d.applyTurn(first.branchState,first.openingState,seat2,[],action);
  return access(focalHand,r.branchState,r.openingState);
 });
 return {seat1Pass:+first.passed,seat1Played:first.playedTiles.length,
  seat2Pass:+(replies.length===0),
  minTiles:Math.min(...possibilities.map(r=>r.tiles)),
  maxTiles:Math.max(...possibilities.map(r=>r.tiles)),
  minActions:Math.min(...possibilities.map(r=>r.actions)),
  maxActions:Math.max(...possibilities.map(r=>r.actions)),
  possibleReturnPass:+possibilities.some(r=>!r.canPlay),
  unavoidableReturnPass:+possibilities.every(r=>!r.canPlay)};
}
function fresh(){return {n:0,seat1Pass:0,seat1Played:0,seat2Pass:0,
 minTiles:0,maxTiles:0,minActions:0,maxActions:0,
 possibleReturnPass:0,unavoidableReturnPass:0};}
function add(s,r){s.n++;for(const k of Object.keys(r))s[k]+=r[k];}
function census(label,fixed){
 const fixedKeys=new Set(fixed.map(key));
 assert.equal(fixedKeys.size,fixed.length);
 assert(fixed.every(t=>unknown.some(u=>key(u)===key(t))));
 const pool=unknown.filter(t=>!fixedKeys.has(key(t))),slots=9-fixed.length;
 const totals=Object.fromEntries(policies.map(p=>[p,[fresh(),fresh()]]));
 const deltas=Object.fromEntries(policies.map(p=>[p,{negative:0,zero:0,positive:0}]));
 let n=0;
 for(let mask=0;mask<2**pool.length;mask++){
  let pop=0,b=mask;while(b){b&=b-1;pop++;}if(pop!==slots)continue;
  const seat1=fixed.slice(),seat2=[];
  for(let i=0;i<pool.length;i++)(mask&(1<<i)?seat1:seat2).push(pool[i]);
  assert.equal(seat1.length,9);assert.equal(seat2.length,8);
  if(n<3)assert.equal(new Set([...played,...focal,...seat1,...seat2].map(key)).size,28);
  for(const p of policies){
   const a=evaluate(seat1,seat2,0,p),z=evaluate(seat1,seat2,1,p);
   add(totals[p][0],a);add(totals[p][1],z);
   const diff=z.minTiles-a.minTiles;
   deltas[p][diff<0?'negative':diff>0?'positive':'zero']++;
  }
  n++;
 }
 assert.equal(n,choose(pool.length,slots));
 for(const p of policies)assert.equal(Object.values(deltas[p]).reduce((a,b)=>a+b,0),n);
 return {label,knownSeat1:fixed.map(key),exactWorlds:n,
  policies:Object.fromEntries(policies.map(p=>[p,{moves:totals[p],
   pairedMinTileDeltaBminusA:deltas[p]}]))};
}
function run(){
 const rows=scenarios.map(([name,known])=>census(name,known));
 assert.deepEqual(rows.map(r=>r.exactWorlds),[24310,12870,12870,6435]);
 for(const p of policies){
  const c=rows[0].policies[p].moves,k3=rows[1].policies[p].moves,
   k4=rows[2].policies[p].moves;
  assert.deepEqual(c.map(x=>x.seat1Pass),[5005,5005]);
  assert.deepEqual(c.map(x=>x.seat2Pass),p==='single-low'?[1287,1287]:[9,9]);
  assert.deepEqual(k3.map(x=>x.seat1Pass),[0,3003]);
  assert.deepEqual(k3.map(x=>x.seat2Pass),p==='single-low'?[1287,495]:[9,1]);
  assert.deepEqual(k4.map(x=>x.seat2Pass),p==='single-low'?[495,1287]:[1,9]);
  assert.equal(c[0].minTiles,c[1].minTiles);
  assert.equal(c[0].maxTiles,c[1].maxTiles);
 }
 return {schema:'qosha-public-return-dispatcher-exact/v1',
  engine:'qosa-research-0.5.3 + actual engine/turn-dispatcher',
  rules:'recovered qosa-1.0.0 3x9; PROVISIONAL global-ever-open',
  seeds:null,newDeals:0,newRandomWorlds:0,newFullRounds:0,newForcedContinuations:0,
  overlappingExactWorlds:rows.reduce((a,r)=>a+r.exactWorlds,0),
  candidates:['1-3 left','1-4 left'],seat1Policies:policies,
  seat2Policy:'ALL legal ordinary/double-sequence replies, report min/max focal return mobility (no weighting)',
  scenarios:rows,
  limitations:'Synthetic conditional uniform worlds, not independent real hands. Physical late-arrival unlocking and blocked ties unresolved. Seat1 optional double policy is hypothetical. No full-round win, minus, score or regret claims.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,census,evaluate};