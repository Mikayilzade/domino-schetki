'use strict';
const runner=require('./pass-history-opponent-choice-softmax');
const softmax=runner.test();
const priorGrid=runner.priorGridTest();
if(!softmax.passed||!priorGrid.passed)throw new Error('softmax likelihood regression failed');
process.stdout.write(JSON.stringify({passed:true,assertions:softmax.assertions+priorGrid.assertions,softmax,priorGrid})+'\n');
