'use strict';
// Qoşa 3x9 exact no-stock pass-conditioned hidden-world sampler.
// PROVISIONAL number-lock geometry. Node: node qosha-research/simulator/pass-conditioned-hidden-worlds.js test
// Run: node qosha-research/simulator/pass-conditioned-hidden-worlds.js 1452440 4000 200 12
const e=require('./engine'),d=require('./turn-dispatcher'),init=require('./initializer');
const r=require('./round-driver'),f=require('./forced-double-count-ablation');
const b=require('./strategy-runner'),h=require('./hidden-world');
const late=require('./late-forced-double-paired'),reg=require('./decision-regret');
const {posterior}=require('./joint-pass-memory-runner');
const deck=e.createDoubleSixDeck(),policies=['random-legal','min-hand-pips'],key=e.tileKey;
function legal(s){return new Set(deck.filter(t=>d.actionsForHand(s.branchState,s.openingState,[t]).length).map(key));}
function pass(mem,s){if(s.stock.length)throw Error('pass with stock');for(const k of legal(s))mem[s.currentPlayer].add(k);
 if(s.hands[s.currentPlayer].some(t=>mem[s.currentPlayer].has(key(t))))throw Error('pass contradicts hand');}
function consistent(s,mem){return s.hands.every((hand,p)=>hand.every(t=>!mem[p].has(key(t))));}
function allocate(pool,k,fn,fo,seed){
 const a=[],c=[],flex=[];
 for(const t of pool){const z=key(t),x=fn.has(z),y=fo.has(z);if(x&&y)throw Error('joint contradiction');
  if(y)a.push(t);else if(x)c.push(t);else flex.push(t);}
 const need=k-a.length;if(need<0||need>flex.length)throw Error('hand size contradiction');
 const ranks=new Map(e.shuffledDeck(seed).map((t,i)=>[key(t),i]));
 flex.sort((x,y)=>ranks.get(key(x))-ranks.get(key(y)));
 return[a.concat(flex.slice(0,need)),c.concat(flex.slice(need))];
}
function sample(spec,mem,seed){
 if(spec.stockSize!==0)throw Error('stock not supported');
 const p=spec.focalPlayer,n=(p+1)%3,o=(p+2)%3,pool=h.hiddenPool(spec);
 if(pool.length!==spec.hiddenHandSizes[n]+spec.hiddenHandSizes[o])throw Error('tile conservation');
 const hands=allocate(pool,spec.hiddenHandSizes[n],mem[n],mem[o],seed),s=r.cloneRoundState(spec.visibleState);
 s.hands[p]=spec.focalHand.map(t=>t.slice());s.hands[n]=hands[0];s.hands[o]=hands[1];s.stock=[];
 if(!consistent(s,mem))throw Error('sampler violation');return s;
}
function pp(s,a,pool,mem,mode){
 const p=s.currentPlayer,n=(p+1)%3,o=(p+2)%3;
 const tr=d.applyTurn(s.branchState,s.openingState,s.hands[p],[],a);
 return posterior(pool,s.hands[n].length,mem[n],mem[o],
 new Set(deck.filter(t=>d.actionsForHand(tr.branchState,tr.openingState,[t]).length).map(key)),mode);
}
function ci(xs){
 if(!xs.length)return{n:0,mean:null,halfWidth95:null};
 const m=xs.reduce((a,x)=>a+x,0)/xs.length;
 const v=xs.length>1?xs.reduce((a,x)=>a+(x-m)**2,0)/(xs.length-1):0;
 return{n:xs.length,mean:m,halfWidth95:xs.length>1?1.96*Math.sqrt(v/xs.length):null};
}
function run(start=1452440,count=4000,limit=200,worlds=12){
 if(![start,count,limit,worlds].every(Number.isInteger)||count<1||limit<1||worlds<1||worlds>64)throw Error('arguments');
 const rows=[],disc={rounds:0,finishes:0,blocks:0,unresolved:0,passes:0,eligibleConstrained:0,shortNext1:0,shortNext1WithUnseenPassConstraint:0};
 for(let seed=start;seed<start+count;seed++){
  const initial=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(initial.kind!=='ready')throw Error('initializer');
  let s=r.cloneRoundState(initial),hit=null;
  const mem=[new Set(),new Set(),new Set()];
  if(initial.openingPassed){const x=r.cloneRoundState(s);x.currentPlayer=initial.starter;pass(mem,x);}
  while(!s.outcome&&s.turns<200){
   const p=s.currentPlayer,n=(p+1)%3,o=(p+2)%3,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
   if(opts.phase==='pass'&&!s.stock.length){pass(mem,s);disc.passes++;}
   const pool=opts.phase==='play'&&!s.stock.length?h.hiddenPool({focalHand:s.hands[p],knownTiles:late.knownTiles(s)}):[];
   const restricted=pool.some(t=>mem[n].has(key(t))||mem[o].has(key(t)));
   if(opts.phase==='play'&&!opts.drawn&&s.hands[n].length===1&&s.hands[p].length>=3&&
      !opts.actions.some(a=>a.type==='single'||a.type==='mixed-finish')&&
      new Set(opts.actions.filter(a=>a.type==='double-sequence').map(a=>a.tiles.length)).size>1){
    disc.shortNext1++;if(restricted)disc.shortNext1WithUnseenPassConstraint++;
   }
   if(!hit&&opts.phase==='play'&&opts.actions.length>=2&&restricted){
    disc.eligibleConstrained++;hit={state:r.cloneRoundState(s),mem:mem.map(x=>new Set(x))};
   }
   s=r.stepRound(s,()=>f.choose(f.MANY,opts,{seed,turns:s.turns,player:p}));
  }
  disc.rounds++;
  if(!s.outcome){disc.unresolved++;continue;}
  if(s.outcome.kind==='finish')disc.finishes++;else if(s.outcome.kind==='block')disc.blocks++;
  if(!hit||rows.length>=limit)continue;
  const st=hit.state,p=st.currentPlayer,n=(p+1)%3,o=(p+2)%3;
  if(!consistent(st,hit.mem))throw Error('actual pass contradiction');
  const spec={visibleState:st,focalPlayer:p,focalHand:st.hands[p],knownTiles:late.knownTiles(st),
   hiddenHandSizes:st.hands.map(x=>x.length),stockSize:0},pool=h.hiddenPool(spec);
  const opts=d.turnOptions(st.branchState,st.openingState,st.hands[p],[]);
  const baseline=b.chooseBy('min-hand-pips',opts);
  const candidates=opts.actions.map(a=>({a,key:reg.actionKey(a),plain:pp(st,a,pool,hit.mem,'plain'),
   joint:pp(st,a,pool,hit.mem,'joint')}));
  const first=candidates.find(x=>x.key===reg.actionKey(baseline));
  const second=candidates.filter(x=>x.key!==first.key).sort((x,y)=>y.joint-x.joint||x.key.localeCompare(y.key))[0];
  if(!second)throw Error('no alternative');
  function actual(a){const tr=d.applyTurn(st.branchState,st.openingState,st.hands[p],[],a);
   return +(d.actionsForHand(tr.branchState,tr.openingState,st.hands[n]).length===0);}
  const row={seed,turn:st.turns,focal:p,handSize:st.hands[p].length,nextSize:st.hands[n].length,
   otherSize:st.hands[o].length,unseenRestrictions:pool.filter(t=>hit.mem[n].has(key(t))||hit.mem[o].has(key(t))).length,
   baseline:{key:first.key,plain:first.plain,joint:first.joint,actual:actual(first.a)},
   alternative:{key:second.key,plain:second.plain,joint:second.joint,actual:actual(second.a)},
   invalidUniform:0,invalidConditional:0,metrics:Object.fromEntries(policies.map(x=>[x,{finishPP:0,pips:0,minusPP:0,blockPP:0}]))};
  for(let i=0;i<worlds;i++){
   const ws=(3700000000+(seed-start)*128+i)>>>0,world=sample(spec,hit.mem,ws),u=h.sampleWorld(spec,ws);
   row.invalidUniform+=!consistent(u,hit.mem);row.invalidConditional+=!consistent(world,hit.mem);
   for(const policy of policies){
    const a=late.forceThenContinue(world,first.key,policy,ws),z=late.forceThenContinue(world,second.key,policy,ws),m=row.metrics[policy];
    m.finishPP+=100*(z.first-a.first)/worlds;m.pips+=(z.pips-a.pips)/worlds;
    m.minusPP+=100*(z.minus-a.minus)/worlds;m.blockPP+=100*(z.block-a.block)/worlds;
   }
  }
  rows.push(row);
 }
 if(disc.unresolved)throw Error('unresolved discovery');
 const summarize=sub=>({positions:sub.length,uniformInvalid:ci(sub.map(x=>x.invalidUniform/worlds)),
  unseenRestrictions:ci(sub.map(x=>x.unseenRestrictions)),
  baselinePlainBrier:ci(sub.map(x=>(x.baseline.plain-x.baseline.actual)**2)),
  baselineJointBrier:ci(sub.map(x=>(x.baseline.joint-x.baseline.actual)**2)),
  alternativePlainBrier:ci(sub.map(x=>(x.alternative.plain-x.alternative.actual)**2)),
  alternativeJointBrier:ci(sub.map(x=>(x.alternative.joint-x.alternative.actual)**2)),
  baselineJointMinusPlainPassPP:ci(sub.map(x=>100*(x.baseline.joint-x.baseline.plain))),
  policies:Object.fromEntries(policies.map(p=>[p,Object.fromEntries(
   ['finishPP','pips','minusPP','blockPP'].map(k=>[k,ci(sub.map(x=>x.metrics[p][k]))]))]))});
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',
  day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-pass-conditioned-hidden-worlds/v1',timestampBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0, 3x9, provisional number-lock geometry',
  seedStart:start,seedEnd:start+count-1,uniqueDeals:count,discovery:disc,
  positions:rows.length,worldsPerPosition:worlds,conditionalAllocations:rows.length*worlds,
  uniformControlAllocations:rows.length*worlds,fullRoundContinuations:count,
  forcedCounterfactualContinuations:rows.length*worlds*2*policies.length,
  policies,strategies:['homogeneous max-pips discovery','min-hand-pips baseline','joint posterior max-next-pass alternative'],
  worldSeedFormula:'(3700000000+(dealSeed-seedStart)*128+worldIndex)>>>0',
  selection:'First constrained multi-choice state per deal; first limit positions; baseline min-pips, alternative maximizes joint next-pass probability',
  sampler:'Exact uniform conditional allocation of unseen tiles after both opponents no-stock passes, mandatory-next/mandatory-other/flexible; ignores earlier policy-choice likelihood',
  summary:{all:summarize(rows),next1:summarize(rows.filter(x=>x.nextSize===1)),
   next2:summarize(rows.filter(x=>x.nextSize===2)),next3plus:summarize(rows.filter(x=>x.nextSize>=3))},
  rows,limitations:'Selection biased; exploratory uncorrected position-cluster CI; correlated hidden worlds; authentic branch lock and block winner/loneZero/bust/101 match unresolved; finish-first != match win.',
  nextAction:'Fresh seeds >= '+(start+count)+': independently sample decision states for pass calibration; preregistered policy holdout and authenticate real four-branch opening.'};
}
function test(){
 const pool=[[0,0],[0,1],[0,2],[0,3]],fn=new Set(['0-0']),fo=new Set(['0-1']);
 for(let seed=0;seed<100;seed++){
  const x=allocate(pool,2,fn,fo,seed);
  if(x[0].length!==2||x[1].length!==2||!x[0].some(t=>key(t)==='0-1')||
     x[0].some(t=>key(t)==='0-0'))throw Error('allocation test');
 }
 let threw=false;try{allocate(pool,2,new Set(['0-0']),new Set(['0-0']),0);}catch(err){threw=true;}
 if(!threw)throw Error('contradiction not rejected');
 const a=run(1452440,80,8,3),z=run(1452440,80,8,3);
 delete a.timestampBaku;delete z.timestampBaku;
 if(JSON.stringify(a)!==JSON.stringify(z)||a.discovery.unresolved||
    a.forcedCounterfactualContinuations!==a.positions*12||
    a.rows.some(x=>x.invalidConditional))throw Error('replay/accounting');
 return{passed:true,allocationSeeds:100,positions:a.positions,forced:a.forcedCounterfactualContinuations};
}
if(require.main===module){
 const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():
  run(+(a[0]||1452440),+(a[1]||4000),+(a[2]||200),+(a[3]||12)),null,2));
}
module.exports={legal,pass,consistent,allocate,sample,run,test};
