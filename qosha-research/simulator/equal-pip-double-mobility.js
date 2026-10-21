'use strict';
// Matched equal-pip opening-double vs ordinary-single comparison on reachable 3x9 positions.
// node qosha-research/simulator/equal-pip-double-mobility.js test
// node qosha-research/simulator/equal-pip-double-mobility.js 1318000 1321000 160 48
const e=require('./engine'),i=require('./initializer'),r=require('./round-driver');
const d=require('./turn-dispatcher'),sampler=require('./pass-conditioned-sampler');
const {signature,chooseCanonical}=require('../runs/2026-10-20-2352-canonical-geometry');
const deck=e.createDoubleSixDeck(),policies=['min-hand-pips','closed-branch-control'];
const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;
function stats(a){if(!a.length)return{n:0};const m=avg(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;
 return{n:a.length,mean:m,ci95:[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)],
 positive:a.filter(x=>x>1e-10).length,negative:a.filter(x=>x< -1e-10).length,ties:a.filter(x=>Math.abs(x)<=1e-10).length};}
function pairAt(s){
 const f=s.currentPlayer,n=(f+1)%3;if(s.stock.length||s.hands[f].length<3||s.hands[n].length<2)return null;
 const opts=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock);
 if(opts.phase!=='play')return null;
 const doubles=opts.actions.filter(a=>a.type==='double-sequence'&&a.tiles.length===1&&a.numbers.length===1);
 const singles=opts.actions.filter(a=>a.type==='single');
 const pairs=[];
 for(const a of doubles)for(const b of singles)if(e.pipSum(a.tiles)===e.pipSum([b.tile])){
  pairs.push({double:a,single:b,sort:[a.numbers[0],e.tileKey(b.tile),signature(s,a),signature(s,b)].join('|')});
 }
 pairs.sort((a,b)=>a.sort.localeCompare(b.sort));return pairs[0]||null;
}
function collect(start,end,limit,policy='min-hand-pips'){
 const out=[];let scanned=0,states=0;
 for(let seed=start;seed<end&&out.length<limit;seed++){
  scanned++;let s=i.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')throw Error('initializer '+seed);
  while(!s.outcome&&s.turns<120){
   states++;const pair=pairAt(s);
   if(pair){
    const live=new Set(s.hands.flat().map(e.tileKey)),known=deck.filter(t=>!live.has(e.tileKey(t)));
    out.push({seed,turn:s.turns,focal:s.currentPlayer,next:(s.currentPlayer+1)%3,
      state:r.cloneRoundState(s),known,pair,discovery:policy});break;
   }
   s=r.stepRound(s,(opts,st)=>chooseCanonical(policy,opts,st));
  }
 }
 return{scanned,states,positions:out};
}
function after(w,a){
 const s=r.stepRound(w,()=>a);
 if(s.outcome)throw Error('unexpected immediate finish');
 const opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
 const types=new Set(opts.actions.flatMap(x=>(x.type==='single'?[x.tile]:(x.tiles||[])).map(e.tileKey)));
 const finish=opts.actions.some(x=>d.applyTurn(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock,x).hand.length===0);
 return{state:s,tileTypes:types.size,actions:opts.actions.length,pass:+(opts.phase==='pass'),
   canFinish:+finish,opened:s.openingState.openedNumbers.size};
}
function continuation(s,policy,f){
 const final=r.runRound(s,(opts,st)=>chooseCanonical(policy,opts,st),{maxTurns:200});
 if(final.outcome.kind==='unresolved')throw Error('unresolved continuation');
 return{win:+(final.outcome.kind==='finish'&&final.outcome.playerIndex===f),
  pips:e.pipSum(final.hands[f]),minus:+(final.outcome.kind==='finish'&&final.outcome.playerIndex===f&&final.outcome.minus<0),
  block:+(final.outcome.kind==='block'),turns:final.turns};
}
function analyze(p,worlds){
 const s=p.state,snapshot=JSON.stringify(s),forbidden=[new Set(),new Set(),new Set()];
 const keys=['tileTypes','actions','pass','canFinish','opened'];
 const im=Object.fromEntries(keys.map(k=>[k,[]]));
 const outcomes=Object.fromEntries(policies.map(x=>[x,Object.fromEntries(['win','pips','minus','block','turns'].map(k=>[k,[]]))]));
 let continuations=0;
 for(let j=0;j<worlds;j++){
  const seed=e.mixSeed32((p.seed+Math.imul(j+1,0x9e3779b9))>>>0);
  const w=sampler.sample(s,p.known,forbidden,seed);
  const a=after(w,p.pair.double),b=after(w,p.pair.single);
  for(const k of keys)im[k].push(a[k]-b[k]);
  for(const policy of policies){
   const x=continuation(a.state,policy,p.focal),y=continuation(b.state,policy,p.focal);continuations+=2;
   for(const k of Object.keys(outcomes[policy]))outcomes[policy][k].push(x[k]-y[k]);
  }
 }
 if(JSON.stringify(s)!==snapshot)throw Error('source state mutation');
 return{seed:p.seed,turn:p.turn,focal:p.focal,nextHandSize:s.hands[p.next].length,
  focalHandSize:s.hands[p.focal].length,doubleNumber:p.pair.double.numbers[0],
  equalRemovedPips:e.pipSum(p.pair.double.tiles),single:e.tileKey(p.pair.single.tile),
  doubleAction:signature(s,p.pair.double),singleAction:signature(s,p.pair.single),
  worlds,continuations,immediate:Object.fromEntries(keys.map(k=>[k,avg(im[k])])),
  policies:Object.fromEntries(policies.map(x=>[x,Object.fromEntries(Object.keys(outcomes[x]).map(k=>[k,avg(outcomes[x][k])]))]))};
}
function summarize(rows){
 const groups={all:rows,mobilityIncreases:rows.filter(x=>x.immediate.tileTypes>0.00001),
  mobilityUnchanged:rows.filter(x=>Math.abs(x.immediate.tileTypes)<=0.00001),
  mobilityDecreases:rows.filter(x=>x.immediate.tileTypes< -0.00001),
  nextAtMostTwo:rows.filter(x=>x.nextHandSize<=2),nextThreePlus:rows.filter(x=>x.nextHandSize>=3),
  doubleZero:rows.filter(x=>x.doubleNumber===0),doublePositive:rows.filter(x=>x.doubleNumber>0)};
 const out={};
 for(const [name,rr] of Object.entries(groups)){
  out[name]={positions:rr.length,immediate:Object.fromEntries(['tileTypes','actions','pass','canFinish','opened'].map(k=>[k,stats(rr.map(x=>x.immediate[k]))])),
   policies:Object.fromEntries(policies.map(p=>[p,Object.fromEntries(['win','pips','minus','block','turns'].map(k=>[k,stats(rr.map(x=>x.policies[p][k]))]))]))};
 }
 return out;
}
function run(start=1318000,end=1321000,limit=160,worlds=48){
 if(!Number.isInteger(start)||end<=start||limit<1||worlds<2)throw Error('bad args');
 const first=collect(start,end,Math.ceil(limit/2),'min-hand-pips');
 const second=collect(Math.max(start+1,start+Math.floor((end-start)/2)),end,Math.floor(limit/2),'closed-branch-control');
 const positions=[...first.positions,...second.positions],rows=positions.map(p=>analyze(p,worlds));
 return{schema:'qosa-equal-pip-double-mobility/v1',
  timestampBaku:new Date(Date.now()+14400000).toISOString().slice(0,19)+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  seeds:{minPips:[start,start+first.scanned],branchControl:[Math.max(start+1,start+Math.floor((end-start)/2)),Math.max(start+1,start+Math.floor((end-start)/2))+second.scanned]},
  positions:rows.length,scannedDeals:first.scanned+second.scanned,scannedStates:first.states+second.states,
  hiddenAllocations:rows.length*worlds,candidateContinuations:rows.reduce((n,x)=>n+x.continuations,0),
  unresolved:0,worldsPerPosition:worlds,policies,fullStrategyRoundsAdded:0,
  comparison:'same-state single X-X opening vs ordinary A-B with equal removed pips; first eligible pair by deterministic canonical signature; forced first action, same hidden worlds and continuation bots',
  worldSeedFormula:'mixSeed32((dealSeed + imul(worldIndex+1,0x9e3779b9)) >>> 0)',
  limitations:'First eligible state per deal; discovery bot and seed cohort; equal pips does not equalize hand connectivity or post-action geometry; no opponent pass-history conditioning; branch semantics provisional; block winner unassigned; finish-first not full-match victory; exploratory position CIs.',
  summary:summarize(rows),rows};
}
function test(){
 const a=collect(1318000,1318030,3),b=collect(1318000,1318030,3);
 if(a.positions.length!==3||a.positions.some((p,j)=>p.seed!==b.positions[j].seed))throw Error('collection replay');
 for(const p of a.positions)if(e.pipSum(p.pair.double.tiles)!==e.pipSum([p.pair.single.tile]))throw Error('not equal pips');
 const x=analyze(a.positions[0],3),y=analyze(a.positions[0],3);
 if(JSON.stringify(x)!==JSON.stringify(y)||x.continuations!==12)throw Error('paired replay');
 return{passed:true,seeds:a.positions.map(x=>x.seed),pairedContinuations:x.continuations};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1318000),+(a[1]||1321000),+(a[2]||160),+(a[3]||48)),null,2));}
module.exports={pairAt,collect,after,analyze,summarize,run,test};
