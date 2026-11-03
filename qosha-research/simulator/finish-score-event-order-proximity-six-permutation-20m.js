'use strict';
const { runAudit } = require('./finish-score-event-order-proximity-six-permutation-holdout');

function run20M() {
  return runAudit({ startSeed: 20000000, acceptedRounds: 1000 });
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run20M(), null, 2) + '\n');
}
module.exports = { run20M };
