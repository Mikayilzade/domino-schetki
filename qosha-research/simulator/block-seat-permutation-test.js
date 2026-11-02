'use strict';
// Seat-order metamorphic audit for block diagnostics.
// Coded-model contract only: it deliberately does NOT choose a block winner
// or authenticate real-table block scoring / tie resolution.
const assert=require('node:assert/strict');
const e=require('./engine');
const d=require('./turn-dispatcher');
const t=require('./turn-kernel');

function permutations(xs){
  if(xs.length<=1)return [xs];
  const out=[];
  for(let i=0;i<xs.length;i++){
    for(const tail of permutations([...xs.slice(0,i),...xs.slice(i+1)]))out.push([xs[i],...tail]);
  }
  return out;
}
function minSeats(values){
  const m=Math.min(...values);
  return values.map((v,i)=>v===m?i:-1).filter(i=>i>=0);
}
function sorted(xs){return [...xs].sort((a,b)=>a-b);}
function test(){
  let assertions=0;
  const check=(condition,message)=>{assertions++;assert.ok(condition,message);};
  const same=(a,b,message)=>{assertions++;assert.deepStrictEqual(a,b,message);};
  const fixtures=[
    {name:'3p-unique-minimum',hands:[[[0,1],[1,2]],[[0,0]],[[3,4]]]},
    {name:'3p-tied-minimum',hands:[[[0,2]],[[1,1]],[[3,3]]]},
    {name:'5p-unique-zero',hands:[[[0,0]],[[0,1]],[[1,2]],[[2,3]],[[3,4]]]},
    {name:'5p-tied-minimum',hands:[[[0,2]],[[1,1]],[[2,2]],[[3,3]],[[4,4]]]}
  ];
  let permutationCount=0;
  for(const fixture of fixtures){
    const players=fixture.hands.length;
    const pips=fixture.hands.map(e.pipSum);
    const counts=fixture.hands.map(h=>h.length);
    const minPipSeats=minSeats(pips);
    const fewestTileSeats=minSeats(counts);
    const keys=fixture.hands.flat().map(e.tileKey);
    check(new Set(keys).size===keys.length,fixture.name+': fixture tiles are unique');
    for(const perm of permutations([...Array(players).keys()])){
      // perm[newSeat] = oldSeat
      const hands=perm.map(oldSeat=>fixture.hands[oldSeat]);
      const remainders=hands.map(e.pipSum);
      const tileCounts=hands.map(h=>h.length);
      const mappedMinPips=sorted(minPipSeats.map(oldSeat=>perm.indexOf(oldSeat)));
      const mappedFewest=sorted(fewestTileSeats.map(oldSeat=>perm.indexOf(oldSeat)));
      const outcome=d.roundOutcome({
        hands,stock:[],consecutivePasses:players,lastPlayerIndex:perm.indexOf(0),
        lastTurnResult:{passed:true},players
      });
      check(outcome&&outcome.kind==='block',fixture.name+': remains a block');
      check(outcome.playerIndex===null,fixture.name+': no winner inferred');
      check(outcome.minus===0,fixture.name+': block is not a finish minus');
      same(outcome.remainders,remainders,fixture.name+': remainder order follows seat permutation');
      same(minSeats(remainders),mappedMinPips,fixture.name+': min-pip candidate set maps with seats');
      same(minSeats(tileCounts),mappedFewest,fixture.name+': fewest-tile candidate set maps with seats');
      permutationCount++;
    }
  }
  for(const players of [3,5]){
    check(permutations([...Array(players).keys()]).length===(players===3?6:120),players+'p permutation count');
    check(t.isBlocked({stock:[],consecutivePasses:players,players}),players+'p reaches pass threshold');
    check(!t.isBlocked({stock:[],consecutivePasses:players-1,players}),players+'p below pass threshold');
    check(!t.isBlocked({stock:[[6,6]],consecutivePasses:players,players}),players+'p stock gate');
    check(t.isBlocked({stock:[],consecutivePasses:players+1,players}),players+'p above pass threshold');
  }
  return {
    passed:true,assertions,fixtures:fixtures.map(f=>f.name),permutationCount,
    permutationCounts:{threePlayer:6*2,fivePlayer:120*2},
    scope:'Seat-order invariance of coded block diagnostics only; actual block winner/scoring/tie rule remains unresolved.'
  };
}
if(require.main===module)console.log(JSON.stringify(test(),null,2));
module.exports={test,permutations,minSeats};
