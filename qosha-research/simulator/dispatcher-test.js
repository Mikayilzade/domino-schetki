'use strict';
const assert=require('assert');
const e=require('./engine');
const d=require('./turn-dispatcher');
let s=e.createBranchState([2,2],['up','left']);
s=e.applySinglePlacement(s,{side:'up',tile:[2,5],to:5});
let o=e.createOpeningState();
let acts=d.doubleActions(s,o,[[2,2],[5,5],[0,0]]);
assert(acts.some(a=>a.numbers.join(',')==='2'));
assert(acts.some(a=>a.numbers.join(',')==='5'));
assert(acts.some(a=>a.numbers.join(',')==='2,5'));
assert(acts.some(a=>a.numbers.join(',')==='5,2'));
acts=d.doubleActions(s,o,[[2,2],[5,5]]);
assert.deepStrictEqual(acts.map(a=>a.numbers.join(',')).sort(),['2,5','5,2']);
let m=e.createBranchState([1,1],['up','left']);
m=e.applySinglePlacement(m,{side:'left',tile:[1,2],to:2});
const mix=d.mixedFinishActions(m,e.createOpeningState([1]),[[1,5],[5,5],[2,2]]);
const chosen=mix.find(a=>a.side==='up');
assert(chosen);
const tr=d.applyTurn(m,e.createOpeningState([1]),[[1,5],[5,5],[2,2]],[],chosen);
assert.equal(tr.hand.length,0);
const out=d.roundOutcome({hands:[tr.hand,[[0,1]],[[3,3]]],stock:[],consecutivePasses:0,lastPlayerIndex:0,lastTurnResult:tr,players:3});
assert.equal(out.minus,-20);

// Regression: ordinary tiles cannot use a closed number; its double opens that number.
let locked=e.createBranchState([1,1],['up','left']);
locked=e.applySinglePlacement(locked,{side:'up',tile:[1,5],to:5});
let lockedOpen=e.createOpeningState([1]);
assert.equal(d.ordinaryActions(locked,lockedOpen,[[5,6]]).length,0);
let open5=d.doubleActions(locked,lockedOpen,[[5,5]]).find(a=>a.numbers.join(',')==='5');
assert(open5);
let openedTurn=d.applyTurn(locked,lockedOpen,[[5,5]],[],open5);
assert(e.isNumberOpened(openedTurn.openingState,5));
assert(d.ordinaryActions(openedTurn.branchState,openedTurn.openingState,[[5,6]]).some(a=>e.tileKey(a.tile)==='5-6'));

console.log('qosa dispatcher invariants: OK');
