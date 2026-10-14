'use strict';
// Fresh matched-K exception audit. Replays positions and hidden worlds from explicit seed ranges.
// Usage: node qosha-research/simulator/independent-exception-runner.js test
//        node qosha-research/simulator/independent-exception-runner.js 4300000 4350000 20 20
const base = require('./matched-k-outcome-runner');
const POLICIES = ['closed-branch-control','min-hand-pips','fast-doubles'];
function run(start=4300000,end=4350000,limit=20,worlds=20) {
  const result = base.run(start,end,limit,worlds,POLICIES,'closed-branch-control');
  const exceptions = result.positions.filter(p => POLICIES.filter(name => p.metrics[name].win < 0).length >= 2);
  const signs = Object.fromEntries(POLICIES.map(name => [name,{
    singleBetter:result.positions.filter(p=>p.metrics[name].win>0).length,
    doubleBetter:result.positions.filter(p=>p.metrics[name].win<0).length,
    tied:result.positions.filter(p=>p.metrics[name].win===0).length
  }]));
  if(result.global.worlds !== result.selectedPositions*worlds ||
     result.global.continuations !== result.global.worlds*2*POLICIES.length ||
     result.global.singleRestricts+result.global.doubleRestricts+result.global.equal !== result.global.worlds)
    throw Error('paired-world invariants failed');
  return {...result,schema:'qosa-independent-exception-audit/v1',
    policyPositionSigns:signs,
    exceptionSeeds:exceptions.map(p=>({seed:p.seed,turn:p.turn,pair:p.pair,
      singleMinusDoubleFinish:Object.fromEntries(POLICIES.map(name=>[name,p.metrics[name].win]))})),
    note:'Fresh discovery. Historical Oct 14 18:23 CSV lacks exact forced actions and visible state; it cannot be replayed exactly from seed/turn alone.'};
}
function test() {
  const a=run(4300107,4300108,1,3), b=run(4300107,4300108,1,3);
  if(JSON.stringify(a)!==JSON.stringify(b)||a.selectedPositions!==1||
     a.positions[0].turn!==11||
     a.positions[0].pair.single!=='single|up|5||3-5'||
     a.positions[0].pair.double!=='double-sequence|||4|4-4'||
     a.global.worlds!==3||a.global.continuations!==18)throw Error('deterministic replay failed');
  return {passed:true,seed:4300107,worlds:3,continuations:18};
}
module.exports={POLICIES,run,test};
if(require.main===module){
  const args=process.argv.slice(2);
  console.log(JSON.stringify(args[0]==='test'?test():run(
    Number(args[0]||4300000),Number(args[1]||4350000),
    Number(args[2]||20),Number(args[3]||20)),null,2));
}
