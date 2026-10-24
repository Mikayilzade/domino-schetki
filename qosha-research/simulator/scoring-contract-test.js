'use strict';
// Contract tests: no unconfirmed block winner or 101-point match semantics inferred.
const e=require('./engine'), t=require('./turn-kernel'), d=require('./turn-dispatcher'), r=require('./round-driver');
function test(){
 const ok=(v,m)=>{if(!v)throw Error(m);};
 let assertions=0;
 const check=(v,m)=>{assertions++;ok(v,m);};
 for(let score=0;score<=100;score++)for(let delta of [-40,-30,-20,-10,0,1,6,12,24,48]){
  const value=e.applyScoreDelta(score,delta);
  check(value===Math.max(0,score+delta),'score floor '+score+'/'+delta);
 }
 for(let n=0;n<=4;n++){
  const doubles=Array.from({length:n},(_,i)=>[i,i]);
  check(e.finishMinus(doubles)===(n?-10*n:0),'minus classification '+n);
  const out=d.roundOutcome({hands:[[],[[1,2]],[[3,4]]],stock:[],consecutivePasses:3,lastPlayerIndex:0,
   lastTurnResult:{passed:false,finishDoubles:doubles},players:3});
  check(out.kind==='finish'&&out.playerIndex===0&&out.minus===(n?-10*n:0),'finish precedence '+n);
  check(out.remainders.join(',')==='0,3,7','finish remainders '+n);
 }
 for(const players of [3,5]){
  for(let passes=0;passes<=players+1;passes++){
   check(t.isBlocked({stock:[],consecutivePasses:passes,players})===(passes>=players),'empty stock pass threshold');
   check(!t.isBlocked({stock:[[0,0]],consecutivePasses:passes,players}),'stock prevents block');
  }
 }
 const base={branchState:e.createBranchState([1,1]),openingState:e.createOpeningState([1]),
  hands:[[[2,2]],[[3,3]],[[4,4]]],stock:[],currentPlayer:0,consecutivePasses:0,turns:0,outcome:null};
 let s=r.cloneRoundState(base);
 for(let i=0;i<2;i++){s=r.stepRound(s,()=>{throw Error('no move expected');});check(!s.outcome,'no premature block '+i);}
 s=r.stepRound(s,()=>{throw Error('no move expected');});
 check(s.outcome&&s.outcome.kind==='block','3 pass block');
 check(s.outcome.playerIndex===null,'block winner must be unresolved');
 check(s.outcome.remainders.join(',')==='4,6,8','block pips');
 const z={...base,hands:[[[0,0]],[[3,3]],[[4,4]]]};
 const zz=r.runRound(z,()=>{throw Error('no move expected');});
 check(zz.outcome.kind==='block'&&zz.outcome.remainders[0]===0&&zz.outcome.playerIndex===null,'0-0 cannot imply winner');
 check(e.applyScoreDelta(5,-40)===0&&e.applyScoreDelta(0,-10)===0,'minus score floor');
 return {passed:true,assertions,fixtures:{threePlayerBlock:1,fivePlayerPassThreshold:1,finishClasses:5,scoreFloorGrid:1010},
  unvalidated:['authentic four-branch locking','block winner allocation','loneZero=10','bust=101 and 101-point match victory']};
}
if(require.main===module)console.log(JSON.stringify(test()));
module.exports={test};
