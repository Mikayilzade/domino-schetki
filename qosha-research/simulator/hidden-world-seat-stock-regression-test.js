'use strict';
// Seat/stock conservation regression for the actual hidden-world sampler.
// Synthetic pre-opening 3x9+1 allocations: no played/known tiles.
const assert=require('node:assert/strict');
const e=require('./engine');
const {sampleWorld,allTiles}=require('./hidden-world');
const focalHand=[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,1],[1,2]];
const deck=new Set(allTiles().map(e.tileKey));
let checks=0;
for(const focalPlayer of [0,1,2]){
  const hands=[[],[],[]];
  hands[focalPlayer]=focalHand.map(t=>t.slice());
  const visibleState={
    branchState:e.createBranchState([1,1]),
    openingState:e.createOpeningState([1]),
    hands,stock:[],currentPlayer:focalPlayer,
    consecutivePasses:0,turns:1,outcome:null
  };
  const spec={focalPlayer,focalHand,knownTiles:[],
    hiddenHandSizes:[9,9,9],stockSize:1,visibleState};
  const before=JSON.stringify(spec);
  for(let seed=25000000;seed<25000100;seed++){
    const world=sampleWorld(spec,seed);
    assert.equal(world.hands.length,3);
    for(const hand of world.hands)assert.equal(hand.length,9);
    assert.equal(world.stock.length,1);
    assert.deepEqual(world.hands[focalPlayer],focalHand);
    const actual=[...world.hands.flat(),...world.stock].map(e.tileKey);
    assert.equal(actual.length,28);
    assert.equal(new Set(actual).size,28);
    assert.deepEqual(new Set(actual),deck);
    assert.equal(world.currentPlayer,focalPlayer);
    assert.deepEqual(sampleWorld(spec,seed),world,'deterministic seed replay');
    checks++;
  }
  assert.equal(JSON.stringify(spec),before,'sampler mutated visible input');
}
console.log(JSON.stringify({schema:'qosha-hidden-world-seat-stock-regression/v1',
  status:'passed',checks,seeds:'25000000..25000099',
  focalSeats:[0,1,2],rules:'synthetic 3x9+1, no played tiles',
  limitation:'No gameplay or opponent-history conditioning; standalone regression only.'}));
