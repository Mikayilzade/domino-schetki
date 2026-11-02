'use strict';
const assert=require('node:assert/strict');
const audit=require('./pass-history-opponent-choice-prior-grid');
const base=audit.test(),priorGrid=audit.priorGridTest();
assert.equal(base.passed,true);assert.equal(base.assertions,9);
assert.equal(priorGrid.passed,true);assert.equal(priorGrid.assertions,11);
process.stdout.write(JSON.stringify({passed:true,assertions:base.assertions+priorGrid.assertions,base,priorGrid},null,2)+'\n');
