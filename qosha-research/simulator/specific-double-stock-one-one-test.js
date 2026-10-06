'use strict';
const assert=require('assert');
const init=require('./initializer');
const {rawFeaturesFromDeal}=require('./specific-double-control');

const hands=[
  [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[2,2],[2,3]],
  [[1,2],[1,3],[1,4],[1,5],[1,6],[2,4],[2,5],[3,3],[3,4]],
  [[2,6],[3,5],[3,6],[4,4],[4,5],[4,6],[5,5],[5,6],[6,6]]
];
const stock=[[1,1]];
const previousWinnerIndex=2;
const base=init.initializeThreePlayerRoundFromDeal({hands,stock,isFirstRound:false,previousWinnerIndex});
assert.strictEqual(base.kind,'ready');
assert.strictEqual(base.starter,previousWinnerIndex,'stock 1-1 must make previous winner the actual starter');
const f=rawFeaturesFromDeal({hands,stock},base.starter);
assert.strictEqual(f[2].starter,true);
assert.strictEqual(f[0].starter,false);
assert.strictEqual(f[1].starter,false);
for(const seat of [0,1,2])assert.strictEqual(f[seat].doubles['1-1'],false,'stock 1-1 must not be attributed to an initial hand');
assert.strictEqual(f[2].doubleCount,3,'raw initial-hand double count must stay independent of the claimed stock 1-1');
console.log('specific-double stock-1-1 starter regression: ok');
