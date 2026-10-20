'use strict';
// Reproducible late-stage double-versus-single paired-world crossfit.
// node qosha-research/simulator/late-double-crossfit.js [test|start count worlds cap]
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),choose=require('./strategy-runner').chooseBy;
const select=require('./joint-pass-memory-runner').select;
const sample=require('./pass-conditioned-world').sample;
const key=require('./decision-regret').actionKey;
const deck=e.createDoubleSixDeck(),profiles=['min-hand-pips','closed-branch-control'];
const variants=['a20-one','a28-one','a28-joint'];
const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
const mean=(a,k)=>a.length?avg(a.map(x=>x[k])):null;
const known=s=>{const used=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));return deck.filter(t=>!used.has(e.tileKey(t)));};
const playable=s=>deck.filter(t=>d.actionsForHand(s.branchState,s.openingState,[t]).length).map(e.tileKey);
function discover(start,count,cap){
 const found=[];let scanned=0,eligible=0,skipped=0,completed=0;
 for(let seed=start;seed<start+count&&found.length<cap;seed++){
  scanned++;let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')throw Error('init '+seed);
  const seat=seed%3,profile=profiles[seed%2],forbid=[new Set(),new Set(),new Set()];
  let captured=false;
  while(!s.outcome&&s.turns<200){
   const p=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
   if(opts.phase==='pass'&&!s.stock.length)for(const k of playable(s))forbid[p].add(k);
   let action=null;
   if(opts.phase==='play'){
    if(p===seat){
     const hand=s.hands[p],kn=known(s);
     // Fixed visible-state inclusion, never condition on which move wins.
     if(!captured&&s.turns>=12&&!s.stock.length&&hand.length>=2&&hand.length<=4&&
      hand.some(t=>t[0]===t[1])&&opts.actions.some(a=>a.type==='single')&&
      opts.actions.some(a=>a.type==='double-sequence')&&
      !opts.actions.some(a=>a.type==='mixed-finish')){
      eligible++;
      if(opts.actions.length<=18){
       const choices=Object.fromEntries(variants.map(v=>[v,key(select(opts,s,kn,forbid,v).action)]));
       found.push({seed,seat,profile,turn:s.turns,state:r.cloneRoundState(s),known:kn,
        forbid:forbid.map(x=>new Set(x)),actions:opts.actions,choices});
       captured=true;break;
      }else{skipped++;captured=true;}
     }
     action=select(opts,s,kn,forbid,'a28-one').action;
    }else action=choose(profile,opts,{seed,turns:s.turns,player:p});
   }
   s=r.stepRound(s,()=>action);
  }
  if(!captured&&!s.outcome)throw Error('discovery turn-limit');
  if(s.outcome)completed++;
 }
 return {found,scanned,eligible,skipped,completed};
}
function rollout(world,forced,policy,focal,seed){
 let first=true;
 const end=r.runRound(world,(opts,s)=>{
  if(first){first=false;const a=opts.actions.find(x=>key(x)===key(forced));
   if(!a)throw Error('missing forced action');return a;}
  return choose(policy,opts,{seed,turns:s.turns,player:s.currentPlayer});
 },{maxTurns:200});
 const o=end.outcome;
 if(!o||o.kind==='unresolved')throw Error('unresolved');
 return {first:+(o.kind==='finish'&&o.playerIndex===focal),
  pips:e.pipSum(end.hands[focal]),minus:+(o.kind==='finish'&&o.playerIndex===focal&&o.minus<0),
  minus10:+(o.kind==='finish'&&o.playerIndex===focal&&o.minus===-10),
  minus20:+(o.kind==='finish'&&o.playerIndex===focal&&o.minus===-20),
  minus30:+(o.kind==='finish'&&o.playerIndex===focal&&o.minus===-30),
  minus40:+(o.kind==='finish'&&o.playerIndex===focal&&o.minus===-40),
  block:+(o.kind==='block'),turns:end.turns-world.turns};
}
const fields=['first','pips','minus','minus10','minus20','minus30','minus40','block','turns'];
function score(arr){return Object.fromEntries(fields.map(k=>[k,mean(arr,k)]));}
function chooseBest(actions,metrics,kind){
 return actions.filter(a=>a.type===kind).sort((a,b)=>{
  const x=metrics[key(a)],y=metrics[key(b)];
  return y.first-x.first||x.pips-y.pips||key(a).localeCompare(key(b));
 })[0];
}
function interval(rows,field){
 const vals=rows.map(x=>x[field]),m=avg(vals);
 if(vals.length<2)return [m,m];
 const sd=Math.sqrt(vals.reduce((s,x)=>s+(x-m)**2,0)/(vals.length-1));
 return [m-1.96*sd/Math.sqrt(vals.length),m+1.96*sd/Math.sqrt(vals.length)];
}
function run(start=1303600,count=300,worlds=24,cap=28){
 if(![start,count,worlds,cap].every(Number.isInteger)||count<1||worlds<4||worlds%2||cap<1)throw Error('args');
 const discovery=discover(start,count,cap);
 const out={schema:'qosa-late-double-crossfit/v1',engine:'qosa-research-0.5.3',
  rules:'qosa-1.0.0',mode:'3x9',seedRange:[start,start+discovery.scanned-1],
  requestedDeals:count,scannedDeals:discovery.scanned,eligibleStates:discovery.eligible,
  actionCapSkips:discovery.skipped,selectedPositions:discovery.found.length,
  worldsPerPosition:worlds,trainWorlds:worlds/2,testWorlds:worlds/2,
  policies:profiles,variants,forcedContinuations:0,unresolved:0,
  selection:'First focal state >=12 turns, 2..4 hand stones, double+single legal, no mixed finish, no stock; seed%3 focal seat; seed%2 discovery opponent profile; a28-one discovery trajectory.',
  assumptions:'Branch-number opening provisional; uniform unseen allocation conditional on hand counts and both opponents no-stock passes. All actions compared on identical worlds; train/test world indices disjoint.',
  limitations:'Selected late-double states are not representative of all turns; deterministic bots; first finisher not full match winner; block winner unspecified; 12 holdout worlds/position noisy; exploratory unadjusted seed-cluster CI.',
  results:{},examples:[]};
 for(const policy of profiles){
  const rows=[],examples=[];
  for(const p of discovery.found){
   const vals=Object.fromEntries(p.actions.map(a=>[key(a),{train:[],test:[]}]));
   const unique=new Set(p.actions.map(key));if(unique.size!==p.actions.length)throw Error('duplicate actions');
   for(let i=0;i<worlds;i++){
    const seed=e.mixSeed32((p.seed^Math.imul(p.turn+1,0x9e3779b9)^
     Math.imul(p.seat+1,0x85ebca6b)^Math.imul(i+1,0xc2b2ae35))>>>0);
    const world=sample(p.state,p.seat,p.known,p.forbid,seed);
    for(const a of p.actions){
     vals[key(a)][i<worlds/2?'train':'test'].push(rollout(world,a,policy,p.seat,seed));
     out.forcedContinuations++;
    }
   }
   const train=Object.fromEntries(p.actions.map(a=>[key(a),score(vals[key(a)].train)]));
   const test=Object.fromEntries(p.actions.map(a=>[key(a),score(vals[key(a)].test)]));
   const bestD=chooseBest(p.actions,train,'double-sequence'),bestS=chooseBest(p.actions,train,'single');
   const D=test[key(bestD)],S=test[key(bestS)];
   const chosen=Object.fromEntries(variants.map(v=>[v,test[p.choices[v]]]));
   const row={seed:p.seed,seat:p.seat,turn:p.turn,profile:p.profile,
    hand:p.state.hands[p.seat].map(e.tileKey),ends:Object.fromEntries(e.SIDES.map(x=>[x,p.state.branchState.branches[x].end])),
    opened:[...p.state.openingState.openedNumbers].sort(),opponentSizes:[p.state.hands[(p.seat+1)%3].length,p.state.hands[(p.seat+2)%3].length],
    actions:p.actions.length,doubleAction:key(bestD),singleAction:key(bestS),
    doubleNumbers:bestD.numbers,deltaDoubleFirst:D.first-S.first,deltaDoublePips:D.pips-S.pips,
    deltaDoubleMinus:D.minus-S.minus,deltaDoubleBlock:D.block-S.block,
    deltaDoubleTurns:D.turns-S.turns,
    delta28First:chosen['a28-one'].first-chosen['a20-one'].first,
    deltaJointFirst:chosen['a28-joint'].first-chosen['a28-one'].first,
    changed28:+(p.choices['a28-one']!==p.choices['a20-one']),
    changedJoint:+(p.choices['a28-joint']!==p.choices['a28-one']),
    doubleTest:D,singleTest:S,choices:p.choices};
   rows.push(row);
   if(examples.length<5)examples.push(row);
  }
  const byNumber={};
  for(const row of rows)for(const n of row.doubleNumbers){
   const k=String(n);if(!byNumber[k])byNumber[k]=[];
   byNumber[k].push(row.deltaDoubleFirst);
  }
  out.results[policy]={positions:rows.length,actionsEvaluated:rows.reduce((s,x)=>s+x.actions,0),
   meanLegalActions:rows.length?avg(rows.map(x=>x.actions)):null,
   doubleMinusSingleFirst:rows.length?mean(rows,'deltaDoubleFirst'):null,
   doubleMinusSingleFirstCI95:rows.length?interval(rows,'deltaDoubleFirst'):null,
   doubleMinusSinglePips:rows.length?mean(rows,'deltaDoublePips'):null,
   doubleMinusSingleMinus:rows.length?mean(rows,'deltaDoubleMinus'):null,
   doubleMinusSingleBlock:rows.length?mean(rows,'deltaDoubleBlock'):null,
   doubleMinusSingleTurns:rows.length?mean(rows,'deltaDoubleTurns'):null,
   doubleBetter:rows.filter(x=>x.deltaDoubleFirst>0).length,
   singleBetter:rows.filter(x=>x.deltaDoubleFirst<0).length,
   equal:rows.filter(x=>x.deltaDoubleFirst===0).length,
   changed28:rows.reduce((s,x)=>s+x.changed28,0),
   changedJoint:rows.reduce((s,x)=>s+x.changedJoint,0),
   alpha28Minus20First:rows.length?mean(rows,'delta28First'):null,
   jointMinusOneFirst:rows.length?mean(rows,'deltaJointFirst'):null,
   byDoubleNumber:Object.fromEntries(Object.entries(byNumber).map(([k,v])=>[k,{n:v.length,meanDeltaFirst:avg(v)}])),
   heldoutMinusRates:{double:rows.length?avg(rows.map(x=>x.doubleTest.minus)):null,
    single:rows.length?avg(rows.map(x=>x.singleTest.minus)):null},
   examples};
 }
 return out;
}
function test(){
 const a=run(1303600,10,4,3),b=run(1303600,10,4,3);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.unresolved)throw Error('determinism');
 const expected=Object.values(a.results).reduce((s,x)=>s+x.actionsEvaluated*a.worldsPerPosition,0);
 if(a.forcedContinuations!==expected)throw Error('continuation accounting');
 return {passed:true,selected:a.selectedPositions,forced:a.forcedContinuations};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1303600),+(a[1]||300),+(a[2]||24),+(a[3]||28)),null,2));
}
module.exports={discover,run,test};
