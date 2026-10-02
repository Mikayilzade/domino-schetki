'use strict';
const assert=require('assert');
const e=require('./engine');
assert.equal(e.createDoubleSixDeck().length,28);
assert.notEqual(e.mixSeed32(0),0);
assert.notEqual(e.mixSeed32(1),e.mixSeed32(2));
assert.equal(new Set(e.createDoubleSixDeck().map(e.tileKey)).size,28);
for(const seed of [0,1,1898414179,4294967295]){const a=e.dealThreeByNine(seed),b=e.dealThreeByNine(seed);assert.deepStrictEqual(a,b);assert.deepStrictEqual(a.hands.map(h=>h.length),[9,9,9]);assert.equal(a.stock.length,1);assert.equal(new Set([...a.hands.flat(),...a.stock].map(e.tileKey)).size,28);}
// Sequential seeds must not collapse into a biased stock position.
const stockCounts=new Map(e.createDoubleSixDeck().map(t=>[e.tileKey(t),0]));
for(let seed=0;seed<10000;seed++){const k=e.tileKey(e.dealThreeByNine(seed).stock[0]);stockCounts.set(k,stockCounts.get(k)+1);}
assert.equal([...stockCounts.values()].filter(Boolean).length,28);
assert(stockCounts.get('1-1')>250&&stockCounts.get('1-1')<470);
assert(Math.min(...stockCounts.values())>250);
assert(Math.max(...stockCounts.values())<470);
assert.equal(e.pipSum([[0,6],[3,3],[1,2]]),15);
for(let n=1;n<=4;n++)assert.equal(e.finishMinus(Array.from({length:n},(_,i)=>[i,i])),-10*n);
assert.equal(e.finishMinus([[1,1],[1,2]]),0);assert.equal(e.applyScoreDelta(5,-10),0);
let s=e.createBranchState([2,2],['up','left']);
s=e.applySinglePlacement(s,{side:'up',tile:[2,5],to:5});
let o=e.createOpeningState();
const seqs=e.enumerateDoubleOpeningSequences(s,o,[[2,2],[5,5],[3,3]]);
assert.deepStrictEqual(seqs.map(q=>q.map(x=>x.number).join(',')).sort(),['2','2,5','5','5,2']);
console.log('qosa research invariants: OK');
