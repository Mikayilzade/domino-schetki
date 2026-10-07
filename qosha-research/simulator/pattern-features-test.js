'use strict';
const assert=require('assert');
const e=require('./engine');
const f=require('./pattern-features');

const hand=[[1,1],[1,3],[1,5],[3,3],[3,5],[5,5],[0,2]];
assert.deepStrictEqual(f.numberCounts(hand),[1,3,1,3,0,3,0]);
assert.deepStrictEqual(f.doubleNumbers(hand),[1,3,5]);
assert.deepStrictEqual(f.repeatedNumberStructures(hand),[
  {number:1,tileCount:3,connectorCount:2,connectors:['1-3','1-5']},
  {number:3,tileCount:3,connectorCount:2,connectors:['1-3','3-5']},
  {number:5,tileCount:3,connectorCount:2,connectors:['1-5','3-5']}
]);
assert.deepStrictEqual(f.doubleChains(hand),[
  {a:1,b:3,connector:'1-3'},
  {a:1,b:5,connector:'1-5'},
  {a:3,b:5,connector:'3-5'}
]);

const branch=e.createBranchState([1,1]);
branch.branches.up.end=1;
branch.branches.left.end=3;
branch.branches.right.end=4;
branch.branches.down.end=6;
const opening=e.createOpeningState([1,3,5]);
const state={branchState:branch,openingState:opening,hands:[hand,[[0,0]],[[6,6]]],currentPlayer:0,consecutivePasses:1,turns:12};
const x=f.stateFeatures(state);
assert.deepStrictEqual(x.branchEnds,[1,3,4,6]);
assert.deepStrictEqual(x.controllableEnds,[1,3]);
assert.strictEqual(x.handSize,7);
assert.strictEqual(x.doubleCount,3);
assert.strictEqual(x.consecutivePasses,1);
console.log('pattern feature regression: ok');
