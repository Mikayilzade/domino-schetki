'use strict';
// Conservative pass-posterior tie-break versus aggressive pips+20*P(pass).
// Run: node qosha-research/simulator/pass-conservative-tiebreak.js 1471740 3000 8 random-legal
// Test: node qosha-research/simulator/pass-conservative-tiebreak.js test
// All branch-number locking conclusions PROVISIONAL until authenticated.
// Discovery accepts any BUILTIN_STRATEGIES; continuation policies remain the two fixed POLICY entries.
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),b=require('./strategy-runner'),h=require('./hidden-world');
const late=require('./late-forced-double-paired'),reg=require('./decision-regret');
const ph=require('./pass-conditioned-hidden-worlds'),base=require('./pass-alt-discovery-holdout');
const POLICY=['random-legal','min-hand-pips'];
const NAMES=['plain','joint','tie','maxPips'];
const COMPARISONS=[['jointMinusPlain','joint','plain'],['tieMinusPlain','tie','plain'],
 ['tieMinusJoint','tie','joint'],['tieMinusMaxPips','tie','maxPips']];
function ci(xs){
 if(!xs.length)return {n:0,mean:null,halfWidth95:null};
 const mean=xs.reduce((a,b)=>a+b,0)/xs.length;
 const v=xs.length>1?xs.reduce((a,x)=>a+(x-mean)**2,0)/(xs.length-1):0;
 return {n:xs.length,mean,halfWidth95:xs.length>1?1.96*Math.sqrt(v/xs.length):null};
}
function chooseFour(s,mem){
 const plain=base.choose(s,mem,'plain',20);
 const joint=base.choose(s,mem,'joint',20);
 // Integer discarded pips always dominate a probability contribution <= 0.001;
 // posterior is consulted only between equal-pip moves.
 const tie=base.choose(s,mem,'joint',0.001);
 const maxPips=base.choose(s,mem,'plain',0);
 if(tie.pips!==maxPips.pips)throw Error('tie-break sacrificed discarded pips');
 return {plain,joint,tie,maxPips};
}
function delta(x,y){return {finishPP:100*(x.first-y.first),pips:x.pips-y.pips,
 minusPP:100*(x.minus-y.minus),blockPP:100*(x.block-y.block)};}
function zero(){return {finishPP:0,pips:0,minusPP:0,blockPP:0};}
function metricRow(){return Object.fromEntries(POLICY.map(p=>[p,{
  comparisons:Object.fromEntries(COMPARISONS.map(([name])=>[name,zero()])),
  regret:Object.fromEntries(NAMES.map(n=>[n,0]))
 }]));}
function run(start=1471740,count=3000,worlds=8,discoveryPolicy='random-legal'){
 if(![start,count,worlds].every(Number.isInteger)||count<1||worlds<1||worlds>64||
    !b.BUILTIN_STRATEGIES.includes(discoveryPolicy))throw Error('arguments');
 const rows=[],discovery={rounds:0,finishes:0,blocks:0,unresolved:0,passes:0,
  choiceStates:0,constrainedChoiceStates:0,selected:0,selectedConstrained:0,
  anyChanged:0,jointPlainChanged:0,tiePlainChanged:0,tieJointChanged:0,tieMaxPipsChanged:0};
 let conditionalAllocations=0,forcedCounterfactualContinuations=0;
 for(let seed=start;seed<start+count;seed++){
  const initial=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(initial.kind!=='ready')throw Error('initializer');
  let s=r.cloneRoundState(initial),mem=[new Set(),new Set(),new Set()],hits=[];
  if(initial.openingPassed){const z=r.cloneRoundState(s);z.currentPlayer=initial.starter;ph.pass(mem,z);}
  while(!s.outcome&&s.turns<200){
   const p=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
   if(opts.phase==='pass'&&!s.stock.length){ph.pass(mem,s);discovery.passes++;}
   if(opts.phase==='play'&&!opts.drawn&&!s.stock.length&&opts.actions.length>1){
    const n=(p+1)%3,o=(p+2)%3,pool=h.hiddenPool({focalHand:s.hands[p],knownTiles:late.knownTiles(s)});
    const constrained=pool.some(t=>mem[n].has(e.tileKey(t))||mem[o].has(e.tileKey(t)));
    discovery.choiceStates++;if(constrained)discovery.constrainedChoiceStates++;
    hits.push({state:r.cloneRoundState(s),mem:mem.map(x=>new Set(x)),constrained});
   }
   s=r.stepRound(s,()=>b.chooseBy(discoveryPolicy,opts,{seed,turns:s.turns,player:p}));
  }
  discovery.rounds++;
  if(!s.outcome){discovery.unresolved++;continue;}
  if(s.outcome.kind==='finish')discovery.finishes++;else if(s.outcome.kind==='block')discovery.blocks++;
  if(!hits.length)continue;
  const hit=hits[e.mixSeed32(seed^0x4ab9e1)%hits.length],st=hit.state,m=hit.mem;
  if(!ph.consistent(st,m))throw Error('observed pass contradicts hand');
  const choices=chooseFour(st,m),keys=Object.fromEntries(NAMES.map(n=>[n,choices[n].k]));
  const unique=[...new Set(Object.values(keys))],changed=unique.length>1;
  discovery.selected++;if(hit.constrained)discovery.selectedConstrained++;
  if(changed)discovery.anyChanged++;
  if(keys.joint!==keys.plain)discovery.jointPlainChanged++;
  if(keys.tie!==keys.plain)discovery.tiePlainChanged++;
  if(keys.tie!==keys.joint)discovery.tieJointChanged++;
  if(keys.tie!==keys.maxPips)discovery.tieMaxPipsChanged++;
  if(!hit.constrained&&keys.joint!==keys.plain)throw Error('posterior disagreement without exclusions');
  const row={seed,turn:st.turns,focal:st.currentPlayer,constrained:hit.constrained,
   nextSize:st.hands[(st.currentPlayer+1)%3].length,handSize:st.hands[st.currentPlayer].length,
   choices:Object.fromEntries(NAMES.map(n=>[n,{key:keys[n],pips:choices[n].pips,prob:choices[n].prob}])),
   changed,uniqueActions:unique.length,metrics:metricRow()};
  if(changed){
   const spec={visibleState:st,focalPlayer:st.currentPlayer,focalHand:st.hands[st.currentPlayer],
    knownTiles:late.knownTiles(st),hiddenHandSizes:st.hands.map(x=>x.length),stockSize:0};
   for(let i=0;i<worlds;i++){
    const ws=(3900000000+(seed-start)*128+i)>>>0,world=ph.sample(spec,m,ws);
    if(!ph.consistent(world,m))throw Error('conditional world violates pass');
    conditionalAllocations++;
    for(const policy of POLICY){
     const results={};
     for(const k of unique){results[k]=late.forceThenContinue(world,k,policy,ws);forcedCounterfactualContinuations++;}
     const metric=row.metrics[policy];
     for(const [label,a,b] of COMPARISONS){
      const v=delta(results[keys[a]],results[keys[b]]);
      for(const k of Object.keys(v))metric.comparisons[label][k]+=v[k]/worlds;
     }
     const best=Math.max(...unique.map(k=>results[k].first));
     for(const n of NAMES)metric.regret[n]+=(best-results[keys[n]].first)/worlds;
    }
   }
  }
  rows.push(row);
 }
 if(discovery.unresolved||discovery.selected!==rows.length)throw Error('discovery accounting');
 const summary=sub=>({positions:sub.length,changed:sub.filter(x=>x.changed).length,
  constrained:sub.filter(x=>x.constrained).length,
  comparisons:Object.fromEntries(POLICY.map(p=>[p,Object.fromEntries(COMPARISONS.map(([label])=>[
   label,Object.fromEntries(['finishPP','pips','minusPP','blockPP'].map(k=>[k,ci(sub.map(x=>x.metrics[p].comparisons[label][k]))]))
  ]))])),
  regret:Object.fromEntries(POLICY.map(p=>[p,Object.fromEntries(NAMES.map(n=>[n,ci(sub.map(x=>x.metrics[p].regret[n]))]))]))});
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',
  day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return {schema:'qosha-pass-conservative-tiebreak/v1',timestampBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9; number-lock PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,uniqueDeals:count,discoveryPolicy,worldsPerChangedPosition:worlds,
  fullRoundContinuations:count,conditionalAllocations,forcedCounterfactualContinuations,discovery,
  strategies:['plain aggressive pips+20*P(pass)','joint aggressive pips+20*P(pass)',
   'conservative pips+0.001*joint P(pass) (tie-break only)','max-pips with lexical tie'],
  selection:'One deterministic pseudo-uniform multi-choice state per deal, selected among ALL eligible decisions, not just constrained states.',
  worldSeedFormula:'(3900000000+(dealSeed-seedStart)*128+worldIndex)>>>0',
  summary:{all:summary(rows),constrained:summary(rows.filter(x=>x.constrained)),
   changed:summary(rows.filter(x=>x.changed)),tieJointChanged:summary(rows.filter(x=>x.choices.tie.key!==x.choices.joint.key)),
   tiePlainChanged:summary(rows.filter(x=>x.choices.tie.key!==x.choices.plain.key))},
  rows:rows.filter((x,i)=>x.changed||i%67===0),
  storedRowsNote:'All changed positions and every 67th unchanged position retained; aggregate computed on all positions.',
  limitations:'All findings conditional on provisional branch-number locking and synthetic previous winner; hidden worlds uniformly conditioned on no-stock passes, not opponent action likelihood; position-cluster exploratory uncorrected 95% intervals, correlated worlds; one selected position per deal; candidate regret among four policies only, not full action set; finish-first is not 101-point match victory; block winner/loneZero/bust unvalidated.',
  nextAction:'Fresh seeds >= '+(start+count)+': hold out a second discovery policy, test tie-only against max-pips and tune no coefficients on the holdout; obtain authentic branch lock/open fixture.'};
}
function test(){
 const a=run(1471740,80,3,'random-legal'),z=run(1471740,80,3,'random-legal');
 const branch=run(1477740,60,2,'closed-branch-control');
 if(branch.discovery.rounds!==60||branch.discovery.unresolved||
    branch.discovery.selected!==60||
    branch.conditionalAllocations!==branch.discovery.anyChanged*2)
  throw Error('alternate discovery replay/accounting');
 delete a.timestampBaku;delete z.timestampBaku;
 if(JSON.stringify(a)!==JSON.stringify(z)||a.discovery.unresolved||a.discovery.selected!==80||
    a.conditionalAllocations!==a.discovery.anyChanged*3||
    a.forcedCounterfactualContinuations<2*a.conditionalAllocations||
    a.forcedCounterfactualContinuations>8*a.conditionalAllocations)
  throw Error('deterministic replay/accounting');
 return {passed:true,rounds:a.uniqueDeals,changed:a.discovery.anyChanged,
  allocations:a.conditionalAllocations,forced:a.forcedCounterfactualContinuations};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1471740),+(a[1]||3000),
  +(a[2]||8),a[3]||'random-legal'),null,2));
}
module.exports={run,test,chooseFour};
