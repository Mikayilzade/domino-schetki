'use strict';

const assert=require('assert');
const init=require('./initializer');
const {rawFeaturesFromDeal}=require('./specific-double-control');

const deal={
  hands:[
    [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[2,3],[2,4]],
    [[1,2],[1,3],[2,2],[2,5],[2,6],[3,3],[3,4],[3,5],[3,6]],
    [[1,4],[1,5],[1,6],[4,4],[4,5],[4,6],[5,5],[5,6],[6,6]]
  ],
  stock:[[1,1]]
};

const base=init.initializeThreePlayerRoundFromDeal({
  ...deal,
  isFirstRound:false,
  previousWinnerIndex:1,
  chooseFollowup:choices=>choices[0]
});
assert.equal(base.kind,'ready');
assert.equal(base.starter,1);

const features=rawFeaturesFromDeal(deal,base.starter);
assert.equal(features[0].starter,false);
assert.equal(features[1].starter,true);
assert.equal(features[2].starter,false);
assert.equal(features[1].doubles['1-1'],false);
assert.equal(features[0].doubles['1-1'],false);
assert.equal(features[2].doubles['1-1'],false);

console.log('qosa specific-double actual-starter regression: OK');
