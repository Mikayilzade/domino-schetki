'use strict';
const assert=require('node:assert/strict');
const {runStream}=require('./finish-score-match-roundstream');
function test(){
  const options={startSeed:17002000,acceptedRounds:40};const a=runStream(options),b=runStream(options);
  assert.deepEqual(a,b,'seeded round-to-score stream replays exactly');
  assert.equal(a.seed.acceptedRounds,40);assert.equal(a.roundOutcomes.finishes+a.roundOutcomes.blocks,40);
  assert.equal(a.roundOutcomes.unresolved,0);assert.equal(a.seed.uniqueAcceptedAllocations,40);
  assert.equal(a.seed.duplicateAcceptedAllocations,0);assert.equal(a.scoreAdapter.scoredRounds,a.roundOutcomes.finishes);
  assert.ok(a.scoreAdapter.scoreEvents>0);assert.ok(a.scoreAdapter.bustEvents>=a.scoreAdapter.completedMatches);
  assert.ok(a.scoreAdapter.zeroInputsSkipped>=0);
  return{passed:true,rounds:40,finishes:a.roundOutcomes.finishes,blocks:a.roundOutcomes.blocks,completedMatches:a.scoreAdapter.completedMatches,assertions:10};
}
if(require.main===module)process.stdout.write(JSON.stringify(test(),null,2)+'\n');
module.exports={test};
