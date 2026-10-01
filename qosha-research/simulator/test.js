'use strict';
const assert=require('assert');
const e=require('./engine');
assert.equal(e.createDoubleSixDeck().length,28);
assert.equal(new Set(e.createDoubleSixDeck().map(e.tileKey)).size,28);
for(const seed of [0,1,1898414179,4294967295]){const a=e.dealThreeByNine(seed),b=e.dealThreeByNine(seed);assert.deepStrictEqual(a,b);assert.deepStrictEqual(a.hands.map(h=>h.length),[9,9,9]);assert.equal(a.stock.length,1);assert.equal(new Set([...a.hands.flat(),...a.stock].map(e.tileKey)).size,28);}
assert.equal(e.pipSum([[0,6],[3,3],[1,2]]),15);
for(let n=1;n<=4;n++)assert.equal(e.finishMinus(Array.from({length:n},(_,i)=>[i,i])),-10*n);
assert.equal(e.finishMinus([[1,1],[1,2]]),0); assert.equal(e.applyScoreDelta(5,-10),0);
let s=e.createBranchState([2,2],['up','left']);
assert.deepStrictEqual(e.legalSinglePlacements(s,[2,5]).map(x=>x.side),['up','left']);
assert.deepStrictEqual(e.legalSinglePlacements(s,[3,5]),[]);
s=e.applySinglePlacement(s,{side:'up',tile:[2,5],to:5});
assert.equal(s.branches.up.end,5); assert.equal(s.branches.left.end,2);
assert.deepStrictEqual(e.legalSinglePlacements(s,[5,6]).map(x=>x.side),['up']);
assert.throws(()=>e.applySinglePlacement(s,{side:'right',tile:[2,4],to:4}),/illegal/);
const hand=[[5,6],[2,4],[0,0]],legal=e.legalSinglesForHand(s,hand);
assert(legal.some(x=>x.handIndex===0&&x.side==='up'));assert(legal.some(x=>x.handIndex===1&&x.side==='left'));assert(!legal.some(x=>x.handIndex===2));
let o=e.createOpeningState(); const before=JSON.parse(JSON.stringify(s));
const opens=e.candidateDoubleOpenings(s,o,[[2,2],[5,5],[3,3],[1,2]]);
assert.deepStrictEqual(opens.map(x=>x.number),[2,5]);
let tr=e.applyCandidateDoubleOpening(s,o,opens[0]); assert(e.isNumberOpened(tr.openingState,2)); assert.deepStrictEqual(tr.branchState,before); assert.deepStrictEqual(s,before);
o=e.openNumber(o,2); assert.deepStrictEqual(e.candidateDoubleOpenings(s,o,[[2,2],[5,5]]).map(x=>x.number),[5]);
assert.deepStrictEqual(e.candidateDoubleOpenings(s,o,[[3,3]]),[]);
assert.throws(()=>e.applyCandidateDoubleOpening(s,o,{tile:[3,3],number:3}),/illegal/);
// Assumption-labelled multi-double planner: ends are up=5,left=2, so 2-2 and 5-5
// may be opened in either order; 3-3 cannot join. Geometry must remain immutable.
o=e.createOpeningState();
const seqs=e.enumerateDoubleOpeningSequences(s,o,[[2,2],[5,5],[3,3]]);
assert.deepStrictEqual(seqs.map(q=>q.map(x=>x.number).join(',')).sort(),['2,5','5,2']);
tr=e.applyDoubleOpeningSequence(s,o,seqs[0]);
assert(e.isNumberOpened(tr.openingState,2)); assert(e.isNumberOpened(tr.openingState,5)); assert(!e.isNumberOpened(tr.openingState,3));
assert.deepStrictEqual(tr.branchState,before); assert.deepStrictEqual(s,before);
assert.throws(()=>e.applyDoubleOpeningSequence(s,o,[{tile:[3,3],number:3}]),/illegal/);
console.log('qosa research invariants: OK');
