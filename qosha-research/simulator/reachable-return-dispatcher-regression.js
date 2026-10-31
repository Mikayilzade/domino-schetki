'use strict';
// 3x9 reachable-opening independent-oracle versus real research dispatcher.
// Run: node qosha-research/simulator/reachable-return-dispatcher-regression.js
// Full exhaustive dispatcher replay: append --full (much slower).
const assert=require('node:assert/strict');
const e=require('./engine'),d=require('./turn-dispatcher'),oracle=require('./reachable-return-policy-exact');
const core=[[0,1],[1,3],[1,4],[1,5],[1,6],[2,2]];
const variants=[['baseline',[[0,2],[2,3]]],['zero-and-bridge',[[0,0],[2,3]]],
 ['three-four-bridge',[[2,3],[3,4]]],['four-rich',[[0,4],[2,4]]],
 ['three-rich',[[0,3],[2,3]]],['zero-pair',[[0,0],[0,2]]]];
const bits=n=>{let c=0;while(n){n&=n-1;c++;}return c;};
const tile=a=>a.tiles?a.tiles[0]:a.tile;
const choose=(actions,policy)=>actions.slice().sort((a,b)=>{
 const x=tile(a),y=tile(b),px=x[0]+x[1],py=y[0]+y[1];
 return (policy==='high'?py-px:px-py)||e.tileKey(x).localeCompare(e.tileKey(y));
})[0]||null;
function run(full=false){
 const reference=oracle.run();
 assert.equal(reference.exactOverlappingWorlds,145860);
 const high=Object.fromEntries(reference.rows.map(r=>[r.name,[r.policies.high.aStones,r.policies.high.bStones]]));
 assert.deepEqual(high['baseline'],[122265,121550]);
 assert.deepEqual(high['four-rich'],[121550,148720]);
 const branch=e.applySinglePlacement(e.createBranchState([1,1]),{tile:[1,2],side:'up',to:2});
 const opened=e.createOpeningState([1]);
 let checked=0,compared=0,zeroDouble=0,doubleReplies=0,multiReply=0;
 for(const [name,extras] of variants){
  const focal=[...core,...extras];
  assert.equal(focal.length,8,'post-opening 3x9 starter hand');
  const known=new Set(['1-1','1-2',...focal.map(e.tileKey)]);
  assert.equal(known.size,10);
  const pool=e.createDoubleSixDeck().filter(t=>!known.has(e.tileKey(t))&&e.tileKey(t)!=='3-3');
  assert.equal(pool.length,17);
  const acts=d.actionsForHand(branch,opened,focal);
  const candidates=['1-3','1-4'].map(k=>acts.find(a=>a.type==='single'&&a.side==='left'&&e.tileKey(a.tile)===k));
  assert.ok(candidates.every(Boolean));
  let ordinal=0,cohort=0;
  for(let mask=0;mask<1<<17;mask++){
   if(bits(mask)!==8)continue;
   if(!full&&ordinal++%37!==0)continue;
   if(full)ordinal++;
   const s1=[[3,3]],s2=[];
   for(let i=0;i<17;i++)(mask&(1<<i)?s1:s2).push(pool[i]);
   assert.equal(s1.length,9);assert.equal(s2.length,9);
   assert.equal(new Set([[1,1],[1,2],...focal,...s1,...s2].map(e.tileKey)).size,28);
   assert.equal(d.turnOptions(branch,opened,s1,[]).phase,'pass');
   assert.equal(d.turnOptions(branch,opened,s2,[]).phase,'pass');
   for(let c=0;c<2;c++){
    const a=candidates[c],after=e.applySinglePlacement(branch,a);
    const remain=focal.filter(t=>e.tileKey(t)!==e.tileKey(a.tile));
    const options1=d.actionsForHand(after,opened,s1);
    assert.ok(options1.length<=1);
    const r1=d.applyTurn(after,opened,s1,[],options1[0]||null);
    const options2=d.actionsForHand(r1.branchState,r1.openingState,s2);
    if(options2.length>1)multiReply++;
    for(const policy of ['high','low']){
     const choice=choose(options2,policy);
     const r2=d.applyTurn(r1.branchState,r1.openingState,s2,[],choice);
     const access=d.actionsForHand(r2.branchState,r2.openingState,remain);
     const stones=new Set(access.flatMap(a=>(a.tiles||[a.tile]).map(e.tileKey))).size;
     const expected=oracle.evaluate(focal,s1,s2,c,policy);
     assert.equal(r1.passed,expected.seat1Pass,name+' seat1');
     assert.equal(r2.passed,expected.seat2Pass,name+' seat2');
     assert.equal(stones,expected.stones,name+' return mobility');
     assert.equal(options2.length||1,expected.options,name+' reply options');
     if(access.some(a=>a.type==='double-sequence'&&a.numbers.includes(0)))zeroDouble++;
     if(choice&&choice.type==='double-sequence')doubleReplies++;
     compared++;
    }
   }
   cohort++;checked++;
  }
  assert.equal(ordinal,24310);
  assert.equal(cohort,full?24310:658);
 }
 return {schema:'qosha-return-dispatcher-regression/v1',full,exactReferenceAssignments:145860,
  checkedAllocations:checked,candidatePolicyComparisons:compared,zeroDoubleAccess:zeroDouble,
  seat2DoubleReplies:doubleReplies,multiReplyCases:multiReply,
  newSeededWorlds:0,newCompleteRounds:0};
}
if(require.main===module)console.log(JSON.stringify(run(process.argv.includes('--full')),null,2));
module.exports={run};
