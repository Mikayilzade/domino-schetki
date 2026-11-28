'use strict';
// Sibling transition isolation: candidate counterfactuals must not mutate parent or earlier child.
const e=require('./engine'),i=require('./initializer'),d=require('./round-driver'),t=require('./turn-dispatcher');
function run(){
 let seed=28110000,accepted=0,redeals=0,turns=0,checks=0,branches=0,blocks=0;
 const minus={};
 const snap=s=>JSON.stringify(s,(_,v)=>v instanceof Set?[...v].sort():v);
 function check(x,msg){checks++;if(!x)throw Error(msg)}
 while(accepted<200){
  const id=seed++;let s=i.initializeThreePlayerRound({seed:id,isFirstRound:true});
  if(s.kind==='redeal'){redeals++;continue}
  accepted++;
  while(!s.outcome){
   const before=snap(s);
   const opts=t.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
   const actions=opts.phase==='play'?opts.actions:[null];
   const pick=e.mixSeed32(id^s.turns)%actions.length;
   const next=d.stepRound(s,()=>actions[pick]);
   check(snap(s)===before,'input mutation');
   const expected=snap(next);
   for(const a of actions){
    const sibling=d.stepRound(s,()=>a);branches++;
    check(snap(s)===before,'sibling mutated parent');
    check(snap(next)===expected,'sibling mutated earlier child');
    check(snap(d.stepRound(s,()=>a))===snap(sibling),'nonrepeatable transition');
   }
   s=next;turns++;check(s.turns<=200,'turn cap');
  }
  if(s.outcome.kind==='block')blocks++;else minus[s.outcome.minus]=(minus[s.outcome.minus]||0)+1;
 }
 return {accepted,redeals,seedStart:28110000,seedEnd:seed-1,turns,checks,branches,blocks,minus};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
