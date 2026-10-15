'use strict';
// Exact hidden-world filtering using *observed passes* since each opponent's last play.
// Primary mode 3x9, recovered qosa-1.0.0; branch semantics remain provisional.
// Reproduce: node qosha-research/simulator/pass-history-exact-runner.js test
// Run: node qosha-research/simulator/pass-history-exact-runner.js 206500 280000 50
const e=require('./engine'),d=require('./turn-dispatcher'),init=require('./initializer');
const r=require('./round-driver'),{chooseBy}=require('./strategy-runner');
const {matches}=require('./connector-other-matches');
const {worlds}=require('./connector-exact-response-runner');
const {force,POLICIES}=require('./connector-equal-pip-runner');
function mean(a){return a.reduce((s,v)=>s+v,0)/a.length;}
function stat(a){if(!a.length)return null;const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;return{n:a.length,mean:m,exploratoryCI95:[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)]};}
function discover(start,end,limit){
 const positions=[];let scanned=0;
 for(let seed=start;seed<end&&positions.length<limit;seed++){
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;scanned++;
  const passes=[[],[],[]];
  while(!s.outcome&&s.turns<100){
   const focal=s.currentPlayer,ms=matches(s);
   const evidence=passes.flatMap((ps,player)=>player===focal?[]:ps.map(x=>({...x,player})));
   if(ms.length&&evidence.length){
    const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
    const knownTiles=e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t)));
    positions.push({seed,turn:s.turns,focal,pair:ms[0].pairs[0],
      visibleState:r.cloneRoundState(s),knownTiles,evidence});break;
   }
   const p=s.currentPlayer,o=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
   if(o.phase==='pass'){
    if(s.stock.length===0)passes[p].push({turn:s.turns,
      branchState:e.cloneBranchState(s.branchState),
      openingState:e.cloneOpeningState(s.openingState)});
    else passes[p]=[]; // a draw can change the hand; do not infer a no-move constraint
   }else passes[p]=[]; // hand changed: old pass evidence is no longer valid
   s=r.stepRound(s,(opts,st)=>chooseBy('closed-branch-control',opts,
     {seed,turns:st.turns,player:st.currentPlayer}));
  }
 }
 return{scanned,positions};
}
function compatible(world,evidence){
 return evidence.every(x=>d.turnOptions(x.branchState,x.openingState,world.hands[x.player],[]).phase==='pass');
}
function analyze(pos){
 const ww=worlds(pos),valid=[],policy={};
 if(!compatible(pos.visibleState,pos.evidence))throw Error('true hidden deal contradicts recorded passes');
 const snap=JSON.stringify({hands:pos.visibleState.hands,branch:pos.visibleState.branchState});
 for(const p of POLICIES)policy[p]={raw:[],conditioned:[]};
 for(let i=0;i<ww.length;i++){
  const w=ww[i],ok=compatible(w,pos.evidence),seed=61000000+1000*pos.seed+i;
  if(ok)valid.push(i);
  for(const p of POLICIES){
   const a=force(w,pos.pair.connector,p,seed),b=force(w,pos.pair.other,p,seed);
   const delta={finish:a.finish-b.finish,remainder:a.remainder-b.remainder,
     minus:a.minus-b.minus,block:a.block-b.block};
   policy[p].raw.push(delta);if(ok)policy[p].conditioned.push(delta);
  }
 }
 if(!valid.length||JSON.stringify({hands:pos.visibleState.hands,branch:pos.visibleState.branchState})!==snap)
  throw Error('empty posterior or mutated source');
 const aggregate=Object.fromEntries(POLICIES.map(p=>[p,Object.fromEntries(['raw','conditioned'].map(kind=>[kind,
  Object.fromEntries(['finish','remainder','minus','block'].map(metric=>[metric,
   mean(policy[p][kind].map(x=>x[metric]))]))]))]));
 return{seed:pos.seed,turn:pos.turn,focal:pos.focal,pair:pos.pair,
  observedPasses:pos.evidence.map(x=>({player:x.player,turn:x.turn})),
  totalWorlds:ww.length,compatibleWorlds:valid.length,compatibleIndices:valid,
  handSizes:pos.visibleState.hands.map(h=>h.length),
  preEnds:e.SIDES.map(side=>pos.visibleState.branchState.branches[side].end),
  policy:aggregate};
}
function run(start=206500,end=280000,limit=50){
 const found=discover(start,end,limit),rows=found.positions.map(analyze);
 if(!rows.length)throw Error('no eligible pass-history positions');
 const summary=Object.fromEntries(POLICIES.map(p=>[p,Object.fromEntries(['finish','remainder','minus','block'].map(metric=>{
  const raw=rows.map(x=>x.policy[p].raw[metric]),filtered=rows.map(x=>x.policy[p].conditioned[metric]);
  return[metric,{unconditioned:stat(raw),passConditioned:stat(filtered),
   change:stat(filtered.map((v,i)=>v-raw[i]))}];
 }))]));
 return{schema:'qosa-pass-history-exact/v1',
  timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}),
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0; branch semantics provisional',
  mode:'3x9',start,end,scanned:found.scanned,positions:rows.length,
  exactAllocations:rows.reduce((s,x)=>s+x.totalWorlds,0),
  compatibleAllocations:rows.reduce((s,x)=>s+x.compatibleWorlds,0),
  candidateContinuations:rows.reduce((s,x)=>s+x.totalWorlds,0)*2*POLICIES.length,
  newFullStrategyRounds:0,verifiedCumulativeFullRounds:180000,
  discoveryPolicy:'closed-branch-control; first eligible position with a recorded opponent pass since their last play',
  seedFormula:'61000000 + 1000*dealSeed + lexicographicAllocationIndex',
  policies:POLICIES,selectedSeeds:rows.map(x=>x.seed),summary,rows,
  limitations:'Pass-only hard constraints; no conditioning on opponents\' actual move choices or skill. Equal prior weight for remaining worlds. Pass evidence is valid only with unchanged hand and empty stock. First-eligible selection, small late-game support, deterministic bots, unconfirmed branch semantics, block winner unassigned, exploratory position CIs. Exact continuations are not new full strategy rounds.'};
}
function test(){
 const p=discover(189705,189706,1).positions[0];
 if(!p||p.seed!==189705)throw Error('pass fixture discovery');
 const w=worlds(p),n=w.filter(x=>compatible(x,p.evidence)).length;
 if(w.length!==3||n!==1)throw Error('pass filter fixture: '+w.length+'/'+n);
 const a=analyze(p),b=analyze(p);
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('nondeterministic replay');
 return{passed:true,seed:p.seed,exactWorlds:w.length,passCompatible:n};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||206500),+(a[1]||280000),+(a[2]||50)),null,2));
}
module.exports={discover,compatible,analyze,run,test};
