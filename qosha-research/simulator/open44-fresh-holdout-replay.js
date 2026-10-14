'use strict';
// Replay fresh opening-4-4 holdout recorded 2026-10-14 23:50 Asia/Baku.
const base=require('./matched-k-outcome-runner');
const policies=['closed-branch-control','min-hand-pips','fast-doubles','random-legal'];
const seeds=[4401931,4402067,4402068,4402643,4403299,4403863,4404413,4404636,4404750,4405689,4405939,4406253,4406530,4407435,4407745,4408450,4408945,4409744,4409958,4410301];
function run(worlds=40){
 if(!Number.isInteger(worlds)||worlds<1||worlds>1000)throw Error('invalid worlds');
 const rows=seeds.map(seed=>{
  const r=base.run(seed,seed+1,1,worlds,policies,'closed-branch-control');
  if(r.selectedPositions!==1||!r.positions[0].pair.double.endsWith('|4-4'))throw Error('fixture changed '+seed);
  return {seed,turn:r.positions[0].turn,pair:r.positions[0].pair,uniqueAllocations:r.positions[0].uniqueAllocations,immediate:r.positions[0].immediate,metrics:r.positions[0].metrics};
 });
 const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
 return {engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',seeds,worldsPerPosition:worlds,policies,rows,
  meanFinishDelta:Object.fromEntries(policies.map(p=>[p,mean(rows.map(r=>r.metrics[p].win))])),
  sampledWorlds:seeds.length*worlds,continuations:seeds.length*worlds*policies.length*2};
}
function test(){const a=base.run(4401931,4401932,1,2,['closed-branch-control']);if(a.selectedPositions!==1||a.global.continuations!==4||a.positions[0].pair.double!=='double-sequence|||4|4-4')throw Error('replay fixture failed');return {passed:true};}
module.exports={run,test,seeds,policies};
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():run(Number(process.argv[2]||40)),null,2));
