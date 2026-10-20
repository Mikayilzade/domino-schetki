'use strict';
// Deterministic paired hidden-world regret at policy-disagreement states.
// CLI: node qosha-research/simulator/pass-disagreement-regret-runner.js [test|start count worlds cap]
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),init=require('./initializer');
const choose=require('./strategy-runner').chooseBy,select=require('./joint-pass-memory-runner').select;
const key=require('./decision-regret').actionKey,sample=require('./pass-conditioned-world').sample;
const deck=e.createDoubleSixDeck(),profiles=['min-hand-pips','closed-branch-control'],groups=['alpha28-vs20','joint-vs-one'];
const avg=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
const known=s=>{const used=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));return deck.filter(t=>!used.has(e.tileKey(t)));};
const playable=s=>deck.filter(t=>d.actionsForHand(s.branchState,s.openingState,[t]).length).map(e.tileKey);
function discover(start,count,cap){
 const found=Object.fromEntries(groups.map(g=>[g,[]])),disagreements={alpha28:0,joint:0};
 let scanned=0,choices=0;
 for(let seed=start;seed<start+count;seed++){
  scanned++;const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('init');
  for(const profile of profiles)for(let seat=0;seat<3;seat++){
   let s=r.cloneRoundState(base),forbid=[new Set(),new Set(),new Set()],captured={};
   while(!s.outcome&&s.turns<200){
    const p=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
    if(opts.phase==='pass'&&!s.stock.length)for(const k of playable(s))forbid[p].add(k);
    let move=null;
    if(opts.phase==='play'){
     if(p!==seat)move=choose(profile,opts);
     else{
      const kn=known(s),a20=select(opts,s,kn,forbid,'a20-one').action;
      const a28=select(opts,s,kn,forbid,'a28-one').action;
      const joint=select(opts,s,kn,forbid,'a28-joint').action;
      move=a28;
      if(opts.actions.length>1){
       choices++;const da=key(a20)!==key(a28),dj=key(joint)!==key(a28);
       if(da)disagreements.alpha28++;if(dj)disagreements.joint++;
       for(const [g,ok,c,t] of [[groups[0],da,a20,a28],[groups[1],dj,a28,joint]])
        if(ok&&!captured[g]&&found[g].length<cap){
         found[g].push({seed,profile,seat,turn:s.turns,state:r.cloneRoundState(s),
          known:kn,forbid:forbid.map(x=>new Set(x)),c,t});captured[g]=true;
        }
      }
     }
    }
    s=r.stepRound(s,()=>move);
   }
   if(!s.outcome)throw Error('discovery unresolved');
  }
  if(groups.every(g=>found[g].length>=cap))break;
 }
 return {found,disagreements,scanned,choices};
}
function rollout(world,forced,policy,focal,seed){
 let first=true;
 const end=r.runRound(world,(opts,s)=>{
  if(first){first=false;const a=opts.actions.find(x=>key(x)===key(forced));if(!a)throw Error('candidate');return a;}
  return choose(policy,opts,{seed,turns:s.turns,player:s.currentPlayer});
 },{maxTurns:200});
 const o=end.outcome;if(!o||o.kind==='unresolved')throw Error('unresolved');
 return {first:+(o.kind==='finish'&&o.playerIndex===focal),pips:e.pipSum(end.hands[focal]),
  minus:+(o.kind==='finish'&&o.playerIndex===focal&&o.minus<0),block:+(o.kind==='block')};
}
function run(start=1303100,count=150,worlds=20,cap=40){
 const x=discover(start,count,cap),out={schema:'qosa-pass-disagreement-regret/v1',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',seedRange:[start,start+count-1],
  scannedDeals:x.scanned,discoveryCompleteRounds:x.scanned*6,decisionChoices:x.choices,
  disagreements:x.disagreements,worldsPerPosition:worlds,results:{},
  assumptions:'Uniform hidden worlds conditional on both no-stock pass histories and exact hand sizes; first disagreement per trajectory; same continuation policy.',
  limitations:'Provisional branch rules, bot-dependent, selected positions, block winner unassigned; finish-first not match win.'};
 for(const g of groups){
  out.results[g]={};
  for(const policy of profiles){
   const rows=[];
   for(const p of x.found[g]){
    const diff=[];
    for(let i=0;i<worlds;i++){
     const seed=e.mixSeed32((p.seed ^ Math.imul(p.turn+1,0x9e3779b9) ^ Math.imul(p.seat+1,0x85ebca6b) ^ Math.imul(i+1,0xc2b2ae35))>>>0);
     const w=sample(p.state,p.seat,p.known,p.forbid,seed);
     const a=rollout(w,p.c,policy,p.seat,seed),b=rollout(w,p.t,policy,p.seat,seed);
     diff.push({first:b.first-a.first,pips:b.pips-a.pips,minus:b.minus-a.minus,block:b.block-a.block});
    }
    rows.push({seed:p.seed,turn:p.turn,seat:p.seat,profile:p.profile,control:key(p.c),treatment:key(p.t),
     finish:avg(diff.map(v=>v.first)),pips:avg(diff.map(v=>v.pips)),
     minus:avg(diff.map(v=>v.minus)),block:avg(diff.map(v=>v.block))});
   }
   const clusters=new Map();
   for(const row of rows){if(!clusters.has(row.seed))clusters.set(row.seed,[]);clusters.get(row.seed).push(row.finish);}
   const vals=[...clusters.values()].map(avg),mu=vals.length?avg(vals):null;
   const sd=vals.length>1?Math.sqrt(vals.reduce((s,v)=>s+(v-mu)**2,0)/(vals.length-1)):null;
   const ci=sd===null?null:1.96*sd/Math.sqrt(vals.length);
   out.results[g][policy]={positions:rows.length,uniqueSeeds:vals.length,
    pairedWorlds:rows.length*worlds,forcedContinuations:rows.length*worlds*2,
    deltaFinish:rows.length?avg(rows.map(v=>v.finish)):null,
    clusterDeltaFinish:mu,exploratoryCI95:ci===null?null:[mu-ci,mu+ci],
    deltaPips:rows.length?avg(rows.map(v=>v.pips)):null,
    deltaMinus:rows.length?avg(rows.map(v=>v.minus)):null,
    deltaBlock:rows.length?avg(rows.map(v=>v.block)):null,
    better:rows.filter(v=>v.finish>0).length,tied:rows.filter(v=>v.finish===0).length,
    worse:rows.filter(v=>v.finish<0).length,examples:rows.slice(0,4)};
  }
 }
 return out;
}
function test(){
 const a=run(1303100,3,2,2),b=run(1303100,3,2,2);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.discoveryCompleteRounds!==a.scannedDeals*6)throw Error('determinism/count');
 return {passed:true,scanned:a.scannedDeals};
}
if(require.main===module){
 const args=process.argv.slice(2);
 console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||1303100),+(args[1]||150),+(args[2]||20),+(args[3]||40)),null,2));
}
module.exports={discover,run,test};
