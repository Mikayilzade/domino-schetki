'use strict';
const assert=require('assert'),e=require('./engine'),d=require('./turn-dispatcher');
const {eligiblePair,collect,run}=require('./pattern-within-state-runner');
const positions=collect(1000,1120,3);
assert.strictEqual(positions.length,3);
for(const p of positions){
 assert(p.pattern.xTiles>=3);
 assert.strictEqual(p.control.xTiles,2);
 assert.notStrictEqual(p.pattern.number,p.control.number);
 assert.strictEqual(e.sidesEndingIn(p.state.branchState,p.pattern.number).length,p.matchedBranchEndCount);
 assert.strictEqual(e.sidesEndingIn(p.state.branchState,p.control.number).length,p.matchedBranchEndCount);
 const opts=d.turnOptions(p.state.branchState,p.state.openingState,p.state.hands[p.focal],p.state.stock);
 assert.strictEqual(opts.phase,'play');
 const keys=new Set(opts.actions.map(require('./decision-regret').actionKey));
 for(const k of [...p.pattern.spend,...p.pattern.preserve,...p.control.spend,...p.control.preserve])assert(keys.has(k));
}
const options={startSeed:1000,endSeed:1120,limit:2,worlds:3,policies:['closed-branch-control']};
const a=run(options),b=run(options);
assert.deepStrictEqual(a,b,'same deal/world seeds must reproduce all metrics');
assert.strictEqual(a.uniqueHiddenAllocations,6);
assert.strictEqual(a.policyWorldEvaluations,6);
assert.strictEqual(a.summary['closed-branch-control'].extraPattern.finishFirst.n,2);
console.log('within-state pattern/control regression: ok');
