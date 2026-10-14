'use strict';
// Fresh hidden-world indices 20..119; discovery indices 0..19 are excluded.
const base=require('./matched-k-outcome-runner');
const SEEDS=[4300746,4301813,4301845];
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'];
function run(worlds=100){
 if(!Number.isInteger(worlds)||worlds<1||worlds>500)throw Error('invalid worlds');
 const positions=SEEDS.map(seed=>{
  const a=base.run(seed,seed+1,1,20,POLICIES,'closed-branch-control');
  const b=base.run(seed,seed+1,1,20+worlds,POLICIES,'closed-branch-control');
  const old=a.positions[0],all=b.positions[0];
  if(!old||!all||old.turn!==all.turn||JSON.stringify(old.pair)!==JSON.stringify(all.pair))throw Error('position drift');
  const metrics=Object.fromEntries(POLICIES.map(p=>[p,Object.fromEntries(['win','pips','minus','block'].map(k=>[k,Number((((20+worlds)*all.metrics[p][k]-20*old.metrics[p][k])/worlds).toFixed(6))]))]));
  const mobility=Object.fromEntries(['singleRestricts','doubleRestricts','equal','passFlips'].map(k=>[k,all.immediate[k]-old.immediate[k]]));
  if(mobility.singleRestricts+mobility.doubleRestricts+mobility.equal!==worlds)throw Error('world count');
  return {seed,turn:old.turn,pair:old.pair,metrics,mobility};
 });
 return {engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  discovery:'closed-branch-control',policies:POLICIES,
  worldIndices:[20,19+worlds],seedFormula:'(1500000000+Math.imul(dealSeed,73)+worldIndex)>>>0',
  newWorldDraws:SEEDS.length*worlds,newContinuations:SEEDS.length*worlds*2*POLICIES.length,positions};
}
function test(){
 const a=run(2),b=run(2);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.newContinuations!==36||a.positions.map(p=>p.turn).join(',')!=='14,10,9')throw Error('replay failed');
 return {passed:true};
}
module.exports={run,test};
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():run(),null,2));
