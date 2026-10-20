'use strict';
// Canonical, fixed-visible one-vs-joint pass disagreement experiment.
// Run: node qosha-research/simulator/pass-disagreement-canonical.js test
// Run: node qosha-research/simulator/pass-disagreement-canonical.js 1308928 1309528 24 24 20
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),init=require('./initializer');
const {posterior}=require('./joint-pass-memory-runner');
const {sample}=require('./pass-conditioned-sampler');
const {actionKey}=require('./decision-regret');
const {signature,chooseCanonical}=require('../runs/2026-10-20-2352-canonical-geometry');
const deck=e.createDoubleSixDeck(),key=e.tileKey;
const policies=['min-hand-pips','closed-branch-control'];
const played=a=>a.type==='single'?[a.tile]:(a.tiles||[]);
const playable=(b,o)=>new Set(deck.filter(t=>d.actionsForHand(b,o,[t]).length).map(key));
function selectCanonical(opts,s,known,forbidden,alpha,mode){
 if(opts.actions.length===1)return opts.actions[0];
 if(s.stock.length)throw Error('stock must be empty');
 const p=s.currentPlayer,n=(p+1)%3,o=(p+2)%3;
 const used=new Set([...known,...s.hands[p]].map(key));
 const unseen=deck.filter(t=>!used.has(key(t)));
 if(unseen.length!==s.hands[n].length+s.hands[o].length)throw Error('hidden count mismatch');
 const scored=opts.actions.map(a=>{
  const pips=e.pipSum(played(a));
  if(played(a).length===s.hands[p].length)return{a,pips,score:Infinity,sig:signature(s,a)};
  const tr=d.applyTurn(s.branchState,s.openingState,s.hands[p],s.stock,a);
  const probability=posterior(unseen,s.hands[n].length,forbidden[n],forbidden[o],
   playable(tr.branchState,tr.openingState),mode);
  return{a,pips,score:pips+alpha*probability,sig:signature(s,a)};
 });
 scored.sort((a,b)=>b.score-a.score||b.pips-a.pips||a.sig.localeCompare(b.sig)||actionKey(a.a).localeCompare(actionKey(b.a)));
 return scored[0].a;
}
function collect(start,end,limit,alpha){
 const positions=[];let scanned=0,passEvents=0,rawDisagreements=0,symmetricDisagreements=0;
 for(let seed=start;seed<end&&positions.length<limit;seed++){
  scanned++;let found=null;
  for(let seat=0;seat<3&&!found;seat++){
   let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(s.kind!=='ready')throw Error('initializer '+seed);
   const live=new Set(s.hands.flat().map(key)),known=deck.filter(t=>!live.has(key(t)));
   const forbidden=[new Set(),new Set(),new Set()];
   while(!s.outcome&&s.turns<200){
    const p=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
    if(opts.phase==='pass'){
     for(const z of playable(s.branchState,s.openingState))forbidden[p].add(z);
     passEvents++;
    }
    let action=null;
    if(opts.phase==='play'){
     if(p===seat){
      const one=selectCanonical(opts,s,known,forbidden,alpha,'one');
      const joint=selectCanonical(opts,s,known,forbidden,alpha,'joint');
      if(actionKey(one)!==actionKey(joint)){
       rawDisagreements++;
       if(signature(s,one)===signature(s,joint))symmetricDisagreements++;
       else{
        found={seed,seat,turn:s.turns,state:r.cloneRoundState(s),known:known.slice(),
         forbidden:forbidden.map(x=>new Set(x)),oneKey:actionKey(one),jointKey:actionKey(joint),
         oneType:one.type,jointType:joint.type,onePips:e.pipSum(played(one)),jointPips:e.pipSum(played(joint)),
         oneOpenings:(one.numbers||[]).length,jointOpenings:(joint.numbers||[]).length,
         handSizes:s.hands.map(h=>h.length),forbiddenSizes:forbidden.map(x=>x.size)};
       }
      }
      action=one;
     }else action=chooseCanonical('min-hand-pips',opts,s);
    }
    s=r.stepRound(s,()=>action);
    if(action)known.push(...played(action));
    if(found)break;
   }
  }
  if(found)positions.push(found);
 }
 return{scanned,passEvents,rawDisagreements,symmetricDisagreements,positions};
}
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function stats(a){
 if(!a.length)return{n:0};
 const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):null;
 return{n:a.length,mean:m,ci95:sd===null?null:[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)],
  positive:a.filter(x=>x>0).length,negative:a.filter(x=>x<0).length,ties:a.filter(x=>x===0).length};
}
function evaluate(world,position,policy){
 const opts=d.turnOptions(world.branchState,world.openingState,world.hands[world.currentPlayer],world.stock);
 const groups=new Map(),byKey=new Map();
 for(const a of opts.actions){const sig=signature(world,a),k=actionKey(a);
  if(!groups.has(sig))groups.set(sig,a);byKey.set(k,sig);}
 const out=new Map();
 for(const [sig,a] of groups){
  let first=true;
  const final=r.runRound(world,(options,s)=>{
   if(first){first=false;const hit=options.actions.find(x=>actionKey(x)===actionKey(a));
    if(!hit)throw Error('candidate missing');return hit;}
   return chooseCanonical(policy,options,s);
  },{maxTurns:200});
  if(final.outcome.kind==='unresolved')throw Error('unresolved rollout');
  const o=final.outcome;
  out.set(sig,{win:+(o.kind==='finish'&&o.playerIndex===position.seat),
   pips:e.pipSum(final.hands[position.seat]),
   minus:+(o.kind==='finish'&&o.playerIndex===position.seat&&o.minus<0),
   block:+(o.kind==='block'),turns:final.turns});
 }
 return{values:out,byKey,continuations:groups.size,rawActions:opts.actions.length};
}
function run(start=1308928,end=1309528,limit=24,worlds=24,alpha=20){
 if(!Number.isInteger(start)||!Number.isInteger(end)||end<=start||limit<1||worlds<2||![20,28,36].includes(alpha))throw Error('bad args');
 const found=collect(start,end,limit,alpha),rows=[];let continuations=0,unresolved=0,rawActions=0;
 for(const p of found.positions){
  const row={seed:p.seed,seat:p.seat,turn:p.turn,handSizes:p.handSizes,forbiddenSizes:p.forbiddenSizes,
   one:p.oneKey,joint:p.jointKey,oneType:p.oneType,jointType:p.jointType,
   onePips:p.onePips,jointPips:p.jointPips,oneOpenings:p.oneOpenings,jointOpenings:p.jointOpenings,policies:{}};
  for(const policy of policies){
   const sums={win:0,pips:0,minus:0,block:0,turns:0,oneRegret:0,jointRegret:0};
   for(let j=0;j<worlds;j++){
    const seed=e.mixSeed32((p.seed+Math.imul(j+1,0x9e3779b9))>>>0);
    const world=sample(p.state,p.known,p.forbidden,seed);
    const ev=evaluate(world,p,policy);continuations+=ev.continuations;rawActions+=ev.rawActions;
    const a=ev.values.get(ev.byKey.get(p.oneKey)),b=ev.values.get(ev.byKey.get(p.jointKey));
    if(!a||!b)throw Error('selected candidate missing');
    for(const k of ['win','pips','minus','block','turns'])sums[k]+=b[k]-a[k];
    const best=Math.max(...[...ev.values.values()].map(x=>x.win));
    sums.oneRegret+=best-a.win;sums.jointRegret+=best-b.win;
   }
   row.policies[policy]=Object.fromEntries(Object.entries(sums).map(([k,v])=>[k,v/worlds]));
  }
  rows.push(row);
 }
 const summary=Object.fromEntries(policies.map(policy=>[policy,Object.fromEntries(
  ['win','pips','minus','block','turns','oneRegret','jointRegret'].map(k=>[k,stats(rows.map(x=>x.policies[policy][k]))]))]));
 return{schema:'qosa-canonical-pass-disagreement/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  seedStart:start,seedEndExclusive:end,scanned:found.scanned,positions:rows.length,worlds,alpha,
  hiddenAllocations:rows.length*worlds,candidateContinuations:continuations,rawActionOpportunities:rawActions,
  unresolved,passEvents:found.passEvents,rawDisagreements:found.rawDisagreements,
  symmetricDisagreements:found.symmetricDisagreements,policies,summary,rows,
  limitations:'First non-equivalent disagreement per seed; selection not population-representative. Uniform pass-conditioned worlds without opponent-choice likelihood, provisional branch rules, fixed canonical bots, block winner unassigned, first finish not match win; exploratory position-cluster intervals.'};
}
function test(){
 const f=collect(1308928,1309028,2,20);
 if(f.scanned<1)throw Error('no seeds scanned');
 const s=init.initializeThreePlayerRound({seed:1308928,isFirstRound:false,previousWinnerIndex:0});
 const opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
 const known=deck.filter(t=>!new Set(s.hands.flat().map(key)).has(key(t))),forbidden=[new Set(),new Set(),new Set()];
 if(opts.phase==='play'){
  for(const mode of ['one','joint']){const a=selectCanonical(opts,s,known,forbidden,20,mode);
   if(!opts.actions.some(x=>actionKey(x)===actionKey(a)))throw Error('illegal canonical selection');}
 }
 const a=run(1308928,1308980,2,2,20),b=run(1308928,1308980,2,2,20);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.unresolved||a.candidateContinuations<0)throw Error('replay');
 return{passed:true,positions:a.positions,scanned:a.scanned,continuations:a.candidateContinuations};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1308928),+(a[1]||1309528),
  +(a[2]||24),+(a[3]||24),+(a[4]||20)),null,2));
}
module.exports={selectCanonical,collect,run,test};
