'use strict';
const assert=require('assert');
const e=require('./engine');
assert.equal(e.createDoubleSixDeck().length,28);
assert.equal(new Set(e.createDoubleSixDeck().map(e.tileKey)).size,28);
for(const seed of [0,1,1898414179,4294967295]){const a=e.dealThreeByNine(seed),b=e.dealThreeByNine(seed);assert.deepStrictEqual(a,b);assert.deepStrictEqual(a.hands.map(h=>h.length),[9,9,9]);assert.equal(a.stock.length,1);assert.equal(new Set([...a.hands.flat(),...a.stock].map(e.tileKey)).size,28);}
assert.equal(e.pipSum([[0,6],[3,3],[1,2]]),15);
for(let n=1;n<=4;n++)assert.equal(e.finishMinus(Array.from({length:n},(_,i)=>[i,i])),-10*n);
assert.equal(e.finishMinus([[1,1],[1,2]]),0);assert.equal(e.applyScoreDelta(5,-10),0);
let s=e.createBranchState([2,2],['up','left']);
s=e.applySinglePlacement(s,{side:'up',tile:[2,5],to:5});
let o=e.createOpeningState();
const seqs=e.enumerateDoubleOpeningSequences(s,o,[[2,2],[5,5],[3,3]]);
assert.deepStrictEqual(seqs.map(q=>q.map(x=>x.number).join(',')).sort(),['2','2,5','5','5,2']);
console.log('qosa research invariants: OK');
