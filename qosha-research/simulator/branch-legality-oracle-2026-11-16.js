'use strict';
// Research-only structural oracle. Does NOT define when a branch unlocks.
const assert = require('node:assert/strict');
function legalPlacements(branches, tile) {
  assert.equal(branches.length, 4);
  assert.equal(tile.length, 2);
  return branches.flatMap((b, index) => {
    if (!b.open) return [];
    if (tile[0] === b.end || tile[1] === b.end)
      return [{branch:index, nextEnd:tile[0] === b.end ? tile[1] : tile[0]}];
    return [];
  });
}
function place(branches, tile, choice) {
  const p=legalPlacements(branches,tile).find(p=>p.branch===choice);
  if(!p) throw new Error('illegal placement');
  return branches.map((b,i)=>i===choice?{...b,end:p.nextEnd}:{...b});
}
function doubleSequences(branches, doubles) {
  // Enumerates ordered sequences on distinct currently open matching ends;
  // no assumptions about unlocking or same-turn non-double placement.
  const out=[];
  function visit(state,remaining,used,seq) {
    if(seq.length) out.push(seq);
    for(let i=0;i<remaining.length;i++) {
      const d=remaining[i];
      if(d[0]!==d[1]) continue;
      for(const p of legalPlacements(state,d)) {
        if(used.has(p.branch)) continue;
        visit(place(state,d,p.branch),remaining.filter((_,j)=>j!==i),new Set([...used,p.branch]),[...seq,{tile:d,branch:p.branch}]);
      }
    }
  }
  visit(branches,doubles,new Set(),[]);
  return out;
}
function run() {
  const B=[{open:true,end:1},{open:false,end:1},{open:true,end:5},{open:true,end:2}];
  assert.deepEqual(legalPlacements(B,[1,5]),[{branch:0,nextEnd:5},{branch:2,nextEnd:1}]);
  assert.equal(legalPlacements(B,[6,6]).length,0);
  assert.throws(()=>place(B,[1,5],1),/illegal/);
  assert.deepEqual(place(B,[1,5],0)[0],{open:true,end:5});
  assert.deepEqual(B[0],{open:true,end:1}); // immutable
  const C=[{open:true,end:1},{open:true,end:2},{open:true,end:3},{open:true,end:4}];
  const seq=doubleSequences(C,[[1,1],[2,2],[3,3],[4,4]]);
  assert.equal(seq.filter(s=>s.length===4).length,24);
  assert.equal(doubleSequences(B,[[1,1],[2,2]]).filter(s=>s.length===2).length,2);
  assert.equal(doubleSequences([{open:false,end:1},...C.slice(1)],[[1,1]]).length,0);
  return {tests:7, maxSequence:4, fullLengthOrders:24, assumptions:'branch open flags are externally supplied; distinct branch per double in a series'};
}
if(require.main===module) console.log(JSON.stringify(run()));
module.exports={legalPlacements,place,doubleSequences,run};
