'use strict';
// Independent alternative-discovery-policy holdout for pass-conditioned 3x9 choices.
// Usage: node qosha-research/simulator/pass-independent-holdout.js test
//        node qosha-research/simulator/pass-independent-holdout.js 1456440 3000 12 6
// Provisional branch number locking; finish-first is NOT 101-point match victory.
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),f=require('./forced-double-count-ablation');
const b=require('./strategy-runner'),h=require('./hidden-world');
const late=require('./late-forced-double-paired'),reg=require('./decision-regret');
const ph=require('./pass-conditioned-hidden-worlds'),{posterior}=require('./joint-pass-memory-runner');
const deck=e.createDoubleSixDeck(),key=e.tileKey,POLICIES=['random-legal','min-hand-pips'];
function ci(xs){
 if(!xs.length)return{n:0,mean:null,halfWidth95:null};
 const m=xs.reduce((a,x)=>a+x,0)/xs.length;
 const v=xs.length>1?xs.reduce((a,x)=>a+(x-m)**2,0)/(xs.length-1):0;
 return{n:xs.length,mean:m,halfWidth95:xs.length>1?1.96*Math.sqrt(v/xs.length):null};
}
function choose(s,mem,mode,alpha=20){
 const p=s.currentPlayer,n=(p+1)%3,o=(p+2)%3;
 const opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
 if(opts.phase!=='play'||s.stock.length||opts.drawn)throw Error('expected no-stock playable turn');
 const pool=h.hiddenPool({focalHand:s.hands[p],knownTiles:late.knownTiles(s)});
 if(pool.length!==s.hands[n].length+s.hands[o].length)throw Error('pool conservation');
 const rows=opts.actions.map(a=>{
  const tr=d.applyTurn(s.branchState,s.openingState,s.hands[p],[],a);
  const legal=new Set(deck.filter(t=>d.actionsForHand(tr.branchState,tr.openingState,[t]).length).map(key));
  const prob=posterior(pool,s.hands[n].length,mem[n],mem[o],legal,mode);
  const tiles=a.type==='single'?[a.tile]:a.tiles;
  const finish=tiles.length===s.hands[p].length;
  const pips=e.pipSum(tiles);
  return{a,k:reg.actionKey(a),prob,pips,score:finish?Infinity:pips+alpha*prob};
 });
 rows.sort((a,b)=>b.score-a.score||b.pips-a.pips||a.k.localeCompare(b.k));
 return rows[0];
}
function probFor(s,mem,a,mode){
 const p=s.currentPlayer,n=(p+1)%3,o=(p+2)%3;
 const pool=h.hiddenPool({focalHand:s.hands[p],knownTiles:late.knownTiles(s)});
 const tr=d.applyTurn(s.branchState,s.openingState,s.hands[p],[],a);
 const legal=new Set(deck.filter(t=>d.actionsForHand(tr.branchState,tr.openingState,[t]).length).map(key));
 return posterior(pool,s.hands[n].length,mem[n],mem[o],legal,mode);
}
function metricDiff(x,y){return{finishPP:100*(x.first-y.first),pips:x.pips-y.pips,
 minusPP:100*(x.minus-y.minus),blockPP:100*(x.block-y.block)};}
function run(start=1458240,count=3000,worlds=8,every=1,discoveryPolicy='min-hand-pips'){
 if(![start,count,worlds,every].every(Number.isInteger)||count<1||worlds<1||worlds>64||every<1||!['min-hand-pips','random-legal'].includes(discoveryPolicy))throw Error('arguments');
 const rows=[],disc={rounds:0,finishes:0,blocks:0,unresolved:0,passes:0,
  choiceStates:0,constrainedChoiceStates:0,selected:0,selectedConstrained:0,changed:0};
 let forcedContinuations=0,allocations=0;
 for(let seed=start;seed<start+count;seed++){
  const initial=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(initial.kind!=='ready')throw Error('initializer');
  let s=r.cloneRoundState(initial);
  const mem=[new Set(),new Set(),new Set()],hits=[];
  if(initial.openingPassed){const x=r.cloneRoundState(s);x.currentPlayer=initial.starter;ph.pass(mem,x);}
  while(!s.outcome&&s.turns<200){
   const p=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
   if(opts.phase==='pass'&&!s.stock.length){ph.pass(mem,s);disc.passes++;}
   if(opts.phase==='play'&&!opts.drawn&&!s.stock.length&&opts.actions.length>1){
    const n=(p+1)%3,o=(p+2)%3,pool=h.hiddenPool({focalHand:s.hands[p],knownTiles:late.knownTiles(s)});
    const constrained=pool.some(t=>mem[n].has(key(t))||mem[o].has(key(t)));
    disc.choiceStates++;if(constrained)disc.constrainedChoiceStates++;
    if((seed-start)%every===0)hits.push({state:r.cloneRoundState(s),mem:mem.map(x=>new Set(x)),constrained});
   }
   s=r.stepRound(s,()=>b.chooseBy(discoveryPolicy,opts,{seed,turns:s.turns,player:p}));
  }
  disc.rounds++;
  if(!s.outcome){disc.unresolved++;continue;}
  if(s.outcome.kind==='finish')disc.finishes++;else if(s.outcome.kind==='block')disc.blocks++;
  if(!hits.length)continue;
  const hit=hits[e.mixSeed32(seed^0x4ab9e1)%hits.length],st=hit.state,m=hit.mem;
  if(!ph.consistent(st,m))throw Error('actual hand violates observed passes');
  const p=st.currentPlayer,n=(p+1)%3,o=(p+2)%3;
  const plain=choose(st,m,'plain'),joint=choose(st,m,'joint');
  const changed=plain.k!==joint.k;
  const plainJointProb=probFor(st,m,plain.a,'joint');
  disc.selected++;if(hit.constrained)disc.selectedConstrained++;if(changed)disc.changed++;
  const spec={visibleState:st,focalPlayer:p,focalHand:st.hands[p],
   knownTiles:late.knownTiles(st),hiddenHandSizes:st.hands.map(x=>x.length),stockSize:0};
  const tr=d.applyTurn(st.branchState,st.openingState,st.hands[p],[],plain.a);
  const actualPass=+(!d.actionsForHand(tr.branchState,tr.openingState,st.hands[n]).length);
  const row={seed,turn:st.turns,focal:p,nextSize:st.hands[n].length,otherSize:st.hands[o].length,
   constrained:hit.constrained,changed,actions:d.turnOptions(st.branchState,st.openingState,st.hands[p],[]).actions.length,
   plain:{key:plain.k,prob:plain.prob,pips:plain.pips},joint:{key:joint.k,prob:joint.prob,pips:joint.pips},
   actualPass,plainJointProb,metrics:Object.fromEntries(POLICIES.map(z=>[z,{finishPP:0,pips:0,minusPP:0,blockPP:0}]))};
  if(changed){
   for(let i=0;i<worlds;i++){
    const ws=(3800000000+(seed-start)*128+i)>>>0,world=ph.sample(spec,m,ws);
    if(!ph.consistent(world,m))throw Error('sample pass violation');
    allocations++;
    for(const policy of POLICIES){
     const x=late.forceThenContinue(world,plain.k,policy,ws);
     const y=late.forceThenContinue(world,joint.k,policy,ws);
     forcedContinuations+=2;
     const diff=metricDiff(y,x),a=row.metrics[policy];
     for(const k of Object.keys(a))a[k]+=diff[k]/worlds;
    }
   }
  }
  rows.push(row);
 }
 if(disc.unresolved)throw Error('unresolved discovery');
 const summary=sub=>({positions:sub.length,changed:sub.filter(x=>x.changed).length,
  actualNextPassRate:ci(sub.map(x=>x.actualPass)),
  plainPassBrier:ci(sub.map(x=>(x.plain.prob-x.actualPass)**2)),
  jointPassBrier:ci(sub.map(x=>(x.joint.prob-x.actualPass)**2)),
  sameActionPlainBrier:ci(sub.map(x=>(x.plain.prob-x.actualPass)**2)),
  sameActionJointBrier:ci(sub.map(x=>(x.plainJointProb-x.actualPass)**2)),
  sameActionJointMinusPlainPassPP:ci(sub.map(x=>100*(x.plainJointProb-x.plain.prob))),
  policies:Object.fromEntries(POLICIES.map(z=>[z,Object.fromEntries(
   ['finishPP','pips','minusPP','blockPP'].map(k=>[k,ci(sub.map(x=>x.metrics[z][k]))]))]))});
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',
  month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-pass-alt-discovery-holdout/v1',timestampBaku:stamp,engine:'qosa-research-0.5.3',
  rules:'recovered qosa-1.0.0 3x9; authentic number-lock PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,uniqueDeals:count,discoveryPolicy,worldsPerChangedPosition:worlds,
  sampledSeedStride:every,discovery:disc,positions:rows.length,conditionalAllocations:allocations,
  fullRoundContinuations:count,forcedCounterfactualContinuations:forcedContinuations,
  strategies:[discoveryPolicy+' homogeneous discovery','plain pass posterior pips+20*P(pass)',
   'joint pass posterior pips+20*P(pass)',...POLICIES],
  selection:'One deterministic pseudo-uniform choice among ALL multi-choice states in each sampled seed (seed stride); includes constrained and unconstrained. Independent seed cohort, not first constrained state. Alternative discovery policy.',
  worldSeedFormula:'(3800000000+(dealSeed-seedStart)*128+worldIndex)>>>0',
  summary:{all:summary(rows),constrained:summary(rows.filter(x=>x.constrained)),
   unconstrained:summary(rows.filter(x=>!x.constrained)),
   changed:summary(rows.filter(x=>x.changed))},
  rows,limitations:'Joint pass posterior exact only conditional on no-stock observed passes and uniform hidden allocation, not opponent action likelihoods. Correlated worlds, deterministic discovery policy, exploratory position CI, policy selection and real branch locking provisional; block winner/loneZero/bust/101 match unresolved.',
  nextAction:'Disjoint seeds >= '+(start+count)+': expand changed-action sample, evaluate against alternative discovery policies and authentic four-branch fixtures.'};
}
function test(){
 const a=run(1458240,90,3,1,'min-hand-pips'),b=run(1458240,90,3,1,'min-hand-pips');
 delete a.timestampBaku;delete b.timestampBaku;
 if(JSON.stringify(a)!==JSON.stringify(b)||a.discovery.unresolved||a.discovery.selected!==a.positions||
  a.forcedCounterfactualContinuations!==a.discovery.changed*3*2*POLICIES.length)throw Error('determinism/accounting');
 return{passed:true,positions:a.positions,changed:a.discovery.changed,
  forced:a.forcedCounterfactualContinuations,discovery:a.discovery.rounds};
}
if(require.main===module){
 const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():
  run(+(a[0]||1458240),+(a[1]||3000),+(a[2]||8),+(a[3]||1),a[4]||'min-hand-pips'),null,2));
}
module.exports={choose,run,test};
