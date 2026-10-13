'use strict';
// Reproduce: node qosha-research/simulator/consecutive-pass-forecast-runner.js 2930000 2940000 40 120
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),hw=require('./hidden-world'),post=require('./observed-pass-posterior');
const {chooseBy}=require('./strategy-runner'),{actionKey}=require('./decision-regret');
const check=(x,m)=>{if(!x)throw Error(m);};
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function passProb(n,k,h){
 check([n,k,h].every(Number.isInteger)&&n>=0&&k>=0&&h>=0&&k<=n&&h<=n,'bad hypergeometric arguments');
 let p=1;for(let i=0;i<h;i++){if(n-k-i<=0)return 0;p*=(n-k-i)/(n-i);}return p;
}
function capture(seed){
 let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
 if(s.kind!=='ready')return null;
 const known=[[1,1]];if(s.openingFollowup)known.push(s.openingFollowup.tile);
 let passes=[];
 while(!s.outcome&&s.turns<100){
  const p=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
  if(passes.length===2&&opts.phase==='play'&&opts.actions.length>=2&&opts.actions.length<=10){
   const visible=r.cloneRoundState(s);visible.hands=visible.hands.map((h,i)=>i===p?h:[]);
   const spec={focalPlayer:p,focalHand:s.hands[p].map(t=>t.slice()),knownTiles:known.map(t=>t.slice()),
    hiddenHandSizes:s.hands.map(h=>h.length),stockSize:0,visibleState:visible};
   const [a,b]=passes;
   check(s.consecutivePasses===2&&a.turn+1===b.turn&&b.turn+1===s.turns,'nonconsecutive passes');
   const evidence={passObserved:true,snapshotVerified:true,fullTurnLogVerified:true};
   const make=(z,eventsSincePass)=>({kind:'observed-pass',playerIndex:z.playerIndex,turn:z.turn,
    handSizeAtPass:z.handSize,stockSizeAtPass:0,branchState:z.branchState,openingState:z.openingState,
    evidence,eventsSincePass});
   const obs=[make(a,[{turn:b.turn,playerIndex:b.playerIndex,drawn:0,played:0,type:'pass'}]),make(b,[])];
   obs.forEach(o=>post.validatePass(spec,o));
   const pool=hw.hiddenPool(spec);
   check(pool.every(t=>d.actionsForHand(s.branchState,s.openingState,[t]).length===0),
    'two-pass known-tile invariant failed');
   return{seed,turn:s.turns,spec,obs,pool,actions:opts.actions};
  }
  const before=s;let chosen=null;
  s=r.stepRound(s,(options,state)=>{
   chosen=chooseBy('min-hand-pips',options,{seed,turns:state.turns,player:state.currentPlayer});
   return chosen;
  });
  if(chosen)known.push(...(chosen.tiles||[chosen.tile]));
  if(opts.phase==='pass'&&before.stock.length===0){
   passes.push({turn:before.turns,playerIndex:p,handSize:before.hands[p].length,
    branchState:e.cloneBranchState(before.branchState),openingState:e.cloneOpeningState(before.openingState)});
   if(passes.length>2)passes.shift();
  }else passes=[];
 }
 return null;
}
function analyze(pos,count){
 const {spec,pool}=pos,original=JSON.stringify(spec.visibleState);
 const worldSeedStart=(700000000+Math.imul(pos.seed,263))>>>0;
 const worlds=Array.from({length:count},(_,i)=>hw.sampleWorld(spec,(worldSeedStart+i)>>>0));
 check(post.filterWorlds(spec,pos.obs,worlds).accepted===count,'both-pass posterior changed');
 check(post.filterWorlds(spec,[pos.obs[1]],worlds).accepted===count,'last-pass posterior changed');
 const next=(spec.focalPlayer+1)%3,h=spec.hiddenHandSizes[next],n=pool.length;
 const rows=pos.actions.map(a=>{
  const tr=d.applyTurn(spec.visibleState.branchState,spec.visibleState.openingState,spec.focalHand,[],a);
  const finish=tr.hand.length===0,key=actionKey(a),pips=e.pipSum(a.tiles||[a.tile]);
  if(finish)return{key,type:a.type,finish,pips,k:null,exactPass:null,sampledPass:null};
  const k=pool.filter(t=>d.actionsForHand(tr.branchState,tr.openingState,[t]).length>0).length;
  const sampled=mean(worlds.map(w=>+(d.actionsForHand(tr.branchState,tr.openingState,w.hands[next]).length===0)));
  return{key,type:a.type,finish,pips,k,exactPass:passProb(n,k,h),sampledPass:sampled};
 });
 const nonterminal=rows.filter(x=>!x.finish),policy={};
 for(const name of ['closed-branch-control','min-hand-pips']){
  const choice=chooseBy(name,{actions:pos.actions,hand:spec.focalHand},{seed:pos.seed,turns:pos.turn,player:spec.focalPlayer});
  const selected=rows.find(x=>x.key===actionKey(choice));
  policy[name]={key:selected.key,finish:selected.finish,pass:selected.exactPass,
   regret:selected.finish||!nonterminal.length?null:Math.max(...nonterminal.map(x=>x.exactPass))-selected.exactPass};
 }
 check(JSON.stringify(spec.visibleState)===original,'visible state mutated');
 return{seed:pos.seed,turn:pos.turn,handSizes:spec.hiddenHandSizes,knownTiles:spec.knownTiles.length,
  focal:spec.focalPlayer,passers:pos.obs.map(o=>o.playerIndex),worldSeedStart,
  unknown:n,nextHand:h,actions:rows,policy,
  safe:nonterminal.filter(x=>x.k===0).length,risky:nonterminal.filter(x=>x.k>0).length,
  terminal:rows.length-nonterminal.length,
  forecastChecks:nonterminal.length*count};
}
function run(start=2930000,end=2940000,limit=40,count=120){
 check([start,end,limit,count].every(Number.isInteger)&&end>start&&limit>0&&count>=10,'bad args');
 const rows=[];let scanned=0;
 for(let seed=start;seed<end&&rows.length<limit;seed++){
  scanned++;const p=capture(seed);if(p)rows.push(analyze(p,count));
 }
 const candidates=rows.flatMap(x=>x.actions.filter(a=>!a.finish));
 const policy=Object.fromEntries(['closed-branch-control','min-hand-pips'].map(name=>[name,{
  selectedSafe:rows.filter(x=>!x.policy[name].finish&&x.policy[name].pass===1).length,
  selectedTerminal:rows.filter(x=>x.policy[name].finish).length,
  meanPass:mean(rows.map(x=>x.policy[name].pass).filter(x=>x!==null)),
  meanRegret:mean(rows.map(x=>x.policy[name].regret).filter(x=>x!==null))
 }]));
 return{schema:'qosa-consecutive-pass-exact-forecast/v1',engine:'qosa-research-0.5.3',
  rules:'qosa-1.0.0',mode:'3x9',start,end,limit,count,scannedDeals:scanned,
  positions:rows.length,selectedSeeds:rows.map(x=>x.seed),worlds:rows.length*count,
  forecastChecks:rows.reduce((s,x)=>s+x.forecastChecks,0),
  newFullStrategyRounds:0,verifiedPriorFullStrategyRounds:180000,
  hiddenSeedFormula:'(700000000 + Math.imul(dealSeed,263) + worldIndex) >>> 0',
  summary:{allPassCompatible:rows.length*count,nonterminal:candidates.length,
   safeActions:candidates.filter(a=>a.k===0).length,
   safeAndRiskyPositions:rows.filter(x=>x.safe&&x.risky).length,
   meanAbsSampleError:mean(candidates.map(a=>Math.abs(a.sampledPass-a.exactPass))),
   policy},rows,
  limitations:'Only two consecutive passes on unchanged board with complete known tile history and empty stock. Uniform allocation, assumption-labelled branch semantics, min-pips first-eligible discovery; no first-place benefit inferred.',
  next:'Independent matched-world finish-first comparison of K=0-aware moves versus baseline; replay nonconsecutive pass histories.'};
}
function test(){
 const a=run(2920000,2921000,3,30),b=run(2920000,2921000,3,30);
 check(a.positions===3&&JSON.stringify(a.rows)===JSON.stringify(b.rows),'determinism');
 check(a.summary.allPassCompatible===90,'posterior');
 check(passProb(16,0,8)===1&&passProb(16,16,8)===0,'hypergeometric endpoints');
 const p=capture(a.selectedSeeds[0]);let rejected=false;
 try{post.validatePass(p.spec,{...p.obs[0],eventsSincePass:[]});}catch{rejected=true;}
 check(rejected,'incomplete log accepted');
 return{passed:true,seeds:a.selectedSeeds,worlds:a.worlds};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2930000),+(a[1]||2940000),+(a[2]||40),+(a[3]||120)),null,2));
}
module.exports={capture,analyze,run,test,passProb};